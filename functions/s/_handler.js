/**
 * 短链处理器 —— 博客内嵌版（Cloudflare Pages Functions）
 *
 * 挂在 `blog.xieea.top/s/*` 下面，和博客同一个仓库、同一次部署：
 *   GET /s                → 回博客首页
 *   GET /s/health         → 健康检查
 *   GET /s/admin          → 管理控制台（口令存 localStorage）
 *   POST/GET /s/api/links → 管理接口，需 Authorization: Bearer <ADMIN_TOKEN>
 *   GET /s/<短码>          → 302 跳到目标
 *
 * 数据和 s.xieea.top 那版完全一样的 KV 结构（key = 小写短码，value = JSON）：
 *   { url, note, createdAt, updatedAt, hits, lastHitAt?, expiresAt? }
 *
 * basePath 做成参数，独立 Worker 版和博客内嵌版共用同一份逻辑。
 */

import {
	LIST_DEFAULT,
	RESERVED_SLUGS,
	SLUG_RE,
	json,
	normalizeSlug,
	nowIso,
	parseRecord,
	randomSlug,
	safeEqual,
	text,
	validateTarget,
} from "./_lib.js";
import { renderAdminPage } from "./_admin-page.js";

const HTML_HEADERS = {
	"content-type": "text/html; charset=utf-8",
	"cache-control": "no-store",
	"x-frame-options": "DENY",
	"referrer-policy": "no-referrer",
	// 短链是给人和文档用的，别进索引
	"x-robots-tag": "noindex, nofollow",
};

/**
 * @param {{ basePath?: string }} options basePath 例如 "/s"；为空表示挂在域名根路径（独立 Worker 版）
 */
export function createShortlinkHandler({ basePath = "" } = {}) {
	const prefix = basePath.replace(/\/+$/, "");

	/** 把 `/s/api/links` 剥成 `/api/links`；不属于本前缀的返回 null */
	const stripPrefix = (pathname) => {
		if (!prefix) return pathname;
		if (pathname === prefix) return "/";
		if (pathname.startsWith(prefix + "/")) return pathname.slice(prefix.length);
		return null;
	};

	const shortUrlOf = (request, slug) => {
		const url = new URL(request.url);
		return `${url.protocol}//${url.host}${prefix}/${slug}`;
	};

	const itemOf = (request, slug, record) => ({
		slug,
		...record,
		shortUrl: shortUrlOf(request, slug),
	});

	// ------------------------------------------------------------ 跳转

	const redirectToHome = (env) =>
		new Response(null, {
			status: 302,
			headers: {
				location: env.HOME_URL || "https://blog.xieea.top",
				"cache-control": "public, max-age=300",
			},
		});

	const countHit = async (env, slug) => {
		try {
			const record = parseRecord(await env.SHORTLINKS.get(slug));
			if (!record) return;
			record.hits = (record.hits || 0) + 1;
			record.lastHitAt = nowIso();
			await env.SHORTLINKS.put(slug, JSON.stringify(record));
		} catch (err) {
			console.error("count hit failed:", err?.stack || err);
		}
	};

	const handleRedirect = async (request, env, path, ctx) => {
		const method = request.method.toUpperCase();
		if (method !== "GET" && method !== "HEAD") return methodNotAllowed(["GET", "HEAD"]);

		const slug = normalizeSlug(path);
		if (!slug) return redirectToHome(env);

		// cacheTtl：边缘缓存 60 秒，热点短链基本不吃 KV 读额度
		const record = parseRecord(await env.SHORTLINKS.get(slug, { cacheTtl: 60 }));
		if (!record) return notFoundPage(env, 404, "这个短链不存在");

		if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
			return notFoundPage(env, 410, "这个短链已经过期了");
		}

		if (env.COUNT_HITS === "1") {
			const task = countHit(env, slug);
			if (typeof ctx?.waitUntil === "function") ctx.waitUntil(task);
			else await task;
		}

		return new Response(null, {
			status: 302,
			headers: {
				location: record.url,
				"cache-control": "public, max-age=60",
			},
		});
	};

	// ------------------------------------------------------------ 管理接口

	const requireAuth = (request, env) => {
		const expected = env.ADMIN_TOKEN;
		if (!expected) {
			return {
				ok: false,
				response: json(
					{ error: "还没配 ADMIN_TOKEN：在 Cloudflare Pages 的 Settings → Variables 里加一个加密变量" },
					500,
				),
			};
		}

		const header = request.headers.get("authorization") || "";
		const match = /^Bearer\s+(.+)$/i.exec(header.trim());
		if (!match || !safeEqual(match[1].trim(), expected)) {
			return {
				ok: false,
				response: json({ error: "口令不对或没带上" }, 401, {
					"www-authenticate": 'Bearer realm="shortlink-admin"',
				}),
			};
		}
		return { ok: true };
	};

	const readJson = async (request) => {
		try {
			return await request.json();
		} catch {
			return null;
		}
	};

	const expiresAtFrom = (days) => {
		if (days === null || days === undefined || days === "") return null;
		const n = Number(days);
		if (!Number.isFinite(n) || n <= 0) return null;
		return new Date(Date.now() + n * 86400_000).toISOString();
	};

	const listLinks = async (request, env) => {
		const url = new URL(request.url);
		const hardLimit = Number.parseInt(env.LIST_LIMIT, 10) || LIST_DEFAULT;
		const limit = Math.min(Number.parseInt(url.searchParams.get("limit"), 10) || hardLimit, hardLimit);
		const cursor = url.searchParams.get("cursor") || undefined;

		const listing = await env.SHORTLINKS.list({ limit, cursor });
		const items = [];
		for (const key of listing.keys) {
			const record = parseRecord(await env.SHORTLINKS.get(key.name));
			if (record) items.push(itemOf(request, key.name, record));
		}

		return json({
			items,
			cursor: listing.list_complete ? null : listing.cursor,
			complete: listing.list_complete,
		});
	};

	const getLink = async (request, env, slug) => {
		if (!SLUG_RE.test(slug)) return json({ error: "短码格式不对" }, 400);
		const record = parseRecord(await env.SHORTLINKS.get(slug));
		if (!record) return json({ error: "短链不存在" }, 404);
		return json(itemOf(request, slug, record));
	};

	const createLink = async (request, env) => {
		const body = await readJson(request);
		if (!body) return json({ error: "请求体必须是 JSON" }, 400);

		const selfHost = new URL(request.url).hostname.toLowerCase();
		const target = validateTarget(body.url, { selfHost, selfPrefix: prefix });
		if (!target.ok) return json({ error: target.error }, 400);

		let slug = normalizeSlug(body.slug);
		if (!slug) {
			for (let i = 0; i < 5; i++) {
				const candidate = randomSlug(5);
				if (!(await env.SHORTLINKS.get(candidate))) {
					slug = candidate;
					break;
				}
			}
			if (!slug) return json({ error: "随机短码连续撞车，请手动指定一个" }, 500);
		}

		if (RESERVED_SLUGS.has(slug)) return json({ error: `「${slug}」是保留字，换一个` }, 400);
		if (!SLUG_RE.test(slug)) {
			return json({ error: "短码只能用小写字母/数字/-/_，且不能以符号开头（1~32 位）" }, 400);
		}
		if (await env.SHORTLINKS.get(slug)) return json({ error: `短码「${slug}」已经被占用` }, 409);

		const now = nowIso();
		const record = {
			url: target.url,
			note: String(body.note ?? "").slice(0, 200),
			createdAt: now,
			updatedAt: now,
			hits: 0,
		};
		const expiresAt = expiresAtFrom(body.expiresInDays);
		if (expiresAt) record.expiresAt = expiresAt;

		await env.SHORTLINKS.put(slug, JSON.stringify(record));
		return json(itemOf(request, slug, record), 201);
	};

	const updateLink = async (request, env, slug) => {
		if (!SLUG_RE.test(slug)) return json({ error: "短码格式不对" }, 400);

		const record = parseRecord(await env.SHORTLINKS.get(slug));
		if (!record) return json({ error: "短链不存在" }, 404);

		const body = await readJson(request);
		if (!body) return json({ error: "请求体必须是 JSON" }, 400);

		if (body.url !== undefined) {
			const selfHost = new URL(request.url).hostname.toLowerCase();
			const target = validateTarget(body.url, { selfHost, selfPrefix: prefix });
			if (!target.ok) return json({ error: target.error }, 400);
			record.url = target.url;
		}

		if (body.note !== undefined) record.note = String(body.note ?? "").slice(0, 200);

		if (body.expiresInDays !== undefined) {
			const expiresAt = expiresAtFrom(body.expiresInDays);
			if (expiresAt) record.expiresAt = expiresAt;
			else delete record.expiresAt;
		}

		record.updatedAt = nowIso();
		await env.SHORTLINKS.put(slug, JSON.stringify(record));
		return json(itemOf(request, slug, record));
	};

	const deleteLink = async (env, slug) => {
		if (!SLUG_RE.test(slug)) return json({ error: "短码格式不对" }, 400);
		const record = parseRecord(await env.SHORTLINKS.get(slug));
		if (!record) return json({ error: "短链不存在" }, 404);
		await env.SHORTLINKS.delete(slug);
		return json({ ok: true, slug });
	};

	const handleApi = async (request, env, apiPath) => {
		const auth = requireAuth(request, env);
		if (!auth.ok) return auth.response;

		const method = request.method.toUpperCase();

		if (apiPath === "links") {
			if (method === "GET") return listLinks(request, env);
			if (method === "POST") return createLink(request, env);
			return methodNotAllowed(["GET", "POST"]);
		}

		const detail = /^links\/([^/]+)$/.exec(apiPath);
		if (detail) {
			const slug = normalizeSlug(decodeURIComponent(detail[1]));
			if (method === "GET") return getLink(request, env, slug);
			if (method === "PATCH" || method === "PUT") return updateLink(request, env, slug);
			if (method === "DELETE") return deleteLink(env, slug);
			return methodNotAllowed(["GET", "PATCH", "DELETE"]);
		}

		return json({ error: "没有这个接口" }, 404);
	};

	// ------------------------------------------------------------ 入口

	return async function shortlinkHandler(request, env, ctx = { waitUntil: () => {} }) {
		try {
			// 没绑 KV 时给一句人话，而不是一坨 500（首次部署还没来得及配绑定时会遇到）
			if (!env?.SHORTLINKS) {
				return new Response(
					"短链服务还没就绪：需要在 Cloudflare Pages 项目里绑定 KV 命名空间（变量名 SHORTLINKS）。",
					{ status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
				);
			}

			const rawPath = new URL(request.url).pathname;
			const path = stripPrefix(rawPath);
			// 不是 /s 开头的请求不该进到这里（Pages 只会把 /s/* 交给本函数），保险起见交回去
			if (path === null) return new Response("Not Found", { status: 404 });

			const method = request.method.toUpperCase();

			if (path === "/health") return json({ ok: true, ts: nowIso() });
			if (path === "/robots.txt") return text("User-agent: *\nDisallow: /\n");
			if (path === "/favicon.ico") return new Response(null, { status: 204 });

			if (path === "/" || path === "") {
				if (!prefix) return redirectToHome(env);
				// /s 本身给个落点：直接跳博客首页
				return redirectToHome(env);
			}

			if (path === "/admin" || path === "/admin/") {
				if (method !== "GET" && method !== "HEAD") return methodNotAllowed(["GET"]);
				return new Response(renderAdminPage(env, prefix), { headers: HTML_HEADERS });
			}

			if (path.startsWith("/api/")) return handleApi(request, env, path.slice("/api/".length));

			return handleRedirect(request, env, path, ctx);
		} catch (err) {
			console.error("unhandled error:", err?.stack || err);
			return text("500 Internal Error", 500);
		}
	};
}

const methodNotAllowed = (allowed) =>
	json({ error: `只支持 ${allowed.join(" / ")}` }, 405, { allow: allowed.join(", ") });

const escapeHtml = (s) =>
	String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

function notFoundPage(env, status, message) {
	const siteName = escapeHtml(env.SITE_NAME || "短链服务");
	const home = escapeHtml(env.HOME_URL || "/");
	const body = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="data:,">
<meta name="robots" content="noindex,nofollow">
<title>${status} · ${siteName}</title>
<style>
  :root { color-scheme: light dark; --accent: oklch(0.7 0.14 250); }
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:2rem;
         font: 16px/1.6 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
         background: #f7f7fa; color: #1c1c22; }
  @media (prefers-color-scheme: dark) { body { background:#16161c; color:#e8e8ee } .card{ background:#1f1f27; border-color:#2c2c38 } }
  .card { max-width: 30rem; padding: 2rem 2.25rem; border:1px solid #e6e6ee; border-radius: 1rem; background:#fff;
          box-shadow: 0 8px 30px rgb(0 0 0 / .06); }
  .code { font-size: 3rem; font-weight: 700; color: var(--accent); margin: 0 0 .25rem; letter-spacing:.02em }
  p { margin: .5rem 0 1.25rem; opacity: .75 }
  a { color: var(--accent); text-decoration: none; font-weight: 600 }
  a:hover { text-decoration: underline }
</style></head>
<body><div class="card">
  <p class="code">${status}</p>
  <p>${escapeHtml(message || "页面不存在")}</p>
  <a href="${home}">← 回首页</a>
</div></body></html>`;
	return new Response(body, { status, headers: HTML_HEADERS });
}

/** 公共工具：slug 规则、URL 校验、JSON 响应、常量时间比较 */

/** 列表接口默认返回条数 */
export const LIST_DEFAULT = 50;

/** 占用掉的路径，不能当短码用（否则会把管理页/接口顶掉） */
export const RESERVED_SLUGS = new Set([
	"admin",
	"api",
	"health",
	"robots.txt",
	"favicon.ico",
	"_headers",
	"_redirects",
	"sitemap.xml",
]);

/** 短码规则：小写字母/数字开头，允许 - _，总长 1~32，避免大小写混淆一律用小写 */
export const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

/** 生成短码用的字母表：去掉 0/o/1/l/i 这类容易看错的字符 */
const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const json = (data, status = 200, extraHeaders = {}) =>
	new Response(JSON.stringify(data, null, 2), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			...extraHeaders,
		},
	});

export const text = (body, status = 200, contentType = "text/plain; charset=utf-8") =>
	new Response(body, {
		status,
		headers: { "content-type": contentType },
	});

/** 去掉前后空白并统一小写；斜杠也一并去掉，便于 /abc 与 /abc/ 等价 */
export const normalizeSlug = (raw) =>
	String(raw ?? "")
		.trim()
		.replace(/^\/+|\/+$/g, "")
		.toLowerCase();

/** 随机短码，默认 5 位（~20^5 ≈ 320 万种组合，个人用量足够） */
export const randomSlug = (length = 5) => {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	let out = "";
	for (const b of bytes) out += SLUG_ALPHABET[b % SLUG_ALPHABET.length];
	return out;
};

/**
 * 校验目标 URL。
 * 只允许 http/https，拒绝自环（指向短链自己或本站子域），拒绝超长。
 * @returns {{ok: true, url: string} | {ok: false, error: string}}
 */
export const validateTarget = (raw, { selfHost = "", maxLength = 2048 } = {}) => {
	const value = String(raw ?? "").trim();
	if (!value) return { ok: false, error: "url 不能为空" };
	if (value.length > maxLength) return { ok: false, error: `url 太长（> ${maxLength} 字符）` };

	let parsed;
	try {
		parsed = new URL(value);
	} catch {
		return { ok: false, error: "不是合法的 URL，记得带 http:// 或 https://" };
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		return { ok: false, error: "只支持 http/https 链接" };
	}

	const host = parsed.hostname.toLowerCase();
	if (selfHost && host === selfHost) {
		return { ok: false, error: "不能指向短链服务自己，会形成死循环" };
	}

	return { ok: true, url: parsed.toString() };
};

/** 常量时间字符串比较，避免按字符提前返回泄露长度/前缀 */
export const safeEqual = (a, b) => {
	const left = String(a ?? "");
	const right = String(b ?? "");
	if (left.length !== right.length) {
		// 长度不同也跑一次比较，保证耗时与内容无关
		let acc = 1;
		const len = Math.max(left.length, right.length);
		for (let i = 0; i < len; i++) acc |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
		return false;
	}
	let acc = 0;
	for (let i = 0; i < left.length; i++) acc |= left.charCodeAt(i) ^ right.charCodeAt(i);
	return acc === 0;
};

/** HTML 转义，所有插进页面的动态内容都要过一遍 */
export const escapeHtml = (s) =>
	String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export const nowIso = () => new Date().toISOString();

/** 记录都存成 JSON 字符串，读的时候容错：坏数据当不存在 */
export const parseRecord = (raw) => {
	if (!raw) return null;
	try {
		const data = JSON.parse(raw);
		if (!data || typeof data.url !== "string") return null;
		return data;
	} catch {
		return null;
	}
};

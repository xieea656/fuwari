/**
 * Pages Functions 中间件：老地址 301 重定向
 *
 * 为什么不用 public/_redirects 处理这批：
 * 那几条老地址的路径里有中文（`/posts/创作/依赖安装/git安装教程/`），
 * Cloudflare Pages 的 _redirects 对非 ASCII 源路径匹配不可靠（线上实测 404，
 * 而同一文件里的 /deps/ 能正常 301）。中间件拿到的 pathname 是解码后的，
 * 判断最稳，也方便本地 pages dev 直接验证。
 *
 * 只对 /posts/ 和 /deps 前缀做判断，其它请求几乎零成本直接 next()。
 */

const LEGACY_REDIRECTS = [
	// 基础教程从 posts/创作/依赖安装/ 搬到了 tutorials/
	{ from: /^\/posts\/创作\/依赖安装\/git安装教程\/?$/, to: "/tutorials/git/" },
	{ from: /^\/posts\/创作\/依赖安装\/node\.js安装教程\/?$/, to: "/tutorials/node/" },
	// 兼容早期带 .md、带无斜杠等写法
	{ from: /^\/posts\/创作\/依赖安装\/git安装教程\.md\/?$/, to: "/tutorials/git/" },
	{ from: /^\/posts\/创作\/依赖安装\/node\.js安装教程\.md\/?$/, to: "/tutorials/node/" },
	// /deps/ 页面已改名 /tutorials/
	{ from: /^\/deps(\/.*)?$/, to: "/tutorials/" },
];

export async function onRequest(context) {
	const { request, next } = context;
	const url = new URL(request.url);

	// 只有 GET/HEAD 才做，POST 之类原样交给后续
	if (request.method !== "GET" && request.method !== "HEAD") return next();

	let pathname;
	try {
		pathname = decodeURIComponent(url.pathname);
	} catch {
		return next();
	}

	// 只对可能命中的前缀做匹配，其它路径直接放行
	if (!pathname.startsWith("/posts/") && !pathname.startsWith("/deps")) return next();

	const hit = LEGACY_REDIRECTS.find((rule) => rule.from.test(pathname));
	if (!hit) return next();

	const target = new URL(hit.to, url.origin);
	target.search = url.search;
	return new Response(null, {
		status: 301,
		headers: {
			location: target.toString(),
			"cache-control": "public, max-age=86400",
		},
	});
}

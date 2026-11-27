import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Disallow: /_astro/
# 短链是给人和文档用的跳转器，进索引只会污染搜索结果
Disallow: /s/
Disallow: /links/

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};

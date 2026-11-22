/**
 * Cloudflare Pages Functions 入口：`blog.xieea.top/s/*`
 *
 * 文件名 `[[code]]` 是可选捕获组，同时匹配 `/s` 和 `/s/任意多段`，
 * 一个文件就把跳转、控制台、管理接口全接住（具体分发在 _handler.js）。
 */

import { createShortlinkHandler } from "./_handler.js";

const handler = createShortlinkHandler({ basePath: "/s" });

export function onRequest(context) {
	return handler(context.request, context.env, {
		waitUntil: (promise) => context.waitUntil(promise),
	});
}

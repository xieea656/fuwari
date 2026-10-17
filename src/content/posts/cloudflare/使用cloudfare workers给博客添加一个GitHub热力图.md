---
title: 我给博客添加了GitHub热力图：完全教程
published: 2026-10-17
description: 使用 Cloudflare Workers + KV + React 为博客添加 GitHub 活动热力图，包含完整部署教程和源码。
---

# 前言
在蓝色大肥鱼的帮助下，我成功给博客加上了一个相对美观的GitHub热力图
![博客热力图展示](https://origin.picgo.net/2026/10/11/20261011122328757c1a4a4016c696588.png)
接下来讲讲是怎么做到的；以及提供复刻教程 
注意本期教程可能比较长 观看请做好准备
如懒得自己操作 请把这个链接复制给Agent 让他帮你操作：
https://github.com/xieea656/gh-activity-worker/blob/main/AGENT_GUIDE.md
（需要gh，GitHub token 和cloudfare token）
架构是这样子的：
热力图本身的代码是rare的https://rareui.com
1. workers从GitHub获取数据 构建热力图的UI，运算都由workers代劳
2. page只搭建一个展示的框架 展示workers构建的UI
 大概是这样 ：
 GitHub API →（每天一次）→ Cloudflare KV → /api/heatmap → 浏览器 iframe → 现成组件画图

**在观看本教程前，你需要：**
1. cloudfare账号
2. GitHub账号
3. 一个域名 
4. 一个cloudfare page博客
让我们开始吧

# 部署过程
## 获取github token
1. 打开我的仓库链接 [xieea656/gh-activity-worker](https://github.com/xieea656/gh-activity-worker)  **fork它**
   ![GitHub仓库图片](https://origin.picgo.net/2026/10/11/2026101115261217661a9d06290f665e9.png)
2. 点击头像 再点击**setting**![打开用户设置图片](https://origin.picgo.net/2026/10/11/202610111527340180c6948bf06fd1475.png)
3. 向下滑动 点击左栏**Developer settings**
   ![GitHub账户设置页面](https://origin.picgo.net/2026/10/11/202610111532292024423034272513464.png)
4. 依次点击 `Personal access tokens` → `Tokens (classic)` →` Generate new token`
   ![GitHub账户设置 token页面](https://origin.picgo.net/2026/10/16/202610162141134611ecbf0463d4a229d.png)

5. 如有两次验证 请填入两步验证凭据![两步验证演示](https://origin.picgo.net/2026/10/16/202610162142202854cd96d7405cdbe35.png)
6. 先向下滑 勾选read:uesr
   ![token权限选择页面1](https://origin.picgo.net/2026/10/16/20261016214521982407c1da575cbcd70.png)
7. 注意：**有效期默认只有30天** 在这里修改
   ![token权限选择页面2](https://origin.picgo.net/2026/10/16/2026101621462693375f5b735f42d4d27.png)
8. 单击这里完成创建token 请妥善保存您的token
   ![token权限选择页面3](https://origin.picgo.net/2026/10/16/20261016214851251b9e81e0fbfc35cb2.png)
让我们进入下一步
## cloudfare 创建 KV 命名空间
![cloudfare仪表盘页面](https://origin.picgo.net/2026/10/16/20261016230514787737b50f05adfda26.png)
登录cloudfare 依次点击
1. 存储和数据库
2. workers KV
3. 创建KV命名空间
![KV命名空间创建页面](https://origin.picgo.net/2026/10/16/20261016231941648b4dacbd6150094e7.png)
4. 输入命名空间名字 点击确认
## workers
1. 打开workers和page页面 点击**创建应用程序**
   ![cloudfare workers页面](https://origin.picgo.net/2026/10/16/2026101623341661368700361e1de7b16.png)
2. 点击continue with GitHub
   ![workers创建演示页面1](https://origin.picgo.net/2026/10/16/20261016233541100bf09aec37ea0a61e.png)
3. 你需要**登录github账号**才能克隆fork的仓库；登录过程略
4. 点击对应的fork仓库
   ![workers创建演示页面2](https://origin.picgo.net/2026/10/16/20261016234158776b35c7cf31aed61ba.png)
5. 直接点击**部署**
   ![workers创建演示页面3](https://origin.picgo.net/2026/10/16/20261016235025492fb84b4df855439da.png)
6. 稍稍等待 进入刚刚部署的workers 点击**添加绑定**
   ![添加绑定演示页面1](https://origin.picgo.net/2026/10/17/20261017000249547742d09df9d7f426a.png)
7. 点击**添加绑定**
   ![添加绑定演示页面2](https://origin.picgo.net/2026/10/17/20261017000410417782815fd0fde1b5c.png)
8. 单击**KV命名空间** 再点击**添加绑定**
   ![添加绑定演示页面3](https://origin.picgo.net/2026/10/17/202610170008141567b94c67ff7e63277.png)
9. 选择绑定的**命名空间** 填入**变量名称**（随便取一个 注意最好用英文）
   ![添加绑定演示页面3](https://origin.picgo.net/2026/10/17/20261017001225944940ac5f22c8b625b.png)
10. 返回workers设置页面 添加三个变量
   ![创建变量演示页面1](https://origin.picgo.net/2026/10/17/2026101700221831897f25856d8c9152e.png)
   ![创建变量演示界面2](https://origin.picgo.net/2026/10/17/20261017002323293f9252eda1147f5de.png)
   你需要填入**3次** 密钥分别填入
```
GITHUB_TOKEN 
HEATMAP_OWNER
PARENT_ORIGIN
```
密钥段要**原样复制**不能多或少一个字符
它们的**值**字段分别是：
`GITHUB_TOKEN` =那个要你保存的github token
`HEATMAP_OWNER` = 你的 GitHub 用户名 **注意 是用户名 不是别名 是你类似https://github.com/xieea656 这种链接里面“xieea656”这个才是用户名**
`PARENT_ORIGIN` = 你的博客地址
11. 下滑 找到**Cron 触发器** 点击添加
   ![cron添加演示1](https://origin.picgo.net/2026/10/17/202610170046331829de027fa3d64e3de.png)
12. 直接点击corn表达式 输入17 3 * * *
   ![cron添加演示2](https://origin.picgo.net/2026/10/17/202610170048181605d9fb0d3995c55fe.png)

## 域名 
在”域“页面 你可以使用它给你的域名 也可以使用自己的域名
![workers添加域名页面](https://origin.picgo.net/2026/10/17/202610170051492646eb04e6f973ef0d8.png)
## 加油 最后一步了 博客贴 iframe标签
编辑你**博客git仓库**里**首页的 HTML 文件**路径因博客框架而异，
fuwari 是 `src/pages/[...page].astro`，
Hexo 是 `layouts/index.ejs`，
Hugo 是 `layouts/index.html`
在你想放卡片的位置，把下面这段整段贴进去：
`data-base` 和 `WIDGET_ORIGIN` 请换成你自己的 widget 域名（也就是我们刚才创建的cloudfare workers的域名） 
### 如果你使用fuwari
```
---
/**
 * 首页"博客活动"栏 —— GitHub 活动展示 iframe 容器。
 *
 * 数据与展示由 https://widgets.example.com/ 承载（Cloudflare Workers + React +
 * Rare UI github-activity 组件，见本仓库），本页只负责：
 *   - 首屏把当前主题（dark/hue）拼进 iframe 的 src，避免"先亮后暗"闪一下；
 *   - 监听 <html> 的 class / style 变化，主题切换时向 iframe 发 hm-theme；
 *   - 接收 iframe 的 hm-height 消息，写 iframe.style.height 保持无内部滚动条。
 */
interface Props {
	class?: string;
	style?: string;
}
const { class: className = "", style = "" } = Astro.props;

// 首屏占位高度，避免 iframe 加载期间出现 CLS 抖动（组件收起态约 120–140px）。
const PLACEHOLDER_HEIGHT = "130px";
---

<div
	class={`card-base px-9 py-6 w-full rounded-[var(--radius-large)] overflow-hidden ${className}`}
	style={style}
>
	<iframe
		data-widget="true"
		data-base="https://widgets.example.com/"
		loading="lazy"
		frameborder="0"
		scrolling="no"
		title="博客活动：GitHub 活动热力图与仓库提交"
		class="block w-full border-0"
		style={`height: ${PLACEHOLDER_HEIGHT}; min-height: ${PLACEHOLDER_HEIGHT};`}
	></iframe>
	<noscript>
		<div class="text-sm opacity-70">
			本页在启用 JavaScript 后会在此显示 GitHub 活动；或直接访问
			<a class="transition link text-[var(--primary)] font-medium" href="https://widgets.example.com/" target="_blank" rel="noopener noreferrer">
				widgets.example.com
			</a>
			。
		</div>
	</noscript>
</div>

<script is:inline data-astro-rerun>
	// 消息来源 / 目标都写死为 widgets 域，绝不接受任何 "*" 或不校验 origin 的写法。
	const WIDGET_ORIGIN = "https://widgets.example.com";
	const DEFAULT_HUE = 250;

	// swup 翻页会让脚本重跑；先释放上一轮挂在全局的句柄，避免 listener / observer 累积。
	const PREV = window.__ghActivityWidget;
	if (PREV) {
		if (PREV.observer) PREV.observer.disconnect();
		if (PREV.onMessage) window.removeEventListener("message", PREV.onMessage);
	}

	const HOST = document.querySelector('[data-widget="true"]');
	if (!HOST) {
		/* 静默跳过：找不到宿主时不抛错，不影响页面其它功能。 */
	} else {
		const readTheme = function () {
			const root = document.documentElement;
			const dark = root.classList.contains("dark");
			const raw = getComputedStyle(root).getPropertyValue("--hue").trim();
			const parsed = Number.parseInt(raw, 10);
			return { dark: dark, hue: Number.isFinite(parsed) ? parsed : DEFAULT_HUE };
		};

		const buildUrl = function (theme) {
			const base = HOST.getAttribute("data-base") || (WIDGET_ORIGIN + "/");
			const url = new URL(base);
			url.searchParams.set("dark", theme.dark ? "1" : "0");
			url.searchParams.set("hue", String(theme.hue));
			url.searchParams.set("embed", "1");
			return url.toString();
  	};

  	const sendTheme = function (theme) {
  		if (HOST.contentWindow) {
  			HOST.contentWindow.postMessage(
  				{ type: "hm-theme", dark: theme.dark, hue: theme.hue },
  				WIDGET_ORIGIN,
  			);
  		}
  	};

  	const applyHeight = function (height) {
  		if (Number.isFinite(height) && height > 0) {
  			HOST.style.height = height + "px";
  		}
  	};

  	// 首屏：把当前主题写进 iframe 的 src，避免"先亮后暗"。
  	HOST.src = buildUrl(readTheme());

  	// 接收 iframe 上报的高度；必须校验 origin，不接受任何非 widgets 域的消息。
  	// 用具名函数引用，以便 swup 重跑时 removeEventListener 能真正删掉。
  	const onMessage = function (event) {
  		if (event.origin !== WIDGET_ORIGIN) return;
  		const data = event.data;
  		if (!data || data.type !== "hm-height") return;
  		applyHeight(data.height ?? 0);
  	};
  	window.addEventListener("message", onMessage);

  	// 主题切换：博客切明暗就是改 <html> 的 class，改色相就是改 <html> 的 style。
  	// 变化时读一次当前值发给 iframe（不重建 iframe，避免闪烁）。
  	const root = document.documentElement;
  	const observer = new MutationObserver(function () {
  		sendTheme(readTheme());
  	});
  	observer.observe(root, { attributes: true, attributeFilter: ["class", "style"] });

  	// 把本轮句柄挂到全局槽，下一轮重跑时先释放。
  	window.__ghActivityWidget = { observer: observer, onMessage: onMessage };
  }
</script>
```
### 如果你使用其他框架/不用 swup
```
<div style="padding: 24px 36px; width: 100%; overflow: hidden;">
	<iframe
		id="gh-activity-widget"
		data-base="https://widgets.example.com/"
		loading="lazy"
		frameBorder="0"
		scrolling="no"
		title="GitHub 活动"
		style="display: block; width: 100%; height: 130px; min-height: 130px; border: 0;">
	</iframe>
	<noscript>
		<p style="font-size: 14px; opacity: 0.7;">
			本页在启用 JavaScript 后会在此显示 GitHub 活动；或直接访问
			<a href="https://widgets.example.com/" target="_blank" rel="noopener noreferrer">widgets.example.com</a>。
		</p>
	</noscript>
</div>

<script>
	const WIDGET_ORIGIN = "https://widgets.example.com";
	const DEFAULT_HUE = 250;
	const HOST = document.getElementById("gh-activity-widget");

	const readTheme = function () {
		const root = document.documentElement;
		const dark = root.classList.contains("dark");
		const raw = getComputedStyle(root).getPropertyValue("--hue").trim();
		const parsed = Number.parseInt(raw, 10);
		return { dark: dark, hue: Number.isFinite(parsed) ? parsed : DEFAULT_HUE };
	};

	const buildUrl = function (theme) {
		const base = HOST.getAttribute("data-base") || (WIDGET_ORIGIN + "/");
		const url = new URL(base);
		url.searchParams.set("dark", theme.dark ? "1" : "0");
		url.searchParams.set("hue", String(theme.hue));
		url.searchParams.set("embed", "1");
		return url.toString();
	};

	const sendTheme = function (theme) {
		if (HOST.contentWindow) {
			HOST.contentWindow.postMessage(
				{ type: "hm-theme", dark: theme.dark, hue: theme.hue },
				WIDGET_ORIGIN,
			);
		}
	};

	const applyHeight = function (height) {
		if (Number.isFinite(height) && height > 0) HOST.style.height = height + "px";
	};

	// 首屏：把当前主题写进 iframe 的 src，避免"先亮后暗"闪一下。
	HOST.src = buildUrl(readTheme());

	// 接收 iframe 上报的高度；必须校验 origin，绝不接受非 widgets 域的消息。
	window.addEventListener("message", function (event) {
		if (event.origin !== WIDGET_ORIGIN) return;
		if (!event.data || event.data.type !== "hm-height") return;
		applyHeight(event.data.height ?? 0);
	});

	// 主题切换：博客切明暗就是改 <html> 的 class，改色相就是改 <html> 的 style。
	const observer = new MutationObserver(function () { sendTheme(readTheme()); });
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
</script>
```
### 然后推送仓库 触发构建
使用git推送到GitHub （通常cloudfare page创建的博客和GitHub仓库关联且自动构建）
```
cd "你的博客git仓库地址"
git add .
git commit -m "添加热力图"
git push
```

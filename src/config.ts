import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "晓黎の小破站", // 网站标题
	subtitle: "见过花开就好，何必在意花为谁开。", // 网站副标题
	lang: "zh_CN", // 网站语言代码，例如 'en', 'zh_CN', 'ja' 等
	themeColor: {
		hue: 250, // 主题色的默认色调，取值范围 0 到 360。例如：红色 0，青色 200，蓝色 250，粉色 345
		fixed: false, // 是否对访问者隐藏主题色选择器
	},
	banner: {
		enable: false, // 是否启用顶部横幅图片
		src: "assets/images/banner.png", // 横幅图片路径，相对于 /src 目录；如果以 '/' 开头则相对于 /public 目录
		position: "center", // 图片定位方式，相当于 object-position，仅支持 'top', 'center', 'bottom'，默认为 'center'
		credit: {
			enable: false, // 是否显示横幅图片的版权说明文字
			text: "", // 版权说明文字内容
			url: "", // （可选）指向原作者或作品页面的链接
		},
	},
	toc: {
		enable: true, // 是否在文章右侧显示目录
		depth: 2, // 目录中显示的最大标题深度，取值范围 1 到 3
	},
	favicon: [
		// 将此数组留空则使用默认 favicon
		// {
		//   src: '/favicon/icon.png',    // favicon 路径，相对于 /public 目录
		//   theme: 'light',              // （可选）'light' 或 'dark'，仅当需要为浅色/深色模式设置不同图标时使用
		//   sizes: '32x32',              // （可选）图标尺寸，仅当有不同尺寸的图标时设置
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home, // 首页链接预设
		LinkPreset.Archive, // 归档页链接预设
		LinkPreset.About, // 关于页链接预设
		{
			name: "GitHub", // 自定义链接名称
			url: "https://github.com/saicaca/fuwari", // 自定义链接地址，内部链接不应包含 base 路径，系统会自动添加
			external: true, // 标记为外部链接，将显示外部链接图标并在新标签页打开
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // 头像图片路径，相对于 /src 目录；如果以 '/' 开头则相对于 /public 目录
	name: "晓黎", // 你的名字或昵称
	bio: "一个普通人", // 个人简介
	links: [
		{
			name: "Twitter", // 社交链接名称
			icon: "fa6-brands:twitter", // 图标代码，可访问 https://icones.js.org/ 查找
			// 如果图标集尚未安装，需要手动安装，命令：`pnpm add @iconify-json/<图标集名称>`
			url: "https://twitter.com", // 链接地址
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/xieea656",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true, // 是否显示版权协议信息
	name: "CC BY-NC-SA 4.0", // 协议名称
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/", // 协议链接
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：部分样式（如背景色）在 astro.config.mjs 文件中被覆盖了
	// 请选择一个暗色主题，因为本博客主题目前仅支持深色背景的代码高亮
	theme: "github-dark", // 代码高亮主题
};
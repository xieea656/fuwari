/**
 * 教程索引 —— 首页侧边栏「索引」和 /deps/ 页面共用这一份数据
 *
 * 为什么单独抽成数据：侧边栏、依赖教程页、将来可能的 RSS/搜索都要用同一套
 * 分组与链接，散落在模板里改一处漏一处。
 *
 * slug 是短链短码（/s/<slug>），要在博客短链服务里真实存在；换短码时两边一起改。
 * deps 里写的是「依赖哪些更基础的教程」的 slug，用于在页面上展示依赖关系。
 */

export type TutorialItem = {
	/** 短链短码，对应 https://blog.xieea.top/s/<slug> */
	slug: string;
	title: string;
	/** 一句话说明，侧边栏不显示，依赖教程页显示 */
	summary?: string;
	/** 依赖的前置教程（用 slug 表示），会渲染成小标签 */
	deps?: string[];
};

export type TutorialGroup = {
	/** 锚点 id，/deps/#<id> 可直达 */
	id: string;
	name: string;
	/** 分组说明 */
	hint?: string;
	items: TutorialItem[];
};

export const tutorialGroups: TutorialGroup[] = [
	{
		id: "base",
		name: "基础依赖",
		hint: "装一次就够，后面所有教程都要先有它们",
		items: [
			{
				slug: "git",
				title: "Git 安装",
				summary: "Windows / Linux / macOS 三种装法，Linux 走包管理器",
			},
			{
				slug: "node",
				title: "Node.js 安装",
				summary: "Windows 装安装包，Linux 走 nvm（顺便解决版本切换）",
			},
		],
	},
	{
		id: "install",
		name: "安装教程",
		hint: "照着一步步跑起来的那种",
		items: [
			{
				slug: "blog",
				title: "Fuwari 博客部署",
				summary: "模板建仓 → 本地跑起来 → Cloudflare Pages 上线",
				deps: ["git", "node"],
			},
			{
				slug: "tavern",
				title: "SillyTavern（酒馆）",
				summary: "本地部署 LLM 前端，接自己的模型",
				deps: ["git", "node"],
			},
			{
				slug: "astrbot",
				title: "AstrBot 安装与配置",
				summary: "接微信 / QQ 官方接口跟 AI 聊天",
				deps: ["git", "node"],
			},
			{
				slug: "heatmap",
				title: "GitHub 热力图",
				summary: "给博客加一块 GitHub 活动墙",
				deps: ["node"],
			},
		],
	},
	{
		id: "usage",
		name: "使用教程",
		hint: "装好之后，怎么真正用起来",
		items: [
			{
				slug: "tune",
				title: "AstrBot 调教心得",
				summary: "提示词、记忆插件、分段回复，让回复更像人",
				deps: ["astrbot"],
			},
			{
				slug: "embed",
				title: "Cloudflare Embedding 免费额度",
				summary: "用 Workers AI 拿向量，给记忆插件用",
			},
		],
	},
];

/** 把所有 item 拍平，方便按 slug 查（例如渲染依赖标签的标题） */
export const tutorialBySlug: Record<string, TutorialItem> = tutorialGroups.reduce(
	(acc, group) => {
		for (const item of group.items) acc[item.slug] = item;
		return acc;
	},
	{} as Record<string, TutorialItem>,
);

/** 短链地址；站内引用统一走它，避免正文里出现超长的中文 percent-encoded 链接 */
export const tutorialUrl = (slug: string): string => `/s/${slug}`;

/** 依赖标签显示用：拿 slug 反查标题，查不到就原样显示 */
export const depLabel = (slug: string): string => tutorialBySlug[slug]?.title ?? slug;

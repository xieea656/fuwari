import { type CollectionEntry, getCollection } from "astro:content";

/**
 * 基础教程（src/content/tutorials/）的读取工具。
 *
 * 这一套和博客文章（src/utils/content-utils.ts 里的 posts）**完全不共用集合**：
 * 迁移一篇 Git 教程只要把 .md 从 src/content/posts/ 挪到 src/content/tutorials/，
 * 首页文章流 / 归档 / 分类 / 标签 都不会再看到它。
 */

export type TutorialEntry = CollectionEntry<"tutorials">;

/** 分组显示顺序（数组顺序即页面顺序，没列到的组排在最后） */
export const TUTORIAL_GROUP_ORDER = ["基础依赖", "安装教程", "使用教程"] as const;

export type TutorialGroupView = {
	name: string;
	items: TutorialEntry[];
};

/** 取所有已发布教程，按 group 顺序 + 组内 order/发布时间排好 */
export async function getTutorialEntries(): Promise<TutorialEntry[]> {
	const all = await getCollection("tutorials", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const groupRank = (name: string): number => {
		const i = TUTORIAL_GROUP_ORDER.indexOf(name as (typeof TUTORIAL_GROUP_ORDER)[number]);
		return i === -1 ? TUTORIAL_GROUP_ORDER.length : i;
	};

	return all.sort((a, b) => {
		const ga = groupRank(a.data.group || "安装教程");
		const gb = groupRank(b.data.group || "安装教程");
		if (ga !== gb) return ga - gb;
		if (a.data.order !== b.data.order) return a.data.order - b.data.order;
		return new Date(b.data.published).getTime() - new Date(a.data.published).getTime();
	});
}

/** 按 group 归并成页面/侧边栏要的结构 */
export async function getTutorialGroups(): Promise<TutorialGroupView[]> {
	const entries = await getTutorialEntries();
	const groups: TutorialGroupView[] = [];
	for (const entry of entries) {
		const name = entry.data.group || "安装教程";
		let group = groups.find((g) => g.name === name);
		if (!group) {
			group = { name, items: [] };
			groups.push(group);
		}
		group.items.push(entry);
	}
	return groups;
}

/** 教程页面 URL：/tutorials/<文件名>/（文件名就是 slug） */
export const getTutorialUrl = (slug: string): string => `/tutorials/${slug}/`;

/** 站内引用统一走短链：/s/<short>，短码没写就退回文件名 */
export const getTutorialShortUrl = (entry: TutorialEntry): string => {
	const code = entry.data.short || entry.slug;
	return `/s/${code}`;
};

/** 给「前置依赖」标签用：把 slug 换成标题，查不到就原样显示 */
export const tutorialTitleOf = (entries: TutorialEntry[], slug: string): string =>
	entries.find((e) => e.slug === slug)?.data.title ?? slug;

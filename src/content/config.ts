import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
/**
 * 基础教程：和博客文章（posts）完全分开的第二套内容。
 * 文件放 src/content/tutorials/，页面生成在 /tutorials/<文件名>/，
 * 不会出现在首页文章流、归档、分类/标签里。
 *
 * group 决定它出现在 /tutorials/ 的哪个分组：
 *   基础依赖 / 安装教程 / 使用教程
 */
const tutorialsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		description: z.string().optional().default(""),
		/** 分组：基础依赖 / 安装教程 / 使用教程（不填默认「安装教程」） */
		group: z.string().optional().default("安装教程"),
		/** 同组内排序，小的排前面（不填按发布时间倒序） */
		order: z.number().optional().default(0),
		/** 前置依赖，填其它教程的文件名（不含 .md），会渲染成标签 */
		deps: z.array(z.string()).optional().default([]),
		/** 短链短码，留空就按文件名推一个 */
		short: z.string().optional().default(""),
		draft: z.boolean().optional().default(false),
		tags: z.array(z.string()).optional().default([]),
	}),
});

const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	tutorials: tutorialsCollection,
	spec: specCollection,
};

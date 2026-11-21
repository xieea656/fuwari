---
title: 如何写博客：完全的博客部署教程
published: 2026-11-21
description: 面向完全新手的 Fuwari 博客部署教程：用 GitHub 模板创建仓库、本地安装 Git/Node/pnpm、克隆并运行开发服务器、修改站点与个人信息、撰写文章并用 Cloudflare Pages 发布（可选绑定自定义域名）。
category: 教程
draft: false
---
# 前言
如何开始写博客？这是我的回答。  
开始前你需要：
1. Cloudflare 账号
2. GitHub 账号
3. 一个域名（可选）

本文基于 **Fuwari（Astro）** 模板，适合想用 Markdown 写博客、并希望有一套“从零到上线”的清晰步骤的人。让我们开始吧。

# 创建仓库（使用模板）
![image.png](https://origin.picgo.net/2026/11/14/20261114154959958ec45eec675b82321.png)
1. 先后点击 **Use this template** 和 **Create a new repository**（界面文案可能随 GitHub 更新略有不同，以截图/页面为准）。
![image.png](https://origin.picgo.net/2026/11/14/20261114155201681558d8c73e6848d21.png)
2. 填一个易于识别的仓库名（建议英文、不要空格），然后继续创建。
![image.png](https://origin.picgo.net/2026/11/14/20261114155802913021ba25d2342fa27.png)
3. 稍等片刻，查看浏览器地址栏里的仓库地址，复制下来（这是**你自己账号下**的仓库地址，后面克隆要用这个）。
![image.png](https://origin.picgo.net/2026/11/14/20261114160128313d9194abdd5ce1460.png)

> 注意：克隆的是**你自己的仓库地址**（地址里是你的用户名），不是上游模板 `saicaca/fuwari` 的地址。

# 安装 Git、Node.js 与 pnpm
1. 安装 Git  
   Windows 安装 Git 可参考我的这篇博客：git安装教程 - 晓黎の小破站 https://blog.xieea.top/posts/%E5%88%9B%E4%BD%9C/%E4%BE%9D%E8%B5%96%E5%AE%89%E8%A3%85/git%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/  
   若系统已安装可跳过，重点是终端里能运行 `git --version`。
2. 安装 Node.js  
   Windows 可参考：node.js安装 https://blog.xieea.top/posts/%E5%88%9B%E4%BD%9C/%E4%BE%9D%E8%B5%96%E5%AE%89%E8%A3%85/nodejs%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B/  
   安装时注意勾选 **“Add to PATH”**（若有该选项）。若已安装可跳过。
3. 安装 pnpm  
   打开终端（Windows 可用 PowerShell 或 Git Bash），输入：
   ```
   npm install -g pnpm
   ```
4. 验证  
   输入：
   ```
   pnpm --version
   ```
   能正常打印版本号即表示安装成功。不要关闭终端，继续下一步。

# 克隆仓库与开发服务器
1. 克隆仓库  
   ![image.png](https://origin.picgo.net/2026/11/20/202611202327378130249f335893ecd68.png)  
   **这里复制的是你自己的仓库 URL（地址里是你的用户名）。**  
   **注意：克隆的是你自己的仓库地址，不是上游模板地址。**  
   你可以在 GitHub 仓库页点 **Code** 复制 HTTPS 后在终端执行；也可以用下面示例（把尖括号内容换成你的）：
   ```
   git clone https://github.com/<你的GitHub用户名>/<你起的仓库名>.git
   cd <你起的仓库名>
   ```
2. 保持终端打开，安装依赖：
   ```
   pnpm install
   ```
3. 启动开发服务器：
   ```
   pnpm dev
   ```
   启动后一般会在 `http://localhost:4321/` 生成本地预览。你可以直观看到站点大致效果，并且修改文件后通常会自动刷新页面。

# 初始化页面：改成你自己的个人信息（建议先在本地完成）
> 建议顺序：先在本地改好并用 `pnpm dev` 预览确认，再推送到 GitHub、再连接 Cloudflare Pages。

1. 打开 `src/config.ts`  
   ![image.png](https://origin.picgo.net/2026/11/20/202611202351195744858c4356d1d3849.png)  
   常改项示例：
   - `siteConfig.title`：网站标题
   - `siteConfig.subtitle`：副标题
   - `siteConfig.lang`：语言，如 `"zh_CN"`
   - `siteConfig.banner`：顶部大图开关与图片（不需要可设为 `enable: false`）
   - `navBarConfig.links`：导航链接（首页/归档/关于为预设，也可加自定义链接）
   - `profileConfig.avatar`：头像路径（按文件实际位置放好）
   - `profileConfig.name`：名字/昵称
   - `profileConfig.bio`：简介
   - `profileConfig.links`：社交链接数组（把示例链接换成你的，或删除不需要的项）
   - `licenseConfig`：文章页许可协议信息（可按需修改）
   ![image.png](https://origin.picgo.net/2026/11/21/202611210000181394d70ad435519cb42.png)

2. 修改站点访问地址（很重要）：打开 `astro.config.mjs`，找到 `site`，改成你最终要使用的地址，例如：
   - 先用 Cloudflare Pages 默认域名时：`https://你的项目名.pages.dev/`（注意格式与末尾斜杠，按文件原有写法保持一致）
   - 绑定自定义域名后：`https://你的域名/`  
   说明：`site` 会影响 RSS、规范链接等，建议在准备发布到对应域名时改好并重新构建/部署。

3. 关于页：编辑 `src/content/spec/about.md`，改成你的自我介绍与链接（若有模板里的示例组件，可按需修改或删除）。

4. 示例文章：`src/content/posts/` 里会有示例内容，便于理解写法。熟悉后建议删除或替换成你自己的文章，避免与站点风格冲突。

# 连接 Cloudflare Pages，让网站能被访问
1. 登录 Cloudflare 控制台，打开 **Workers 和 Pages** 页面，点击 **创建应用程序**。  
   ![Workers 和 Pages 页面](https://origin.picgo.net/2026/10/16/2026101623341661368700361e1de7b16.png)
2. 点击 **继续前往 Pages**。  
   ![image.png](https://origin.picgo.net/2026/11/21/2026112109132901511850573125d376c.png)
3. 在 **导入 Git 存储库** 旁点击 **开始使用**。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121091523842226621904f062833.png)
4. 点击 **连接 GitHub**。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121091612069b1c293c074b75704.png)
5. 授权 Cloudflare 访问 GitHub。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121091936787fee6fb033b8ab79d.png)
6. 稍等后选择你的仓库，进入下一步。  
   ![image.png](https://origin.picgo.net/2026/11/21/202611210953491208134af104f85810f.png)
7. **框架预设选择 Astro**（否则可能构建失败），然后继续。  
   ![image.png](https://origin.picgo.net/2026/11/21/2026112110041424298b9414bf66911da.png)  
   常见构建设置可核对：构建命令 `pnpm build`，输出目录 `dist`（以页面自动识别为准，但建议确认一致）。若构建环境 Node 版本过旧，可在环境变量中设置 `NODE_VERSION`（例如 `20`）。
8. 向下查看构建日志，等待构建完成。  
   ![image.png](https://origin.picgo.net/2026/11/21/202611211003458361bf8c6000e69f5a6.png)  
   构建完成后博客即可通过 Pages 提供的地址访问。建议：部署前确认已把个人信息、`astro.config.mjs` 的 `site` 改好并推送到 GitHub，否则线上可能仍是默认内容或域名不正确。

## 自定义域名（可选）
1. 在 Pages 项目中点击 **添加自定义域**。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121100541044b1b89e01020c78ff.png)
2. 按提示填写并完成 DNS/绑定设置。  
   ![image.png](https://origin.picgo.net/2026/11/21/2026112110082165232e0c6a013e00bb9.png)  
   绑定成功后，记得把 `astro.config.mjs` 里的 `site` 改为 `https://你的自定义域名/`，再提交并等待重新部署。

# 开始创作
## 文章需要的字段
文章需要包含 `published` 和 `title` 等字段，否则可能无法正常构建。示例头部：
```
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```
含义说明：

| 属性 | 描述 |
|---|---|
| `title` | 帖子标题。 |
| `published` | 帖子发布日期。 |
| `description` | 简短描述，会显示在索引页等位置。 |
| `image` | 封面图路径。以 `http://` 或 `https://` 开头为网络图片；以 `/` 开头相对于 `public`；不写前缀时相对于该 markdown 文件所在位置。 |
| `tags` | 标签。 |
| `category` | 分类。 |
| `draft` | 若为 `true` 则不会发布显示（按主题行为为准）。 |

## ## 使用记事本去写博客无疑是难受的
用记事本也能写，但体验一般，没有方便的预览。开发服务器预览更准确但启动略重。**推荐使用 Obsidian**：在写作体验和轻量预览之间比较折中，你也可以用它管理文章草稿，再复制到 `src/content/posts/`（或按你自己的习惯放置）。
1. 访问官网 https://obsidian.md/ 下载安装。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121101612392fce7fcde0ebe5308.png)
2. 选择一个文件夹存放你的文章。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121101809216309eeaf9958daa58.png)  
   不必强制把 `fuwari` 仓库目录当成 Obsidian 库；更推荐用独立文件夹写作，完成后再复制到 `src/content/posts/`

## 发布流程
本地用 `pnpm dev` 检查并调整格式后，使用 Git 提交并推送到 GitHub：
```
git add .
git commit -m "feat: 文章标题或更新说明"
git push
```
Cloudflare Pages 会自动构建；你仍可在 Cloudflare 控制台查看构建日志。

# 你可能需要这些
## 让网站在 Bing 中被搜索到（示例）
1. 访问 Bing 站长平台 https://www.bing.com/webmasters，按页面提示登录/开始。  
   ![image.png](https://origin.picgo.net/2026/11/21/2026112110431542348490e2aef38f065.png)
2. 使用微软账号登录。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121104422704bc5355c9370060fe.png)
3. 输入你的网站 URL。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121104534994851843a8709c407a.png)
4. 按提示选择验证方式（可任选其一）。  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121104927491c845befb16b138e1.png)  
  xml和html元标签法不会可以让AI agent代劳。
5. 在站点管理中提交网站地图，例如：`https://你的网站域名/sitemap-0.xml`，提交即可。  
   ![image.png](https://origin.picgo.net/2026/11/21/202611211051103212c8951f57bc4fe36.png)  
   ![image.png](https://origin.picgo.net/2026/11/21/20261121105145459f7d0ce216a82034a.png)
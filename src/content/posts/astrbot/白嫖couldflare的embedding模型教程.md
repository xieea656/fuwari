---
title: 白嫖 Cloudflare 的 Embedding 模型
published: 2026-06-28
description: 免费使用 Cloudflare Workers AI 获取 embedding 向量，无需付费，包含创建 API Token、获取账户 ID、配置模型等步骤。
---

## 前言

如果你不想为向量嵌入付费，可以使用 Cloudflare Workers AI 的免费额度，也能获得不错的向量检索效果。

**你需要**：
1. 一个 Cloudflare 账号

# 第一步：创建 API Token

1. 登录 [Cloudflare](https://dash.cloudflare.com) 并注册一个账号
2. 点击右上角账户图标，再点击**配置文件**点击**API令牌**
![image.png](https://origin.picgo.net/2026/10/06/202610062254240272e1296c1df9e25b2.png)

4. 右上角，点击**创建令牌**
![image.png](https://origin.picgo.net/2026/10/06/2026100622552141140173569bbbe7442.png)
6. 在模板中选择 **Worker AI**

![image.png](https://origin.picgo.net/2026/10/06/20261006225604955ee60a388053c5d6e.png)

5. 按提示创建令牌，**复制并保存好这个令牌**（只显示一次）


## 第二步：获取账户 ID

观察浏览器地址栏，你会看到：

```
https://dash.cloudflare.com/<你的账户id>/home
```
把这个 `<你的账户id>` 复制下来。

# 第三步：配置 API 信息

```
API Key: <第一步生成的令牌>
Base URL: https://api.cloudflare.com/client/v4/accounts/<你的账户id>/ai/v1
Model: @cf/qwen/qwen3-embedding-0.6b
```



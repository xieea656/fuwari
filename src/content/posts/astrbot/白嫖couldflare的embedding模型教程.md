---
title: 白嫖couldflare的embedding模型
published: 2026-06-28
---

# 白嫖couldflare的embedding模型教程
**如果不想为向量付费，可以使用大善人的workers ai白嫖**也可以获取不错的向量检索效果
1. 打开couldflare注册且登录一个账号
2. ![](https://img.xieea.top/i/2026/07/31/6a6caf71d8930.png)
   点击右上角账户图标，再点击**配置文件**
3. ![](https://img.xieea.top/i/2026/07/31/6a6caf79d6d3a.png)
   点击**API令牌**
4. ![168](https://img.xieea.top/i/2026/07/31/6a6caf800c67a.png)
   右上角，点击**创建令牌**
5. ![](https://img.xieea.top/i/2026/07/31/6a6caf8637c40.png)
    在模板中选择**worker AI**
6. ![](https://img.xieea.top/i/2026/07/31/6a6caf8faf894.png)
   在**账户资源中选择所有账户**
   向下滑，点击**继续以显示摘要**
7. ![](https://img.xieea.top/i/2026/07/31/6a6caf94d980c.png)
   点击**创建令牌**
8. ![](https://img.xieea.top/i/2026/07/31/6a6caf9b43db8.png)
   **复制并保存好这个令牌**（上图中的令牌已删除）
9. ![](https://img.xieea.top/i/2026/07/31/6a6cafa31d550.png)
   在这里复制你的**账户id**并妥善保存
10. 最后在Memorix配置界面的embedding模型配置中这样填
```
  API Key 填你保存的cloudfare令牌
  API Base URL 填写
  https://api.cloudflare.com/client/v4/accounts/[这里替换成你保存的账户id]/ai/v1
  （要带上方括号一起替换）
  Embedding 模型名称 填 @cf/qwen/qwen3-embedding-0.6b
```
11. 也可以在astrbot提供商页面添加
   ![](https://img.xieea.top/i/2026/07/31/6a6caffed356e.png)
   ![image.png](https://img.xieea.top/i/2026/07/31/6a6cb0044df06.png)
   ![image.png](https://img.xieea.top/i/2026/07/31/6a6cb00ba62e1.png)

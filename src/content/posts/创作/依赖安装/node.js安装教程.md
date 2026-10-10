---
title: node.js安装教程
published: 2026-07-25T16:00:00.000Z
description: 在 Windows、Linux、macOS 上安装 Node.js 的完整教程，包含 LTS 版本选择、环境变量配置和版本管理。
---

## Windows
1. 进入官网 [Node.js — 下载 Node.js®](https://nodejs.org/zh-cn/download)
   ![node.js下载页面图片](https://origin.picgo.net/2026/10/10/20261010214432212ee551b0ee9c43536.png)
2. 下载Windows版的安装程序（msl）
3. 打开刚下载的文件
4. ![nodejs 安装程序界面1](https://origin.picgo.net/2026/10/10/20261010214717574ff8f4e94d657d03e.png)
   同意协议
5. ![nodejs 安装程序界面2](https://origin.picgo.net/2026/10/10/2026101021493467028ff7a806afa78b2.png)
   注意**add to path**一路下一步即可
## Linux
## CentOS、Fedora 和 Red Hat Enterprise Linux
```
dnf install nodejs npm
```
## Debian 和 Ubuntu 及其他
```
# 下载并安装 nvm：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 代替重启 shell
\. "$HOME/.nvm/nvm.sh"

# 下载并安装 Node.js：
nvm install 24

```

# 验证
```
# 验证 Node.js 版本：
node -v 

# 验证 npm 版本：
npm -v 
```

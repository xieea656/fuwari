---
title: node.js安装教程
published: 2026-07-25T16:00:00.000Z
---
# Windows
1. 进入官网 [Node.js — 下载 Node.js®](https://nodejs.org/zh-cn/download)
   ![image.png](https://oss.xieea.top/img/image.png)
2. 下载Windows版的安装程序（msl）
3. 打开刚下载的文件
4. ![image.png](https://oss.xieea.top/img/image.png)
   同意协议
5. ![image.png](https://oss.xieea.top/img/image.png)
   注意**add to path**一路下一步即可
# Linux
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
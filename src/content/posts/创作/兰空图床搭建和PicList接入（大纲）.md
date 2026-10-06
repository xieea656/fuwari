# 兰空图床 + PicList 接入（踩坑记录）

## 写在前面的
- 为什么搭图床
- **搭建部分略写**：每个人的服务器环境不一样（Docker/nginx/面板/证书方案都不同），但 **PicList 接入的坑是通用的**，这篇重点在这

## 一、搭建（一句话版）
- 免费版镜像 `dko0/lsky-pro:2.1`（**别用 `0xxb/lsky-pro`，那是要付费的 Pro+**，装完要授权验证）
- 数据卷挂 `/var/www/data`（SQLite + 图片）
- 端口 `8000` 只绑本机，对外走 nginx 反代
- 证书走 certbot（域名在 CF 后面要 DNS-01 验证）
- 就这些，具体看你的环境

## 二、PicList 接入，坑的开始

### 2.1 第一步就卡住：Token 哪来？
- 免费版**没有"生成 Token"的界面**（网上教程大部分是 Pro+ 的界面）
- 要用 API 拿：
  ```
  curl -X POST https://img.xieea.top/api/v1/tokens -F 'email=管理员邮箱' -F 'password=密码'
  ```
  返回 `data.token`（`1|xxx` 开头）
- Windows 用户注意：PowerShell 的 `curl` 是假的（`Invoke-WebRequest` 别名），要用 `curl.exe`

### 2.2 配置项，每一项都是坑
| 配置项 | 填什么 | 填错的后果 |
|--------|--------|-----------|
| 版本 | **V2** | 选 V1 → 请求 `/api/upload` → 404 |
| 主机 | `https://img.xieea.top`（**只填域名**） | 带路径 → `/api/v1/api/upload` → 404 |
| Token | `Bearer xxx`（**Bearer 后有一个空格**） | 没前缀/填错 → 401 |
| 策略 ID | **留空** | 填了不存在的 → "选定的策略不存在" |
| 相册 ID | 留空 | — |
| 权限 | 默认 public | — |

### 2.3 报错速查表（按遇到顺序排的）
| 报错 | 真实原因 | 怎么改 |
|------|---------|--------|
| `connect ECONNREFUSED 38.76.215.135:8000` | 直连了 8000，但 8000 只绑本机 | 主机改域名 |
| 404 `.../api/v1/api/upload` | 主机填了 `/api/v1`，路径重复 | 主机只填 `https://img.xieea.top` |
| 404 `.../api/upload` | 版本选成 V1 | 版本改 V2 |
| 401 `Authentication failed` | Token 没带 `Bearer ` 前缀 / token 无效 | 检查前缀；用 API 重新拿 |
| `选定的策略不存在` | 策略 ID 填了不存在的值 | 清空策略 ID |
| 521（浏览器访问域名） | CF 回源 443 没服务（SSL 模式=完全） | 源站配 certbot 证书 + nginx 443 |

### 2.4 排查方法论（这个比报错表有用）
- **所有报错先看 PicList 日志**：设置 → 日志，里面 `"url"` 字段就是真相
  - 看 URL 是 `/api/upload` 还是 `/api/v1/upload` → 版本问题
  - 看 URL 有没有重复路径 → 主机问题
  - 看状态码 401/404/0 → 对应上面的表
- 日志在 Windows 上是 `C:\...\PicList\logs` 或配置目录，也可以导出
- 一条条对着 URL 猜，比瞎试快

### 2.5 上传成功之后
- 确认走没走 CDN：浏览器 F12 看响应头有没有 `cf-ray`
- 建议开图片处理（压缩转 WebP），VPS 带宽小的福音
- 老图床迁移：下载 → 上传 → 全文替换链接（Python 脚本批量干）

## 结尾
- 免费版 + CF CDN 白嫖配置，唯一的代价就是这些坑
- 欢迎补充你遇到的坑

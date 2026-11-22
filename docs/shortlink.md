# 短链服务（blog.xieea.top/s/xxx）

博客自带一个短链功能：`blog.xieea.top/s/短码` → 目标网址。
跑在 **Cloudflare Pages Functions** 上，和博客同一个仓库、同一次部署、同一个域名，不需要额外的 Worker 项目。

## 为什么放在 Pages Functions 而不是单独 Worker

| | 单独 Worker（s.xieea.top） | Pages Functions（blog.xieea.top/s） |
|---|---|---|
| 域名 | 要多维护一个子域 | 不用，博客域名直接带出来 |
| 部署 | 另起一套 | 跟博客 push 一起发布，不会不同步 |
| 成本 | 一样（免费额度内） | 一样 |
| 缺点 | 两处代码容易漂移 | 只能挂在 `/s` 前缀下 |

代码在 `functions/s/`：

```
functions/s/[[code]].js   Pages Function 入口（[[code]] 是可选捕获组，接住 /s 和 /s/...）
functions/s/_handler.js   路由 + 跳转 + 管理接口（basePath 参数化，独立 Worker 版可复用）
functions/s/_lib.js       短码/URL 校验、JSON 响应、常量时间比较
functions/s/_admin-page.js 控制台单页（内联 CSS/JS，无外部依赖）
```

## 功能

- `GET /s/<短码>` → **302** 跳目标（用 302 不用 301：改了目标立刻生效）
- `GET /s/admin` → 控制台：新建 / 列表 / 改目标 / 删除 / 复制
- `GET /s/api/links` 等接口（需 `Authorization: Bearer <ADMIN_TOKEN>`），方便脚本批量导入
- 短码：小写字母/数字开头，可带 `-` `_`，1~32 位；留空自动生成 5 位（字母表去掉 `0o1li`）
- 可设有效期，过期返回 410
- 拒绝 `javascript:` 等危险协议、拒绝指向短链自己（防死循环）

## 一、Cloudflare 侧配置（只做一次）

在 Cloudflare 后台 → **Workers & Pages → 你的博客 Pages 项目 → Settings**：

1. **Bindings → KV namespace**
   - Variable name：`SHORTLINKS`
   - KV namespace：没有的话先去 **KV** 页面新建一个（名字随便，比如 `shortlink-links`）
2. **Variables and Secrets** 加这几个（`ADMIN_TOKEN` 一定要选 **Secret/加密**）：
   - `ADMIN_TOKEN` = 你的管理口令（建议 `openssl rand -base64 24` 生成）
   - `SITE_NAME` = `晓黎的短链`（可选，用于页面标题）
   - `HOME_URL` = `https://blog.xieea.top`（可选，`/s` 根路径跳这里）
   - `COUNT_HITS` = `1`（可选，`0` 关闭点击统计以省 KV 写额度）
3. 改完重新部署一次（Settings 里改了绑定需要重新发布才生效）。

> 绑定/variable 都是「生产环境」和「预览环境」分开的，预览环境想用就两份都填。

## 二、本地开发

Pages Functions 不在 `pnpm dev`（Astro dev）里跑，得用 Pages 本地运行时：

```bash
# 1. 先构建静态站
pnpm build

# 2. 起 Pages 本地运行时（KV 用本地模拟，变量的值随便填）
npx wrangler pages dev dist \
  --kv SHORTLINKS \
  --binding ADMIN_TOKEN=dev-token \
  --binding HOME_URL=https://blog.xieea.top \
  --binding COUNT_HITS=1
```

然后：

```bash
curl http://127.0.0.1:8788/s/health
curl -X POST http://127.0.0.1:8788/s/api/links \
  -H 'authorization: Bearer dev-token' -H 'content-type: application/json' \
  -d '{"url":"https://blog.xieea.top/about/","slug":"about"}'
curl -i http://127.0.0.1:8788/s/about
```

也可以用 `.dev.vars` 存本地变量（已在 `.gitignore` 里）：

```ini
# .dev.vars
ADMIN_TOKEN=dev-token
HOME_URL=https://blog.xieea.top
SITE_NAME=晓黎的短链
COUNT_HITS=1
```

## 三、用法

### 网页

`https://blog.xieea.top/s/admin` → 输口令 → 新建。短链会自动复制。

### curl

```bash
TOKEN='你的 ADMIN_TOKEN'
curl -X POST https://blog.xieea.top/s/api/links \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"url":"https://example.com/very/long","slug":"demo","expiresInDays":30}'
```

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/s/api/links?limit=50&cursor=...` | 列表（KV 分页） |
| POST | `/s/api/links` | 新建 `{url, slug?, note?, expiresInDays?}` |
| GET | `/s/api/links/:slug` | 查一条 |
| PATCH | `/s/api/links/:slug` | 改 `{url?, note?, expiresInDays?}` |
| DELETE | `/s/api/links/:slug` | 删一条 |

## 四、注意

- **KV 不是原子自增**，点击次数是尽力而为（并发点同一个链接可能少算几次）；`COUNT_HITS=0` 可完全关掉以减少 KV 写。
- 跳转 `get(..., { cacheTtl: 60 })` 会在边缘缓存 60 秒，所以**改完目标最多 60 秒才全网生效**。
- 没做频率限制（防爆破）。要加就在 Cloudflare 后台给 `/s/api/*` 和 `/s/admin` 配 Rate Limiting 规则，不用改代码。
- 短链是公开跳转器，**别拿它藏私密链接**。
- `robots.txt` 里全站禁止抓取；短链响应也带了 `X-Robots-Tag: noindex`。

## 五、和 `~/coding/shortlink` 的关系

`~/coding/shortlink` 是同一套逻辑的**独立 Worker 版**（可挂 `s.xieea.top` 这种更短的独立域名）。
两边的 `_lib.js` / 处理器逻辑基本一致；要改行为建议先改博客这份（线上在用的），再同步过去。

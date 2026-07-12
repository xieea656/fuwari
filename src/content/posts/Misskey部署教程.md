---
title: 在服务器上部署 Misskey（保姆级）
published: 2026-07-11T16:00:00.000Z
tags:
  - misskey
  - 自托管
  - 教程
---

# 在服务器上部署 Misskey（保姆级）
# 前言
看到这种自托管论坛的时候，我也去研究了一下，发现了 Misskey 这个去中心化的自建社区平台，感觉挺有意思的。研究都研究了，那就出个教程吧。

## 前置准备：买一台服务器

推荐买小兔互联，便宜够用：

1. 打开 https://moebun.com/aff/CCTAJESP ，注册账号
2. 进控制台，点「云服务器」→「购买」
   ![image.png](https://oss.xieea.top/img/6a531e7b09652.png)
   这个试用活动价格非常低，购买时选择“试用”，就可以看到下面这个更便宜的，综合下来二核2G的话，7块钱一个月
3. 购买时选择“试用”
   ![image.png](https://oss.xieea.top/img/6a531dc0e147c.png)
4. 买好后会给你一个 **IP 地址**、**root 密码**，记下来
   ![image.png](https://oss.xieea.top/img/6a531e16b7236.png)


然后用终端连接服务器：

```bash
ssh root@你的服务器IP
```

输入密码（不会显示，直接粘贴再回车就行），就连上了。

---

## 第一步：安装 Docker

Docker 是一个让应用在「容器」里运行的工具，不用手动装一堆依赖。

```bash
curl -fsSL https://get.docker.com | sh
```

## 第二步：创建文件夹

```bash
mkdir -p ~/misskey && cd ~/misskey
```

## 第三步：创建配置文件

这条命令会在当前目录生成一个 docker-compose.yml，告诉 Docker 要运行哪些服务：

```bash
cat > docker-compose.yml << 'EOF'
services:
  misskey:
    image: misskey/misskey:latest
    container_name: misskey
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/misskey/files
      - ./config:/misskey/.config
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    container_name: misskey-db
    restart: unless-stopped
    volumes:
      - ./db:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: misskey
      POSTGRES_PASSWORD: 改成你的密码
      POSTGRES_DB: misskey

  redis:
    image: redis:7-alpine
    container_name: misskey-redis
    restart: unless-stopped
    volumes:
      - ./redis:/data
EOF
```

> 把「改成你的密码」换成一个你自己设的密码，比如 mypassword123。

## 第四步：创建 Misskey 配置

告诉 Misskey 你的域名是什么、怎么连数据库：

```bash
mkdir -p config
cat > config/default.yml << 'EOF'
url: https://你的域名/
port: 3000
db:
  host: db
  port: 5432
  user: misskey
  pass: 上一步你设的密码
  database: misskey
redis:
  host: redis
  port: 6379
id: aid
drive:
  storage: ./files
logLevel: warning
EOF
```

> ⚠️ **重要：域名一旦填好就不能改了！** 想清楚再填。
>
> 把「你的域名」换成你实际的域名，比如 social.example.com。
> 密码要和上一步一致。

## 第五步：启动

```bash
docker compose pull
```

下载镜像，需要等几分钟。

```bash
docker compose up -d
```

启动服务。

```bash
docker logs -f misskey
```

查看日志，看到 `listening on port 3000` 就是成功了，按 Ctrl+C 退出日志。

## 第六步：域名和 HTTPS

你需要做两件事：

**1. 买域名**

去 域名注册商注册以cloudfare为例，添加一个域名（免费的也行）。

**2. 设置 DNS 和 SSL**

在 Cloudflare 的 DNS 设置里：
- 添加一条 **A 记录**，名字填你的子域名（比如 social），内容填服务器 IP
- 开启橙色云朵（Proxied）
- SSL 模式选 **Flexible**

这样访问你的域名就会自动走 HTTPS 了。
![image.png](https://oss.xieea.top/img/6a531f082a756.png)
## 第七步：打开网页

浏览器访问 https://你的域名，按提示创建管理员账号就行了！

---

## 常用命令

| 操作 | 命令 |
|------|------|
| 重启 | `docker compose restart` |
| 更新 | `docker compose pull && docker compose up -d` |
| 看日志 | `docker logs -f misskey` |
| 备份数据库 | `docker exec misskey-db pg_dump -U misskey misskey > backup.sql` |

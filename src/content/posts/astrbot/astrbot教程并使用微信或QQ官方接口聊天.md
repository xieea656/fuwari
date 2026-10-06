---
title: AstrBot 使用教程：配置微信/QQ官方接口与AI聊天
published: 2026-10-06
description: 从零开始配置 AstrBot，使用微信或 QQ 官方接口与 AI 聊天，包含安装步骤、渠道配置和模型选择。
---
文章更新与 2016/10/6
最近研究聊天机器人，看到astrbot，于是出个教程
**在观看本教程之前，你需要准备**
**一颗聪明的头脑（用于独立解决问题）**
- 一台运行astrbot的Linux设备，服务器/nas都可以
- 一个ssh工具[mobaxterm]([MobaXterm free Xserver and tabbed SSH client for Windows](https://mobaxterm.mobatek.net/))（可不用）
- ai云服务厂商的api key（本教程不提供自部署ai如ollma的教程）
**让我们开始吧：**
## 第一步 安装
### **uv方式**
1. **使用ssh工具连接部署设备**
```
 curl -LsSf https://astral.sh/uv/install.sh | sh
 source $HOME/.local/bin/env  
```
2. 通过uv安装astrbot
```
 uv tool install astrbot --python 3.12
 astrbot init
```
3. 启动astrbot
```
 astrbot run
```
4. 在服务器安全组放行6185端口/在部署机防火墙放行6185端口
5. 访问http://==服务器ip==:6185 打开webUI
### docker方式
 直接用docker就行了
```
 git clone https://github.com/AstrBotDevs/AstrBot 
 cd AstrBot
 sudo docker compose up -d
```
 **记得安全组和防火墙放行端口
 在游览器访问http:/==/服务器ip==:6185

---
## 第二步 配置消息平台
 
### 微信官方渠道
1. 创建机器人 选择**个人微信**
2. 用最新版微信扫描 跟随提示授权即可
![image.png](https://origin.picgo.net/2026/10/06/2026100622352965469baeeaf1d268a62.png)

### QQ官方机器人
此渠道经过了TX的简化 现在不需要三同验证了 只需要你是群主/管理员你就可以拉官方机器人进群
1. 打开[QQ开放平台](q.qq.com) 注册登录账号
2. 按提示创建机器人 
   ![image.png](https://origin.picgo.net/2026/10/06/20261006224340514e502c78d66326428.png)
3. 记录AppID 和 AppSecret
4. 返回astrbot填入信息
   ![image.png](https://origin.picgo.net/2026/10/06/20261006224604959ca24368dca66bf6d.png)

## 第三步 基础配置与模型提供商
### 模型提供商
 在模型提供商中，可以设置使用的各个模型，例如deepseek-flash
 
 astrbot提供了很多提供商预设，但他们只是帮你把API Base URL填好了，让你不用在api文档中找，
 所以**如果你想使用的提供商在其中没有，请自行在提供商的api文档中找到openai格式API Base URL与api key**
 - 在填写完API Base URL和api key之后，点击“保存并获取模型列表”
 - 然后启用你想要用的模型

### 配置文件的基础配置
![image.png](https://origin.picgo.net/2026/10/06/20261006223226010484447ac009cbdc7.png)


**在”配置文件“页面中可以对配置文件进行编辑，可以找到更多功能**
#### 模型配置
- 可以指定ai使用的**具体模型**
- 在添加语音转述模型之后，可以在这里设置，让ai能够听懂和说语音
- 如果你的ai不是全态模型 如DeepSeek，可以加个支持图片的模型转述让ai你看懂图片
#### 人格
人格就是个ai的提示词==每次聊天都会向ai发送==。这个就任君发挥了


现在 ，让我们看向**平台配置**

#### 白名单
**默认开启白名单模式，只有白名单内的会话会被响应，在和ai聊天之前，需要将会话id加入白名单或关闭白名单模式 ==注意是会话id不是用户id==**
直接在对应聊天渠道对AI说”/sid“即可获取id




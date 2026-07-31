---
date: 2026/4/18
title: "Astrbot教程并使用Wechat OpenClaw接口聊天"
published: 2026-06-20
---

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
1. 机器人 >> 创建机器人  >> 个人微信
==注：不是个人的微信号，是指个人微信的openclaw接口==
 #最好创建一个独立的配置文件，让各个机器人之间隔离
2. **用==最新版手机微信==扫码**
之后在聊天中的“微信openclaw”就是astrbot机器人了

## 第三步 基础配置与模型提供商
### 模型提供商
 在模型提供商中，可以设置使用的各个模型，例如DeepSeek chat
 ![image.png](https://img.xieea.top/i/2026/07/31/6a6caf13a27bf.png)

 astrbot提供了很多提供商预设，但他们只是帮你把API Base URL填好了，让你不用在api文档中找，所以**如果你想使用的提供商在其中没有，请自行在提供商的api文档中找到openai格式API Base URL与api key**
 - 在填写完API Base URL和api key之后，点击“保存并获取模型列表”
 - 然后启用你想要用的模型

### 配置文件的基础配置
 ![image.png](https://img.xieea.top/i/2026/07/31/6a6caf13a27bf.png)

**在”普通配置“页面中可以对配置文件进行编辑，可以找到更多功能**
#### 模型配置
- 可以指定ai使用的**具体模型**
- 在添加语音转述模型之后，可以在这里设置，让ai能够听懂和说语音
- 如果你的ai不是全态模型 如DeepSeek，可以加个支持图片的模型转述让ai你看懂图片
#### 人格
人格就是个ai的提示词==每次聊天都会向ai发送==。这个就任君发挥了

---

现在 ，让我们看向**平台配置**
![image.png](https://img.xieea.top/i/2026/07/31/6a6caf13a27bf.png)

#### 白名单
**默认开启白名单模式，只有白名单内的会话会被响应，在和ai聊天之前，需要将会话id加入白名单或关闭白名单模式 ==注意是会话id不是用户id==**

---
#### 插件
**不过多介绍，astrbot拥有丰富的插件生态，可以自由去探索（对QQbot平台支持最多）**

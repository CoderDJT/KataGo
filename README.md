# KataGo AI 围棋对弈

基于 KataGo 引擎的 Web 围棋对弈平台，支持 AI 对战、本地双人对弈、在线联机对战，并提供 AI 终局分析功能。

## 技术栈

### 前端 (web/)

| 技术 | 版本 | 用途 |
|---|---|---|
| React | ^18.3.1 | UI 框架 |
| TypeScript | ^5.3.3 | 类型安全 |
| Vite | ^5.4.0 | 构建工具 |
| TailwindCSS | ^3.4.1 | 样式框架 |
| TanStack Router | ^1.15.0 | 前端路由 |
| TanStack React Query | ^5.17.0 | 数据请求管理 |

### 后端 (server/)

| 技术 | 版本 | 用途 |
|---|---|---|
| Node.js | - | 运行时 |
| TypeScript | ^5.3.3 | 类型安全 |
| tsx | ^4.7.0 | TypeScript 执行器 |
| Express | ^4.18.2 | HTTP 服务 |
| ws | ^8.16.0 | WebSocket 通信 |
| uuid | ^9.0.0 | 唯一 ID 生成 |

### AI 引擎

| 组件 | 说明 |
|---|---|
| KataGo | 开源围棋 AI 引擎，支持 GTP 协议 |
| GPU 加速 | 支持 OpenCL（AMD）或 CUDA（NVIDIA） |

## 项目架构

```
katago/
├── server/                        # 后端服务
│   ├── src/
│   │   ├── index.ts               # 服务入口，Express + WebSocket
│   │   └── katago/
│   │       ├── engine.ts          # KataGo 引擎封装（GTP 协议）
│   │       └── game.ts            # 围棋游戏逻辑（落子/提子/胜负判定）
│   ├── start.ps1                  # 启动脚本（Windows PowerShell）
│   ├── katago.exe                 # KataGo 可执行文件
│   ├── default_gtp.cfg            # KataGo GTP 配置文件
│   ├── *.bin.gz                   # 神经网络模型文件
│   └── package.json
├── web/                           # 前端应用
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx       # 首页（模式选择）
│   │   │   └── GamePage.tsx       # 对弈页面
│   │   ├── components/
│   │   │   ├── Board.tsx          # 棋盘组件（19×19）
│   │   │   ├── GameInfo.tsx       # 对局信息面板
│   │   │   └── LanguageSwitcher.tsx  # 语言切换（中/英）
│   │   ├── hooks/
│   │   │   └── useGame.ts         # WebSocket 游戏连接 Hook
│   │   ├── i18n/
│   │   │   ├── LanguageContext.tsx # 国际化上下文
│   │   │   └── translations.ts    # 翻译文件
│   │   ├── types/
│   │   │   └── game.ts            # 前端类型定义
│   │   ├── routes.tsx             # 路由配置
│   │   ├── main.tsx               # 应用入口
│   │   └── index.css              # TailwindCSS 全局样式
│   ├── vite.config.ts             # Vite 配置
│   └── package.json
├── shared/                        # 前后端共享代码
│   ├── types/
│   │   └── game.ts                # 共享类型（StoneColor, Position 等）
│   └── constants/
│       └── index.ts               # 棋盘大小、贴目等常量
└── README.md
```

## 通信架构

```
浏览器 (React)                    Node.js 服务端                    KataGo
     │                                │                               │
     │  ws://localhost:3001/ws        │                               │
     │ ◄══════════════════════════════►                               │
     │   WebSocket (JSON 消息)        │    stdin/stdout (GTP 协议)     │
     │                                │ ◄══════════════════════════════►│
     │  { type: "join", ... }         │   "genmove b" → "= Q16"       │
     │  { type: "move", ... }         │                               │
     │  { type: "state", ... }        │                               │
```

### 消息类型

| 类型 | 方向 | 说明 |
|---|---|---|
| `join` | 客户端→服务端 | 加入/创建对局，参数 `mode` 和 `useKataGo` |
| `move` | 客户端→服务端 | 玩家落子 |
| `pass` | 客户端→服务端 | 停着 |
| `undo` | 客户端→服务端 | 悔棋 |
| `resign` | 客户端→服务端 | 认输 |
| `new_game` | 客户端→服务端 | 开始新游戏 |
| `analyze` | 客户端→服务端 | 请求 AI 分析当前棋局 |
| `state` | 服务端→客户端 | 推送对局状态 |
| `analysis` | 服务端→客户端 | 推送 AI 分析结果 |
| `error` | 服务端→客户端 | 推送错误信息 |

## 环境要求

- **Node.js** >= 18
- **npm** >= 9
- **KataGo**：OpenCL 版本（AMD GPU）或 CUDA 版本（NVIDIA GPU）
  - 下载地址：https://github.com/lightvector/KataGo/releases
  - 需要将 `katago.exe`、`default_gtp.cfg`、`*.bin.gz` 模型文件放入 `server/` 目录

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd katago

# 安装前端依赖
cd web
npm install

# 安装后端依赖
cd ../server
npm install
```

## 运行

### 启动后端

```bash
cd server
npm run dev
```

或使用 PowerShell 启动脚本：

```powershell
cd server
.\start.ps1
```

后端启动后：
- HTTP 服务：`http://localhost:3001`
- WebSocket：`ws://localhost:3001/ws`
- 自动检测 KataGo 引擎，未检测到则回退至简单随机 AI

### 启动前端

```bash
cd web
npm run dev
```

前端启动后：
- 开发服务器：`http://localhost:5173`
- Vite 已配置将 `/ws` 代理到后端，局域网设备可通过 PC 的 IP 访问

### 同时启动

```bash
# 终端 1：后端
cd server && npm run dev

# 终端 2：前端
cd web && npm run dev
```

浏览器访问 `http://localhost:5173` 即可开始对弈。

## 构建

### 前端构建

```bash
cd web
npm run build      # 输出至 web/dist/
npm run preview    # 预览构建产物
```

### 后端构建

```bash
cd server
npm run build      # 输出至 server/dist/
npm start          # 运行构建产物
```

## 功能特性

### 三种对战模式

| 模式 | 说明 |
|---|---|
| **AI 对战** | 与 KataGo 引擎对弈，支持简单（随机 AI）和专业（KataGo）两种难度 |
| **本地双人** | 两位玩家在同一棋盘上轮流落子对弈 |
| **在线对战** | 发起对局，通过链接邀请他人加入，支持跨设备（PC/手机） |

### 在线对战

- **发起对局**：点击首页"在线对战"，创建一个游戏房间
- **邀请对手**：生成包含游戏 ID 的邀请链接和二维码
- **扫码加入**：手机扫描二维码直接进入对战，无需手动输入链接
- **玩家身份**：界面显示当前玩家执黑/执白，非自己回合时操作按钮自动禁用
- **跨设备访问**：PC 使用局域网 IP 而不是 `localhost` 访问，确保二维码链接在手机上可打开

### AI 终局分析

在线对战结束后，可点击"AI 分析棋局"按钮调用 KataGo 分析：

- **终局比分**：估算终局得分（如 `B+3.5`）
- **胜率分析**：当前局面胜率
- **目差分析**：当前局面目差
- **最佳变化**：KataGo 推荐的最佳后续落子序列
- **超时机制**：5 分钟无结果自动终止，提示重新分析

### 对弈功能

- **19×19 标准围棋棋盘**，贴目 6.5
- **完整对弈流程**：落子、停着、悔棋、认输
- **实时对局状态**：提子数、手数、当前执子方
- **中英文双语**：界面语言一键切换，棋子颜色随语言切换
- **WebSocket 实时通信**：低延迟对弈体验
- **GPU 加速**：支持 OpenCL/CUDA 硬件加速推理

## 在线对战使用指南

1. **PC 端**以局域网 IP 访问（用 `ipconfig` 查看本机 IPv4 地址，如 `http://<你的IP>:5173`），而非 `localhost`
2. 点击首页 **"在线对战"**（紫色按钮）
3. 进入等待页面，显示邀请链接和二维码
4. 将链接或二维码发送给对手
5. 对手打开链接后，游戏自动开始
6. 黑棋先手，双方轮流落子
7. 对局结束后，可点击 **"AI 分析棋局"** 查看 KataGo 分析
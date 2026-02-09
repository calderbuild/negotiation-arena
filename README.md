# 博弈圆桌 (Negotiation Arena)

你的 SecondMe 分身 vs AI 对手，三轮博弈自动达成共识。

**Live Demo:** https://negotiation-table.vercel.app

## 概述

博弈圆桌是一个 A2A (Agent-to-Agent) 谈判应用。用户通过 SecondMe OAuth 登录后，自己的 AI 分身作为甲方，与 LLM 驱动的乙方进行三轮自动谈判，最终生成结构化的共识分析报告。

### 核心流程

```
SecondMe OAuth 登录 → 设定议题和双方立场 → 三轮自动谈判 → 共识报告
```

- **甲方 (Agent A):** SecondMe Chat API 驱动，代表用户立场
- **乙方 (Agent B):** DeepSeek LLM 驱动，扮演谈判对手
- **谈判策略:** 基于 NeurIPS 2024 LLM-Deliberation 论文的渐进式让步框架

## 功能特性

- SecondMe OAuth 一键登录
- 5 个预设谈判场景（年终奖分配、周末聚餐、项目排期等）
- 实时 SSE 流式对话，思考状态可视化
- 三轮渐进式谈判（R1 阐述立场 → R2 渐进让步 → R3 最终方案）
- 结构化共识报告：收敛度评分、协议条款、双方让步、未解决分歧
- Markdown 富文本渲染

## 技术栈

| 模块 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 甲方 Agent | SecondMe Chat API (OAuth SSE) |
| 乙方 Agent | DeepSeek LLM (OpenAI-compatible) |
| 实时通信 | Server-Sent Events |
| 部署 | Vercel |

## 快速开始

### 前置条件

- Node.js 18+
- SecondMe 开发者账号 ([develop.second.me](https://develop.second.me/))
- LLM API Key (DeepSeek 或兼容 OpenAI 接口的服务)

### 安装

```bash
cd negotiation-table
npm install
```

### 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
LLM_API_KEY=your-llm-api-key
LLM_BASE_URL=https://newapi.deepwisdom.ai/v1   # 可选
LLM_MODEL=deepseek-chat                         # 可选
```

### 运行

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth 登录/回调/登出/用户信息
│   │   ├── instances/     # SecondMe 实例列表代理
│   │   └── negotiate/     # 创建谈判 + SSE 流
│   ├── negotiate/
│   │   ├── new/           # 创建谈判页
│   │   └── [id]/          # 谈判实时对话页
│   └── page.tsx           # 首页
├── components/            # ChatBubble, ResultCard, MarkdownContent
└── lib/
    ├── auth.ts            # SecondMe OAuth
    ├── negotiation.ts     # 谈判引擎（3 轮对话 + 共识摘要）
    ├── secondme.ts        # SecondMe API 客户端
    ├── llm.ts             # LLM 客户端
    ├── api.ts             # 前端 HTTP/SSE 客户端
    └── types.ts           # TypeScript 类型定义
```

## 架构设计

### 谈判引擎

每轮谈判为两个 Agent 各发言一次，共 3 轮 6 条消息。系统提示词包含轮次策略：

- **第 1 轮:** 阐述核心立场，释放合作信号
- **第 2 轮:** 渐进让步，明确交换条件
- **第 3 轮:** 提出最终方案，超出可接受范围直接同意

立场文本使用 `---BEGIN POSITION---` / `---END POSITION---` 包裹，防止 prompt 注入。

### Serverless 适配

Vercel serverless 函数不共享内存。创建谈判时，session 配置通过 `sessionStorage` 持久化到客户端，stream 请求以 POST body 携带配置，服务端通过 `restoreSession()` 重建。

### SSE 事件协议

| 事件 | 说明 |
|------|------|
| `session_info` | 谈判元信息（议题） |
| `status` | Agent 思考状态 |
| `message` | 完整的一轮发言 |
| `summary` | 结构化共识分析 JSON |
| `done` | 谈判结束 |
| `error` | 错误信息 |

## 许可

MIT

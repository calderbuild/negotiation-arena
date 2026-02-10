---
title: Hackathon Final Optimization
type: feat
date: 2026-02-10
---

# 黑客松最终优化方案

## 背景

项目已部署到 https://negotiation-table.vercel.app，核心功能完整。距提交截止（2月12日 24:00）约 2 天。

评审标准：

| 维度 | 权重 | 当前状态 | 差距 |
|------|------|---------|------|
| A2A 场景价值 | 30% | Agent A 用 SecondMe OAuth，Agent B 用 DeepSeek LLM | Agent B 不是 Personal Agent |
| 创新度 | 20% | 谈判场景 + NeurIPS 框架 + 结构化共识 | 尚可 |
| 完成度 | 20% | SSE 流式、5 预设场景、结果卡片 | 标题英文、无 OG、无分享 |
| 用户选择 | 30% | 无传播机制 | 无分享 = 无用户增长 |

入围门槛：OAuth 用户数前 10 进决赛。

## 变更清单

### Task 1: Agent B 支持 SecondMe 公共实例

让 Agent B 也能用 SecondMe 实例，两边都是 SecondMe agent = 真正 A2A。

#### 1a. 创建页增加实例选择器

**文件：** `src/app/negotiate/new/page.tsx`

当前 Agent B 部分是固定的名称输入框 + 立场输入框。改为：
- 在乙方区域顶部加入 `InstancePicker` 组件（已存在，`color="emerald"`）
- 用户可以从公共实例列表选择一个 SecondMe 分身作为对手
- 选择后 `instance_b_id` 设为实际 instance ID，`instance_b_name` 设为实例名
- 保留"AI 对手"默认选项：如果用户不选实例，`instance_b_id` 保持 `"llm-agent"`
- 预设场景仍默认用 LLM（`instance_b_id: "llm-agent"`），不影响现有体验

具体改动：
```tsx
// 新增 state
const [instanceBId, setInstanceBId] = useState("llm-agent");

// InstancePicker 放在乙方区域，替换当前的名称输入
<InstancePicker
  label="选择对手"
  color="emerald"
  selectedId={instanceBId}
  selectedName={instanceBName}
  onSelect={(id, name) => {
    setInstanceBId(id);
    setInstanceBName(name);
  }}
/>

// handleSubmit 中用 instanceBId 替代硬编码的 "llm-agent"
instance_b_id: instanceBId || "llm-agent",
```

验收：创建页能看到公共实例列表，选择后 instance_b_id 是真实 ID。

#### 1b. 谈判引擎支持 SecondMe 实例作为 Agent B

**文件：** `src/lib/negotiation.ts`

当前 Agent B 固定走 `callWithRetryMultiTurn(messagesB)`（DeepSeek LLM）。

改动：在 Agent B 发言部分，判断 `session.instance_b_id`：
- 如果是 `"llm-agent"` → 走现有 LLM 逻辑（不变）
- 否则 → 调 `chatWithInstance(session.instance_b_id, sysB, combinedMessage)`，失败 fallback 到 LLM

`chatWithInstance()` 不支持多轮，和 Agent A 的 SecondMe Chat API 限制一样。解法一致：把历史对话摘要拼到 message 里。

```typescript
// Agent B speaks
if (session.instance_b_id !== "llm-agent") {
  // SecondMe public instance -- single-turn, condense history into message
  const combinedMessage = historyB.length > 0
    ? `[之前的对话摘要]\n${historyB.map((m) => `${m.role === "user" ? "指示" : "我的回复"}: ${m.content}`).join("\n")}\n\n[本轮指示]\n${userMsgB}`
    : userMsgB;
  try {
    lastResponseB = await chatWithInstance(session.instance_b_id, sysB, combinedMessage);
  } catch (err) {
    console.warn("SecondMe instance failed for Agent B, falling back to LLM:", err);
    lastResponseB = await callWithRetryMultiTurn(messagesB);
  }
} else {
  lastResponseB = await callWithRetryMultiTurn(messagesB);
}
```

需要在文件顶部从 `./secondme` 导入 `chatWithInstance`（当前未导入）。

验收：选择 SecondMe 实例作为 Agent B 后，谈判能正常完成；实例不可用时自动 fallback 到 LLM。

#### 1c. 超时调整

**文件：** `src/lib/secondme.ts`

当前 `chatWithInstance()` 的 `CALL_TIMEOUT_MS` 是 15 秒。公共实例可能比较慢，改为 20 秒（和 `actWithSecondMe` 一致）。

### Task 2: OG Meta 标签 + 品牌化

#### 2a. 页面 Metadata

**文件：** `src/app/layout.tsx`

当前：
```typescript
export const metadata: Metadata = {
  title: "AI Negotiation Table",
  description: "Let your Second Me AI negotiate for you",
};
```

改为：
```typescript
export const metadata: Metadata = {
  title: "博弈圆桌 - AI 代理人谈判",
  description: "你的 SecondMe 分身 vs AI 对手，三轮博弈自动达成共识。年终奖怎么分？聚餐去哪吃？让 AI 替你谈！",
  metadataBase: new URL("https://negotiation-table.vercel.app"),
  openGraph: {
    title: "博弈圆桌 - AI 代理人谈判",
    description: "你的 SecondMe 分身 vs AI 对手，三轮博弈自动达成共识",
    url: "https://negotiation-table.vercel.app",
    siteName: "博弈圆桌",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "博弈圆桌 - AI 代理人谈判",
    description: "你的 SecondMe 分身 vs AI 对手，三轮博弈自动达成共识",
    images: ["/og-image.png"],
  },
};
```

验收：`<head>` 中包含 `og:title`, `og:image`, `twitter:card` 等标签。

#### 2b. OG 封面图

**文件：** `public/og-image.png`

方案：用 Playwright 对首页截图裁剪为 1200x630，或用简单 HTML 页面渲染后截图。

内容：深色背景 + "博弈圆桌" 大标题 + "AI 代理人谈判" + VS 元素 + "Powered by Second Me"。

验收：图片存在且尺寸正确。

### Task 3: 分享功能

**文件：** `src/app/negotiate/[id]/page.tsx`

在谈判完成后的按钮区域（"再来一局" 旁边）加一个"分享"按钮：

```tsx
<button
  onClick={() => {
    const text = `我的 AI 分身刚完成了一场谈判！共识度 ${summary?.convergence_score ?? "?"}%\n来试试你的 AI 谈判 → https://negotiation-table.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      // 显示 "已复制" 提示（用临时 state）
    });
  }}
  className="..."
>
  分享结果
</button>
```

需要一个 `copied` state 控制"已复制"提示，2 秒后消失。

验收：点击"分享结果" -> 剪贴板有文案 -> 按钮短暂显示"已复制"。

### Task 4: 移动端检查

**文件：** 多个页面和组件

用 Playwright 在 375px 宽度下截图检查：
- 首页：CTA 按钮、VS 元素、统计数字
- 创建页：表单、预设按钮、InstancePicker
- 谈判页：气泡、思考指示器、结果卡片

已知可能问题：
- 首页标题 `text-6xl` 在小屏幕可能太大
- InstancePicker 下拉框可能文字截断
- 结果卡片 grid 在窄屏需要 `grid-cols-1`

验收：375px 宽度下所有页面正常可用。

### Task 5: Favicon

**文件：** `public/favicon.svg` 或 `src/app/icon.svg`

Next.js App Router 支持 `src/app/icon.svg` 自动作为 favicon。简单做一个：
- 深色圆角正方形背景 + "VS" 文字（amber 色）
- 或用 SVG 做两个对话气泡图标

验收：浏览器标签页显示自定义图标。

## 实施顺序

1. Task 2a: Meta 标签（最快，改一个文件）
2. Task 2b: OG 图（截图生成）
3. Task 3: 分享按钮
4. Task 1a: 创建页加 InstancePicker
5. Task 1b: 谈判引擎支持 SecondMe 实例
6. Task 1c: 超时调整
7. Task 5: Favicon
8. Task 4: 移动端检查（最后做，前面改完再检查）

## 风险

| 风险 | 应对 |
|------|------|
| 公共实例响应慢或不稳定 | chatWithInstance 失败后 fallback 到 LLM |
| 公共实例列表为空 | InstancePicker 有 manual mode 可手填 ID，且默认仍是 LLM |
| OG 图片缓存 | 部署后微信缓存可能延迟，用调试工具刷新 |
| Vercel 60s 超时 | SecondMe 实例 + SecondMe OAuth 同时请求可能更慢，但 15-20s 超时控制了单次调用 |

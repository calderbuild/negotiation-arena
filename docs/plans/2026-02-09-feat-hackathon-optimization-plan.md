---
title: "feat: Hackathon Full Optimization"
type: feat
date: 2026-02-09
---

# 黑客松全面优化方案

## 背景

评审标准：
- A2A 场景价值 30% — Agent 间自主交互，非单 Agent 工具
- 创新度 20% — 场景选择和玩法是否新颖
- 完成度 20% — 产品可用、体验流畅、Demo 跑得通
- 用户选择 30% — OAuth 授权用户数

截止时间：2月12日 24:00。必须提供可访问的线上 Demo。

## 目标

修复已知 bug，实施已规划的 UX 优化，部署上线。按优先级排列：P0 是"不做就废"，P1 是"做了加分"，P2 是"锦上添花"。

---

## P0: 必须修复 — OAuth 流程 Bug

### 问题 1: OAuth 授权 URL 错误

**现状**：`auth.ts` 使用 `https://app.mindos.com/gate/lab/oauth/authorize`
**正确值**（来自官方 Skills 文档）：`https://go.second.me/oauth/`

这是致命 bug。当前 OAuth 登录根本无法工作。

**文件**：`src/lib/auth.ts`
**改动**：`getLoginUrl()` 中的 URL 从 `${SECONDME_BASE}/oauth/authorize` 改为 `https://go.second.me/oauth/`

### 问题 2: 用户信息字段映射错误

**现状**：`fetchUserInfo()` 用 `data.avatar ?? data.profile_image`
**正确值**（来自官方参考）：字段名是 `avatarUrl`，响应格式 `{ code: 0, data: { email, name, avatarUrl, route } }`

**文件**：`src/lib/auth.ts`
**改动**：
```typescript
// 修正字段映射
const data = json.data ?? json;
return {
  userId: data.user_id ?? data.id ?? "",
  name: data.name ?? data.username ?? "User",
  avatar: data.avatarUrl ?? data.avatar ?? "",
  bio: data.bio ?? data.description ?? "",
};
```

### 问题 3: State 验证在 WebView 中会失败

**现状**：严格验证 state，不匹配就 redirect 到 error
**官方建议**：WebView 环境下（微信等）cookie 不共享，state 验证会失败

**文件**：`src/app/api/auth/callback/route.ts`
**改动**：state 不匹配时记录警告但继续处理

```typescript
if (savedState !== state) {
  console.warn("OAuth state mismatch — possibly cross-WebView scenario");
  // 继续处理，不阻止登录
}
```

### 问题 4: Token Exchange 响应格式未处理

**现状**：直接 `res.json()` 解构 `access_token`
**正确格式**：SecondMe 统一响应 `{ code: 0, data: { access_token, refresh_token, expires_in } }`

**文件**：`src/lib/auth.ts`
**改动**：`exchangeCode()` 返回 `json.data ?? json`

---

## P0: 必须做 — 部署

### Vercel 部署

**文件**：无新建，用 Vercel CLI 或 Git 推送
**步骤**：
1. 初始化 git repo（当前不是 git repo）
2. `vercel deploy` 或推到 GitHub 后连接 Vercel
3. 在 Vercel 环境变量设置 5 个 env vars
4. 在 SecondMe 开发者平台添加生产域名的 redirect_uri：`https://<domain>/api/auth/callback`
5. 提交 Demo 链接到 `hackathon.second.me`

**风险**：redirect_uri 不匹配会导致 OAuth 失败。必须在部署后立即测试登录流程。

---

## P1: 评分加分 — 实施 "Honest Results + Rich Presets" 计划

这是已有计划（`docs/plans/2026-02-08`），实施可显著提升"完成度"和"A2A 场景价值"两项评分。

### 变更 1: 5 个预设场景 + 自动填充身份

**文件**：`src/app/negotiate/new/page.tsx`

增加 2 个新预设（办公室温度、远程办公政策），每个预设自带 `instance_a_name` / `instance_b_name`。点击预设自动填充所有字段。

### 变更 2: 调整 prompt 平衡度

**文件**：`src/lib/negotiation.ts` — `buildSystemPrompt()`

- 删除"达成协议是首要目标"
- 改为"寻求双方都能接受的方案，但不要为了达成协议而突破底线"
- 最后一轮改为"如果可接受就同意，否则坦诚说明分歧"

### 变更 3: 三级结果展示

**文件**：`src/components/ResultCard.tsx`

| convergence_score | 标签 | 颜色 |
|---|---|---|
| >= 70 且 consensus | "达成共识" | 绿色 |
| >= 50 且 !consensus | "接近共识" | 蓝色 |
| < 50 | "分歧较大" | 琥珀色 |

### 变更 4: 摘要 prompt 中性化

**文件**：`src/lib/negotiation.ts` — `generateSummary()`

- 删除"倾向于发现共同点"
- 改为"客观分析，既识别共同点也如实反映分歧"
- 增加 convergence_score 区间定义（90-100 / 70-89 / 50-69 / 30-49 / 0-29）

---

## P1: 评分加分 — 用 Act API 做结构化分析

SecondMe 提供独立的 Act API (`/api/secondme/act/stream`)，可以约束输出为合法 JSON。

**价值**：
- 展示更深度的 SecondMe API 集成（加分项）
- 比通用 LLM 生成 JSON 更可靠（不会出现 markdown 包裹）
- 评委可以看到我们用了 SecondMe 特有的 Act 能力

**方案**：在 `generateSummary()` 中，如果 session 有 accessToken，优先用 Act API 生成摘要，失败则 fallback 到 LLM。

**文件**：`src/lib/secondme.ts` — 新增 `actWithSecondMe()`
**文件**：`src/lib/negotiation.ts` — `generateSummary()` 增加 Act API 路径

```typescript
// secondme.ts 新增
export async function actWithSecondMe(
  accessToken: string,
  message: string,
  actionControl: string,
): Promise<string> { ... }
```

`actionControl` 参数定义输出 JSON 结构，替代当前 LLM prompt 中的 JSON 格式说明。

---

## P2: 锦上添花

### 谈判室 header 显示甲方用户头像

**文件**：`src/app/negotiate/[id]/page.tsx`

在 header 的 Agent A 指示灯旁边显示用户名和头像（通过 SSE `session_info` 事件传递 `instance_a_name`）。

### 首页增加"最近谈判"入口

如果用户已登录且有进行过谈判，在 CTA 下方显示最近 session 的快捷入口。（需在 session store 增加按用户查询）

### 分享功能

谈判完成后，允许用户生成分享图片或链接。这有助于增加 OAuth 用户数（30% 权重）。

---

## 实施顺序

按优先级和依赖关系排列：

1. **修复 OAuth URL + 字段映射 + state 验证 + 响应格式** — `auth.ts`, `callback/route.ts`
2. **5 个预设 + 自动填充** — `negotiate/new/page.tsx`
3. **Prompt 平衡 + 摘要中性化 + 分数区间** — `negotiation.ts`
4. **三级结果展示** — `ResultCard.tsx`
5. **Act API 集成** — `secondme.ts`, `negotiation.ts`
6. **Lint + Build 验证**
7. **Git init + Vercel 部署**
8. **生产环境 redirect_uri 配置 + 端到端测试**
9. **提交到 hackathon.second.me**

## 验收标准

- [ ] OAuth 登录流程完整走通（本地 + 生产）
- [x] 5 个预设场景，覆盖三种结果（共识/接近/分歧）
- [x] 结果展示三级分层
- [x] Act API 用于摘要生成（有 fallback）
- [x] `npm run lint` 0 errors
- [x] `npm run build` 通过
- [ ] Vercel 部署成功，可公网访问
- [ ] 完整登录 → 创建谈判 → 完成谈判 → 查看结果流程在生产环境跑通

## 风险

| 风险 | 应对 |
|------|------|
| OAuth URL 仍然不对 | 部署后立即测试，准备手动检查 network tab |
| Act API 不支持当前 scope | fallback 到 LLM，功能不受影响 |
| Vercel 冷启动导致 SSE 超时 | 考虑设置 `maxDuration` 或用 Edge Runtime |
| 远程办公场景 prompt 调整后所有场景都不达成 | 年终奖 ZOPA 足够大，靠立场本身兼容性保证 |

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createNegotiation } from "@/lib/api";

interface UserInfo {
  name: string;
  avatar: string;
}

const PRESETS = [
  {
    label: "年终奖分配",
    topic: "年终奖金如何在研发和市场部门之间分配",
    position_a: "研发部门贡献了核心产品，应拿 60% 奖金。底线不低于 50%，可以在其他福利上灵活协商。",
    position_b: "市场部门带来了所有客户，应拿 50% 奖金。底线不低于 40%，可以在其他福利上灵活协商。",
    red_line_a: "研发部门占比不低于 50%",
    red_line_b: "市场部门占比不低于 35%",
    instance_b_name: "市场部经理",
  },
  {
    label: "周末聚餐",
    topic: "周末团队聚餐去哪里吃",
    position_a: "偏好日料，预算人均 150 左右。也可以接受其他菜系，只要环境好、食材新鲜。",
    position_b: "偏好火锅，人均 200 也可以。可以接受其他菜系，但希望不要太远（3公里以内）。",
    red_line_a: "人均不超过 200 元",
    red_line_b: "距离公司不超过 30 分钟",
    instance_b_name: "组织委员",
  },
  {
    label: "项目排期",
    topic: "新功能的开发排期如何安排",
    position_a: "希望后端先做一周，前端第二周开始。但可以灵活协商，底线是后端至少先做 2 天准备接口。",
    position_b: "希望前端和后端尽量并行开发。可以接受后端先启动 1-2 天，但前端不能等太久。",
    red_line_a: "后端 API 必须在前端开发前完成",
    red_line_b: "总工期不超过 8 周",
    instance_b_name: "前端负责人",
  },
  {
    label: "办公室温度",
    topic: "办公室空调温度设置",
    position_a: "觉得 22 度最合适，太热容易犯困。底线是不超过 24 度，可以接受分区调温方案。",
    position_b: "觉得 26 度合适，太冷容易感冒。底线不低于 24 度，可以接受多穿衣但不想一直吹冷风。",
    red_line_a: "温度不高于 24 度",
    red_line_b: "温度不低于 24 度",
    instance_b_name: "行政主管",
  },
  {
    label: "远程办公",
    topic: "是否应该推行每周两天远程办公政策",
    position_a: "强烈支持远程办公，效率更高、通勤时间省下来可以多做事。希望每周至少 3 天远程。底线是 2 天。",
    position_b: "反对大面积远程办公，线下沟通效率和团队凝聚力无法替代。最多接受每周 1 天远程。底线是完全不能远程或最多 1 天。",
    red_line_a: "每周至少 2 天远程",
    red_line_b: "每周至少 3 天到岗",
    instance_b_name: "部门总监",
  },
];

export default function NewNegotiationPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [positionA, setPositionA] = useState("");
  const [instanceBName, setInstanceBName] = useState("AI 对手");
  const [positionB, setPositionB] = useState("");
  const [redLineA, setRedLineA] = useState("");
  const [redLineB, setRedLineB] = useState("");
  const [showRedLines, setShowRedLines] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.logged_in) {
          setUser(data.user);
        } else {
          // Not logged in -- redirect to login
          window.location.href = "/api/auth/login";
        }
      })
      .catch(() => {
        window.location.href = "/api/auth/login";
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const applyPreset = (preset: (typeof PRESETS)[number], idx: number) => {
    setTopic(preset.topic);
    setPositionA(preset.position_a);
    setPositionB(preset.position_b);
    setRedLineA(preset.red_line_a);
    setRedLineB(preset.red_line_b);
    setInstanceBName(preset.instance_b_name);
    setActivePreset(idx);
    setShowRedLines(true);
  };

  const canSubmit =
    topic.trim() &&
    positionA.trim() &&
    positionB.trim() &&
    !submitting &&
    !!user;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const sessionId = await createNegotiation({
        topic: topic.trim(),
        instance_a_id: "secondme-oauth",
        instance_a_name: user!.name,
        position_a: positionA.trim(),
        instance_b_id: "llm-agent",
        instance_b_name: instanceBName.trim() || "AI 对手",
        position_b: positionB.trim(),
        red_line_a: redLineA.trim() || undefined,
        red_line_b: redLineB.trim() || undefined,
      });
      router.push(`/negotiate/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create negotiation");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="noise min-h-screen relative flex items-center justify-center">
        <div className="grid-bg absolute inset-0" />
        <div className="relative z-10 flex items-center gap-2 text-zinc-500 font-mono text-sm">
          <span className="flex gap-1">
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </span>
          LOADING
        </div>
      </main>
    );
  }

  return (
    <main className="noise min-h-screen relative">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="fade-up fade-up-1">
            <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono hover:text-zinc-400 transition-colors">
              &larr; 返回首页
            </Link>
            <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              创建谈判
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              你的 Second Me 分身 vs AI 对手，三轮博弈达成共识。
            </p>
          </div>

          {/* Preset scenarios */}
          <div className="fade-up fade-up-2 space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              快速场景
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p, idx)}
                  className={`px-5 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                    activePreset === idx
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-200 glow-gold"
                      : "bg-zinc-900/50 hover:bg-zinc-800/70 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="fade-up fade-up-2 space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
              谈判议题
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setActivePreset(null); }}
              placeholder="例如：年终奖金如何分配"
              maxLength={200}
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 transition-colors hover:border-zinc-700"
            />
          </div>

          {/* Agent A and B */}
          <div className="fade-up fade-up-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Agent A - logged-in user's SecondMe */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg" />
                  ) : (
                    <span className="text-sm font-bold text-blue-400">A</span>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-300">
                    {user?.name ?? "甲方"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
                    <span className="text-[10px] text-blue-500/50 font-mono">SecondMe 已连接</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-mono">
                  甲方立场（保密）
                </label>
                <textarea
                  value={positionA}
                  onChange={(e) => setPositionA(e.target.value)}
                  placeholder="描述立场、底线和可让步范围..."
                  maxLength={500}
                  className="w-full flex-1 min-h-[120px] bg-blue-950/20 border border-blue-500/15 hover:border-blue-500/30 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 resize-none transition-colors text-sm leading-relaxed"
                />
                <div className="text-right text-[10px] text-zinc-700 font-mono">{positionA.length}/500</div>
              </div>

              {showRedLines && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500/40 font-mono">
                    甲方底线（可选）
                  </label>
                  <input
                    type="text"
                    value={redLineA}
                    onChange={(e) => setRedLineA(e.target.value)}
                    placeholder="绝不妥协的条件，如：占比不低于 50%"
                    maxLength={200}
                    className="w-full bg-blue-950/10 border border-blue-500/10 hover:border-blue-500/25 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Agent B - LLM */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-400">B</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-300">乙方 AI 对手</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                    <span className="text-[10px] text-emerald-500/40 font-mono">LLM 驱动</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                  对手名称
                </label>
                <input
                  type="text"
                  value={instanceBName}
                  onChange={(e) => setInstanceBName(e.target.value)}
                  placeholder="AI 对手"
                  className="w-full bg-emerald-950/10 border border-emerald-500/15 hover:border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 transition-colors"
                />
              </div>

              <div className="flex flex-col flex-1 gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-mono">
                  乙方立场（保密）
                </label>
                <textarea
                  value={positionB}
                  onChange={(e) => setPositionB(e.target.value)}
                  placeholder="描述立场、底线和可让步范围..."
                  maxLength={500}
                  className="w-full flex-1 min-h-[120px] bg-emerald-950/20 border border-emerald-500/15 hover:border-emerald-500/30 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 resize-none transition-colors text-sm leading-relaxed"
                />
                <div className="text-right text-[10px] text-zinc-700 font-mono">{positionB.length}/500</div>
              </div>

              {showRedLines && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/40 font-mono">
                    乙方底线（可选）
                  </label>
                  <input
                    type="text"
                    value={redLineB}
                    onChange={(e) => setRedLineB(e.target.value)}
                    placeholder="绝不妥协的条件，如：总工期不超过 8 周"
                    maxLength={200}
                    className="w-full bg-emerald-950/10 border border-emerald-500/10 hover:border-emerald-500/25 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Red line toggle */}
          {!showRedLines && (
            <div className="fade-up">
              <button
                onClick={() => setShowRedLines(true)}
                className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono hover:text-zinc-400 transition-colors"
              >
                + 设置底线条件（高级）
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="fade-up fade-up-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                canSubmit
                  ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 glow-gold cursor-pointer"
                  : "bg-zinc-900/50 border border-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="flex gap-1">
                    <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </span>
                  创建中
                </span>
              ) : "开始谈判"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

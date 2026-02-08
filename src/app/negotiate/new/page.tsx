"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InstancePicker from "@/components/InstancePicker";
import { createNegotiation } from "@/lib/api";

const PRESETS = [
  {
    label: "年终奖分配",
    topic: "年终奖金如何在研发和市场部门之间分配",
    position_a: "研发部门贡献了核心产品，应拿 60% 奖金。底线不低于 55%。",
    position_b: "市场部门带来了所有客户，应拿 50% 奖金。底线不低于 40%。",
  },
  {
    label: "周末聚餐",
    topic: "周末团队聚餐去哪里吃",
    position_a: "想吃日料，预算控制在人均 150 以内。底线是不吃火锅（上火）。",
    position_b: "想吃火锅，人均 200 也可以。底线是不去太远的地方（3公里以内）。",
  },
  {
    label: "项目排期",
    topic: "新功能的开发排期如何安排",
    position_a: "后端先做一周，前端第二周开始。底线是后端至少先做 3 天。",
    position_b: "前端和后端应该并行开发，加快进度。底线是前端不能等超过 2 天。",
  },
];

export default function NewNegotiationPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [instanceAId, setInstanceAId] = useState("");
  const [instanceAName, setInstanceAName] = useState("");
  const [positionA, setPositionA] = useState("");
  const [instanceBId, setInstanceBId] = useState("");
  const [instanceBName, setInstanceBName] = useState("");
  const [positionB, setPositionB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const applyPreset = (preset: (typeof PRESETS)[number], idx: number) => {
    setTopic(preset.topic);
    setPositionA(preset.position_a);
    setPositionB(preset.position_b);
    setActivePreset(idx);
  };

  const canSubmit =
    topic.trim() &&
    instanceAId.trim() &&
    instanceBId.trim() &&
    positionA.trim() &&
    positionB.trim() &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const sessionId = await createNegotiation({
        topic: topic.trim(),
        instance_a_id: instanceAId.trim(),
        instance_a_name: instanceAName.trim() || "Agent A",
        position_a: positionA.trim(),
        instance_b_id: instanceBId.trim(),
        instance_b_name: instanceBName.trim() || "Agent B",
        position_b: positionB.trim(),
      });
      router.push(`/negotiate/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create negotiation");
      setSubmitting(false);
    }
  };

  return (
    <main className="noise min-h-screen relative">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="fade-up fade-up-1">
            <a href="/" className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono hover:text-zinc-400 transition-colors">
              &larr; 返回首页
            </a>
            <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              创建谈判
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              选择两个 Second Me 实例，设定各自的立场与底线。
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
          <div className="fade-up fade-up-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Agent A */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-400">A</span>
                </div>
                <span className="text-sm font-medium text-blue-300">甲方代理人</span>
              </div>
              <InstancePicker
                label="选择 AI 身份"
                color="blue"
                selectedId={instanceAId}
                selectedName={instanceAName}
                onSelect={(id, name) => {
                  setInstanceAId(id);
                  setInstanceAName(name);
                }}
              />
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-mono">
                  甲方立场（保密）
                </label>
                <textarea
                  value={positionA}
                  onChange={(e) => setPositionA(e.target.value)}
                  placeholder="描述立场、底线和可让步范围..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-blue-950/20 border border-blue-500/15 hover:border-blue-500/30 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 resize-none transition-colors text-sm leading-relaxed"
                />
                <div className="text-right text-[10px] text-zinc-700 font-mono">{positionA.length}/500</div>
              </div>
            </div>

            {/* Agent B */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-400">B</span>
                </div>
                <span className="text-sm font-medium text-emerald-300">乙方代理人</span>
              </div>
              <InstancePicker
                label="选择 AI 身份"
                color="emerald"
                selectedId={instanceBId}
                selectedName={instanceBName}
                onSelect={(id, name) => {
                  setInstanceBId(id);
                  setInstanceBName(name);
                }}
              />
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-mono">
                  乙方立场（保密）
                </label>
                <textarea
                  value={positionB}
                  onChange={(e) => setPositionB(e.target.value)}
                  placeholder="描述立场、底线和可让步范围..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-emerald-950/20 border border-emerald-500/15 hover:border-emerald-500/30 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 resize-none transition-colors text-sm leading-relaxed"
                />
                <div className="text-right text-[10px] text-zinc-700 font-mono">{positionB.length}/500</div>
              </div>
            </div>
          </div>

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

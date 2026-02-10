"use client";

import { NegotiationSummary, NegotiationStyleAnalysis } from "@/lib/types";
import MarkdownContent from "./MarkdownContent";

function StyleCard({ label, style, color }: {
  label: string;
  style: NegotiationStyleAnalysis;
  color: "blue" | "emerald";
}) {
  const barBg = color === "blue" ? "bg-blue-500" : "bg-emerald-500";
  const labelColor = color === "blue" ? "text-blue-300" : "text-emerald-300";
  const descColor = color === "blue" ? "text-blue-500/60" : "text-emerald-500/60";

  return (
    <div className={`rounded-xl ${color === "blue" ? "bg-blue-950/20 border-blue-500/10" : "bg-emerald-950/20 border-emerald-500/10"} border p-4`}>
      <h4 className={`text-[10px] uppercase tracking-[0.2em] ${descColor} font-mono mb-2`}>
        {label}
      </h4>
      <div className={`text-lg font-bold ${labelColor} mb-1`}>{style.label}</div>
      {style.description && (
        <p className="text-xs text-zinc-500 mb-3">{style.description}</p>
      )}
      {typeof style.cooperativeness === "number" && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-600 font-mono">合作度</span>
            <span className="text-[10px] text-zinc-500 font-mono">{style.cooperativeness}</span>
          </div>
          <div className="h-1 bg-zinc-800/60 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barBg}/60`} style={{ width: `${style.cooperativeness}%` }} />
          </div>
        </div>
      )}
      {typeof style.flexibility === "number" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-600 font-mono">灵活度</span>
            <span className="text-[10px] text-zinc-500 font-mono">{style.flexibility}</span>
          </div>
          <div className="h-1 bg-zinc-800/60 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barBg}/60`} style={{ width: `${style.flexibility}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultCard({ summary }: { summary: NegotiationSummary }) {
  const reached = summary.consensus_reached;
  const score = summary.convergence_score ?? 0;

  // Three-tier result classification
  const tier = score >= 70 && reached
    ? "consensus"
    : score >= 50
      ? "near"
      : "divergent";

  const tierConfig = {
    consensus: {
      label: "达成共识",
      badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      dotColor: "bg-emerald-400",
      cardBorder: "border-emerald-500/15 bg-emerald-500/[0.03] glow-emerald",
      scoreBar: "bg-emerald-500",
      scoreText: "text-emerald-400",
    },
    near: {
      label: "接近共识",
      badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      dotColor: "bg-blue-400",
      cardBorder: "border-blue-500/15 bg-blue-500/[0.03]",
      scoreBar: "bg-blue-500",
      scoreText: "text-blue-400",
    },
    divergent: {
      label: "分歧较大",
      badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      dotColor: "bg-amber-400",
      cardBorder: "border-amber-500/15 bg-amber-500/[0.03] glow-gold",
      scoreBar: "bg-amber-500",
      scoreText: "text-amber-400",
    },
  };

  const config = tierConfig[tier];

  const hasStyles = summary.party_a_style?.label || summary.party_b_style?.label;
  const hasTurningPoints = summary.turning_points && summary.turning_points.length > 0;
  const hasSatisfaction = typeof summary.satisfaction_a === "number" || typeof summary.satisfaction_b === "number";
  const hasRedLineAnalysis = summary.red_line_analysis;

  return (
    <div className="fade-up mt-8">
      {/* Status badge */}
      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${config.badgeBg}`}
        >
          <div className={`w-2 h-2 rounded-full result-glow ${config.dotColor}`} />
          {config.label}
        </div>
      </div>

      {/* Card */}
      <div className={`rounded-2xl border p-6 ${config.cardBorder}`}>
        {/* Convergence score */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              共识收敛度
            </span>
            <span className={`text-sm font-mono font-bold ${config.scoreText}`}>
              {score}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${config.scoreBar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Negotiation style analysis */}
        {hasStyles && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {summary.party_a_style?.label && (
              <StyleCard label="甲方风格" style={summary.party_a_style} color="blue" />
            )}
            {summary.party_b_style?.label && (
              <StyleCard label="乙方风格" style={summary.party_b_style} color="emerald" />
            )}
          </div>
        )}

        {/* Satisfaction scores */}
        {hasSatisfaction && (
          <div className="mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
              满意度评估
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {typeof summary.satisfaction_a === "number" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-400/70">甲方</span>
                    <span className="text-xs text-blue-400 font-mono font-bold">{summary.satisfaction_a}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500/70 transition-all duration-1000" style={{ width: `${summary.satisfaction_a}%` }} />
                  </div>
                </div>
              )}
              {typeof summary.satisfaction_b === "number" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-400/70">乙方</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">{summary.satisfaction_b}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/70 transition-all duration-1000" style={{ width: `${summary.satisfaction_b}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary text */}
        <div className="text-zinc-300 leading-relaxed mb-6 text-sm">
          <MarkdownContent content={summary.summary_text} />
        </div>

        {/* Key turning points */}
        {hasTurningPoints && (
          <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/40 p-4 mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
              关键转折点
            </h4>
            <div className="space-y-3">
              {summary.turning_points!.map((tp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-0.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${tp.impact === "positive" ? "bg-emerald-400/70" : "bg-red-400/70"}`} />
                    {i < summary.turning_points!.length - 1 && (
                      <div className="w-px h-full min-h-[16px] bg-zinc-800/60 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-zinc-600">
                        R{tp.round} {tp.speaker === "A" ? "甲方" : "乙方"}
                      </span>
                      <span className={`text-[10px] font-mono ${tp.impact === "positive" ? "text-emerald-500/60" : "text-red-500/60"}`}>
                        {tp.impact === "positive" ? "推动共识" : "加剧分歧"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{tp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final proposal */}
        {summary.final_proposal && (
          <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/15 p-4 mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-mono mb-2">
              最终方案
            </h4>
            <div className="text-sm text-zinc-300 leading-relaxed">
              <MarkdownContent content={summary.final_proposal} />
            </div>
          </div>
        )}

        {/* Red line analysis */}
        {hasRedLineAnalysis && (
          <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/40 p-4 mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
              底线分析
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${summary.red_line_analysis!.party_a_maintained ? "text-emerald-400" : "text-red-400"}`}>
                  {summary.red_line_analysis!.party_a_maintained ? "\u2713" : "\u2717"}
                </span>
                <span className="text-sm text-zinc-400">
                  甲方底线{summary.red_line_analysis!.party_a_maintained ? "已守住" : "被突破"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${summary.red_line_analysis!.party_b_maintained ? "text-emerald-400" : "text-red-400"}`}>
                  {summary.red_line_analysis!.party_b_maintained ? "\u2713" : "\u2717"}
                </span>
                <span className="text-sm text-zinc-400">
                  乙方底线{summary.red_line_analysis!.party_b_maintained ? "已守住" : "被突破"}
                </span>
              </div>
            </div>
            {summary.red_line_analysis!.details && (
              <p className="text-xs text-zinc-500 mt-2">{summary.red_line_analysis!.details}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.agreement_terms.length > 0 && (
            <div className="col-span-full rounded-xl bg-zinc-900/40 border border-zinc-800/50 p-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
                协议条款
              </h4>
              <ul className="space-y-2">
                {summary.agreement_terms.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}/50`} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.party_a_concessions.length > 0 && (
            <div className="rounded-xl bg-blue-950/20 border border-blue-500/10 p-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-blue-500/60 font-mono mb-3">
                甲方让步
              </h4>
              <ul className="space-y-2">
                {summary.party_a_concessions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/40 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.party_b_concessions.length > 0 && (
            <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/10 p-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-mono mb-3">
                乙方让步
              </h4>
              <ul className="space-y-2">
                {summary.party_b_concessions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/40 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.unresolved_disputes.length > 0 && (
            <div className="col-span-full rounded-xl bg-amber-950/10 border border-amber-500/10 p-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-mono mb-3">
                未解决分歧
              </h4>
              <ul className="space-y-2">
                {summary.unresolved_disputes.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/40 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

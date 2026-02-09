"use client";

import { NegotiationSummary } from "@/lib/types";

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

        {/* Summary text */}
        <p className="text-zinc-300 leading-relaxed mb-6">{summary.summary_text}</p>

        {/* Final proposal */}
        {summary.final_proposal && (
          <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/15 p-4 mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-mono mb-2">
              最终方案
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">{summary.final_proposal}</p>
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

"use client";

import { NegotiationSummary } from "@/lib/types";

export default function ResultCard({ summary }: { summary: NegotiationSummary }) {
  const reached = summary.consensus_reached;

  return (
    <div className="fade-up mt-8">
      {/* Status badge */}
      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
            reached
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
          }`}
        >
          <div className={`w-2 h-2 rounded-full result-glow ${reached ? "bg-emerald-400" : "bg-amber-400"}`} />
          {reached ? "达成共识" : "未达成共识"}
        </div>
      </div>

      {/* Card */}
      <div
        className={`rounded-2xl border p-6 ${
          reached
            ? "border-emerald-500/15 bg-emerald-500/[0.03] glow-emerald"
            : "border-amber-500/15 bg-amber-500/[0.03] glow-gold"
        }`}
      >
        {/* Summary text */}
        <p className="text-zinc-300 leading-relaxed mb-6">{summary.summary_text}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.agreement_terms.length > 0 && (
            <div className="col-span-full rounded-xl bg-zinc-900/40 border border-zinc-800/50 p-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
                协议条款
              </h4>
              <ul className="space-y-2">
                {summary.agreement_terms.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${reached ? "bg-emerald-500/50" : "bg-amber-500/50"}`} />
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ChatBubble from "@/components/ChatBubble";
import ResultCard from "@/components/ResultCard";
import { fetchNegotiationSummary, streamNegotiation } from "@/lib/api";
import { NegotiationMessage, NegotiationSummary } from "@/lib/types";

export default function NegotiationRoomPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [summary, setSummary] = useState<NegotiationSummary | null>(null);
  const [thinking, setThinking] = useState<{
    speaker: "A" | "B";
    round: number;
  } | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const startedRef = useRef(false);
  const messagesRef = useRef<NegotiationMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastAnimatedIdx, setLastAnimatedIdx] = useState(-1);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, summary]);

  useEffect(() => {
    if (startedRef.current || !id) return;
    startedRef.current = true;

    streamNegotiation(id, {
      onSessionInfo(data) {
        setTopic(data.topic);
      },
      onStatus(data) {
        setThinking({ speaker: data.speaker as "A" | "B", round: data.round });
        if (data.round > 0) setCurrentRound(data.round);
      },
      onMessage(msg) {
        setThinking(null);
        messagesRef.current = [...messagesRef.current, msg];
        setMessages((prev) => {
          setLastAnimatedIdx(prev.length);
          return [...prev, msg];
        });
      },
      onSummary(s) {
        setThinking(null);
        setSummary(s);
      },
      onDone() {
        setThinking(null);
        setDone(true);
        // Fetch summary via separate request (avoids Vercel 60s timeout)
        setSummaryLoading(true);
        fetchNegotiationSummary(id, messagesRef.current)
          .then((s) => setSummary(s))
          .catch((err) => console.warn("Summary fetch failed:", err))
          .finally(() => setSummaryLoading(false));
      },
      onError(err) {
        setThinking(null);
        setError(err);
      },
    });
  }, [id]);

  const progressPercent = done && !summaryLoading
    ? 100
    : done && summaryLoading
      ? 95
      : messages.length > 0
        ? (messages.length / 6) * 90
        : 0;

  return (
    <main className="noise min-h-screen flex flex-col relative">
      <div className="grid-bg absolute inset-0" />

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-zinc-300 truncate">
                {topic || "AI 代理人谈判桌"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Round indicator */}
            {currentRound > 0 && !done && (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((r) => (
                  <div key={r} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    r < currentRound ? "bg-amber-400"
                    : r === currentRound ? "bg-amber-400 animate-pulse scale-125"
                    : "bg-zinc-700"
                  }`} />
                ))}
                <span className="text-xs font-mono text-zinc-500 ml-1">R{currentRound}</span>
              </div>
            )}

            {/* Agent status indicators */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                thinking?.speaker === "A" ? "bg-blue-500/10 border border-blue-500/20" : ""
              }`}>
                <div className={`w-2 h-2 rounded-full transition-all ${
                  thinking?.speaker === "A" ? "bg-blue-400 animate-pulse" : "bg-blue-500/30"
                }`} />
                <span className={`text-[10px] font-mono ${
                  thinking?.speaker === "A" ? "text-blue-400" : "text-zinc-600"
                }`}>A</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                thinking?.speaker === "B" ? "bg-emerald-500/10 border border-emerald-500/20" : ""
              }`}>
                <div className={`w-2 h-2 rounded-full transition-all ${
                  thinking?.speaker === "B" ? "bg-emerald-400 animate-pulse" : "bg-emerald-500/30"
                }`} />
                <span className={`text-[10px] font-mono ${
                  thinking?.speaker === "B" ? "text-emerald-400" : "text-zinc-600"
                }`}>B</span>
              </div>
            </div>

            {done && (
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                DONE
              </span>
            )}
            {error && !done && (
              <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">
                ERROR
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800/50">
          {progressPercent > 0 && (
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && !thinking && !error && (
            <div className="text-center py-24 space-y-5 animate-fade-in">
              <div className="flex justify-center gap-1.5">
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
              </div>
              <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase">
                正在连接代理人
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showRoundDivider = prevMsg && prevMsg.round < msg.round;

            return (
              <div key={msg.id}>
                {showRoundDivider && (
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex-1 h-px bg-zinc-800/60" />
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                      Round {msg.round}
                    </span>
                    <div className="flex-1 h-px bg-zinc-800/60" />
                  </div>
                )}
                <ChatBubble
                  speaker={msg.speaker}
                  speakerName={msg.speaker === "A" ? "甲方" : "乙方"}
                  content={msg.content}
                  round={msg.round}
                  animate={idx === lastAnimatedIdx}
                />
              </div>
            );
          })}

          {/* Thinking indicator */}
          {thinking && (
            <div className={`flex gap-3 ${thinking.speaker === "A" ? "pr-8 md:pr-16" : "pl-8 md:pl-16 flex-row-reverse"} animate-fade-in`}>
              <div className="shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold animate-pulse ${
                  thinking.speaker === "A"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  {thinking.speaker === "A" ? "\u7532" : "\u4e59"}
                </div>
              </div>
              <div className={`rounded-2xl px-4 py-3 border ${
                thinking.speaker === "A"
                  ? "bg-blue-500/[0.04] border-blue-500/10 text-blue-300/60"
                  : "bg-emerald-500/[0.04] border-emerald-500/10 text-emerald-300/60"
              }`}>
                <span className="flex items-center gap-2 text-sm">
                  {thinking.round === 0
                    ? "正在生成摘要"
                    : `${thinking.speaker === "A" ? "甲方" : "乙方"}正在思考`}
                  <span className="flex gap-1">
                    <span className={`thinking-dot w-1.5 h-1.5 rounded-full ${
                      thinking.speaker === "A" ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                    <span className={`thinking-dot w-1.5 h-1.5 rounded-full ${
                      thinking.speaker === "A" ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                    <span className={`thinking-dot w-1.5 h-1.5 rounded-full ${
                      thinking.speaker === "A" ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Summary loading indicator */}
          {summaryLoading && !summary && (
            <div className="flex justify-center py-6 animate-fade-in">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04]">
                <span className="flex gap-1">
                  <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-amber-400" />
                </span>
                <span className="text-sm text-amber-300/60">正在生成共识报告</span>
              </div>
            </div>
          )}

          {summary && (
            <>
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-zinc-800/60" />
                <span className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest">
                  谈判结果
                </span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
              <ResultCard summary={summary} />
            </>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 border border-red-500/15 rounded-xl px-4 py-3 mt-4">
              {error}
            </div>
          )}

          {done && !summaryLoading && (
            <div className="flex justify-center gap-4 mt-10 pb-10 animate-fade-in">
              <Link
                href="/negotiate/new"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-sm font-medium text-amber-200 transition-all duration-200 glow-gold"
              >
                再来一局
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/"
                className="px-7 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-500 hover:text-zinc-400 transition-all duration-200"
              >
                返回首页
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

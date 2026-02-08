"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import ResultCard from "@/components/ResultCard";
import { streamNegotiation } from "@/lib/api";
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
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastAnimatedIdx, setLastAnimatedIdx] = useState(-1);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, summary]);

  useEffect(() => {
    if (started || !id) return;
    setStarted(true);

    streamNegotiation(id, {
      onStatus(data) {
        setThinking({ speaker: data.speaker as "A" | "B", round: data.round });
        if (data.round > 0) setCurrentRound(data.round);
      },
      onMessage(msg) {
        setThinking(null);
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
      },
      onError(err) {
        setThinking(null);
        setError(err);
      },
    });
  }, [id, started]);

  const progressPercent = done
    ? 100
    : thinking?.round === 0
      ? 95
      : messages.length > 0
        ? (messages.length / 6) * 90
        : 0;

  return (
    <main className="noise min-h-screen flex flex-col relative">
      <div className="grid-bg absolute inset-0" />

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <div>
              <h1 className="text-sm font-medium text-zinc-300">AI 代理人谈判桌</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {currentRound > 0 && (
                  <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                    Round {currentRound}/3
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Agent indicators */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                thinking?.speaker === "A" ? "bg-blue-400 animate-pulse" : "bg-blue-500/30"
              }`} />
              <span className="text-[10px] font-mono text-zinc-600">A</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                thinking?.speaker === "B" ? "bg-emerald-400 animate-pulse" : "bg-emerald-500/30"
              }`} />
              <span className="text-[10px] font-mono text-zinc-600">B</span>
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
        <div className="h-px bg-zinc-800">
          {progressPercent > 0 && (
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 progress-animate transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && !thinking && !error && (
            <div className="text-center py-24 space-y-4">
              <div className="flex justify-center gap-1">
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="thinking-dot w-2 h-2 rounded-full bg-amber-500/60" />
              </div>
              <p className="text-sm text-zinc-600 font-mono">CONNECTING</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatBubble
              key={msg.id}
              speaker={msg.speaker}
              speakerName={msg.speaker === "A" ? "甲方" : "乙方"}
              content={msg.content}
              round={msg.round}
              animate={idx === lastAnimatedIdx}
            />
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div
              className={`flex ${thinking.speaker === "A" ? "justify-start" : "justify-end"} ${
                thinking.speaker === "A" ? "animate-slide-left" : "animate-slide-right"
              }`}
            >
              <div
                className={`rounded-2xl px-5 py-3 border ${
                  thinking.speaker === "A"
                    ? "bg-blue-500/[0.04] border-blue-500/10 text-blue-300/70"
                    : "bg-emerald-500/[0.04] border-emerald-500/10 text-emerald-300/70"
                }`}
              >
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

          {summary && <ResultCard summary={summary} />}

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 border border-red-500/15 rounded-xl px-4 py-3 mt-4">
              {error}
            </div>
          )}

          {done && (
            <div className="flex justify-center gap-4 mt-8 pb-8">
              <a
                href="/negotiate/new"
                className="px-6 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-sm text-amber-200 transition-all duration-200"
              >
                新建谈判
              </a>
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-400 transition-all duration-200"
              >
                返回首页
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

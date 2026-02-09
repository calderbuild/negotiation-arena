"use client";

import TypewriterText from "./TypewriterText";

interface ChatBubbleProps {
  speaker: "A" | "B";
  speakerName: string;
  content: string;
  round: number;
  animate?: boolean;
}

export default function ChatBubble({
  speaker,
  speakerName,
  content,
  round,
  animate = false,
}: ChatBubbleProps) {
  const isA = speaker === "A";

  return (
    <div className={`flex gap-3 ${isA ? "pr-12" : "pl-12 flex-row-reverse"} ${
      animate ? (isA ? "animate-slide-left" : "animate-slide-right") : ""
    }`}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
            isA
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {speakerName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className={`flex flex-col ${isA ? "items-start" : "items-end"} min-w-0`}>
        {/* Speaker label */}
        <span className={`text-[10px] font-mono uppercase tracking-wider mb-1.5 px-0.5 ${
          isA ? "text-blue-500/50" : "text-emerald-500/50"
        }`}>
          {speakerName} / R{round}
        </span>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
            isA
              ? "bg-blue-500/[0.08] border-blue-500/15 text-zinc-200 rounded-tl-sm"
              : "bg-emerald-500/[0.08] border-emerald-500/15 text-zinc-200 rounded-tr-sm"
          }`}
        >
          {animate ? <TypewriterText fullText={content} /> : content}
        </div>
      </div>
    </div>
  );
}

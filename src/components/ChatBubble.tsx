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
    <div className={`flex flex-col ${isA ? "items-start" : "items-end"} ${
      animate ? (isA ? "animate-slide-left" : "animate-slide-right") : ""
    }`}>
      {/* Speaker label */}
      <div className={`flex items-center gap-2 mb-1.5 px-1 ${isA ? "" : "flex-row-reverse"}`}>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            isA
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {speakerName.charAt(0).toUpperCase()}
        </div>
        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          {speakerName} / R{round}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
          isA
            ? "bg-blue-500/[0.06] border-blue-500/10 text-zinc-200 rounded-tl-md glow-blue"
            : "bg-emerald-500/[0.06] border-emerald-500/10 text-zinc-200 rounded-tr-md glow-emerald"
        }`}
      >
        {animate ? <TypewriterText fullText={content} /> : content}
      </div>
    </div>
  );
}

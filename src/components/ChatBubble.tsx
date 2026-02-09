"use client";

import { useState, useEffect } from "react";
import MarkdownContent from "./MarkdownContent";

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
  const [showMarkdown, setShowMarkdown] = useState(!animate);

  useEffect(() => {
    if (animate) {
      // Show markdown after a short delay to simulate "appearance"
      const timer = setTimeout(() => setShowMarkdown(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  return (
    <div className={`flex gap-3 ${isA ? "pr-8 md:pr-16" : "pl-8 md:pl-16 flex-row-reverse"} ${
      animate ? "animate-fade-in" : ""
    }`}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
            isA
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {isA ? "\u7532" : "\u4e59"}
        </div>
      </div>

      <div className={`flex flex-col ${isA ? "items-start" : "items-end"} min-w-0 flex-1`}>
        {/* Speaker label */}
        <span className={`text-[10px] font-mono uppercase tracking-wider mb-1.5 px-0.5 ${
          isA ? "text-blue-500/50" : "text-emerald-500/50"
        }`}>
          {speakerName} / R{round}
        </span>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border max-w-full ${
            isA
              ? "bg-blue-500/[0.06] border-blue-500/15 text-zinc-300 rounded-tl-sm"
              : "bg-emerald-500/[0.06] border-emerald-500/15 text-zinc-300 rounded-tr-sm"
          }`}
        >
          {showMarkdown ? <MarkdownContent content={content} /> : (
            <span className="text-zinc-400">...</span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

export default function TypewriterText({
  fullText,
  speed = 20,
}: {
  fullText: string;
  speed?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let i = 0;
    const node = containerRef.current;
    const cursor = cursorRef.current;
    if (!node) return;
    node.textContent = "";
    if (cursor) cursor.style.display = "";

    const timer = setInterval(() => {
      if (i < fullText.length) {
        node.textContent = fullText.slice(0, ++i);
      } else {
        clearInterval(timer);
        if (cursor) cursor.style.display = "none";
      }
    }, speed);

    return () => {
      clearInterval(timer);
      if (cursor) cursor.style.display = "none";
    };
  }, [fullText, speed]);

  return (
    <span>
      <span ref={containerRef} />
      <span ref={cursorRef} className="typewriter-cursor" />
    </span>
  );
}

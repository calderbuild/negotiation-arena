"use client";

import { useEffect, useRef, useState } from "react";

export default function TypewriterText({
  fullText,
  speed = 20,
}: {
  fullText: string;
  speed?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const node = containerRef.current;
    if (!node) return;
    node.textContent = "";
    setDone(false);

    const timer = setInterval(() => {
      if (i < fullText.length) {
        node.textContent = fullText.slice(0, ++i);
      } else {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullText, speed]);

  return (
    <span>
      <span ref={containerRef} />
      {!done && <span className="typewriter-cursor" />}
    </span>
  );
}

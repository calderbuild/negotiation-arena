"use client";

import ReactMarkdown from "react-markdown";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-300 italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 last:mb-0 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 last:mb-0 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-300">{children}</li>
          ),
          h1: ({ children }) => (
            <h4 className="font-semibold text-white mb-1">{children}</h4>
          ),
          h2: ({ children }) => (
            <h4 className="font-semibold text-white mb-1">{children}</h4>
          ),
          h3: ({ children }) => (
            <h4 className="font-semibold text-white mb-1">{children}</h4>
          ),
          h4: ({ children }) => (
            <h4 className="font-semibold text-white mb-1">{children}</h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-400 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-zinc-800/60 px-1.5 py-0.5 rounded text-xs text-zinc-300">
              {children}
            </code>
          ),
          hr: () => <hr className="border-zinc-700/50 my-2" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserInfo {
  name: string;
  avatar: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.logged_in) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="noise min-h-screen relative overflow-hidden">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0" />

      {/* Radial gradient atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,160,32,0.04)_0%,_transparent_40%)]" />

      {/* Top-right user badge */}
      {!loading && user && (
        <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-zinc-300">{user.name}</span>
          </div>
          <a
            href="/api/auth/logout"
            className="text-[10px] text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
          >
            LOGOUT
          </a>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center space-y-10">

          {/* Title block */}
          <div className="fade-up fade-up-1 space-y-4">
            <div className="inline-block mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-mono">
                Second Me A2A Hackathon
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent leading-tight">
              AI 代理人谈判桌
            </h1>
          </div>

          {/* VS confrontation element */}
          <div className="fade-up fade-up-2 flex items-center justify-center gap-8 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 glow-blue flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl" />
                ) : (
                  <span className="text-2xl font-bold text-blue-400">A</span>
                )}
              </div>
              <span className="text-xs text-blue-400/60 font-mono">
                {user ? "你的分身" : "甲方"}
              </span>
            </div>

            <div className="vs-pulse">
              <span className="text-3xl font-black text-amber-500/80 font-mono">VS</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 glow-emerald flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">B</span>
              </div>
              <span className="text-xs text-emerald-400/60 font-mono">AI 对手</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="fade-up fade-up-3 text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">
            让你的 AI 分身替你谈判。
            <br />
            <span className="text-zinc-500">年终奖怎么分？聚餐去哪吃？项目谁先做？</span>
            <br />
            <span className="text-zinc-500">三轮博弈，策略演化，一个共识。</span>
          </p>

          {/* CTA */}
          <div className="fade-up fade-up-4 flex flex-col gap-3 items-center">
            {loading ? (
              <div className="h-14" />
            ) : user ? (
              <Link
                href="/negotiate/new"
                className="group relative inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 font-medium px-10 py-3.5 rounded-xl transition-all duration-300 text-lg glow-gold"
              >
                <span>开始谈判</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <a
                href="/api/auth/login"
                className="group relative inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 font-medium px-10 py-3.5 rounded-xl transition-all duration-300 text-lg glow-gold"
              >
                <span>用 Second Me 登录</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="fade-up fade-up-5 flex items-center justify-center gap-12 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-blue-400">3</div>
              <div className="text-[11px] text-zinc-600 mt-1 uppercase tracking-wider">轮谈判</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-emerald-400">2</div>
              <div className="text-[11px] text-zinc-600 mt-1 uppercase tracking-wider">AI 代理人</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-amber-400">1</div>
              <div className="text-[11px] text-zinc-600 mt-1 uppercase tracking-wider">共识结果</div>
            </div>
          </div>
        </div>

        {/* Bottom credit */}
        <div className="absolute bottom-6 text-[10px] text-zinc-700 font-mono tracking-wider">
          POWERED BY SECOND ME
        </div>
      </div>
    </main>
  );
}

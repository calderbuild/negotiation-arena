import Link from "next/link";

export default function HomePage() {
  return (
    <main className="noise min-h-screen relative overflow-hidden">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0" />

      {/* Radial gradient atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,160,32,0.04)_0%,_transparent_40%)]" />

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
                <span className="text-2xl font-bold text-blue-400">A</span>
              </div>
              <span className="text-xs text-blue-400/60 font-mono">甲方</span>
            </div>

            <div className="vs-pulse">
              <span className="text-3xl font-black text-amber-500/80 font-mono">VS</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 glow-emerald flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">B</span>
              </div>
              <span className="text-xs text-emerald-400/60 font-mono">乙方</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="fade-up fade-up-3 text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">
            让你的 AI 身份替你谈判。
            <br />
            <span className="text-zinc-500">三轮博弈，策略演化，一个共识。</span>
          </p>

          {/* CTA */}
          <div className="fade-up fade-up-4 flex flex-col gap-3 items-center">
            <Link
              href="/negotiate/new"
              className="group relative inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 font-medium px-10 py-3.5 rounded-xl transition-all duration-300 text-lg glow-gold"
            >
              <span>开始谈判</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
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

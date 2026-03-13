export function StarButton({ starCount }: { starCount: number | null }) {
  return (
    <div className="relative group">
      <a
        href="https://github.com/lorenzoedoardofrancesco/42cv"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-yellow-500/50 text-neutral-300 hover:text-yellow-400 text-xs font-medium transition-all shadow-lg"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Star on GitHub
        {starCount !== null && <span className="text-neutral-500">{starCount}</span>}
      </a>
      <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
        42cv is free and open source. A star helps others discover it and motivates new features!
      </div>
    </div>
  );
}

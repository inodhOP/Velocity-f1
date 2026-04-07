'use client';

const INSTAGRAM_URL = 'https://instagram.com/inodh.rnwr';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[rgba(8,8,12,0.65)] px-4 py-8 text-center backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-4xl space-y-1.5">
        <p className="text-sm font-medium tracking-tight text-zinc-300">
          <span className="whitespace-nowrap">
            Made by{' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm font-semibold text-zinc-100 no-underline [text-decoration:none] outline-none transition-[color,opacity,text-shadow,filter,transform] duration-200 hover:-translate-y-px hover:text-white hover:opacity-100 hover:[text-shadow:0_0_18px_rgba(255,255,255,0.38),0_0_36px_rgba(147,197,253,0.24)] hover:[filter:brightness(1.08)] focus-visible:ring-2 focus-visible:ring-white/25"
            >
              Inodh.rnwr
            </a>
          </span>
        </p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Built with OpenF1 live data and enriched historical metadata
        </p>
      </div>
    </footer>
  );
}

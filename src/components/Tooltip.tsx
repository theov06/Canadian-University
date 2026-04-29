"use client";

import { useState, ReactNode } from "react";

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <button
        className="ml-1 w-3.5 h-3.5 rounded-full border border-[var(--border)] text-[9px] text-[var(--text-muted)] flex items-center justify-center hover:border-violet-500/30 hover:text-violet-400 transition-colors"
        aria-label="Info"
        onClick={(e) => { e.preventDefault(); setShow(!show); }}
      >
        i
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-[11px] rounded-lg glass border border-[var(--border-glow)] text-[var(--text)] shadow-lg whitespace-nowrap z-50 max-w-xs text-center">
          {content}
        </span>
      )}
    </span>
  );
}

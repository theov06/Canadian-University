const tagStyles: Record<string, string> = {
  "Budget Friendly": "tag-budget",
  "Premium": "border border-violet-500/20 bg-violet-500/10 text-violet-300",
  "High IELTS Required": "border border-amber-500/20 bg-amber-500/10 text-amber-300",
  "Co-op Available": "tag-coop",
  "Big City": "border border-pink-500/20 bg-pink-500/10 text-pink-300",
  "Small Town": "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  "Low Living Cost": "tag-budget",
  "College": "tag-college",
  "Polytechnic": "tag-polytechnic",
  "Transfer Pathway": "tag-transfer",
};

export function Tag({ label }: { label: string }) {
  const style = tagStyles[label] || "border border-[var(--border)] bg-white/[0.03] text-[var(--text-secondary)]";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${style}`}>
      {label}
    </span>
  );
}

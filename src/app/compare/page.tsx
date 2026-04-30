"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { samplePrograms } from "@/data/sample-programs";
import { Tag } from "@/components/Tag";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-[var(--text-secondary)]">Loading...</div>}>
      <ComparePageInner />
    </Suspense>
  );
}

function ComparePageInner() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").map(Number).slice(0, 4) : [];
  const programs = samplePrograms.filter((p) => ids.includes(p.id));

  if (programs.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold mb-2">No programs to compare</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Select up to 4 programs from the search page.</p>
        <Link href="/search" className="text-[var(--accent)] text-sm hover:underline">Go to Search</Link>
      </div>
    );
  }

  const cheapest = programs.reduce((a, b) => a.tuition_yearly_international < b.tuition_yearly_international ? a : b);
  const lowestLiving = programs.reduce((a, b) => a.estimated_monthly_living_cost < b.estimated_monthly_living_cost ? a : b);
  const lowestIelts = programs.reduce((a, b) => a.ielts_overall < b.ielts_overall ? a : b);

  const rows: { label: string; render: (p: typeof programs[0]) => React.ReactNode }[] = [
    { label: "Institution", render: (p) => <span className="font-medium text-xs">{p.university_name}</span> },
    { label: "Type", render: (p) => <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${p.institution_type === "college" ? "tag-college" : p.institution_type === "polytechnic" ? "tag-polytechnic" : "tag-university"}`}>{p.institution_type}</span> },
    { label: "City", render: (p) => <span className="text-xs">{p.city}, {p.province}</span> },
    { label: "Tuition/yr", render: (p) => <span className={`text-xs font-semibold ${p.id === cheapest.id ? "text-emerald-600 dark:text-emerald-400" : ""}`}>${p.tuition_yearly_international.toLocaleString()}{p.id === cheapest.id ? " ★" : ""}</span> },
    { label: "Living/mo", render: (p) => <span className={`text-xs ${p.id === lowestLiving.id ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>${p.estimated_monthly_living_cost.toLocaleString()}{p.id === lowestLiving.id ? " ★" : ""}</span> },
    { label: "Total/yr", render: (p) => { const t = p.tuition_yearly_international + p.estimated_monthly_living_cost * 12; return <span className="text-xs font-semibold text-[var(--accent-cyan)]">${t.toLocaleString()}</span>; }},
    { label: "IELTS", render: (p) => <span className={`text-xs ${p.id === lowestIelts.id ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>{p.ielts_overall}{p.id === lowestIelts.id ? " ★" : ""}</span> },
    { label: "TOEFL", render: (p) => <span className="text-xs">{p.toefl_ibt}</span> },
    { label: "Co-op", render: (p) => <span className={`text-xs ${p.has_coop ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>{p.has_coop ? "Yes" : "No"}</span> },
    { label: "Tags", render: (p) => <div className="flex flex-wrap gap-1">{p.tags.slice(0, 3).map((t) => <Tag key={t} label={t} />)}</div> },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link href="/search" className="text-xs text-[var(--accent)] hover:underline mb-4 inline-block">Back to search</Link>
      <h1 className="text-xl font-bold mb-2">Compare Programs</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">★ = best in category</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 w-28 text-[10px] text-[var(--text-muted)] uppercase tracking-wider"></th>
              {programs.map((p) => (
                <th key={p.id} className="text-left p-3 min-w-[180px]">
                  <Link href={`/program/${p.id}`} className="font-semibold text-xs hover:text-[var(--accent)] transition-colors">{p.program_name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                <td className="p-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{row.label}</td>
                {programs.map((p) => <td key={p.id} className="p-3">{row.render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="mt-8 text-center">
        <Link href="/search" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all">
          Search More Programs
        </Link>
      </div>
    </div>
  );
}

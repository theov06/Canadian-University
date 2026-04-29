"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { samplePrograms } from "@/data/sample-programs";

const typeColors: Record<string, string> = {
  university: "#8b5cf6",
  college: "#06b6d4",
  polytechnic: "#3b82f6",
};

const provinceColors: Record<string, string> = {
  "British Columbia": "#8b5cf6",
  "Saskatchewan": "#22d3ee",
  "Manitoba": "#f59e0b",
  "Alberta": "#ef4444",
  "New Brunswick": "#10b981",
};

export default function GraphPage() {
  const [selected, setSelected] = useState<typeof samplePrograms[0] | null>(null);
  const [filterProvince, setFilterProvince] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = useMemo(() => {
    let items = [...samplePrograms];
    if (filterProvince) items = items.filter((p) => p.province === filterProvince);
    if (filterType) items = items.filter((p) => p.institution_type === filterType);
    return items;
  }, [filterProvince, filterType]);

  const provinces = Array.from(new Set(samplePrograms.map((p) => p.province))).sort();
  const maxTuition = Math.max(...samplePrograms.map((p) => p.tuition_yearly_international));

  // Position nodes in a circle around center
  const cx = 400, cy = 300, radius = 220;
  const nodes = filtered.map((p, i) => {
    const angle = (i / filtered.length) * Math.PI * 2 - Math.PI / 2;
    const r = radius + (p.tuition_yearly_international / maxTuition) * 40;
    const size = 6 + (p.tuition_yearly_international / maxTuition) * 14;
    return { ...p, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, size };
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Program Graph Explorer</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">Interactive visualization of {filtered.length} institutions. Node size = tuition level. Click to inspect.</p>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="px-3 py-1.5 rounded-lg glass border border-[var(--border)] text-xs bg-transparent">
          <option value="">All Provinces</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-1.5 rounded-lg glass border border-[var(--border)] text-xs bg-transparent">
          <option value="">All Types</option>
          <option value="university">Universities</option>
          <option value="college">Colleges</option>
          <option value="polytechnic">Polytechnics</option>
        </select>
        <button onClick={() => { setFilterProvince(""); setFilterType(""); setSelected(null); }} className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-violet-400 hover:border-violet-500/20 transition-all">
          Reset
        </button>
        <div className="flex gap-3 ml-auto text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> University</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> College</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Polytechnic</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Graph */}
        <div className="flex-1 glass-card rounded-xl p-4 overflow-hidden">
          <svg viewBox="0 0 800 600" className="w-full h-auto">
            {/* Center node */}
            <circle cx={cx} cy={cy} r="24" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="bold">BA</text>

            {/* Lines */}
            {nodes.map((n) => (
              <line key={`line-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="rgba(148,163,184,0.06)" strokeWidth="0.5" />
            ))}

            {/* Nodes */}
            {nodes.map((n) => {
              const color = typeColors[n.institution_type || "university"] || "#8b5cf6";
              const isSelected = selected?.id === n.id;
              return (
                <g key={n.id} onClick={() => setSelected(n)} className="cursor-pointer">
                  {isSelected && <circle cx={n.x} cy={n.y} r={n.size + 6} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />}
                  <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity={isSelected ? 1 : 0.6} className="hover:opacity-100 transition-opacity" />
                  <title>{n.university_name} — ${n.tuition_yearly_international.toLocaleString()}/yr</title>
                  {n.size > 10 && (
                    <text x={n.x} y={n.y + n.size + 12} textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="7">
                      {n.university_name.length > 15 ? n.university_name.slice(0, 14) + "…" : n.university_name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="w-72 shrink-0 glass-card rounded-xl p-5 self-start hidden lg:block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${selected.institution_type === "college" ? "tag-college" : selected.institution_type === "polytechnic" ? "tag-polytechnic" : "tag-university"}`}>
                  {selected.institution_type}
                </span>
                <button onClick={() => setSelected(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs">✕</button>
              </div>
              <h3 className="font-semibold text-sm mb-1">{selected.university_name}</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mb-4">{selected.city}, {selected.province}</p>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Program</span><span>{selected.program_name}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tuition/yr</span><span className="text-violet-300 font-semibold">${selected.tuition_yearly_international.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Living/mo</span><span>${selected.estimated_monthly_living_cost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">IELTS</span><span>{selected.ielts_overall}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Co-op</span><span className={selected.has_coop ? "text-emerald-400" : "text-[var(--text-muted)]"}>{selected.has_coop ? "Yes" : "No"}</span></div>
              </div>

              <Link href={`/program/${selected.id}`} className="block mt-4 text-center px-4 py-2 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                View Details
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

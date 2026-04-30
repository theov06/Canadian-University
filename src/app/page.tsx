"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { samplePrograms, universities } from "@/data/sample-programs";
import { ProgramCard } from "@/components/ProgramCard";
import { useTranslation } from "@/components/LanguageProvider";

const featured = samplePrograms.filter((p) => p.institution_type === "university").slice(0, 6);
const avgTuition = Math.round(samplePrograms.filter((p) => p.institution_type === "university").reduce((s, p) => s + p.tuition_yearly_international, 0) / samplePrograms.filter((p) => p.institution_type === "university").length);
const cheapest = samplePrograms.filter((p) => p.institution_type === "university").sort((a, b) => a.tuition_yearly_international - b.tuition_yearly_international)[0];
const coopCount = samplePrograms.filter((p) => p.has_coop).length;

export default function HomePage() {
  const [selectedUni, setSelectedUni] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-3">
          {t("home.title1")}<br /><span className="glow-text">{t("home.title2")}</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm lg:text-base max-w-xl">
          Intelligence platform for international students comparing BA programs across {samplePrograms.length} Canadian institutions.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="flex gap-2">
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl glass border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]/30 transition-all bg-transparent appearance-none cursor-pointer"
          >
            <option value="">Search institutions...</option>
            {universities.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
          <button
            onClick={() => router.push(selectedUni ? `/search?university=${encodeURIComponent(selectedUni)}` : "/search")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all shrink-0"
          >
            Explore
          </button>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-10">
        {[
          { label: "Budget < $25K", href: "/search?maxTuition=25000" },
          { label: "Co-op Available", href: "/search?hasCoop=true" },
          { label: "Colleges", href: "/search?institutionType=college" },
          { label: "British Columbia", href: "/search?province=British+Columbia" },
          { label: "Low Living Cost", href: "/search?citySize=small" },
        ].map((f) => (
          <a key={f.label} href={f.href} className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/20 hover:text-[var(--accent)] transition-all">
            {f.label}
          </a>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Institutions", value: samplePrograms.length.toString(), sub: "universities + colleges" },
          { label: "Avg Tuition", value: `$${avgTuition.toLocaleString()}`, sub: "universities only" },
          { label: "Best Value", value: cheapest?.university_name || "", sub: `$${cheapest?.tuition_yearly_international.toLocaleString()}/yr` },
          { label: "Co-op Programs", value: coopCount.toString(), sub: "with paid work terms" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
            <p className="text-lg font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Featured */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Featured Programs</h2>
          <a href="/search" className="text-xs text-[var(--accent)] hover:opacity-80 transition-colors">View all</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {featured.map((p, i) => <ProgramCard key={p.id} program={p} index={i} />)}
        </div>
      </div>

      {/* Find My Program CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card rounded-xl p-6 mb-10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm mb-1">Not sure what to study?</h2>
          <p className="text-xs text-[var(--text-secondary)]">Take a 2-minute quiz to discover which BA fields match your interests and goals.</p>
        </div>
        <a href="/find-my-program" className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all">
          Find My Program
        </a>
      </motion.div>

      {/* Smart Insights */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Smart Insights</h2>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Best Value University</span>
            <p className="font-medium mt-1">University of Manitoba — $19,800/yr tuition with $1,200/mo living costs in Winnipeg</p>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Most Affordable College</span>
            <p className="font-medium mt-1">NBCC — ~$12,000/yr in Fredericton, NB with very low living costs</p>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Best Co-op</span>
            <p className="font-medium mt-1">SFU and UVic lead with strong co-op programs integrating paid work terms into your degree</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

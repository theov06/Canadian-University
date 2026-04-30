"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { samplePrograms } from "@/data/sample-programs";
import { Tag } from "@/components/Tag";
import { Tooltip } from "@/components/Tooltip";

export default function ProgramDetailPage() {
  const { id } = useParams();
  const program = samplePrograms.find((p) => p.id === Number(id));

  if (!program) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold mb-2">Program not found</h1>
        <Link href="/search" className="text-[var(--accent)] text-sm hover:underline">Back to search</Link>
      </div>
    );
  }

  const totalYearly = program.tuition_yearly_international + program.estimated_monthly_living_cost * 12;
  const totalFourYear = totalYearly * 4;
  const typeTag = program.institution_type === "college" ? "tag-college" : program.institution_type === "polytechnic" ? "tag-polytechnic" : "tag-university";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/search" className="text-xs text-[var(--accent)] hover:underline mb-4 inline-block">Back to search</Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${typeTag}`}>{program.institution_type || "university"}</span>
          {program.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">{program.program_name}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{program.university_name} — {program.city}, {program.province}</p>
      </motion.div>

      <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">{program.description}</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Cost Breakdown</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Tooltip content="Yearly tuition for international students"><span className="text-[10px] text-[var(--text-muted)]">Tuition / year</span></Tooltip>
            <p className="text-lg font-bold text-[var(--accent)]">${program.tuition_yearly_international.toLocaleString()}</p>
          </div>
          <div>
            <Tooltip content="Estimated monthly living cost in this city"><span className="text-[10px] text-[var(--text-muted)]">Living / month</span></Tooltip>
            <p className="text-lg font-bold">${program.estimated_monthly_living_cost.toLocaleString()}</p>
          </div>
          <div>
            <Tooltip content="Tuition + 12 months living expenses"><span className="text-[10px] text-[var(--text-muted)]">Total / year</span></Tooltip>
            <p className="text-lg font-bold text-[var(--accent-cyan)]">${totalYearly.toLocaleString()}</p>
          </div>
          <div>
            <Tooltip content="Estimated total for a 4-year degree"><span className="text-[10px] text-[var(--text-muted)]">Total 4 years</span></Tooltip>
            <p className="text-lg font-bold">${totalFourYear.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${Math.min((program.tuition_yearly_international / 55000) * 100, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1"><span>$0</span><span>$55,000/yr</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-6 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Admission Requirements</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="glass rounded-lg p-3"><Tooltip content="IELTS Academic"><span className="text-[10px] text-[var(--text-muted)]">IELTS</span></Tooltip><p className="text-lg font-bold">{program.ielts_overall}</p></div>
          <div className="glass rounded-lg p-3"><Tooltip content="TOEFL iBT"><span className="text-[10px] text-[var(--text-muted)]">TOEFL iBT</span></Tooltip><p className="text-lg font-bold">{program.toefl_ibt}</p></div>
          <div className="glass rounded-lg p-3"><Tooltip content="Minimum GPA"><span className="text-[10px] text-[var(--text-muted)]">Min GPA</span></Tooltip><p className="text-lg font-bold">{program.min_gpa > 0 ? program.min_gpa : "Competitive"}</p></div>
        </div>
        {program.additional_requirements && (
          <div className="glass rounded-lg p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">Details</span>
            {program.additional_requirements.split("; ").map((req, i) => (
              <p key={i} className="text-[11px] text-[var(--text-secondary)] leading-relaxed">· {req}</p>
            ))}
          </div>
        )}
      </motion.div>

      {program.majors && program.majors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Available Majors</h2>
          <p className="text-[10px] text-[var(--text-muted)] mb-4">{program.majors.length} subject areas</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {program.majors.map((m) => (
              <details key={m.name} className="group glass rounded-lg overflow-hidden">
                <summary className="px-3 py-2 text-xs cursor-pointer hover:text-[var(--accent)] transition-colors list-none flex items-center justify-between">
                  {m.name}
                  <span className="text-[var(--text-muted)] text-[10px] group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <p className="px-3 pb-2 text-[11px] text-[var(--text-secondary)] leading-relaxed">{m.description}</p>
              </details>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Career Outcomes</h2>
          <div className="flex flex-wrap gap-1.5">{program.career_outcomes.map((c) => <span key={c} className="px-2.5 py-1 rounded-md glass text-[11px]">{c}</span>)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Co-op Program</h2>
          <p className={`text-sm font-semibold ${program.has_coop ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>
            {program.has_coop ? "Available — Paid work terms included" : "Not available for this program"}
          </p>
        </motion.div>
      </div>

      <div className="text-center">
        <a href={program.program_url} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all">
          View Official Program Page
        </a>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">Opens {program.university_name} website</p>
      </div>
    </div>
  );
}

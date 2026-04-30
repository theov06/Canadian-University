"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProgramCard as ProgramCardType } from "@/types";
import { Tag } from "./Tag";
import { useTranslation } from "./LanguageProvider";

interface Props {
  program: ProgramCardType;
  onCompare?: (id: number) => void;
  isComparing?: boolean;
  index?: number;
}

export function ProgramCard({ program, onCompare, isComparing, index = 0 }: Props) {
  const totalYearly = program.tuition_yearly_international + program.estimated_monthly_living_cost * 12;
  const { t } = useTranslation();
  const typeTag = program.institution_type === "college" ? "tag-college" : program.institution_type === "polytechnic" ? "tag-polytechnic" : "tag-university";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass-card rounded-xl overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${typeTag}`}>
                {program.institution_type || "university"}
              </span>
              {program.is_transfer && <span className="tag-transfer text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded">Transfer</span>}
            </div>
            <Link href={`/program/${program.id}`} className="font-semibold text-sm hover:text-[var(--accent)] transition-colors block truncate">
              {program.program_name}
            </Link>
            <p className="text-xs text-[var(--text-secondary)] truncate">{program.university_name} · {program.city}</p>
          </div>
          {onCompare && (
            <button
              onClick={() => onCompare(program.id)}
              className={`shrink-0 text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                isComparing ? "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/20 hover:text-[var(--accent)]"
              }`}
            >
              {isComparing ? t("card.selected") : t("card.compare")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block">{t("card.tuition_yr")}</span>
            <span className="font-semibold text-[var(--accent)]">${program.tuition_yearly_international.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block">{t("card.total_yr")}</span>
            <span className="font-semibold">${totalYearly.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] text-[10px] block">IELTS</span>
            <span className="font-semibold">{program.ielts_overall}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {program.tags.slice(0, 4).map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      </div>
    </motion.div>
  );
}

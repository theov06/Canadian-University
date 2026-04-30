"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { samplePrograms, provinces, universities } from "@/data/sample-programs";
import { ProgramCard as ProgramCardComponent } from "@/components/ProgramCard";
import { SearchFilters } from "@/components/SearchFilters";
import { ProgramCard } from "@/types";
import { useTranslation } from "@/components/LanguageProvider";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[var(--text-secondary)]">Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    university: searchParams.get("university") || "",
    province: searchParams.get("province") || "",
    maxTuition: searchParams.get("maxTuition") || "",
    hasCoop: searchParams.get("hasCoop") === "true",
    citySize: searchParams.get("citySize") || "",
    institutionType: searchParams.get("institutionType") || "",
    sortBy: "tuition",
  });

  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [results, setResults] = useState<ProgramCard[]>([]);

  const applyFilters = useCallback(() => {
    let filtered = [...samplePrograms];
    if (filters.university) filtered = filtered.filter((p) => p.university_name === filters.university);
    if (filters.province) filtered = filtered.filter((p) => p.province === filters.province);
    if (filters.maxTuition) filtered = filtered.filter((p) => p.tuition_yearly_international <= Number(filters.maxTuition));
    if (filters.hasCoop) filtered = filtered.filter((p) => p.has_coop);
    if (filters.citySize) filtered = filtered.filter((p) => p.city_size === filters.citySize);
    if (filters.institutionType) filtered = filtered.filter((p) => p.institution_type === filters.institutionType);

    const [sortKey, sortDir] = filters.sortBy.includes("-desc") ? [filters.sortBy.replace("-desc", ""), "desc"] : [filters.sortBy, "asc"];
    filtered.sort((a, b) => {
      const order = sortDir === "desc" ? -1 : 1;
      if (sortKey === "tuition") return (a.tuition_yearly_international - b.tuition_yearly_international) * order;
      if (sortKey === "living_cost") return (a.estimated_monthly_living_cost - b.estimated_monthly_living_cost) * order;
      if (sortKey === "city") return a.city.localeCompare(b.city) * order;
      return 0;
    });
    setResults(filtered);
  }, [filters]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-6">{t("search.title")}</h1>

      <div className="mb-4">
        <select
          value={filters.university}
          onChange={(e) => setFilters({ ...filters, university: e.target.value })}
          className="w-full px-4 py-3 rounded-xl glass border border-[var(--border)] text-sm focus:outline-none focus:border-violet-500/30 transition-all bg-transparent appearance-none cursor-pointer"
        >
          <option value="">{t("search.all_institutions")}</option>
          {universities.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
        </select>
      </div>

      {compareIds.length > 0 && (
        <div className="mb-4 p-3 rounded-xl glow-border flex items-center justify-between">
          <span className="text-xs font-medium">{compareIds.length} {t("search.selected")}</span>
          <button onClick={() => router.push(`/compare?ids=${compareIds.join(",")}`)} className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-colors">
            {t("search.compare_now")}
          </button>
        </div>
      )}

      <div className="flex gap-6">
        <SearchFilters filters={filters} onChange={setFilters} provinces={provinces} className="hidden md:block w-52 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] mb-4">{results.length} {results.length !== 1 ? t("search.results") : t("search.result")}</p>
          {results.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <p className="text-sm mb-1">{t("search.no_match")}</p>
              <p className="text-xs text-[var(--text-muted)]">{t("search.try_adjusting")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((p, i) => (
                <ProgramCardComponent key={p.id} program={p} onCompare={toggleCompare} isComparing={compareIds.includes(p.id)} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

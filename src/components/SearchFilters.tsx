"use client";

import { useTranslation } from "./LanguageProvider";

interface FilterState {
  university: string;
  province: string;
  maxTuition: string;
  hasCoop: boolean;
  citySize: string;
  institutionType: string;
  sortBy: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  provinces: string[];
  className?: string;
}

export function SearchFilters({ filters, onChange, provinces, className }: Props) {
  const update = (key: keyof FilterState, value: string | boolean) => {
    onChange({ ...filters, [key]: value });
  };
  const { t } = useTranslation();

  const selectClass =
    "w-full px-3 py-2 rounded-lg glass border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-violet-500/30 transition-all bg-transparent appearance-none cursor-pointer";

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t("filter.province")}</label>
          <select value={filters.province} onChange={(e) => update("province", e.target.value)} className={selectClass}>
            <option value="">{t("filter.all_provinces")}</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t("filter.type")}</label>
          <select value={filters.institutionType} onChange={(e) => update("institutionType", e.target.value)} className={selectClass}>
            <option value="">{t("filter.all_types")}</option>
            <option value="university">{t("filter.universities")}</option>
            <option value="college">{t("filter.colleges")}</option>
            <option value="polytechnic">{t("filter.polytechnics")}</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t("filter.max_tuition")}</label>
          <select value={filters.maxTuition} onChange={(e) => update("maxTuition", e.target.value)} className={selectClass}>
            <option value="">{t("filter.any_budget")}</option>
            <option value="20000">Under $20,000</option>
            <option value="25000">Under $25,000</option>
            <option value="30000">Under $30,000</option>
            <option value="40000">Under $40,000</option>
            <option value="50000">Under $50,000</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t("filter.city_size")}</label>
          <select value={filters.citySize} onChange={(e) => update("citySize", e.target.value)} className={selectClass}>
            <option value="">{t("filter.any_size")}</option>
            <option value="large">{t("filter.large")}</option>
            <option value="medium">{t("filter.medium")}</option>
            <option value="small">{t("filter.small")}</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.hasCoop} onChange={(e) => update("hasCoop", e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border)] accent-violet-500" />
          <span className="text-xs text-[var(--text-secondary)]">{t("filter.coop_only")}</span>
        </label>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t("filter.sort")}</label>
          <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className={selectClass}>
            <option value="tuition">{t("filter.tuition_low")}</option>
            <option value="tuition-desc">{t("filter.tuition_high")}</option>
            <option value="living_cost">{t("filter.living_low")}</option>
            <option value="city">{t("filter.city_az")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

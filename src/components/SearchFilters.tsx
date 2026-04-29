"use client";

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

  const selectClass =
    "w-full px-3 py-2 rounded-lg glass border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-violet-500/30 transition-all bg-transparent appearance-none cursor-pointer";

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Province</label>
          <select value={filters.province} onChange={(e) => update("province", e.target.value)} className={selectClass}>
            <option value="">All Provinces</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Institution Type</label>
          <select value={filters.institutionType} onChange={(e) => update("institutionType", e.target.value)} className={selectClass}>
            <option value="">All Types</option>
            <option value="university">Universities</option>
            <option value="college">Colleges</option>
            <option value="polytechnic">Polytechnics</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Max Tuition (CAD/yr)</label>
          <select value={filters.maxTuition} onChange={(e) => update("maxTuition", e.target.value)} className={selectClass}>
            <option value="">Any Budget</option>
            <option value="20000">Under $20,000</option>
            <option value="25000">Under $25,000</option>
            <option value="30000">Under $30,000</option>
            <option value="40000">Under $40,000</option>
            <option value="50000">Under $50,000</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">City Size</label>
          <select value={filters.citySize} onChange={(e) => update("citySize", e.target.value)} className={selectClass}>
            <option value="">Any Size</option>
            <option value="large">Large City</option>
            <option value="medium">Medium City</option>
            <option value="small">Small Town</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.hasCoop} onChange={(e) => update("hasCoop", e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border)] accent-violet-500" />
          <span className="text-xs text-[var(--text-secondary)]">Co-op only</span>
        </label>

        <div>
          <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Sort By</label>
          <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className={selectClass}>
            <option value="tuition">Tuition (Low → High)</option>
            <option value="tuition-desc">Tuition (High → Low)</option>
            <option value="living_cost">Living Cost (Low → High)</option>
            <option value="city">City (A → Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { samplePrograms, provinces } from "@/data/sample-programs";
import { ProgramCard, Filters } from "@/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: Filters = {
    search: params.get("search") || undefined,
    province: params.get("province") || undefined,
    minTuition: params.get("minTuition") ? Number(params.get("minTuition")) : undefined,
    maxTuition: params.get("maxTuition") ? Number(params.get("maxTuition")) : undefined,
    maxIelts: params.get("maxIelts") ? Number(params.get("maxIelts")) : undefined,
    hasCoop: params.get("hasCoop") === "true" ? true : undefined,
    citySize: params.get("citySize") || undefined,
    sortBy: (params.get("sortBy") as Filters["sortBy"]) || "tuition",
    sortOrder: (params.get("sortOrder") as Filters["sortOrder"]) || "asc",
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 12,
  };

  let results: ProgramCard[] = [...samplePrograms];

  // Filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.program_name.toLowerCase().includes(q) ||
        p.university_name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (filters.province) results = results.filter((p) => p.province === filters.province);
  if (filters.minTuition) results = results.filter((p) => p.tuition_yearly_international >= filters.minTuition!);
  if (filters.maxTuition) results = results.filter((p) => p.tuition_yearly_international <= filters.maxTuition!);
  if (filters.maxIelts) results = results.filter((p) => p.ielts_overall <= filters.maxIelts!);
  if (filters.hasCoop) results = results.filter((p) => p.has_coop);
  if (filters.citySize) results = results.filter((p) => p.city_size === filters.citySize);

  // Sort
  results.sort((a, b) => {
    const order = filters.sortOrder === "desc" ? -1 : 1;
    switch (filters.sortBy) {
      case "tuition": return (a.tuition_yearly_international - b.tuition_yearly_international) * order;
      case "living_cost": return (a.estimated_monthly_living_cost - b.estimated_monthly_living_cost) * order;
      case "city": return a.city.localeCompare(b.city) * order;
      default: return (a.tuition_yearly_international - b.tuition_yearly_international) * order;
    }
  });

  // Paginate
  const total = results.length;
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    filters: { provinces },
  });
}

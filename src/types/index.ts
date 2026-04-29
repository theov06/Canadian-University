export interface Location {
  id: number;
  city: string;
  province: string;
  city_size: "small" | "medium" | "large";
  estimated_monthly_living_cost: number;
}

export interface University {
  id: number;
  name: string;
  slug: string;
  description: string;
  location_id: number;
  website_url: string;
  logo_url?: string;
  ranking_proxy: number;
  last_updated: string;
  source_url: string;
}

export interface Program {
  id: number;
  university_id: number;
  name: string;
  slug: string;
  degree_type: string;
  description: string;
  has_coop: boolean;
  program_url: string;
  career_outcomes: string[];
  last_updated: string;
  source_url: string;
}

export interface Requirement {
  id: number;
  program_id: number;
  ielts_overall: number;
  ielts_min_band: number;
  toefl_ibt: number;
  min_gpa: number;
  additional_requirements: string;
}

export interface Cost {
  id: number;
  program_id: number;
  tuition_yearly_international: number;
  tuition_yearly_domestic?: number;
  additional_fees: number;
  currency: string;
  academic_year: string;
}

// Joined view for display
export interface ProgramCard {
  id: number;
  program_name: string;
  program_slug: string;
  degree_type: string;
  description: string;
  has_coop: boolean;
  program_url: string;
  career_outcomes: string[];
  university_id: number;
  university_name: string;
  university_slug: string;
  city: string;
  province: string;
  city_size: string;
  estimated_monthly_living_cost: number;
  tuition_yearly_international: number;
  ielts_overall: number;
  toefl_ibt: number;
  min_gpa: number;
  additional_requirements: string;
  institution_type?: "university" | "college" | "polytechnic";
  is_transfer?: boolean;
  majors?: { name: string; description: string }[];
  tags: string[];
}

export interface Filters {
  search?: string;
  province?: string;
  minTuition?: number;
  maxTuition?: number;
  maxIelts?: number;
  hasCoop?: boolean;
  citySize?: string;
  sortBy?: "tuition" | "living_cost" | "ranking" | "city";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

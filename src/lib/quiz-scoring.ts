import { QuizOption } from "@/data/quiz-questions";
import { fieldProfiles, FieldProfile } from "@/data/field-profiles";
import { samplePrograms } from "@/data/sample-programs";

export interface FieldResult {
  field: string;
  score: number;
  maxScore: number;
  percentage: number;
  profile: FieldProfile;
}

export interface QuizResult {
  topFields: FieldResult[];
  matchingPrograms: typeof samplePrograms;
}

export function calculateResults(answers: QuizOption[]): QuizResult {
  // Tally scores
  const scores: Record<string, number> = {};
  answers.forEach((opt) => {
    Object.entries(opt.weights).forEach(([field, weight]) => {
      scores[field] = (scores[field] || 0) + weight;
    });
  });

  // Calculate max possible per field (sum of max weight per question)
  const maxPossible = answers.length * 3; // rough max

  // Build sorted results
  const results: FieldResult[] = Object.entries(scores)
    .map(([field, score]) => {
      const profile = fieldProfiles.find((p) => p.field === field);
      if (!profile) return null;
      return { field, score, maxScore: maxPossible, percentage: Math.min(Math.round((score / maxPossible) * 100), 99), profile };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score) as FieldResult[];

  const topFields = results.slice(0, 3);

  // Match programs from database
  const allKeywords = topFields.flatMap((f) => f.profile.keywords);
  const matchingPrograms = samplePrograms.filter((p) => {
    const text = `${p.program_name} ${p.description} ${(p.majors || []).map((m) => m.name).join(" ")}`.toLowerCase();
    return allKeywords.some((kw) => text.includes(kw.toLowerCase()));
  });

  return { topFields, matchingPrograms };
}

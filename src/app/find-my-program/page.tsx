"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions, QuizOption } from "@/data/quiz-questions";
import { calculateResults, QuizResult } from "@/lib/quiz-scoring";
import { ProgramCard } from "@/components/ProgramCard";

type Phase = "intro" | "quiz" | "results";

export default function FindMyProgramPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(QuizOption | null)[]>(new Array(quizQuestions.length).fill(null));
  const [results, setResults] = useState<QuizResult | null>(null);

  const currentQ = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;
  const canNext = answers[step] !== null;

  const selectOption = (opt: QuizOption) => {
    const newAnswers = [...answers];
    newAnswers[step] = opt;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (step < quizQuestions.length - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    const validAnswers = answers.filter(Boolean) as QuizOption[];
    const r = calculateResults(validAnswers);
    setResults(r);
    setPhase("results");
  };

  const retake = () => {
    setPhase("intro");
    setStep(0);
    setAnswers(new Array(quizQuestions.length).fill(null));
    setResults(null);
  };

  // ===== INTRO =====
  if (phase === "intro") {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">?</div>
          <h1 className="text-3xl font-bold mb-3">Find My Program</h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto mb-8">
            Not sure what to study? Answer 10 quick questions and we will recommend BA fields and matching Canadian programs based on your interests, strengths, and goals.
          </p>
          <button
            onClick={() => setPhase("quiz")}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all"
          >
            Start Quiz
          </button>
          <p className="text-[10px] text-[var(--text-muted)] mt-4">Takes about 2 minutes · No account needed</p>
        </motion.div>
      </div>
    );
  }

  // ===== QUIZ =====
  if (phase === "quiz") {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
            <span>Question {step + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{currentQ.category}</p>
            <h2 className="text-lg font-semibold mb-6">{currentQ.question}</h2>

            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const isSelected = answers[step]?.label === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => selectOption(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                        : "border-[var(--border)] hover:border-[var(--accent)]/30 text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={back} disabled={step === 0} className="px-4 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-all">
            Back
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-xs font-medium hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-30 transition-all"
          >
            {step === quizQuestions.length - 1 ? "See Results" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // ===== RESULTS =====
  if (phase === "results" && results) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">Your Results</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">Based on your answers, here are the BA fields that best match your profile.</p>

          {/* Top 3 Fields */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {results.topFields.map((f, i) => (
              <motion.div key={f.field} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{f.percentage}% match</span>
                </div>
                <h3 className="font-semibold text-base mb-2">{f.field}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{f.profile.description}</p>

                <div className="mb-3">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Best for</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.profile.bestFor.map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded text-[10px] glass">{b}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Key skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.profile.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] border border-[var(--border)]">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Career examples</span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">{f.profile.careers.join(" · ")}</p>
                </div>

                {/* Match bar */}
                <div className="mt-3 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${f.percentage}%` }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Matching Programs */}
          {results.matchingPrograms.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                Matching Programs ({results.matchingPrograms.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {results.matchingPrograms.slice(0, 8).map((p, i) => (
                  <ProgramCard key={p.id} program={p} index={i} />
                ))}
              </div>
              {results.matchingPrograms.length > 8 && (
                <div className="text-center mt-4">
                  <Link href="/search" className="text-xs text-[var(--accent)] hover:underline">
                    View all {results.matchingPrograms.length} matching programs
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button onClick={retake} className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/20 transition-all">
              Retake Quiz
            </button>
            <Link href="/search" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all">
              Browse All Programs
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

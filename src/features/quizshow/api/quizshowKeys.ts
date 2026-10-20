/** `demoMode` sits last in every key, matching the events domain's convention. */
export const quizshowKeys = {
  root: ["quizshow"] as const,
  quiz: (slug: string, demoMode: boolean) =>
    ["quizshow", "quiz", slug, demoMode] as const,
  importSources: (slug: string, demoMode: boolean) =>
    ["quizshow", "import-sources", slug, demoMode] as const,
  packs: (demoMode: boolean) => ["quizshow", "packs", demoMode] as const,
  results: (slug: string, demoMode: boolean) =>
    ["quizshow", "results", slug, demoMode] as const,
};

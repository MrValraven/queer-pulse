import type { CulturalTaskFilters } from "./culturalProduction.types";

/** Every Cultural Production query key (contract section 12.2). The mode
 *  rides at the end, since a demo/live switch keeps the query cache. No key
 *  holds idea, task, comment or guide text; the staff search term is typed
 *  text, so that query marks its key private. */
export const culturalKeys = {
  root: ["admin", "culturalProduction"] as const,
  ideasRoot: ["admin", "culturalProduction", "ideas"] as const,
  ideas: (isDemoMode: boolean) =>
    ["admin", "culturalProduction", "ideas", { demo: isDemoMode }] as const,
  ideaRoot: ["admin", "culturalProduction", "idea"] as const,
  idea: (ideaId: string, isDemoMode: boolean) =>
    [
      "admin",
      "culturalProduction",
      "idea",
      ideaId,
      { demo: isDemoMode },
    ] as const,
  tasksRoot: ["admin", "culturalProduction", "tasks"] as const,
  tasks: (filters: CulturalTaskFilters, isDemoMode: boolean) =>
    [
      "admin",
      "culturalProduction",
      "tasks",
      filters,
      { demo: isDemoMode },
    ] as const,
  taskRoot: ["admin", "culturalProduction", "task"] as const,
  task: (taskId: string, isDemoMode: boolean) =>
    [
      "admin",
      "culturalProduction",
      "task",
      taskId,
      { demo: isDemoMode },
    ] as const,
  dueCountRoot: ["admin", "culturalProduction", "dueCount"] as const,
  dueCount: (isDemoMode: boolean) =>
    ["admin", "culturalProduction", "dueCount", { demo: isDemoMode }] as const,
  guidesRoot: ["admin", "culturalProduction", "guides"] as const,
  guides: (isDemoMode: boolean) =>
    ["admin", "culturalProduction", "guides", { demo: isDemoMode }] as const,
  guideRoot: ["admin", "culturalProduction", "guide"] as const,
  guide: (guideId: string, isDemoMode: boolean) =>
    [
      "admin",
      "culturalProduction",
      "guide",
      guideId,
      { demo: isDemoMode },
    ] as const,
  staffSearchRoot: ["admin", "culturalProduction", "staffSearch"] as const,
  staffSearch: (term: string, isDemoMode: boolean) =>
    [
      "admin",
      "culturalProduction",
      "staffSearch",
      term,
      { demo: isDemoMode },
    ] as const,
};

/** Every Cultural Production write shares this mutation key, so a page can
 *  tell a write is in flight and ignore a second press. */
export const CULTURAL_WRITE_KEY = [
  "admin",
  "culturalProduction",
  "write",
] as const;

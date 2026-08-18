import type { WriterApplicationDTO } from "./api/writerApplications.api";

/**
 * Demo-mode fixture for `useMyWriterApplication` — `null` means "no
 * application yet", so the demo `ApplyToWritePage` shows the form (the
 * writer-workspace/staff-role demo already grants every staff role, so a
 * demo visitor lands on `/magazine/submit-story` directly and never sees
 * this page unless they navigate to it directly).
 */
export const DEMO_MY_WRITER_APPLICATION: WriterApplicationDTO | null = null;

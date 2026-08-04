import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import styles from "./IssuesPage.module.css";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useIssues } from "./api/useIssues";
import { ISSUES } from "./issues.data";
import { IssuesHero } from "./IssuesHero";
import { CurrentIssueSection } from "./CurrentIssueSection";
import { ArchiveSection } from "./ArchiveSection";

export function IssuesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { demoMode } = useDemoMode();
  const simulatedLoad = useSimulatedLoad();
  const { data: liveIssues, isLoading, isError, refetch } = useIssues();

  // Demo mode renders the page's own ISSUES mock — the hook returns `null` in
  // demo precisely so we can tell a demo fallback apart from a live query that
  // is still pending or has failed. Live mode shows ONLY real data (never the
  // mock), with a real loading skeleton and a real error state.
  const issuesList = demoMode ? ISSUES : (liveIssues ?? []);
  const loading = demoMode ? simulatedLoad : isLoading;
  const errored = !demoMode && isError;

  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      <div className={styles.page}>
        <IssuesHero demoMode={demoMode} />
        {/* The current-issue showcase hardcodes issue 09's title/dek/stats and
            has no backend analogue — demo-only. In live the archive grid below
            already surfaces the real current issue (flagged `current`). */}
        {demoMode && <CurrentIssueSection />}
        <ArchiveSection
          view={view}
          onView={setView}
          issuesList={issuesList}
          loading={loading}
          errored={errored}
          onRetry={() => void refetch()}
        />
      </div>
    </PageShell>
  );
}

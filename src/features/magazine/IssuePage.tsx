import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineComingSoon } from "./MagazineComingSoon";
import { MagazineMasthead } from "./MagazineMasthead";
import { IssueCover } from "./IssueCover";
import { IssueContents } from "./IssueContents";
import { DEMO_ISSUE_COVER } from "./issue.data";
import { useIssue } from "./api/useIssue";
import styles from "./IssuePage.module.css";

export function IssuePage() {
  const { demoMode } = useDemoMode();
  // CNT-8 fix: read the real `:number` route param instead of a hardcoded
  // "09" — undefined (the bare `/magazine/issue` route) falls back to the
  // newest issue inside `useIssue`.
  const { number: issueNumberParam } = useParams<{ number?: string }>();
  const { data: liveIssue, isLoading, isError } = useIssue(issueNumberParam);

  // Demo mode renders the fabricated issue-09 record; live mode overlays the
  // real title/dek/date and shows ONLY those — the TOC, contributors, stat
  // counts and editor's letter have no backend analogue, so they stay demo-only.
  const cover = demoMode ? DEMO_ISSUE_COVER : liveIssue;
  const showEmpty = !demoMode && !isLoading && (isError || !cover);

  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      {showEmpty ? (
        <div className="wrap">
          <div className={styles.liveEmpty}>
            <MagazineComingSoon
              titleKey="magazine:issue.emptyLiveTitle"
              descriptionKey="magazine:issue.emptyLiveBody"
            />
          </div>
        </div>
      ) : (
        <>
          <IssueCover
            demoMode={demoMode}
            loading={!demoMode && isLoading}
            number={cover?.number}
            title={cover?.title}
            dek={cover?.dek}
            publishedLabel={cover?.publishedLabel}
          />
          {demoMode && <IssueContents />}
        </>
      )}
    </PageShell>
  );
}

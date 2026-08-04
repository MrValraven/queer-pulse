import { PageShell } from "../../shared/components/layout";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineComingSoon } from "./MagazineComingSoon";
import { MagazineMasthead } from "./MagazineMasthead";
import { IssueCover } from "./IssueCover";
import { IssueContents } from "./IssueContents";
import { DEMO_ISSUE_COVER } from "./issue.data";
import { useIssue } from "./api/useIssue";
import styles from "./IssuePage.module.css";

/** The prototype's route has no `:number` param yet — this always shows the
 *  current issue, "09". */
const CURRENT_ISSUE_NUMBER = "09";

export function IssuePage() {
  const { demoMode } = useDemoMode();
  const { data: liveIssue, isLoading, isError } = useIssue(CURRENT_ISSUE_NUMBER);

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

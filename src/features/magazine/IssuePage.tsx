import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { nodeToTitleText, nodeToText } from "./nodeText";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineComingSoon } from "./MagazineComingSoon";
import { MagazineMasthead } from "./MagazineMasthead";
import { IssueCover } from "./IssueCover";
import { IssueContents } from "./IssueContents";
import { DEMO_ISSUE_COVER } from "./issue.data";
import { useIssue } from "./api/useIssue";
import styles from "./IssuePage.module.css";

export function IssuePage() {
  const { t } = useTranslation();
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

  // The issue number is the page's identity, so the tab title and the share
  // card carry it (FE-CNT-12). An issue that failed to resolve is kept out of
  // the index rather than sharing as the homepage default.
  const issueNumber = nodeToText(cover?.number) || (issueNumberParam ?? "");
  const metaTitle = !issueNumber
    ? t("magazine:issue.metaTitleFallback")
    : cover?.title
      ? t("magazine:issue.metaTitle", {
          number: issueNumber,
          title: nodeToTitleText(cover.title),
        })
      : t("magazine:issue.metaTitleNumberOnly", { number: issueNumber });

  return (
    <PageShell>
      <PageMeta
        title={metaTitle}
        description={
          nodeToText(cover?.dek) || t("magazine:issue.metaDescription")
        }
        canonical={
          issueNumber ? `${routes.issue}/${issueNumber}` : routes.issue
        }
        noIndex={showEmpty}
      />
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

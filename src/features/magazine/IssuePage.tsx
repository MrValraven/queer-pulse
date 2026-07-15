import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import { IssueCover } from "./IssueCover";
import { IssueContents } from "./IssueContents";
import { useIssue } from "./api/useIssue";

/** The prototype's route has no `:number` param yet — this always shows the
 *  current issue, "09". */
const CURRENT_ISSUE_NUMBER = "09";

export function IssuePage() {
  const { data: liveIssue } = useIssue(CURRENT_ISSUE_NUMBER);

  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      <IssueCover
        number={liveIssue?.number}
        title={liveIssue?.title}
        dek={liveIssue?.dek}
        publishedLabel={liveIssue?.publishedLabel}
      />
      <IssueContents />
    </PageShell>
  );
}

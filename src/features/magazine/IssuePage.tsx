import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import { IssueCover } from "./IssueCover";
import { IssueContents } from "./IssueContents";

export function IssuePage() {
  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      <IssueCover />
      <IssueContents />
    </PageShell>
  );
}

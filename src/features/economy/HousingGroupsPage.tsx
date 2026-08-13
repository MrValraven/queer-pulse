import { PageShell } from "../../shared/components/layout";
import { GroupsHero, GroupsGrid } from "./HousingGroupsSections";

/** The vetted housing-groups directory (P3.1): a warm, access-gated
 *  alternative to open listing sites. */
export function HousingGroupsPage() {
  return (
    <PageShell>
      <GroupsHero />
      <GroupsGrid />
    </PageShell>
  );
}

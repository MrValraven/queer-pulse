import { AppShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunitiesHubHeader } from "./CommunitiesHubHeader";
import { CommunitiesHome } from "./CommunitiesHomePage";
import { CommunitiesDiscover } from "./CommunitiesPage";
import { useCommunitiesTopTab } from "./useCommunitiesTopTab";

/**
 * Merged `/communities` surface. A top-level "My communities | Discover" switch
 * sits above two reused bodies: the member hub (CommunitiesHome) and the
 * directory (CommunitiesDiscover). The active tab lives in `?tab=`, defaulting
 * smartly to the hub when the member belongs to a community and the directory
 * when they don't. Both surfaces are auth-gated, so there is no signed-out case.
 */
export function CommunitiesHubPage() {
  const { t } = useTranslation();
  const { tab, setTab, resolving } = useCommunitiesTopTab();
  // While the smart default is still resolving, show the hub — its data hook
  // owns an honest loading state — rather than flashing Discover then swapping.
  const active = resolving ? "mine" : tab;

  return (
    <AppShell>
      <PageMeta
        title={t("communities:seo.hub.title")}
        description={t("communities:seo.hub.description")}
      />
      <CommunitiesHubHeader active={active} onChange={setTab} />
      <div
        role="tabpanel"
        id={`communities-top-panel-${active}`}
        aria-labelledby={`communities-top-tab-${active}`}
        tabIndex={0}
      >
        {active === "mine" ? <CommunitiesHome /> : <CommunitiesDiscover />}
      </div>
    </AppShell>
  );
}

import { useState } from "react";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { PageLoader } from "../../shared/components/feedback/PageLoader";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunity } from "../communities/api/useCommunity";
import { AdminPageHeader, AdminTabs } from "./ui";
import {
  RequestsTab,
  ReportsTab,
  MembersTab,
  SettingsTab,
} from "./ModPanelTabs";
import styles from "./ModPanel.module.css";

const TAB_KEYS = [
  ["requests", "modPanel.tabs.requests"],
  ["reports", "modPanel.tabs.reports"],
  ["members", "modPanel.tabs.members"],
  ["settings", "modPanel.tabs.settings"],
] as const;

type ModPanelTabId = (typeof TAB_KEYS)[number][0];

const ID_PREFIX = "mod-panel";

/** The community's name with its last word in the coral italic. */
function CommunityNameTitle({ name }: { name: string }) {
  const words = name.split(/\s+/);
  const lead = words.slice(0, -1).join(" ");
  return (
    <>
      {lead && `${lead} `}
      <em>{words[words.length - 1]}</em>
    </>
  );
}

/**
 * The mod panel for one community, under its page header. `title` is the
 * page's own name (the member route says "Mod tools", the admin route says
 * "Mod panel"): it heads the page while the community loads, then moves to
 * the eyebrow once the community's name takes the title.
 */
export function ModPanel({
  slug,
  title,
  communityName,
}: {
  slug: string;
  title: string;
  /** Names the community in the title when the caller knows it better than
   *  the loaded record (the admin demo route keeps its fixture's name). */
  communityName?: string;
}) {
  const { t } = useTranslation();
  // The real community: demo assembles it from the mock registries, live calls
  // GET /communities/:slug. This replaces a direct `LIVING[slug]` read, which
  // only ever resolved for the handful of mock flagships (so a real moderator's
  // community always 404'd to "not found"). The join-request / roster tabs now
  // source their rows (and their real ids) from the dual-mode api hooks, so a
  // live PATCH targets a real request behind a real toast.
  // The reports tab does the same via `useCommunityReports(slug)`, so it no
  // longer reads `living.reports` (hard-coded to `[]` in live).
  const { living, editable, myRole, notFound, isLoading } = useCommunity(slug);
  const [tab, setTab] = useState<ModPanelTabId>("requests");
  const name = communityName ?? editable?.name;

  const header = (
    <FadeIn>
      <AdminPageHeader
        eyebrow={title}
        title={name ? <CommunityNameTitle name={name} /> : title}
      />
    </FadeIn>
  );

  if (isLoading) {
    return (
      <>
        {header}
        <PageLoader size="section" />
      </>
    );
  }

  if (notFound || !living || !editable) {
    return (
      <>
        {header}
        <EmptyState
          title={t("admin:modPanel.notFound.title")}
          description={t("admin:modPanel.notFound.description")}
        />
      </>
    );
  }

  return (
    <>
      {header}
      <AdminTabs
        idPrefix={ID_PREFIX}
        label={title}
        tabs={TAB_KEYS.map(([id, labelKey]) => ({
          id,
          label: t(`admin:${labelKey}`),
        }))}
        active={tab}
        onChange={(id) => setTab(id as ModPanelTabId)}
      />
      <div
        role="tabpanel"
        id={`${ID_PREFIX}-panel-${tab}`}
        aria-labelledby={`${ID_PREFIX}-tab-${tab}`}
        className={styles.tabPanel}
      >
        {tab === "requests" && <RequestsTab slug={slug} />}
        {tab === "reports" && <ReportsTab slug={slug} />}
        {tab === "members" && <MembersTab slug={slug} />}
        {tab === "settings" && (
          <SettingsTab
            slug={slug}
            editable={editable}
            isOwner={myRole === "owner"}
          />
        )}
      </div>
    </>
  );
}

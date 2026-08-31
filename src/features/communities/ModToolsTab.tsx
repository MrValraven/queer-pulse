import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, tabPanelProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import {
  ModJoinRequests,
  ModMemberManagement,
  ModReportedPosts,
  ModToolsCardSection,
} from "./ModToolsSections";
import { ModToolsOverview } from "./ModToolsOverview";
import { ModToolsInvites } from "./ModToolsInvites";
import { ModToolsBans } from "./ModToolsBans";
import { ModToolsSupport } from "./ModToolsSupport";
import { ModToolsGovernanceLog } from "./ModToolsGovernanceLog";
import { ModToolsBanRatifications } from "./ModToolsBanRatifications";
import { CommunityRemovalOutcomeDialog } from "./CommunityRemovalOutcomeDialog";
import { ModToolsConfirmDialog } from "./ModToolsConfirmDialog";
import { CommunityDangerZone } from "./CommunityDangerZone";
import { useModToolsActions } from "./useModToolsActions";
import { useCommunitySupportOffers } from "./api/useCommunitySupportOffers";
import {
  signableRatificationCount,
  useCommunityBanRatifications,
} from "./api/useCommunityBanRatifications";
import { MOD_NAV, isModSection, type ModSection } from "./modToolsNav.data";
import styles from "./ModToolsShell.module.css";

type RosterPaging = Pick<
  PulsePaging,
  "hasNextPage" | "fetchNextPage" | "isFetchingNextPage"
>;

/**
 * The mod console: a section rail, and one pane at a time.
 *
 * This used to be all eight moderation surfaces stacked in a single scroll,
 * which buried the two that are actually time-sensitive (join requests and
 * reports) under a stats panel and above a full paginated roster. The rail
 * gives each surface its own address, and Overview answers "is anything
 * waiting on me" before a mod has to go looking.
 *
 * The queues stay panes rather than modals on purpose: they are lists you
 * page through, come back to, and link a co-moderator at, none of which a
 * modal does well, and the confirm step in front of every destructive action
 * would then be a dialog stacked on a dialog.
 */
export function ModToolsTab({
  living,
  role,
  communityName,
  rosterPaging,
}: {
  living: LivingCommunity;
  role: CommunityRole | null;
  communityName: string;
  /** The roster's pagination, threaded straight through to the member-
   *  management list so a mod can reach members past the first page. */
  rosterPaging: RosterPaging;
}) {
  const { t } = useTranslation();
  const railId = useId();
  const actions = useModToolsActions(living);
  // Read here rather than inside the pane so the rail can badge an unanswered
  // offer of support, and Overview can name it, without either of them having
  // to be open for the moderators to notice it (OPS-05). Same query key the
  // pane itself uses, so this is one request, not two.
  const { openCount: openSupportCount } = useCommunitySupportOffers(
    living.slug,
  );
  // Same reasoning for the permanent bars waiting on a second signature
  // (PRD-25), and one more reason on top: a hold lapses on its own after a
  // fixed window and settles the bar at the fallback term, so a queue nobody
  // is told about is a decision made by nobody. Same query key the pane uses,
  // so this is one request rather than two.
  const { data: ratificationQueue } = useCommunityBanRatifications(living.slug);
  const signableRatifications = signableRatificationCount(ratificationQueue);

  // The open section lives in the URL beside the tab (?tab=modtools&mod=…),
  // so a pane is deep-linkable, survives a refresh, and the back button walks
  // out of it. An unknown value falls back to Overview.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSection = searchParams.get("mod");
  const section: ModSection = isModSection(rawSection)
    ? rawSection
    : "overview";
  const openSection = (next: ModSection) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === "overview") params.delete("mod");
        else params.set("mod", next);
        return params;
      },
      { replace: true },
    );

  const counts: Partial<Record<ModSection, number>> = {
    // The whole pending queue, not just the loaded page (ENG-41): a rail badge
    // reading "20" on a 60-deep queue is a worse signal than no badge at all.
    requests: actions.requestTotal,
    reports: actions.reports.length,
    support: openSupportCount,
    // Only what THIS viewer can sign. A proposer cannot sign their own, and a
    // badge on work only somebody else can do is a number they can never
    // clear.
    ratifications: signableRatifications,
  };

  return (
    <>
      <div className={styles.shell}>
        <Tabs
          className={styles.rail}
          idPrefix={railId}
          label={t("communities:detail.modtools.nav.label")}
          tabs={MOD_NAV.map((item) => ({
            id: item.id,
            label: t(item.labelKey),
            // Only a queue with something in it gets a badge. A rail of
            // zeroes reads as work rather than as an all-clear.
            ...(item.badge && counts[item.id]
              ? { count: counts[item.id] }
              : {}),
          }))}
          active={section}
          onChange={(id) => openSection(id as ModSection)}
        />

        {/* Re-keyed on the open section so the entrance animation replays on
            every switch. React would otherwise keep this element and only
            swap its children, which is the instant pop the rail used to
            produce. */}
        <div
          key={section}
          className={`${styles.pane} ${styles.paneIn}`}
          {...tabPanelProps(railId, section)}
        >
          <ModToolsPane
            section={section}
            living={living}
            role={role}
            communityName={communityName}
            rosterPaging={rosterPaging}
            actions={actions}
            supportCount={openSupportCount}
            onOpenSection={openSection}
          />
        </div>
      </div>

      {/* What the removal actually did, when it is not what the moderator
          asked for: a permanent bar waiting on a second signature, or one this
          community can never have because nobody else could sign it. */}
      {actions.removalOutcome && (
        <CommunityRemovalOutcomeDialog
          outcome={actions.removalOutcome}
          onClose={actions.dismissRemovalOutcome}
          onOpenRatifications={() => {
            actions.dismissRemovalOutcome();
            openSection("ratifications");
          }}
        />
      )}

      {actions.confirming && (
        <ModToolsConfirmDialog
          confirming={actions.confirming}
          isPending={actions.isConfirmPending}
          onClose={() => actions.setConfirming(null)}
          onRemoveMember={actions.confirmRemoveMember}
          onGrantCoOwner={actions.confirmGrantCoOwner}
          onRevokeCoOwner={actions.confirmRevokeCoOwner}
          onRemoveReport={actions.confirmRemoveReport}
        />
      )}
    </>
  );
}

/** The open section's surface. Split out of `ModToolsTab` (which owns the
 *  rail, the URL and the confirm dialog) to keep each component under the
 *  repo's per-component line limit. */
function ModToolsPane({
  section,
  living,
  role,
  communityName,
  rosterPaging,
  actions,
  supportCount,
  onOpenSection,
}: {
  section: ModSection;
  living: LivingCommunity;
  role: CommunityRole | null;
  communityName: string;
  rosterPaging: RosterPaging;
  actions: ReturnType<typeof useModToolsActions>;
  supportCount: number;
  onOpenSection: (section: ModSection) => void;
}) {
  const { setConfirming } = actions;

  if (section === "overview") {
    return (
      <ModToolsOverview
        slug={living.slug}
        requestCount={actions.requestTotal}
        reportCount={actions.reports.length}
        supportCount={supportCount}
        onOpenSection={onOpenSection}
      />
    );
  }
  if (section === "requests") {
    return (
      <ModJoinRequests
        requests={actions.requests}
        slug={living.slug}
        total={actions.requestTotal}
        state={actions.requestsState}
        paging={actions.requestsPaging}
        onResolve={actions.resolveRequest}
        isPending={actions.isRequestPending}
      />
    );
  }
  if (section === "reports") {
    return (
      <ModReportedPosts
        reports={actions.reports}
        slug={living.slug}
        state={actions.reportsState}
        onRemove={(report) => setConfirming({ kind: "removeReport", report })}
        onDismiss={actions.dismissReportRow}
        onEscalate={actions.escalateReportRow}
      />
    );
  }
  if (section === "members") {
    return (
      <>
        <ModMemberManagement
          members={actions.manageable}
          memberKey={actions.memberKey}
          roleOverrides={actions.roleOverrides}
          viewerRole={role}
          paging={rosterPaging}
          onPromote={actions.promote}
          onDemote={actions.demote}
          onGrantCoOwner={(memberSlug, name) =>
            setConfirming({ kind: "grantCoOwner", memberSlug, name })
          }
          onRevokeCoOwner={(memberSlug, name) =>
            setConfirming({ kind: "revokeCoOwner", memberSlug, name })
          }
          onRemove={(memberSlug, name) =>
            setConfirming({ kind: "removeMember", memberSlug, name })
          }
        />
        {/* A ban is a member's state, so it answers the same question this
            pane is already open to answer. */}
        <ModToolsBans
          slug={living.slug}
          onOpenRatifications={() => onOpenSection("ratifications")}
        />
      </>
    );
  }
  if (section === "ratifications") {
    return <ModToolsBanRatifications slug={living.slug} />;
  }
  if (section === "invites") {
    return <ModToolsInvites slug={living.slug} />;
  }
  if (section === "support") {
    return <ModToolsSupport slug={living.slug} />;
  }
  if (section === "history") {
    return <ModToolsGovernanceLog slug={living.slug} viewerRole={role} />;
  }
  if (section === "card") {
    return (
      <ModToolsCardSection
        slug={living.slug}
        communityName={communityName}
        role={role}
      />
    );
  }
  return (
    <CommunityDangerZone
      slug={living.slug}
      name={communityName}
      role={role}
      roster={actions.manageable}
    />
  );
}

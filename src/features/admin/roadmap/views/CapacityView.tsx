import { FiAlertTriangle } from "react-icons/fi";
import { Avatar, Badge, EmptyState } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../../shared/lib/initials";
import type {
  AdminRoadmapItemDTO,
  RoadmapTeamMemberDTO,
} from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/useItemDrawer";
import styles from "./CapacityView.module.css";

// Same free-text category fallback as `GuidesView` — only the 9 named
// `admin:roadmap.categories.*` keys have a translation.
const KNOWN_CATEGORIES = new Set([
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
]);

function categoryLabel(t: TFunction, category: string): string {
  return KNOWN_CATEGORIES.has(category)
    ? t(`admin:roadmap.categories.${category}`)
    : category;
}

function MemberRow({
  member,
  items,
  t,
}: {
  member: RoadmapTeamMemberDTO;
  items: AdminRoadmapItemDTO[];
  t: TFunction;
}) {
  const ownedItems = items.filter((item) => item.ownerId === member.userId);
  const buildingItems = ownedItems.filter((item) => item.column === "building");
  const plannedCount = ownedItems.filter(
    (item) => item.column === "planned",
  ).length;
  const buildingHours = buildingItems.reduce(
    (total, item) => total + item.weeklyHours,
    0,
  );
  const overCap = buildingHours > member.weeklyCapHours;
  const pct =
    member.weeklyCapHours > 0
      ? Math.min(100, Math.round((buildingHours / member.weeklyCapHours) * 100))
      : buildingHours > 0
        ? 100
        : 0;

  return (
    <li className={styles.memberRow}>
      <div className={styles.memberIdentity}>
        <Avatar
          initials={initialsFromName(member.name, "?")}
          size={40}
          tint={member.paid ? "coral" : "jade"}
          name={member.name}
        />
        <div className={styles.memberText}>
          <div className={styles.memberNameRow}>
            <span className={styles.memberName}>{member.name}</span>
            <Badge tone={member.paid ? "coral" : "jade"}>
              {t(
                member.paid
                  ? "admin:roadmap.capacityView.paidTag"
                  : "admin:roadmap.capacityView.volunteerTag",
              )}
            </Badge>
          </div>
          <p className={styles.memberRole}>{member.role}</p>
        </div>
      </div>

      <div className={styles.loadBlock}>
        <div className={styles.loadTop}>
          <span
            className={overCap ? styles.loadHoursOver : styles.loadHours}
          >
            {overCap && <FiAlertTriangle aria-hidden />} {buildingHours}h /{" "}
            {member.weeklyCapHours}h
          </span>
        </div>
        <div className={styles.loadTrack}>
          <div
            className={overCap ? styles.loadFillOver : styles.loadFill}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={styles.loadSummary}>
          {t("admin:roadmap.capacityView.loadSummary", {
            building: buildingItems.length,
            planned: plannedCount,
          })}
        </p>
      </div>
    </li>
  );
}

function UnassignedActivePanel({
  items,
  t,
}: {
  items: AdminRoadmapItemDTO[];
  t: TFunction;
}) {
  const unassignedActive = items.filter(
    (item) =>
      !item.ownerId && (item.column === "building" || item.column === "planned"),
  );
  const urgentCount = unassignedActive.filter(
    (item) => item.priority === "P0" || item.priority === "P1",
  ).length;

  return (
    <div className={styles.panel}>
      <p className={styles.panelLabel}>
        {t("admin:roadmap.capacityView.unassignedActiveLabel")}
      </p>
      <p className={styles.panelValue}>{unassignedActive.length}</p>
      <p className={urgentCount > 0 ? styles.panelWarn : styles.panelOk}>
        {urgentCount > 0
          ? t("admin:roadmap.capacityView.unassignedActiveWarn", {
              count: urgentCount,
            })
          : t("admin:roadmap.capacityView.unassignedActiveOk")}
      </p>
    </div>
  );
}

function PaidVsVolunteerPanel({
  team,
  t,
}: {
  team: RoadmapTeamMemberDTO[];
  t: TFunction;
}) {
  const paidCount = team.filter((member) => member.paid).length;
  const volunteerCount = team.length - paidCount;
  const paidPct = team.length > 0 ? Math.round((paidCount / team.length) * 100) : 0;

  return (
    <div className={styles.panel}>
      <p className={styles.panelLabel}>
        {t("admin:roadmap.capacityView.paidVsVolunteerLabel")}
      </p>
      <div className={styles.splitBar}>
        <div className={styles.splitPaid} style={{ width: `${paidPct}%` }} />
        <div
          className={styles.splitVolunteer}
          style={{ width: `${100 - paidPct}%` }}
        />
      </div>
      <div className={styles.splitLegend}>
        <span className={styles.legendEntry}>
          <span className={styles.legendDotPaid} aria-hidden />
          {t("admin:roadmap.capacityView.paidTag")} · {paidCount}
        </span>
        <span className={styles.legendEntry}>
          <span className={styles.legendDotVolunteer} aria-hidden />
          {t("admin:roadmap.capacityView.volunteerTag")} · {volunteerCount}
        </span>
      </div>
      <p className={styles.panelFoot}>
        {t("admin:roadmap.capacityView.paidVsVolunteerFoot")}
      </p>
    </div>
  );
}

function NeedsFundingPanel({
  items,
  onOpen,
  t,
}: {
  items: AdminRoadmapItemDTO[];
  onOpen: (id: string) => void;
  t: TFunction;
}) {
  const needsFunding = items.filter((item) => item.cost === "needs");

  return (
    <div className={styles.panel}>
      <p className={styles.panelLabel}>
        {t("admin:roadmap.capacityView.needsFundingLabel")}
      </p>
      {needsFunding.length === 0 ? (
        <p className={styles.panelEmpty}>
          {t("admin:roadmap.capacityView.needsFundingEmpty")}
        </p>
      ) : (
        <ul className={styles.fundingList}>
          {needsFunding.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.fundingItem}
                onClick={() => onOpen(item.id)}
              >
                <span className={styles.fundingName}>{item.name}</span>
                <span className={styles.fundingCategory}>
                  {categoryLabel(t, item.category)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.panelFoot}>
        {t("admin:roadmap.capacityView.sustainerNote")}
      </p>
    </div>
  );
}

/**
 * Capacity view (`admin:roadmap.tabs.capacity`) — the editable team roster
 * (`team`, ordered by `sortOrder`) matched against non-archived items, so
 * admins can see who is actually carrying what before they load a person up
 * further. Each member's building-now hours vs. their stated weekly cap;
 * side panels for unassigned-active work, the paid/volunteer split, and a
 * needs-funding list that opens straight into the item drawer.
 */
export function CapacityView({
  items,
  team,
}: {
  items: AdminRoadmapItemDTO[];
  team: RoadmapTeamMemberDTO[];
}) {
  const { t } = useTranslation();
  const itemDrawer = useItemDrawer();

  const activeItems = items.filter((item) => !item.archived);
  const orderedTeam = [...team].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <Translation
            i18nKey="admin:roadmap.capacityView.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.subtitle}>
          {t("admin:roadmap.capacityView.subtitle")}
        </p>
      </header>

      <div className={styles.layout}>
        {orderedTeam.length === 0 ? (
          <EmptyState
            title={t("admin:roadmap.capacityView.emptyRosterTitle")}
            description={t("admin:roadmap.capacityView.emptyRosterBody")}
            compact
          />
        ) : (
          <ul className={styles.roster}>
            {orderedTeam.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                items={activeItems}
                t={t}
              />
            ))}
          </ul>
        )}

        <aside className={styles.sidePanels}>
          <UnassignedActivePanel items={activeItems} t={t} />
          <PaidVsVolunteerPanel team={orderedTeam} t={t} />
          <NeedsFundingPanel
            items={activeItems}
            onOpen={itemDrawer.open}
            t={t}
          />
        </aside>
      </div>
    </div>
  );
}

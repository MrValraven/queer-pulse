import { FiArrowRight, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminChip } from "./ui";
import { VouchGraphPreview, VouchGraphLegend } from "./VouchGraphPreview";
import { AdminMemberRoleControl } from "./AdminMemberRoleControl";
import { AdminMemberStaffRoles } from "./AdminMemberStaffRoles";
import {
  SEALED_IDENTITY,
  type AdminMember,
  type MemberDetail,
  type ModerationEntry,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

/* ── Roles & access (tier control + staff-role grants) ──────────────────── */

/**
 * Groups the tier control (`AdminMemberRoleControl`) with the additive
 * staff-role toggles (`AdminMemberStaffRoles`) under one umbrella heading —
 * the tier is "how much power", staff roles are "which functional desks".
 */
export function RolesAndAccessSection({
  member,
  detail,
}: {
  member: AdminMember;
  detail: MemberDetail;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>{t("admin:staffRoles.title")}</h3>
      <p className={styles.dHint}>{t("admin:staffRoles.subtitle")}</p>
      <AdminMemberRoleControl member={member} detail={detail} />
      <AdminMemberStaffRoles
        memberId={member.id}
        slug={member.slug}
        isSystem={detail.isSystem}
        role={detail.role}
        staffRoles={detail.staffRoles}
      />
    </section>
  );
}

/* ── At a glance / trust network / communities / contributions ──────────── */

/**
 * The four "overview" sections of the member drawer, split out of
 * AdminMemberDrawer.tsx to keep that component under the repo's 200-line
 * limit once its literals were routed through `t()`.
 */
export function MemberOverviewSections({
  detail,
  memberName,
  onOpenNetwork,
}: {
  detail: MemberDetail;
  memberName: string;
  onOpenNetwork: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>
          {t("admin:members.drawer.glanceTitle")}
        </h3>
        <div className={styles.glanceGrid}>
          {detail.glance.map((glanceStat) => (
            <div key={glanceStat.labelKey} className={styles.glanceStat}>
              <div className={styles.glanceValue}>{glanceStat.value}</div>
              <div className={styles.glanceLabel}>{t(glanceStat.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>
          {t("admin:members.drawer.graphTitle")}
        </h3>
        <div
          className={styles.graphWrap}
          role="button"
          tabIndex={0}
          aria-label={t("admin:members.drawer.graphAriaLabel")}
          title={t("admin:members.drawer.graphAriaLabel")}
          onClick={onOpenNetwork}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenNetwork();
            }
          }}
        >
          <VouchGraphPreview graph={detail.graph} name={memberName} />
        </div>
        <VouchGraphLegend nodes={detail.graph.nodes} />
        <div className={styles.graphNoteRow}>
          <p className={styles.dHint}>{detail.graphNote}</p>
          <Button variant="ghost" size="md" onClick={onOpenNetwork}>
            {t("admin:members.drawer.exploreCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>
          {t("admin:members.drawer.communitiesTitle")}
        </h3>
        <div className={styles.commChips}>
          {detail.communities.map((communityChip) => (
            <AdminChip key={communityChip.label} tone={communityChip.tone}>
              {communityChip.label}
            </AdminChip>
          ))}
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>
          {t("admin:members.drawer.contributionsTitle")}
        </h3>
        {/* Keyed on the entry itself: the list gains rows as the member keeps
            contributing, and a positional key would hand a fresh row the DOM
            node of whichever entry used to sit at that index. */}
        <ul className={styles.contribList}>
          {detail.contributions.map((contribution) => (
            <li
              key={`${contribution.when}-${contribution.what}`}
              className={styles.contribItem}
            >
              <span>{contribution.what}</span>
              <span className={styles.contribWhen}>{contribution.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ── Moderation history — for & against ──────────────────── */

export function ModerationTimeline({
  entries,
}: {
  entries: ModerationEntry[];
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>{t("admin:members.timeline.title")}</h3>
      {/* Keyed on the entry itself: the timeline grows a row every time the
          member is cited or their role changes, and a positional key would
          hand the newest entry the DOM node of the one it displaced. */}
      <ul className={styles.timeline}>
        {entries.map((entry) => (
          <li
            key={`${entry.meta}-${entry.title}`}
            className={`${styles.timelineItem} ${styles[`tl_${entry.tone}`]}`}
          >
            <span className={styles.timelineMarker} aria-hidden />
            <div className={styles.timelineTx}>
              <span className={styles.timelineTitle}>{entry.title}</span>
              <span className={styles.timelineMeta}>
                {entry.meta}
                {entry.metaLink && (
                  <Link
                    className={styles.timelineLink}
                    to={routes.adminGovernance}
                  >
                    {entry.metaLink}
                  </Link>
                )}
              </span>
              {entry.note && (
                <span className={styles.timelineNote}>{entry.note}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link className={styles.auditLink} to={routes.adminGovernance}>
        {t("admin:members.timeline.auditLinkCta")}{" "}
        <FiArrowRight aria-hidden />
      </Link>
    </section>
  );
}

/* ── Identity & privacy (sealed-lock card) ───────────────── */

export function SealedIdentity() {
  const { t } = useTranslation();
  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>
        {t("admin:members.sealed.sectionTitle")}
      </h3>
      <div className={styles.sealedCard}>
        <span className={styles.sealedIcon} aria-hidden>
          <FiLock />
        </span>
        <div>
          <div className={styles.sealedTitle}>
            {t(SEALED_IDENTITY.titleKey)}
          </div>
          <p className={styles.sealedBody}>{t(SEALED_IDENTITY.bodyKey)}</p>
        </div>
      </div>
    </section>
  );
}

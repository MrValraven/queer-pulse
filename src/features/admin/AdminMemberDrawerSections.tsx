import { FiArrowRight, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminChip } from "./ui";
import { VouchGraphPreview, VouchGraphLegend } from "./VouchGraphPreview";
import {
  SEALED_IDENTITY,
  type MemberDetail,
  type ModerationEntry,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

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
          {detail.glance.map((s) => (
            <div key={s.labelKey} className={styles.glanceStat}>
              <div className={styles.glanceValue}>{s.value}</div>
              <div className={styles.glanceLabel}>{t(s.labelKey)}</div>
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
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
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
          {detail.communities.map((c) => (
            <AdminChip key={c.label} tone={c.tone}>
              {c.label}
            </AdminChip>
          ))}
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>
          {t("admin:members.drawer.contributionsTitle")}
        </h3>
        <ul className={styles.contribList}>
          {detail.contributions.map((c, i) => (
            <li key={i} className={styles.contribItem}>
              <span>{c.what}</span>
              <span className={styles.contribWhen}>{c.when}</span>
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
      <ul className={styles.timeline}>
        {entries.map((e, i) => (
          <li
            key={i}
            className={`${styles.timelineItem} ${styles[`tl_${e.tone}`]}`}
          >
            <span className={styles.timelineMarker} aria-hidden />
            <div className={styles.timelineTx}>
              <span className={styles.timelineTitle}>{e.title}</span>
              <span className={styles.timelineMeta}>
                {e.meta}
                {e.metaLink && (
                  <Link
                    className={styles.timelineLink}
                    to={routes.adminGovernance}
                  >
                    {e.metaLink}
                  </Link>
                )}
              </span>
              {e.note && <span className={styles.timelineNote}>{e.note}</span>}
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

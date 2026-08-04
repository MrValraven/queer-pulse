import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { type Community, type QueueItem } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

const SHOWN = 2;

// ── Scoped queue pane ───────────────────────────────────────────────────────

export function ScopedQueuePane({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { queue, resolvedPercent } = community;

  if (queue.length === 0) {
    return (
      <div className={styles.pane}>
        <div className={styles.calmPanel}>
          <span className={styles.calmCheck} aria-hidden>
            <FiCheck />
          </span>
          <h3 className={styles.calmTitle}>
            <Translation
              i18nKey="admin:communities.queue.emptyTitle"
              components={{ em: <em /> }}
            />
          </h3>
          <p className={styles.calmText}>
            {t("admin:communities.queue.emptyText", { pct: resolvedPercent })}
          </p>
        </div>
      </div>
    );
  }

  const shown = queue.slice(0, SHOWN);
  const extra = queue.length - shown.length;

  return (
    <div className={styles.pane}>
      {shown.map((r) => (
        <ReportRow key={r.title} item={r} />
      ))}
      {extra > 0 && (
        <div className={styles.queueMore}>
          {t("admin:communities.queue.moreHandled", { count: extra })}
        </div>
      )}
    </div>
  );
}

function ReportRow({ item }: { item: QueueItem }) {
  const { t } = useTranslation();
  const categoryTone =
    item.categoryTone === "danger"
      ? "danger"
      : item.categoryTone === "jade"
        ? "jade"
        : "coral";
  return (
    <div className={styles.reportRow}>
      <span
        className={`${styles.severity} ${styles[`sev_${item.severity}`]}`}
        aria-hidden
      />
      <div className={styles.reportBody}>
        {/* item.categoryLabel/title/meta: report content, mirrors API-fetched
            report text in live mode — left in English per the scope rule. */}
        <AdminCat tone={categoryTone}>{item.categoryLabel}</AdminCat>
        <div className={styles.reportTitle}>{item.title}</div>
        <div className={styles.reportMeta}>{item.meta}</div>
      </div>
      <Button variant="primary" to={routes.adminModeration}>
        {t("admin:communities.queue.reviewCta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

// ── Members pane ────────────────────────────────────────────────────────────

export function MembersPane({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <div className={styles.pane}>
      {community.moderators.map((m) => (
        <div key={m.name} className={styles.memberRow}>
          <AdminAvatar
            initials={m.initials}
            tone={m.tone}
            size="md"
            // `portrait()` looks up the mock adminPeople fixture and
            // `verified` asserts a check the platform doesn't compute — both
            // are demo-only chrome. On the live path a real moderator who
            // happens to share a fixture name must not get a stranger's
            // stock photo, and we must not claim a verification we don't have.
            verified={demoMode}
            src={demoMode ? portrait(m.name) : undefined}
            alt={m.name}
          />
          <div className={styles.memberMeta}>
            <div className={styles.memberName}>
              {m.name}{" "}
              <span className={styles.memberPronouns}>{m.pronouns}</span>
            </div>
            <div className={styles.memberDetail}>{m.role}</div>
          </div>
          <AdminChip tone="jade">
            {t("admin:communities.members.moderatorChip")}
          </AdminChip>
        </div>
      ))}

      <Button variant="ghost" to={routes.adminMembers}>
        {t("admin:communities.members.seeAllCta", {
          total: community.members,
        })}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

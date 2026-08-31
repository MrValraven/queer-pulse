import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminTabs } from "./ui";
import { AdminBanEvasionEscalationCard } from "./AdminBanEvasionEscalationCard";
import { AdminBanEvasionEscalationResolveModal } from "./AdminBanEvasionEscalationResolveModal";
import { useBanEvasionEscalations } from "./api/useAdminBanEvasionEscalations";
import type {
  BanEvasionEscalationDTO,
  BanEvasionEscalationStatus,
} from "./api/adminBanEvasionEscalations.api";
import styles from "./AdminBanEvasionEscalationsPage.module.css";

const STATUSES: BanEvasionEscalationStatus[] = ["open", "resolved"];

/**
 * `/admin/ban-evasion`, the escalations community moderators raise from their
 * own join-request queue (PRD-31).
 *
 * WHY THE QUEUE EXISTS. A community's owner, co-owners and moderators are told
 * one bit about an applicant: whether they match somebody THAT community
 * banned. A match against another community's ban, or against a platform ban,
 * answers false there, on purpose. Escalating is how a moderator who suspects
 * more asks for the cross-community judgement instead of being handed it, and
 * this is where that judgement gets made.
 *
 * `@Roles(Moderator, Admin)`, so unlike the legal register beside it this queue
 * is open to the moderation rota. An escalation is somebody waiting on an answer
 * about an application, and it cannot depend on an admin being online.
 *
 * NOTHING HERE BANS ANYBODY. Resolving records that a staff member looked, and
 * releases the lock so the community can ask again later.
 *
 * A failed read is never a clear queue: loading, empty and error are three
 * distinct states, because on this screen "nobody is waiting on you" and "the
 * queue could not be read" look identical and mean opposite things.
 */
export function AdminBanEvasionEscalationsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [status, setStatus] = useState<BanEvasionEscalationStatus>("open");
  const [resolvingEscalation, setResolvingEscalation] =
    useState<BanEvasionEscalationDTO | null>(null);
  const {
    data: escalations,
    isLoading,
    isError,
    error,
  } = useBanEvasionEscalations(status);

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:banEvasionEscalations.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:banEvasionEscalations.eyebrow")}
          title={
            <Translation
              i18nKey="admin:banEvasionEscalations.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:banEvasionEscalations.headerSub")}
        />
      </FadeIn>

      {demoMode && (
        <p className={styles.notice}>
          {t("admin:banEvasionEscalations.demoNotice")}
        </p>
      )}

      <FadeIn delay={60}>
        <AdminTabs
          tabs={STATUSES.map((value) => ({
            id: value,
            label: t(`admin:banEvasionEscalations.status.${value}`),
          }))}
          active={status}
          onChange={(value) => setStatus(value as BanEvasionEscalationStatus)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <div className={styles.cards}>
            {[0, 1, 2].map((skeletonIndex) => (
              <SkeletonLine
                key={skeletonIndex}
                height={168}
                style={{ borderRadius: 14 }}
              />
            ))}
          </div>
        ) : isError ? (
          <p className={`${styles.notice} ${styles.errorNotice}`}>
            <FiAlertTriangle aria-hidden className={styles.noticeIcon} />
            {isForbidden
              ? t("admin:banEvasionEscalations.forbidden")
              : t("admin:banEvasionEscalations.loadError")}
          </p>
        ) : (escalations ?? []).length === 0 ? (
          <p className={styles.notice}>
            {status === "open"
              ? t("admin:banEvasionEscalations.emptyOpen")
              : t("admin:banEvasionEscalations.emptyResolved")}
          </p>
        ) : (
          <div className={styles.cards}>
            {(escalations ?? []).map((escalation, index) => (
              <FadeIn key={escalation.id} delay={Math.min(index, 6) * 50}>
                <AdminBanEvasionEscalationCard
                  escalation={escalation}
                  onResolve={() => setResolvingEscalation(escalation)}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </FadeIn>

      {resolvingEscalation && (
        <AdminBanEvasionEscalationResolveModal
          escalation={resolvingEscalation}
          onClose={() => setResolvingEscalation(null)}
        />
      )}
    </AdminShell>
  );
}

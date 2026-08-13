import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { AdminVerificationRow } from "./AdminVerificationRows";
import {
  useAdminVerifications,
  useOverrideVerification,
} from "./api/useAdminVerifications";
import type { VerificationLevel } from "../economy/api/verification.api";
import styles from "./AdminVerificationsPage.module.css";

/**
 * Admin verification console (`/admin/verifications`). Reviews the manual/stub
 * verification path and lets a moderator grant or revoke a member's level after
 * a human review. No document data is shown — none is stored (GDPR Art.9 lives
 * entirely behind the external provider). Override is live-only.
 */
export function AdminVerificationsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { data, isLoading, isError, error } = useAdminVerifications();
  const override = useOverrideVerification();

  const handleOverride = (userId: string, level: VerificationLevel) => {
    override.mutate(
      { userId, level },
      {
        onSuccess: () =>
          showToast(t("admin:verifications.toast.updated"), "success"),
        onError: (mutationError) =>
          showToast(
            describeError(t("admin:verifications.toast.error"), mutationError),
            "error",
          ),
      },
    );
  };

  const rows = data ?? [];

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:verifications.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:verifications.eyebrow")}
          title={
            <Translation
              i18nKey="admin:verifications.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:verifications.sub")}
        />
      </FadeIn>

      <p className={styles.honesty}>{t("admin:verifications.honesty")}</p>

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={64}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <p className={styles.empty}>
          {describeError(t("admin:verifications.loadError"), error)}
        </p>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>{t("admin:verifications.empty")}</p>
      ) : (
        <div className={styles.rows}>
          {rows.map((row) => (
            <AdminVerificationRow
              key={row.userId}
              row={row}
              demoMode={demoMode}
              saving={override.isPending}
              onOverride={(level) => handleOverride(row.userId, level)}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiUserX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ProfilePage.module.css";

/** Spinner shown while a profile is loading. */
export function ProfileLoadingState() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.stateWrap} role="status" aria-live="polite">
        <Spinner />
        <span>{t("members:profile.loading")}</span>
      </div>
    </PageShell>
  );
}

/** Self-profile fetch failure — retry or go back. */
export function ProfileErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className={styles.stateWrap}>
        <EmptyState
          className={styles.stateEmpty}
          icon={<FiAlertTriangle />}
          title={t("members:profile.loadError.title")}
          description={t("members:profile.loadError.description")}
          action={{
            label: t("members:profile.loadError.retryAction"),
            onClick: onRetry,
          }}
          secondaryAction={{
            label: (
              <>
                <FiArrowLeft aria-hidden /> {t("members:profile.goBack")}
              </>
            ),
            onClick: () => void navigate(-1),
          }}
        />
      </div>
    </PageShell>
  );
}

/** A blocked member's profile is walled off. */
export function ProfileBlockedState() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className={styles.stateWrap}>
        <EmptyState
          className={styles.stateEmpty}
          icon={<FiUserX />}
          title={t("members:profile.blocked.title")}
          description={t("members:profile.blocked.description")}
          action={{
            label: t("members:profile.blocked.manageAction"),
            to: routes.connections,
          }}
          secondaryAction={{
            label: (
              <>
                <FiArrowLeft aria-hidden /> {t("members:profile.goBack")}
              </>
            ),
            onClick: () => void navigate(-1),
          }}
        />
      </div>
    </PageShell>
  );
}

/** No such member. */
export function ProfileNotFoundState() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className={styles.stateWrap}>
        <EmptyState
          className={styles.stateEmpty}
          icon={<FiUserX />}
          title={t("members:profile.notFound.title")}
          description={t("members:profile.notFound.description")}
          action={{
            label: t("members:profile.notFound.backAction"),
            to: routes.members,
          }}
          secondaryAction={{
            label: (
              <>
                <FiArrowLeft aria-hidden /> {t("members:profile.goBack")}
              </>
            ),
            onClick: () => void navigate(-1),
          }}
        />
      </div>
    </PageShell>
  );
}

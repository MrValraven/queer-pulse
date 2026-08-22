import { FiMessageSquare, FiAlertTriangle, FiLock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ThreadRepliesSkeleton } from "./ThreadRepliesSkeleton";
import styles from "./ThreadPage.module.css";

/** Live mode has no thread until the fetch resolves — show a skeleton while it
 * loads, then a real "not found" state if the slug resolves to nothing. Demo
 * always has a thread, so this branch is live-only. */
export function ThreadNotFoundState({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className="wrap">
        <div className={styles.layout}>
          {loading ? (
            <ThreadRepliesSkeleton count={4} />
          ) : (
            <EmptyState
              icon={<FiMessageSquare />}
              title={t("forum:threadPage.notFound.title")}
              description={t("forum:threadPage.notFound.description")}
              action={{
                label: t("forum:threadPage.notFound.backCta"),
                to: routes.forum,
              }}
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}

/** Distinct from both "not found" and a server error: the thread is real but
 * lives in a private community the viewer hasn't joined, so the backend
 * refuses to serve it (403). Retrying can only fail again, so this state
 * points at the communities directory instead. */
export function ThreadPrivateState() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className="wrap">
        <div className={styles.layout}>
          <EmptyState
            icon={<FiLock />}
            title={t("forum:threadPage.private.title")}
            description={t("forum:threadPage.private.description")}
            action={{
              label: t("forum:threadPage.private.browseCta"),
              to: routes.communities,
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}

/** Distinct from "not found": a live 500 / network error while loading the
 * thread. Genuinely retryable (unlike a 404), so it offers a retry instead of
 * bouncing the member back to the forum as if the thread never existed. */
export function ThreadErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className="wrap">
        <div className={styles.layout}>
          <EmptyState
            icon={<FiAlertTriangle />}
            title={t("forum:threadPage.error.title")}
            description={t("forum:threadPage.error.description")}
            action={{
              label: t("forum:threadPage.error.retryCta"),
              onClick: onRetry,
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}

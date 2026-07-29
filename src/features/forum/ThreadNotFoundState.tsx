import { FiMessageSquare } from "react-icons/fi";
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

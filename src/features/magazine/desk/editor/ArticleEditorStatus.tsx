import { AppShell } from "../../../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../../ArticleEditorPage.module.css";

export type ArticleEditorStatusVariant = "loading" | "not-found";

export interface ArticleEditorStatusProps {
  variant: ArticleEditorStatusVariant;
}

/**
 * The article editor's loading skeleton and not-found empty state, each
 * wrapped in `AppShell` like the real page. `"loading"` covers both the
 * initial fetch AND the brief window after the fetch resolves but before
 * the one-time seed effect has copied `article` into local state — see
 * `ArticleEditorPage`'s `hasSeeded` gate, which is what keeps `RichText`
 * (seed-once, mount-only) from ever mounting on an empty title/standfirst.
 * Extracted purely to keep `ArticleEditorPage`'s function body under the
 * 200-line cap.
 */
export function ArticleEditorStatus({ variant }: ArticleEditorStatusProps) {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className={styles.page}>
        {variant === "loading" ? (
          <div className={styles.center} aria-hidden>
            <SkeletonLine width="45%" height={22} />
            <SkeletonLine width="65%" height={14} />
          </div>
        ) : (
          <EmptyState
            title={t("magazine:write.status.notFoundTitle")}
            description={t("magazine:piece.header.notFoundDescription")}
            action={{
              label: t("magazine:piece.header.backToDesk"),
              to: routes.magazineEditor,
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

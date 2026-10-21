import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccessLoadState } from "./api/useStudioAccess";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import styles from "./studioError.module.css";

/**
 * What a member reads when GET /studio/me failed (offline, a timeout, our
 * server), inside the Studio frame: the reason in plain words and a Retry
 * that keeps the panel and its focus while it runs. A failed read is never
 * the coming-soon teaser, which would read as a revoked grant.
 */
export function StudioAccessErrorPage() {
  const { t } = useTranslation();
  const loadState = useStudioAccessLoadState();
  useStudioDocumentTitle(t("studio:accessError.pageTitle"));
  return (
    <StudioShell>
      <section className={styles.accessError} aria-labelledby="studio-access">
        <h1 id="studio-access" className="visuallyHidden">
          {t("studio:accessError.pageTitle")}
        </h1>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.access"
          title={t("studio:accessError.title")}
        />
      </section>
    </StudioShell>
  );
}

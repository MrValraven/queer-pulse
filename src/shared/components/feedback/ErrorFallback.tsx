import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../ui/Button";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import styles from "./ErrorFallback.module.css";

interface ErrorFallbackProps {
  onReset: () => void;
  /** A server correlation id or monitor event id, shown for support handoff. */
  referenceId?: string | null;
  /** "route" keeps the app frame around it; "app" is the whole-page catch. */
  level?: "app" | "route";
}

/**
 * Branded plum-panel shown when an ErrorBoundary catches a render error. Warm,
 * second-person, non-transactional voice; recovery actions instead of a dead
 * end. Never a white card (design-system rule) — plum panel on cream.
 */
export function ErrorFallback({ onReset, referenceId }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.panel}>
        <div className={styles.icon}>
          <FiAlertTriangle size={26} color="var(--accent)" aria-hidden />
        </div>
        <h2 className={styles.title}>
          <Translation
            i18nKey="shared:feedback.errorFallback.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.body}>{t("shared:feedback.errorFallback.body")}</p>
        <div className={styles.actions}>
          <Button size="lg" variant="ghost-dark" onClick={onReset}>
            {t("shared:feedback.errorFallback.tryAgain")}
          </Button>
          {/* Plain `href`, not `to`: the app-level ErrorBoundary sits outside
              BrowserRouter, so a router <Link> here throws on a null
              NavigationContext and takes the fallback down with it. A full
              reload is the better recovery from a crash anyway. */}
          <Button size="lg" variant="ghost-dark" href={routes.homepage}>
            {t("common:cta.backHome")}
          </Button>
        </div>
        {referenceId && (
          <p className={styles.ref}>
            {t("shared:feedback.errorFallback.reference", { referenceId })}
          </p>
        )}
      </div>
    </div>
  );
}

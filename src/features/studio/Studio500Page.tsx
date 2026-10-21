import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioErrorRetry } from "./studioErrorRetry";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import styles from "./studioError.module.css";

const WAVE_BAR_COUNT = 28;
const WAVE_GAP_START = 12;
const WAVE_GAP_END = 15;

/** A broken-tape waveform: a fixed rolling shape with a flat gap where the
 *  tape snapped. Computed once at load, so every render paints the same. */
const WAVE_BARS = Array.from({ length: WAVE_BAR_COUNT }, (_, barIndex) => {
  const isInGap = barIndex > WAVE_GAP_START && barIndex < WAVE_GAP_END;
  const swing = Math.abs(Math.sin(barIndex * 0.9)) * 26;
  return {
    key: `bar-${barIndex}`,
    height: isInGap ? 2 : Math.round(8 + swing),
    isInGap,
  };
});

/**
 * The Studio 500, inside the Studio frame and following the app theme. It
 * says what happened (a fault in this page's code stopped it) and offers a
 * Retry and Studio home. It makes no claim about payouts, incident numbers
 * or who was told, since none of that is known here.
 *
 * Under StudioErrorBoundary, Retry re-renders the page that crashed, and
 * once that Retry crashed again it becomes a full reload. On the
 * /studio/500 route itself it reloads the tab.
 */
export function Studio500Page() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:error500.eyebrow"));
  const errorRetry = useStudioErrorRetry();
  const shouldReload = !errorRetry || errorRetry.hasRetried;
  const retry = shouldReload
    ? () => window.location.reload()
    : errorRetry.onRetry;

  return (
    <StudioShell>
      <section
        className={`${styles.err} ${styles.errOrbLeft}`}
        aria-labelledby="studio-500-title"
      >
        <div className={styles.errNum} aria-hidden>
          500
        </div>
        <div className={styles.errContent}>
          <p className={styles.errEyebrow}>{t("studio:error500.eyebrow")}</p>
          <h1 id="studio-500-title" className={styles.errTitle}>
            <Translation
              i18nKey="studio:error500.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("studio:error500.body")}</p>

          <div className={styles.deadairWave} aria-hidden>
            {WAVE_BARS.map((bar) => (
              <span
                key={bar.key}
                className={bar.isInGap ? styles.waveGap : undefined}
                style={{ height: bar.height }}
              />
            ))}
          </div>

          <div className={styles.errActions}>
            <Button onClick={retry}>
              {t(
                errorRetry?.hasRetried
                  ? "studio:error500.reloadCta"
                  : "studio:error500.tryAgainCta",
              )}
            </Button>
            <Button variant="quiet" to={routes.studio}>
              {t("studio:error500.backCta")}
            </Button>
          </div>
        </div>
      </section>
    </StudioShell>
  );
}

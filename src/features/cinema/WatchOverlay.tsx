import { Button, ModalSheet } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CONTENT_NOTES } from "./watchPage.data";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

/**
 * Content-advisory gate shown before playback. Rendered through the shared
 * `ModalSheet` (plum success surface) so its focus-trap, Escape-to-dismiss,
 * focus-restore and modal-stack come from the one audited primitive instead of
 * a hand-rolled copy. `onDismiss` clears the gate and reveals the player.
 */
export function WatchOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      success
      onClose={onDismiss}
      ariaLabel={t("cinema:watch.overlay.ariaLabel")}
    >
      <div className={styles.overlayCard}>
        <div className={styles.overlayIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <circle cx={12} cy={12} r={10} />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div className={styles.overlayHead}>
          <Translation
            i18nKey="cinema:watch.overlay.heading"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.overlaySub}>
          {t("cinema:watch.overlay.sub", { count: CONTENT_NOTES.length })}
        </div>
        <div className={styles.overlayNotes}>
          {CONTENT_NOTES.map((note) => (
            <div key={note.k} className={styles.overlayRow}>
              <span className="k">{note.k}</span>
              <span>{note.detail}</span>
              {note.tc ? <span className="t">{note.tc}</span> : null}
            </div>
          ))}
        </div>
        <div className={styles.overlayActions}>
          <Button size="lg" onClick={onDismiss}>
            {t("cinema:watch.overlay.readyCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.film}>
            {t("cinema:watch.overlay.backCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}

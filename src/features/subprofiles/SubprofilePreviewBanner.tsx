import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofilePreviewBanner.module.css";

/**
 * The floating pill shown while a persona's owner reads their own page as a
 * visitor (`mode="visitor"`, entered from the hero's `View as visitor`), with
 * the way back out.
 *
 * Fixed to the foot of the viewport rather than stacked above the content like
 * {@link SubprofileDraftBanner}: a persona page is long (cover, hero,
 * spotlight, every section, the endorsers foot), and the whole point of this
 * mode is to scroll it the way a stranger would, so the exit has to stay
 * reachable from wherever the owner ends up. Mirrors `ProfilePreviewBanner`,
 * the same affordance on a member profile, deliberately down to the plum pill
 * — two previews that behave alike should look alike.
 */
export function SubprofilePreviewBanner({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.bar} role="status">
      <span className={styles.text}>
        <Translation
          i18nKey="subprofiles:page.previewBanner"
          components={{ strong: <strong /> }}
        />
      </span>
      <Button variant="ghost-dark" onClick={onExit}>
        {t("subprofiles:page.exitPreview")}
      </Button>
    </div>
  );
}

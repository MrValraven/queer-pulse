import { useId } from "react";
import { FiShuffle } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSceneView } from "./api/studioDiscovery.adapters";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { shuffledItems } from "./player/studioQueue";
import styles from "./studio.module.css";
import css from "./StudioScene.module.css";

/** Cover, name, city and blurb, with Play scene: the loaded releases in a
 *  browser shuffle, each release's tracks in order. */
export function StudioSceneHero({
  scene,
  releasesResult,
}: {
  scene: StudioSceneView;
  releasesResult: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const player = useStudioPlayer();
  const releaseIds = releasesResult.releases.map((release) => release.id);
  const hasReleases = releaseIds.length > 0;
  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          <ImageSlot
            src={scene.coverUrl ?? undefined}
            tint={scene.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={scene.name}
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
          />
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.eb}>
            {t("studio:scene.eyebrow", { city: scene.city })}
          </div>
          <h1 id={headingId}>{scene.name}</h1>
          {scene.blurb && <p className={css.blurb}>{scene.blurb}</p>}
          <div className={styles.heroActions}>
            <Button
              variant="primary"
              aria-disabled={!hasReleases || undefined}
              onClick={() => {
                if (!hasReleases) return;
                void player.playReleases(shuffledItems(releaseIds));
              }}
            >
              <FiShuffle aria-hidden /> {t("studio:scene.playCta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

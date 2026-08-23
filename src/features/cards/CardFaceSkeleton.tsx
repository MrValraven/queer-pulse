import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MembershipCardFace.module.css";

/**
 * What stands in for a membership card while its images are still decoding.
 *
 * Deliberately the card's own front face — the same `.face`/`.faceFront` grid,
 * the same padding, the same skin colour — with shimmering blocks where the
 * crest, the two lines of the community's name, the portrait and the holder's
 * name are about to land. Two things follow from that. The footprint is
 * already exactly right, so nothing shifts when the real card replaces it; and
 * what a holder sees is recognisably THEIR card arriving rather than a generic
 * grey rectangle that happens to be card-shaped.
 *
 * The community's ground is NOT drawn here (`hasGround` is withheld until the
 * images are ready), so a half-loaded flag never peeks through, and the flat
 * skin underneath it is the one thing about the card that needs no network.
 * The gloss laminate is left off for the same reason: without a photo or a
 * flag beneath it there is nothing for a specular band to be reflecting.
 *
 * The blocks are `aria-hidden`; the sr-only line does the announcing, since
 * "image placeholder, image placeholder, image placeholder" is not what a
 * screen-reader user needs to hear after pressing Show.
 */
export function CardFaceSkeleton({ skinClass }: { skinClass?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={[styles.face, styles.faceFront, skinClass]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="visuallyHidden" role="status">
        {t("cards:face.loading")}
      </span>

      <div className={styles.head} aria-hidden="true">
        <span className={[styles.ghost, styles.ghostCrest].join(" ")} />
        {/* The accent bar is the community's own token and costs no network,
            so it is drawn for real: one line of the finished card is already
            true while the rest arrives. */}
        <span className={styles.accentBar} />
        <div className={styles.ghostNames}>
          <span className={[styles.ghost, styles.ghostCommunity].join(" ")} />
          <span className={[styles.ghost, styles.ghostCardName].join(" ")} />
        </div>
      </div>

      {/* Always drawn, even for a card that will have no portrait: whether
          there is one is not knowable until the images resolve, and a ghost
          that reserves the space is better than a layout that grows a photo
          into an empty half at the last moment. */}
      <span
        className={[styles.ghost, styles.ghostPortrait].join(" ")}
        aria-hidden="true"
      />

      <div className={styles.foot} aria-hidden="true">
        <span className={[styles.ghost, styles.ghostHolder].join(" ")} />
      </div>
    </div>
  );
}

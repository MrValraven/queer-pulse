import type { CSSProperties } from "react";
import { FiExternalLink } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { Eyebrow, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccentKey } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { accentTintStyle } from "./subprofilePresence.data";
import { BlurredPhoto } from "./BlurredPhoto";
import { isItemPhotoBlurred } from "./skins/tattoo/tattooItemImages";
import styles from "./SubprofileShowcase.module.css";

const FEATURED_THUMBNAIL_SIZE = 64;

/** A definite 64px box for the blur frame, which fills its parent; the
 *  radius clips the scaled, blurred edge to the thumbnail's own corners. */
const BLURRED_THUMBNAIL_FRAME_STYLE: CSSProperties = {
  width: FEATURED_THUMBNAIL_SIZE,
  height: FEATURED_THUMBNAIL_SIZE,
  borderRadius: "var(--radius-10)",
  overflow: "hidden",
};

/**
 * Compact horizontal preview of the persona's single featured work item,
 * shown inside `SubprofileFeatureCard`. A condensed sibling of the full-bleed
 * `SubprofileSpotlight` (used on the persona page itself) — a thumbnail, the
 * title, and (when the item has a safe URL) an external-link affordance. The
 * whole row becomes a real `<a>` only when there's somewhere for it to go, so
 * it never renders a dead/non-interactive link. Callers gate on
 * `persona.featured` — this component always has an item to show.
 */
export function SubprofileFeaturedStrip({
  item,
  accent,
}: {
  item: SubprofileItemView;
  accent: AccentKey;
}) {
  const { t } = useTranslation();
  // Guard the member-supplied URL the same way the persona CTA and social
  // links are guarded — never trust a raw stored value in an href.
  const featuredHref = safeHref(item.url);

  // The strip can be a link, so a blurred thumbnail stays blurred with no
  // Show photo button; the full photo uncovers on the persona page.
  const isThumbnailBlurred = Boolean(item.imageUrl) && isItemPhotoBlurred(item);
  const thumbnail = item.imageUrl ? (
    <ImageSlot
      src={item.imageUrl}
      alt=""
      tint="plum"
      radius={10}
      width={FEATURED_THUMBNAIL_SIZE}
      height={FEATURED_THUMBNAIL_SIZE}
      // The blur frame carries the flex class when the thumbnail is blurred.
      className={isThumbnailBlurred ? undefined : styles.featuredStripThumb}
    />
  ) : null;

  const content = (
    <>
      {isThumbnailBlurred ? (
        <div
          className={styles.featuredStripThumb}
          style={BLURRED_THUMBNAIL_FRAME_STYLE}
        >
          <BlurredPhoto
            isBlurred
            isRevealable={false}
            revealKey={item.imageUrl}
          >
            {thumbnail}
          </BlurredPhoto>
        </div>
      ) : (
        thumbnail
      )}
      <div className={styles.featuredStripBody}>
        <Eyebrow className={styles.featuredStripEyebrow}>
          {t("subprofiles:alsoAs.featuredEyebrow")}
        </Eyebrow>
        <p className={styles.featuredStripTitle}>{item.title}</p>
      </div>
      {featuredHref && (
        <FiExternalLink aria-hidden className={styles.featuredStripIcon} />
      )}
    </>
  );

  if (!featuredHref) {
    return (
      <div className={styles.featuredStrip} style={accentTintStyle(accent)}>
        {content}
      </div>
    );
  }

  return (
    <a
      className={`${styles.featuredStrip} ${styles.featuredStripLink}`}
      style={accentTintStyle(accent)}
      href={featuredHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringPage.module.css";

/**
 * The cover the host uploaded, as a wide banner at the top of the main column.
 *
 * The frame is 2:1 because that is the shape the upload pipeline crops covers
 * to ("event-cover", min 1200x600), so the photo fills it without a second
 * crop. It loads eagerly at high priority because it is the page's
 * above-the-fold hero and the likely LCP element. A gathering with no cover
 * renders nothing, and the type row and title open the column. The radius
 * rides in `style` because `ImageSlot` writes its numeric `radius` inline and
 * spreads `style` after it.
 */
export function GatheringCover({ gathering }: { gathering: GatheringDetail }) {
  const { t } = useTranslation();
  if (!gathering.coverImageUrl) return null;

  return (
    <ImageSlot
      src={gathering.coverImageUrl}
      alt={t("gatherings:gathering.coverAlt", { title: gathering.title })}
      tint="plum"
      width="100%"
      height="auto"
      className={styles.cover}
      style={{
        aspectRatio: "2 / 1",
        height: "auto",
        borderRadius: "var(--radius-card)",
      }}
      loading="eager"
      fetchPriority="high"
    />
  );
}

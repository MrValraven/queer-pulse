import { ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooOut.module.css";

/** The studio and process photos; each opens the page's lightbox. Gallery photos carry no blur. */
export function TattooGallery({ view, onOpenGalleryPhoto }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="gallery"
      heading={t("subprofiles:tattoo.block.gallery.heading")}
      hasContent={view.hasContent.gallery}
      emptyBodyKey="subprofiles:tattoo.block.gallery.empty"
      emptyActionKey="subprofiles:tattoo.block.gallery.action"
    >
      <ul className={styles.cards}>
        {view.itemsBySection.gallery.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.photoButton}
              aria-label={
                item.title ||
                item.subtitle ||
                t("subprofiles:tattoo.gallery.photoFallback")
              }
              onClick={() => onOpenGalleryPhoto?.(item)}
            >
              <ImageSlot
                src={item.imageUrl}
                alt={item.title}
                height={180}
                radius={10}
              />
            </button>
          </li>
        ))}
      </ul>
    </TattooBlock>
  );
}

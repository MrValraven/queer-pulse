import { useState, type ReactNode } from "react";
import { m } from "motion/react";
import { ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { PersonaViewMode } from "../../personaSkinRender";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { RevealBlock } from "./TherapistReveal";
import { occurrenceKeys, useRevealTransition } from "./revealKeys";
import styles from "./TherapistGallery.module.css";

/** The same cap `SubprofileSections` renders and `getGalleryWorks` gives
 *  the lightbox, so every tile opens onto its own photo. */
const MAX_VISIBLE_PHOTOS = 6;
/** Pixels to ask the image host for: the lead tile spans two thirds of the
 *  main column, the others one third. */
const LEAD_SRC_SIZE = 960;
const TILE_SRC_SIZE = 560;
/** The reading column's gap (`.main` in TherapistBody.module.css). */
const MAIN_COLUMN_GAP = 16;

interface TherapistGalleryProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
}

/**
 * "A look inside": the persona's `gallery` photos as a grid. From three
 * photos the first one leads, large, with two beside it; phones show two
 * across, up to six (the lightbox reaches no further). Tiles open the
 * page's gallery lightbox, except in the editor preview, where they are
 * plain images. The section grows in with the first photo and folds away
 * with the last.
 */
export function TherapistGallery({
  data,
  view,
  mode,
  onOpenGalleryPhoto,
}: TherapistGalleryProps) {
  const { t } = useTranslation();
  // Image-less items go BEFORE the cap, as in `SubprofileSections` and
  // `getGalleryWorks`, so the tiles line up 1:1 with the lightbox.
  const photos = (
    data.sections.find((section) => section.section === "gallery")?.items ?? []
  ).filter((item) => item.imageUrl);
  const visiblePhotos = photos.slice(0, MAX_VISIBLE_PHOTOS);
  const photoKeys = occurrenceKeys(visiblePhotos.map((item) => item.id));
  // The photos on screen at the first render show as is; one added later
  // pops in.
  const [firstRenderKeys] = useState(() => new Set(photoKeys));
  const onOpen =
    mode !== "preview" && onOpenGalleryPhoto ? onOpenGalleryPhoto : undefined;
  const name = view.firstName || data.displayName;

  return (
    <RevealBlock isShown={photos.length > 0} parentGap={MAIN_COLUMN_GAP}>
      <TherapistSection
        label={t("subprofiles:therapist.gallery.label")}
        heading={t("subprofiles:therapist.gallery.heading")}
        editTarget={THERAPIST_EDIT_TARGETS.gallery}
      >
        <ul className={styles.grid} data-count={visiblePhotos.length}>
          {visiblePhotos.map((item, photoIndex) => {
            const photoKey = photoKeys[photoIndex] ?? item.id;
            return (
              <GalleryCell
                key={photoKey}
                isAdded={!firstRenderKeys.has(photoKey)}
              >
                <GalleryTile
                  item={item}
                  number={photoIndex + 1}
                  name={name}
                  isLead={photoIndex === 0 && visiblePhotos.length >= 3}
                  onOpen={onOpen}
                />
              </GalleryCell>
            );
          })}
        </ul>
      </TherapistSection>
    </RevealBlock>
  );
}

const POP_HIDDEN = { opacity: 0, scale: 0.85 };
const POP_SHOWN = { opacity: 1, scale: 1 };

/** One grid cell. A photo added after the first render pops in (fade and
 *  scale, as `RevealPop` does). A removed photo leaves at once, with no
 *  AnimatePresence to hold it: the cells take their spans from `data-count`
 *  and `:nth-child`, so a cell kept while it faded would lay the grid out for
 *  a count it no longer has. */
function GalleryCell({
  isAdded,
  children,
}: {
  isAdded: boolean;
  children: ReactNode;
}) {
  const transition = useRevealTransition();
  return (
    <m.li
      className={styles.cell}
      initial={isAdded ? POP_HIDDEN : false}
      animate={POP_SHOWN}
      transition={transition}
    >
      {children}
    </m.li>
  );
}

interface GalleryTileProps {
  item: SubprofileItemView;
  /** 1-based position, for the alt text of an untitled photo. */
  number: number;
  name: string;
  isLead: boolean;
  /** Absent in the editor preview: the tile is then a plain image. */
  onOpen?: (item: SubprofileItemView) => void;
}

function GalleryTile({ item, number, name, isLead, onOpen }: GalleryTileProps) {
  const { t } = useTranslation();
  const alt =
    item.title.trim() ||
    t("subprofiles:therapist.gallery.alt", { number: String(number), name });
  const content = (
    <>
      <ImageSlot
        src={item.imageUrl}
        alt={alt}
        width="100%"
        height="100%"
        radius={0}
        loading="lazy"
        srcSize={isLead ? LEAD_SRC_SIZE : TILE_SRC_SIZE}
      />
    </>
  );

  if (!onOpen) return <div className={styles.tile}>{content}</div>;

  const ariaLabel = t("subprofiles:therapist.gallery.openAria", { photo: alt });
  return (
    <button
      type="button"
      className={`${styles.tile} ${styles.button}`}
      onClick={() => onOpen(item)}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

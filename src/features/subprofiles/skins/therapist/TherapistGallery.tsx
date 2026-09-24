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
import styles from "./TherapistGallery.module.css";

/** The same cap `SubprofileSections` renders and `getGalleryWorks` gives
 *  the lightbox, so every tile opens onto its own photo. */
const MAX_VISIBLE_PHOTOS = 6;
/** Pixels to ask the image host for: the lead tile spans two thirds of the
 *  main column, the others one third. */
const LEAD_SRC_SIZE = 960;
const TILE_SRC_SIZE = 560;

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
 * plain images. `null` without photos.
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
  if (photos.length === 0) return null;
  const visiblePhotos = photos.slice(0, MAX_VISIBLE_PHOTOS);
  const onOpen =
    mode !== "preview" && onOpenGalleryPhoto ? onOpenGalleryPhoto : undefined;
  const name = view.firstName || data.displayName;

  return (
    <TherapistSection
      label={t("subprofiles:therapist.gallery.label")}
      heading={t("subprofiles:therapist.gallery.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.gallery}
    >
      <ul className={styles.grid} data-count={visiblePhotos.length}>
        {visiblePhotos.map((item, photoIndex) => (
          <li key={`${item.imageUrl}::${photoIndex}`} className={styles.cell}>
            <GalleryTile
              item={item}
              number={photoIndex + 1}
              name={name}
              isLead={photoIndex === 0 && visiblePhotos.length >= 3}
              onOpen={onOpen}
            />
          </li>
        ))}
      </ul>
    </TherapistSection>
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

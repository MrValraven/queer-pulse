import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isUpcoming, sectionShape } from "./personaSkinRender";
import type { PersonaViewMode } from "./personaSkinRender";
import { poemPlainFirstLine } from "./poem/poemBlocks";
import { SubprofileItemRow } from "./SubprofileItemRow";
import { SubprofileItemTile } from "./SubprofileItemTile";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "./api/subprofiles.adapters";
import type { AccentKey } from "./api/subprofiles.api";
import type { SkinFamily } from "./subprofile-skins";

/** A `.pp-sec`'s items in `.pp-list`/`.pp-tiles`/`.pp-gallery`/upcoming+`.pp-past`
 *  shape, per `sectionShape()`. Shared by the content-section loop below. */
function SectionBody({
  shape,
  items,
  skin,
  interactive,
  onOpenWork,
  onOpenGalleryPhoto,
  onOpenPoem,
  displayName,
  accent,
}: {
  shape: "list" | "visual" | "gallery" | "stage-split";
  items: SubprofileItemView[];
  skin: SkinFamily;
  interactive: boolean;
  onOpenWork?: (item: SubprofileItemView) => void;
  /** Opens the gallery lightbox on a clicked `gallery` photo. Only wired when
   *  `interactive` (never in the editor preview); carries the item so the
   *  lightbox resolves it into its own flat index space (`getGalleryWorks`). */
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
  /** Opens the poem reader modal on a clicked `poems` row. Only wired when
   *  `interactive` (never in the editor preview). */
  onOpenPoem?: (item: SubprofileItemView) => void;
  /** The persona's display name — used to derive per-photo alt text for the
   *  caption-less `gallery` section (`subprofiles:galleryPhotoAlt`). */
  displayName: string;
  /** The persona's accent, threaded down to per-item social-link rows. */
  accent?: AccentKey;
}) {
  const { t } = useTranslation();

  if (shape === "gallery") {
    const canOpen = interactive && Boolean(onOpenGalleryPhoto);
    // Drop image-less items BEFORE the cap so no cell renders a dead
    // placeholder and the remaining indices line up 1:1 with the lightbox's
    // flat array (`getGalleryWorks` filters identically, then caps at 6).
    const photos = items
      .filter((galleryItem) => galleryItem.imageUrl)
      .slice(0, 6);
    return (
      <div className="pp-gallery" data-skin={skin}>
        {photos.map((galleryItem, photoIndex) => {
          const photo = (
            <ImageSlot
              src={galleryItem.imageUrl || undefined}
              alt={t("subprofiles:galleryPhotoAlt", {
                name: displayName,
                number: String(photoIndex + 1),
              })}
              radius={0}
              height="100%"
            />
          );
          return (
            <figure
              className="pp-gallery-cell"
              key={`${galleryItem.imageUrl}::${photoIndex}`}
            >
              {canOpen ? (
                <button
                  type="button"
                  className="pp-gallery-btn"
                  onClick={() => onOpenGalleryPhoto?.(galleryItem)}
                  aria-label={t("subprofiles:galleryPhotoOpen", {
                    name: displayName,
                    number: String(photoIndex + 1),
                  })}
                >
                  {photo}
                </button>
              ) : (
                photo
              )}
            </figure>
          );
        })}
      </div>
    );
  }

  if (shape === "visual") {
    return (
      <div className="pp-tiles">
        {items.map((item, index) => (
          <SubprofileItemTile
            key={`${item.title}::${item.date}::${index}`}
            item={item}
            index={index}
            onOpenWork={
              interactive && skin === "studio" ? onOpenWork : undefined
            }
          />
        ))}
      </div>
    );
  }

  if (shape === "stage-split") {
    const upcoming = items.filter((item) => isUpcoming(item.date));
    const past = items.filter((item) => !isUpcoming(item.date));
    return (
      <>
        <div className="pp-list">
          {upcoming.map((item, index) => (
            <SubprofileItemRow
              key={`${item.title}::${item.date}::${index}`}
              item={item}
              skin={skin}
              interactive={interactive}
              accent={accent}
            />
          ))}
        </div>
        {past.length > 0 && (
          <div className="pp-past">
            <span className="pp-past-label">{t("subprofiles:row.played")}</span>
            <div className="pp-list">
              {past.map((item, index) => (
                <SubprofileItemRow
                  key={`${item.title}::${item.date}::${index}`}
                  item={item}
                  skin={skin}
                  interactive={interactive}
                  accent={accent}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="pp-list">
      {items.map((item, index) => {
        const poemOpen =
          interactive && item.section === "poems" && onOpenPoem
            ? onOpenPoem
            : undefined;
        return (
          <SubprofileItemRow
            key={`${item.title}::${item.date}::${index}`}
            item={item}
            skin={skin}
            interactive={interactive}
            accent={accent}
            onOpen={poemOpen}
            teaser={
              poemOpen
                ? poemPlainFirstLine(item.structured?.poem ?? null) ||
                  item.description
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

/**
 * Renders a public persona's sections onto the page host's `.pp-body`. Each
 * section's shape (`.pp-list` / `.pp-tiles` / `.pp-gallery` /
 * upcoming+`.pp-past`) comes from
 * `sectionShape()` (Task 2) — same markup for every skin, `data-skin` on the
 * page's `.pp` ancestor decides how it looks.
 * `featuredHidden` drops the item already shown in the page's Spotlight (or,
 * for the table skin, its `MenuCard`) from its own section list.
 */
export function SubprofileSections({
  persona,
  skin,
  mode,
  featuredHidden,
  onOpenWork,
  onOpenGalleryPhoto,
  onOpenPoem,
}: {
  persona: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  featuredHidden: boolean;
  /** Opens the studio lightbox on a clicked tile — only meaningful (and only
   *  read) for `skin === "studio"`'s visual sections; see
   *  `SubprofileItemTile`. */
  onOpenWork?: (item: SubprofileItemView) => void;
  /** Opens the gallery lightbox on a clicked `gallery` photo — universal
   *  across every skin (see `SectionBody`'s `gallery` branch). */
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
  /** Opens the poem reader modal on a clicked `poems` row — see
   *  `SectionBody`'s default `list` branch. */
  onOpenPoem?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const interactive = mode !== "preview";

  return (
    <>
      {persona.sections.map((section) => {
        const items = featuredHidden
          ? section.items.filter((item) => !item.isFeatured)
          : section.items;
        if (items.length === 0) return null;
        const shape = sectionShape(section.section, skin, items);
        return (
          <section key={section.section} className="pp-sec">
            <header>
              <h2>{t(section.labelKey)}</h2>
              {items.length > 1 && (
                <span
                  className="count"
                  aria-label={t("subprofiles:section.countLabel", {
                    count: items.length,
                  })}
                >
                  {items.length}
                </span>
              )}
            </header>
            <SectionBody
              shape={shape}
              items={items}
              skin={skin}
              interactive={interactive}
              onOpenWork={onOpenWork}
              onOpenGalleryPhoto={onOpenGalleryPhoto}
              onOpenPoem={onOpenPoem}
              displayName={persona.displayName}
              accent={persona.accent ?? undefined}
            />
          </section>
        );
      })}
    </>
  );
}

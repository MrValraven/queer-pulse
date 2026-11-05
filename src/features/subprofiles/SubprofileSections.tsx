import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isUpcoming, sectionShape } from "./personaSkinRender";
import type { PersonaViewMode } from "./personaSkinRender";
import { SubprofileItemRow } from "./SubprofileItemRow";
import { PersonaSectionHeader } from "./PersonaSectionHeader";
import { PoemsEmptyOwner } from "./PoemsEmptyOwner";
import { PoemsToc } from "./PoemsToc";
import { EventsEmptyOwner } from "./EventsEmptyOwner";
import { EventsTimeline } from "./EventsTimeline";
import { PosterCreditsGrid } from "./PosterCreditsGrid";
import { isEventSection } from "./eventDates";
import {
  ownerEmptyEventSection,
  withOwnerEmptySections,
} from "./ownerPoemsSection";
import { SubprofileItemTile } from "./SubprofileItemTile";
import { PersonaStudioPlaylists } from "./PersonaStudioPlaylists";
import { PersonaStudioReleases } from "./PersonaStudioReleases";
import { studioSectionFor, usePersonaStudio } from "./personaStudio";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "./api/subprofiles.adapters";
import type { AccentKey, SubprofileKind } from "./api/subprofiles.api";
import type { SkinFamily } from "./subprofile-skins";

/** A `.pp-sec`'s items in `.pp-list`/`.pp-tiles`/`.pp-gallery`/upcoming+`.pp-past`
 *  shape, per `sectionShape()`. Shared by the content-section loop below. */
export function SectionBody({
  shape,
  items,
  skin,
  interactive,
  onOpenWork,
  onOpenGalleryPhoto,
  onOpenPoem,
  onOpenEvent,
  displayName,
  accent,
  kind,
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
  /** Opens the event sheet on a clicked Poster (collective) `events` or
   *  `nights` row. Only wired when `interactive`. */
  onOpenEvent?: (item: SubprofileItemView) => void;
  /** The persona's display name — used to derive per-photo alt text for the
   *  caption-less `gallery` section (`subprofiles:galleryPhotoAlt`). */
  displayName: string;
  /** The persona's accent, threaded down to per-item social-link rows. */
  accent?: AccentKey;
  /** The persona's kind, for the row's Listen / Watch link. */
  kind?: SubprofileKind;
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
              kind={kind}
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
                  kind={kind}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // A section holds one kind of item, so its first row names the section.
  // On a Poster page the events read as a timeline, and the clients and the
  // promoter's roster as a ruled grid of names.
  const sectionName = items[0]?.section;
  if (skin === "collective" && sectionName && isEventSection(sectionName)) {
    return (
      <EventsTimeline
        items={items}
        section={sectionName}
        interactive={interactive}
        onOpenEvent={onOpenEvent}
      />
    );
  }
  if (
    skin === "collective" &&
    (sectionName === "clients" || sectionName === "roster")
  ) {
    return <PosterCreditsGrid items={items} interactive={interactive} />;
  }

  // The poems section reads as contents grouped by year.
  if (sectionName === "poems") {
    return (
      <PoemsToc
        items={items}
        skin={skin}
        interactive={interactive}
        accent={accent}
        kind={kind}
        onOpenPoem={onOpenPoem}
      />
    );
  }

  return (
    <div className="pp-list">
      {items.map((item, index) => (
        <SubprofileItemRow
          key={`${item.title}::${item.date}::${index}`}
          item={item}
          skin={skin}
          interactive={interactive}
          accent={accent}
          kind={kind}
        />
      ))}
    </div>
  );
}

/**
 * Renders a public persona's sections onto the page host's `.pp-body`. Each
 * section's shape (`.pp-list` / `.pp-tiles` / `.pp-gallery` /
 * upcoming+`.pp-past`) comes from
 * `sectionShape()` (Task 2) — same markup for every skin, `data-skin` on the
 * page's `.pp` ancestor decides how it looks.
 * `featuredId` drops the item already shown in the page's Spotlight (or,
 * for the table skin, its `MenuCard`) from its own section list.
 */
export function SubprofileSections({
  persona,
  skin,
  mode,
  featuredId,
  onOpenWork,
  onOpenGalleryPhoto,
  onOpenPoem,
  onOpenEvent,
}: {
  persona: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  /** The item the Spotlight (or MenuCard) already shows, if any. */
  featuredId: string | null;
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
  /** Opens the event sheet on a clicked Poster `events`/`nights` row, see
   *  `SectionBody`'s collective events branch. */
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const interactive = mode !== "preview";
  const isOwner = mode === "owner";
  const studioSection = studioSectionFor(persona.kind);
  const studio = usePersonaStudio(persona);
  const hasStudioContent =
    studio.releases.length > 0 || studio.playlists.length > 0;
  // Only the owner sees a poems section before it has any poems in it, and
  // on a Poster page an events (or nights) section before the first event.
  const sections = isOwner
    ? withOwnerEmptySections(persona.sections, persona.kind)
    : persona.sections;
  const ownerEventSection = isOwner
    ? ownerEmptyEventSection(persona.kind)
    : null;
  const hasStudioSection = sections.some(
    (section) => section.section === studioSection,
  );

  return (
    <>
      {sections.map((section) => {
        // Only the one item the Spotlight shows leaves its list. Matching on
        // `isFeatured` alone dropped a second starred item from the page
        // entirely, shown neither in the Spotlight nor in its own section.
        const items =
          featuredId !== null
            ? section.items.filter(
                (item) => !(item.isFeatured && item.id === featuredId),
              )
            : section.items;
        const isStudioSection =
          section.section === studioSection && hasStudioContent;
        const isOwnerEmptyPoems =
          isOwner &&
          section.section === "poems" &&
          section.items.length === 0 &&
          !isStudioSection;
        if (isOwnerEmptyPoems) {
          return (
            <PoemsEmptyOwner
              key={section.section}
              personaId={persona.id}
              labelKey={section.labelKey}
            />
          );
        }
        const isOwnerEmptyEvents =
          section.section === ownerEventSection &&
          section.items.length === 0 &&
          !isStudioSection;
        if (isOwnerEmptyEvents) {
          return (
            <EventsEmptyOwner
              key={section.section}
              personaId={persona.id}
              section={section.section}
              labelKey={section.labelKey}
            />
          );
        }
        if (items.length === 0 && !isStudioSection) return null;
        const shape = sectionShape(section.section, skin, items);
        return (
          <section
            key={section.section}
            className="pp-sec"
            data-section={section.section}
            data-preview-anchor={`section:${section.section}`}
            aria-labelledby={`pp-sec-${section.section}`}
          >
            <PersonaSectionHeader
              section={section.section}
              labelKey={section.labelKey}
              items={items}
              captionItems={section.items}
            />
            {isStudioSection && (
              <>
                <PersonaStudioReleases
                  releases={studio.releases}
                  isInteractive={interactive}
                />
                <PersonaStudioPlaylists
                  playlists={studio.playlists}
                  isInteractive={interactive}
                />
              </>
            )}
            {items.length > 0 && (
              <SectionBody
                shape={shape}
                items={items}
                skin={skin}
                interactive={interactive}
                onOpenWork={onOpenWork}
                onOpenGalleryPhoto={onOpenGalleryPhoto}
                onOpenPoem={onOpenPoem}
                onOpenEvent={onOpenEvent}
                displayName={persona.displayName}
                accent={persona.accent ?? undefined}
                kind={persona.kind}
              />
            )}
          </section>
        );
      })}
      {studioSection && !hasStudioSection && hasStudioContent && (
        <section
          className="pp-sec"
          data-section={studioSection}
          data-preview-anchor={`section:${studioSection}`}
          aria-labelledby={`pp-sec-${studioSection}`}
        >
          <header>
            <h2 id={`pp-sec-${studioSection}`}>
              {t(`subprofiles:section.${studioSection}`)}
            </h2>
          </header>
          <PersonaStudioReleases
            releases={studio.releases}
            isInteractive={interactive}
          />
          <PersonaStudioPlaylists
            playlists={studio.playlists}
            isInteractive={interactive}
          />
        </section>
      )}
    </>
  );
}

import { useRef, type ReactNode } from "react";
import { FiBookmark } from "react-icons/fi";
import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { StudioLibraryGrid } from "./StudioLibraryGrid";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";
import { useStudioPlaylistCardMenu } from "./useStudioPlaylistCardMenu";
import {
  savedCoverTintOf,
  savedPlaylistIdOf,
  savedReleaseIdOf,
  useLibraryUnsave,
  useSavedPlaylistPlay,
  useSavedReleasePlay,
} from "./useStudioLibrarySavedCard";
import css from "./StudioLibrary.module.css";

/** The cover GET /me/saved read for an available save, else the wordless
 *  fallback with the title's first letter in the save's hue (an
 *  unavailable save always reads `coverUrl: null`). The save names no
 *  format, so the letter stands in for every kind. */
function SavedCover({ item }: { item: SavedItem }) {
  return (
    <StudioReleaseCoverArt
      src={item.coverUrl ?? null}
      title={item.title}
      format="music"
      tint={savedCoverTintOf(item.id)}
    />
  );
}

/** The creator line, then Withdrawn or No longer available on its own line
 *  for a save that can no longer play. */
function SavedMeta({ item }: { item: SavedItem }) {
  const { t } = useTranslation();
  const isUnavailable = isSavedItemUnavailable(item);
  const isWithdrawn = isUnavailable && item.unavailableReason === "withdrawn";
  return (
    <>
      {item.meta && <span className={css.savedMeta}>{item.meta}</span>}
      {isUnavailable && (
        <span className={css.savedNote}>
          {t(
            isWithdrawn
              ? "studio:withdrawnLive.rowLabel"
              : "studio:playlist.row.unavailable",
          )}
        </span>
      )}
    </>
  );
}

function SavedReleaseCard({ item, href }: { item: SavedItem; href: string }) {
  const play = useSavedReleasePlay(savedReleaseIdOf(item));
  const isPlayable = !isSavedItemUnavailable(item);
  return (
    <StudioMediaCard
      kind="release"
      href={href}
      title={item.title}
      meta={<SavedMeta item={item} />}
      cover={<SavedCover item={item} />}
      onPlay={isPlayable ? play.onPlay : undefined}
      isPlaying={play.isPlaying}
    />
  );
}

/** A saved playlist's card: a long press or a right-click opens the rail
 *  row's menu, whose Remove from Library is this grid's own (it fades the
 *  card out and offers Undo). */
function SavedPlaylistCard({
  item,
  href,
  onUnsave,
}: {
  item: SavedItem;
  href: string;
  onUnsave: () => void;
}) {
  const { t } = useTranslation();
  const play = useSavedPlaylistPlay(savedPlaylistIdOf(item));
  const cardMenu = useStudioPlaylistCardMenu(
    {
      key: item.id,
      playlistId: savedPlaylistIdOf(item),
      name: item.title,
      href,
      ownerName: item.meta ?? null,
      isCollaborative: false,
      isSaved: true,
      isOwner: false,
      hasEditRights: false,
      trackCount: null,
      coverUrls: play.cached?.coverUrls ?? [],
      tint: savedCoverTintOf(item.id),
    },
    onUnsave,
  );
  // A cached playlist with no covers yet takes the wordless fallback too.
  const cover = play.cached?.coverUrls.length ? (
    <StudioPlaylistCover
      coverUrls={play.cached.coverUrls}
      tint={play.cached.tint}
      label={t("studio:playlist.card.coverLabel")}
      radius={0}
    />
  ) : (
    <SavedCover item={item} />
  );
  return (
    // `display: contents` keeps the card the grid cell's own child; the
    // wrapper only arms the menu on the card's first press or focus.
    <div style={{ display: "contents" }} {...cardMenu.armProps}>
      <StudioMediaCard
        kind="playlist"
        href={href}
        title={item.title}
        meta={<SavedMeta item={item} />}
        cover={cover}
        onPlay={play.onPlay}
        isPlaying={play.isPlaying}
        menu={cardMenu.menu}
      />
      {cardMenu.dialogs}
    </div>
  );
}

/** A save that can no longer be opened keeps its card, unlinked, so the
 *  member can still see it went and remove it. */
function LostSavedCard({ item }: { item: SavedItem }) {
  return (
    <article className={css.lostCard}>
      <div className={css.lostFrame}>
        <SavedCover item={item} />
      </div>
      <h3 className={css.lostTitle}>{item.title}</h3>
      <div className={css.lostMeta}>
        <SavedMeta item={item} />
      </div>
    </article>
  );
}

/** One saved release or playlist: its card (play on hover, always on
 *  touch) and Remove from Library above the art. */
function StudioLibrarySavedCard({ item }: { item: SavedItem }) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const onUnsave = useLibraryUnsave(item, cardRef);
  const isUnavailable = isSavedItemUnavailable(item);
  const isWithdrawn = isUnavailable && item.unavailableReason === "withdrawn";
  const href =
    (!isUnavailable || isWithdrawn) && item.href ? linkToPath(item.href) : null;
  let card: ReactNode = <LostSavedCard item={item} />;
  if (href)
    card =
      item.kind === "studio_playlist" ? (
        <SavedPlaylistCard item={item} href={href} onUnsave={onUnsave} />
      ) : (
        <SavedReleaseCard item={item} href={href} />
      );
  return (
    <div
      ref={cardRef}
      className={css.savedCard}
      data-unavailable={isUnavailable || undefined}
    >
      {card}
      <div className={css.unsave}>
        <IconButton
          aria-label={t("studio:libraryLive.removeSavedAria", {
            title: item.title,
          })}
          tooltip
          onClick={onUnsave}
        >
          <FiBookmark fill="currentColor" aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}

/** Saved releases or playlists as cards with play and Remove from Library.
 *  A save our team took down reads "Withdrawn" and keeps its link (its page
 *  explains it); any other lost save stays, unlinked, as "No longer
 *  available" (the API names no other reason, on purpose). */
export function StudioLibrarySavedList({
  items,
  label,
}: {
  items: SavedItem[];
  label?: string;
}) {
  return (
    <StudioLibraryGrid label={label}>
      {items.map((item) => (
        <StudioLibrarySavedCard key={item.id} item={item} />
      ))}
    </StudioLibraryGrid>
  );
}

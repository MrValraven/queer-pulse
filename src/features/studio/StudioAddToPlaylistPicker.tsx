import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  LoadErrorState,
  LoadMoreFooter,
  Modal,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ToastType } from "../../shared/components/feedback/toastContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import {
  useStudioMyPlaylists,
  type StudioPlaylistListResult,
} from "./api/useStudioMyPlaylists";
import { useAddStudioPlaylistTracks } from "./api/useStudioPlaylistMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { StudioPickerLikedRow } from "./StudioPickerLikedRow";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import { StudioLine } from "./StudioSkeletons";
import type { StudioLikeSubject } from "./useStudioLike";
import css from "./StudioPlaylist.module.css";

interface PickTarget {
  id: string;
  name: string;
  trackCount: number;
}

/** What the toast says after an add. A single track that was already there
 *  reads "Already in"; a release whose tracks were all there already reads
 *  that it had nothing to add. */
function addedToastOf(
  addedCount: number,
  askedCount: number,
): { key: string; type: ToastType } {
  if (addedCount > 0)
    return { key: "studio:playlist.add.addedToast", type: "success" };
  if (askedCount > 1)
    return { key: "studio:playlist.add.nothingToAdd", type: "info" };
  return { key: "studio:playlist.add.alreadyThereToast", type: "info" };
}

/** The playlists once loaded, only those the member can add to (their own and
 *  the ones they edit; an invitee's card never appears). Liked songs (when
 *  offered) leads the list
 *  whatever the load state, since it needs no request. */
function PickerList({
  result,
  likedRow,
  busyPlaylistId,
  onPick,
}: {
  result: StudioPlaylistListResult;
  likedRow: ReactNode;
  busyPlaylistId: string | null;
  onPick: (target: PickTarget) => void;
}) {
  const { t } = useTranslation();
  const { loadState } = result;
  const playlists =
    loadState.isLoading || loadState.isError
      ? []
      : result.playlists.filter((card) => card.hasEditRights);
  const hasRows = Boolean(likedRow) || playlists.length > 0;
  return (
    <>
      {/* An explicit list role: VoiceOver drops the semantics of a list
          styled with list-style none, and a ul with role list trips
          jsx-a11y's redundant-role rule, so this follows DraftCardRibbonFacts. */}
      {hasRows && (
        <div
          className={css.pickerList}
          role="list"
          aria-label={t("studio:playlist.add.listLabel")}
        >
          {likedRow && <div role="listitem">{likedRow}</div>}
          {playlists.map((card: StudioPlaylistCardView) => (
            <div key={card.id} role="listitem">
              <Button
                variant="quiet"
                className={css.pickerRow}
                aria-disabled={busyPlaylistId !== null || undefined}
                aria-busy={busyPlaylistId === card.id || undefined}
                aria-label={t(
                  card.isCollaborative
                    ? "studio:playlist.add.addToCollaborativeAria"
                    : "studio:playlist.add.addToAria",
                  { name: card.name },
                )}
                onClick={() => onPick(card)}
              >
                <span className={css.pickerCover}>
                  <StudioPlaylistCover
                    coverUrls={card.coverUrls}
                    tint={card.tint}
                    label=""
                    radius={6}
                  />
                </span>
                <span className={css.pickerName}>{card.name}</span>
                {card.isCollaborative && (
                  <span className={css.pickerCollab} aria-hidden>
                    {t("studio:playlist.collab.chip")}
                  </span>
                )}
                <span className={css.pickerMeta}>
                  {t("studio:facts.trackCount", { count: card.trackCount })}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}
      {loadState.isLoading && (
        <div
          className={css.pickerSkeleton}
          role="status"
          aria-label={t("studio:loading.playlists")}
        >
          <StudioLine width="70%" height={18} />
          <StudioLine width="55%" height={18} />
          <StudioLine width="62%" height={18} />
        </div>
      )}
      {loadState.isError && (
        <LoadErrorState
          title={t("studio:playlist.add.loadError")}
          onRetry={loadState.retry}
          isRetrying={loadState.isRetrying}
          compact
        />
      )}
      {!hasRows && !loadState.isLoading && !loadState.isError && (
        <p className={css.pickerEmpty}>{t("studio:playlist.add.empty")}</p>
      )}
      {!loadState.isLoading &&
        !loadState.isError &&
        (result.hasMore || result.isFetchNextPageError) && (
          <LoadMoreFooter
            className={css.pickerMore}
            isFetchingNextPage={result.isFetchingNextPage}
            isFetchNextPageError={result.isFetchNextPageError}
            onLoadMore={result.fetchNextPage}
            label={t("studio:playlist.add.showMore")}
            loadingLabel={t("studio:playlist.add.loadingMore")}
            errorMessage={t("studio:playlist.add.loadMoreError")}
          />
        )}
    </>
  );
}

/**
 * "Add to playlist": Create playlist first, then Liked songs for a single
 * track, then the member's playlists. A pick appends the tracks (the server
 * skips any already there) and says where they went. Create playlist opens
 * the create dialog over this one and adds the tracks to the playlist it
 * makes. Liked songs toggles the like and closes. Mount inside
 * AnimatePresence.
 */
export function StudioAddToPlaylistPicker({
  trackIds,
  subjectTitle,
  likeSubject,
  onClose,
  onAdded,
}: {
  trackIds: string[];
  subjectTitle: string;
  /** One track's like; a whole release passes none and Liked songs stays out. */
  likeSubject?: StudioLikeSubject;
  onClose: () => void;
  /** After a pick saved, before the picker closes (a bulk add clears the
   *  selection it came from). */
  onAdded?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const mine = useStudioMyPlaylists();
  const add = useAddStudioPlaylistTracks();
  const [isCreating, setIsCreating] = useState(false);
  const [busyPlaylistId, setBusyPlaylistId] = useState<string | null>(null);

  async function addTo(target: PickTarget) {
    if (busyPlaylistId !== null) return;
    setBusyPlaylistId(target.id);
    try {
      const { addedCount } = await add.mutateAsync({
        playlistId: target.id,
        trackIds,
        previousTrackCount: target.trackCount,
      });
      const toast = addedToastOf(addedCount, trackIds.length);
      showToast(t(toast.key, { name: target.name }), toast.type);
      onAdded?.();
      onClose();
    } catch (error) {
      showToast(t(studioErrorMessageKeyOf(error)), "error");
    } finally {
      setBusyPlaylistId(null);
    }
  }

  return (
    <>
      <Modal
        title={t("studio:playlist.add.pickerTitle")}
        sub={subjectTitle}
        onClose={onClose}
        isStudioPlayerSurface
      >
        <Button
          variant="quiet"
          className={css.newRow}
          aria-disabled={busyPlaylistId !== null || undefined}
          onClick={() => {
            if (busyPlaylistId === null) setIsCreating(true);
          }}
        >
          <FiPlus aria-hidden className={css.newRowIcon} />
          {t("studio:playlist.add.newPlaylistCta")}
        </Button>
        <PickerList
          result={mine}
          likedRow={
            likeSubject && (
              <StudioPickerLikedRow
                subject={likeSubject}
                isDisabled={busyPlaylistId !== null}
                onClose={onClose}
              />
            )
          }
          busyPlaylistId={busyPlaylistId}
          onPick={(target) => void addTo(target)}
        />
      </Modal>
      <AnimatePresence>
        {isCreating && (
          <StudioPlaylistDialog
            key="create"
            mode="create"
            shouldToastOnSave={false}
            onClose={() => setIsCreating(false)}
            onSaved={(playlist) => {
              setIsCreating(false);
              void addTo({
                id: playlist.id,
                name: playlist.name,
                trackCount: 0,
              });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

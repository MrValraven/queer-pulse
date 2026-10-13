import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import {
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
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import { StudioLine } from "./StudioSkeletons";
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

function PickerList({
  result,
  busyPlaylistId,
  onPick,
}: {
  result: StudioPlaylistListResult;
  busyPlaylistId: string | null;
  onPick: (target: PickTarget) => void;
}) {
  const { t } = useTranslation();
  const { loadState, playlists } = result;
  if (loadState.isLoading)
    return (
      <div
        className={css.pickerSkeleton}
        role="status"
        aria-label={t("studio:states.loadingLabel")}
      >
        <StudioLine width="70%" height={18} />
        <StudioLine width="55%" height={18} />
        <StudioLine width="62%" height={18} />
      </div>
    );
  if (loadState.isError)
    return (
      <LoadErrorState
        title={t("studio:playlist.add.loadError")}
        onRetry={loadState.retry}
        isRetrying={loadState.isRetrying}
        compact
      />
    );
  if (playlists.length === 0)
    return <p className={css.pickerEmpty}>{t("studio:playlist.add.empty")}</p>;
  return (
    <>
      {/* An explicit list role: VoiceOver drops the semantics of a list
          styled with list-style none, and a ul with role list trips
          jsx-a11y's redundant-role rule, so this follows DraftCardRibbonFacts. */}
      <div
        className={css.pickerList}
        role="list"
        aria-label={t("studio:playlist.add.listLabel")}
      >
        {playlists.map((card: StudioPlaylistCardView) => (
          <div key={card.id} role="listitem">
            <button
              type="button"
              className={css.pickerRow}
              aria-disabled={busyPlaylistId !== null || undefined}
              aria-busy={busyPlaylistId === card.id || undefined}
              aria-label={t("studio:playlist.add.addToAria", {
                name: card.name,
              })}
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
              <span className={css.pickerMeta}>
                {t("studio:facts.trackCount", { count: card.trackCount })}
              </span>
            </button>
          </div>
        ))}
      </div>
      {(result.hasMore || result.isFetchNextPageError) && (
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
 * "Add to playlist": the member's playlists with Create playlist first. A
 * pick appends the tracks (the server skips any already there) and says
 * where they went. Create playlist opens the create dialog over this one and
 * adds the tracks to the playlist it makes. Mount inside AnimatePresence.
 */
export function StudioAddToPlaylistPicker({
  trackIds,
  subjectTitle,
  onClose,
}: {
  trackIds: string[];
  subjectTitle: string;
  onClose: () => void;
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
      >
        <button
          type="button"
          className={css.newRow}
          aria-disabled={busyPlaylistId !== null || undefined}
          onClick={() => {
            if (busyPlaylistId === null) setIsCreating(true);
          }}
        >
          <FiPlus aria-hidden className={css.newRowIcon} />
          {t("studio:playlist.add.newPlaylistCta")}
        </button>
        <PickerList
          result={mine}
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

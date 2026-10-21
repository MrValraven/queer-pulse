import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLikedTracks } from "./api/useStudioLikedTracks";
import { StudioLikedCover } from "./StudioLikedCover";
import { useStudioLike, type StudioLikeSubject } from "./useStudioLike";
import css from "./StudioPlaylist.module.css";

/** Liked songs as the first playlist in the picker. It toggles the like and
 *  closes the picker; the tick shows the track is already liked. The track
 *  count joins once the list has loaded, as the other rows show theirs. */
export function StudioPickerLikedRow({
  subject,
  isDisabled,
  onClose,
}: {
  subject: StudioLikeSubject;
  isDisabled: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { isLiked, toggle } = useStudioLike(subject);
  const { trackCount, loadState } = useStudioLikedTracks();
  const hasTrackCount = !loadState.isLoading && !loadState.isError;
  return (
    <Button
      variant="quiet"
      className={css.pickerRow}
      aria-pressed={isLiked}
      aria-label={t("studio:liked.title")}
      aria-disabled={isDisabled || undefined}
      onClick={() => {
        if (isDisabled) return;
        toggle();
        onClose();
      }}
    >
      <span className={css.pickerCover}>
        <StudioLikedCover radius={6} />
      </span>
      <span className={css.pickerName}>{t("studio:liked.title")}</span>
      {hasTrackCount && (
        <span className={css.pickerMeta}>
          {t("studio:facts.trackCount", { count: trackCount })}
        </span>
      )}
      <FiCheck aria-hidden fill="none" className={css.pickerTick} />
    </Button>
  );
}

import { useTranslation } from "../../shared/i18n/useTranslation";
import { isTranscriptFormat } from "./api/studio.adapters";
import { STUDIO_LIMITS, type StudioFormat } from "./api/studio.types";
import css from "./StudioTrackFields.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

/** The words field (spec 6.4): Lyrics for music and performance, Transcript
 *  for podcast and spoken word, each with its hint and its cap (spec 4.5). */
export function StudioTrackWordsField({
  id,
  format,
  value,
  onChange,
}: {
  id: string;
  format: StudioFormat;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const isTranscript = isTranscriptFormat(format);
  const hintId = `${id}-hint`;
  return (
    <>
      <label className={tracksStyles.fieldLabel} htmlFor={id}>
        {t(
          isTranscript
            ? "studio:uploadFlow.files.transcriptLabel"
            : "studio:uploadFlow.files.lyricsLabel",
        )}
      </label>
      <p id={hintId} className={css.hint}>
        {t(
          isTranscript
            ? "studio:uploadFlow.files.transcriptHint"
            : "studio:uploadFlow.files.lyricsHint",
        )}
      </p>
      <textarea
        id={id}
        rows={isTranscript ? 10 : 6}
        value={value}
        maxLength={
          isTranscript ? STUDIO_LIMITS.transcriptMax : STUDIO_LIMITS.lyricsMax
        }
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}

/** Show notes on a podcast track (spec 6.2), up to 4000 characters, with a
 *  live count. */
export function StudioTrackNotesField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const hintId = `${id}-hint`;
  const countId = `${id}-count`;
  return (
    <>
      <label className={tracksStyles.fieldLabel} htmlFor={id}>
        {t("studio:uploadFlow.files.notesLabel")}
      </label>
      <p id={hintId} className={css.hint}>
        {t("studio:uploadFlow.files.notesHint")}
      </p>
      <textarea
        id={id}
        rows={8}
        value={value}
        maxLength={STUDIO_LIMITS.notesMax}
        aria-describedby={`${hintId} ${countId}`}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id={countId} className={css.count}>
        {t("studio:uploadFlow.files.countLabel", {
          count: value.length,
          max: STUDIO_LIMITS.notesMax,
        })}
      </p>
    </>
  );
}

import { useState, type ClipboardEvent } from "react";
import { Collapse, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isTranscriptFormat } from "./api/studio.adapters";
import { STUDIO_LIMITS, type StudioFormat } from "./api/studio.types";
import css from "./StudioTrackFields.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

/** True when a paste into `field` runs past `max`, so `maxLength` is about
 *  to drop its tail. */
function isPasteOverCap(
  event: ClipboardEvent<HTMLTextAreaElement>,
  max: number,
): boolean {
  const field = event.currentTarget;
  const pasted = event.clipboardData.getData("text").length;
  const replaced = field.selectionEnd - field.selectionStart;
  return field.value.length - replaced + pasted > max;
}

/** A long text field with its hint, a live count against its cap, and a
 *  line that says so when a paste was cut at the cap (the field keeps the
 *  start and drops the rest). */
function CappedTextField({
  id,
  label,
  hint,
  value,
  max,
  rows,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  max: number;
  rows: number;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [wasPasteCut, setWasPasteCut] = useState(false);
  const isAtCap = value.length >= max;
  return (
    <>
      <FormField
        className={`${css.studioField} ${tracksStyles.wordsField}`}
        label={label}
        helper={
          <>
            {hint}{" "}
            <span className={isAtCap ? css.countOver : undefined}>
              {t("studio:uploadFlow.files.countLabel", {
                count: value.length,
                max,
              })}
            </span>
          </>
        }
      >
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={max}
          onPaste={(event) => setWasPasteCut(isPasteOverCap(event, max))}
          onChange={(event) => {
            if (event.target.value.length < max) setWasPasteCut(false);
            onChange(event.target.value);
          }}
        />
      </FormField>
      <div role="status">
        <Collapse isOpen={wasPasteCut}>
          <p className={css.error}>
            {t("studio:uploadFlow.files.pasteCut", { max })}
          </p>
        </Collapse>
      </div>
    </>
  );
}

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
  return (
    <CappedTextField
      id={id}
      label={t(
        isTranscript
          ? "studio:uploadFlow.files.transcriptLabel"
          : "studio:uploadFlow.files.lyricsLabel",
      )}
      hint={t(
        isTranscript
          ? "studio:uploadFlow.files.transcriptHint"
          : "studio:uploadFlow.files.lyricsHint",
      )}
      value={value}
      max={isTranscript ? STUDIO_LIMITS.transcriptMax : STUDIO_LIMITS.lyricsMax}
      rows={isTranscript ? 10 : 6}
      onChange={onChange}
    />
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
  return (
    <CappedTextField
      id={id}
      label={t("studio:uploadFlow.files.notesLabel")}
      hint={t("studio:uploadFlow.files.notesHint")}
      value={value}
      max={STUDIO_LIMITS.notesMax}
      rows={8}
      onChange={onChange}
    />
  );
}

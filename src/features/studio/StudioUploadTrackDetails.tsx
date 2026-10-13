import { useId, useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import { useStudioTrack } from "./api/useStudioTrack";
import { useUpdateStudioTrack } from "./api/useStudioTrackMutations";
import { studioWriteErrorKeyOf } from "./studioUploadValidation";
import tracksStyles from "./StudioUploadTracks.module.css";

/** Title, credits, lyrics and the explicit flag of one track. `onDone`
 *  receives the saved title after a save, and nothing on Cancel. */
export function StudioUploadTrackDetails({
  trackId,
  releaseId,
  onDone,
}: {
  trackId: string;
  releaseId: string;
  onDone: (savedTitle?: string) => void;
}) {
  const { t } = useTranslation();
  const { track } = useStudioTrack(trackId);
  const update = useUpdateStudioTrack();
  const titleId = useId();
  const lyricsId = useId();
  const [title, setTitle] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isExplicit, setIsExplicit] = useState<boolean | null>(null);
  const [credits, setCredits] = useState<
    { name: string; role: string }[] | null
  >(null);
  const creditsRef = useRef<HTMLFieldSetElement>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  if (!track)
    return (
      <p className={tracksStyles.detailsLoading}>
        {t("studio:uploadFlow.files.loadingDetails")}
      </p>
    );

  // Read past the loading guard above, so `save` holds a loaded track's title.
  const storedTitle = track.title;
  const titleValue = title ?? storedTitle;
  const lyricsValue =
    lyrics ?? track.lyricStanzas.map((lines) => lines.join("\n")).join("\n\n");
  const explicitValue = isExplicit ?? track.isExplicit;
  const creditRows = credits ?? track.credits;

  async function save() {
    if (update.isPending) return;
    setErrorKey(null);
    const cleanCredits = creditRows
      .map((credit) => ({ name: credit.name.trim(), role: credit.role.trim() }))
      .filter((credit) => credit.name && credit.role);
    // An emptied title field keeps the stored title.
    const savedTitle = titleValue.trim() || storedTitle;
    try {
      await update.mutateAsync({
        trackId,
        releaseId,
        body: {
          title: savedTitle,
          lyrics: lyricsValue.trim() || null,
          isExplicit: explicitValue,
          credits: cleanCredits,
        },
      });
      onDone(savedTitle);
    } catch (error) {
      setErrorKey(studioWriteErrorKeyOf(error));
    }
  }

  function changeCredit(index: number, field: "name" | "role", value: string) {
    setCredits(
      creditRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  // The removed row's button unmounts with it: focus the next credit's name
  // field, else the previous one's, else the Add credit button.
  function removeCredit(index: number) {
    const remainingCount = creditRows.length - 1;
    setCredits(creditRows.filter((_row, rowIndex) => rowIndex !== index));
    requestAnimationFrame(() => {
      const fieldset = creditsRef.current;
      if (!fieldset) return;
      // Each credit row holds a name input then a role input.
      const textInputs =
        fieldset.querySelectorAll<HTMLInputElement>('input[type="text"]');
      const target =
        remainingCount > 0
          ? textInputs[Math.min(index, remainingCount - 1) * 2]
          : fieldset.querySelector<HTMLElement>("button:last-of-type");
      target?.focus();
    });
  }

  return (
    <div className={tracksStyles.details}>
      <label className={tracksStyles.fieldLabel} htmlFor={titleId}>
        {t("studio:uploadFlow.files.titleLabel")}
      </label>
      <input
        id={titleId}
        type="text"
        value={titleValue}
        maxLength={STUDIO_LIMITS.titleMax}
        onChange={(event) => setTitle(event.target.value)}
      />
      <fieldset ref={creditsRef} className={tracksStyles.credits}>
        <legend>{t("studio:uploadFlow.files.creditsLabel")}</legend>
        {creditRows.map((credit, index) => (
          // A credit has no id and these rows are never reordered.
          <div key={index} className={tracksStyles.creditRow}>
            <input
              type="text"
              value={credit.name}
              maxLength={STUDIO_LIMITS.creditFieldMax}
              aria-label={t("studio:uploadFlow.files.creditName", {
                number: index + 1,
              })}
              onChange={(event) =>
                changeCredit(index, "name", event.target.value)
              }
            />
            <input
              type="text"
              value={credit.role}
              maxLength={STUDIO_LIMITS.creditFieldMax}
              aria-label={t("studio:uploadFlow.files.creditRole", {
                number: index + 1,
              })}
              onChange={(event) =>
                changeCredit(index, "role", event.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeCredit(index)}
              aria-label={t("studio:uploadFlow.files.removeCredit", {
                number: index + 1,
              })}
            >
              <FiX aria-hidden />
            </button>
          </div>
        ))}
        {creditRows.length < STUDIO_LIMITS.creditsMax && (
          <button
            type="button"
            className={tracksStyles.addCredit}
            onClick={() => setCredits([...creditRows, { name: "", role: "" }])}
          >
            <FiPlus aria-hidden /> {t("studio:uploadFlow.files.addCredit")}
          </button>
        )}
      </fieldset>
      <label className={tracksStyles.fieldLabel} htmlFor={lyricsId}>
        {t("studio:uploadFlow.files.lyricsLabel")}
      </label>
      <textarea
        id={lyricsId}
        rows={6}
        value={lyricsValue}
        maxLength={STUDIO_LIMITS.lyricsMax}
        onChange={(event) => setLyrics(event.target.value)}
      />
      <label className={tracksStyles.checkbox}>
        <input
          type="checkbox"
          checked={explicitValue}
          onChange={(event) => setIsExplicit(event.target.checked)}
        />{" "}
        {t("studio:uploadFlow.files.explicitLabel")}
      </label>
      {errorKey && (
        <p className={tracksStyles.error} role="alert">
          {t(errorKey)}
        </p>
      )}
      <div className={tracksStyles.detailsActions}>
        <Button variant="ghost" onClick={() => onDone()}>
          {t("studio:uploadFlow.files.cancelDetails")}
        </Button>
        <Button
          onClick={() => void save()}
          aria-disabled={update.isPending || undefined}
        >
          {t("studio:uploadFlow.files.saveDetails")}
        </Button>
      </div>
    </div>
  );
}

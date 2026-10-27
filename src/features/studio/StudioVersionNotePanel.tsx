import { useQueryClient } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { studioErrorCodeOf } from "./api/studio.api";
import { STUDIO_VERSION_NOTE_MAX } from "./api/studio.types";
import { studioKeys } from "./api/studioQueryKeys";
import { useAddStudioReleaseVersion } from "./api/useStudioArtistToolsMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import styles from "./StudioVersionNote.module.css";

/** Shown above the tracks while a published release has track changes with
 *  no note. Saving the note makes the next version; followers get no second
 *  alert (spec 4.3). */
export function StudioVersionNotePanel({
  release,
  onSaved,
}: {
  release: StudioReleaseView;
  /** The panel folds away after a save; the page moves focus and speaks. */
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const countId = useId();
  const errorId = useId();
  const addVersion = useAddStudioReleaseVersion();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  // isPending is a render value; a second press before the re-render (a held
  // Enter) reads it stale, so one save per press is held in a ref.
  const isSavingRef = useRef(false);

  async function save() {
    if (isSavingRef.current) return;
    const trimmed = note.trim();
    if (!trimmed) {
      setErrorKey("studio:versions.panel.noteRequired");
      return;
    }
    setErrorKey(null);
    isSavingRef.current = true;
    try {
      await addVersion.mutateAsync({ releaseId: release.id, note: trimmed });
      setNote("");
      onSaved();
    } catch (error) {
      setErrorKey(studioErrorMessageKeyOf(error));
      // The server holds no unnoted change: refetch the release so its stale
      // flag drops and the panel folds away under its line.
      if (studioErrorCodeOf(error) === "studio_release_no_changes")
        void queryClient.invalidateQueries({
          queryKey: studioKeys.release(demoMode, release.id),
        });
    } finally {
      isSavingRef.current = false;
    }
  }

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h4 id={headingId} className={styles.heading}>
        <FiEdit3 aria-hidden /> {t("studio:versions.panel.heading")}
      </h4>
      <p className={styles.body}>
        {t("studio:versions.panel.body", { version: release.version + 1 })}
      </p>
      <label htmlFor={RELEASE_FIELD_IDS.versionNote} className={styles.label}>
        {t("studio:versions.panel.noteLabel")}
      </label>
      <textarea
        id={RELEASE_FIELD_IDS.versionNote}
        className={styles.note}
        rows={3}
        value={note}
        maxLength={STUDIO_VERSION_NOTE_MAX}
        placeholder={t("studio:versions.panel.notePlaceholder")}
        aria-invalid={errorKey ? true : undefined}
        aria-describedby={`${countId} ${errorId}`}
        onChange={(event) => setNote(event.target.value)}
      />
      <p id={countId} className={styles.count}>
        {t("studio:versions.panel.noteCount", {
          count: note.length,
          max: STUDIO_VERSION_NOTE_MAX,
        })}
      </p>
      <p id={errorId} className={styles.error} role="alert">
        {errorKey ? t(errorKey) : ""}
      </p>
      <Button
        onClick={() => void save()}
        aria-disabled={addVersion.isPending || undefined}
      >
        {addVersion.isPending
          ? t("studio:versions.panel.saving")
          : t("studio:versions.panel.saveCta")}
      </Button>
    </section>
  );
}

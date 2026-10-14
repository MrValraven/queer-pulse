import { useState } from "react";
import { FiList } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { chapterRowsFromNotes } from "./studioEpisodeChapters";
import { StudioChaptersEditor } from "./upload/chapters/StudioChaptersEditor";
import type { ChapterDraft } from "./upload/chapters/studioTracklist";
import css from "./StudioEpisodeUpload.module.css";

/** The episode's chapters: Listening's editor, open by default, with "Read
 *  chapters from the notes", which asks before it replaces rows that exist. */
export function StudioEpisodeChaptersField({
  rows,
  onChange,
  notes,
  durationSeconds,
  hasAudio,
  isShowingAllErrors,
}: {
  rows: readonly ChapterDraft[];
  onChange: (rows: ChapterDraft[]) => void;
  notes: string;
  durationSeconds: number | null;
  hasAudio: boolean;
  isShowingAllErrors: boolean;
}) {
  const { t } = useTranslation();
  const [pendingRows, setPendingRows] = useState<ChapterDraft[] | null>(null);
  const [status, setStatus] = useState<{ key: string; count: number } | null>(
    null,
  );
  const hasNotes = notes.trim().length > 0;

  function apply(parsed: ChapterDraft[]) {
    onChange(parsed);
    setStatus({
      key: "studio:episodeUpload.chaptersRead",
      count: parsed.length,
    });
  }

  function readFromNotes() {
    if (!hasNotes) return;
    const parsed = chapterRowsFromNotes(notes);
    if (parsed.length === 0) {
      setStatus({ key: "studio:episodeUpload.chaptersNoneFound", count: 0 });
      return;
    }
    if (rows.length > 0) setPendingRows(parsed);
    else apply(parsed);
  }

  return (
    <div className={css.chapters}>
      <button
        type="button"
        className={css.readChapters}
        aria-disabled={!hasNotes || undefined}
        onClick={readFromNotes}
      >
        <FiList aria-hidden /> {t("studio:episodeUpload.chaptersFromNotesCta")}
      </button>
      <p role="status" className={css.status}>
        {status ? t(status.key, { count: status.count }) : ""}
      </p>
      <StudioChaptersEditor
        rows={rows}
        onChange={onChange}
        durationSeconds={durationSeconds}
        hasAudio={hasAudio}
        isInitiallyOpen
        isEpisode
        isShowingAllErrors={isShowingAllErrors}
      />
      <ConfirmDialog
        open={pendingRows !== null}
        onClose={() => setPendingRows(null)}
        onConfirm={() => {
          if (pendingRows) apply(pendingRows);
          setPendingRows(null);
        }}
        title={t("studio:episodeUpload.chaptersReplaceTitle")}
        description={t("studio:episodeUpload.chaptersReplaceBody", {
          count: rows.length,
        })}
        confirmLabel={t("studio:episodeUpload.chaptersReplaceConfirm")}
      />
    </div>
  );
}

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CreatorDraftNotice } from "../creatorDrafts/CreatorDraftNotice";
import type { StudioReleaseView, StudioTrackView } from "./api/studio.adapters";
import { STUDIO_LIMITS } from "./api/studio.types";
import { ownerTrackSafetyOf } from "./api/useStudioOwnerTrackSafety";
import { useStudioTrack } from "./api/useStudioTrack";
import {
  usePublishStudioEpisode,
  useUpdateStudioTrack,
} from "./api/useStudioTrackMutations";
import { StudioEpisodeAudioAttach } from "./StudioEpisodeAudioStep";
import { StudioEpisodeChaptersField } from "./StudioEpisodeChaptersField";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { StudioTrackSafetyFields } from "./StudioTrackSafetyFields";
import { useTrackSafetyDraft } from "./useTrackSafetyDraft";
import {
  StudioTrackNotesField,
  StudioTrackWordsField,
} from "./StudioTrackWordsField";
import { studioWriteErrorKeyOf } from "./studioUploadValidation";
import { validateChapters } from "./upload/chapters/studioChapterValidation";
import {
  createChapterDraftId,
  type ChapterDraft,
} from "./upload/chapters/studioTracklist";
import { useReportUploadActivity } from "./upload/studioUploadActivityContext";
import creatorStyles from "./creator.module.css";
import fieldStyles from "./StudioTrackFields.module.css";
import css from "./StudioEpisodeUpload.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

interface EpisodeError {
  key: string;
  /** Counts failures, so a repeated one remounts the alert and is heard. */
  attempt: number;
}

/** The form's error line. Its text stays while the Collapse folds away. */
function useEpisodeError() {
  const attemptRef = useRef(0);
  const [error, setError] = useState<EpisodeError | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  return {
    error,
    isOpen,
    show: (key: string) => {
      attemptRef.current += 1;
      setError({ key, attempt: attemptRef.current });
      setIsOpen(true);
    },
    clear: () => setIsOpen(false),
  };
}

type EpisodeFormProps = {
  release: StudioReleaseView;
  trackId: string;
  /** The form arrived from the drop zone: the title takes focus. */
  shouldFocusTitle: boolean;
  onPublished: (track: StudioTrackView) => void;
};

/** One episode's details (spec 6.2). Waits for the track read; a failed
 *  read offers Retry. */
export function StudioEpisodeForm(props: EpisodeFormProps) {
  const { t } = useTranslation();
  const { track, loadState } = useStudioTrack(props.trackId);
  if (track) return <EpisodeFields {...props} track={track} />;
  if (loadState.isNotFound) return <StudioNotFound />;
  if (loadState.isError)
    return (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.episode"
      />
    );
  return (
    <p className={tracksStyles.detailsLoading}>
      {t("studio:uploadFlow.files.loadingDetails")}
    </p>
  );
}

/** The error line, the saved line, the draft notice and Save and Publish.
 *  A blocked Publish names its reason through aria-describedby. */
function EpisodeFooter({
  episodeError,
  isSaved,
  isDraftEpisode,
  canPublishEpisode,
  hasAudio,
  isBusy,
  onSave,
  onPublish,
}: {
  episodeError: ReturnType<typeof useEpisodeError>;
  isSaved: boolean;
  isDraftEpisode: boolean;
  canPublishEpisode: boolean;
  hasAudio: boolean;
  isBusy: boolean;
  onSave: () => void;
  onPublish: () => void;
}) {
  const { t } = useTranslation();
  const publishReasonId = useId();
  return (
    <>
      <Collapse isOpen={episodeError.isOpen}>
        <p
          key={episodeError.error?.attempt}
          className={tracksStyles.error}
          role="alert"
        >
          {episodeError.error ? t(episodeError.error.key) : null}
        </p>
      </Collapse>
      <p role="status" className={css.status}>
        {isSaved ? t("studio:episodeUpload.savedStatus") : ""}
      </p>
      <CreatorDraftNotice
        className={creatorStyles.draftNotice}
        messageKey="studio:creatorDraftNote.episodeBody"
        isShown={isDraftEpisode}
      />
      <Collapse isOpen={canPublishEpisode && !hasAudio}>
        <p id={publishReasonId} className={css.hint}>
          {t("studio:episodeUpload.needsAudio")}
        </p>
      </Collapse>
      <div className={css.actions}>
        <Button
          variant="ghost"
          aria-disabled={isBusy || undefined}
          onClick={() => {
            if (!isBusy) onSave();
          }}
        >
          {t("studio:episodeUpload.saveCta")}
        </Button>
        {canPublishEpisode && (
          <Button
            aria-disabled={isBusy || !hasAudio || undefined}
            aria-describedby={!hasAudio ? publishReasonId : undefined}
            onClick={onPublish}
          >
            {t("studio:episodeUpload.publishCta")}
          </Button>
        )}
      </div>
    </>
  );
}

/** Title, Show notes, Chapters, Transcript and Explicit, then Save episode,
 *  and Publish episode while it is a draft of a live show (it saves first).
 *  An episode without audio shows the drop zone. Refusals (the 500 episode
 *  cap, audio still processing) read through the Studio error mapping. */
function EpisodeFields({
  release,
  trackId,
  shouldFocusTitle,
  onPublished,
  track,
}: EpisodeFormProps & { track: StudioTrackView }) {
  const { t } = useTranslation();
  const update = useUpdateStudioTrack();
  const publish = usePublishStudioEpisode();
  const notesId = useId();
  const transcriptId = useId();
  const [isShowingTitleError, setIsShowingTitleError] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const safety = ownerTrackSafetyOf(release, trackId);
  const safetyDraft = useTrackSafetyDraft(safety, track.isExplicit);
  const [chapterRows, setChapterRows] = useState<ChapterDraft[] | null>(null);
  const [isShowingChapterErrors, setIsShowingChapterErrors] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const episodeError = useEpisodeError();
  const storedChapterRows = useMemo(
    () =>
      (track.chapters ?? []).map((chapter) => ({
        id: createChapterDraftId(),
        time: chapter.timeLabel,
        title: chapter.title,
        artist: chapter.artist ?? "",
      })),
    [track.chapters],
  );
  useEffect(() => {
    if (shouldFocusTitle) titleRef.current?.focus();
  }, [shouldFocusTitle]);

  const titleValue = title ?? track.title;
  const notesValue = notes ?? track.notes ?? "";
  const transcriptValue =
    transcript ??
    track.lyricStanzas.map((lines) => lines.join("\n")).join("\n\n");
  const chapterRowsValue = chapterRows ?? storedChapterRows;
  // The leave guard asks before typed details are lost.
  const isDirty =
    (title !== null && title !== track.title) ||
    notes !== null ||
    transcript !== null ||
    chapterRows !== null ||
    safetyDraft.isDirty;
  useReportUploadActivity("details", isDirty && !isSaved);
  // The server refuses an episode of a draft or scheduled show.
  const canPublishEpisode =
    track.isDraft === true && release.status === "published";
  const isBusy = update.isPending || publish.isPending;

  // Any edit after a save makes the saved line stale and the form dirty.
  const edited =
    <Value,>(setter: (value: Value) => void) =>
    (value: Value) => {
      setIsSaved(false);
      setter(value);
    };

  // Rows that validate again stop showing every error at once.
  function changeChapters(rows: ChapterDraft[]) {
    setChapterRows(rows);
    if (validateChapters(rows, track.durationSeconds).isValid)
      setIsShowingChapterErrors(false);
  }

  async function save(): Promise<boolean> {
    episodeError.clear();
    setIsSaved(false);
    // An emptied title says so, rather than quietly keeping the old one.
    if (!titleValue.trim()) {
      setIsShowingTitleError(true);
      titleRef.current?.focus();
      return false;
    }
    const validation = validateChapters(
      chapterRowsValue,
      track.durationSeconds,
    );
    if (chapterRows !== null && !validation.isValid) {
      setIsShowingChapterErrors(true);
      episodeError.show("studio:chapters.error.summary");
      return false;
    }
    try {
      await update.mutateAsync({
        trackId,
        releaseId: release.id,
        body: {
          title: titleValue.trim(),
          notes: notesValue.trim() || null,
          lyrics: transcriptValue.trim() || null,
          isExplicit: safetyDraft.explicitValue,
          ...safetyDraft.warningsPatch,
          ...(chapterRows !== null
            ? {
                chapters:
                  validation.chapters && validation.chapters.length > 0
                    ? validation.chapters
                    : null,
              }
            : {}),
        },
      });
      setIsSaved(true);
      return true;
    } catch (error) {
      episodeError.show(studioWriteErrorKeyOf(error));
      return false;
    }
  }

  async function saveAndPublish() {
    if (isBusy || !track.hasAudio) return;
    if (!(await save())) return;
    try {
      onPublished(
        await publish.mutateAsync({ trackId, releaseId: release.id }),
      );
    } catch (error) {
      episodeError.show(studioWriteErrorKeyOf(error));
    }
  }

  return (
    <div className={`${tracksStyles.details} ${css.form}`}>
      <Collapse isOpen={!track.hasAudio}>
        <StudioEpisodeAudioAttach release={release} trackId={trackId} />
      </Collapse>
      <FormField
        className={fieldStyles.studioField}
        label={t("studio:episodeUpload.titleLabel")}
        required
        error={
          isShowingTitleError && !titleValue.trim()
            ? t("studio:uploadFlow.files.titleRequired")
            : undefined
        }
      >
        <input
          ref={titleRef}
          type="text"
          value={titleValue}
          maxLength={STUDIO_LIMITS.titleMax}
          onChange={(event) => edited(setTitle)(event.target.value)}
        />
      </FormField>
      <StudioTrackNotesField
        id={notesId}
        value={notesValue}
        onChange={edited(setNotes)}
      />
      <StudioEpisodeChaptersField
        rows={chapterRowsValue}
        onChange={edited(changeChapters)}
        notes={notesValue}
        durationSeconds={track.durationSeconds}
        hasAudio={track.hasAudio}
        isShowingAllErrors={isShowingChapterErrors}
      />
      <StudioTrackWordsField
        id={transcriptId}
        format="podcast"
        value={transcriptValue}
        onChange={edited(setTranscript)}
      />
      <StudioTrackSafetyFields
        explicitLabel={t("studio:episodeUpload.explicitLabel")}
        isExplicit={safetyDraft.explicitValue}
        isExplicitLocked={safety.isExplicitLocked}
        onExplicitChange={edited(safetyDraft.setIsExplicit)}
        contentWarnings={safetyDraft.warningsValue}
        staffContentWarnings={safety.staffContentWarnings}
        onContentWarningsChange={edited(safetyDraft.setContentWarnings)}
        checkboxClassName={tracksStyles.checkbox}
      />
      <EpisodeFooter
        episodeError={episodeError}
        isSaved={isSaved}
        isDraftEpisode={track.publishedAt === null}
        canPublishEpisode={canPublishEpisode}
        hasAudio={track.hasAudio}
        isBusy={isBusy}
        onSave={() => void save()}
        onPublish={() => void saveAndPublish()}
      />
    </div>
  );
}

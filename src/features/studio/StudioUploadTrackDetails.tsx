import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isSourcedReleaseType,
  type StudioChapterView,
  type StudioSyncedLyricView,
  type StudioTrackView,
} from "./api/studio.adapters";
import {
  STUDIO_LIMITS,
  type StudioReleaseType,
  type StudioSource,
} from "./api/studio.types";
import { useStudioOwnerTrackSafety } from "./api/useStudioOwnerTrackSafety";
import { useStudioTrack } from "./api/useStudioTrack";
import { useUpdateStudioTrack } from "./api/useStudioTrackMutations";
import { StudioPersonaCreditsEditor } from "./StudioPersonaCreditsEditor";
import { StudioUploadCreditsFieldset } from "./StudioUploadCreditsFieldset";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import { missingCreditFieldOf, type CreditRow } from "./studioUploadCredits";
import {
  cleanSources,
  focusFirstIncompleteSource,
  isIncompleteSource,
} from "./studioSources";
import { StudioTrackSafetyFields } from "./StudioTrackSafetyFields";
import { useTrackSafetyDraft } from "./useTrackSafetyDraft";
import { StudioTrackSourcesField } from "./StudioTrackSourcesField";
import {
  StudioTrackNotesField,
  StudioTrackWordsField,
} from "./StudioTrackWordsField";
import { studioWriteErrorKeyOf } from "./studioUploadValidation";
import { StudioChaptersEditor } from "./upload/chapters/StudioChaptersEditor";
import {
  validateChapters,
  type ChapterSaveItem,
} from "./upload/chapters/studioChapterValidation";
import {
  createChapterDraftId,
  type ChapterDraft,
} from "./upload/chapters/studioTracklist";
import {
  doTimingsMatchLyrics,
  lyricsFromTimedLines,
} from "./upload/lyrics/studioLrc";
import { StudioLyricTimingField } from "./upload/lyrics/StudioLyricTimingField";
import { useReportUploadActivity } from "./upload/studioUploadActivityContext";
import fieldStyles from "./StudioTrackFields.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

const listOrNull = <Item,>(items: readonly Item[] | null) =>
  items && items.length > 0 ? [...items] : null;

/** The PATCH fields for timings and chapters. Each goes only when it changed
 *  (chapters: `undefined` means untouched), and an empty list clears it. */
function timingAndChapterFields(
  shouldSendTimings: boolean,
  timings: readonly StudioSyncedLyricView[] | null,
  chapters: readonly ChapterSaveItem[] | null | undefined,
) {
  return {
    ...(shouldSendTimings ? { syncedLyrics: listOrNull(timings) } : {}),
    ...(chapters !== undefined ? { chapters: listOrNull(chapters) } : {}),
  };
}

/** Editable rows for the stored chapters, with ids that stay put across
 *  renders so the rows never remount. */
function useStoredChapterRows(
  storedChapters: readonly StudioChapterView[] | null | undefined,
): ChapterDraft[] {
  return useMemo(
    () =>
      (storedChapters ?? []).map((chapter) => ({
        id: createChapterDraftId(),
        time: chapter.timeLabel,
        title: chapter.title,
        artist: chapter.artist ?? "",
      })),
    [storedChapters],
  );
}

/** The stored credits as rows. Index ids are stable for this list, and a
 *  row added later takes a `credit-` id, so the two never clash. */
const storedCreditRows = (
  storedCredits: readonly { name: string; role: string }[],
): CreditRow[] =>
  storedCredits.map((credit, index) => ({
    id: `stored-credit-${index}`,
    name: credit.name,
    role: credit.role,
  }));

interface SaveError {
  key: string;
  /** Counts failed saves, so each one remounts the alert and is heard. */
  attempt: number;
  isChapterSummary: boolean;
}

function useSaveError() {
  const attemptRef = useRef(0);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  return {
    saveError,
    showSaveError: (key: string, isChapterSummary: boolean) => {
      attemptRef.current += 1;
      setSaveError({ key, attempt: attemptRef.current, isChapterSummary });
    },
    clearSaveError: () => setSaveError(null),
    clearChapterSummary: () =>
      setSaveError((previous) =>
        previous?.isChapterSummary ? null : previous,
      ),
  };
}

/** Studio artist kinds (spec 6.2, 6.3): show notes on podcast tracks and
 *  sources on edit, lip-sync and mix tracks. Each goes on the save only once
 *  the artist touched it; a list emptied of stored rows sends [] to clear,
 *  and an empty list over an empty stored one stays off the save (so an
 *  older published mix can still take a title edit). */
function useArtistKindFields(
  track: StudioTrackView | null,
  releaseType: StudioReleaseType,
) {
  const notesId = useId();
  const [notes, setNotes] = useState<string | null>(null);
  const [sources, setSources] = useState<StudioSource[] | null>(null);
  const [isShowingSourceErrors, setIsShowingSourceErrors] = useState(false);
  const sourcesFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const isShowTrack = releaseType === "podcast";
  const isSourcedTrack = isSourcedReleaseType(releaseType);
  const notesValue = notes ?? track?.notes ?? "";
  const sourceRows = sources ?? track?.sources ?? [];
  const cleanSourceRows = cleanSources(sourceRows);
  const isSourcesUnchangedEmpty =
    cleanSourceRows.length === 0 && (track?.sources ?? []).length === 0;
  return {
    isDirty: notes !== null || sources !== null,
    notesId,
    notesValue,
    setNotes,
    sourceRows,
    sourcesFieldsetRef,
    isShowTrack,
    isSourcedTrack,
    isShowingSourceErrors,
    changeSources: (next: StudioSource[]) => {
      setSources(next);
      setIsShowingSourceErrors(false);
    },
    /** False, with every half-filled row marked and the first one focused
     *  (which scrolls it into view), when a source blocks the save. */
    checkSources: () => {
      if (!isSourcedTrack || !sourceRows.some(isIncompleteSource)) return true;
      setIsShowingSourceErrors(true);
      requestAnimationFrame(() =>
        focusFirstIncompleteSource(sourcesFieldsetRef.current),
      );
      return false;
    },
    saveFields: () => ({
      ...(isShowTrack && notes !== null
        ? { notes: notesValue.trim() || null }
        : {}),
      ...(isSourcedTrack && sources !== null && !isSourcesUnchangedEmpty
        ? { sources: cleanSourceRows }
        : {}),
    }),
  };
}

/** The title and credit checks a save runs first. An emptied title says
 *  "Title is required" and a half-filled credit says which half it needs,
 *  each focusing the field, so nothing is kept or dropped quietly. */
function useDetailsChecks(
  titleRef: RefObject<HTMLInputElement | null>,
  creditsRef: RefObject<HTMLDivElement | null>,
) {
  const [isShowingTitleError, setIsShowingTitleError] = useState(false);
  const [isShowingCreditErrors, setIsShowingCreditErrors] = useState(false);
  return {
    isShowingTitleError,
    isShowingCreditErrors,
    clearTitleError: () => setIsShowingTitleError(false),
    clearCreditErrors: () => setIsShowingCreditErrors(false),
    /** False, with the first problem focused, when a save must wait. */
    check: (titleValue: string, creditRows: readonly CreditRow[]) => {
      if (!titleValue.trim()) {
        setIsShowingTitleError(true);
        titleRef.current?.focus();
        return false;
      }
      const incomplete = creditRows.find(
        (credit) => missingCreditFieldOf(credit) !== null,
      );
      if (!incomplete) return true;
      setIsShowingCreditErrors(true);
      requestAnimationFrame(() =>
        creditsRef.current
          ?.querySelector<HTMLInputElement>(
            `[data-credit-id="${incomplete.id}"] [aria-invalid="true"]`,
          )
          ?.focus(),
      );
      return false;
    },
  };
}

/** Timings that no longer fit the lyrics. Lyrics the artist emptied on
 *  purpose take their timings with them. */
function isTimingStaleOf(
  syncedValue: readonly StudioSyncedLyricView[] | null | undefined,
  lyrics: string | null,
  lyricsValue: string,
): boolean {
  if ((syncedValue?.length ?? 0) === 0) return false;
  if (lyrics !== null && lyrics.trim() === "") return true;
  return (
    lyricsValue.trim() !== "" &&
    !doTimingsMatchLyrics(syncedValue ?? [], lyricsValue)
  );
}

/** The credits to save. The checks already stopped half-filled rows, so
 *  every row left is complete or empty, and empty ones are dropped. */
const completeCreditsOf = (rows: readonly CreditRow[]) =>
  rows
    .map((credit) => ({ name: credit.name.trim(), role: credit.role.trim() }))
    .filter((credit) => credit.name && credit.role);

/** Tells the page's leave guard and the row that edits are unsaved.
 *  Persona credits save on their own, so they never count here. */
function useReportDetailsDirty(
  isDirty: boolean,
  onDirtyChange: ((isDirty: boolean) => void) | undefined,
) {
  useReportUploadActivity("details", isDirty);
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
}

/** Cancel (the row asks first when edits would be lost) and Save. */
function DetailsActions({
  isSaving,
  onCancel,
  onSave,
}: {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={tracksStyles.detailsActions}>
      <Button variant="ghost" onClick={onCancel}>
        {t("studio:uploadFlow.files.cancelDetails")}
      </Button>
      <Button onClick={onSave} aria-disabled={isSaving || undefined}>
        {t("studio:uploadFlow.files.saveDetails")}
      </Button>
    </div>
  );
}

/** Title, free-text credits and persona credits, at the top of the panel. */
function DetailsTitleAndCredits({
  titleRef,
  creditsRef,
  titleValue,
  onTitleChange,
  isShowingTitleError,
  creditRows,
  onCreditsChange,
  isShowingCreditErrors,
  trackId,
  releaseId,
  shouldMarkCredits,
}: {
  titleRef: RefObject<HTMLInputElement | null>;
  creditsRef: RefObject<HTMLDivElement | null>;
  titleValue: string;
  onTitleChange: (title: string) => void;
  isShowingTitleError: boolean;
  creditRows: readonly CreditRow[];
  onCreditsChange: (credits: CreditRow[]) => void;
  isShowingCreditErrors: boolean;
  trackId: string;
  releaseId: string;
  shouldMarkCredits?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      <FormField
        className={fieldStyles.studioField}
        label={t("studio:uploadFlow.files.titleLabel")}
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
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </FormField>
      {/* One marked panel per page, so the deep link's id stays unique. */}
      <div
        ref={creditsRef}
        id={shouldMarkCredits ? RELEASE_FIELD_IDS.trackCredits : undefined}
        tabIndex={shouldMarkCredits ? -1 : undefined}
        role={shouldMarkCredits ? "group" : undefined}
        aria-label={
          shouldMarkCredits
            ? t("studio:uploadFlow.files.creditsLabel")
            : undefined
        }
      >
        <StudioUploadCreditsFieldset
          credits={creditRows}
          onChange={onCreditsChange}
          shouldShowErrors={isShowingCreditErrors}
        />
      </div>
      <StudioPersonaCreditsEditor trackId={trackId} releaseId={releaseId} />
      <p className={fieldStyles.hint}>
        {t("studio:uploadFlow.files.personaCreditsSaveOwn")}
      </p>
    </>
  );
}

/** The failed save's line. The chapter summary also takes focus, so the
 *  artist lands above the rows marked in the editor. */
function SaveErrorLine({ saveError }: { saveError: SaveError | null }) {
  const { t } = useTranslation();
  const lineRef = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (saveError?.isChapterSummary) lineRef.current?.focus();
  }, [saveError]);
  return (
    <Collapse isOpen={saveError !== null}>
      <p
        key={saveError?.attempt}
        ref={lineRef}
        className={tracksStyles.error}
        role="alert"
        tabIndex={-1}
      >
        {saveError ? t(saveError.key) : null}
      </p>
    </Collapse>
  );
}

interface TrackDetailsProps {
  trackId: string;
  releaseId: string;
  releaseType: StudioReleaseType;
  localFile: File | null;
  onDone: (savedTitle?: string) => void;
  /** Reports edits the server does not have yet, so the row can ask
   *  before Cancel or Edit details throws them away. */
  onDirtyChange?: (isDirty: boolean) => void;
  /** Puts the track credits deep link id on the credits, focusable. */
  shouldMarkCredits?: boolean;
}

/** Title, credits (free text and persona credits), lyrics with their
 *  timings, chapters and the explicit flag of one track. `onDone` receives
 *  the saved title after a save, and nothing on Cancel. Persona credits save
 *  on their own requests, so Cancel leaves them as they are. `localFile` is
 *  the file picked for this row this session, for the timing tap-along. */
export function StudioUploadTrackDetails({
  trackId,
  releaseId,
  releaseType,
  localFile,
  onDone,
  onDirtyChange,
  shouldMarkCredits,
}: TrackDetailsProps) {
  const { t } = useTranslation();
  const { track } = useStudioTrack(trackId);
  const update = useUpdateStudioTrack();
  const lyricsId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const checks = useDetailsChecks(titleRef, creditsRef);
  const [title, setTitle] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const safety = useStudioOwnerTrackSafety(releaseId, trackId);
  const safetyDraft = useTrackSafetyDraft(safety, track?.isExplicit ?? false);
  const [credits, setCredits] = useState<CreditRow[] | null>(null);
  const { saveError, showSaveError, clearSaveError, clearChapterSummary } =
    useSaveError();
  // undefined: untouched (the stored timings stand); null: cleared.
  const [syncedLyrics, setSyncedLyrics] = useState<
    StudioSyncedLyricView[] | null | undefined
  >(undefined);
  const [chapterRows, setChapterRows] = useState<ChapterDraft[] | null>(null);
  const [isShowingChapterErrors, setIsShowingChapterErrors] = useState(false);
  const storedChapterRows = useStoredChapterRows(track?.chapters);
  const artistKind = useArtistKindFields(track, releaseType);
  useReportDetailsDirty(
    (title !== null && title !== track?.title) ||
      [lyrics, credits, chapterRows].some((value) => value !== null) ||
      syncedLyrics !== undefined ||
      safetyDraft.isDirty ||
      artistKind.isDirty,
    onDirtyChange,
  );
  if (!track)
    return (
      <p className={tracksStyles.detailsLoading}>
        {t("studio:uploadFlow.files.loadingDetails")}
      </p>
    );

  // Read past the loading guard above, so `save` holds a loaded track's title
  // and duration.
  const storedTitle = track.title;
  const durationSeconds = track.durationSeconds;
  const titleValue = title ?? storedTitle;
  const lyricsValue =
    lyrics ?? track.lyricStanzas.map((lines) => lines.join("\n")).join("\n\n");
  const creditRows = credits ?? storedCreditRows(track.credits);
  const syncedValue =
    syncedLyrics === undefined ? track.syncedLyrics : syncedLyrics;
  const chapterRowsValue = chapterRows ?? storedChapterRows;
  const isTimingStale = isTimingStaleOf(syncedValue, lyrics, lyricsValue);

  // Spec 8.4: timings set over empty lyrics write the lyrics from their lines.
  function changeTimings(lines: StudioSyncedLyricView[] | null) {
    setSyncedLyrics(lines);
    if (lines && lines.length > 0 && lyricsValue.trim() === "")
      setLyrics(lyricsFromTimedLines(lines));
  }

  // Any chapter edit retires the summary; rows that validate again also
  // stop showing every error at once.
  function changeChapters(rows: ChapterDraft[]) {
    setChapterRows(rows);
    clearChapterSummary();
    if (validateChapters(rows, durationSeconds).isValid)
      setIsShowingChapterErrors(false);
  }

  async function save() {
    if (update.isPending) return;
    clearSaveError();
    if (!checks.check(titleValue, creditRows)) return;
    if (!artistKind.checkSources()) return;
    const cleanCredits = completeCreditsOf(creditRows);
    const savedTitle = titleValue.trim();
    const chapterValidation = validateChapters(
      chapterRowsValue,
      durationSeconds,
    );
    if (chapterRows !== null && !chapterValidation.isValid) {
      setIsShowingChapterErrors(true);
      showSaveError("studio:chapters.error.summary", true);
      return;
    }
    const timingsToSave = isTimingStale ? null : (syncedValue ?? null);
    // Untouched empty lyrics fill from the timed lines (spec 8.4).
    const lyricsToSave =
      lyricsValue.trim() ||
      (lyrics === null && timingsToSave
        ? lyricsFromTimedLines(timingsToSave)
        : "");
    try {
      await update.mutateAsync({
        trackId,
        releaseId,
        body: {
          title: savedTitle,
          lyrics: lyricsToSave || null,
          isExplicit: safetyDraft.explicitValue,
          ...safetyDraft.warningsPatch,
          credits: cleanCredits,
          ...artistKind.saveFields(),
          ...timingAndChapterFields(
            syncedLyrics !== undefined || isTimingStale,
            timingsToSave,
            chapterRows === null ? undefined : chapterValidation.chapters,
          ),
        },
      });
      onDone(savedTitle);
    } catch (error) {
      showSaveError(studioWriteErrorKeyOf(error), false);
    }
  }

  return (
    <div className={tracksStyles.details}>
      <DetailsTitleAndCredits
        titleRef={titleRef}
        creditsRef={creditsRef}
        titleValue={titleValue}
        onTitleChange={setTitle}
        isShowingTitleError={checks.isShowingTitleError}
        creditRows={creditRows}
        onCreditsChange={(next) => {
          setCredits(next);
          if (!next.some((credit) => missingCreditFieldOf(credit)))
            checks.clearCreditErrors();
        }}
        isShowingCreditErrors={checks.isShowingCreditErrors}
        trackId={trackId}
        releaseId={releaseId}
        shouldMarkCredits={shouldMarkCredits}
      />
      <Collapse isOpen={artistKind.isSourcedTrack}>
        <StudioTrackSourcesField
          sources={artistKind.sourceRows}
          onChange={artistKind.changeSources}
          showErrors={artistKind.isShowingSourceErrors}
          fieldsetRef={artistKind.sourcesFieldsetRef}
        />
      </Collapse>
      <Collapse isOpen={artistKind.isShowTrack}>
        <StudioTrackNotesField
          id={artistKind.notesId}
          value={artistKind.notesValue}
          onChange={artistKind.setNotes}
        />
      </Collapse>
      <StudioTrackWordsField
        id={lyricsId}
        format={track.release.format}
        value={lyricsValue}
        onChange={setLyrics}
      />
      <StudioLyricTimingField
        lyrics={lyricsValue}
        syncedLyrics={syncedValue}
        isTimingStale={isTimingStale}
        audioSource={
          localFile
            ? { kind: "file", file: localFile }
            : { kind: "track", trackId, durationSeconds }
        }
        onChange={changeTimings}
      />
      <StudioTrackSafetyFields
        explicitLabel={t("studio:uploadFlow.files.explicitLabel")}
        isExplicit={safetyDraft.explicitValue}
        isExplicitLocked={safety.isExplicitLocked}
        onExplicitChange={safetyDraft.setIsExplicit}
        contentWarnings={safetyDraft.warningsValue}
        staffContentWarnings={safety.staffContentWarnings}
        onContentWarningsChange={safetyDraft.setContentWarnings}
        checkboxClassName={tracksStyles.checkbox}
      />
      <StudioChaptersEditor
        rows={chapterRowsValue}
        onChange={changeChapters}
        durationSeconds={durationSeconds}
        hasAudio={track.hasAudio}
        isInitiallyOpen={releaseType === "mix" || releaseType === "podcast"}
        isShowingAllErrors={isShowingChapterErrors}
      />
      <SaveErrorLine saveError={saveError} />
      <DetailsActions
        isSaving={update.isPending}
        onCancel={() => onDone()}
        onSave={() => void save()}
      />
    </div>
  );
}

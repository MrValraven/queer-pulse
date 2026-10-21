import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, Collapse } from "../../shared/components/ui";
import type { Collaborator } from "./studioUpload.types";
import { DropZone } from "./StudioUploadDropZone";
import { FileList } from "./StudioUploadFileList";
import { MetadataStep } from "./StudioUploadMetadataStep";
import { PublishStep } from "./StudioUploadPublishStep";
import { SplitsTable } from "./StudioUploadSplitsTable";
import { SubmittedPanel } from "./StudioUploadSubmittedPanel";
import type { UploadStepId } from "./studioUploadDraft.data";
import { focusFieldById } from "./studioUploadFocus";
import { audioMaxBytesFor } from "./studioUploadValidation";
import { useReportUploadActivity } from "./upload/studioUploadActivityContext";
import { useStudioAnalysisBackfill } from "./upload/useStudioAnalysisBackfill";
import { useStudioUploadAnalysis } from "./upload/useStudioUploadAnalysis";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import { useStudioShowcase } from "./useStudioShowcase";
import { StudioVersionNotePanel } from "./StudioVersionNotePanel";
import s from "./creator.module.css";
import publishStyles from "./StudioUploadPublish.module.css";
import versionStyles from "./StudioVersionNote.module.css";

function invitedCollaborator(
  handle: string,
  subtitle: string,
  role: string,
): Collaborator {
  const initials =
    handle
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 2)
      .toUpperCase() || "QP";
  return {
    avatar: initials,
    name: handle,
    subtitle,
    role,
    percent: "0",
    tone: "jade",
  };
}

/** A details save that failed after Tracks opened (the draft was made,
 *  the follow-up PATCH was refused) says so here, with its reason, so it is
 *  never stranded on the release step off screen. */
function DetailsSaveBanner({
  errorKey,
  onOpenRelease,
}: {
  errorKey: string | null;
  onOpenRelease: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div role="alert">
      <Collapse isOpen={errorKey !== null}>
        <div className={publishStyles.errorSummary}>
          <p className={publishStyles.errorSummaryLead}>
            {errorKey
              ? t("studio:uploadFlow.autosave.notSaved", {
                  reason: t(errorKey),
                })
              : ""}
          </p>
          <Button variant="quiet" size="sm" onClick={onOpenRelease}>
            {t("studio:uploadFlow.backToRelease")}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}

/** A publish check's link opens its step, then focuses the field once the
 *  step has rendered it. */
function useFocusAfterStepChange() {
  const pendingFieldRef = useRef<string | null>(null);
  useEffect(() => {
    const fieldId = pendingFieldRef.current;
    if (fieldId && focusFieldById(fieldId)) pendingFieldRef.current = null;
  });
  return (
    step: UploadStepId,
    fieldId: string,
    goTo: (step: UploadStepId) => void,
  ) => {
    pendingFieldRef.current = fieldId;
    goTo(step);
  };
}

/** The three steps. Uploads live here, above the steps, so a file keeps
 *  uploading while the member moves on to Publish. A published release's
 *  tracks change here too (Studio v3). */
export function UploadMainCol({ draft }: { draft: StudioUploadDraft }) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const { uploads, analysis } = useStudioUploadAnalysis(
    draft.release?.id ?? null,
    draft.form.subprofileId,
    draft.release?.tracks ?? [],
    draft.release ? audioMaxBytesFor(draft.release.format) : undefined,
  );
  // Owner rows only (contract F.3): null for a release the viewer does not
  // own, so the map stays empty and the backfill idles there. It also waits
  // for this session's measuring, which often lags the uploads.
  const backfill = useStudioAnalysisBackfill({
    release: draft.release,
    isEnabled: !uploads.hasPendingUploads && !analysis.hasPendingAnalysis,
    skipTrackIds: analysis.measuredTrackIds,
  });
  const ownerTracks = draft.release?.ownerTracks;
  const storedLoudness = useMemo(
    () =>
      new Map(
        (ownerTracks ?? []).map((track) => [
          track.id,
          { loudnessLufs: track.loudnessLufs, peakDb: track.peakDb },
        ]),
      ),
    [ownerTracks],
  );
  // Leaving with uploads running asks first (the page's leave guard).
  useReportUploadActivity("uploads", uploads.hasActiveUploads);
  useReportUploadActivity("heldFiles", uploads.hasHeldFiles);
  const fixFocus = useFocusAfterStepChange();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const shouldFocusDropZoneRef = useRef(false);

  const [versionStatusKey, setVersionStatusKey] = useState<string | null>(null);
  // A new track change reopens the panel: the old "saved" line clears, so
  // the next save is announced again.
  const hasUnnotedChanges = draft.release?.hasUnnotedChanges ?? false;
  const [wasPanelOpen, setWasPanelOpen] = useState(hasUnnotedChanges);
  if (hasUnnotedChanges !== wasPanelOpen) {
    setWasPanelOpen(hasUnnotedChanges);
    if (hasUnnotedChanges) setVersionStatusKey(null);
  }

  // The version note panel folds away after a save: focus lands on the drop
  // zone's "Choose audio files" below it, and the status line speaks.
  const focusDropZone = () => {
    const button = dropZoneRef.current?.querySelector("button");
    button?.focus();
    return button !== null && button !== undefined;
  };
  useEffect(() => {
    if (shouldFocusDropZoneRef.current && focusDropZone())
      shouldFocusDropZoneRef.current = false;
  });
  function handleVersionSaved() {
    setVersionStatusKey("studio:versions.panel.savedStatus");
    if (!focusDropZone()) shouldFocusDropZoneRef.current = true;
  }

  if (draft.publishedRelease) {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="done">
        <SubmittedPanel release={draft.publishedRelease} />
      </div>
    );
  }
  if (draft.step === "release" || !draft.release) {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="release">
        <MetadataStep draft={draft} />
      </div>
    );
  }
  if (draft.step === "publish") {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="publish">
        <PublishStep
          release={draft.release}
          uploads={uploads}
          onBack={() => draft.goTo("tracks")}
          onPublished={draft.markPublished}
          onFixCheck={(step, fieldId) => fixFocus(step, fieldId, draft.goTo)}
        />
      </div>
    );
  }
  return (
    <div className={`${s.col} ${s.screenIn}`} key="tracks">
      <DetailsSaveBanner
        errorKey={draft.saveErrorKey}
        onOpenRelease={() => draft.goTo("release")}
      />
      {/* Artist kinds: v3's version tools skip shows (spec 4.1). */}
      <Collapse
        isOpen={draft.release.hasUnnotedChanges && !draft.release.isShow}
      >
        <StudioVersionNotePanel
          release={draft.release}
          onSaved={handleVersionSaved}
        />
      </Collapse>
      <p className={versionStyles.savedStatus} role="status">
        {versionStatusKey ? t(versionStatusKey) : ""}
      </p>
      <div ref={dropZoneRef}>
        <DropZone
          onFiles={uploads.addFiles}
          isDisabled={false}
          acceptsKey={
            draft.release.isShow
              ? "studio:uploadFlow.files.acceptsPodcast"
              : undefined
          }
        />
      </div>
      <FileList
        uploads={uploads}
        analysis={analysis}
        storedLoudness={storedLoudness}
        backfillCount={backfill.pendingCount}
        releaseId={draft.release.id}
        releaseTitle={draft.release.title}
        isPublished={draft.isPublished}
        releaseType={draft.release.type}
        format={draft.release.format}
      />
      {isShowcase && (
        <SplitsTable
          collaborators={collaborators}
          onAdd={(handle) =>
            setCollaborators((previous) => [
              ...previous,
              invitedCollaborator(
                handle,
                t("studio:upload.splits.invitedSubLabel"),
                t("studio:upload.splits.invitedRole"),
              ),
            ])
          }
        />
      )}
      <div className={s.stepNav}>
        <Button variant="ghost" onClick={() => draft.goTo("release")}>
          <FiArrowLeft aria-hidden /> {t("studio:uploadFlow.backToRelease")}
        </Button>
        {!draft.isPublished && (
          <Button onClick={() => draft.goTo("publish")}>
            {t("studio:uploadFlow.continueToPublish")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

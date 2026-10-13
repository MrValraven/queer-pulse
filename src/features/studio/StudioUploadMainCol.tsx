import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import type { Collaborator } from "./studioUpload.types";
import { DropZone } from "./StudioUploadDropZone";
import { FileList } from "./StudioUploadFileList";
import { MetadataStep } from "./StudioUploadMetadataStep";
import { PublishStep } from "./StudioUploadPublishStep";
import { SplitsTable } from "./StudioUploadSplitsTable";
import { SubmittedPanel } from "./StudioUploadSubmittedPanel";
import { useStudioTrackUploads } from "./useStudioTrackUploads";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./creator.module.css";

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

/** The three steps. Uploads live here, above the steps, so a file keeps
 *  uploading while the member moves on to Publish. */
export function UploadMainCol({ draft }: { draft: StudioUploadDraft }) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const uploads = useStudioTrackUploads(
    draft.release?.id ?? null,
    draft.form.subprofileId,
    draft.release?.tracks ?? [],
  );
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const shouldFocusDropZoneRef = useRef(false);

  // After "Unpublish to change tracks" its button goes away; focus lands on
  // the drop zone's "Choose audio files" that replaces it.
  const focusDropZone = () => {
    const button = dropZoneRef.current?.querySelector("button");
    button?.focus();
    return button !== null && button !== undefined;
  };
  useEffect(() => {
    if (shouldFocusDropZoneRef.current && focusDropZone())
      shouldFocusDropZoneRef.current = false;
  });
  async function unpublishAndFocus() {
    if (!(await draft.unpublishToEdit())) return;
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
        />
      </div>
    );
  }
  return (
    <div className={`${s.col} ${s.screenIn}`} key="tracks">
      {draft.isStructureLocked ? (
        <div className={s.lockedNote} role="note">
          <p>{t("studio:uploadFlow.locked.publishedNote")}</p>
          <Button
            variant="ghost"
            onClick={() => void unpublishAndFocus()}
            aria-disabled={draft.isSaving || undefined}
          >
            {t("studio:uploadFlow.locked.unpublishCta")}
          </Button>
          {draft.saveErrorKey && (
            <p className={s.fieldError} role="alert">
              {t(draft.saveErrorKey)}
            </p>
          )}
        </div>
      ) : (
        <div ref={dropZoneRef}>
          <DropZone onFiles={uploads.addFiles} isDisabled={false} />
        </div>
      )}
      <FileList
        uploads={uploads}
        releaseId={draft.release.id}
        isStructureLocked={draft.isStructureLocked}
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
        {!draft.isStructureLocked && (
          <Button onClick={() => draft.goTo("publish")}>
            {t("studio:uploadFlow.continueToPublish")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

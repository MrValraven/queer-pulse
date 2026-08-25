import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Collaborator } from "./studioUpload.types";
import { DropZone } from "./StudioUploadDropZone";
import { FileList } from "./StudioUploadFileList";
import { CoverArt } from "./StudioUploadCoverArt";
import { SplitsTable } from "./StudioUploadSplitsTable";
import { MetadataStep } from "./StudioUploadMetadataStep";
import { SubmittedPanel } from "./StudioUploadSubmittedPanel";
import s from "./creator.module.css";

export function UploadMainCol() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [step, setStep] = useState<"files" | "metadata" | "done">("files");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  function addCollaborator(handle: string) {
    const initials =
      handle
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase() || "QP";
    setCollaborators((prev) => [
      ...prev,
      {
        avatar: initials,
        name: handle,
        subtitle: t("studio:upload.splits.invitedSubLabel"),
        role: t("studio:upload.splits.invitedRole"),
        percent: "0",
        tone: "jade",
      },
    ]);
  }

  if (step === "done") {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="done">
        <SubmittedPanel />
      </div>
    );
  }

  if (step === "metadata") {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="metadata">
        <MetadataStep
          onBack={() => setStep("files")}
          onSubmit={() => {
            setStep("done");
            showToast(t("studio:upload.submitted.toast"), "success");
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${s.col} ${s.screenIn}`} key="files">
      <DropZone />
      <FileList />
      <CoverArt />
      <SplitsTable collaborators={collaborators} onAdd={addCollaborator} />
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={() => setStep("metadata")}>
          {t("studio:upload.continueToMetadataCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}

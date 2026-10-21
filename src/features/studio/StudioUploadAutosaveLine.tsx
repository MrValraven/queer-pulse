import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** The release step's save line. A draft says what autosave is doing right
 *  now (Saving, Saved at a time, Not saved and why, Waiting for a title);
 *  a published or scheduled release says what Save changes did. */
export function StudioUploadAutosaveLine({
  draft,
}: {
  draft: StudioUploadDraft;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { autosave } = draft;
  let line = "";
  if (draft.hasLiveDetails) {
    if (draft.saveErrorKey)
      line = t("studio:uploadFlow.autosave.notSaved", {
        reason: t(draft.saveErrorKey),
      });
    else if (draft.isSaving) line = t("studio:uploadFlow.autosave.saving");
    else if (draft.hasSavedChanges)
      line = t("studio:uploadFlow.release.changesSaved");
  } else if (autosave.state === "saving")
    line = t("studio:uploadFlow.autosave.saving");
  else if (autosave.state === "waitingForTitle")
    line = t("studio:uploadFlow.autosave.waitingForTitle");
  else if (autosave.state === "notSaved")
    line = t("studio:uploadFlow.autosave.notSaved", {
      reason: autosave.reasonKey ? t(autosave.reasonKey) : "",
    });
  else if (autosave.state === "saved")
    line = autosave.savedAt
      ? t("studio:uploadFlow.autosave.savedAt", {
          time: formatters.time(autosave.savedAt),
        })
      : t("studio:uploadFlow.saved");
  else if (draft.saveErrorKey)
    // No draft yet: the create itself was refused.
    line = t("studio:uploadFlow.autosave.notSaved", {
      reason: t(draft.saveErrorKey),
    });
  else if (draft.isSaving) line = t("studio:uploadFlow.autosave.saving");
  // Only a save that landed or failed is announced: "Saving…" on every
  // pause in typing would talk over the member.
  const isAnnounced = draft.hasLiveDetails
    ? !draft.isSaving
    : autosave.state === "saved" || autosave.state === "notSaved";
  return (
    <>
      <p
        className={s.saveStatus}
        data-state={draft.hasLiveDetails ? undefined : autosave.state}
      >
        {line}
      </p>
      <p className="visuallyHidden" role="status">
        {isAnnounced ? line : ""}
      </p>
    </>
  );
}

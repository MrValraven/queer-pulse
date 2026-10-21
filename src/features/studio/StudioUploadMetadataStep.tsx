import { useId } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { CreatorDraftNotice } from "../creatorDrafts/CreatorDraftNotice";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatOfKind } from "./api/studio.adapters";
import { RELEASE_ERROR_FIELDS, RELEASE_FIELD_IDS } from "./studioUpload.data";
import { StudioUploadAutosaveLine } from "./StudioUploadAutosaveLine";
import { CoverArt } from "./StudioUploadCoverArt";
import {
  personaSwitchPatch,
  releaseFormErrors,
} from "./studioUploadDraft.data";
import {
  StudioUploadErrorSummary,
  type UploadErrorSummaryItem,
} from "./StudioUploadErrorSummary";
import { StudioUploadPersonaPicker } from "./StudioUploadPersonaPicker";
import { StudioUploadReleaseFields } from "./StudioUploadReleaseFields";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** The release step: persona, details and cover. Leaving it creates the
 *  draft; after that a draft's edits save themselves, and a published or
 *  scheduled release's edits save on "Save changes". */
/** Every refused field, top to bottom, each linking to its field. */
function errorSummaryItemsOf(
  draft: StudioUploadDraft,
): UploadErrorSummaryItem[] {
  if (!draft.shouldShowErrors) return [];
  const errors = releaseFormErrors(draft.form);
  return RELEASE_ERROR_FIELDS.flatMap((field) => {
    const messageKey = errors[field];
    return messageKey
      ? [{ fieldId: RELEASE_FIELD_IDS[field], messageKey }]
      : [];
  });
}

export function MetadataStep({ draft }: { draft: StudioUploadDraft }) {
  const { t } = useTranslation();
  const saveChangesReasonId = useId();
  const isPublished = draft.hasLiveDetails;
  const isShow =
    draft.persona !== null && formatOfKind(draft.persona.kind) === "podcast";
  const isSaveChangesBlocked = draft.isSaving || !draft.hasUnsavedChanges;
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
          <Translation
            i18nKey={
              isShow
                ? "studio:uploadFlow.release.headingShow"
                : "studio:uploadFlow.release.heading"
            }
            components={{ em: <em /> }}
          />
        </h3>
        {!isPublished && (
          <div className={s.cardSub}>{t("studio:uploadFlow.release.sub")}</div>
        )}
      </div>
      <StudioUploadErrorSummary
        items={errorSummaryItemsOf(draft)}
        focusRequest={draft.errorFocusRequest}
      />
      <StudioUploadPersonaPicker
        personas={draft.personas}
        value={draft.form.subprofileId}
        isLocked={draft.release !== null}
        onChange={(persona) => {
          draft.setField("subprofileId", persona.id);
          // Artist kinds: type, genre preset and a show's empty genre, mood
          // and scene all follow the persona.
          const patch = personaSwitchPatch(persona.kind, draft.form);
          draft.setField("type", patch.type);
          draft.setField("genre", patch.genre);
          draft.setField("mood", patch.mood);
          draft.setField("sceneId", patch.sceneId);
          draft.setField("isGapless", patch.isGapless);
        }}
      />
      <StudioUploadReleaseFields draft={draft} />
      <CoverArt
        value={draft.form.coverKey ?? draft.release?.coverUrl ?? ""}
        onChange={(key) => draft.setField("coverKey", key)}
      />
      <div className={s.stepNav}>
        {isPublished && (
          <Button
            variant="ghost"
            onClick={() => void draft.saveChanges()}
            aria-disabled={isSaveChangesBlocked || undefined}
            aria-describedby={
              isSaveChangesBlocked ? saveChangesReasonId : undefined
            }
          >
            {t("studio:uploadFlow.release.saveChangesCta")}
          </Button>
        )}
        <Button
          onClick={() => void draft.continueToTracks()}
          aria-disabled={draft.isSaving || undefined}
        >
          {t(
            isShow
              ? "studio:uploadFlow.release.continueCtaShow"
              : "studio:uploadFlow.release.continueCta",
          )}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <StudioUploadAutosaveLine draft={draft} />
        {/* The reason a blocked Save changes gives; read with the button. */}
        <p id={saveChangesReasonId} className="visuallyHidden">
          {isPublished && isSaveChangesBlocked
            ? t(
                draft.isSaving
                  ? "studio:uploadFlow.autosave.saving"
                  : "studio:uploadFlow.release.noChangesReason",
              )
            : ""}
        </p>
      </div>
      <CreatorDraftNotice
        className={s.draftNotice}
        messageKey="studio:creatorDraftNote.body"
        isShown={
          draft.release === null ||
          draft.release.status === "draft" ||
          draft.release.status === "scheduled"
        }
      />
    </div>
  );
}

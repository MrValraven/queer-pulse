import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { CreatorDraftNotice } from "../creatorDrafts/CreatorDraftNotice";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatOfKind } from "./api/studio.adapters";
import { CoverArt } from "./StudioUploadCoverArt";
import { personaSwitchPatch } from "./studioUploadDraft.data";
import { StudioUploadPersonaPicker } from "./StudioUploadPersonaPicker";
import { StudioUploadReleaseFields } from "./StudioUploadReleaseFields";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** The release step: persona, details and cover. Leaving it creates the
 *  draft; after that a draft's edits save themselves, and a published or
 *  scheduled release's edits save on "Save changes". */
export function MetadataStep({ draft }: { draft: StudioUploadDraft }) {
  const { t } = useTranslation();
  const isPublished = draft.hasLiveDetails;
  const isShow =
    draft.persona !== null && formatOfKind(draft.persona.kind) === "podcast";
  let saveStatus = "";
  if (draft.saveErrorKey) saveStatus = t(draft.saveErrorKey);
  else if (draft.isSaving) saveStatus = t("studio:uploadFlow.saving");
  else if (isPublished && draft.hasSavedChanges)
    saveStatus = t("studio:uploadFlow.release.changesSaved");
  else if (!isPublished && draft.release)
    saveStatus = t("studio:uploadFlow.saved");
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
            aria-disabled={
              draft.isSaving || !draft.hasUnsavedChanges || undefined
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
        <p className={s.saveStatus} role="status">
          {saveStatus}
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

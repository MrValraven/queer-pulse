import type { ReactNode } from "react";
import { FiSlash, FiUserPlus } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioCreatorShell } from "./StudioCreatorShell";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { UploadMainCol, UploadSidebar } from "./StudioUploadSections";
import { StudioUploadStepper } from "./StudioUploadStepper";
import { UPLOAD_STEPS } from "./studioUpload.data";
import { useStudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** /studio/upload starts a release; /studio/upload?release=<id> edits one. */
export function StudioUploadPage() {
  const { t } = useTranslation();
  const { uploadablePersonas } = useStudioAccess();
  const draft = useStudioUploadDraft();
  const editState = draft.editLoadState;
  // A published or taken-down release reopened here is an edit, so the
  // creator nav's "New release" item stops reading as the current page.
  const isEditingRelease =
    draft.release !== null &&
    draft.release.status !== "draft" &&
    !draft.publishedRelease;
  // The step the main column shows (it falls back to Release until a draft
  // exists); its name heads the step so the outline runs h1, h2, h3.
  const shownStep = UPLOAD_STEPS.find(
    (stepItem) => stepItem.id === (draft.release ? draft.step : "release"),
  );

  let body: ReactNode;
  // Only a new release needs a persona to upload as. An owner whose persona
  // stopped being listenable keeps editing an existing one (?release=<id>).
  if (!draft.isEditingExisting && uploadablePersonas.length === 0) {
    body = (
      <EmptyState
        icon={<FiUserPlus />}
        title={t("studio:uploadFlow.noPersona.title")}
        description={t("studio:uploadFlow.noPersona.body")}
        action={{
          label: t("studio:uploadFlow.noPersona.cta"),
          to: routes.subprofilesDashboard,
        }}
        headingLevel={2}
      />
    );
  } else if (
    editState?.isNotFound ||
    (draft.release && !draft.release.isOwner)
  ) {
    body = <StudioNotFound />;
  } else if (editState?.isError) {
    body = <StudioLoadError loadState={editState} />;
  } else if (draft.isEditingExisting && !draft.release) {
    body = <StudioDetailSkeleton />;
  } else if (draft.release && draft.isTakenDown) {
    body = (
      <EmptyState
        icon={<FiSlash />}
        title={t("studio:uploadFlow.locked.takenDownTitle")}
        description={t("studio:uploadFlow.locked.takenDownBody", {
          reason: draft.release.takedownReason ?? "",
        })}
        action={{
          label: t("studio:uploadFlow.locked.backCta"),
          to: draft.release.artist.href,
        }}
        headingLevel={2}
      />
    );
  } else {
    body = (
      <>
        {!draft.publishedRelease && (
          <StudioUploadStepper
            step={draft.step}
            canReach={draft.canReach}
            onSelect={draft.goTo}
          />
        )}
        <section className={s.body}>
          {!draft.publishedRelease && shownStep && (
            <h2 className="visuallyHidden">{t(shownStep.nmKey)}</h2>
          )}
          <UploadMainCol draft={draft} />
          <UploadSidebar />
        </section>
      </>
    );
  }

  return (
    <StudioCreatorShell
      persona={draft.persona}
      isEditingRelease={isEditingRelease}
    >
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>{t("studio:upload.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:uploadFlow.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.sub}>{t("studio:uploadFlow.hero.sub")}</div>
        </div>
      </section>
      {body}
    </StudioCreatorShell>
  );
}

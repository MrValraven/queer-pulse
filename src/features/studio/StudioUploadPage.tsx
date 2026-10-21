import { useRef, type ReactNode } from "react";
import { FiSlash } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatOfKind } from "./api/studio.adapters";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioEpisodeUploadPage } from "./StudioEpisodeUploadPage";
import { StudioNoPersonaState } from "./StudioNoPersonaState";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { UploadMainCol, UploadSidebar } from "./StudioUploadSections";
import { StudioUploadStepper } from "./StudioUploadStepper";
import { UPLOAD_STEPS } from "./studioUpload.data";
import { StudioUploadActivityProvider } from "./upload/StudioUploadActivity";
import { useUploadStepFocus } from "./studioUploadFocus";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** /studio/upload starts a release; /studio/upload?release=<id> edits one;
 *  `&episode=` opens episode mode on a show (Studio artist kinds). */
export function StudioUploadPage() {
  const [searchParams] = useSearchParams();
  return searchParams.get("episode") !== null ? (
    <StudioEpisodeUploadPage />
  ) : (
    <StudioReleaseUploadPage />
  );
}

function StudioReleaseUploadPage() {
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
  const stepperRef = useRef<HTMLOListElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepBodyRef = useRef<HTMLElement>(null);
  useUploadStepFocus(shownStep?.id, stepperRef, stepHeadingRef, stepBodyRef);

  const isShow = draft.persona
    ? formatOfKind(draft.persona.kind) === "podcast"
    : false;
  // The tab names the release being edited, else the new-release page.
  useStudioDocumentTitle(
    draft.release?.title || t("studio:uploadFlow.pageTitle"),
  );

  let body: ReactNode;
  // Only a new release needs a persona to upload as. An owner whose persona
  // stopped being listenable keeps editing an existing one (?release=<id>).
  if (!draft.isEditingExisting && uploadablePersonas.length === 0) {
    body = <StudioNoPersonaState />;
  } else if (
    editState?.isNotFound ||
    // A withdrawn release opened here by someone who does not own it: the
    // editor has nothing to offer them, so it reads as not found.
    editState?.isWithdrawn ||
    (draft.release && !draft.release.isOwner)
  ) {
    body = <StudioNotFound />;
  } else if (editState?.isError) {
    body = (
      <StudioLoadError
        loadState={editState}
        what="studio:errors.what.release"
      />
    );
  } else if (draft.isEditingExisting && !draft.release) {
    body = <StudioDetailSkeleton />;
  } else if (draft.release && draft.isTakenDown) {
    body = (
      <EmptyState
        icon={<FiSlash />}
        title={t("studio:uploadFlow.locked.takenDownTitle")}
        description={
          // With no reason on record, the line points to the notice
          // instead of printing an empty reason.
          draft.release.takedownReason
            ? t("studio:uploadFlow.locked.takenDownBody", {
                reason: draft.release.takedownReason,
              })
            : t("studio:uploadFlow.locked.takenDownBodyNoReason")
        }
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
            ref={stepperRef}
            step={draft.step}
            canReach={draft.canReach}
            isDone={(stepId) =>
              stepId === "release"
                ? draft.release !== null
                : stepId === "tracks" &&
                  (draft.release?.playableTrackCount ?? 0) > 0
            }
            blockedReasonKeyOf={(stepId) =>
              stepId === "publish" && draft.isPublished
                ? "studio:uploadFlow.steps.blocked.alreadyLive"
                : "studio:uploadFlow.steps.blocked.needsDraft"
            }
            onSelect={draft.goTo}
          />
        )}
        <section className={s.body} ref={stepBodyRef}>
          {!draft.publishedRelease && shownStep && (
            <h2 ref={stepHeadingRef} tabIndex={-1} className="visuallyHidden">
              {t(shownStep.nmKey)}
            </h2>
          )}
          {/* Keyed by the draft: a move to another release (or to a new
              one, after Leave on the prompt) unmounts the old flow, which
              aborts its uploads instead of letting them run on unseen. */}
          <UploadMainCol key={draft.release?.id ?? "new"} draft={draft} />
          <UploadSidebar release={draft.release} isShow={isShow} />
        </section>
      </>
    );
  }

  return (
    <StudioUploadActivityProvider hasUnsavedDetails={draft.hasUnsavedDetails}>
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
            <div className={s.sub}>
              {t(
                isShow
                  ? "studio:uploadFlow.hero.subShow"
                  : "studio:uploadFlow.hero.sub",
              )}
            </div>
          </div>
        </section>
        {body}
      </StudioCreatorShell>
    </StudioUploadActivityProvider>
  );
}

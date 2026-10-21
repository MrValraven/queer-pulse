import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiCircle } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { studioErrorCodeOf } from "./api/studio.api";
import {
  isSourcedReleaseType,
  type StudioReleaseView,
} from "./api/studio.adapters";
import { useScheduleStudioRelease } from "./api/useStudioArtistToolsMutations";
import {
  usePublishStudioRelease,
  useUpdateStudioRelease,
} from "./api/useStudioReleaseMutations";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioReleaseTrackSources } from "./api/useStudioReleaseTrackSources";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  PUBLISH_DONE_KEY,
  PUBLISH_GAP_KEY,
  PUBLISH_GAP_TARGET,
  publishChecksOf,
  rightsLabelKeyOf,
  tracksMissingSourcesOf,
  type PublishCheck,
} from "./studioPublishChecks";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import type { UploadStepId } from "./studioUploadDraft.data";
import { focusFieldById } from "./studioUploadFocus";
import { StudioPublishChoice } from "./StudioPublishChoice";
import { StudioSchedulePanel } from "./StudioSchedulePanel";
import type { StudioTrackUploads } from "./useStudioTrackUploads";
import s from "./creator.module.css";
import publishStyles from "./StudioUploadPublish.module.css";

interface PublishStepProps {
  release: StudioReleaseView;
  uploads: StudioTrackUploads;
  onBack: () => void;
  onPublished: (release: StudioReleaseView) => void;
  /** Opens the step that fixes a check and focuses its field there. */
  onFixCheck?: (step: UploadStepId, fieldId: string) => void;
}

/** The checklist: every check, a done one with its check mark, an open one
 *  as a link to the step and field that fixes it. */
function PublishChecklist({
  checks,
  missingSourceTitles,
  onFixCheck,
}: {
  checks: PublishCheck[];
  missingSourceTitles: string[];
  onFixCheck?: (step: UploadStepId, fieldId: string) => void;
}) {
  const { t, language } = useTranslation();
  // DES-100: a list inside a sentence reads "A, B and C".
  const titles = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  }).format(missingSourceTitles);
  return (
    <ul className={publishStyles.checkItems}>
      {checks.map(({ gap, isDone }) => {
        const target = PUBLISH_GAP_TARGET[gap];
        const fieldId =
          RELEASE_FIELD_IDS[target.field as keyof typeof RELEASE_FIELD_IDS];
        return (
          <li
            key={gap}
            className={publishStyles.checkItem}
            data-done={isDone || undefined}
          >
            {isDone ? <FiCheck aria-hidden /> : <FiCircle aria-hidden />}
            {isDone ? (
              <span>{t(PUBLISH_DONE_KEY[gap])}</span>
            ) : (
              <a
                href={`#${fieldId}`}
                onClick={(event) => {
                  event.preventDefault();
                  if (target.step === "publish") focusFieldById(fieldId);
                  else onFixCheck?.(target.step, fieldId);
                }}
              >
                {t(PUBLISH_GAP_KEY[gap], { titles })}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The publish step: a scheduled release shows its date panel; anything
 *  else shows the checklist, the rights box and the two choices. The two
 *  fold into each other (the shared Collapse, instant under reduced motion)
 *  and focus follows the swap, so the member never lands on nothing. */
export function PublishStep(props: PublishStepProps) {
  const [focusTarget, setFocusTarget] = useState<"panel" | "form" | null>(null);
  const isScheduled = props.release.status === "scheduled";
  return (
    <>
      <Collapse isOpen={isScheduled}>
        <StudioSchedulePanel
          release={props.release}
          onBack={props.onBack}
          shouldFocusHeading={focusTarget === "panel"}
          onUnscheduled={() => setFocusTarget("form")}
        />
      </Collapse>
      <Collapse isOpen={!isScheduled}>
        <PublishForm
          {...props}
          shouldFocusHeading={focusTarget === "form"}
          onScheduled={() => setFocusTarget("panel")}
        />
      </Collapse>
    </>
  );
}

function PublishForm({
  release,
  uploads,
  onBack,
  onPublished,
  onFixCheck,
  shouldFocusHeading,
  onScheduled,
}: PublishStepProps & {
  shouldFocusHeading: boolean;
  onScheduled: () => void;
}) {
  const { t } = useTranslation();
  const checklistId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const update = useUpdateStudioRelease();
  const publish = usePublishStudioRelease();
  const schedule = useScheduleStudioRelease();
  const [isRightsTicked, setIsRightsTicked] = useState(
    release.rightsConfirmedAt !== null,
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isWorking = update.isPending || publish.isPending || schedule.isPending;
  // Artist kinds: "Credit every source", naming each track (spec 6.3).
  const sourcesByTrackId = useStudioReleaseTrackSources(release);
  const missingSourceTitles = tracksMissingSourcesOf(
    release.type,
    release.tracks,
    sourcesByTrackId,
  );
  const checks = publishChecksOf({
    title: release.title,
    hasCover: release.coverUrl !== null,
    playableTrackCount: release.playableTrackCount,
    hasPendingUploads: uploads.hasPendingUploads,
    isRightsConfirmed: isRightsTicked,
    tracksMissingSources: missingSourceTitles,
    isSourcedRelease: isSourcedReleaseType(release.type),
  });
  const isBlocked = checks.some((check) => !check.isDone);

  useEffect(() => {
    if (shouldFocusHeading) headingRef.current?.focus();
  }, [shouldFocusHeading]);

  async function confirmRights() {
    if (release.rightsConfirmedAt) return;
    await update.mutateAsync({
      releaseId: release.id,
      body: { rightsConfirmed: true },
    });
  }

  function reportError(error: unknown) {
    const code = studioErrorCodeOf(error);
    setErrorKey(studioErrorMessageKeyOf(error));
    // The server saw a different release than this page: reload it so the
    // checklist matches. Demo state is local and needs no reload.
    if (code && !demoMode) {
      void queryClient.invalidateQueries({
        queryKey: studioKeys.release(demoMode, release.id),
      });
    }
  }

  async function handlePublish() {
    if (isBlocked || isWorking) return;
    setErrorKey(null);
    try {
      await confirmRights();
      onPublished(await publish.mutateAsync({ releaseId: release.id }));
    } catch (error) {
      reportError(error);
    }
  }

  // Scheduling never calls onPublished: the release is not live yet.
  async function handleSchedule(publishAt: string) {
    if (isBlocked || isWorking) return;
    setErrorKey(null);
    try {
      await confirmRights();
      await schedule.mutateAsync({ releaseId: release.id, publishAt });
      onScheduled();
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3 ref={headingRef} tabIndex={-1}>
          <Translation
            i18nKey="studio:uploadFlow.publish.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.cardSub}>{t("studio:uploadFlow.publish.sub")}</div>
      </div>
      <div className={publishStyles.body}>
        <div
          id={checklistId}
          className={publishStyles.checklist}
          aria-live="polite"
        >
          {isBlocked ? (
            <p className={publishStyles.checklistLead}>
              {t("studio:uploadFlow.publish.missingLead")}
            </p>
          ) : (
            <p className={publishStyles.ready}>
              <FiCheck aria-hidden /> {t("studio:uploadFlow.publish.ready")}
            </p>
          )}
          <PublishChecklist
            checks={checks}
            missingSourceTitles={missingSourceTitles}
            onFixCheck={onFixCheck}
          />
        </div>
        <label className={publishStyles.rights}>
          <input
            id={RELEASE_FIELD_IDS.rights}
            type="checkbox"
            checked={isRightsTicked}
            disabled={release.rightsConfirmedAt !== null}
            onChange={(event) => setIsRightsTicked(event.target.checked)}
          />
          <span>{t(rightsLabelKeyOf(release.type))}</span>
        </label>
        {errorKey && (
          <p className={publishStyles.error} role="alert">
            {t(errorKey)}
          </p>
        )}
        <StudioPublishChoice
          isBlocked={isBlocked}
          isWorking={isWorking}
          checklistId={checklistId}
          onBack={onBack}
          onPublishNow={() => void handlePublish()}
          onSchedule={(publishAt) => void handleSchedule(publishAt)}
        />
      </div>
    </div>
  );
}

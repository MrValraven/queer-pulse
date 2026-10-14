import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useScheduleStudioRelease } from "./api/useStudioArtistToolsMutations";
import {
  usePublishStudioRelease,
  useUpdateStudioRelease,
} from "./api/useStudioReleaseMutations";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioReleaseTrackSources } from "./api/useStudioReleaseTrackSources";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  PUBLISH_GAP_KEY,
  publishGapsOf,
  rightsLabelKeyOf,
  tracksMissingSourcesOf,
} from "./studioPublishChecks";
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
  const gaps = publishGapsOf({
    title: release.title,
    hasCover: release.coverUrl !== null,
    playableTrackCount: release.playableTrackCount,
    hasPendingUploads: uploads.hasPendingUploads,
    isRightsConfirmed: isRightsTicked,
    tracksMissingSources: missingSourceTitles,
  });
  const isBlocked = gaps.length > 0;

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
            <>
              <p className={publishStyles.checklistLead}>
                {t("studio:uploadFlow.publish.missingLead")}
              </p>
              <ul>
                {gaps.map((gap) => (
                  <li key={gap}>
                    {t(PUBLISH_GAP_KEY[gap], {
                      titles: missingSourceTitles.join(", "),
                    })}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={publishStyles.ready}>
              <FiCheck aria-hidden /> {t("studio:uploadFlow.publish.ready")}
            </p>
          )}
        </div>
        <label className={publishStyles.rights}>
          <input
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

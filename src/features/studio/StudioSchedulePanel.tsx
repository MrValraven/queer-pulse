import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioReleaseView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import {
  useScheduleStudioRelease,
  useUnscheduleStudioRelease,
} from "./api/useStudioArtistToolsMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { scheduleReadback } from "./studioSchedule";
import { StudioScheduleForm } from "./StudioScheduleForm";
import s from "./creator.module.css";
import publishStyles from "./StudioUploadPublish.module.css";
import styles from "./StudioSchedule.module.css";

/** A scheduled release on the publish step: its date, "Change date" and
 *  "Cancel schedule". Cancel returns it to a draft (its reminders stay). */
export function StudioSchedulePanel({
  release,
  onBack,
  shouldFocusHeading,
  onUnscheduled,
}: {
  release: StudioReleaseView;
  onBack: () => void;
  /** Just scheduled: focus moves here from the button that went away. */
  shouldFocusHeading: boolean;
  onUnscheduled: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const schedule = useScheduleStudioRelease();
  const unschedule = useUnscheduleStudioRelease();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const changeDateButtonRef = useRef<HTMLButtonElement>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const isWorking = schedule.isPending || unschedule.isPending;
  const readback = release.publishAt
    ? scheduleReadback(new Date(release.publishAt), formatters)
    : { date: "", time: "" };

  useEffect(() => {
    if (shouldFocusHeading) headingRef.current?.focus();
  }, [shouldFocusHeading]);

  function reportError(error: unknown) {
    setErrorKey(studioErrorMessageKeyOf(error));
    // The release went live meanwhile (the scheduled publish ran): reload it
    // so the page shows the published state. Demo state is local and needs
    // no reload.
    if (
      studioErrorCodeOf(error) === "studio_release_not_schedulable" &&
      !demoMode
    ) {
      void queryClient.invalidateQueries({
        queryKey: studioKeys.release(demoMode, release.id),
      });
    }
  }

  async function changeDate(publishAt: string) {
    if (isWorking) return;
    setErrorKey(null);
    setStatusKey(null);
    try {
      await schedule.mutateAsync({ releaseId: release.id, publishAt });
      setIsChanging(false);
      setStatusKey("studio:schedule.panel.dateChanged");
      headingRef.current?.focus();
    } catch (error) {
      reportError(error);
    }
  }

  async function cancelSchedule() {
    if (isWorking) return;
    setErrorKey(null);
    try {
      await unschedule.mutateAsync({ releaseId: release.id });
      onUnscheduled();
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3 ref={headingRef} tabIndex={-1} className={styles.panelHeading}>
          <FiClock aria-hidden />{" "}
          <Translation
            i18nKey="studio:schedule.panel.heading"
            values={readback}
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.cardSub}>{t("studio:schedule.panel.body")}</div>
      </div>
      <div className={styles.panelActions}>
        <Button
          ref={changeDateButtonRef}
          variant="ghost"
          aria-expanded={isChanging}
          onClick={() => setIsChanging((wasChanging) => !wasChanging)}
        >
          {t("studio:schedule.panel.changeDateCta")}
        </Button>
        <Button
          variant="ghost"
          aria-disabled={isWorking || undefined}
          onClick={() => void cancelSchedule()}
        >
          {unschedule.isPending
            ? t("studio:schedule.panel.cancelling")
            : t("studio:schedule.panel.cancelCta")}
        </Button>
      </div>
      <Collapse isOpen={isChanging}>
        <StudioScheduleForm
          initialPublishAt={release.publishAt}
          submitLabelKey="studio:schedule.form.saveDateCta"
          isWorking={isWorking}
          onSubmit={(publishAt) => void changeDate(publishAt)}
          onCancel={() => {
            // The focused button folds away with the form: hand focus back
            // to the button that opened it.
            setIsChanging(false);
            changeDateButtonRef.current?.focus();
          }}
        />
      </Collapse>
      <p role="status" className={styles.status}>
        {statusKey ? t(statusKey) : ""}
      </p>
      <p role="alert" className={s.fieldError}>
        {errorKey ? t(errorKey) : ""}
      </p>
      <div className={publishStyles.stepNav}>
        <Button variant="ghost" onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("studio:uploadFlow.backToTracks")}
        </Button>
      </div>
    </div>
  );
}

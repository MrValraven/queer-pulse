import { useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioReleaseView } from "./api/studio.adapters";
import {
  usePublishStudioRelease,
  useUpdateStudioRelease,
} from "./api/useStudioReleaseMutations";
import { studioKeys } from "./api/studioQueryKeys";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { PUBLISH_GAP_KEY, publishGapsOf } from "./studioPublishChecks";
import type { StudioTrackUploads } from "./useStudioTrackUploads";
import s from "./creator.module.css";
import publishStyles from "./StudioUploadPublish.module.css";

export function PublishStep({
  release,
  uploads,
  onBack,
  onPublished,
}: {
  release: StudioReleaseView;
  uploads: StudioTrackUploads;
  onBack: () => void;
  onPublished: (release: StudioReleaseView) => void;
}) {
  const { t } = useTranslation();
  const checklistId = useId();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const update = useUpdateStudioRelease();
  const publish = usePublishStudioRelease();
  const [isRightsTicked, setIsRightsTicked] = useState(
    release.rightsConfirmedAt !== null,
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isWorking = update.isPending || publish.isPending;
  const gaps = publishGapsOf({
    title: release.title,
    hasCover: release.coverUrl !== null,
    playableTrackCount: release.playableTrackCount,
    hasPendingUploads: uploads.hasPendingUploads,
    isRightsConfirmed: isRightsTicked,
  });
  const isBlocked = gaps.length > 0;

  async function handlePublish() {
    if (isBlocked || isWorking) return;
    setErrorKey(null);
    try {
      if (!release.rightsConfirmedAt) {
        await update.mutateAsync({
          releaseId: release.id,
          body: { rightsConfirmed: true },
        });
      }
      onPublished(await publish.mutateAsync({ releaseId: release.id }));
    } catch (error) {
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
  }

  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
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
                  <li key={gap}>{t(PUBLISH_GAP_KEY[gap])}</li>
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
          <span>{t("studio:uploadFlow.publish.rightsLabel")}</span>
        </label>
        {errorKey && (
          <p className={publishStyles.error} role="alert">
            {t(errorKey)}
          </p>
        )}
        <div className={publishStyles.stepNav}>
          <Button variant="ghost" onClick={onBack}>
            <FiArrowLeft aria-hidden /> {t("studio:uploadFlow.backToTracks")}
          </Button>
          <Button
            onClick={() => void handlePublish()}
            aria-disabled={isBlocked || isWorking || undefined}
            aria-describedby={isBlocked ? checklistId : undefined}
          >
            {isWorking
              ? t("studio:uploadFlow.publish.publishing")
              : t("studio:uploadFlow.publish.publishCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

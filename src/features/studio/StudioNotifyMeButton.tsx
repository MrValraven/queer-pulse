import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheck } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isStudioNotFound } from "./api/studio.api";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioReleaseReminder } from "./api/useStudioArtistToolsMutations";
import styles from "./StudioUpcoming.module.css";

export function StudioNotifyMeButton({
  releaseId,
  releaseTitle,
  isSet,
  className,
  isStatusReserved = false,
}: {
  releaseId: string;
  releaseTitle: string;
  isSet: boolean;
  className?: string;
  /** Keeps the status line's height at all times and fades its text, for
   *  a bottom-aligned hero that must not move when the line appears. */
  isStatusReserved?: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reminder = useStudioReleaseReminder();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const statusLine = statusKey
    ? t(statusKey, { title: releaseTitle })
    : isSet
      ? t("studio:upcoming.notifyMeSet")
      : "";
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={[styles.notify, className].filter(Boolean).join(" ")}
        aria-pressed={isSet}
        aria-disabled={reminder.isPending || undefined}
        aria-label={t("studio:upcoming.notifyMeAria", { title: releaseTitle })}
        onClick={() => {
          if (reminder.isPending) return;
          reminder.mutate(
            { releaseId, isSet: !isSet },
            {
              onSuccess: (nowSet) =>
                setStatusKey(
                  nowSet
                    ? "studio:upcoming.notifyMeSet"
                    : "studio:upcoming.notifyMeOffStatus",
                ),
              onError: (error) => {
                showToast(t("studio:upcoming.notifyMeError"), "error");
                // A 404 means the release dropped or vanished meanwhile, so
                // the page and the artist lists read it again.
                if (!isStudioNotFound(error)) return;
                void queryClient.invalidateQueries({
                  queryKey: studioKeys.release(demoMode, releaseId),
                });
                void queryClient.invalidateQueries({
                  queryKey: ["studio", "artist", demoMode],
                });
                void queryClient.invalidateQueries({
                  queryKey: ["studio", "releases", demoMode],
                });
              },
            },
          );
        }}
      >
        {isSet ? <FiCheck aria-hidden /> : <FiBell aria-hidden />}{" "}
        {t("studio:upcoming.notifyMe")}
      </Button>
      {/* The live region stays mounted on its own line below the buttons,
          so a change is announced and the line folds open in place. */}
      <div className={styles.status} role="status">
        {isStatusReserved ? (
          <p
            className={`${styles.statusText} ${styles.statusReserved}`}
            data-is-shown={statusLine !== "" || undefined}
          >
            {statusLine}
          </p>
        ) : (
          <Collapse isOpen={statusLine !== ""}>
            <p className={styles.statusText}>{statusLine}</p>
          </Collapse>
        )}
      </div>
    </>
  );
}

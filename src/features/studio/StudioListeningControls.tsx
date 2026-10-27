import { useId, useState, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { StudioClearListeningDialog } from "./StudioClearListeningDialog";
import { ToggleOption } from "./StudioSettingsOption";
import s from "./StudioListeningPage.module.css";

/**
 * The top of "Your listening": the Listening history switch (the same server
 * switch Studio Settings holds) with Clear beside it. Until the stored row
 * loads the switch shows the default and waits. After a clear the dialog
 * hands focus back to the Clear button.
 */
export function StudioListeningControls({
  sectionRef,
}: {
  /** The page finds the switch through it to move focus there. */
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { isOn, isAwaitingRow, setOn } = useStudioListeningHistorySwitch();
  const [isClearOpen, setIsClearOpen] = useState(false);
  return (
    <section
      ref={sectionRef}
      className={s.controls}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="visuallyHidden">
        {t("studio:listening.controls.heading")}
      </h2>
      <ToggleOption
        headingKey="studio:listening.history.heading"
        bodyKey="studio:listening.history.body"
        isOn={isOn}
        isLoading={isAwaitingRow}
        onToggle={() => setOn(!isOn)}
        action={
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setIsClearOpen(true)}
          >
            {t("studio:listening.clearCta")}
          </Button>
        }
      />
      <StudioClearListeningDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
      />
    </section>
  );
}

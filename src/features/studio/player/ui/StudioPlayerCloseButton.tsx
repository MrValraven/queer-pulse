import { FiX } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayerClose } from "../useStudioPlayerClose";

/** Close player, at the end of the desktop bar and of the mini player. It
 *  stops the audio and the bar leaves until the next Play. The label shows
 *  as a tooltip, since the cross alone could read as dismissing a panel. */
export function StudioPlayerCloseButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const closePlayer = useStudioPlayerClose();
  return (
    <IconButton
      className={className}
      aria-label={t("studio:playerBar.close")}
      tooltip
      onClick={closePlayer}
    >
      <FiX aria-hidden />
    </IconButton>
  );
}

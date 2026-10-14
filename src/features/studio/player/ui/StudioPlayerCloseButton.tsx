import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayerClose } from "../useStudioPlayerClose";

/** Close player, at the end of the desktop bar and of the mini player. It
 *  stops the audio and the bar leaves until the next Play. */
export function StudioPlayerCloseButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const closePlayer = useStudioPlayerClose();
  return (
    <button
      type="button"
      className={className}
      aria-label={t("studio:playerBar.close")}
      onClick={closePlayer}
    >
      <FiX aria-hidden />
    </button>
  );
}

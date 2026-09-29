import { useState } from "react";
import { FiEye } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MobilePersonaPreview } from "./MobilePersonaPreview";
import styles from "./EditorSwitchPreviewButton.module.css";

/**
 * The phone's way into the live preview: an eye at the end of the sticky pane
 * switcher (`EditorPaneSwitcher`), opening the same `MobilePersonaPreview`
 * sheet the tablet savebar opens. It lives up here because the phone savebar
 * is one compact row kept for Discard and Save, and because the switcher is
 * on screen the whole time the owner edits, dirty or not.
 *
 * Wears the switcher's own `ed-switch-step` look, so it reads as one more
 * control of that bar, with a hairline to set it apart from the Next arrow.
 */
export function EditorSwitchPreviewButton() {
  const { t } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`ed-switch-step ${styles.previewButton}`}
        onClick={() => setIsPreviewOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isPreviewOpen}
        aria-label={t("subprofiles:editorSavebar.mobilePreview")}
      >
        <FiEye size={20} aria-hidden />
      </button>
      {isPreviewOpen && (
        <MobilePersonaPreview onClose={() => setIsPreviewOpen(false)} />
      )}
    </>
  );
}

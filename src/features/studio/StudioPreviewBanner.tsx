import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioPreview.module.css";

export function StudioPreviewBanner({ personaName }: { personaName: string }) {
  const { t } = useTranslation();
  return (
    <p className={styles.banner} role="note">
      <FiLock aria-hidden />{" "}
      {t("studio:previewPage.banner", { persona: personaName })}
    </p>
  );
}

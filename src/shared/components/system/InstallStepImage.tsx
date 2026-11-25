import { useTranslation } from "../../i18n/useTranslation";
import { INSTALL_STEP_IMAGES } from "../../hooks";
import styles from "./InstallStepImage.module.css";

/**
 * The Safari screenshot for an install step, in the site language, shown
 * under the step's text in PwaPromptPage and InstallAppModal. Renders nothing
 * for a step without one (Android, desktop and the in-app browser step).
 */
export function InstallStepImage({ stepKey }: { stepKey: string }) {
  const { t, language } = useTranslation();
  const stepImage = INSTALL_STEP_IMAGES[stepKey];
  if (!stepImage) return null;
  const imageLanguage = language === "pt" ? "pt" : "en";
  const imageUrl = `${import.meta.env.BASE_URL}install-steps/${stepImage.baseName}-${imageLanguage}.webp`;
  return (
    <img
      src={imageUrl}
      width={stepImage.width}
      height={stepImage.height}
      alt={t(stepImage.altKey)}
      loading="lazy"
      decoding="async"
      className={styles.image}
    />
  );
}

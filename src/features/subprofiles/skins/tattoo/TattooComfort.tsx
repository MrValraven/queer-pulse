import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** The comfort options as a checked list, then the artist's note. */
export function TattooComfort({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="comfort"
      heading={t("subprofiles:tattoo.block.comfort.heading")}
      hasContent={view.hasContent.comfort}
      emptyBodyKey="subprofiles:tattoo.block.comfort.empty"
      emptyActionKey="subprofiles:tattoo.block.comfort.action"
    >
      <div className={styles.stack}>
        {view.comfortOptions.length > 0 && (
          <ul className={styles.checks}>
            {view.comfortOptions.map((option) => (
              <li key={option} className={styles.check}>
                <FiCheck aria-hidden className={styles.checkIcon} />
                <span>{t(`subprofiles:tattoo.comfort.${option}`)}</span>
              </li>
            ))}
          </ul>
        )}
        {view.comfortNote !== "" && (
          <p className={styles.line}>{view.comfortNote}</p>
        )}
      </div>
    </TattooBlock>
  );
}

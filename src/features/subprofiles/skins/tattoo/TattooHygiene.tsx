import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatMonthYear } from "../../../../shared/lib/date";
import { CredentialProofThumb } from "../../CredentialProofThumb";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** The hygiene practices as a checked list, then the artist's `credentials`
 *  items: title, subtitle, date and the proof photo. */
export function TattooHygiene({ view, mode }: TattooBlockProps) {
  const { t, language } = useTranslation();
  const credentials = view.itemsBySection.credentials;
  return (
    <TattooBlock
      blockKey="hygiene"
      heading={t("subprofiles:tattoo.block.hygiene.heading")}
      hasContent={view.hasContent.hygiene}
      emptyBodyKey="subprofiles:tattoo.block.hygiene.empty"
      emptyActionKey="subprofiles:tattoo.block.hygiene.action"
    >
      <div className={styles.stack}>
        {view.hygienePractices.length > 0 && (
          <ul className={styles.checks}>
            {view.hygienePractices.map((practice) => (
              <li key={practice} className={styles.check}>
                <FiCheck aria-hidden className={styles.checkIcon} />
                <span>{t(`subprofiles:tattoo.hygiene.${practice}`)}</span>
              </li>
            ))}
          </ul>
        )}
        {credentials.length > 0 && (
          <ul className={styles.credentials}>
            {credentials.map((item) => (
              <li key={item.id || item.title} className={styles.credential}>
                <div className={styles.credentialText}>
                  <p className={styles.stepTitle}>{item.title}</p>
                  {item.subtitle && (
                    <p className={styles.credentialMeta}>{item.subtitle}</p>
                  )}
                  {item.date && (
                    <p className={styles.credentialMeta}>
                      {formatMonthYear(item.date, language)}
                    </p>
                  )}
                </div>
                <CredentialProofThumb
                  item={item}
                  interactive={mode !== "preview"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </TattooBlock>
  );
}

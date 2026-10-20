import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import { TattooTouchUpLine } from "./TattooPrices";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** The `aftercare` items as a numbered list in stored order, with the
 *  touch-up policy under the last step. */
export function TattooAftercare({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  const steps = view.itemsBySection.aftercare;
  return (
    <TattooBlock
      blockKey="aftercare"
      heading={t("subprofiles:tattoo.block.aftercare.heading")}
      hasContent={view.hasContent.aftercare}
      emptyBodyKey="subprofiles:tattoo.block.aftercare.empty"
      emptyActionKey="subprofiles:tattoo.block.aftercare.action"
    >
      <div className={styles.stack}>
        <ol className={styles.steps}>
          {steps.map((item) => (
            <li key={item.id || item.title} className={styles.step}>
              <p className={styles.stepTitle}>{item.title}</p>
              {item.description && (
                <p className={styles.line}>{item.description}</p>
              )}
            </li>
          ))}
        </ol>
        <TattooTouchUpLine view={view} />
      </div>
    </TattooBlock>
  );
}

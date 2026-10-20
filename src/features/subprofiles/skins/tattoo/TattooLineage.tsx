import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooOut.module.css";

/** Who the artist trained with, how long they have tattooed, apprentices and teaching. */
export function TattooLineage({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="lineage"
      heading={t("subprofiles:tattoo.block.lineage.heading")}
      hasContent={view.hasContent.lineage}
      emptyBodyKey="subprofiles:tattoo.block.lineage.empty"
      emptyActionKey="subprofiles:tattoo.block.lineage.action"
    >
      <div className={styles.facts}>
        {view.trainedWith !== "" && (
          <div>
            <span className={styles.factLabel}>
              {t("subprofiles:tattoo.lineage.trainedWith")}
            </span>
            <div className={styles.factValue}>{view.trainedWith}</div>
          </div>
        )}
        {view.tattooingSince !== "" && (
          <div>
            <div className={styles.factValue}>
              {t("subprofiles:tattoo.lineage.since", {
                year: view.tattooingSince,
              })}
            </div>
          </div>
        )}
        {(view.isTakingApprentices || view.apprenticeNote !== "") && (
          <div>
            {view.isTakingApprentices && (
              <span className={styles.factLabel}>
                {t("subprofiles:tattoo.lineage.apprentices")}
              </span>
            )}
            {view.apprenticeNote !== "" && (
              <div className={styles.factValue}>{view.apprenticeNote}</div>
            )}
          </div>
        )}
        {view.teaches.length > 0 && (
          <div>
            <span className={styles.factLabel}>
              {t("subprofiles:tattoo.lineage.teaches")}
            </span>
            <div className={styles.factValue}>
              <ul className={styles.teachList}>
                {view.teaches.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </TattooBlock>
  );
}

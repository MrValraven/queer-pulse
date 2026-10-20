import { Tag } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import { styleLabelKey } from "./tattooView.helpers";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** Styles, colour, the smallest size and what the artist does not tattoo.
 *  A stored `TattooStyle` id reads through its label key; the artist's own
 *  words render as written. */
export function TattooStyles({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="styles"
      heading={t("subprofiles:tattoo.block.styles.heading")}
      hasContent={view.hasContent.styles}
      emptyBodyKey="subprofiles:tattoo.block.styles.empty"
      emptyActionKey="subprofiles:tattoo.block.styles.action"
    >
      <div className={styles.stack}>
        {view.styles.length > 0 && (
          <ul className={styles.chips}>
            {view.styles.map((entry) => {
              const labelKey = styleLabelKey(entry);
              return (
                <li key={entry}>
                  <Tag>{labelKey ? t(labelKey) : entry}</Tag>
                </li>
              );
            })}
          </ul>
        )}
        {(view.colour !== null || view.minSize !== "") && (
          <dl className={styles.pairs}>
            {view.colour !== null && (
              <div className={styles.pair}>
                <dt className={styles.pairLabel}>
                  {t("subprofiles:tattoo.styles.colourLabel")}
                </dt>
                <dd className={styles.pairValue}>
                  {t(`subprofiles:tattoo.colour.${view.colour}`)}
                </dd>
              </div>
            )}
            {view.minSize !== "" && (
              <div className={styles.pair}>
                <dt className={styles.pairLabel}>
                  {t("subprofiles:tattoo.styles.minSizeLabel")}
                </dt>
                <dd className={styles.pairValue}>{view.minSize}</dd>
              </div>
            )}
          </dl>
        )}
        {view.doesNotDo.length > 0 && (
          <div className={styles.group}>
            <h3 className={styles.subheading}>
              {t("subprofiles:tattoo.styles.doesNotDo")}
            </h3>
            <ul className={styles.plainList}>
              {view.doesNotDo.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TattooBlock>
  );
}

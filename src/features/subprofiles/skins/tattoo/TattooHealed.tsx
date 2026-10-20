import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import { TattooPhotoTile } from "./TattooPhotoTile";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooPortfolio.module.css";

/** Healed work: the photo with "Healed {time}", placement and skin tone. */
export function TattooHealed({ view, onOpenWorkItem }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="healed"
      heading={t("subprofiles:tattoo.block.healed.heading")}
      hasContent={view.hasContent.healed}
      emptyBodyKey="subprofiles:tattoo.block.healed.empty"
      emptyActionKey="subprofiles:tattoo.block.healed.action"
    >
      <ul className={styles.grid}>
        {view.itemsBySection.healed.map((item) => {
          const healed = item.structured?.healed;
          const healedFor = healed?.healedFor ?? "";
          const placement = healed?.placement ?? "";
          const skinTone = healed?.skinTone;
          return (
            <li key={item.id} className={styles.gridCell}>
              <TattooPhotoTile
                item={item}
                imageUrl={item.imageUrl}
                alt={item.title}
                onOpen={onOpenWorkItem ? () => onOpenWorkItem(item) : undefined}
                caption={
                  <>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.facts}>
                      {healedFor ? (
                        <span>
                          {t("subprofiles:tattoo.healed.healedFor", {
                            time: healedFor,
                          })}
                        </span>
                      ) : null}
                      {placement ? <span>{placement}</span> : null}
                      {skinTone ? (
                        <span className={styles.chip}>
                          {t(`subprofiles:tattoo.healed.skinTone.${skinTone}`)}
                        </span>
                      ) : null}
                    </span>
                  </>
                }
              />
            </li>
          );
        })}
      </ul>
    </TattooBlock>
  );
}

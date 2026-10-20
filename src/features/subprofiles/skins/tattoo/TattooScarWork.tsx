import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TattooBlock } from "./TattooBlock";
import { TattooPhotoTile } from "./TattooPhotoTile";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooPortfolio.module.css";

/** Scar work: the intro and offers show with or without photos. */
export function TattooScarWork({ view, onOpenWorkItem }: TattooBlockProps) {
  const { t } = useTranslation();
  const items = view.itemsBySection.scar_work;
  const hasOffers = view.hasFreeConsult || view.hasReducedPrice;
  return (
    <TattooBlock
      blockKey="scarWork"
      heading={t("subprofiles:tattoo.block.scarWork.heading")}
      hasContent={view.hasContent.scarWork}
      emptyBodyKey="subprofiles:tattoo.block.scarWork.empty"
      emptyActionKey="subprofiles:tattoo.block.scarWork.action"
    >
      {view.scarIntro ? <p className={styles.intro}>{view.scarIntro}</p> : null}
      {hasOffers ? (
        <div className={styles.offers}>
          <ul className={styles.chipRow}>
            {view.hasFreeConsult ? (
              <li className={styles.chip}>
                {t("subprofiles:tattoo.scar.freeConsult")}
              </li>
            ) : null}
            {view.hasReducedPrice ? (
              <li className={styles.chip}>
                {t("subprofiles:tattoo.scar.reducedPrice")}
              </li>
            ) : null}
          </ul>
          {view.reducedPriceNote ? (
            <p className={styles.note}>{view.reducedPriceNote}</p>
          ) : null}
        </div>
      ) : null}
      {items.length > 0 ? (
        <ul className={styles.grid}>
          {items.map((item) => {
            const scarType = item.structured?.scarWork?.type;
            return (
              <li key={item.id} className={styles.gridCell}>
                <TattooPhotoTile
                  item={item}
                  imageUrl={item.imageUrl}
                  alt={item.title}
                  onOpen={
                    onOpenWorkItem ? () => onOpenWorkItem(item) : undefined
                  }
                  caption={
                    <>
                      <span className={styles.itemTitle}>{item.title}</span>
                      {scarType ? (
                        <span className={styles.facts}>
                          {t(`subprofiles:tattooItem.scarWorkType.${scarType}`)}
                        </span>
                      ) : null}
                    </>
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </TattooBlock>
  );
}

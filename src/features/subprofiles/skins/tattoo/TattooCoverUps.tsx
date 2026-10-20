import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { TattooBlock } from "./TattooBlock";
import { TattooPhotoTile } from "./TattooPhotoTile";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooPortfolio.module.css";

function CoverUpPair({
  item,
  onOpenWorkItem,
}: {
  item: SubprofileItemView;
  onOpenWorkItem?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const coverUp = item.structured?.coverUp;
  const beforeImageUrl = coverUp?.beforeImageUrl ?? "";
  const hasBefore = beforeImageUrl !== "";
  const onOpen = onOpenWorkItem ? () => onOpenWorkItem(item) : undefined;
  const beforeLabel = t("subprofiles:tattoo.coverUp.before");
  const afterLabel = t("subprofiles:tattoo.coverUp.after");
  return (
    <li className={styles.pairCell}>
      <div className={styles.pair} data-has-before={hasBefore ? "" : undefined}>
        {hasBefore ? (
          <TattooPhotoTile
            item={item}
            imageUrl={beforeImageUrl}
            alt={`${item.title}: ${beforeLabel}`}
            caption={<span className={styles.pairLabel}>{beforeLabel}</span>}
          />
        ) : null}
        <TattooPhotoTile
          item={item}
          imageUrl={item.imageUrl}
          alt={hasBefore ? `${item.title}: ${afterLabel}` : item.title}
          onOpen={onOpen}
          caption={
            hasBefore ? (
              <span className={styles.pairLabel}>{afterLabel}</span>
            ) : null
          }
        />
      </div>
      <p className={styles.itemTitle}>
        {item.title}
        {coverUp?.type ? (
          <span className={styles.facts}>
            {t(`subprofiles:tattooItem.coverUpType.${coverUp.type}`)}
          </span>
        ) : null}
      </p>
    </li>
  );
}

/** Cover-ups and reworks as before and after pairs. */
export function TattooCoverUps({ view, onOpenWorkItem }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="coverUps"
      heading={t("subprofiles:tattoo.block.coverUps.heading")}
      hasContent={view.hasContent.coverUps}
      emptyBodyKey="subprofiles:tattoo.block.coverUps.empty"
      emptyActionKey="subprofiles:tattoo.block.coverUps.action"
    >
      <ul className={styles.pairList}>
        {view.itemsBySection.cover_ups.map((item) => (
          <CoverUpPair
            key={item.id}
            item={item}
            onOpenWorkItem={onOpenWorkItem}
          />
        ))}
      </ul>
    </TattooBlock>
  );
}

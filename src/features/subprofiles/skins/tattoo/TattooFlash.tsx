import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { AMOUNT_FORMAT } from "../therapist/therapistPractical.data";
import { TattooBlock } from "./TattooBlock";
import { TattooPhotoTile } from "./TattooPhotoTile";
import type { TattooBlockProps } from "./tattooView";
import { tattooAmountText } from "./tattooView.helpers";
import styles from "./TattooPortfolio.module.css";

function FlashFacts({
  item,
  isFlash,
}: {
  item: SubprofileItemView;
  isFlash: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const flash = item.structured?.flash;
  const availability = flash?.availability;
  const placements = flash?.placements ?? [];
  const size = flash?.size ?? "";
  const price = flash?.price ?? "";
  return (
    <>
      <span className={styles.itemTitle}>{item.title}</span>
      <span className={styles.facts}>
        {isFlash && availability ? (
          <span
            className={styles.chip}
            data-is-claimed={availability === "claimed" ? "" : undefined}
          >
            {availability === "claimed"
              ? t("subprofiles:tattoo.flash.claimed")
              : t(`subprofiles:tattooItem.flashAvailability.${availability}`)}
          </span>
        ) : null}
        {size ? (
          <span>{t("subprofiles:tattoo.flash.size", { size })}</span>
        ) : null}
        {isFlash && price ? (
          <span>
            {t("subprofiles:tattoo.flash.price", {
              amount: tattooAmountText(price, (value) =>
                format.number(value, AMOUNT_FORMAT),
              ),
            })}
          </span>
        ) : null}
        {placements.length > 0 ? <span>{placements.join(", ")}</span> : null}
      </span>
    </>
  );
}

function FlashGrid({
  items,
  isFlash,
  onOpenWorkItem,
}: {
  items: SubprofileItemView[];
  isFlash: boolean;
  onOpenWorkItem?: (item: SubprofileItemView) => void;
}) {
  return (
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.id} className={styles.gridCell}>
          {item.imageUrl === "" ? (
            // A design with no photo yet reads as a text card: its title,
            // size and placements. It stays out of the lightbox too.
            <div className={styles.textCard}>
              <FlashFacts item={item} isFlash={isFlash} />
            </div>
          ) : (
            <TattooPhotoTile
              item={item}
              imageUrl={item.imageUrl}
              alt={item.title}
              onOpen={onOpenWorkItem ? () => onOpenWorkItem(item) : undefined}
              caption={<FlashFacts item={item} isFlash={isFlash} />}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

/** The flash grid. A claimed sheet stays on the page with its label. */
export function TattooFlash({ view, onOpenWorkItem }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="flash"
      heading={t("subprofiles:tattoo.block.flash.heading")}
      hasContent={view.hasContent.flash}
      emptyBodyKey="subprofiles:tattoo.block.flash.empty"
      emptyActionKey="subprofiles:tattoo.block.flash.action"
    >
      <FlashGrid
        items={view.itemsBySection.flash}
        isFlash
        onOpenWorkItem={onOpenWorkItem}
      />
    </TattooBlock>
  );
}

/** The wanna-dos grid: size and placements per design. */
export function TattooWannaDos({ view, onOpenWorkItem }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="wannaDos"
      heading={t("subprofiles:tattoo.block.wannaDos.heading")}
      hasContent={view.hasContent.wannaDos}
      emptyBodyKey="subprofiles:tattoo.block.wannaDos.empty"
      emptyActionKey="subprofiles:tattoo.block.wannaDos.action"
    >
      <FlashGrid
        items={view.itemsBySection.wanna_dos}
        isFlash={false}
        onOpenWorkItem={onOpenWorkItem}
      />
    </TattooBlock>
  );
}

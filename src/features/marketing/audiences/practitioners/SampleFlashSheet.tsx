import { useMemo } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../../subprofiles/api/subprofiles.adapters";
import { AMOUNT_FORMAT } from "../../../subprofiles/skins/therapist/therapistPractical.data";
import { TattooPhotoTile } from "../../../subprofiles/skins/tattoo/TattooPhotoTile";
import { TattooStatusPill } from "../../../subprofiles/skins/tattoo/TattooStatusPill";
import { buildTattooView } from "../../../subprofiles/skins/tattoo/tattooView";
import {
  localIsoDate,
  tattooAmountText,
} from "../../../subprofiles/skins/tattoo/tattooView.helpers";
import { SamplePersonaArticle } from "../shared/persona/SamplePersonaArticle";
import { useSampleFragmentView, useSampleToday } from "./useSamplePractitioner";
import blockStyles from "../../../subprofiles/skins/tattoo/TattooBlock.module.css";
import portfolioStyles from "../../../subprofiles/skins/tattoo/TattooPortfolio.module.css";
import styles from "./SampleFlashSheet.module.css";

/** One flash design's caption, as the tattoo page writes it: the title, then
 *  whether it is free to book, its size, its price and its placements, in
 *  the order `TattooFlash` writes them. */
function FlashCaption({ item }: { item: SubprofileItemView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const flash = item.structured?.flash;
  const placements = flash?.placements ?? [];
  return (
    <>
      <span className={portfolioStyles.itemTitle}>{item.title}</span>
      <span className={portfolioStyles.facts}>
        {flash?.availability && (
          <span
            className={portfolioStyles.chip}
            data-is-claimed={flash.availability === "claimed" ? "" : undefined}
          >
            {flash.availability === "claimed"
              ? t("subprofiles:tattoo.flash.claimed")
              : t(
                  `subprofiles:tattooItem.flashAvailability.${flash.availability}`,
                )}
          </span>
        )}
        {flash?.size && (
          <span>
            {t("subprofiles:tattoo.flash.size", { size: flash.size })}
          </span>
        )}
        {flash?.price && (
          <span>
            {t("subprofiles:tattoo.flash.price", {
              amount: tattooAmountText(flash.price, (value) =>
                format.number(value, AMOUNT_FORMAT),
              ),
            })}
          </span>
        )}
        {placements.length > 0 && <span>{placements.join(", ")}</span>}
      </span>
    </>
  );
}

/**
 * The sample tattoo artist's flash, drawn from the tattoo page's own parts
 * (the books status pill, the photo tiles and their styles). The real flash
 * block carries a fixed id the Try it page already renders, so the hero
 * draws this id-free sheet in its place.
 */
export function SampleFlashSheet() {
  const { t } = useTranslation();
  const today = useSampleToday();
  const view = useSampleFragmentView("tattoo_artist");
  const tattooView = useMemo(
    () => buildTattooView(view, localIsoDate(today)),
    [view, today],
  );
  const flashItems = tattooView.itemsBySection.flash
    .filter((item) => item.imageUrl !== "")
    .slice(0, 2);
  return (
    <SamplePersonaArticle view={view} className={styles.article}>
      <div className={blockStyles.block}>
        <div className={blockStyles.head}>
          <h2 className={blockStyles.heading}>
            {t("subprofiles:tattoo.block.flash.heading")}
          </h2>
          <TattooStatusPill
            status={tattooView.status}
            nextOpening={tattooView.nextOpening}
          />
        </div>
        <ul className={`${portfolioStyles.grid} ${styles.grid}`}>
          {flashItems.map((item) => (
            <li key={item.id} className={portfolioStyles.gridCell}>
              <TattooPhotoTile
                item={item}
                imageUrl={item.imageUrl}
                alt={item.title}
                caption={<FlashCaption item={item} />}
              />
            </li>
          ))}
        </ul>
      </div>
    </SamplePersonaArticle>
  );
}

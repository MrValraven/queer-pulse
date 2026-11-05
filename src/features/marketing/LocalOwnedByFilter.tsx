import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LISTING_OWNED_BY,
  OWNED_BY_TAG_KEYS,
  type ListingOwnedBy,
} from "./listBusiness/listingOwnedBy.data";
import { LocalChipCount } from "./LocalChipCount";
import s from "./LocalFilterBar.module.css";

/**
 * "Who runs it": narrow the directory to places whose owner has said women,
 * trans people, non-binary people or BIPOC people own and run them.
 *
 * Several tags are an OR, the opposite of the access needs below it: someone
 * picking "Trans-owned" and "Non-binary-owned" wants places run by either,
 * and an AND would quietly empty the list. The note says so, and says where
 * the tags come from, since nobody checks them: the owner's own word is all
 * the filter can promise.
 *
 * Same markup as `LocalAccessFilter`: a named `<fieldset>`, and each tag a
 * toggle carrying its own pressed state and its live count. Like the place
 * types, each tag counts the places carrying THAT tag with every other
 * filter as it stands, the same number whether it is on or off. A tag whose
 * count is a known 0 goes unpickable; a count not known yet keeps it
 * pickable. A tag that is on stays clickable so it can be undone.
 */
export function LocalOwnedByFilter({
  owned,
  onToggleOwned,
  ownedCounts,
  sectionTitleId,
}: {
  /** The tags currently filtered on, in canonical order. */
  owned: ListingOwnedBy[];
  onToggleOwned: (value: ListingOwnedBy) => void;
  /** How many places carry each tag, every other filter kept; missing when
   *  not known yet. */
  ownedCounts: Partial<Record<ListingOwnedBy, number>>;
  /** Given inside a desktop sidebar section, whose header names the group:
   *  the legend is left out and the fieldset is labelled by the header's
   *  title. */
  sectionTitleId?: string;
}) {
  const { t } = useTranslation();
  const glide = useRefineGlide();

  return (
    <fieldset
      className={[s.ownedByGroup, sectionTitleId && s.flush]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={sectionTitleId}
    >
      {!sectionTitleId && (
        <legend className={s.groupLabel}>
          {t("marketing:local.filter.ownedByLabel")}
        </legend>
      )}
      <p className={s.ownedByNote}>{t("marketing:local.filter.ownedByNote")}</p>
      <m.div {...glide.row} className={s.ownedByChips}>
        {LISTING_OWNED_BY.map((value) => {
          const isOn = owned.includes(value);
          const isDisabled = !isOn && ownedCounts[value] === 0;
          return (
            <m.button
              {...glide.chip}
              key={value}
              type="button"
              aria-pressed={isOn}
              disabled={isDisabled}
              className={[s.chip, isOn && s.chipOn].filter(Boolean).join(" ")}
              onClick={() => onToggleOwned(value)}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {isOn && (
                  <m.span key="tick" className={s.tick} {...glide.tick}>
                    <FiCheck aria-hidden />
                  </m.span>
                )}
              </AnimatePresence>
              {t(OWNED_BY_TAG_KEYS[value])}
              <LocalChipCount count={ownedCounts[value]} />
            </m.button>
          );
        })}
      </m.div>
    </fieldset>
  );
}

import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LISTING_OWNED_BY,
  OWNED_BY_TAG_KEYS,
  type ListingOwnedBy,
} from "./listBusiness/listingOwnedBy.data";
import s from "./LocalFilterBar.module.css";

/**
 * "Who runs it": narrow the directory to places whose owner has said women,
 * trans people or non-binary people own and run them.
 *
 * Several tags are an OR, the opposite of the access needs below it: someone
 * picking "Trans-owned" and "Non-binary-owned" wants places run by either,
 * and an AND would quietly empty the list. The note says so, and says where
 * the tags come from, since nobody checks them: the owner's own word is all
 * the filter can promise.
 *
 * Same markup as `LocalAccessFilter`: a named `<fieldset>`, and each tag a
 * toggle carrying its own pressed state.
 */
export function LocalOwnedByFilter({
  owned,
  onToggleOwned,
}: {
  /** The tags currently filtered on, in canonical order. */
  owned: ListingOwnedBy[];
  onToggleOwned: (value: ListingOwnedBy) => void;
}) {
  const { t } = useTranslation();
  const glide = useRefineGlide();

  return (
    <fieldset className={s.ownedByGroup}>
      <legend className={s.groupLabel}>
        {t("marketing:local.filter.ownedByLabel")}
      </legend>
      <p className={s.ownedByNote}>{t("marketing:local.filter.ownedByNote")}</p>
      <m.div {...glide.row} className={s.ownedByChips}>
        {LISTING_OWNED_BY.map((value) => {
          const isOn = owned.includes(value);
          return (
            <m.button
              {...glide.chip}
              key={value}
              type="button"
              aria-pressed={isOn}
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
            </m.button>
          );
        })}
      </m.div>
    </fieldset>
  );
}

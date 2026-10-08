import { FiCheck } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  goodForLabel,
  goodForOptions,
  LANGS,
  langLabel,
} from "../listBusiness.data";
import { listingKindOf } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import {
  StepStoryDescriptionField,
  StepStoryTagsField,
} from "../StepStoryFields";
import styles from "../ListBusinessPage.module.css";

/**
 * The story field body: tagline, the description, free tags, the
 * good-for list for the listing's audience and spoken languages.
 *
 * Shared by the create wizard's step 2 pane (`StepStory`) and the owner
 * editor's Story section. Fragment, so each field stays a direct child of the
 * caller's `.stepBody` column.
 */
export function StoryFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, toggleIn } = form;
  // The list for this kind, then any stored value it lacks (a switched kind,
  // or an older access claim) so the owner can untick it.
  const offeredGoodFor = goodForOptions(listingKindOf(draft));
  const goodForChoices = [
    ...offeredGoodFor,
    ...draft.goodFor.filter((value) => !offeredGoodFor.includes(value)),
  ];

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.tagline}
        label={t("marketing:listBusiness.step2.taglineLabel")}
        required
        helper={
          <Translation
            i18nKey="marketing:listBusiness.step2.taglineHelper"
            components={{ em: <em /> }}
          />
        }
      >
        <input
          type="text"
          maxLength={120}
          placeholder={t(
            listingKindOf(draft) === "mobile"
              ? "marketing:listBusiness.step2.taglinePlaceholderMobile"
              : "marketing:listBusiness.step2.taglinePlaceholder",
          )}
          value={draft.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </FormField>

      <StepStoryDescriptionField form={form} />

      <StepStoryTagsField form={form} />

      <FormField
        className={styles.lbField}
        id={ANCHOR.goodFor}
        label={t("marketing:listBusiness.step2.goodForLabel")}
        helper={t("marketing:listBusiness.step2.goodForHelper")}
      >
        <div
          className={styles.gfGrid}
          role="group"
          aria-label={t("marketing:listBusiness.step2.goodForAria")}
        >
          {goodForChoices.map((g) => {
            const on = draft.goodFor.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("goodFor", g)}
              >
                {on && <FiCheck size={12} />} {goodForLabel(t, g)}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.langs}
        label={t("marketing:listBusiness.step2.langsLabel")}
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t("marketing:listBusiness.step2.langsAria")}
        >
          {LANGS.map((l) => {
            const on = draft.langs.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("langs", l)}
              >
                {langLabel(t, l)}
              </button>
            );
          })}
        </div>
      </FormField>
    </>
  );
}

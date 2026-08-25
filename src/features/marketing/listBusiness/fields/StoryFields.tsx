import { FiCheck } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  GOODFOR,
  goodForLabel,
  LANGS,
  langLabel,
} from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { StepStoryTagsField, StepStoryWhatItIsField } from "../StepStoryFields";
import styles from "../ListBusinessPage.module.css";

/**
 * The story field body: tagline, the "what it is" lines, free tags, the
 * good-for accessibility list and spoken languages.
 *
 * Shared by the create wizard's step 2 pane (`StepStory`) and the owner
 * editor's Story section. Fragment, so each field stays a direct child of the
 * caller's `.stepBody` column.
 */
export function StoryFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, toggleIn } = form;

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
          placeholder={t("marketing:listBusiness.step2.taglinePlaceholder")}
          value={draft.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </FormField>

      <StepStoryWhatItIsField form={form} />

      <StepStoryTagsField form={form} />

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step2.goodForLabel")}
        helper={t("marketing:listBusiness.step2.goodForHelper")}
      >
        <div
          className={styles.gfGrid}
          role="group"
          aria-label={t("marketing:listBusiness.step2.goodForAria")}
        >
          {GOODFOR.map((g) => {
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

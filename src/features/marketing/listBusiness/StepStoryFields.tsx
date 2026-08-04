import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import styles from "./ListBusinessPage.module.css";

/** The "what it is" repeater — up to four short lines describing the place. */
export function StepStoryWhatItIsField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setWit, addWit, delWit } = form;
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.whatItIs}
      label={t("marketing:listBusiness.step2.witLabel")}
      required
      helper={t("marketing:listBusiness.step2.witHelper")}
    >
      <div>
        {draft.whatItIs.map((line, i) => (
          <div key={line.id} className={styles.witLine}>
            <input
              type="text"
              maxLength={90}
              placeholder={t(
                i === 0
                  ? "marketing:listBusiness.step2.witFirstPlaceholder"
                  : "marketing:listBusiness.step2.witMorePlaceholder",
              )}
              value={line.text}
              onChange={(e) => setWit(i, e.target.value)}
            />
            <button
              type="button"
              className={styles.witDel}
              onClick={() => delWit(i)}
              aria-label={t("marketing:listBusiness.step2.witRemoveAria")}
            >
              <FiX />
            </button>
          </div>
        ))}
        {draft.whatItIs.length < 4 && (
          <button type="button" className={styles.witAdd} onClick={addWit}>
            <FiPlus size={14} /> {t("marketing:listBusiness.step2.witAdd")}
          </button>
        )}
      </div>
    </FormField>
  );
}

/** Free-text tag entry with an inline pill list of committed tags. */
export function StepStoryTagsField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, addTag, removeTag } = form;
  const [tagInput, setTagInput] = useState("");
  const commitTag = () => {
    addTag(tagInput);
    setTagInput("");
  };
  return (
    <FormField
      className={styles.lbField}
      label={t("marketing:listBusiness.step2.tagsLabel")}
    >
      <div className={styles.tagInputWrap}>
        <input
          type="text"
          maxLength={24}
          placeholder={t("marketing:listBusiness.step2.tagsPlaceholder")}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTag();
            }
          }}
        />
        <button
          type="button"
          className={styles.hoursToolBtn}
          onClick={commitTag}
        >
          {t("marketing:listBusiness.step2.tagsAddCta")}
        </button>
      </div>
      {draft.tags.length > 0 && (
        <div className={styles.tagList}>
          {draft.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.tagPill}
              onClick={() => removeTag(tag)}
              aria-label={t("marketing:listBusiness.step2.tagRemoveAria", {
                tag,
              })}
            >
              {tag} <FiX size={11} />
            </button>
          ))}
        </div>
      )}
    </FormField>
  );
}

import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MODAL_TAGS, NEIGHBOURHOODS, type ListingType } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

export function PostProfileForm({
  onSubmit,
  onClose,
}: {
  onSubmit: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [modalType, setModalType] = useState<ListingType>("seeking");
  const [modalTags, setModalTags] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) =>
    setModalTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });

  return (
    <>
      <div className={styles.modalTitle}>
        {t("economy:postProfileForm.title")}
      </div>
      <p className={styles.modalSub}>{t("economy:postProfileForm.sub")}</p>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.lookingForLabel")}
          </label>
          <div className={styles.typeToggle}>
            {(["seeking", "offering"] as const).map((typeOption) => (
              <button
                key={typeOption}
                type="button"
                className={[
                  styles.ttOpt,
                  modalType === typeOption && styles.ttOptOn,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setModalType(typeOption)}
              >
                <div className={styles.ttTitle}>
                  {typeOption === "seeking"
                    ? t("economy:flatmates.filter.seeking")
                    : t("economy:flatmates.filter.offering")}
                </div>
                <div className={styles.ttDesc}>
                  {typeOption === "seeking"
                    ? t("economy:postProfileForm.seekingDesc")
                    : t("economy:postProfileForm.offeringDesc")}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              {t("economy:postProfileForm.nameLabel")}
            </label>
            <input
              className={styles.input}
              type="text"
              placeholder={t("economy:postProfileForm.namePlaceholder")}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              {t("economy:postProfileForm.pronounsLabel")}
            </label>
            <input
              className={styles.input}
              type="text"
              placeholder={t("economy:postProfileForm.pronounsPlaceholder")}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              {t("economy:postProfileForm.neighbourhoodLabel")}
            </label>
            <select className={styles.select} defaultValue="">
              <option value="">
                {t("economy:postProfileForm.neighbourhoodPlaceholder")}
              </option>
              {NEIGHBOURHOODS.map((neighbourhoodName) => (
                <option key={neighbourhoodName}>{neighbourhoodName}</option>
              ))}
              <option>{t("economy:postProfileForm.anywhereCentral")}</option>
              <option>{t("economy:flatmates.filter.moveIn.flex")}</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              {t("economy:postProfileForm.budgetLabel")}
            </label>
            <input
              className={styles.input}
              type="text"
              placeholder={t("economy:postProfileForm.budgetPlaceholder")}
            />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.moveInLabel")}
          </label>
          <select className={styles.select} defaultValue="">
            <option value="">
              {t("economy:postProfileForm.moveInPlaceholder")}
            </option>
            <option>{t("economy:flatmates.filter.moveIn.now")}</option>
            <option>{t("economy:postProfileForm.moveIn.jul2026")}</option>
            <option>{t("economy:postProfileForm.moveIn.aug2026")}</option>
            <option>{t("economy:postProfileForm.moveIn.sep2026")}</option>
            <option>{t("economy:flatmates.filter.moveIn.flex")}</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.aboutLabel")}
          </label>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder={t("economy:postProfileForm.aboutPlaceholder")}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.lifestyleTagsLabel")}
          </label>
          <div className={styles.lfGrid}>
            {MODAL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={[styles.lfOpt, modalTags.has(tag) && styles.lfOptOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.emailLabel")}
          </label>
          <input
            className={styles.input}
            type="email"
            placeholder={t("economy:postProfileForm.emailPlaceholder")}
          />
        </div>
      </div>
      <div className={styles.modalActions}>
        <Button type="button" variant="primary" onClick={onSubmit}>
          {t("economy:postProfileForm.submitCta")}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
      </div>
    </>
  );
}

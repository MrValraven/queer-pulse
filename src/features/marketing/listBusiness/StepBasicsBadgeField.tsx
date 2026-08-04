import { FormField, RadioCardGroup } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, type OwnerBadge } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import styles from "./ListBusinessPage.module.css";

/** "How are you connected to this place?" ownership badge picker, plus the
 *  evidence reveal that only shows for the "owned" choice. */
export function StepBasicsBadgeField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, pickBadge } = form;
  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.badge}
        label={t("marketing:listBusiness.step1.badgeLabel")}
        required
        helper={t("marketing:listBusiness.step1.badgeHelper")}
      >
        <RadioCardGroup<OwnerBadge>
          className={styles.optGrid}
          optionClassName={styles.optCard}
          checkedClassName={styles.optOn}
          ariaLabel={t("marketing:listBusiness.step1.badgeAria")}
          value={draft.badge}
          onChange={pickBadge}
          options={[
            {
              id: "owned",
              render: (
                <>
                  <span className={`${styles.ownTag} ${styles.ownTagJade}`}>
                    {t("marketing:listBusiness.step1.owned.tag")}
                  </span>
                  <b>{t("marketing:listBusiness.step1.owned.title")}</b>
                  <span>{t("marketing:listBusiness.step1.owned.desc")}</span>
                </>
              ),
            },
            {
              id: "friendly",
              render: (
                <>
                  <span className={`${styles.ownTag} ${styles.ownTagCoral}`}>
                    {t("marketing:listBusiness.step1.friendly.tag")}
                  </span>
                  <b>{t("marketing:listBusiness.step1.friendly.title")}</b>
                  <span>{t("marketing:listBusiness.step1.friendly.desc")}</span>
                </>
              ),
            },
          ]}
        />
      </FormField>
      {draft.badge === "owned" && (
        <div className={styles.revealBlock}>
          <label>{t("marketing:listBusiness.step1.evidenceLabel")}</label>
          <p>{t("marketing:listBusiness.step1.evidenceHelp")}</p>
          <FormField>
            <input
              type="text"
              maxLength={120}
              placeholder={t(
                "marketing:listBusiness.step1.evidencePlaceholder",
              )}
              value={draft.evidence}
              onChange={(e) => set({ evidence: e.target.value })}
            />
          </FormField>
        </div>
      )}
    </>
  );
}

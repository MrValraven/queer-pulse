import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { PracticalFields } from "./fields/PracticalFields";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 3: Practical =====
   Wizard chrome only: the fields live in `PracticalFields`, shared with the
   single-screen owner editor. An online-only business has no street address
   or opening hours to give here, so its pane sub speaks only of being found
   online and reached. */
export function StepPractical({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step3.title")}
        em={t("marketing:listBusiness.step3.em")}
        sub={
          form.draft.online
            ? t("marketing:listBusiness.step3.subOnline")
            : t("marketing:listBusiness.step3.sub")
        }
      />
      <PracticalFields form={form} />
    </div>
  );
}

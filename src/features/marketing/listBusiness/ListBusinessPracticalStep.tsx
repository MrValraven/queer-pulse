import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { PracticalFields } from "./fields/PracticalFields";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 3: Practical =====
   Wizard chrome only: the fields live in `PracticalFields`, shared with the
   single-screen owner editor. A place gives its address and opening hours
   here; an online-only business gets "How people buy from you". */
export function StepPractical({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const isOnline = form.draft.online;
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={
          isOnline
            ? t("marketing:listBusiness.step3.titleOnline")
            : t("marketing:listBusiness.step3.title")
        }
        em={
          isOnline
            ? t("marketing:listBusiness.step3.emOnline")
            : t("marketing:listBusiness.step3.em")
        }
        sub={
          isOnline
            ? t("marketing:listBusiness.step3.subBuy")
            : t("marketing:listBusiness.step3.sub")
        }
      />
      <PracticalFields form={form} />
    </div>
  );
}

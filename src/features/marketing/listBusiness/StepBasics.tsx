import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { BasicsFields } from "./fields/BasicsFields";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 1: Basics =====
   Wizard chrome only: the fields themselves live in `BasicsFields`, which the
   single-screen owner editor renders too, so there is exactly one copy of
   them. */
export function StepBasics({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step1.title")}
        em={t("marketing:listBusiness.step1.em")}
        sub={t("marketing:listBusiness.step1.sub")}
      />
      <BasicsFields form={form} />
    </div>
  );
}

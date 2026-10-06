import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { BasicsFields } from "./fields/BasicsFields";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 1: Basics =====
   Wizard chrome only: the fields themselves live in `BasicsFields`, which the
   single-screen owner editor renders too, so there is exactly one copy of
   them. `editRef` names the listing being edited, so the duplicate-name check
   does not flag the listing itself. `duplicateCheckBaselineName` is the name
   an edit loaded with, passed through so the hint waits for a real rename. */
export function StepBasics({
  form,
  editRef,
  duplicateCheckBaselineName,
}: {
  form: ListingForm;
  editRef?: string;
  duplicateCheckBaselineName?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step1.title")}
        em={t("marketing:listBusiness.step1.em")}
        sub={t("marketing:listBusiness.step1.sub")}
      />
      <BasicsFields
        form={form}
        editRef={editRef}
        duplicateCheckBaselineName={duplicateCheckBaselineName}
      />
    </div>
  );
}

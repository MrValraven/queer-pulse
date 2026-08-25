import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { StoryFields } from "./fields/StoryFields";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 2: Story =====
   Wizard chrome only: the fields live in `StoryFields`, shared with the
   single-screen owner editor. */
export function StepStory({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step2.title")}
        em={t("marketing:listBusiness.step2.em")}
        sub={t("marketing:listBusiness.step2.sub")}
      />
      <StoryFields form={form} />
    </div>
  );
}

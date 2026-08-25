import { CheckLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/**
 * The two permissions every listing has to carry: that it will be public and
 * searchable, and that the community guide may use it.
 *
 * Shared by the create wizard's review pane (`StepReview`) and the owner
 * editor's Permissions section, so both surfaces gate on the same one copy.
 */
export function ConsentChecks({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div id={ANCHOR.consent} className={styles.consentChecks}>
      <div className={styles.flagOuting}>
        <CheckLine
          checked={draft.consentOuting}
          onChange={(v) => set({ consentOuting: v })}
          title={t("marketing:listBusiness.step5.consentOuting.title")}
          sub={t("marketing:listBusiness.step5.consentOuting.sub")}
        />
      </div>
      <CheckLine
        checked={draft.consentGuide}
        onChange={(v) => set({ consentGuide: v })}
        title={t("marketing:listBusiness.step5.consentGuide.title")}
        sub={t("marketing:listBusiness.step5.consentGuide.sub")}
      />
    </div>
  );
}

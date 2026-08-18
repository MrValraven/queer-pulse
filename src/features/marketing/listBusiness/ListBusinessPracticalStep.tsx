import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, validateSocials } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { ListBusinessLocationField } from "./ListBusinessLocationField";
import { ListingHoursEditor } from "./ListingHoursEditor";
import styles from "./ListBusinessPage.module.css";

const SOCIALS: {
  key: "instagram" | "website" | "email" | "phone";
  type: string;
  placeholderKey: string;
  errKey: string;
}[] = [
  {
    key: "instagram",
    type: "text",
    placeholderKey: "marketing:listBusiness.social.instagram.placeholder",
    errKey: "",
  },
  {
    key: "website",
    type: "url",
    placeholderKey: "marketing:listBusiness.social.website.placeholder",
    errKey: "marketing:listBusiness.social.website.err",
  },
  {
    key: "email",
    type: "email",
    placeholderKey: "marketing:listBusiness.social.email.placeholder",
    errKey: "marketing:listBusiness.social.email.err",
  },
  {
    key: "phone",
    type: "tel",
    placeholderKey: "marketing:listBusiness.social.phone.placeholder",
    errKey: "marketing:listBusiness.social.phone.err",
  },
];

export function StepPractical({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, setSocial } = form;
  const socialOk = validateSocials(draft.social);

  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step3.title")}
        em={t("marketing:listBusiness.step3.em")}
        sub={t("marketing:listBusiness.step3.sub")}
      />

      <ListBusinessLocationField draft={draft} set={set} />

      {!draft.online && <ListingHoursEditor form={form} />}

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step3.onlineHeading")}
      </h3>
      <p className={styles.onlineHint}>
        {t("marketing:listBusiness.step3.onlineHint")}
      </p>
      <div id={ANCHOR.social} className={styles.twoCol}>
        {SOCIALS.map((s) => {
          const value = draft.social[s.key];
          const valid = socialOk[s.key];
          return (
            <FormField
              key={s.key}
              className={styles.lbField}
              error={!valid && s.errKey ? t(s.errKey) : undefined}
            >
              <input
                type={s.type}
                aria-invalid={!valid}
                placeholder={t(s.placeholderKey)}
                value={value}
                onChange={(e) => setSocial(s.key, e.target.value)}
              />
            </FormField>
          );
        })}
      </div>
    </div>
  );
}

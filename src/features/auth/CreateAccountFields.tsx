import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";

type Touched = {
  first: boolean;
  last: boolean;
};

interface AccountFieldsProps {
  first: string;
  setFirst: (v: string) => void;
  last: string;
  setLast: (v: string) => void;
  touched: Touched;
  touch: (key: keyof Touched) => void;
  errors: Partial<Record<keyof Touched, string>>;
}

/**
 * The name/email block of Create account.
 *
 * There is deliberately NO password here: an account is created by redeeming an
 * invite against a Google-authenticated session (`auth.api.ts` → Google OAuth +
 * invite redemption), so a password would never be transmitted, stored or
 * checked. The fields that used to sit here — password, confirm-password and a
 * four-segment "strength" meter — measured nothing and protected nothing, and
 * password managers were being offered a credential the platform has no concept
 * of. Removed rather than left as decoration.
 */
export function AccountFields({
  first,
  setFirst,
  last,
  setLast,
  touched,
  touch,
  errors,
}: AccountFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {t("auth:createAccount.section.account")}
      </div>
      <div className={styles.twoCol}>
        <FormField
          label={t("auth:createAccount.field.firstName.label")}
          required
          error={touched.first ? errors.first : undefined}
        >
          <input
            type="text"
            placeholder={t("auth:createAccount.field.firstName.placeholder")}
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            onBlur={() => touch("first")}
            aria-invalid={touched.first && !!errors.first}
          />
        </FormField>
        <FormField
          label={t("auth:createAccount.field.lastName.label")}
          required
          error={touched.last ? errors.last : undefined}
        >
          <input
            type="text"
            placeholder={t("auth:createAccount.field.lastName.placeholder")}
            value={last}
            onChange={(e) => setLast(e.target.value)}
            onBlur={() => touch("last")}
            aria-invalid={touched.last && !!errors.last}
          />
        </FormField>
      </div>
      <FormField
        label={t("auth:createAccount.field.email.label")}
        helper={t("auth:createAccount.field.email.helper")}
      >
        <input type="email" value="tiago@gmail.com" disabled />
      </FormField>
    </div>
  );
}

export type { Touched };

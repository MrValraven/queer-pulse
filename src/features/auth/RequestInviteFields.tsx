import { FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";

const optionalStyle = {
  fontWeight: 400,
  textTransform: "none" as const,
  letterSpacing: 0,
  fontSize: 11,
};

export interface RequestInviteFieldsProps {
  first: string;
  setFirst: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  emailError: boolean;
  onEmailBlur: () => void;
  why: string;
  setWhy: (v: string) => void;
  /**
   * Someone already here who knows them. Not a field on POST /join-requests —
   * the form folds it into `message` so a reviewer actually sees it. Before
   * that it was an uncontrolled input whose value went nowhere, while the
   * "Naming a mutual helps" copy beside it promised otherwise.
   */
  mutual: string;
  setMutual: (v: string) => void;
}

/**
 * The request-invite form's inputs. Extracted from RequestInviteForm, which owns
 * the submit/error state (409 "already asked", 403 UNDER_18) and stayed over the
 * 200-line ceiling once those branches landed. Name, city and email are all
 * controlled here because all three are now actually sent to POST /join-requests.
 */
export function RequestInviteFields({
  first,
  setFirst,
  city,
  setCity,
  email,
  setEmail,
  emailError,
  onEmailBlur,
  why,
  setWhy,
  mutual,
  setMutual,
}: RequestInviteFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.twoCol}>
        <FormField label={t("auth:requestInvite.field.name.label")} required>
          <input
            id="ri-first"
            type="text"
            placeholder={t("auth:requestInvite.field.name.placeholder")}
            autoComplete="given-name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
        </FormField>
        <FormField label={t("auth:requestInvite.field.city.label")}>
          <input
            id="ri-city"
            type="text"
            placeholder={t("auth:requestInvite.field.city.placeholder")}
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label={t("auth:requestInvite.field.email.label")}
        required
        error={
          emailError ? t("auth:requestInvite.field.email.error") : undefined
        }
      >
        <input
          id="ri-email"
          type="email"
          placeholder={t("auth:requestInvite.field.email.placeholder")}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={onEmailBlur}
          aria-invalid={emailError}
        />
      </FormField>

      <FormField
        label={
          <Translation
            i18nKey="auth:requestInvite.field.mutual.label"
            components={{ optional: <span style={optionalStyle} /> }}
          />
        }
        helper={t("auth:requestInvite.field.mutual.helper")}
      >
        <input
          id="ri-mutual"
          type="text"
          placeholder={t("auth:requestInvite.field.mutual.placeholder")}
          value={mutual}
          onChange={(e) => setMutual(e.target.value)}
        />
      </FormField>

      <FormField
        label={t("auth:requestInvite.field.why.label")}
        required
        labelAside={`${why.length}/400`}
      >
        <textarea
          id="ri-why"
          maxLength={400}
          placeholder={t("auth:requestInvite.field.why.placeholder")}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
        />
      </FormField>
    </>
  );
}

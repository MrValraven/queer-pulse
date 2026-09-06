import { FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";

export interface RequestInviteFieldsProps {
  first: string;
  setFirst: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  /** Malformed email. Mutually exclusive with `emailMissing`. */
  emailError: boolean;
  /** Required-but-empty email, only ever true after a submit attempt. */
  emailMissing: boolean;
  onEmailBlur: () => void;
  /** Required-but-empty name, only ever true after a submit attempt. */
  firstMissing: boolean;
  /** Required-but-empty "why", only ever true after a submit attempt. */
  whyMissing: boolean;
  why: string;
  setWhy: (v: string) => void;
  /**
   * The email of a member already here who can vouch for them. Optional, but
   * when given it must be a valid email — sent as its own structured
   * `mutualMemberEmail` field so a reviewer can match it directly, distinct
   * from the free-text `message`.
   */
  mutual: string;
  setMutual: (v: string) => void;
  /** Non-empty but malformed email in the mutual field. */
  mutualError: boolean;
  onMutualBlur: () => void;
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
  emailMissing,
  onEmailBlur,
  firstMissing,
  whyMissing,
  why,
  setWhy,
  mutual,
  setMutual,
  mutualError,
  onMutualBlur,
}: RequestInviteFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.twoCol}>
        <FormField
          label={t("auth:requestInvite.field.name.label")}
          required
          error={
            firstMissing ? t("auth:requestInvite.field.name.error") : undefined
          }
        >
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
          emailMissing
            ? t("auth:requestInvite.field.email.errorRequired")
            : emailError
              ? t("auth:requestInvite.field.email.error")
              : undefined
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
          aria-invalid={emailError || emailMissing}
        />
      </FormField>

      <FormField
        label={
          <Translation
            i18nKey="auth:requestInvite.field.mutual.label"
            components={{
              optional: <span className={styles.optionalSuffix} />,
            }}
          />
        }
        helper={t("auth:requestInvite.field.mutual.helper")}
        error={
          mutualError ? t("auth:requestInvite.field.mutual.error") : undefined
        }
      >
        <input
          id="ri-mutual"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder={t("auth:requestInvite.field.mutual.placeholder")}
          value={mutual}
          onChange={(e) => setMutual(e.target.value)}
          onBlur={onMutualBlur}
          aria-invalid={mutualError}
        />
      </FormField>

      <FormField
        label={t("auth:requestInvite.field.why.label")}
        required
        labelAside={`${why.length}/400`}
        error={whyMissing ? t("auth:requestInvite.field.why.error") : undefined}
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

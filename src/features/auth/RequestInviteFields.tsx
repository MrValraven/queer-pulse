import { useEffect, useRef } from "react";
import { FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";
import { RequestInviteSocialField } from "./RequestInviteSocialField";

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
  /** Where the applicant heard about QueerPulse. Required free text, sent as
   *  `heardFrom` so reviewers can see how people find the platform. */
  heardFrom: string;
  setHeardFrom: (v: string) => void;
  socialProfile: string;
  setSocialProfile: (v: string) => void;
  /** Required-but-empty "heard from", only ever true after a submit attempt. */
  heardFromMissing: boolean;
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
  /** Focus the email field as the form mounts: set when the applicant comes
   *  back from the code step to change the address (WCAG 2.4.3). */
  shouldFocusEmail?: boolean;
}

/**
 * The request-invite form's inputs. Extracted from RequestInviteForm, which owns
 * the submit state and the code step. Name and city are sent with the request;
 * the email is where the confirmation code goes, and the request is filed
 * under that address once the code checks out (SEC-10).
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
  heardFrom,
  setHeardFrom,
  socialProfile,
  setSocialProfile,
  heardFromMissing,
  firstMissing,
  whyMissing,
  why,
  setWhy,
  mutual,
  setMutual,
  mutualError,
  onMutualBlur,
  shouldFocusEmail = false,
}: RequestInviteFieldsProps) {
  const { t } = useTranslation();
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (shouldFocusEmail) emailRef.current?.focus();
    // Mount only: the step swap mounts a fresh form, then the applicant steers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          ref={emailRef}
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
        label={t("auth:requestInvite.field.heardFrom.label")}
        required
        error={
          heardFromMissing
            ? t("auth:requestInvite.field.heardFrom.error")
            : undefined
        }
      >
        <input
          id="ri-heard-from"
          type="text"
          maxLength={200}
          autoComplete="off"
          placeholder={t("auth:requestInvite.field.heardFrom.placeholder")}
          value={heardFrom}
          onChange={(e) => setHeardFrom(e.target.value)}
          aria-invalid={heardFromMissing}
        />
      </FormField>
      <RequestInviteSocialField
        socialProfile={socialProfile}
        setSocialProfile={setSocialProfile}
      />

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

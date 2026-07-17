import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, FormField, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateJoinRequest } from "./api/useCreateJoinRequest";
import { AgeAttestation } from "./AgeAttestation";
import { Under18Notice } from "./Under18Notice";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalStyle = {
  fontWeight: 400,
  textTransform: "none" as const,
  letterSpacing: 0,
  fontSize: 11,
};

export function RequestInviteForm({
  first,
  setFirst,
  onSent,
}: {
  first: string;
  setFirst: (v: string) => void;
  onSent: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createJoinRequest = useCreateJoinRequest();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [why, setWhy] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;
  const submitting = createJoinRequest.isPending;
  const canSubmit =
    emailValid && why.trim().length > 0 && agreed && is18 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createJoinRequest.mutateAsync({ message: why.trim() });
      onSent();
    } catch {
      showToast(t("auth:requestInvite.submitError"), "error");
    }
  }

  // Someone told us they're under 18 — pause on the humane block, not the form.
  if (under18) {
    return (
      <Under18Notice
        onBack={() => setUnder18(false)}
        backLabel={t("auth:requestInvite.under18BackLabel")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.twoCol}>
        <FormField label={t("auth:requestInvite.field.name.label")}>
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
          onBlur={() => setTouched(true)}
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

      <div className={styles.agreeRow}>
        <input
          id="ri-agree"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="ri-agree">
          <Translation
            i18nKey="auth:requestInvite.agree"
            components={{
              guidelines: (
                <Link
                  to={routes.guidelines}
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            }}
          />
        </label>
      </div>

      <AgeAttestation
        id="ri-age"
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => setUnder18(true)}
      />

      <Button
        type="submit"
        className={styles.authBtn}
        disabled={!canSubmit}
        aria-busy={submitting}
      >
        {submitting ? (
          <Sending label={t("auth:requestInvite.sending")} />
        ) : (
          t("auth:requestInvite.submit")
        )}
      </Button>
    </form>
  );
}

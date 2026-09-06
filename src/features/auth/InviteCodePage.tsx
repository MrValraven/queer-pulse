import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiKey } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { focusFirstErrorAfterRender } from "../../shared/lib/focusFirstError";
import { inviteLink, routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AuthLayout } from "./AuthLayout";
import { isRoutableInviteCode, normalizeInviteCode } from "./api/invite.api";
import styles from "./auth.module.css";

/**
 * PRD-306. Somewhere to type an invite code.
 *
 * Before this, the only doors in were the whole `/auth/invite/:code` link or
 * Google sign-in. Codes are read out loud, screenshotted, and pasted without
 * the URL around them, so a person holding a perfectly good code and no link
 * had one option left: apply again. That spends one of their three requests an
 * hour and puts them in the review queue for an invite that already exists.
 *
 * Deliberately THIN. This page validates nothing about the code beyond "we can
 * put this in a URL", normalizes it, and navigates to `/auth/invite/:code`,
 * which already renders valid, expired, used, revoked and not-found. Every
 * judgement about a code stays in the one place that has always made it.
 *
 * PUBLIC, exactly like the landing page it hands off to: the person holding an
 * unredeemed invite has no account yet, which is the entire point. It is not on
 * `authGate.ts`'s guest-only list for the same reason `/auth/invite/:code` is
 * not: a signed-in member following a code lands on the landing page's own
 * "you already have an account" handling rather than being bounced.
 */
export function InviteCodePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [typedCode, setTypedCode] = useState("");
  // Errors appear only after a real attempt, so the field is never red before
  // anyone has done anything.
  const [hasAttempted, setHasAttempted] = useState(false);

  const normalizedCode = normalizeInviteCode(typedCode);
  const isMissing = hasAttempted && normalizedCode.length === 0;
  // Answered in the field rather than by navigating: a code carrying a slash
  // would miss the route entirely, which reads as a broken app instead of the
  // landing page's honest "we could not find that invite".
  const isUnusable =
    hasAttempted &&
    normalizedCode.length > 0 &&
    !isRoutableInviteCode(normalizedCode);
  const errorMessage = isMissing
    ? t("auth:inviteCode.error.missing")
    : isUnusable
      ? t("auth:inviteCode.error.unusable")
      : undefined;

  return (
    <AuthLayout>
      <div className={styles.codeIcon}>
        <FiKey aria-hidden />
      </div>
      <div className={styles.eyebrow}>{t("auth:inviteCode.eyebrow")}</div>
      <h1>
        <Translation
          i18nKey="auth:inviteCode.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.sub}>{t("auth:inviteCode.sub")}</p>

      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setHasAttempted(true);
          if (!isRoutableInviteCode(normalizedCode)) {
            // The message renders on this same pass; move focus onto the field
            // carrying it so a screen reader hears the reason rather than
            // being left on a button that appeared to do nothing.
            focusFirstErrorAfterRender(formRef.current);
            return;
          }
          navigate(inviteLink(normalizedCode));
        }}
      >
        <FormField
          label={t("auth:inviteCode.field.label")}
          required
          helper={t("auth:inviteCode.field.helper")}
          error={errorMessage}
        >
          <input
            type="text"
            className={styles.codeInput}
            value={typedCode}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t("auth:inviteCode.field.placeholder")}
            onChange={(event) => setTypedCode(event.target.value)}
          />
        </FormField>
        <Button type="submit" className={styles.authBtn}>
          {t("auth:inviteCode.submit")}
        </Button>
      </form>

      <div className={styles.footer}>
        {/* The honest second door: no code, or a code that turns out to be
            spent. Both end at the same form. */}
        <Link to={routes.requestInvite} className={styles.invite}>
          {t("auth:inviteCode.requestInsteadLink")}
        </Link>
        <Link to={routes.signIn}>{t("auth:inviteCode.alreadyMemberLink")}</Link>
      </div>
    </AuthLayout>
  );
}

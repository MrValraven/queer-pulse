import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { StudioGoogleButton } from "./StudioGoogleButton";
import { StudioTierPicker } from "./StudioTierPicker";
import {
  EMAIL_REGEX,
  STUDIO_AUTH_COPY,
  type StudioAuthMode,
} from "./studioSignIn.data";
import styles from "./StudioSignInPage.module.css";

/**
 * Shared email + submit pane behind both Studio auth flows. `mode` selects the
 * per-flow copy and the two genuine behavioural differences: "in" shows a
 * "Continue with Google" affordance and its submit fires a toast then redirects
 * to the studio; "join" shows the paid-tier picker, gates submit on a valid
 * email, and navigates to checkout. No real credential is verified yet — the
 * accounts are Google OAuth + invite, so there is deliberately no password field.
 */
export function StudioAuthPane({
  mode,
  onSwitch,
}: {
  mode: StudioAuthMode;
  onSwitch: () => void;
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const copy = STUDIO_AUTH_COPY[mode];
  const [email, setEmail] = useState("");
  // Hold the post-toast redirect timer so it can't fire navigate() after the
  // user has already left this pane / the page unmounted.
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  // Only the "join" flow gates submit on a valid-looking email; "sign in" keeps
  // its prototype-stub submit unconditional.
  const canSubmit = mode === "in" || EMAIL_REGEX.test(email.trim());

  function handleSubmit(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    if (mode === "in") {
      showToast(t("studio:signin.in.signedInToast"), "success");
      redirectTimerRef.current = setTimeout(
        () => void navigate(routes.studio),
        900,
      );
      return;
    }
    void navigate(routes.studioCheckout);
  }

  return (
    <div className={styles.pane}>
      <h1>
        <Translation i18nKey={copy.titleKey} components={{ em: <em /> }} />
      </h1>
      <p className={styles.lede}>{t(copy.ledeKey)}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor={copy.emailInputId}>
            {t("studio:signin.emailLabel")}
          </label>
          <input
            id={copy.emailInputId}
            type="email"
            placeholder={t("studio:signin.emailPlaceholder")}
            autoComplete="email"
            value={email}
            onChange={(changeEvent) => setEmail(changeEvent.target.value)}
          />
        </div>
        {/* No password field: QueerPulse accounts are Google OAuth + invite —
            there has never been a password to type here, and this pane's submit
            is still a prototype stub. An inert `type="password"` input would
            have password managers offering to save a credential that doesn't
            exist, on a screen that verifies nothing. */}
        {mode === "join" && <StudioTierPicker />}
        <Button
          type="submit"
          className={styles.btnFull}
          style={{ marginTop: 8 }}
          disabled={!canSubmit}
        >
          {t(copy.submitCtaKey)} <FiArrowRight aria-hidden />
        </Button>
      </form>

      {mode === "in" && <StudioGoogleButton />}

      <div className={styles.foot}>
        {t(copy.footPromptKey)}{" "}
        <button type="button" onClick={onSwitch}>
          {t(copy.footSwitchCtaKey)} <FiArrowRight aria-hidden />
        </button>
        <span className={styles.free}>
          {t(copy.footFreePromptKey)}{" "}
          <Link to={routes.studioLanding}>{t(copy.footFreeCtaKey)}</Link>
        </span>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GuidelinesLink } from "../marketing/GuidelinesLink";
import { usePushSubscription } from "../push/usePushSubscription";
import { BlockMuteInfoModal } from "../safety/BlockMuteInfoModal";
import { clearInviteWelcome } from "./api/pendingInvite";
import { useUnderAgeDisclosure } from "./api/useUnderAgeDisclosure";
import { AgeAttestation } from "./AgeAttestation";
import { Under18Notice } from "./Under18Notice";
import type { StepProps } from "./OnboardingStepChrome";
import { NORMS, QUICK_STARTS, ONBOARDING_PREVIEW } from "./onboardingPage.data";
import styles from "./OnboardingPage.module.css";

export function StepIntro({
  stepLabel,
  onNext,
}: {
  stepLabel: string;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.eye}>
        {stepLabel} · {t("auth:onboarding.welcomeToQueerPulse")}
      </div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepIntro.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.p}>{t("auth:onboarding.stepIntro.body")}</div>
      <div className={styles.normCards}>
        {ONBOARDING_PREVIEW.map((item) => (
          <div key={item.titleKey} className={styles.normCard}>
            <div className={styles.ncDot} />
            <div>
              <div className={styles.ncTitle}>{t(item.titleKey)}</div>
              <div className={styles.ncDesc}>{t(item.descriptionKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.navPlain}>
        <Button onClick={onNext}>{t("auth:onboarding.stepIntro.cta")}</Button>
      </div>
    </>
  );
}

export function StepNorms({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  // Records the disclosure with the backend and THEN ends the session — see
  // `useUnderAgeDisclosure` for why that order is the whole point.
  const { discloseAndSignOut } = useUnderAgeDisclosure();
  const [agreed, setAgreed] = useState(false);
  const [is18, setIs18] = useState(false);
  const [isUnder18, setIsUnder18] = useState(false);
  const [shake, setShake] = useState(false);
  const [showBlockMuteInfo, setShowBlockMuteInfo] = useState(false);

  // The 18+ attestation is recorded at SIGN-UP now (it rides the OAuth `state`
  // param; the backend refuses to create an account without it), so by the time
  // anyone reaches onboarding it is already on their user row. This step used to
  // POST /auth/onboarding, an endpoint that was never built — it 404'd silently
  // inside a try/catch on every signup.
  //
  // The checkbox stays deliberately: it is the one place someone who clicked
  // through the gate too fast can correct themselves and reach Under18Notice.
  function handleContinue() {
    onNext();
  }

  // Someone with a live account has just told us they're under 18. There is no
  // "go back and re-attest" from here: the only way on is out of the session,
  // so the wizard can't be finished by a self-declared minor.
  //
  // Signing out is no longer the end of it. `POST /auth/under-18-disclosure`
  // records the declaration and locks the account first, so the platform stops
  // holding an active adult-community account for someone who has told us they
  // are under 18. A failed call still signs them out, and it is logged.
  if (isUnder18) {
    return (
      <Under18Notice
        onSignOut={() => void discloseAndSignOut()}
        shouldShowContactLink
      />
    );
  }

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepNorms.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.normCards}>
        {NORMS.map((norm) => (
          <div key={norm.titleKey} className={styles.normCard}>
            <div className={styles.ncDot} />
            <div>
              <div className={styles.ncTitle}>{t(norm.titleKey)}</div>
              <div className={styles.ncDesc}>{t(norm.descriptionKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.notifyCard}>
        <span className={styles.notifyIcon} aria-hidden>
          <FiShield />
        </span>
        <div className={styles.notifyBody}>
          <div className={styles.notifyTitle}>
            {t("auth:onboarding.stepNorms.control.title")}
          </div>
          <div className={styles.notifyDesc}>
            <Translation
              i18nKey="auth:onboarding.stepNorms.control.desc"
              components={{
                a: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label -- role="button" span is named by the inner text `<Translation>` injects at render time (via cloneElement), which the rule can't see statically.
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.notifyLink}
                    onClick={() => setShowBlockMuteInfo(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowBlockMuteInfo(true);
                      }
                    }}
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>
      {showBlockMuteInfo && (
        <BlockMuteInfoModal onClose={() => setShowBlockMuteInfo(false)} />
      )}
      {/* A <div> row with a separate <label htmlFor>, mirroring the
          request-invite form: the guidelines opener inside the text is itself a
          control, and wrapping the whole row in a <label> both folded that
          control into the checkbox's accessible name and made every click on it
          also hit the checkbox (opening the modal AND firing the locked shake). */}
      <div
        className={`${styles.agreeRow} ${!agreed ? styles.locked : ""} ${shake ? styles.shake : ""}`}
        onAnimationEnd={() => setShake(false)}
      >
        {/* Read-only on purpose: reading the guidelines to the end is the only
            way to tick this. Controlled by `agreed`, which only the guidelines'
            confirm button flips (via `onRead`); `preventDefault` blocks any
            manual toggle from a click or Space. A click while locked triggers
            a shake instead of doing nothing, per design-best-practices: never
            leave a click silent. */}
        <input
          id="ob-agree"
          type="checkbox"
          checked={agreed}
          readOnly
          onClick={(e) => {
            e.preventDefault();
            if (!agreed) setShake(true);
          }}
          aria-describedby={!agreed ? "ob-agree-hint" : undefined}
        />
        <label htmlFor="ob-agree" className={styles.agreeLabel}>
          <Translation
            i18nKey="auth:onboarding.stepNorms.agree"
            components={{
              guidelines: <GuidelinesLink onRead={() => setAgreed(true)} />,
            }}
          />
        </label>
      </div>
      {!agreed && (
        <p id="ob-agree-hint" className={styles.readHint}>
          <FiLock aria-hidden /> {t("auth:onboarding.stepNorms.readHint")}
        </p>
      )}
      <AgeAttestation
        id="ob-age"
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => setIsUnder18(true)}
      />
      <div className={styles.nav}>
        <Button onClick={handleContinue} disabled={!agreed || !is18}>
          {t("auth:onboarding.stepNorms.continue")}
        </Button>
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepNorms.back")}
        </button>
      </div>
    </>
  );
}

/**
 * A lightweight, skippable notification opt-in on the wizard's final step.
 * Reuses the same `usePushSubscription` hook the account-settings row is
 * built on (see `PushNotificationRow`) rather than a new implementation, so
 * enabling here and in Settings stay perfectly in sync. The card only renders
 * when there is a genuine choice to make: hidden once the device is already
 * subscribed (nothing left to ask), when this browser can't show push at all,
 * or when notifications are already blocked at the OS/browser level (the
 * toggle can't re-prompt past that — the member would need their browser's
 * own settings). Leaving the toggle off is the skip; there is nothing further
 * to dismiss.
 */
function NotificationsOptIn() {
  const { t } = useTranslation();
  const { supported, permission, isSubscribed, busy, enable, disable } =
    usePushSubscription();

  if (!supported || permission === "denied" || isSubscribed) return null;

  const title = t("auth:onboarding.stepDone.notifications.title");

  return (
    <div className={styles.notifyCard}>
      <span className={styles.notifyIcon} aria-hidden>
        <FiBell />
      </span>
      <div className={styles.notifyBody}>
        <div className={styles.notifyTitle}>{title}</div>
        <div className={styles.notifyDesc}>
          {t("auth:onboarding.stepDone.notifications.desc")}
        </div>
      </div>
      {/* DES-170: the dimmed in-flight treatment is `.toggleBusy` in the
          module now, rather than an inline opacity literal. */}
      <div inert={busy} className={busy ? styles.toggleBusy : undefined}>
        <Toggle
          tone="coral"
          checked={isSubscribed}
          onChange={(next) => void (next ? enable() : disable())}
          label={title}
        />
      </div>
    </div>
  );
}

export function StepDone({
  stepLabel,
  hasStampFailed = false,
  onRetryStamp,
}: {
  stepLabel: string;
  /** True when the "you finished onboarding" stamp didn't reach the backend. */
  hasStampFailed?: boolean;
  onRetryStamp?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepDone.heading"
          components={{ em: <em /> }}
        />
      </div>
      {/* Without the stamp the auth gate will walk this member back through the
          wizard on their next gated navigation, so offer the retry here rather
          than letting it fail silently. */}
      {hasStampFailed && onRetryStamp && (
        <div className={styles.notifyCard} role="alert">
          <span className={styles.notifyIcon} aria-hidden>
            <FiAlertCircle />
          </span>
          <div className={styles.notifyBody}>
            <div className={styles.notifyTitle}>
              {t("auth:onboarding.stepDone.stampFailed.title")}
            </div>
            <div className={styles.notifyDesc}>
              {t("auth:onboarding.stepDone.stampFailed.desc")}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRetryStamp}>
            {t("auth:onboarding.stepDone.stampFailed.retry")}
          </Button>
        </div>
      )}
      <NotificationsOptIn />
      <div className={styles.quickStart}>
        {QUICK_STARTS.map((qs) => (
          <Link key={qs.to} to={qs.to} className={styles.qsCard}>
            <span
              className={styles.qsIcon}
              style={{ background: qs.iconBackground }}
            >
              <qs.icon />
            </span>
            <div className={styles.qsBody}>
              <div className={styles.qsTitle}>{t(qs.titleKey)}</div>
              <div className={styles.qsDesc}>
                {t(qs.descriptionKey, qs.descriptionValues)}
              </div>
            </div>
            <span className={styles.qsArrow} aria-hidden>
              <FiArrowRight />
            </span>
          </Link>
        ))}
      </div>
      <div className={styles.nav}>
        <Button
          onClick={() => {
            clearInviteWelcome();
            void navigate(routes.feed);
          }}
        >
          {t("auth:onboarding.stepDone.cta")}
        </Button>
      </div>
    </>
  );
}

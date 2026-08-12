import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GuidelinesLink } from "../marketing/GuidelinesLink";
import { clearInviteWelcome } from "./api/pendingInvite";
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
      <div className={styles.nav}>
        <Button onClick={onNext}>{t("auth:onboarding.stepIntro.cta")}</Button>
      </div>
    </>
  );
}

export function StepNorms({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);

  // The 18+ attestation is recorded at SIGN-UP now (it rides the OAuth `state`
  // param; the backend refuses to create an account without it), so by the time
  // anyone reaches onboarding it is already on their user row. This step used to
  // POST /auth/onboarding, an endpoint that was never built — it 404'd silently
  // inside a try/catch on every signup.
  //
  // The checkbox stays deliberately: it is the one place someone who clicked
  // through the gate too fast can correct themselves and reach Under18Notice.
  // It confirms; it no longer records.
  function handleContinue() {
    onNext();
  }

  if (under18) {
    return <Under18Notice onBack={() => setUnder18(false)} />;
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
      <label className={styles.agreeRow}>
        <input
          type="checkbox"
          checked={agreed}
          disabled={!hasRead}
          aria-describedby={!hasRead ? "ob-agree-hint" : undefined}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className={styles.agreeLabel}>
          <Translation
            i18nKey="auth:onboarding.stepNorms.agree"
            components={{ guidelines: <GuidelinesLink onRead={() => setHasRead(true)} /> }}
          />
        </span>
      </label>
      {!hasRead && (
        <p id="ob-agree-hint" className={styles.readHint}>
          {t("auth:onboarding.stepNorms.readHint")}
        </p>
      )}
      <AgeAttestation
        id="ob-age"
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => setUnder18(true)}
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

export function StepDone({ stepLabel }: { stepLabel: string }) {
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
      <div className={styles.quickStart}>
        {QUICK_STARTS.map((qs) => (
          <Link key={qs.to} to={qs.to} className={styles.qsCard}>
            <span className={styles.qsIcon} style={{ background: qs.iconBackground }}>
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

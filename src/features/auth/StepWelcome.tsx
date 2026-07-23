import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUser, getMember } from "../members/data/members";
import { readInviteWelcome } from "./api/pendingInvite";
import styles from "./OnboardingPage.module.css";

export function StepWelcome({
  stepLabel,
  onNext,
}: {
  stepLabel: string;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  // Who vouched + their words, stashed by the invite landing page from the real
  // `GET /invites/:code`. In demo mode we fall back to the mock inviter (Inês)
  // so the standalone prototype still tells a story; in LIVE mode we must never
  // fabricate an inviter — an absent payload means we simply don't show one.
  const [welcome] = useState(readInviteWelcome);
  const firstName = user?.profile.firstName ?? (demoMode ? currentUser.first : "");

  const demoInviter = demoMode
    ? (() => {
        const ines = getMember("ines")!;
        return {
          name: `${ines.first} ${ines.last}`,
          initials: ines.initials,
          since: ines.since,
          role: ines.role.split(" · ")[0],
          photo: ines.photo,
        };
      })()
    : null;

  const inviter = welcome?.inviter ?? null;
  const showVouch = Boolean(inviter) || Boolean(demoInviter);

  const inviterName = inviter?.name ?? demoInviter?.name ?? "";
  const inviterInitials = inviter?.initials ?? demoInviter?.initials ?? "";
  const inviterPhoto = inviter?.photo ?? demoInviter?.photo;
  const inviterMeta = inviter
    ? inviter.since
      ? t("auth:onboarding.stepWelcome.memberSince", { since: inviter.since })
      : t("auth:onboarding.stepWelcome.invitedYou")
    : demoInviter
      ? t("auth:onboarding.stepWelcome.memberSinceRole", {
          since: demoInviter.since,
          role: demoInviter.role,
        })
      : "";
  const vouchText =
    welcome?.vouch ??
    (demoInviter
      ? t("auth:onboarding.stepWelcome.vouchFallback", { firstName })
      : "");

  return (
    <>
      <div className={styles.checkWrap}>
        <svg viewBox="0 0 72 72" width={72} height={72}>
          <circle className={styles.checkCircle} cx={36} cy={36} r={33} />
          <path className={styles.checkMark} d="M22 36l10.5 11.5L50 24" />
        </svg>
      </div>
      <div className={styles.eye}>
        {stepLabel} · {t("auth:onboarding.stepWelcome.eyebrowSuffix")}
      </div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepWelcome.heading"
          components={{ em: <em /> }}
          values={{ firstName }}
        />
      </div>
      {showVouch && (
        <div className={styles.vouchCard}>
          <div className={styles.vcAv} aria-hidden>
            {inviterPhoto ? (
              <img
                src={inviterPhoto}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              inviterInitials
            )}
          </div>
          <div>
            <div className={styles.vcName}>{inviterName}</div>
            <div className={styles.vcRole}>{inviterMeta}</div>
            <div className={styles.vcNote}>“{vouchText}”</div>
          </div>
        </div>
      )}
      <div className={styles.p}>{t("auth:onboarding.stepWelcome.body")}</div>
      <div className={styles.nav}>
        <Button onClick={onNext}>{t("auth:onboarding.stepWelcome.cta")}</Button>
      </div>
    </>
  );
}

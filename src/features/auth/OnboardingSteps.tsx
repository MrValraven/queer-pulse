import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiCamera } from "react-icons/fi";
import {
  Button,
  ImageSlot,
  ChipSelect,
  useChipSet,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUser, getMember } from "../members/data/members";
import { clearInviteWelcome, readInviteWelcome } from "./api/pendingInvite";
import { useAgeAttestation } from "./api/useAgeAttestation";
import { AgeAttestation } from "./AgeAttestation";
import { Under18Notice } from "./Under18Notice";
import { logError } from "../../shared/observability/logger";
import {
  NORMS,
  INTENTS,
  COMMUNITIES_LIST,
  QUICK_STARTS,
  ONBOARDING_PREVIEW,
} from "./onboardingPage.data";
import styles from "./OnboardingPage.module.css";

const INVITER = getMember("ines")!;
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`;
const INVITER_ROLE = INVITER.role.split(" · ")[0];

interface StepProps {
  stepLabel: string;
  onNext: () => void;
  onBack: () => void;
}

/** A clearly-styled "skip for now" affordance for non-critical steps. */
function SkipLink({ onSkip, label }: { onSkip: () => void; label?: string }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.skip} onClick={onSkip}>
      {label ?? t("auth:onboarding.stepPhoto.skip")} <FiArrowRight aria-hidden />
    </button>
  );
}

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
              <div className={styles.ncDesc}>{t(item.descKey)}</div>
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

export function StepWelcome({
  stepLabel,
  onNext,
}: {
  stepLabel: string;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Who vouched + their words, stashed by the invite landing; falls back to the
  // mock inviter when onboarding is reached without an invite in flight.
  const [welcome] = useState(readInviteWelcome);
  const firstName = user?.profile.firstName ?? currentUser.first;

  const inviter = welcome?.inviter ?? {
    name: INVITER_NAME,
    firstName: INVITER.first,
    initials: INVITER.initials,
    since: INVITER.since,
    photo: INVITER.photo,
  };
  const inviterMeta = welcome
    ? inviter.since
      ? t("auth:onboarding.stepWelcome.memberSince", { since: inviter.since })
      : t("auth:onboarding.stepWelcome.invitedYou")
    : t("auth:onboarding.stepWelcome.memberSinceRole", {
        since: INVITER.since,
        role: INVITER_ROLE,
      });
  const vouchText =
    welcome?.vouch ??
    t("auth:onboarding.stepWelcome.vouchFallback", { firstName });

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
      <div className={styles.vouchCard}>
        <div className={styles.vcAv} aria-hidden>
          {inviter.photo ? (
            <img
              src={inviter.photo}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            inviter.initials
          )}
        </div>
        <div>
          <div className={styles.vcName}>{inviter.name}</div>
          <div className={styles.vcRole}>{inviterMeta}</div>
          <div className={styles.vcNote}>“{vouchText}”</div>
        </div>
      </div>
      <div className={styles.p}>{t("auth:onboarding.stepWelcome.body")}</div>
      <div className={styles.nav}>
        <Button onClick={onNext}>{t("auth:onboarding.stepWelcome.cta")}</Button>
      </div>
    </>
  );
}

export function StepPhoto({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Prefill from the Google account they signed in with; fall back to initials.
  const googlePhoto = user?.profile.avatarUrl ?? undefined;
  const initials = user
    ? `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`.toUpperCase()
    : "S";
  // Local preview for a photo they pick here — a genuine client-side swap, no upload backend.
  const [preview, setPreview] = useState<string | null>(null);
  const shownPhoto = preview ?? googlePhoto;

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
  }

  const caption = preview
    ? t("auth:onboarding.stepPhoto.captionPreview")
    : googlePhoto
      ? t("auth:onboarding.stepPhoto.captionGoogle")
      : t("auth:onboarding.stepPhoto.captionUpload");

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepPhoto.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.p}>{t("auth:onboarding.stepPhoto.body")}</div>
      <div className={styles.photoWrap}>
        <label className={styles.photoFrame}>
          <input
            type="file"
            accept="image/*"
            className={styles.photoInput}
            onChange={handleFile}
            aria-label={t("auth:onboarding.stepPhoto.uploadAriaLabel")}
          />
          <ImageSlot
            shape="circle"
            tint="coral"
            width={132}
            height={132}
            placeholder={t("auth:onboarding.stepPhoto.placeholder")}
            src={shownPhoto}
            initials={initials}
            alt={t("auth:onboarding.stepPhoto.photoAlt")}
          />
          <span className={styles.photoEdit} aria-hidden>
            <FiCamera />
          </span>
        </label>
        <p className={styles.photoCaption}>{caption}</p>
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>{t("auth:onboarding.stepPhoto.continue")}</Button>
        <SkipLink onSkip={onNext} />
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepPhoto.back")}
        </button>
      </div>
    </>
  );
}

export function StepNorms({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);
  const attest = useAgeAttestation();

  // This is the load-bearing age gate: Google can't tell us how old anyone is, so
  // completing this step is what records the 18+ attestation and lets a `pending`
  // account become `active`. Best-effort — a failed POST doesn't trap onboarding.
  async function handleContinue() {
    try {
      await attest.mutateAsync({});
    } catch (err) {
      logError(err, { where: "onboarding.ageAttestation" });
    }
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
              <div className={styles.ncDesc}>{t(norm.descKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <label className={styles.agreeRow}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className={styles.agreeLabel}>
          <Translation
            i18nKey="auth:onboarding.stepNorms.agree"
            components={{ guidelines: <Link to={routes.guidelines} /> }}
          />
        </span>
      </label>
      <AgeAttestation
        id="ob-age"
        confirmed={is18}
        onConfirmedChange={setIs18}
        onUnder18={() => setUnder18(true)}
      />
      <div className={styles.nav}>
        <Button
          onClick={handleContinue}
          disabled={!agreed || !is18 || attest.isPending}
          aria-busy={attest.isPending}
        >
          {t("auth:onboarding.stepNorms.continue")}
        </Button>
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepNorms.back")}
        </button>
      </div>
    </>
  );
}

export function StepIntents({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const { selected: selectedIntents, toggle: toggleIntent } = useChipSet([
    "Community",
    "Professional connections",
    "Creative collaboration",
  ]);
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepIntents.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.chipHint}>{t("auth:onboarding.stepIntents.hint")}</div>
      <ChipSelect
        className={styles.chips}
        options={INTENTS.map((intent) => ({
          value: intent.value,
          label: t(intent.labelKey),
        }))}
        selected={selectedIntents}
        onToggle={toggleIntent}
      />
      <div className={styles.nav}>
        <Button onClick={onNext} disabled={!hasSelection}>
          {t("auth:onboarding.stepIntents.continue")}
        </Button>
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepIntents.back")}
        </button>
      </div>
    </>
  );
}

export function StepCommunities({ stepLabel, onNext, onBack }: StepProps) {
  const { t } = useTranslation();
  const [joined, setJoined] = useState<Set<string>>(new Set(["cc1"]));
  function toggleJoin(id: string) {
    setJoined((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepCommunities.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.p} style={{ marginBottom: 20 }}>
        {t("auth:onboarding.stepCommunities.body")}
      </div>
      <div className={styles.communityGrid}>
        {COMMUNITIES_LIST.map((community) => {
          const isJoined = joined.has(community.id);
          return (
            <div
              key={community.id}
              className={[styles.commCard, isJoined && styles.commJoined]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.ccName}>{community.name}</div>
              <div className={styles.ccCount}>{community.count}</div>
              <div className={styles.ccDesc}>{community.desc}</div>
              <button
                type="button"
                className={[styles.ccJoin, isJoined && styles.ccJoinActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleJoin(community.id)}
              >
                {isJoined ? (
                  <>
                    <FiCheck /> {t("auth:onboarding.stepCommunities.joined")}
                  </>
                ) : (
                  t("auth:onboarding.stepCommunities.join")
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.nav}>
        <Button onClick={onNext}>{t("auth:onboarding.stepCommunities.continue")}</Button>
        <SkipLink
          onSkip={onNext}
          label={t("auth:onboarding.stepCommunities.skip")}
        />
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepCommunities.back")}
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
            <span className={styles.qsIcon} style={{ background: qs.iconBg }}>
              <qs.icon />
            </span>
            <div className={styles.qsBody}>
              <div className={styles.qsTitle}>{t(qs.titleKey)}</div>
              <div className={styles.qsDesc}>{t(qs.descKey, qs.descValues)}</div>
            </div>
            <span className={styles.qsArrow}>→</span>
          </Link>
        ))}
      </div>
      <div className={styles.nav}>
        <Button
          onClick={() => {
            clearInviteWelcome();
            navigate(routes.feed);
          }}
        >
          {t("auth:onboarding.stepDone.cta")}
        </Button>
      </div>
    </>
  );
}

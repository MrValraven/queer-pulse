import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Avatar, BrandMark } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { linkToPath } from "../../../app/routeMap";
import type { BuiltStep, BuiltVoice } from "../data/types";
import { BuiltStepExplainerModal } from "./BuiltStepExplainerModal";
import styles from "./PainPoints.module.css";

/**
 * The card's own header — eyebrow, rich-text title, and the two lead lines:
 * a one-sentence lede and a shorter support line under it.
 */
export function BuiltCardHead() {
  const { t } = useTranslation();
  return (
    <header className={styles.cardHead}>
      <div className={styles.eyebrow}>
        <span className={styles.live} aria-hidden="true" />
        {t("homepage:painPoints.eyebrow")}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="homepage:painPoints.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={`${styles.sub} ${styles.lede}`}>
        {t("homepage:painPoints.lede")}
      </p>
      <p className={`${styles.sub} ${styles.support}`}>
        {t("homepage:painPoints.support")}
      </p>
    </header>
  );
}

/** The step's icon in its tone-tinted tile. */
export function BuiltStepIcon({ step }: { step: BuiltStep }) {
  const Icon = step.icon;
  return (
    <span
      className={[
        styles.icon,
        step.tone === "safe" && styles.iconSafe,
        !step.isLaunched && styles.iconSoon,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <Icon />
    </span>
  );
}

/**
 * One icon + label row on the rail. A control, not a link: selecting it shows
 * that step's conversation on the rest of the card, the same way a member row
 * features a member in the Discovery spotlight.
 */
export function BuiltStepButton({
  step,
  active,
  onSelect,
}: {
  step: BuiltStep;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={[styles.railBtn, active && styles.railBtnOn]
        .filter(Boolean)
        .join(" ")}
    >
      <BuiltStepIcon step={step} />
      <span
        className={[styles.railLabel, !step.isLaunched && styles.railLabelSoon]
          .filter(Boolean)
          .join(" ")}
      >
        {t(step.labelKey)}
      </span>
      {/* The grey is the quick read; this word is what carries it for anyone
          who cannot use the colour. */}
      {!step.isLaunched && (
        <span className={styles.soon}>{t("homepage:painPoints.soon")}</span>
      )}
      <span className={styles.arrow} aria-hidden="true">
        <FiArrowRight />
      </span>
    </button>
  );
}

/**
 * One line of the conversation: an initials avatar, the speaker's name, and
 * their bubble. The avatar is hidden from assistive tech — the visible name
 * beside it is the label, so reading the initials aloud would only repeat it.
 */
function VoiceMessage({
  voice,
  textKey,
  side = "left",
  resolved = false,
}: {
  voice: BuiltVoice;
  textKey: string;
  side?: "left" | "right";
  resolved?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={[styles.msg, side === "right" && styles.msgRight]
        .filter(Boolean)
        .join(" ")}
    >
      <Avatar
        src={voice.photo}
        initials={voice.initials}
        tint={voice.tint}
        size={38}
        aria-hidden="true"
        className={styles.msgAvatar}
      />
      <div className={styles.msgBody}>
        <span className={styles.msgName}>{voice.name}</span>
        <p
          className={[styles.bubble, resolved && styles.bubbleResolved]
            .filter(Boolean)
            .join(" ")}
        >
          {t(textKey)}
        </p>
      </div>
    </div>
  );
}

/**
 * The selected step as a conversation: two voices name the gap, we answer in
 * the same thread, then, weeks later, both of them say what changed.
 */
/**
 * The step's call to action. A signed-in member (demo mode included, since the
 * mock persona is always "signed in") goes straight to the surface. A signed-out
 * visitor would only be bounced to sign-in by the gated half of these routes, so
 * they get the explainer instead: what the thing is, and the ask to join.
 */
export function BuiltStepCta({ step }: { step: BuiltStep }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const label = t(step.ctaLabelKey);

  if (loggedIn) {
    return (
      <Link to={linkToPath(step.href)} className={styles.link}>
        {label}
        <FiArrowRight aria-hidden="true" />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.link} ${styles.linkBtn}`}
        onClick={() => setIsExplainerOpen(true)}
      >
        {label}
        <FiArrowRight aria-hidden="true" />
      </button>
      {isExplainerOpen && (
        <BuiltStepExplainerModal
          step={step}
          onClose={() => setIsExplainerOpen(false)}
        />
      )}
    </>
  );
}

export function BuiltStepDetail({ step }: { step: BuiltStep }) {
  const { t } = useTranslation();
  return (
    <div className={styles.detail}>
      <VoiceMessage voice={step.firstVoice} textKey={step.questionKey} />
      <VoiceMessage
        voice={step.secondVoice}
        textKey={step.question2Key}
        side="right"
      />

      {/* Our answer sits in the thread as a message of its own, in the same
          avatar + name + bubble rhythm as the voices around it. */}
      <div className={`${styles.msg} ${styles.msgUs}`}>
        <span className={styles.usAvatar} aria-hidden="true">
          <BrandMark state="rest" tone="mono" size="100%" />
        </span>
        <div className={styles.msgBody}>
          <span className={styles.msgName}>{t("homepage:painPoints.us")}</span>
          <div className={styles.answer}>
            <h3 className={styles.answerH}>
              <Translation
                i18nKey={step.headingKey}
                components={{ em: <em /> }}
              />
            </h3>
            <p className={styles.answerBody}>{t(step.bodyKey)}</p>
            <BuiltStepCta step={step} />
          </div>
        </div>
      </div>

      <div className={styles.later}>
        <span>{t("homepage:painPoints.later")}</span>
      </div>

      <VoiceMessage voice={step.firstVoice} textKey={step.payoffKey} resolved />
      <VoiceMessage
        voice={step.secondVoice}
        textKey={step.payoff2Key}
        side="right"
        resolved
      />
    </div>
  );
}

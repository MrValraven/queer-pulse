import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { type Perk, sidebarCopy } from "./perks.data";
import { useRecognition } from "./api/useRecognition";
import styles from "./PerksPage.module.css";

const barClass = {
  available: styles.barAvailable,
  locked: styles.barLocked,
  claimed: styles.barClaimed,
} as const;

const catClass = {
  available: styles.catAvailable,
  locked: styles.catLocked,
  claimed: styles.catClaimed,
} as const;

function CheckMini() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path
        d="M2 5.5l2.5 2.5 4.5-5"
        stroke="var(--jade)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AutoCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 6l3 3 6-5"
        stroke="var(--jade)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect
        x="2"
        y="5.5"
        width="8"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M4 5.5V3.5a2 2 0 0 1 4 0v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClaimButton({ label, toast }: { label: string; toast: string }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [claimed, setClaimed] = useState(false);

  if (claimed) {
    return (
      <span className={styles.claimedChip}>
        <FiCheck aria-hidden /> {t("members:perks.claim.claimed")}
      </span>
    );
  }
  return (
    <Button
      onClick={() => {
        // No claim endpoint exists yet. Demo simulates the redemption; live must
        // not fake a "claimed" success — say plainly it isn't wired up.
        if (!demoMode) {
          showToast(t("members:perks.claim.unavailableToast"), "info");
          return;
        }
        setClaimed(true);
        showToast(toast, "success");
      }}
    >
      {label}
    </Button>
  );
}

function PerkFooter({ perk }: { perk: Perk }) {
  const { t } = useTranslation();
  const f = perk.footer;
  switch (f.type) {
    case "active-auto":
      return (
        <div className={styles.actionRow}>
          <span className={styles.claimedChip}>
            <CheckMini /> {t("members:perks.claim.alreadyActive")}
          </span>
          <span className={styles.autoChip}>
            <AutoCheck /> {f.autoLabel}
          </span>
        </div>
      );
    case "button":
      return (
        <div className={styles.actionRow}>
          <ClaimButton label={f.label} toast={f.toast} />
        </div>
      );
    case "link-auto":
      return (
        <div className={styles.actionRow}>
          <Button to={f.to}>{f.label}</Button>
          <span className={styles.autoChip}>
            <AutoCheck /> {f.autoLabel}
          </span>
        </div>
      );
    case "lock":
      return (
        <span className={styles.lockChip}>
          <LockMini /> {f.label}
        </span>
      );
    case "claimed":
      return (
        <div className={styles.actionRow}>
          <span className={styles.claimedChip}>
            <CheckMini /> {t("members:perks.claim.active")}
          </span>
          <span className={styles.claimedDate}>{f.date}</span>
        </div>
      );
  }
}

function PerkCard({ perk }: { perk: Perk }) {
  const dimmed = perk.state !== "available";
  return (
    <article
      className={`${styles.perkCard} ${dimmed ? styles.perkCardDim : ""}`}
    >
      <div className={`${styles.pcBar} ${barClass[perk.state]}`} />
      <div className={styles.pcBody}>
        <div className={`${styles.pcCat} ${catClass[perk.state]}`}>
          {perk.category}
        </div>
        <h3 className={`${styles.pcTitle} ${dimmed ? styles.pcTitleDim : ""}`}>
          {perk.title}
        </h3>
        <p className={`${styles.pcDesc} ${dimmed ? styles.pcDescDim : ""}`}>
          {perk.description}
        </p>
        <div className={styles.pcFooter}>
          <PerkFooter perk={perk} />
        </div>
      </div>
    </article>
  );
}

export function PerkGroups() {
  const { perks } = useRecognition();
  let cardIndex = 0;
  return (
    <div>
      {perks.groups.map((group) => (
        <div key={group.label}>
          <div className={styles.groupLabel}>{group.label}</div>
          {group.perks.map((perk) => (
            <FadeIn key={perk.title} delay={Math.min(cardIndex++, 8) * 60}>
              <PerkCard perk={perk} />
            </FadeIn>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PerksSidebar() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { level } = useRecognition();
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");
  const suggestFieldId = useId();

  function send() {
    // No suggestion endpoint yet. Demo confirms receipt; live must not fake it.
    if (!demoMode) {
      showToast(t("members:perks.sidebar.suggestUnavailableToast"), "info");
      setIdea("");
      return;
    }
    showToast(sidebarCopy.suggestToast, "success");
    setIdea("");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("members:perks.sidebar.yourLevelTitle")}
        </div>
        <div className={styles.miniLevel}>
          {t("members:profile.hero.levelLabel", { number: level.level })} ·{" "}
          <em>{level.name}</em>
        </div>
        <div className={styles.miniXpBar}>
          <div
            className={styles.miniXpFill}
            style={{ width: `${level.percent}%` }}
          />
        </div>
        <div className={styles.miniXpLabel}>
          {t("members:perks.sidebar.xpSummary", {
            xp: level.xp,
            xpMax: level.xpMax,
            xpToNext: level.xpToNext,
            nextLevel: level.level + 1,
          })}
        </div>
        <div className={styles.nextPerkNote}>
          <Translation
            i18nKey="members:perks.sidebar.nextUnlockNote"
            components={{ strong: <strong /> }}
            values={{ nextLevel: level.level + 1, nextName: level.nextName }}
          />
        </div>
        <Link to={routes.badges} className={styles.sbLink}>
          {t("members:perks.sidebar.seeAllBadgesCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("members:perks.sidebar.explainedTitle")}
        </div>
        <div className={styles.explainText}>{sidebarCopy.explain}</div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("members:perks.sidebar.suggestTitle")}
        </div>
        <label className={styles.suggestLabel} htmlFor={suggestFieldId}>
          {sidebarCopy.suggestPrompt}
        </label>
        <textarea
          id={suggestFieldId}
          className={styles.suggestTa}
          placeholder={t("members:perks.sidebar.suggestPlaceholder")}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <Button variant="ghost" className={styles.suggestBtn} onClick={send}>
          {t("members:perks.sidebar.sendSuggestionCta")}
        </Button>
      </div>
    </aside>
  );
}

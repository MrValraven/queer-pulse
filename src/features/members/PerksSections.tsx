import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { type Perk, sidebarCopy } from "./perks.data";
import { useRecognition } from "./api/useRecognition";
import { levelNameKeyFor } from "./levelLadder.data";
import {
  perkCategoryLabelKeyFor,
  perkDisplayMetaFor,
} from "./perkCatalog.data";
import { useClaimPerk } from "./api/useRecognitionMutations";
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

/**
 * Claims one perk. Demo simulates the redemption locally, as it always has.
 * LIVE now calls the real endpoint (`POST /me/recognition/perks/:key/claim`,
 * added in SUS-04) and only shows the claimed state once the server has
 * written the row — a failed claim shows the failure, never a fake success.
 */
export function ClaimButton({
  perkKey,
  label,
  toast,
}: {
  perkKey: string;
  label: string;
  toast: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const claim = useClaimPerk();

  if (claimed) {
    return (
      <span className={styles.claimedChip}>
        <FiCheck aria-hidden /> {t("members:perks.claim.claimed")}
      </span>
    );
  }
  return (
    <Button
      disabled={claim.isPending}
      onClick={() => {
        if (demoMode) {
          setClaimed(true);
          showToast(toast, "success");
          return;
        }
        claim.mutate(perkKey, {
          onSuccess: () => {
            setClaimed(true);
            showToast(toast, "success");
          },
          onError: () =>
            showToast(t("members:perks.claim.errorToast"), "error"),
        });
      }}
    >
      {claim.isPending ? t("members:perks.claim.claiming") : label}
    </Button>
  );
}

/**
 * A perk's footer. Every branch prefers the frontend's own words, keyed on
 * the perk's stable id (`perkCatalog.data.ts`), and falls back to the English
 * the server still sends beside that id, so a perk this build has not caught
 * up with reads as a sentence rather than as a key.
 */
function PerkFooter({ perk }: { perk: Perk }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const footerCopy = perkDisplayMetaFor(perk.key)?.footer;
  const footer = perk.footer;
  switch (footer.type) {
    case "active-auto": {
      const autoLabelKey = footerCopy?.autoLabelKey;
      return (
        <div className={styles.actionRow}>
          <span className={styles.claimedChip}>
            <CheckMini /> {t("members:perks.claim.alreadyActive")}
          </span>
          <span className={styles.autoChip}>
            <AutoCheck /> {autoLabelKey ? t(autoLabelKey) : footer.autoLabel}
          </span>
        </div>
      );
    }
    case "button": {
      const buttonLabelKey = footerCopy?.buttonLabelKey;
      const toastKey = footerCopy?.toastKey;
      return (
        <div className={styles.actionRow}>
          <ClaimButton
            perkKey={perk.key}
            label={buttonLabelKey ? t(buttonLabelKey) : footer.label}
            toast={toastKey ? t(toastKey) : footer.toast}
          />
        </div>
      );
    }
    case "link-auto": {
      // No catalogue entry uses this variant today. It resolves through the
      // same display meta as the others so adding one needs no change here.
      const linkLabelKey = footerCopy?.buttonLabelKey;
      const linkAutoLabelKey = footerCopy?.autoLabelKey;
      return (
        <div className={styles.actionRow}>
          <Button to={footer.to}>
            {linkLabelKey ? t(linkLabelKey) : footer.label}
          </Button>
          <span className={styles.autoChip}>
            <AutoCheck />{" "}
            {linkAutoLabelKey ? t(linkAutoLabelKey) : footer.autoLabel}
          </span>
        </div>
      );
    }
    case "lock": {
      // The level's NAME is owned by the frontend and keyed on the level
      // number, so the lock chip is built here rather than read off the wire.
      const levelNameKey = levelNameKeyFor(footer.unlockLevel);
      return (
        <span className={styles.lockChip}>
          <LockMini />{" "}
          {levelNameKey
            ? t("members:perks.claim.unlocksAt", {
                level: footer.unlockLevel,
                name: t(levelNameKey),
              })
            : footer.label}
        </span>
      );
    }
    case "claimed": {
      // The wire carries an ISO instant; the date format belongs to the
      // reader's locale, so it is phrased and formatted here.
      const claimedOn = new Date(footer.date);
      const hasRealDate = !Number.isNaN(claimedOn.getTime());
      return (
        <div className={styles.actionRow}>
          <span className={styles.claimedChip}>
            <CheckMini /> {t("members:perks.claim.active")}
          </span>
          <span className={styles.claimedDate}>
            {hasRealDate
              ? t("members:perks.claim.claimedOn", {
                  date: formatters.date(claimedOn),
                })
              : footer.date}
          </span>
        </div>
      );
    }
  }
}

function PerkCard({ perk }: { perk: Perk }) {
  const { t } = useTranslation();
  const dimmed = perk.state !== "available";
  const displayMeta = perkDisplayMetaFor(perk.key);
  const categoryKey =
    displayMeta?.categoryKey ?? perkCategoryLabelKeyFor(perk.category);
  // The invite-quota perks name real numbers, so the translated sentence
  // interpolates the ones the backend enforces rather than baking in a pair.
  const description = displayMeta
    ? t(displayMeta.descKey, {
        base: perk.inviteQuota?.base,
        total: perk.inviteQuota?.total,
      })
    : perk.description;
  return (
    <article
      className={`${styles.perkCard} ${dimmed ? styles.perkCardDim : ""}`}
    >
      <div className={`${styles.pcBar} ${barClass[perk.state]}`} />
      <div className={styles.pcBody}>
        <div className={`${styles.pcCat} ${catClass[perk.state]}`}>
          {categoryKey ? t(categoryKey) : perk.category}
        </div>
        <h3 className={`${styles.pcTitle} ${dimmed ? styles.pcTitleDim : ""}`}>
          {displayMeta ? t(displayMeta.titleKey) : perk.title}
        </h3>
        <p className={`${styles.pcDesc} ${dimmed ? styles.pcDescDim : ""}`}>
          {description}
        </p>
        <div className={styles.pcFooter}>
          <PerkFooter perk={perk} />
        </div>
      </div>
    </article>
  );
}

export function PerkGroups() {
  const { t } = useTranslation();
  const { perks } = useRecognition();
  let cardIndex = 0;
  return (
    <div>
      {perks.groups.map((group) => {
        // "Coming at Level 5 · Trusted" names a level, and the level names are
        // owned here (`levelLadder.data.ts`). An unknown rung keeps the
        // server's own heading rather than a half-translated one.
        const levelNameKey =
          group.unlockLevel === undefined
            ? null
            : levelNameKeyFor(group.unlockLevel);
        let heading = group.label;
        if (group.kind === "available") {
          heading = t("members:perks.group.available");
        } else if (group.kind === "claimed") {
          heading = t("members:perks.group.claimed");
        } else if (group.unlockLevel !== undefined && levelNameKey) {
          heading = t("members:perks.group.coming", {
            level: group.unlockLevel,
            name: t(levelNameKey),
          });
        }
        return (
          <div key={`${group.kind}-${group.unlockLevel ?? 0}`}>
            <div className={styles.groupLabel}>{heading}</div>
            {group.perks.map((perk) => (
              <FadeIn key={perk.key} delay={Math.min(cardIndex++, 8) * 60}>
                <PerkCard perk={perk} />
              </FadeIn>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function PerksSidebar() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { level } = useRecognition();
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);
  const nextLevelNameKey = levelNameKeyFor(level.level + 1);
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
          <em>{levelNameKey ? t(levelNameKey) : level.name}</em>
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
            values={{
              nextLevel: level.level + 1,
              nextName: nextLevelNameKey ? t(nextLevelNameKey) : level.nextName,
            }}
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
        <div className={styles.explainText}>
          {demoMode
            ? sidebarCopy.explain
            : t("members:perks.sidebar.explainBody")}
        </div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("members:perks.sidebar.suggestTitle")}
        </div>
        <label className={styles.suggestLabel} htmlFor={suggestFieldId}>
          {t("members:perks.sidebar.suggestLabel")}
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { levelInfo } from "./badges.data";
import { type Perk, perkGroups, sidebarCopy } from "./perks.data";
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
  const { showToast } = useToast();
  const [claimed, setClaimed] = useState(false);

  if (claimed) {
    return (
      <span className={styles.claimedChip}>
        <FiCheck aria-hidden /> Claimed
      </span>
    );
  }
  return (
    <Button
      onClick={() => {
        setClaimed(true);
        showToast(toast, "success");
      }}
    >
      {label}
    </Button>
  );
}

function PerkFooter({ perk }: { perk: Perk }) {
  const f = perk.footer;
  switch (f.type) {
    case "active-auto":
      return (
        <div className={styles.actionRow}>
          <span className={styles.claimedChip}>
            <CheckMini /> Already active
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
            <CheckMini /> Active
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
          {perk.cat}
        </div>
        <h3 className={`${styles.pcTitle} ${dimmed ? styles.pcTitleDim : ""}`}>
          {perk.title}
        </h3>
        <p className={`${styles.pcDesc} ${dimmed ? styles.pcDescDim : ""}`}>
          {perk.desc}
        </p>
        <div className={styles.pcFooter}>
          <PerkFooter perk={perk} />
        </div>
      </div>
    </article>
  );
}

export function PerkGroups() {
  let cardIndex = 0;
  return (
    <div>
      {perkGroups.map((group) => (
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
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");

  function send() {
    showToast(sidebarCopy.suggestToast, "success");
    setIdea("");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Your level</div>
        <div className={styles.miniLevel}>
          Level {levelInfo.level} · <em>{levelInfo.name}</em>
        </div>
        <div className={styles.miniXpBar}>
          <div
            className={styles.miniXpFill}
            style={{ width: `${levelInfo.percent}%` }}
          />
        </div>
        <div className={styles.miniXpLabel}>
          {levelInfo.xp} / {levelInfo.xpMax} XP · {levelInfo.xpToNext} to Level{" "}
          {levelInfo.level + 1}
        </div>
        <div className={styles.nextPerkNote}>
          Next perks unlock at{" "}
          <strong>
            Level {levelInfo.level + 1} · {levelInfo.nextName}
          </strong>{" "}
          — host without approval &amp; an increased invite quota.
        </div>
        <Link to={routes.badges} className={styles.sbLink}>
          See all badges &amp; levels →
        </Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Perks explained</div>
        <div className={styles.explainText}>{sidebarCopy.explain}</div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Suggest a perk</div>
        <div className={styles.suggestLabel}>{sidebarCopy.suggestPrompt}</div>
        <textarea
          className={styles.suggestTa}
          placeholder="Share an idea…"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <Button variant="ghost" className={styles.suggestBtn} onClick={send}>
          Send suggestion
        </Button>
      </div>
    </aside>
  );
}

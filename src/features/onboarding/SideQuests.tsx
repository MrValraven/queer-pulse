import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, Eyebrow, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { badgeIconFor } from "../members/badgeIcons";
import type { Badge } from "../members/badges.data";
import { useRecognition } from "../members/api/useRecognition";
import { ClaimButton } from "../members/PerksSections";
import type { Perk } from "../members/perks.data";
import { sideQuestRouteFor } from "./sideQuestCta";
import styles from "./GettingStartedPage.module.css";

const VISIBLE_COUNT = 6;

/** One locked-badge quest: icon, category, name, and how to earn it — with a
 *  CTA button only when `sideQuestCta.ts` maps this badge to somewhere to go. */
function BadgeQuestCard({ badge, to }: { badge: Badge; to?: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.questCard}>
      <div className={styles.questIconWrap}>{badgeIconFor(badge.key)}</div>
      <div className={styles.questBody}>
        <span className={styles.questCat}>{badge.category}</span>
        <span className={styles.questName}>{badge.name}</span>
        <span className={styles.questDesc}>{badge.when}</span>
      </div>
      {to && (
        <Button to={to} variant="ghost" size="sm">
          {t("auth:gettingStarted.sideQuests.cta")} <FiArrowRight aria-hidden />
        </Button>
      )}
    </div>
  );
}

/** An unlocked-but-unclaimed perk: same card shell as a badge quest, but the
 *  CTA claims the perk directly instead of routing elsewhere — reuses the
 *  same `ClaimButton` the Perks page renders, so a live 'button'-type perk
 *  behaves identically here (including its honest "not wired up yet" toast
 *  when there's no real claim endpoint — see `PerksSections.tsx`). */
function PerkQuestCard({ perk }: { perk: Perk }) {
  const f = perk.footer;
  return (
    <div className={styles.questCard}>
      <div className={styles.questBody}>
        <span className={styles.questCat}>{perk.category}</span>
        <span className={styles.questName}>{perk.title}</span>
        <span className={styles.questDesc}>{perk.description}</span>
      </div>
      {f.type === "button" && <ClaimButton label={f.label} toast={f.toast} />}
      {f.type === "link-auto" && (
        <Button to={f.to} variant="ghost" size="sm">
          {f.label}
        </Button>
      )}
    </div>
  );
}

/**
 * "Side quests": what to do once the getting-started checklist is done.
 * Reframes data `useRecognition()` already fetches — locked badges become
 * quest cards with a "go do it" CTA where one exists. Renders nothing while
 * the fetch is in flight/errored (mirrors `LevelXpStrip`) and nothing at all
 * if there are no locked badges left (a member who's earned everything).
 */
export function SideQuests() {
  const { t } = useTranslation();
  const recognition = useRecognition();
  const [open, setOpen] = useState(false);

  if (!recognition.hasRealData || recognition.isLoading) return null;

  const { locked } = recognition.badges;
  const claimablePerks = recognition.perks.groups
    .flatMap((group) => group.perks)
    .filter(
      (perk) =>
        perk.state === "available" &&
        (perk.footer.type === "button" || perk.footer.type === "link-auto"),
    );

  if (locked.length === 0 && claimablePerks.length === 0) return null;

  const visibleBadges = open ? locked : locked.slice(0, VISIBLE_COUNT);
  const remaining = locked.length - VISIBLE_COUNT;

  return (
    <section className={styles.questsSection}>
      <Eyebrow>{t("auth:gettingStarted.sideQuests.eyebrow")}</Eyebrow>
      <h2 className={styles.questsTitle}>
        <Translation
          i18nKey="auth:gettingStarted.sideQuests.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.questsLede}>
        {t("auth:gettingStarted.sideQuests.lede")}
      </p>

      {claimablePerks.length > 0 && (
        <div className={styles.questGrid}>
          {claimablePerks.map((perk, i) => (
            <FadeIn key={perk.title} delay={Math.min(i, 8) * 60}>
              <PerkQuestCard perk={perk} />
            </FadeIn>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <div className={styles.questGrid}>
            {visibleBadges.map((badge, i) => (
              <FadeIn key={badge.key} delay={Math.min(i, 8) * 60}>
                <BadgeQuestCard badge={badge} to={sideQuestRouteFor(badge.key)} />
              </FadeIn>
            ))}
          </div>
          {!open && remaining > 0 && (
            <button
              type="button"
              className={styles.questsExpandLink}
              onClick={() => setOpen(true)}
            >
              {t("auth:gettingStarted.sideQuests.showMore", { count: remaining })}
            </button>
          )}
        </>
      )}
    </section>
  );
}

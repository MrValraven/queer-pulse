import {
  FiStar,
  FiShield,
  FiHeart,
  FiAward,
  FiLifeBuoy,
  FiZap,
  FiGlobe,
  FiUserCheck,
  FiMail,
  FiLock,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Reaction, ReactionKey } from "./community.model";
import type { AccessTier, CommunityRole } from "./membership.types";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunityBadges.module.css";

/** Owner/mod role pill. Members render nothing (no badge clutter). */
export function RoleBadge({ role }: { role: CommunityRole | undefined }) {
  const { t } = useTranslation();
  if (role === "owner") {
    return (
      <span className={[styles.role, styles.owner].join(" ")}>
        <FiStar aria-hidden /> {t("communities:badges.role.owner")}
      </span>
    );
  }
  if (role === "mod") {
    return (
      <span className={[styles.role, styles.mod].join(" ")}>
        <FiShield aria-hidden /> {t("communities:badges.role.mod")}
      </span>
    );
  }
  return null;
}

/** Icon + CSS-module class per access tier — kept as styling data, not copy. */
const TIER_META: Record<AccessTier, { icon: IconType; cls: string }> = {
  public: { icon: FiGlobe, cls: styles.tierOpen! },
  request: { icon: FiUserCheck, cls: styles.tierRequest! },
  invite: { icon: FiMail, cls: styles.tierInvite! },
  private: { icon: FiLock, cls: styles.tierPrivate! },
};

const TIER_LABEL_KEY: Record<AccessTier, string> = {
  public: "communities:badges.tier.public",
  request: "communities:badges.tier.request",
  invite: "communities:badges.tier.invite",
  private: "communities:badges.tier.private",
};

/** Access-tier pill for community cards/headers. */
export function AccessTierBadge({ tier }: { tier: AccessTier }) {
  const { t } = useTranslation();
  const { icon: Icon, cls } = TIER_META[tier];
  return (
    <span className={[styles.tier, cls].join(" ")}>
      <Icon aria-hidden /> {t(TIER_LABEL_KEY[tier])}
    </span>
  );
}

const REACTION_ICON: Record<ReactionKey, IconType> = {
  heart: FiHeart,
  celebrate: FiAward,
  support: FiLifeBuoy,
  fire: FiZap,
};
const REACTION_LABEL_KEY: Record<ReactionKey, string> = {
  heart: "communities:badges.reaction.heart",
  celebrate: "communities:badges.reaction.celebrate",
  support: "communities:badges.reaction.support",
  fire: "communities:badges.reaction.fire",
};

export function ReactionBar({
  reactions,
  onReact,
  readOnly = false,
}: {
  reactions: Reaction[];
  onReact?: (key: ReactionKey) => void;
  /** Non-members can see the reaction counts but not toggle them — the pills
   *  render as static text (no button role, no focus, no handlers). */
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.reactions}>
      {reactions.map((r) => {
        const Icon = REACTION_ICON[r.key];
        const label = t("communities:badges.reaction.ariaLabel", {
          label: t(REACTION_LABEL_KEY[r.key]),
          count: r.count,
        });
        if (readOnly) {
          return (
            <span key={r.key} className={styles.pill} aria-label={label}>
              <Icon aria-hidden />
              {r.count}
            </span>
          );
        }
        return (
          <Button
            key={r.key}
            variant="ghost"
            size="sm"
            aria-pressed={r.reacted}
            aria-label={label}
            className={[styles.pill, r.reacted && styles.pillOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onReact?.(r.key)}
          >
            <Icon aria-hidden />
            {r.count}
          </Button>
        );
      })}
    </div>
  );
}

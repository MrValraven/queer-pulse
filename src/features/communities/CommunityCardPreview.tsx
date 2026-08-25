import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityDraft } from "./startCommunity/startCommunity.data";
import { shortTypeLabel } from "./api/communities.adapters";
import { AccessTierBadge } from "./CommunityBadges";
import { CommunityCardShell } from "./CommunityCardShell";
import { getLiving } from "./livingCommunities.data";
import styles from "./CommunitiesPage.module.css";

/** The two numbers the card's footer shows and the edit form cannot change.
 *  Both optional: a source that carries no number leaves the line out rather
 *  than guessing at one. */
export interface CommunityCardStats {
  memberCount?: number;
  activeThisWeek?: number;
}

interface CommunityCardPreviewProps extends CommunityCardStats {
  /** The community being edited — only used to borrow the demo roster faces
   *  the real Discover card would show; a live community has none. */
  slug?: string;
  draft: CommunityDraft;
}

/**
 * The community's Discover card, drawn live from the edit form's draft.
 *
 * It renders through `CommunityCardShell` — the same component Discover and a
 * member's profile pins use — so what the owner sees while typing is the card
 * itself, not a lookalike that can drift from it. The two differences are
 * deliberate: the card is inert (`isPreview`, no link, not tabbable), and the
 * shoulder badge and join pill always show the *visitor's* view of the current
 * access tier, since that is the thing the owner is choosing.
 */
export function CommunityCardPreview({
  slug,
  draft,
  memberCount,
  activeThisWeek,
}: CommunityCardPreviewProps) {
  const { t } = useTranslation();
  const tier = draft.accessTier || "public";
  const isPrivate = tier === "private";
  const roster = getLiving(slug)?.roster.slice(0, 4) ?? [];
  const type = draft.type || "social";

  // Mirrors `cardDtoToCommunity`: a private community shows no number at all,
  // and every other tier shows the plural-aware member count.
  const countLabel = isPrivate
    ? t("communities:common.count.membersOnly")
    : memberCount === undefined
      ? ""
      : t("communities:common.count.members", { count: memberCount });

  const joinLabel =
    tier === "public"
      ? t("communities:card.join.public")
      : tier === "invite"
        ? t("communities:card.join.invite")
        : t("communities:card.join.request");

  return (
    <CommunityCardShell
      isPreview
      name={draft.name.trim() || t("communities:edit.preview.namePlaceholder")}
      type={type}
      typeLabel={shortTypeLabel(type)}
      description={
        draft.tagline.trim() || t("communities:edit.preview.taglinePlaceholder")
      }
      countLabel={countLabel}
      activeThisWeek={activeThisWeek}
      coverImageUrl={draft.coverImageUrl || undefined}
      tags={draft.tags}
      roster={roster}
      className={isPrivate ? styles.privateCard : undefined}
      badge={<AccessTierBadge tier={tier} onPhoto={!!draft.coverImageUrl} />}
      footAction={
        isPrivate ? (
          <span className={[styles.joinBtn, styles.enterQuietly].join(" ")}>
            {t("communities:card.enterQuietly")} <FiArrowRight aria-hidden />
          </span>
        ) : (
          <span className={styles.joinBtn}>{joinLabel}</span>
        )
      }
    />
  );
}

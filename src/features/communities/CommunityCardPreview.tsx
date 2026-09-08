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
  /** The locally renderable URL of a cover picked THIS session, if any. A fresh
   *  pick leaves `draft.coverImageUrl` holding a private storage key that no
   *  `<img>` can fetch, so the card needs this `blob:`/resolved URL to show the
   *  pick at all; without it the preview draws a broken image while the form
   *  field beside it shows the photo. Null/absent means nothing was picked this
   *  session and the draft's own (already-resolved) value is the cover. */
  coverPreviewUrl?: string | null;
  /** The same story for a mark picked this session. */
  avatarPreviewUrl?: string | null;
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
  coverPreviewUrl,
  avatarPreviewUrl,
  memberCount,
  activeThisWeek,
}: CommunityCardPreviewProps) {
  const { t } = useTranslation();
  // A pick made this session wins over the draft value it just replaced: the
  // draft now holds that pick's storage key, which is not fetchable, while the
  // preview URL renders immediately. Clearing the image empties BOTH, so the
  // card loses its cover the moment the owner removes it.
  const coverSrc = draft.coverImageUrl
    ? coverPreviewUrl || draft.coverImageUrl
    : "";
  const avatarSrc = draft.avatarImageUrl
    ? avatarPreviewUrl || draft.avatarImageUrl
    : "";
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
      coverImageUrl={coverSrc || undefined}
      /* The mark the owner is choosing right now. The draft's own value is
         already a resolved URL for the COMMITTED mark (the edit modal seeds it
         from the detail DTO), but a mark picked this session is a private
         storage key — hence the session preview URL taking precedence above. */
      avatarImageUrl={avatarSrc || undefined}
      tags={draft.tags}
      roster={roster}
      className={isPrivate ? styles.privateCard : undefined}
      badge={<AccessTierBadge tier={tier} onPhoto={!!coverSrc} />}
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

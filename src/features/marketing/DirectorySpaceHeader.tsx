import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ownershipBadgeOf,
  type DirectoryPlace,
  type OwnershipBadgeState,
} from "./directoryPlaces";
import { categoryLabel } from "./localCategories";
import { Stars } from "./DirectoryStars";
import { DirectoryActionBar } from "./DirectoryActionBar";
import { DirectoryQueerOwnedProvenance } from "./DirectoryQueerOwnedProvenance";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the inline action bar renders nothing (read-only). */
  preview?: boolean;
}

/** Detail-page pill styling and copy per ownership state. The class map stays
 *  in this file because it points at the CSS module. */
const OWNERSHIP_PILL_CLASS: Record<OwnershipBadgeState, string> = {
  verified: s.verified!,
  owned: s.ownedPill!,
  friendly: s.friendlyPill!,
};
const OWNERSHIP_PILL_KEYS: Record<OwnershipBadgeState, string> = {
  verified: "marketing:directory.detail.badge.verifiedOwned",
  owned: "marketing:directory.detail.badge.owned",
  friendly: "marketing:directory.detail.badge.friendly",
};

/**
 * The listing's identity block, now the FIRST thing on the page (above the
 * gallery): eyebrow → name → tagline → a single consolidated meta row carrying
 * every at-a-glance signal (verified/friendly badge, the place's own pills, and
 * either the rating or a "New" chip). The primary actions (Directions / Share /
 * Save) sit inline on the right, aligned with the name, instead of floating in
 * a disconnected card. Extracted out of `DirectorySpaceMain` so the two-column
 * body below can start straight into the content sections.
 */
export function DirectorySpaceHeader({ place, preview = false }: Props) {
  const { t } = useTranslation();
  const ownership = ownershipBadgeOf(place);
  const words = place.name.split(" ");
  const last = words.pop();
  const lead = words.join(" ");
  const hasReviews = place.rating.count > 0;

  return (
    <div className={s.identity}>
      <div className={s.coverInner}>
        <header className={s.spaceHead}>
          <div className={s.spaceHeadIdentity}>
            <div className={s.eyebrow}>
              {categoryLabel(t, place.cat)} · {place.hood} ·{" "}
              {place.city ?? "Lisbon"}
            </div>
            <h1 className={s.h1}>
              {lead && `${lead} `}
              <em>{last}.</em>
            </h1>
            <p className={s.tagline}>{place.tagline}</p>
            <div className={s.metaRow}>
              {/* Three states, from `ownershipBadgeOf` so this pill and the
                  grid card always say the same thing: the moderator-confirmed
                  grant, the owner's own unconfirmed queer-owned claim, and
                  allied. Only the first says "verified"; the second is styled
                  as an outline so it never passes for a confirmation. */}
              <span
                className={[s.pill, OWNERSHIP_PILL_CLASS[ownership]].join(" ")}
              >
                {t(OWNERSHIP_PILL_KEYS[ownership])}
              </span>
              {place.pills.map((pill) => (
                <span key={pill} className={s.pill}>
                  {pill}
                </span>
              ))}
              {hasReviews ? (
                <span className={s.rating}>
                  <Stars
                    score={Math.round(Number(place.rating.score))}
                    className={s.stars}
                  />
                  <b>{place.rating.score}</b>
                  <span>
                    {t("marketing:directory.detail.reviewsCount", {
                      count: place.rating.count,
                    })}
                  </span>
                </span>
              ) : (
                <span className={s.newChip}>
                  {t("marketing:directory.detail.newBadge")}
                </span>
              )}
            </div>
            {/* Directly under the badge it explains: who confirmed the
                queer-owned claim, when, and on what basis, so a reader can
                check it where they meet it. Renders nothing unless the badge
                currently applies AND there is provenance on record. */}
            <DirectoryQueerOwnedProvenance place={place} />
          </div>
          <div className={s.spaceHeadActions}>
            <DirectoryActionBar place={place} preview={preview} />
          </div>
        </header>
      </div>
    </div>
  );
}

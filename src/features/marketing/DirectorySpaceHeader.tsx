import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { categoryLabel } from "./localPlaces";
import { Stars } from "./DirectoryStars";
import { DirectoryActionBar } from "./DirectoryActionBar";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the inline action bar renders nothing (read-only). */
  preview?: boolean;
}

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
              {/* Moderator-confirmed verification, not the owner's own
                  self-reported claim (`place.owned`) — see
                  `queerOwnedVerified` on `DirectoryPlace`. An unverified
                  owned listing gets the plain "friendly" pill rather than
                  a false "verified" claim. */}
              <span
                className={[
                  s.pill,
                  place.queerOwnedVerified ? s.verified : s.friendlyPill,
                ].join(" ")}
              >
                {t(
                  place.queerOwnedVerified
                    ? "marketing:directory.detail.badge.verifiedOwned"
                    : "marketing:directory.detail.badge.friendly",
                )}
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
          </div>
          <div className={s.spaceHeadActions}>
            <DirectoryActionBar place={place} preview={preview} />
          </div>
        </header>
      </div>
    </div>
  );
}

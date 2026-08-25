import type { ReactNode, SyntheticEvent } from "react";
import { FiArrowRight, FiBookmark, FiCheck, FiShield } from "react-icons/fi";
import { Avatar, ImageSlot, Stars, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { categoryLabel } from "./localPlaces";
import {
  openStatus,
  operatingStateOf,
  ownershipBadgeOf,
  zonedNow,
  OWNERSHIP_BADGE_KEYS,
  type DirectoryPlace,
} from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/**
 * The card's one-line trading status.
 *
 * A business that is temporarily closed, permanently closed or has moved still
 * turns up in results, so the card has to say so rather than showing an "Open
 * till 23:00" line computed from hours that no longer describe anything. The
 * operating state therefore replaces the live calculation outright instead of
 * sitting beside it.
 *
 * For an open business the live status comes from `openStatus`, which resolves
 * the venue's own timezone and lets a one-off date exception override the
 * weekday grid, and which reports the window it is actually inside, so
 * "closes at" is the real closing time and not merely the last interval of the
 * day. Renders nothing when there are no hours to reason about.
 */
function DirectoryCardStatus({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const operatingState = operatingStateOf(place);

  if (operatingState !== "open") {
    return (
      <span className={`${s.status} ${s.statusFlag}`}>
        <span className={s.statusDot} />
        {t(`marketing:directory.card.state.${operatingState}`)}
      </span>
    );
  }

  const status = openStatus(
    place.hours,
    zonedNow(place.timezone),
    place.hoursExceptions,
  );
  if (status.state === "unknown") return null;

  if (status.state === "closed") {
    return (
      <span className={s.status}>
        <span className={s.statusDot} />
        {t("marketing:directory.card.closedNow")}
      </span>
    );
  }

  // `closesAt` is always set alongside an "open" state; the null branch below
  // exists so the copy stays honest rather than because it is expected.
  const closesAt = status.closesAt;
  const isClosingSoon = status.isClosingSoon && closesAt !== null;
  return (
    <span className={s.status}>
      <span
        className={`${s.statusDot} ${isClosingSoon ? s.statusClosingSoon : s.statusOpen}`}
      />
      {closesAt === null
        ? t("marketing:directory.card.openNow")
        : isClosingSoon
          ? t("marketing:directory.card.closingSoon", { time: closesAt })
          : t("marketing:directory.card.openTill", { time: closesAt })}
    </span>
  );
}

/**
 * The two things the photo's bottom-left corner says about a place: how it is
 * connected to the community (always), and whether it is a verified safe space
 * (only when it is).
 *
 * They sit side by side rather than one replacing the other: the safe-space
 * pill used to occupy the same slot and simply hide the ownership badge, so a
 * verified safe space never got to say it was queer-owned. Safe space is the
 * narrower, rarer claim, so it shrinks to an icon with its meaning on hover,
 * focus and via its accessible name, leaving the wordier badge the room.
 */
function DirectoryCardBadges({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const ownership = ownershipBadgeOf(place);
  const safeSpaceLabel = t("marketing:directory.card.verifiedBadge");

  return (
    <span className={s.photoBadges}>
      <span className={s.photoBadgeDark}>
        {ownership === "verified" && (
          <FiCheck className={s.photoBadgeCheck} aria-hidden />
        )}
        {t(OWNERSHIP_BADGE_KEYS[ownership])}
      </span>
      {place.safeSpaceStatus === "verified" && (
        <Tooltip label={safeSpaceLabel} placement="top">
          {/* Not a button: the whole card is already one link, and this only
              ever names itself. `role="img"` + the label is what a screen
              reader announces; the bubble is decorative. */}
          <span
            className={s.safeSpaceMark}
            role="img"
            aria-label={safeSpaceLabel}
          >
            <FiShield aria-hidden />
          </span>
        </Tooltip>
      )}
    </span>
  );
}

/**
 * The card's visuals only — photo, badges, name/rating, meta, description,
 * pills, and footer. Shared by `LocalBusinessCard` (the live, clickable card
 * in the directory grid) and the listing wizard's sticky preview, so the two
 * can never drift apart again.
 */
export function LocalBusinessCardBody({
  place,
  saveControl,
  photoOverlay,
  topRight,
  showRating = true,
  showHost = true,
  visitSlot,
  photoTag,
}: {
  place: DirectoryPlace;
  /** Present on the live card (wraps a real save toggle); absent on the
   *  wizard preview, where the bookmark renders as a static, unsaved icon. */
  saveControl?: { saved: boolean; onSave: (event: SyntheticEvent) => void };
  /** Rendered over the photo slot — the wizard preview uses this for its
   *  "add a cover photo" call to action when there's no photo yet. Suppresses
   *  the empty-slot caption (both are centered and would otherwise overlap). */
  photoOverlay?: ReactNode;
  /** Replaces the bookmark in the photo's top-right corner. The profile's
   *  "Places you run" grid puts its LIVE / IN REVIEW chip there — an owner
   *  can't meaningfully save their own listing. Overrides `saveControl`. */
  topRight?: ReactNode;
  /** Drop the star rating (default: shown). The profile's owner grid passes
   *  false for a submitted listing, which carries no reviews and would
   *  otherwise always read as five empty stars. */
  showRating?: boolean;
  /** Drop the "run by <first>" avatar in the footer (default: shown). Both
   *  profile views already sit under that member's own name. */
  showHost?: boolean;
  /** Replaces the footer's "Visit →" call to action, so the owner grid can
   *  say "View listing →" (or "Awaiting review" while it's still pending). */
  visitSlot?: ReactNode;
  /** A small chip pinned to the photo's top-left corner. The "Within a short
   *  walk" strip puts the distance there: it sits clear of both the badge
   *  (bottom-left) and the bookmark (top-right), so the card is otherwise
   *  identical to the one in the directory grid. */
  photoTag?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={s.photoWrap}>
        <ImageSlot
          src={place.photos?.wide ?? undefined}
          alt={place.alt?.wide ?? place.name}
          height={168}
          // The saved rect is a focal REGION here, never an exact frame: the
          // strip is a fixed 168px band and `crop` would distort an off-aspect
          // photo (see ImageSlot's `crop` vs `focus`).
          focus={place.photoFocus}
          style={{ borderRadius: "18px 18px 0 0" }}
          placeholder={
            photoOverlay ? "" : t("marketing:directory.card.photoComing")
          }
        />
        <DirectoryCardBadges place={place} />
        {topRight ??
          (saveControl ? (
            <span
              role="button"
              tabIndex={0}
              aria-pressed={saveControl.saved}
              aria-label={t(
                saveControl.saved
                  ? "marketing:directory.card.unsaveAriaLabel"
                  : "marketing:directory.card.saveAriaLabel",
                { name: place.name },
              )}
              className={`${s.saveBtn} ${saveControl.saved ? s.saveBtnOn : ""}`}
              onClick={saveControl.onSave}
              onKeyDown={(event) =>
                activateOnKey(event, () => saveControl.onSave(event))
              }
            >
              <FiBookmark
                aria-hidden
                fill={saveControl.saved ? "currentColor" : "none"}
              />
            </span>
          ) : (
            <span className={s.saveBtn} aria-hidden>
              <FiBookmark aria-hidden fill="none" />
            </span>
          ))}
        {photoTag && <span className={s.photoTag}>{photoTag}</span>}
        {photoOverlay}
      </div>

      <div className={s.nameRow}>
        <div className={s.name}>{place.name}</div>
        {showRating && (
          <div className={s.rating}>
            <Stars value={Number(place.rating.score)} size={12} />
            <span>({place.rating.count})</span>
          </div>
        )}
      </div>
      <div className={s.metaRow}>
        <span className={s.catPill}>{categoryLabel(t, place.cat)}</span>
        <span className={s.hoodText}>
          {place.online ? t("marketing:directory.card.online") : place.hood}
        </span>
      </div>
      <div className={s.desc}>{place.desc}</div>
      <div className={s.pillsRow}>
        {place.pills.slice(0, 3).map((pill) => (
          <span key={pill} className={s.pill}>
            {pill}
          </span>
        ))}
        {place.member && (
          <span className={`${s.pill} ${s.pillMember}`}>
            {t("marketing:directory.card.memberRun")}
          </span>
        )}
      </div>
      <div className={s.foot}>
        <DirectoryCardStatus place={place} />
        {showHost && (
          <span className={s.host}>
            <Avatar
              initials={place.owner.initials}
              tint={place.owner.tint}
              size={20}
            />
            {place.owner.first}
          </span>
        )}
        {visitSlot ?? (
          <span className={s.visit}>
            {t("marketing:directory.card.visit")} <FiArrowRight aria-hidden />
          </span>
        )}
      </div>
    </>
  );
}

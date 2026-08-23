import type { ReactNode, SyntheticEvent } from "react";
import { FiArrowRight, FiBookmark } from "react-icons/fi";
import { Avatar, ImageSlot, Stars } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { SafeSpaceBadge } from "../safety/SafeSpaceBadge";
import { categoryLabel } from "./localPlaces";
import { openStatus, zonedNow, type DirectoryPlace } from "./directoryPlaces";
import { normalizeDayHours, type DayHours } from "./listBusiness/listBusiness.data";
import s from "./DirectoryPage.module.css";

const WEEK_DAY_IDS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Today's closing time ("HH:MM"), or null when closed/unknown/no hours data. */
function closingTimeToday(
  hours: Record<string, DayHours> | undefined,
  now: Date,
): string | null {
  if (!hours) return null;
  const today = normalizeDayHours(
    hours[WEEK_DAY_IDS[(now.getDay() + 6) % 7]!],
  );
  if (!today.open) return null;
  return today.intervals.at(-1)?.to ?? null;
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
}) {
  const { t } = useTranslation();
  const now = zonedNow();
  const status = openStatus(place.hours, now);
  const closesAt = closingTimeToday(place.hours, now);

  return (
    <>
      <div className={s.photoWrap}>
        <ImageSlot
          src={place.photos?.wide ?? undefined}
          alt={place.alt?.wide ?? place.name}
          height={168}
          style={{ borderRadius: "18px 18px 0 0" }}
          placeholder={
            photoOverlay ? "" : t("marketing:directory.card.photoComing")
          }
        />
        {place.safeSpaceStatus === "verified" ? (
          <span className={`${s.photoBadge} ${s.photoBadgeSolid}`}>
            <SafeSpaceBadge label={t("marketing:directory.card.verifiedBadge")} />
          </span>
        ) : (
          <span className={`${s.photoBadge} ${s.photoBadgeDark}`}>
            {t(
              place.queerOwnedVerified
                ? "marketing:directory.badge.queerOwned"
                : "marketing:directory.badge.friendly",
            )}
          </span>
        )}
        {topRight ?? (saveControl ? (
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
            onKeyDown={(event) => activateOnKey(event, () => saveControl.onSave(event))}
          >
            <FiBookmark aria-hidden fill={saveControl.saved ? "currentColor" : "none"} />
          </span>
        ) : (
          <span className={s.saveBtn} aria-hidden>
            <FiBookmark aria-hidden fill="none" />
          </span>
        ))}
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
        {status.state !== "unknown" && (
          <span className={s.status}>
            <span
              className={`${s.statusDot} ${status.state === "open" ? s.statusOpen : ""}`}
            />
            {status.state === "open" && closesAt
              ? t("marketing:directory.card.openTill", { time: closesAt })
              : t("marketing:directory.card.closedNow")}
          </span>
        )}
        {showHost && (
          <span className={s.host}>
            <Avatar initials={place.owner.initials} tint={place.owner.tint} size={20} />
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

import { type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookmark } from "react-icons/fi";
import { Avatar, FadeIn, ImageSlot, Stars } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/useSaved";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { routes } from "../../app/routeMap";
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

/** One business card in the unified Local list. */
export function LocalBusinessCard({
  place,
  index,
}: {
  place: DirectoryPlace;
  index: number;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);
  const now = zonedNow();
  const status = openStatus(place.hours, now);
  const closesAt = closingTimeToday(place.hours, now);

  function handleSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggleSave({
      id: savedId,
      kind: "listing",
      title: place.name,
      href: `${routes.directory}/${place.slug}`,
      meta: place.hood,
    });
    showToast(
      t(
        nowSaved
          ? "marketing:directory.card.savedToast"
          : "marketing:directory.card.unsavedToast",
        { name: place.name },
      ),
      nowSaved ? "success" : "info",
    );
  }

  return (
    <FadeIn
      as={Link}
      delay={Math.min(index, 8) * 60}
      to={`${routes.directory}/${place.slug}`}
      className={s.card}
    >
      <div className={s.photoWrap}>
        <ImageSlot
          src={place.photos?.wide ?? undefined}
          alt={place.alt?.wide ?? place.name}
          height={168}
          style={{ borderRadius: "18px 18px 0 0" }}
          placeholder={t("marketing:directory.card.photoComing")}
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
        <span
          role="button"
          tabIndex={0}
          aria-pressed={saved}
          aria-label={t(
            saved
              ? "marketing:directory.card.unsaveAriaLabel"
              : "marketing:directory.card.saveAriaLabel",
            { name: place.name },
          )}
          className={`${s.saveBtn} ${saved ? s.saveBtnOn : ""}`}
          onClick={handleSave}
          onKeyDown={(event) => activateOnKey(event, () => handleSave(event))}
        >
          <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
        </span>
      </div>

      <div className={s.nameRow}>
        <div className={s.name}>{place.name}</div>
        <div className={s.rating}>
          <Stars value={Number(place.rating.score)} size={12} />
          <span>({place.rating.count})</span>
        </div>
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
        <span className={s.host}>
          <Avatar initials={place.owner.initials} tint={place.owner.tint} size={20} />
          {place.owner.first}
        </span>
        <span className={s.visit}>
          {t("marketing:directory.card.visit")} <FiArrowRight aria-hidden />
        </span>
      </div>
    </FadeIn>
  );
}

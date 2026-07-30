import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type DirectoryPlace,
  hoursRows,
  openStatus,
  realHoursRows,
} from "./directoryPlaces";
import { CAT_LABEL_KEYS } from "./directorySpace.data";
import { DirectoryReviewsSection } from "./DirectoryReviewsSection";
import { Stars } from "./DirectoryStars";
import s from "./DirectorySpacePage.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Dash = () => (
  <svg viewBox="0 0 24 24">
    <line x1={5} y1={12} x2={19} y2={12} />
  </svg>
);

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: hide the interactive review form (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it —
   * see `DirectorySpacePage`. Threaded down to show owner-reply compose
   * controls; undefined (non-owner, or preview) keeps reviews read-only. */
  ownerRef?: string;
}

export function DirectorySpaceMain({ place, preview = false, ownerRef }: Props) {
  const { t } = useTranslation();
  const words = place.name.split(" ");
  const last = words.pop();
  const lead = words.join(" ");
  const hasRealHours = place.hours != null && Object.keys(place.hours).length > 0;
  const rows = hasRealHours ? realHoursRows(place.hours!) : hoursRows(place.hoursType);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div>
      <header className={s.head}>
        <div className={s.eyebrow}>
          {t(CAT_LABEL_KEYS[place.cat]!)} · {place.hood} · Lisbon
        </div>
        <h1 className={s.h1}>
          {lead && `${lead} `}
          <em>{last}.</em>
        </h1>
        <p className={s.tagline}>{place.tagline}</p>
        <div className={s.pills}>
          <span
            className={[s.pill, place.owned ? s.verified : s.friendlyPill].join(
              " ",
            )}
          >
            {t(
              place.owned
                ? "marketing:directory.detail.badge.verifiedOwned"
                : "marketing:directory.detail.badge.friendly",
            )}
          </span>
          {place.pills.map((p) => (
            <span key={p} className={s.pill}>
              {p}
            </span>
          ))}
        </div>
        <div className={s.ratingRow}>
          <div className={s.rating}>
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
          </div>
        </div>
      </header>

      <section className={s.sec}>
        <h2>
          <Translation
            i18nKey="marketing:directory.detail.whatItIsTitle"
            components={{ em: <em /> }}
          />
        </h2>
        {place.whatItIs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className={s.sec}>
        <h2>
          <Translation
            i18nKey="marketing:directory.detail.goodForTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.subLine}>
          {t("marketing:directory.detail.goodForSub", {
            count: place.rating.count,
          })}
        </p>
        <div className={s.features}>
          {place.goodFor.map((feature) => (
            <div
              key={feature.label}
              className={[s.feature, !feature.yes && s.featureMaybe]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={s.featureIc}>
                {feature.yes ? <Check /> : <Dash />}
              </div>
              {feature.label}
            </div>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>{t("marketing:directory.detail.hoursTitle")}</h2>
        <p className={s.subLine}>{place.hoursNote}</p>
        {hasRealHours &&
          (() => {
            const status = openStatus(place.hours, new Date());
            if (status.state === "unknown") return null;
            return (
              <span
                className={status.state === "open" ? s.openChip : s.closedChip}
              >
                {t(
                  status.state === "open"
                    ? "marketing:directory.detail.openNow"
                    : "marketing:directory.detail.closedNow",
                )}
              </span>
            );
          })()}
        {!hasRealHours && place.hoursType === "appointment" ? (
          <div className={s.apptNote}>
            <div className={s.featureIc}>
              <svg viewBox="0 0 24 24">
                <circle cx={12} cy={12} r={9} />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            {place.hoursNote}
          </div>
        ) : (
          <div className={s.hoursTable}>
            {rows.map((row, index) => (
              <div
                key={row.dayKey}
                className={[
                  s.hoursRow,
                  index === todayIdx && s.hoursToday,
                  row.closed && s.hoursClosed,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={s.hoursDay}>
                  {t(`marketing:directory.days.${row.dayKey}`)}
                  {index === todayIdx && (
                    <span className={s.todayTag}>
                      {t("marketing:directory.detail.today")}
                    </span>
                  )}
                </span>
                <span>
                  {row.val ?? t("marketing:directory.detail.hoursClosed")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <DirectoryReviewsSection
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
    </div>
  );
}

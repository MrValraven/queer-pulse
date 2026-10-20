import { useId } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { PersonaViewMode } from "../../personaSkinRender";
import { AMOUNT_FORMAT } from "../therapist/therapistPractical.data";
import { TattooBookButton } from "./TattooBookButton";
import { TattooStatusPill } from "./TattooStatusPill";
import type { TattooView } from "./tattooView";
import { formatTattooDay } from "./tattooView.helpers";
import {
  hasTattooBookingCard,
  hasTattooStudio,
  isTattooBookShown,
} from "./tattooAside";
import styles from "./TattooAside.module.css";

/** "3 Nov 2026" for a one-day spot, "3 Nov 2026 to 6 Nov 2026" for a
 *  longer one, in the page's one date format. */
function useSpotDaysText(spot: SubprofileItemView): string {
  const { t, language } = useTranslation();
  const startDate = spot.date.slice(0, 10);
  const endDate = (spot.structured?.spot?.endDate ?? "").slice(0, 10);
  const startText = formatTattooDay(startDate, language);
  if (!endDate || endDate === startDate) return startText;
  return t("subprofiles:tattoo.spots.range", {
    start: startText,
    end: formatTattooDay(endDate, language),
  });
}

/** The soonest guest spot: "Guest spot now" while it runs today, else
 *  "Next guest spot". */
function NextSpotCard({
  spot,
  isRunning,
}: {
  spot: SubprofileItemView;
  isRunning: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const daysText = useSpotDaysText(spot);
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.label}>
        {t(
          isRunning
            ? "subprofiles:tattoo.side.nowSpot"
            : "subprofiles:tattoo.side.nextSpot",
        )}
      </h2>
      <p className={styles.title}>{spot.title}</p>
      {spot.subtitle && <p className={styles.body}>{spot.subtitle}</p>}
      {daysText && <p className={styles.body}>{daysText}</p>}
    </section>
  );
}

/** True when an address line already names the city, so the card leaves
 *  its own city line out. */
function isCityInVenueLines(view: TattooView): boolean {
  const city = view.city.toLocaleLowerCase();
  if (!city || !view.venue) return false;
  return view.venue.lines.some((line) =>
    line.toLocaleLowerCase().includes(city),
  );
}

function StudioCard({ view }: { view: TattooView }) {
  const { t } = useTranslation();
  const headingId = useId();
  const hasChips = view.isPrivateStudio || view.isByAppointmentOnly;
  const isCityLineShown = view.city !== "" && !isCityInVenueLines(view);
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.label}>
        {t("subprofiles:tattoo.side.studio")}
      </h2>
      {view.venue?.name && <p className={styles.title}>{view.venue.name}</p>}
      {view.venue?.lines.map((line, index) => (
        <p key={`${index}-${line}`} className={styles.body}>
          {line}
        </p>
      ))}
      {isCityLineShown && <p className={styles.body}>{view.city}</p>}
      {hasChips && (
        <ul className={styles.chips}>
          {view.isPrivateStudio && (
            <li className={styles.chip}>
              {t("subprofiles:tattoo.side.privateStudio")}
            </li>
          )}
          {view.isByAppointmentOnly && (
            <li className={styles.chip}>
              {t("subprofiles:tattoo.side.byAppointment")}
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

interface TattooSidebarProps {
  data: PublicSubprofileView;
  view: TattooView;
  mode: PersonaViewMode;
}

/**
 * The sticky aside beside the main column, from 860px of page width up:
 * the books status, "From {amount}", the deposit and "How to book", then the
 * next guest spot and the studio. The page hides it below 860px, where the
 * phone bar carries the booking button.
 */
export function TattooSidebar({ view, mode }: TattooSidebarProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAmount = (value: number) => format.number(value, AMOUNT_FORMAT);
  const { prices } = view;
  const isBookShown = isTattooBookShown(view, mode);

  return (
    <aside
      className={styles.sidebar}
      aria-label={t("subprofiles:tattoo.side.label", { name: view.titleName })}
    >
      {hasTattooBookingCard(view, mode) && (
        <div className={styles.card}>
          <TattooStatusPill
            status={view.status}
            nextOpening={view.nextOpening}
            waitNote={view.waitNote}
          />
          {prices.minimum !== null && (
            <p className={styles.price}>
              {t("subprofiles:tattoo.side.from", {
                amount: formatAmount(prices.minimum),
              })}
            </p>
          )}
          {prices.depositAmount !== null && (
            <p className={styles.body}>
              {t(
                prices.isDepositRefundable
                  ? "subprofiles:tattoo.side.depositRefundable"
                  : "subprofiles:tattoo.side.deposit",
                { amount: formatAmount(prices.depositAmount) },
              )}
            </p>
          )}
          {isBookShown && (
            <TattooBookButton
              isInert={mode === "preview"}
              className={styles.fullButton}
            />
          )}
        </div>
      )}
      {view.guestSpots.next && (
        <NextSpotCard
          spot={view.guestSpots.next}
          isRunning={view.guestSpots.isNextRunning}
        />
      )}
      {hasTattooStudio(view) && <StudioCard view={view} />}
    </aside>
  );
}

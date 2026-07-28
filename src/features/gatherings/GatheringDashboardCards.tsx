import { useMemo, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiSend,
  FiUsers,
} from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ARRIVAL_TICKS,
  PEAK_ARRIVAL_END,
  PEAK_ARRIVAL_START,
  RECENT,
  WAITLIST,
  type Guest,
} from "./gatheringDashboard.data";
import { QrScanModal } from "./QrScanModal";
import styles from "./GatheringDashboardPage.module.css";

export function CheckInColumn({
  guests,
  onCheckIn,
}: {
  guests: Guest[];
  onCheckIn: (name: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [scanQuery, setScanQuery] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const scanMatches = useMemo(() => {
    if (scanQuery.length < 2) return null;
    return guests.filter((guest) =>
      guest.name.toLowerCase().includes(scanQuery.toLowerCase()),
    );
  }, [guests, scanQuery]);

  return (
    <div className={styles.col}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          {t("gatherings:dashboard.checkin.heading")}
        </div>
        <div className={styles.cardBody}>
          <div
            className={styles.qrArea}
            onClick={() => setScanOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setScanOpen(true);
              }
            }}
          >
            <div className={styles.qrIcon}>
              <MdQrCodeScanner />
            </div>
            <div className={styles.qrLabel}>
              {t("gatherings:dashboard.checkin.qrAreaLine1")}
              <br />
              {t("gatherings:dashboard.checkin.qrAreaLine2")}
            </div>
          </div>
          <Button
            variant="primary"
            className={styles.scanBtn}
            onClick={() => setScanOpen(true)}
          >
            {t("gatherings:dashboard.checkin.scanCta")}
          </Button>
          <div className={styles.orDivider}>
            <div className={styles.orLine} />
            <div className={styles.orText}>
              {t("gatherings:dashboard.checkin.orDivider")}
            </div>
            <div className={styles.orLine} />
          </div>
          <input
            className={styles.nameSearch}
            type="text"
            placeholder={t("gatherings:dashboard.checkin.searchPlaceholder")}
            value={scanQuery}
            onChange={(e) => setScanQuery(e.target.value)}
          />
          {scanMatches !== null && (
            <div className={styles.searchResult}>
              {scanMatches.length > 0 ? (
                <span className={styles.searchMatch}>
                  {t("gatherings:dashboard.checkin.matchCount", {
                    count: scanMatches.length,
                  })}
                </span>
              ) : (
                <span className={styles.searchNone}>
                  {t("gatherings:dashboard.checkin.noMatch")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          {t("gatherings:dashboard.checkin.recentHeading")}
        </div>
        <div className={styles.cardBody}>
          <div className={styles.recentList}>
            {RECENT.map((recentGuest) => (
              <div className={styles.recentRow} key={recentGuest.name}>
                <div
                  className={styles.rrAv}
                  style={{
                    background: recentGuest.background,
                    color: recentGuest.color,
                  }}
                >
                  {recentGuest.initials}
                </div>
                <div className={styles.rrName}>{recentGuest.name}</div>
                <div className={styles.rrTime}>
                  {recentGuest.minutesAgo === 0
                    ? t("gatherings:dashboard.checkin.justNow")
                    : fmt.relativeTime(-recentGuest.minutesAgo, "minute")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {scanOpen && (
        <QrScanModal
          guests={guests}
          onCheckIn={onCheckIn}
          onClose={() => setScanOpen(false)}
        />
      )}
    </div>
  );
}

export function GuestListCard({
  guests,
  checkedIn,
  onCheckIn,
}: {
  guests: Guest[];
  checkedIn: number;
  onCheckIn: (name: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"all" | "in" | "pending">("all");
  const [query, setQuery] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const visible = useMemo(
    () =>
      guests.filter(
        (guest) =>
          (filter === "all" || guest.status === filter) &&
          (!query || guest.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [guests, filter, query],
  );

  const filterTabs = [
    [
      "all",
      t("gatherings:dashboard.guestList.filterAll", { count: guests.length }),
    ],
    [
      "in",
      t("gatherings:dashboard.guestList.filterCheckedIn", { count: checkedIn }),
    ],
    [
      "pending",
      t("gatherings:dashboard.guestList.filterPending", {
        count: guests.length - checkedIn,
      }),
    ],
  ] as const;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        {t("gatherings:dashboard.guestList.heading")}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.filterBar}>
          {filterTabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={[styles.afBtn, filter === id && styles.afBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          className={styles.attSearch}
          type="text"
          placeholder={t("gatherings:dashboard.guestList.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div>
          {visible.length === 0 &&
            (guests.length === 0 ? (
              <EmptyState
                compact
                icon={<FiUsers />}
                title={t("gatherings:dashboard.guestList.emptyAllTitle")}
                description={t(
                  "gatherings:dashboard.guestList.emptyAllDescription",
                )}
              />
            ) : (
              <EmptyState
                compact
                icon={<FiUsers />}
                title={t("gatherings:dashboard.guestList.emptyFilterTitle")}
                description={t(
                  "gatherings:dashboard.guestList.emptyFilterDescription",
                )}
                action={{
                  label: t("gatherings:dashboard.guestList.clearFiltersCta"),
                  onClick: () => {
                    setFilter("all");
                    setQuery("");
                  },
                }}
              />
            ))}
          {visible.map((guest) => (
            <div className={styles.attRow} key={guest.name}>
              <div
                className={styles.attAv}
                style={{ background: guest.background, color: guest.color }}
              >
                {guest.initials}
              </div>
              <div className={styles.attInfo}>
                <div className={styles.attName}>{guest.name}</div>
                <div className={styles.attMeta}>{guest.pronouns}</div>
                {guest.status === "pending" && (
                  <button
                    type="button"
                    className={styles.manualBtn}
                    onClick={() => onCheckIn(guest.name)}
                  >
                    {t("gatherings:dashboard.guestList.checkInManuallyCta")}
                  </button>
                )}
              </div>
              <div>
                {guest.status === "in" && guest.time ? (
                  <FadeIn
                    key={guest.time.getTime()}
                    className={`${styles.checkinChip} ${styles.chipIn}`}
                  >
                    {t("gatherings:dashboard.guestList.checkedInChip", {
                      time: fmt.time(guest.time),
                    })}
                  </FadeIn>
                ) : (
                  <div
                    className={`${styles.checkinChip} ${styles.chipPending}`}
                  >
                    {t("gatherings:dashboard.guestList.expectedChip")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className={styles.waitlistToggle}
          onClick={() => setWaitlistOpen((open) => !open)}
          role="button"
          tabIndex={0}
          aria-expanded={waitlistOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setWaitlistOpen((open) => !open);
            }
          }}
        >
          <span>{waitlistOpen ? <FiChevronDown /> : <FiChevronRight />}</span>{" "}
          {t("gatherings:dashboard.guestList.waitlistToggle", {
            count: WAITLIST.length,
          })}
        </div>
        {waitlistOpen && (
          <div>
            {WAITLIST.map((waitlisted) => (
              <div className={styles.attRow} key={waitlisted.name}>
                <div
                  className={styles.attAv}
                  style={{ background: waitlisted.background, color: waitlisted.color }}
                >
                  {waitlisted.initials}
                </div>
                <div className={styles.attInfo}>
                  <div className={styles.attName}>{waitlisted.name}</div>
                  <div className={styles.attMeta}>
                    {waitlisted.pronouns} ·{" "}
                    {t("gatherings:dashboard.waitlist.position", {
                      position: waitlisted.waitlistPosition,
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.promoteBtn}
                  onClick={() =>
                    showToast(
                      t("gatherings:dashboard.guestList.promotedToast", {
                        name: waitlisted.name.split(" ")[0]!,
                      }),
                      "success",
                    )
                  }
                >
                  {t("gatherings:dashboard.guestList.promoteCta")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsColumn() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [eventEnded, setEventEnded] = useState(false);
  const [wrapping, setWrapping] = useState(false);
  return (
    <div className={styles.col}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          {t("gatherings:dashboard.stats.arrivalRateHeading")}
        </div>
        <div className={styles.cardBody}>
          <svg
            className={styles.sparkline}
            width="100%"
            height="60"
            viewBox="0 0 220 60"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="dashSg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity=".18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 58 L30 52 L60 40 L90 20 L120 10 L150 14 L180 28 L220 34"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 58 L30 52 L60 40 L90 20 L120 10 L150 14 L180 28 L220 34 L220 60 L0 60Z"
              fill="url(#dashSg)"
            />
            <circle cx="120" cy="10" r="4" fill="var(--accent)" />
          </svg>
          <div className={styles.sparkLabels}>
            {ARRIVAL_TICKS.map((tick) => (
              <span key={tick.getTime()}>{fmt.time(tick)}</span>
            ))}
            <span>{t("gatherings:dashboard.stats.now")}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.statBig}>
            <em>64%</em>
          </div>
          <div className={styles.statLabel}>
            {t("gatherings:dashboard.stats.attendanceRateLabel")}
          </div>
          <div className={styles.peakRow}>
            <div className={styles.peakLabel}>
              {t("gatherings:dashboard.stats.peakArrivalLabel")}
            </div>
            <div className={styles.peakVal}>
              {fmt.time(PEAK_ARRIVAL_START)}–{fmt.time(PEAK_ARRIVAL_END)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          {t("gatherings:dashboard.stats.quickActionsHeading")}
        </div>
        <div className={styles.cardBody}>
          <div className={styles.quickActions}>
            <Button
              variant="ghost"
              className={styles.qaBtn}
              onClick={() =>
                showToast(
                  t("gatherings:dashboard.stats.messageSentToast", {
                    count: 9,
                  }),
                  "success",
                )
              }
            >
              {t("gatherings:dashboard.stats.messageAllCta")}
            </Button>
            <Button
              variant="ghost"
              className={styles.qaBtn}
              onClick={() =>
                showToast(
                  t("gatherings:dashboard.stats.startingSentToast"),
                  "success",
                )
              }
            >
              {t("gatherings:dashboard.stats.startingCta")} <FiSend />
            </Button>
          </div>
        </div>
      </div>

      {eventEnded ? (
        <div className={styles.endedCard}>
          <span className={styles.endedIcon} aria-hidden>
            <FiCheck />
          </span>
          <div className={styles.endedTitle}>
            <Translation
              i18nKey="gatherings:dashboard.stats.wrappedTitle"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.endedText}>
            {t("gatherings:dashboard.stats.wrappedText", { count: 9 })}
          </div>
        </div>
      ) : (
        <div className={styles.endCard}>
          <div className={styles.eeLabel}>
            {t("gatherings:dashboard.stats.endOfEventLabel")}
          </div>
          <div className={styles.eeText}>
            {t("gatherings:dashboard.stats.endOfEventText")}
          </div>
          <label className={styles.endToggle}>
            <input
              type="checkbox"
              checked={wrapping}
              onChange={(e) => setWrapping(e.target.checked)}
            />
            {t("gatherings:dashboard.stats.wrappedCheckbox")}
          </label>
          <Button
            variant="ghost"
            className={styles.endBtn}
            disabled={!wrapping}
            onClick={() => {
              setEventEnded(true);
              showToast(
                t("gatherings:dashboard.stats.followUpToast"),
                "success",
              );
            }}
          >
            {t("gatherings:dashboard.stats.endEventCta")}
          </Button>
          <div className={styles.eeNote}>
            {wrapping
              ? t("gatherings:dashboard.stats.readyNote")
              : t("gatherings:dashboard.stats.notReadyNote")}
          </div>
        </div>
      )}
    </div>
  );
}

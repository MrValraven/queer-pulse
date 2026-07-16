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
import { RECENT, WAITLIST, type Guest } from "./gatheringDashboard.data";
import { QrScanModal } from "./QrScanModal";
import styles from "./GatheringDashboardPage.module.css";

export function CheckInColumn({
  guests,
  onCheckIn,
}: {
  guests: Guest[];
  onCheckIn: (name: string) => void;
}) {
  const [scanQuery, setScanQuery] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const scanMatches = useMemo(() => {
    if (scanQuery.length < 2) return null;
    return guests.filter((g) =>
      g.name.toLowerCase().includes(scanQuery.toLowerCase()),
    );
  }, [guests, scanQuery]);

  return (
    <div className={styles.col}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Check-in</div>
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
              QR scanner area
              <br />
              tap to open camera
            </div>
          </div>
          <Button
            variant="primary"
            className={styles.scanBtn}
            onClick={() => setScanOpen(true)}
          >
            Scan member QR
          </Button>
          <div className={styles.orDivider}>
            <div className={styles.orLine} />
            <div className={styles.orText}>or search by name</div>
            <div className={styles.orLine} />
          </div>
          <input
            className={styles.nameSearch}
            type="text"
            placeholder="Search guest list…"
            value={scanQuery}
            onChange={(e) => setScanQuery(e.target.value)}
          />
          {scanMatches !== null && (
            <div className={styles.searchResult}>
              {scanMatches.length > 0 ? (
                <span className={styles.searchMatch}>
                  {scanMatches.length} match{scanMatches.length > 1 ? "es" : ""}
                </span>
              ) : (
                <span className={styles.searchNone}>Not on guest list</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>Recent check-ins</div>
        <div className={styles.cardBody}>
          <div className={styles.recentList}>
            {RECENT.map((r) => (
              <div className={styles.recentRow} key={r.name}>
                <div
                  className={styles.rrAv}
                  style={{ background: r.bg, color: r.color }}
                >
                  {r.initials}
                </div>
                <div className={styles.rrName}>{r.name}</div>
                <div className={styles.rrTime}>{r.time}</div>
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
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"all" | "in" | "pending">("all");
  const [query, setQuery] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const visible = useMemo(
    () =>
      guests.filter(
        (g) =>
          (filter === "all" || g.status === filter) &&
          (!query || g.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [guests, filter, query],
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>Guests</div>
      <div className={styles.cardBody}>
        <div className={styles.filterBar}>
          {(
            [
              ["all", `All (${guests.length})`],
              ["in", `Checked in (${checkedIn})`],
              ["pending", `Not yet (${guests.length - checkedIn})`],
            ] as const
          ).map(([id, label]) => (
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
          placeholder="Search guests…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div>
          {visible.length === 0 &&
            (guests.length === 0 ? (
              <EmptyState
                compact
                icon={<FiUsers />}
                title="No one's on the guest list yet"
                description="As people reserve their spot, they'll appear here ready to check in. Share your gathering to bring the first guests in."
              />
            ) : (
              <EmptyState
                compact
                icon={<FiUsers />}
                title="No guests in this view"
                description="No one matches your current filter or search. Try widening it to see everyone expected."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setFilter("all");
                    setQuery("");
                  },
                }}
              />
            ))}
          {visible.map((g) => (
            <div className={styles.attRow} key={g.name}>
              <div
                className={styles.attAv}
                style={{ background: g.bg, color: g.color }}
              >
                {g.initials}
              </div>
              <div className={styles.attInfo}>
                <div className={styles.attName}>{g.name}</div>
                <div className={styles.attMeta}>{g.pronouns}</div>
                {g.status === "pending" && (
                  <button
                    type="button"
                    className={styles.manualBtn}
                    onClick={() => onCheckIn(g.name)}
                  >
                    Check in manually
                  </button>
                )}
              </div>
              <div>
                {g.status === "in" ? (
                  <FadeIn
                    key={g.time}
                    className={`${styles.checkinChip} ${styles.chipIn}`}
                  >
                    Checked in {g.time}
                  </FadeIn>
                ) : (
                  <div
                    className={`${styles.checkinChip} ${styles.chipPending}`}
                  >
                    Expected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className={styles.waitlistToggle}
          onClick={() => setWaitlistOpen((o) => !o)}
          role="button"
          tabIndex={0}
          aria-expanded={waitlistOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setWaitlistOpen((o) => !o);
            }
          }}
        >
          <span>{waitlistOpen ? <FiChevronDown /> : <FiChevronRight />}</span> 3
          on waitlist — promote
        </div>
        {waitlistOpen && (
          <div>
            {WAITLIST.map((w) => (
              <div className={styles.attRow} key={w.name}>
                <div
                  className={styles.attAv}
                  style={{ background: w.bg, color: w.color }}
                >
                  {w.initials}
                </div>
                <div className={styles.attInfo}>
                  <div className={styles.attName}>{w.name}</div>
                  <div className={styles.attMeta}>{w.meta}</div>
                </div>
                <button
                  type="button"
                  className={styles.promoteBtn}
                  onClick={() =>
                    showToast(
                      `${w.name.split(" ")[0]} promoted to guest list`,
                      "success",
                    )
                  }
                >
                  Promote
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
  const { showToast } = useToast();
  const [eventEnded, setEventEnded] = useState(false);
  const [wrapping, setWrapping] = useState(false);
  return (
    <div className={styles.col}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Arrival rate</div>
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
            <span>11:00</span>
            <span>11:15</span>
            <span>11:30</span>
            <span>11:45</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.statBig}>
            <em>64%</em>
          </div>
          <div className={styles.statLabel}>Attendance rate so far</div>
          <div className={styles.peakRow}>
            <div className={styles.peakLabel}>Peak arrival</div>
            <div className={styles.peakVal}>11:15–11:30</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>Quick actions</div>
        <div className={styles.cardBody}>
          <div className={styles.quickActions}>
            <Button
              variant="ghost"
              className={styles.qaBtn}
              onClick={() => showToast("Message sent to 9 guests", "success")}
            >
              Message all attendees
            </Button>
            <Button
              variant="ghost"
              className={styles.qaBtn}
              onClick={() =>
                showToast("We're starting — sent to all guests", "success")
              }
            >
              Send "We're starting" <FiSend />
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
            Event <em>wrapped</em>
          </div>
          <div className={styles.endedText}>
            Check-in is closed and a follow-up has been sent to all 9 attendees
            with the recap and photo link.
          </div>
        </div>
      ) : (
        <div className={styles.endCard}>
          <div className={styles.eeLabel}>End of event</div>
          <div className={styles.eeText}>
            When the gathering wraps up, send a follow-up and close the check-in
            window.
          </div>
          <label className={styles.endToggle}>
            <input
              type="checkbox"
              checked={wrapping}
              onChange={(e) => setWrapping(e.target.checked)}
            />
            The gathering has wrapped up
          </label>
          <Button
            variant="ghost"
            className={styles.endBtn}
            disabled={!wrapping}
            onClick={() => {
              setEventEnded(true);
              showToast("Follow-up sent — check-in closed", "success");
            }}
          >
            End event &amp; send follow-up
          </Button>
          <div className={styles.eeNote}>
            {wrapping
              ? "Ready to send the follow-up"
              : "Mark the gathering as wrapped to enable"}
          </div>
        </div>
      )}
    </div>
  );
}

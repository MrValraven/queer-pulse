import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./GatheringDashboardPage.module.css";

const HOME = "/";
const MANAGE = linkToPath("QueerPulse Manage Gathering.html");

const RECENT = [
  { initials: "SR", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Sofia R.", time: "Just now" },
  { initials: "AK", bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)", name: "Anika K.", time: "3 min ago" },
  { initials: "JP", bg: "rgba(45,27,61,.1)", color: "var(--plum)", name: "Jordan P.", time: "7 min ago" },
  { initials: "TM", bg: "rgba(74,140,111,.08)", color: "var(--jade)", name: "Tomás M.", time: "11 min ago" },
];

interface Guest {
  initials: string;
  bg: string;
  color: string;
  name: string;
  pronouns: string;
  status: "in" | "pending";
  time?: string;
}
const INITIAL_GUESTS: Guest[] = [
  { initials: "SR", bg: "rgba(74,140,111,.12)", color: "var(--jade)", name: "Sofia Rodrigues", pronouns: "she/her", status: "in", time: "11:03" },
  { initials: "AK", bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)", name: "Anika Kovač", pronouns: "she/they", status: "in", time: "11:07" },
  { initials: "JP", bg: "rgba(45,27,61,.1)", color: "var(--plum)", name: "Jordan Park", pronouns: "they/them", status: "in", time: "11:13" },
  { initials: "TM", bg: "rgba(74,140,111,.08)", color: "var(--jade)", name: "Tomás Mendes", pronouns: "he/him", status: "in", time: "11:19" },
  { initials: "MF", bg: "rgba(45,27,61,.07)", color: "var(--plum)", name: "Maria Ferreira", pronouns: "she/her", status: "in", time: "11:22" },
  { initials: "RL", bg: "rgba(232,119,90,.08)", color: "var(--accent-ink)", name: "Rosa Lima", pronouns: "she/her", status: "in", time: "11:28" },
  { initials: "BK", bg: "rgba(74,140,111,.1)", color: "var(--jade)", name: "Bilal Kaya", pronouns: "he/him", status: "in", time: "11:31" },
  { initials: "PO", bg: "rgba(45,27,61,.08)", color: "var(--plum)", name: "Priya Osei", pronouns: "she/they", status: "in", time: "11:38" },
  { initials: "CN", bg: "rgba(232,119,90,.1)", color: "var(--accent-ink)", name: "Carlos Neves", pronouns: "he/him", status: "in", time: "11:44" },
  { initials: "LM", bg: "rgba(45,27,61,.06)", color: "var(--ink-60)", name: "Lena Müller", pronouns: "she/her", status: "pending" },
  { initials: "XP", bg: "rgba(45,27,61,.06)", color: "var(--ink-60)", name: "Xabi Prieto", pronouns: "he/they", status: "pending" },
  { initials: "AS", bg: "rgba(45,27,61,.06)", color: "var(--ink-60)", name: "Amara Sow", pronouns: "she/her", status: "pending" },
  { initials: "DO", bg: "rgba(45,27,61,.06)", color: "var(--ink-60)", name: "Daniel Oliveira", pronouns: "he/him", status: "pending" },
  { initials: "IF", bg: "rgba(45,27,61,.06)", color: "var(--ink-60)", name: "Ines Fonseca", pronouns: "she/her", status: "pending" },
];

const WAITLIST = [
  { initials: "NC", bg: "rgba(232,119,90,.08)", color: "var(--accent-ink)", name: "Nadia Castillo", meta: "she/her · #1 on waitlist" },
  { initials: "KL", bg: "rgba(74,140,111,.08)", color: "var(--jade)", name: "Kai Larsson", meta: "they/them · #2 on waitlist" },
];

function nowHHMM() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function GatheringDashboardPage() {
  const { showToast } = useToast();
  const [clock, setClock] = useState(nowHHMM());
  const [filter, setFilter] = useState<"all" | "in" | "pending">("all");
  const [query, setQuery] = useState("");
  const [scanQuery, setScanQuery] = useState("");
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setClock(nowHHMM()), 10000);
    return () => window.clearInterval(t);
  }, []);

  const checkedIn = guests.filter((g) => g.status === "in").length;

  const visible = useMemo(
    () =>
      guests.filter(
        (g) =>
          (filter === "all" || g.status === filter) &&
          (!query || g.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [guests, filter, query],
  );

  const scanMatches = useMemo(() => {
    if (scanQuery.length < 2) return null;
    return guests.filter((g) => g.name.toLowerCase().includes(scanQuery.toLowerCase()));
  }, [guests, scanQuery]);

  const checkInManual = (name: string) => {
    setGuests((prev) => prev.map((g) => (g.name === name ? { ...g, status: "in", time: nowHHMM() } : g)));
    showToast(`${name.split(" ")[0]} checked in`, "success");
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to={HOME} className={styles.brand}>
          <span className={styles.brandDot} />
          Queer<span className={styles.brandQ}>Pulse</span>
        </Link>
        <Link to={MANAGE} className={styles.backLink}>
          ← Manage gathering
        </Link>
        <span className={styles.clock}>{clock}</span>
      </div>

      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} /> In progress
          </div>
          <div className={styles.heroTitle}>
            Pride Brunch — <em>June Edition</em>
          </div>
          <div className={styles.heroStats}>
            <div>
              <div className={styles.hsN}>{checkedIn}</div>
              <div className={styles.hsL}>Checked in</div>
            </div>
            <div>
              <div className={styles.hsN}>14</div>
              <div className={styles.hsL}>Expected</div>
            </div>
            <div>
              <div className={styles.hsN}>
                <em>3</em>
              </div>
              <div className={styles.hsL}>Waitlist</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {/* Check-in */}
            <div className={styles.col}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Check-in</div>
                <div className={styles.cardBody}>
                  <div className={styles.qrArea} onClick={() => showToast("Opening camera…", "info")}>
                    <div className={styles.qrIcon}>⬛</div>
                    <div className={styles.qrLabel}>
                      QR scanner area
                      <br />
                      tap to open camera
                    </div>
                  </div>
                  <Button variant="primary" className={styles.scanBtn} onClick={() => showToast("Opening camera…", "info")}>
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
                        <div className={styles.rrAv} style={{ background: r.bg, color: r.color }}>
                          {r.initials}
                        </div>
                        <div className={styles.rrName}>{r.name}</div>
                        <div className={styles.rrTime}>{r.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Guest list */}
            <div className={styles.card}>
              <div className={styles.cardHead}>Guests</div>
              <div className={styles.cardBody}>
                <div className={styles.filterBar}>
                  {([
                    ["all", `All (${guests.length})`],
                    ["in", `Checked in (${checkedIn})`],
                    ["pending", `Not yet (${guests.length - checkedIn})`],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={[styles.afBtn, filter === id && styles.afBtnActive].filter(Boolean).join(" ")}
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
                  {visible.map((g) => (
                    <div className={styles.attRow} key={g.name}>
                      <div className={styles.attAv} style={{ background: g.bg, color: g.color }}>
                        {g.initials}
                      </div>
                      <div className={styles.attInfo}>
                        <div className={styles.attName}>{g.name}</div>
                        <div className={styles.attMeta}>{g.pronouns}</div>
                        {g.status === "pending" && (
                          <button type="button" className={styles.manualBtn} onClick={() => checkInManual(g.name)}>
                            Check in manually
                          </button>
                        )}
                      </div>
                      <div>
                        {g.status === "in" ? (
                          <div className={`${styles.checkinChip} ${styles.chipIn}`}>Checked in {g.time}</div>
                        ) : (
                          <div className={`${styles.checkinChip} ${styles.chipPending}`}>Expected</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.waitlistToggle} onClick={() => setWaitlistOpen((o) => !o)}>
                  <span>{waitlistOpen ? "▾" : "▸"}</span> 3 on waitlist — promote
                </div>
                {waitlistOpen && (
                  <div>
                    {WAITLIST.map((w) => (
                      <div className={styles.attRow} key={w.name}>
                        <div className={styles.attAv} style={{ background: w.bg, color: w.color }}>
                          {w.initials}
                        </div>
                        <div className={styles.attInfo}>
                          <div className={styles.attName}>{w.name}</div>
                          <div className={styles.attMeta}>{w.meta}</div>
                        </div>
                        <button
                          type="button"
                          className={styles.promoteBtn}
                          onClick={() => showToast(`${w.name.split(" ")[0]} promoted to guest list`, "success")}
                        >
                          Promote
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live stats */}
            <div className={styles.col}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Arrival rate</div>
                <div className={styles.cardBody}>
                  <svg className={styles.sparkline} width="100%" height="60" viewBox="0 0 220 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="dashSg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity=".18" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 58 L30 52 L60 40 L90 20 L120 10 L150 14 L180 28 L220 34" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 58 L30 52 L60 40 L90 20 L120 10 L150 14 L180 28 L220 34 L220 60 L0 60Z" fill="url(#dashSg)" />
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
                    <Button variant="ghost" className={styles.qaBtn} onClick={() => showToast("Message sent to 9 guests", "success")}>
                      Message all attendees
                    </Button>
                    <Button variant="ghost" className={styles.qaBtn} onClick={() => showToast("We're starting — sent to all guests", "success")}>
                      Send "We're starting" ✦
                    </Button>
                  </div>
                </div>
              </div>

              <div className={styles.endCard}>
                <div className={styles.eeLabel}>End of event</div>
                <div className={styles.eeText}>
                  When the gathering wraps up, send a follow-up and close the check-in
                  window.
                </div>
                <Button variant="ghost" className={styles.endBtn} disabled title="Available after 14:00">
                  End event &amp; send follow-up
                </Button>
                <div className={styles.eeNote}>Available from 14:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dataFooter}>
        <div className={`wrap ${styles.dfInner}`}>
          <div className={styles.dfText}>Gathering data is deleted 30 days after the event</div>
          <div className={styles.dfDot} />
          <div className={styles.dfText}>Attendance records are never shared publicly</div>
        </div>
      </div>
    </div>
  );
}

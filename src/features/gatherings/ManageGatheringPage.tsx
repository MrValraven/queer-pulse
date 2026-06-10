import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./ManageGatheringPage.module.css";

type Tab = "overview" | "attendees" | "messages" | "settings";

const GATHERING = linkToPath("QueerPulse Gathering.html");
const CONTACT = linkToPath("QueerPulse Contact.html");

const DETAILS = [
  { label: "Date", value: "Saturday 21 June 2026" },
  { label: "Time", value: "11:00 – 14:00" },
  { label: "Venue", value: "A Cevicheria, Príncipe Real" },
  { label: "Capacity", value: "20 people" },
];

const GOING = [
  { initials: "SR", bg: "rgba(74,140,111,.12)", color: "var(--jade)", name: "Sofia Rodrigues", meta: "she/her · RSVP'd 2 June" },
  { initials: "AK", bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)", name: "Anika Kovač", meta: "she/they · RSVP'd 1 June" },
  { initials: "JP", bg: "rgba(45,27,61,.1)", color: "var(--plum)", name: "Jordan Park", meta: "they/them · RSVP'd 31 May" },
  { initials: "TM", bg: "rgba(74,140,111,.08)", color: "var(--jade)", name: "Tomás Mendes", meta: "he/him · RSVP'd 30 May" },
];
const WAITLIST = [
  { initials: "NC", bg: "rgba(45,27,61,.07)", color: "var(--plum)", name: "Nadia Castillo", meta: "she/her · On waitlist since 3 June · #1" },
  { initials: "KL", bg: "rgba(74,140,111,.08)", color: "var(--jade)", name: "Kai Larsson", meta: "they/them · On waitlist since 4 June · #2" },
  { initials: "MF", bg: "rgba(232,119,90,.08)", color: "var(--accent-ink)", name: "Maria Ferreira", meta: "she/her · On waitlist since 5 June · #3" },
];
const MESSAGES = [
  { subject: "Venue details confirmed", time: "3 days ago", preview: "We've confirmed the terrace at A Cevicheria. Entrance is on Rua Dom Pedro V. Look for the QueerPulse sign at the door…", opened: "11 / 14 opened" },
  { subject: "What to bring", time: "1 day ago", preview: "Just yourselves — food and drinks are covered. We'll have a small quiet corner for anyone who needs a break from the crowd…", opened: "9 / 14 opened" },
];
const SETTINGS = [
  { title: "Allow waitlist", desc: "Members can join a waitlist if the gathering is full", on: true },
  { title: "Show attendee count publicly", desc: "Visitors can see how many people are going", on: true },
  { title: "Allow questions from attendees", desc: "Guests can message you with questions before the event", on: false },
  { title: "Require approval for RSVPs", desc: "You manually approve each RSVP before it's confirmed", on: false },
];

const Pencil = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M8 1.5L10.5 4l-6 6H2V7.5l6-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 6l3 3 7-7" stroke="var(--jade)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ManageGatheringPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [toggles, setToggles] = useState<boolean[]>(SETTINGS.map((s) => s.on));

  const cancelGathering = () => {
    if (window.confirm("Cancel Pride Brunch? All 14 attendees will be notified.")) {
      navigate(linkToPath("QueerPulse Gathering Cancelled.html"));
    }
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <div className={styles.phDot} /> Hosting
            </div>
            <div className={styles.title}>
              Pride Brunch — <em>June Edition</em>
            </div>
            <div className={styles.phRow}>
              <div className={styles.status}>
                <div className={styles.statusDot} /> Approved · 12 days to go
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" className={styles.actionBtn} onClick={() => showToast("Opening editor…", "info")}>
                  Edit details
                </Button>
                <Button variant="ghost" className={styles.actionBtn} onClick={() => setTab("messages")}>
                  Message attendees
                </Button>
                <Button variant="primary" className={styles.actionBtn} to={linkToPath("QueerPulse Gathering Dashboard.html")}>
                  Day-of dashboard →
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={styles.tabBar}>
                {(["overview", "attendees", "messages", "settings"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={[styles.tabBtn, tab === t && styles.tabBtnActive].filter(Boolean).join(" ")}
                    onClick={() => setTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {tab === "overview" && (
                <div>
                  <div className={styles.statsRow}>
                    {[["14", "Going"], ["3", "Waitlist"], ["6", "Spots left"]].map(([n, l]) => (
                      <div className={styles.statChip} key={l}>
                        <div className={styles.scN}>{n}</div>
                        <div className={styles.scL}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.detailBlock}>
                    {DETAILS.map((d) => (
                      <div className={styles.detailRow} key={d.label}>
                        <div className={styles.drLabel}>{d.label}</div>
                        <div className={styles.drVal}>{d.value}</div>
                        <button type="button" className={styles.drEdit} onClick={() => showToast(`Edit ${d.label.toLowerCase()}`, "info")}>
                          <Pencil /> Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.descCard}>
                    <div className={styles.descLabel}>
                      Description
                      <button type="button" className={styles.drEdit} onClick={() => showToast("Edit description", "info")}>
                        Edit
                      </button>
                    </div>
                    <div className={styles.descText}>
                      A slow, joyful Pride-week brunch for queer Lisbon. Good food, no
                      agenda, no strangers for long. We'll have the terrace to ourselves
                      from 11am. Bring your people, or come solo — you'll leave with new
                      ones.
                    </div>
                  </div>
                  <div className={styles.lastEdit}>Last edited 2 days ago</div>
                </div>
              )}

              {tab === "attendees" && (
                <div>
                  <div className={styles.attToolbar}>
                    <input className={styles.attSearch} type="text" placeholder="Search attendees…" />
                    <Button variant="ghost" className={styles.actionBtn} onClick={() => showToast("CSV exported", "success")}>
                      Export list
                    </Button>
                  </div>
                  <div className={styles.capWrap}>
                    <div className={styles.capLabel}>
                      <span>14 of 20 spots filled</span>
                      <span className={styles.capPct}>70%</span>
                    </div>
                    <div className={styles.capBar}>
                      <div className={styles.capFill} style={{ width: "70%" }} />
                    </div>
                  </div>
                  <div className={styles.attSectionLabel}>Going (14)</div>
                  <div className={styles.attList}>
                    {GOING.map((a) => (
                      <div className={styles.attRow} key={a.name}>
                        <div className={styles.attAv} style={{ background: a.bg, color: a.color }}>
                          {a.initials}
                        </div>
                        <div className={styles.attInfo}>
                          <div className={styles.attName}>{a.name}</div>
                          <div className={styles.attMeta}>{a.meta}</div>
                        </div>
                        <div className={styles.attActions}>
                          <button type="button" className={`${styles.attActionBtn} ${styles.remove}`} onClick={() => showToast("Removed from guest list", "info")}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className={styles.moreRow}>+ 10 more attendees</div>
                  </div>
                  <div className={styles.attSectionLabel} style={{ marginTop: 20 }}>
                    Waitlist (3)
                  </div>
                  <div className={styles.attList}>
                    {WAITLIST.map((a) => (
                      <div className={styles.attRow} key={a.name}>
                        <div className={styles.attAv} style={{ background: a.bg, color: a.color }}>
                          {a.initials}
                        </div>
                        <div className={styles.attInfo}>
                          <div className={styles.attName}>{a.name}</div>
                          <div className={styles.attMeta}>{a.meta}</div>
                        </div>
                        <div className={styles.attActions}>
                          <button type="button" className={`${styles.attActionBtn} ${styles.promote}`} onClick={() => showToast(`${a.name.split(" ")[0]} promoted to guest list`, "success")}>
                            Promote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "messages" && (
                <div>
                  <div className={styles.composerCard}>
                    <div className={styles.compLabel}>Message all attendees (14 going)</div>
                    <textarea className={styles.compTa} placeholder="Write an update for your guests…" />
                    <div className={styles.compFooter}>
                      <div className={styles.compHint}>Sent to all 14 confirmed attendees.</div>
                      <Button variant="primary" onClick={() => showToast("Update sent to 14 attendees", "success")}>
                        Send update
                      </Button>
                    </div>
                  </div>
                  <div className={styles.prevLabel}>Previous messages</div>
                  <div className={styles.msgList}>
                    {MESSAGES.map((m) => (
                      <div className={styles.msgCard} key={m.subject}>
                        <div className={styles.msgHeader}>
                          <div className={styles.msgSubject}>{m.subject}</div>
                          <div className={styles.msgTime}>{m.time}</div>
                        </div>
                        <div className={styles.msgPreview}>{m.preview}</div>
                        <div className={styles.openRate}>
                          <Check />
                          {m.opened}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "settings" && (
                <div>
                  <div className={styles.sectionLabel}>Gathering options</div>
                  <div className={styles.toggleList}>
                    {SETTINGS.map((s, i) => (
                      <div className={styles.tglRow} key={s.title}>
                        <div>
                          <div className={styles.tglTitle}>{s.title}</div>
                          <div className={styles.tglDesc}>{s.desc}</div>
                        </div>
                        <label className={styles.tglSw}>
                          <input
                            type="checkbox"
                            checked={toggles[i]}
                            onChange={() => setToggles((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                          />
                          <div className={styles.tglTrack} />
                          <div className={styles.tglThumb} />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className={styles.dangerLabel}>Danger zone</div>
                  <div className={styles.dangerZone}>
                    <div className={styles.dzLabel}>Cancel this gathering</div>
                    <div className={styles.dzText}>
                      All attendees will be notified and RSVPs will be released. This
                      cannot be undone. A cancellation message will be sent automatically.
                    </div>
                    <Button variant="ghost" className={styles.cancelBtn} onClick={cancelGathering}>
                      Cancel gathering
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbImg}>
                  <div className={styles.sbImgLabel}>
                    gathering
                    <br />
                    cover photo
                  </div>
                </div>
                <div className={styles.sbBody}>
                  <div className={styles.sbTitle}>Pride Brunch — June</div>
                  <div className={styles.sbMeta}>Sat 21 June · Príncipe Real</div>
                  <div className={styles.shareRow}>
                    <div className={styles.shareUrl}>queerpulse.com/g/pride-brunch-jun</div>
                    <button type="button" className={styles.copyBtn} onClick={() => showToast("Link copied!", "success")}>
                      Copy
                    </button>
                  </div>
                  <Link className={styles.sbViewLink} to={GATHERING}>
                    View public listing →
                  </Link>
                </div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supText}>
                  Need help with your gathering? <Link to={CONTACT}>Message the QueerPulse team →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

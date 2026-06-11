import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollLock } from "../../shared/hooks";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./AccessibilityPage.module.css";
import { Button } from '../../shared/components/ui'

const INVITE = linkToPath("QueerPulse Invite.html");

type Badge = "yes" | "partial" | "no";
interface Venue {
  name: string;
  type: string;
  hood: string;
  note: string;
  features: { label: string; cls: Badge }[];
  featureTags: string[];
  reviewer: string;
}

const VENUES: Venue[] = [
  { name: "Maria Caxuxa", type: "Bar · Community space", hood: "Intendente", note: "One of the most consistently accessible queer spaces in Lisbon. Reviewer notes that step-free access is genuinely easy and staff are helpful without being patronising.", features: [{ label: "Step-free entry", cls: "yes" }, { label: "Accessible bathroom", cls: "yes" }, { label: "Seating throughout", cls: "yes" }, { label: "Hearing loop", cls: "yes" }, { label: "Sensory-friendly nights", cls: "yes" }, { label: "Carer welcome", cls: "yes" }], featureTags: ["step-free", "accessible-bathroom", "seating", "hearing-loop", "sensory-friendly", "carer-welcome"], reviewer: "Reviewed by 3 disabled members" },
  { name: "Trumps", type: "Club · Bar", hood: "Príncipe Real", note: "One step at the main entrance — manageable for some wheelchair users with staff assistance, but requires asking. Inside access is good once you're in. Accessible bathroom on the ground floor.", features: [{ label: "1 step at entry (staff help available)", cls: "partial" }, { label: "Accessible bathroom", cls: "yes" }, { label: "Seating at bar area", cls: "partial" }, { label: "No hearing loop", cls: "no" }, { label: "Carer welcome", cls: "yes" }], featureTags: ["accessible-bathroom", "seating", "carer-welcome"], reviewer: "Reviewed by 2 disabled members" },
  { name: "Deep Marvila", type: "Club · Events space", hood: "Marvila", note: "Large warehouse venue. Entry is fully step-free and the space is wide and open. However: no accessible bathroom on site and noise levels are very high at club nights. Better for daytime events.", features: [{ label: "Step-free entry", cls: "yes" }, { label: "No accessible bathroom", cls: "no" }, { label: "Seating in gallery area", cls: "partial" }, { label: "No hearing loop", cls: "no" }, { label: "Low sensory during day events", cls: "partial" }, { label: "Carer welcome", cls: "yes" }], featureTags: ["step-free", "seating", "carer-welcome"], reviewer: "Reviewed by 2 disabled members" },
  { name: "A Cena", type: "Community venue · Theatre", hood: "Mouraria", note: "Purpose-built community space with accessibility as a design priority. LGP interpretation regularly provided for in-house productions. One of the best options for members with multiple access needs.", features: [{ label: "Step-free entry", cls: "yes" }, { label: "Accessible bathroom", cls: "yes" }, { label: "Seating always available", cls: "yes" }, { label: "Hearing loop", cls: "yes" }, { label: "LGP interpretation (some events)", cls: "yes" }, { label: "Sensory-friendly", cls: "yes" }, { label: "Carer welcome", cls: "yes" }], featureTags: ["step-free", "accessible-bathroom", "seating", "hearing-loop", "sensory-friendly", "carer-welcome"], reviewer: "Reviewed by 5 disabled members" },
  { name: "Finalmente Club", type: "Club", hood: "Príncipe Real", note: "Stairs to the main floor with no lift. Not accessible for wheelchair users or people who cannot manage stairs. Inside: very tight space, high noise, limited seating. Community history is important but accessibility is genuinely poor.", features: [{ label: "Multiple stairs, no lift", cls: "no" }, { label: "No accessible bathroom", cls: "no" }, { label: "Very limited seating", cls: "no" }, { label: "High noise environment", cls: "no" }], featureTags: [], reviewer: "Reviewed by 4 disabled members" },
  { name: "Tasca do Chico", type: "Bar · Music", hood: "Bairro Alto", note: "Narrow, old building with steps at entry. Once inside, the space is very tight. The fado nights are exceptional but the physical space has real limitations for disabled visitors.", features: [{ label: "Steps at entry", cls: "no" }, { label: "No accessible bathroom", cls: "no" }, { label: "Limited seating", cls: "partial" }, { label: "Staff welcoming", cls: "yes" }], featureTags: [], reviewer: "Reviewed by 2 disabled members" },
  { name: "Queer Lisboa HQ", type: "Community space · Office", hood: "Arroios", note: "The community space used for smaller QueerPulse gatherings. Step-free lift access, accessible bathroom, adjustable seating. Events held here carry an accessibility guarantee.", features: [{ label: "Step-free (lift)", cls: "yes" }, { label: "Accessible bathroom", cls: "yes" }, { label: "Adjustable seating", cls: "yes" }, { label: "Quiet room available", cls: "yes" }, { label: "Carer welcome", cls: "yes" }], featureTags: ["step-free", "accessible-bathroom", "seating", "sensory-friendly", "carer-welcome"], reviewer: "QueerPulse-operated space" },
];

const FILTERS = [
  { id: "all", label: "All venues" },
  { id: "step-free", label: "Step-free" },
  { id: "accessible-bathroom", label: "Accessible bathroom" },
  { id: "seating", label: "Seating available" },
  { id: "hearing-loop", label: "Hearing loop" },
  { id: "sensory-friendly", label: "Sensory-friendly" },
  { id: "carer-welcome", label: "Carer welcome" },
];

const COMMITMENTS = [
  { icon: <><rect x="2" y="5" width="16" height="11" rx="2" /><path d="M5 9h10M5 13h6" /></>, title: "Live captions at online events", body: "All QueerPulse online events use automatic captions as a minimum. For larger events, human-edited captions are arranged on request.", status: "Standard practice" },
  { icon: <><path d="M4 14l4-4 3 3 5-6" /><circle cx="15" cy="5" r="2" /></>, title: "LGP interpretation on request", body: "Portuguese Sign Language (LGP) interpretation can be arranged for QueerPulse gatherings and larger community events with at least two weeks' notice.", status: "Available on request · 14 days notice" },
  { icon: <path d="M10 3v14M3 10h14" />, title: "Seating always available", body: "QueerPulse gatherings always have seating available — standing-only events are not acceptable. If an event is at a venue where seating is limited, we say so clearly in the listing.", status: "Non-negotiable minimum" },
  { icon: <><circle cx="10" cy="10" r="7" /><path d="M10 7v4l2.5 2.5" /></>, title: "Sensory-friendly events flagged", body: "Events designed with lower sensory load (quieter music, lower lighting, no strobes, quieter entry space) are flagged on the calendar with a clear indicator.", status: "Flagged on every calendar listing" },
  { icon: <><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" /></>, title: "Carers & PAs welcome", body: "Personal assistants and carers are always welcome at QueerPulse events at no additional cost. No justification required — just let us know when you register.", status: "Always, without question" },
  { icon: <path d="M10 2L2 7v6a8 8 0 0 0 16 0V7L10 2z" />, title: "Platform accessibility", body: "QueerPulse is committed to WCAG 2.1 AA compliance. If you find something inaccessible on the platform, report it — we treat these as priority fixes, not feature requests.", status: "Report via the forum or contact page" },
];

const RESOURCES = [
  { eyebrow: "Benefits & entitlements", title: "Portuguese disability benefits as a migrant", body: "Navigating the Portuguese social security system (Segurança Social) as an expat or recent migrant with a disability is genuinely complicated. This guide, maintained by community members, covers what you're entitled to at different stages of residency — EU citizens, non-EU residents, and people awaiting documentation.", link: "Full benefits guide →" },
  { eyebrow: "Healthcare", title: "Disability-affirming, queer-friendly healthcare", body: "Finding a GP or specialist who is both disability-affirming and queer-friendly is harder than it should be. Community-reviewed healthcare providers are listed here — people who understand that being disabled and queer are not separate things requiring separate appointments.", link: "Health providers directory →" },
  { eyebrow: "Legal rights", title: "Disability discrimination and your rights", body: "Portuguese law prohibits discrimination on grounds of disability in employment, housing, and public services. This includes the right to reasonable adjustments. If you've experienced discrimination from a landlord, employer, or service provider, there are routes to challenge it.", link: "Legal resources →" },
  { eyebrow: "Mental health", title: "Chronic illness, disability, and mental health support", body: "The intersection of chronic illness, disability, and queer identity creates specific mental health pressures. QueerPulse's wellbeing resources include therapists with experience of disabled queer clients, and peer support groups that don't require you to explain yourself from scratch.", link: "Wellbeing resources →" },
];

const FLAG_ISSUES = [
  "Step-free access was not as described",
  "Accessible bathroom was unavailable or not as described",
  "Seating was not available",
  "Hearing loop was not working",
  "Sensory environment was not as described",
  "Staff were unhelpful or dismissive",
  "Something else",
];

const Check = () => (
  <svg viewBox="0 0 26 26" fill="none" stroke="var(--jade)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13l6 6L22 7" />
  </svg>
);

export function AccessibilityPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [flagVenue, setFlagVenue] = useState<string | null>(null);
  const [flagDone, setFlagDone] = useState(false);
  const [accomOpen, setAccomOpen] = useState(false);
  const [accomDone, setAccomDone] = useState(false);
  useScrollLock(flagVenue !== null || accomOpen);

  const venues = VENUES.filter((v) => filter === "all" || v.featureTags.includes(filter));
  const badgeClass: Record<Badge, string> = { yes: styles.badgeYes, partial: styles.badgePartial, no: styles.badgeNo };

  const openFlag = (name: string) => {
    setFlagVenue(name);
    setFlagDone(false);
  };
  const openAccom = () => {
    setAccomOpen(true);
    setAccomDone(false);
  };

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Disability &amp; Accessibility</div>
          <h1>
            Accessible. <em>Genuinely.</em>
          </h1>
          <p className={styles.heroSub}>
            We don't want disability to be a footnote. This page is for disabled and
            chronically ill members — practical, honest information about accessible
            spaces, what QueerPulse commits to, and community support.
          </p>
          <div className={styles.heroActions}>
            <Button type="button" variant="primary" onClick={openAccom}>
              Request event accommodations
            </Button>
            <Button href="#spaces" variant="ghost">
              Accessible spaces directory ↓
            </Button>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.dot} />
            Venue information reviewed by disabled community members · updated quarterly
          </div>
        </div>
      </div>

      <section className={styles.sec} id="spaces">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Accessible <em>spaces</em>
            </h2>
            <p>
              Not a binary accessible/not-accessible list. Real detail, reviewed by
              disabled members of this community. Filter by what matters to you.
            </p>
          </div>
          <div className={styles.venueFilter}>
            <span className={styles.vfLabel}>Filter</span>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={[styles.vfChip, filter === f.id && styles.vfChipOn].filter(Boolean).join(" ")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.venueGrid}>
            {venues.length === 0 ? (
              <div className={styles.venueEmpty}>
                <p>No venues match that filter yet.</p>
                <p className={styles.small}>Know of one? Let us know in the forum.</p>
              </div>
            ) : (
              venues.map((v) => (
                <div className={styles.venueCard} key={v.name}>
                  <div className={styles.vcName}>{v.name}</div>
                  <div className={styles.vcType}>{v.type}</div>
                  <div className={styles.vcHood}>
                    <span className={styles.vcHoodDot} />
                    {v.hood}
                  </div>
                  <p className={styles.vcNote}>{v.note}</p>
                  <div className={styles.vcFeatures}>
                    {v.features.map((f) => (
                      <span key={f.label} className={`${styles.vfBadge} ${badgeClass[f.cls]}`}>
                        {f.label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.vcFoot}>
                    <span className={styles.vcReviewer}>{v.reviewer}</span>
                    <button type="button" className={styles.flagBtn} onClick={() => openFlag(v.name)}>
                      Flag an issue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className={`${styles.sec} ${styles.secAlt}`}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Our <em>commitments</em>
            </h2>
            <p>
              These are what QueerPulse does to make gatherings, events, and the platform
              more accessible. Not a brochure — a baseline we're accountable to, and want
              to keep improving.
            </p>
          </div>
          <div className={styles.commitGrid}>
            {COMMITMENTS.map((c) => (
              <div className={styles.commitCard} key={c.title}>
                <div className={styles.ccIcon}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="var(--jade)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                </div>
                <div className={styles.ccTitle}>{c.title}</div>
                <div className={styles.ccBody}>{c.body}</div>
                <div className={styles.ccStatus}>{c.status}</div>
              </div>
            ))}
          </div>
          <div className={styles.accomStrip}>
            <div>
              <h3>Need something specific for a QueerPulse event?</h3>
              <p>
                Request accommodations in advance and we'll do everything we can. No need
                to justify or explain — just tell us what you need.
              </p>
            </div>
            <Button type="button" variant="primary" onClick={openAccom}>
              Request accommodations
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Resources for disabled <em>queer people in Lisbon</em>
            </h2>
            <p>
              Practical support for navigating disability as a queer person in Portugal —
              benefits, healthcare, and community.
            </p>
          </div>
          <div className={styles.resourceGrid}>
            {RESOURCES.map((r) => (
              <div className={styles.resourceCard} key={r.title}>
                <div className={styles.rcEyebrow}>{r.eyebrow}</div>
                <div className={styles.rcTitle}>{r.title}</div>
                <div className={styles.rcBody}>{r.body}</div>
                <div className={styles.rcLink}>
                  <a onClick={() => showToast("Opening resource…", "info")}>{r.link}</a>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.peerStrip}>
            <div>
              <h3>
                Peer support — <em>disabled &amp; chronically ill members</em>
              </h3>
              <p>
                A closed community group within QueerPulse for disabled and chronically ill
                members. No inspiration required. Just people who understand.
              </p>
            </div>
            <div className={styles.peerActions}>
              <Button type="button" variant="primary" onClick={() => showToast("Joining the group…", "success")}>
                Join the group
              </Button>
              <Button to={linkToPath("QueerPulse Mentorship.html")} variant="ghost-dark">
                Find a peer mentor →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            You belong <em>here</em> — fully.
          </h2>
          <p className={styles.outroSub}>
            Not as an afterthought. Not with a separate entrance. As a full member of this
            community.
          </p>
          <Button to={INVITE} variant="primary" size="lg">
            Join QueerPulse
          </Button>
        </div>
      </section>

      {flagVenue !== null && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFlagVenue(null);
          }}
        >
          <div className={styles.modal}>
            <button type="button" className={styles.modalX} onClick={() => setFlagVenue(null)}>
              ×
            </button>
            {flagDone ? (
              <div className={styles.success}>
                <div className={styles.sucIcon}>
                  <Check />
                </div>
                <h2>
                  Flag <em>received.</em>
                </h2>
                <p>
                  Thank you. We'll follow up with the venue and update the listing within
                  two weeks.
                </p>
                <Button type="button" variant="ghost" onClick={() => setFlagVenue(null)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.modalTitle}>Flag an accessibility issue</div>
                <p className={styles.modalSub}>
                  Tell us what you experienced. We'll follow up with the venue and update
                  the listing. Your name is not shared with the venue.
                </p>
                <div className={styles.fields}>
                  <div>
                    <label className={styles.fieldLabel}>Venue</label>
                    <input className={styles.input} type="text" value={flagVenue} readOnly />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Type of issue</label>
                    <select className={styles.select} defaultValue="">
                      <option value="">Select…</option>
                      {FLAG_ISSUES.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>What happened</label>
                    <textarea className={styles.textarea} rows={3} placeholder="Describe what you experienced. Be specific — it helps us follow up accurately." />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>When did this happen?</label>
                    <input className={styles.input} type="text" placeholder="Approximate date or event name" />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <Button type="button" variant="primary" onClick={() => setFlagDone(true)}>
                    Submit flag
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setFlagVenue(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {accomOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setAccomOpen(false);
          }}
        >
          <div className={styles.modal}>
            <button type="button" className={styles.modalX} onClick={() => setAccomOpen(false)}>
              ×
            </button>
            {accomDone ? (
              <div className={styles.success}>
                <div className={styles.sucIcon}>
                  <Check />
                </div>
                <h2>
                  Request <em>sent.</em>
                </h2>
                <p>
                  We'll confirm what we can arrange, usually within 48 hours. Thank you for
                  letting us know.
                </p>
                <Button type="button" variant="ghost" onClick={() => setAccomOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.modalTitle}>Request accommodations</div>
                <p className={styles.modalSub}>
                  Tell us what you need for an upcoming QueerPulse event. We'll confirm what
                  we can arrange and be honest about what we can't.
                </p>
                <div className={styles.fields}>
                  <div>
                    <label className={styles.fieldLabel}>Your name</label>
                    <input className={styles.input} type="text" placeholder="First name or nickname" />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Event (if specific)</label>
                    <input className={styles.input} type="text" placeholder="Event name or date, or 'all upcoming events'" />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>What you need</label>
                    <textarea className={styles.textarea} rows={4} placeholder="Tell us what would make the event accessible for you. You don't need to justify it or share your diagnosis — just describe what you need." />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>How to reach you</label>
                    <input className={styles.input} type="text" placeholder="Email or QueerPulse username" />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <Button type="button" variant="primary" onClick={() => setAccomDone(true)}>
                    Send request
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setAccomOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

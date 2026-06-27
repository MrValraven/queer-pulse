import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import styles from "./ChangelogPage.module.css";

type Type = "feature" | "community" | "fix" | "policy" | "magazine";

interface Entry {
  type: Type;
  date: string;
  badge: string;
  title: string;
  body: string;
  tag?: string;
}
interface YearBlock {
  year: string;
  entries: Entry[];
}

const DATA: YearBlock[] = [
  { year: "2026", entries: [
    { type: "community", date: "June 2026", badge: "Community", title: "Notifications centre launched", body: "Members can now see all activity — messages, event confirmations, reading group invitations, magazine issues, and platform announcements — in one place. Filterable by type. Mark as read individually or all at once. Preferences managed via Newsletter settings.", tag: "See notifications →" },
    { type: "magazine", date: "June 2026", badge: "Magazine", title: "Magazine expanded — Reviews, Essays, Community Life sections added", body: "QueerPulse Magazine now has dedicated sections for Essays, Reviews (book, film, venue), and Community Life alongside existing Features and Interviews. Each section has its own nav anchor. Articles open in a full reading view with drop caps, pull quotes, and related articles.", tag: "See magazine →" },
    { type: "feature", date: "June 2026", badge: "Feature", title: "EN ↔ PT language toggle", body: "The platform now supports Portuguese throughout. Toggle between English and Portuguese using the PT/EN button in the nav. Language preference is saved across sessions. All UI, navigation, and labels translate; long-form editorial content remains in its original language." },
    { type: "community", date: "May 2026", badge: "Community", title: "Sliding scale introduced for all paid gatherings", body: "Following a forum discussion with 23 participating members, the advisory council agreed to make sliding scale pricing mandatory for all paid events on the platform. Hosts set a standard price; members request the lower rate privately. No one is asked to justify their choice.", tag: "Decision log →" },
    { type: "policy", date: "May 2026", badge: "Policy", title: "Q2 2026 financial report published", body: "Quarterly finances are now public: total income, expenditure by category, surplus, and operational reserve progress. Each line item is expandable with granular breakdowns. Partner organisations and restrictions disclosed in full.", tag: "See finances →" },
    { type: "feature", date: "April 2026", badge: "Feature", title: "Forum launched", body: "A long-form discussion space for the community. Thread categories include Housing, Resources, Activism & Proposals, Queer Life, and Platform suggestions. Moderation guidelines co-designed with 12 community members over three weeks. Proposals posted here are reviewed by the advisory council.", tag: "Visit forum →" },
    { type: "policy", date: "March 2026", badge: "Policy", title: "Visibility defaults made more conservative", body: "New members previously defaulted to \"open\" visibility. Following feedback that this caused anxiety for some members, new accounts now default to \"network only\". Members can open up when they're ready in Settings." },
    { type: "feature", date: "February 2026", badge: "Feature", title: "PT/EN language toggle (first version)", body: "First version of the PT language toggle, covering navigation and key UI strings. Following member requests that the English-only interface was exclusionary. Full editorial translation in progress." },
  ] },
  { year: "2025", entries: [
    { type: "community", date: "December 2025", badge: "Community", title: "Barter Exchange relaunched with bundles and reviews", body: "The barter board now supports multi-session skill packages and allows members to leave reviews for completed exchanges. The trust system has been running for 18 months. 6 grants were awarded this quarter.", tag: "Barter board →" },
    { type: "feature", date: "September 2025", badge: "Feature", title: "Reading Groups — filtering and start-your-own", body: "Members can now filter reading groups by genre and format. Any member can list a new group. Groups cap at 6–8 members by default. The reading groups section has become one of the most active parts of the platform.", tag: "Reading groups →" },
    { type: "community", date: "January 2025", badge: "Community", title: "Mental health fund launched", body: "A fund for subsidised therapy access, funded by community contributions and a grant from Fundação Calouste Gulbenkian. Applications are confidential. 40+ members supported since launch.", tag: "Mental health →" },
  ] },
  { year: "2024", entries: [
    { type: "policy", date: "March 2024", badge: "Policy", title: "Advisory council formed", body: "The community voted in the first advisory council: Mariana Loução (chair), Raquel Baptista, Catarina Vaz, and Jonas Ferreira. The council reviews moderation appeals, proposes platform changes, and serves as an accountability layer. Members serve one-year terms and can be removed by community vote.", tag: "Advisory council →" },
    { type: "magazine", date: "September 2023", badge: "Magazine", title: "QueerPulse Magazine — Issue 1", body: "The magazine launched with eight articles. No advertising. Published on the first of the month. Contributors are paid. The magazine has published monthly ever since.", tag: "Read the magazine →" },
    { type: "feature", date: "February 2023", badge: "Feature", title: "QueerPulse v1.0 — platform launches", body: "Built in three weeks. Profiles, a message board, a housing section. 60 members from the original WhatsApp group. Invite-only from day one. The platform has been invite-only ever since and will remain so." },
  ] },
];

const FILTERS: { id: Type | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "feature", label: "Features" },
  { id: "community", label: "Community" },
  { id: "fix", label: "Fixes" },
  { id: "policy", label: "Policy" },
  { id: "magazine", label: "Magazine" },
];

function EntrySkeleton() {
  // Mirrors a real .entry row: 120px date column + title/body block.
  return (
    <div className={styles.entry} aria-hidden>
      <SkeletonLine width={90} height={13} style={{ marginTop: 3 }} />
      <div>
        <div className={styles.entryHead}>
          <SkeletonLine width={72} height={18} style={{ borderRadius: 6 }} />
          <SkeletonLine width="50%" height={16} />
        </div>
        <SkeletonLine width="100%" height={14.5} style={{ marginTop: 8 }} />
        <SkeletonLine width="92%" height={14.5} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

export function ChangelogPage() {
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState<Type | "all">("all");

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={`wrap ${styles.wrap}`}>
          <div className={styles.header}>
            <div className={styles.eye}>Platform changelog</div>
            <h1 className={styles.title}>
              What's <em>changed,</em>
              <br />
              and when.
            </h1>
            <p className={styles.sub}>
              Every update to QueerPulse, in reverse order. We publish changes here so
              you always know what's different and why. Nothing happens without a record.
            </p>
          </div>

          <div className={styles.filter}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={[styles.chip, filter === f.id && styles.chipActive].filter(Boolean).join(" ")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.yearBlock}>
              <div className={styles.year} aria-hidden>
                <SkeletonLine width={120} height={32} />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <EntrySkeleton key={i} />
              ))}
            </div>
          ) : (
            (() => {
              let row = 0;
              return DATA.map((yb) => {
                const entries = yb.entries.filter((e) => filter === "all" || e.type === filter);
                if (entries.length === 0) return null;
                return (
                  <div className={styles.yearBlock} key={yb.year}>
                    <div className={styles.year}>
                      <em>{yb.year}</em>
                    </div>
                    {entries.map((e, i) => (
                      <FadeIn className={styles.entry} key={i} delay={Math.min(row++, 8) * 60}>
                        <div className={styles.date}>{e.date}</div>
                        <div>
                          <div className={styles.entryHead}>
                            <span className={`${styles.badge} ${styles[e.type]}`}>{e.badge}</span>
                            <div className={styles.entryTitle}>{e.title}</div>
                          </div>
                          <div className={styles.entryBody}>
                            <p>{e.body}</p>
                          </div>
                          {e.tag && <span className={styles.tag}>{e.tag}</span>}
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </PageShell>
  );
}

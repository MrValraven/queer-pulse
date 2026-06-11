import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./NewsletterPage.module.css";

const SETTINGS = routes.settings;

interface Pref {
  id: string;
  title: string;
  sub: string;
  freq: string;
  checked: boolean;
  disabled?: boolean;
}
interface Section {
  title: string;
  prefs: Pref[];
}

const INITIAL: Section[] = [
  { title: "Magazine", prefs: [
    { id: "mag-issue", title: "Monthly magazine issue", sub: "A full issue email on the first of every month — cover story, links to all articles, letters from the editors.", freq: "Monthly · 1st of the month", checked: true },
    { id: "mag-picks", title: "Editor's picks", sub: "When an article gets a strong community response, we'll send it to you mid-month. No more than twice a month.", freq: "Occasional · up to 2× per month", checked: true },
  ] },
  { title: "Events & gatherings", prefs: [
    { id: "ev-confirm", title: "Event confirmations & reminders", sub: "Confirmation when you RSVP, plus a reminder 48 hours before each event you're attending.", freq: "Transactional · per RSVP", checked: true },
    { id: "ev-near", title: "New events near you", sub: "A weekly digest of new events and gatherings listed in the past seven days. Only if you've saved location preferences.", freq: "Weekly · Thursdays", checked: false },
    { id: "ev-reading", title: "Reading group activity", sub: "Updates from reading groups you're a member of — new sessions, books selected, messages from the group organiser.", freq: "As activity happens", checked: true },
  ] },
  { title: "Community & network", prefs: [
    { id: "com-announce", title: "Community announcements", sub: "Major community news — new features, governance decisions, significant platform changes. Sent only when something important happens.", freq: "Occasional · never more than weekly", checked: true },
    { id: "com-connect", title: "Connection requests & messages", sub: "Email notifications when someone sends you a connection request or a message. Can also be managed via in-app notifications.", freq: "Per event", checked: true },
    { id: "com-forum", title: "Forum mentions & replies", sub: "When someone replies to your forum post or mentions you in a thread.", freq: "Per event", checked: false },
  ] },
  { title: "Safety & account", prefs: [
    { id: "safe-alerts", title: "Safety alerts", sub: "Critical alerts about your account — password changes, unusual activity, or community safety notices. These cannot be turned off and we will only send them when genuinely necessary.", freq: "Urgent · cannot be disabled", checked: true, disabled: true },
    { id: "safe-report", title: "Quarterly community report", sub: "The community health and financial report published every quarter. Contains moderation statistics, platform finances, and governance updates.", freq: "Quarterly", checked: true },
  ] },
];

export function NewsletterPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<Section[]>(INITIAL);

  const toggle = (si: number, pi: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === si
          ? { ...s, prefs: s.prefs.map((p, j) => (j === pi ? { ...p, checked: !p.checked } : p)) }
          : s,
      ),
    );
  };

  const unsubAll = () => {
    setSections((prev) =>
      prev.map((s) => ({ ...s, prefs: s.prefs.map((p) => (p.disabled ? p : { ...p, checked: false })) })),
    );
    showToast("Unsubscribed from all optional emails", "success");
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={`wrap ${styles.wrap}`}>
          <div className={styles.header}>
            <div className={styles.eye}>Email preferences</div>
            <h1 className={styles.title}>
              What we <em>send you,</em>
              <br />
              and when.
            </h1>
            <p className={styles.sub}>
              You control everything. Toggle off anything you don't want. Safety alerts
              are the only emails we'll ever send regardless of your settings — and only
              if something urgent affects your account.
            </p>
          </div>

          <div className={styles.account}>
            <div>
              <div className={styles.accountLabel}>Sending to</div>
              <div className={styles.email}>member@email.pt</div>
            </div>
            <Link to={SETTINGS} className={styles.edit}>
              Change email →
            </Link>
          </div>

          {sections.map((s, si) => (
            <div className={styles.section} key={s.title}>
              <div className={styles.sectionTitle}>{s.title}</div>
              {s.prefs.map((p, pi) => (
                <div className={styles.toggleRow} key={p.id}>
                  <div className={styles.trBody}>
                    <div className={styles.trTitle}>{p.title}</div>
                    <div className={styles.trSub}>{p.sub}</div>
                    <div className={styles.trFreq}>{p.freq}</div>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={p.checked}
                      disabled={p.disabled}
                      onChange={() => !p.disabled && toggle(si, pi)}
                    />
                    <div className={styles.track}>
                      <div className={styles.thumb} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.save}>
            <button type="button" className={styles.saveBtn} onClick={() => showToast("Preferences saved ✓", "success")}>
              Save preferences
            </button>
            <div className={styles.saveNote}>
              Changes take effect immediately. You may still receive emails already
              queued.
            </div>
          </div>

          <div className={styles.unsubStrip}>
            <div className={styles.unsubTitle}>Unsubscribe from everything</div>
            <div className={styles.unsubText}>
              This turns off all optional emails at once, except safety alerts. You can
              re-enable individual categories above at any time.
            </div>
            <button type="button" className={styles.unsubBtn} onClick={unsubAll}>
              Unsubscribe from all emails
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

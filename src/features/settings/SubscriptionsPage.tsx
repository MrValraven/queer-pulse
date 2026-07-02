import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  NEWSLETTERS,
  JOB_ALERTS,
  PRONOUN_VISIBILITY,
  type JobAlert,
} from "./subscriptions.data";
import { AlertBuilderModal, type AlertDraft } from "./AlertBuilderModal";
import { SaveButton } from "./SaveButton";
import {
  NewsletterSection,
  JobAlertsSection,
  PronounSection,
  alertFromDraft,
  draftFromAlert,
} from "./SubscriptionsSections";
import styles from "./SubscriptionsPage.module.css";

export function SubscriptionsPage() {
  const { showToast } = useToast();
  const [nlOn, setNlOn] = useState<Record<string, boolean>>(
    Object.fromEntries(NEWSLETTERS.map((n) => [n.id, n.defaultOn])),
  );
  const [removedAlerts, setRemovedAlerts] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<JobAlert[]>(JOB_ALERTS);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertDraft | null>(null);
  const [selectedPronouns, setSelectedPronouns] = useState<Set<string>>(
    new Set(["he/him"]),
  );
  const [pronVis, setPronVis] = useState<Record<string, boolean>>(
    Object.fromEntries(PRONOUN_VISIBILITY.map((p) => [p.id, p.defaultOn])),
  );

  function removeAlert(id: string) {
    setRemovedAlerts((prev) => new Set(prev).add(id));
    showToast("Alert removed", "info");
  }

  function saveAlert(draft: AlertDraft) {
    setAlerts((prev) => {
      const exists = prev.some((a) => a.id === draft.id);
      const next = alertFromDraft(draft);
      return exists
        ? prev.map((a) => (a.id === draft.id ? next : a))
        : [...prev, next];
    });
  }

  const visibleAlerts = alerts.filter((a) => !removedAlerts.has(a.id));

  function togglePronoun(p: string) {
    setSelectedPronouns((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.settings} className={styles.back}>
          ← Settings
        </Link>
        <div className={styles.eyebrow}>
          Settings · subscriptions, alerts &amp; pronouns
        </div>
        <h1 className={styles.h1}>
          What we send · <em>how you appear.</em>
        </h1>
        <p className={styles.lead}>
          Three small, surgical controls. <em>Each opt-in is real</em> — turning
          off a newsletter means we never send it, not "less of it". Pronouns
          are the same: visible exactly where you choose, never inferred.
        </p>

        <NewsletterSection nlOn={nlOn} setNlOn={setNlOn} />

        <JobAlertsSection
          visibleAlerts={visibleAlerts}
          onEdit={(alert) => setEditingAlert(draftFromAlert(alert))}
          onRemove={removeAlert}
          onCreate={() => setBuilderOpen(true)}
        />

        <PronounSection
          selectedPronouns={selectedPronouns}
          togglePronoun={togglePronoun}
          pronVis={pronVis}
          setPronVis={setPronVis}
        />

        <div className={styles.saveRow}>
          <span className={styles.saveInfo}>
            Last saved <b>14 May 2026</b> · all changes saved automatically
          </span>
          <SaveButton onSave={() => showToast("Settings saved", "success")} />
        </div>

        <div className={styles.pitchNote}>
          <b>Want to write for the podcast or magazine?</b> Pitches are read by
          the editorial team, not auto-filtered.{" "}
          <Link to={routes.submitStory}>Pitch a story →</Link>
          {" · "}
          <Link to={routes.contact}>Pitch yourself for The Back Room →</Link>
        </div>
      </div>

      {builderOpen && (
        <AlertBuilderModal
          onClose={() => setBuilderOpen(false)}
          onSave={saveAlert}
        />
      )}
      {editingAlert && (
        <AlertBuilderModal
          initial={editingAlert}
          onClose={() => setEditingAlert(null)}
          onSave={saveAlert}
        />
      )}
    </AppShell>
  );
}

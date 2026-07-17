import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  buildNewsletters,
  buildJobAlerts,
  buildPronounVisibility,
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

const LAST_SAVED_DATE = new Date(2026, 4, 14); // 14 May 2026

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const newsletters = useMemo(() => buildNewsletters(t), [t]);
  const jobAlerts = useMemo(() => buildJobAlerts(), []);
  const pronounVisibility = useMemo(() => buildPronounVisibility(t), [t]);
  const [nlOn, setNlOn] = useState<Record<string, boolean>>(
    Object.fromEntries(newsletters.map((nl) => [nl.id, nl.defaultOn])),
  );
  const [removedAlerts, setRemovedAlerts] = useState<Set<string>>(new Set());
  const [alerts, setAlerts] = useState<JobAlert[]>(jobAlerts);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertDraft | null>(null);
  const [selectedPronouns, setSelectedPronouns] = useState<Set<string>>(
    new Set(["he/him"]),
  );
  const [pronVis, setPronVis] = useState<Record<string, boolean>>(
    Object.fromEntries(pronounVisibility.map((p) => [p.id, p.defaultOn])),
  );

  function removeAlert(id: string) {
    setRemovedAlerts((prev) => new Set(prev).add(id));
    showToast(t("settings:subscriptions.alert.removedToast"), "info");
  }

  function saveAlert(draft: AlertDraft) {
    setAlerts((prev) => {
      const exists = prev.some((alert) => alert.id === draft.id);
      const next = alertFromDraft(draft, t);
      return exists
        ? prev.map((alert) => (alert.id === draft.id ? next : alert))
        : [...prev, next];
    });
  }

  const visibleAlerts = alerts.filter((alert) => !removedAlerts.has(alert.id));

  function togglePronoun(pronoun: string) {
    setSelectedPronouns((prev) => {
      const next = new Set(prev);
      if (next.has(pronoun)) next.delete(pronoun);
      else next.add(pronoun);
      return next;
    });
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.settings} className={styles.back}>
          {t("settings:subscriptions.page.backLink")}
        </Link>
        <div className={styles.eyebrow}>
          {t("settings:subscriptions.page.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="settings:subscriptions.page.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="settings:subscriptions.page.lead"
            components={{ em: <em /> }}
          />
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
            <Translation
              i18nKey="settings:subscriptions.page.lastSaved"
              values={{ date: fmt.date(LAST_SAVED_DATE) }}
              components={{ b: <b /> }}
            />
          </span>
          <SaveButton
            onSave={() =>
              showToast(t("settings:subscriptions.page.savedToast"), "success")
            }
          />
        </div>

        <div className={styles.pitchNote}>
          <Translation
            i18nKey="settings:subscriptions.page.pitchNote"
            components={{ b: <b /> }}
          />{" "}
          <Link to={routes.submitStory}>
            {t("settings:subscriptions.page.pitchStory")}
          </Link>
          {" · "}
          <Link to={routes.contact}>
            {t("settings:subscriptions.page.pitchBackRoom")}
          </Link>
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

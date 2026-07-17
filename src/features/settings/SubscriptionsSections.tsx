import { useMemo, type Dispatch, type SetStateAction } from "react";
import { FiBell } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import {
  buildNewsletters,
  buildPronounVisibility,
  PRONOUN_OPTIONS,
  type JobAlert,
} from "./subscriptions.data";
import { type AlertDraft } from "./AlertBuilderModal";
import styles from "./SubscriptionsPage.module.css";

const iconVariantClass: Record<"coral" | "jade" | "plum", string | undefined> =
  {
    coral: "",
    jade: styles.nlIcJade,
    plum: styles.nlIcPlum,
  };

export function NewsletterSection({
  nlOn,
  setNlOn,
}: {
  nlOn: Record<string, boolean>;
  setNlOn: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const { t } = useTranslation();
  const newsletters = useMemo(() => buildNewsletters(t), [t]);

  return (
    <>
      <div className={styles.sectionH}>
        {t("settings:subscriptions.newsletter.sectionHeading", {
          count: newsletters.length,
        })}
      </div>
      {newsletters.map((nl) => (
        <div
          key={nl.id}
          className={`${styles.nlCard} ${nlOn[nl.id] ? styles.nlCardSub : ""}`}
        >
          <div className={`${styles.nlIc} ${iconVariantClass[nl.iconVariant]}`}>
            {nl.icon}
          </div>
          <div className={styles.nlInfo}>
            <b>{nl.name}</b>
            <span>{nl.freq}</span>
            <div className={styles.nlMeta}>{nl.meta}</div>
          </div>
          <label className={styles.toggleSw}>
            <input
              type="checkbox"
              checked={nlOn[nl.id]}
              onChange={(e) =>
                setNlOn((prev) => ({ ...prev, [nl.id]: e.target.checked }))
              }
            />
            <div className={styles.toggleTrack} />
            <div className={styles.toggleThumb} />
          </label>
        </div>
      ))}
    </>
  );
}

export function JobAlertsSection({
  visibleAlerts,
  onEdit,
  onRemove,
  onCreate,
}: {
  visibleAlerts: JobAlert[];
  onEdit: (alert: JobAlert) => void;
  onRemove: (id: string) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <>
      <div className={styles.sectionH}>
        {t("settings:subscriptions.jobAlerts.sectionHeading")}
      </div>
      {visibleAlerts.length === 0 && (
        <EmptyState
          icon={<FiBell />}
          title={t("settings:subscriptions.jobAlerts.empty.title")}
          description={t("settings:subscriptions.jobAlerts.empty.desc")}
          action={{
            label: t("settings:subscriptions.jobAlerts.empty.cta"),
            onClick: onCreate,
          }}
        />
      )}
      {visibleAlerts.map((alert) => (
        <div key={alert.id} className={styles.alertCard}>
          <div className={styles.alertHead}>
            <div className={styles.alertIc}>{alert.ic}</div>
            <div className={styles.alertInfo}>
              <b>{alert.title}</b>
              <span>{alert.desc}</span>
            </div>
            <div className={styles.alertActions}>
              <Button
                variant="ghost"
                className={styles.alertAction}
                onClick={() => onEdit(alert)}
              >
                {t("settings:subscriptions.jobAlerts.edit")}
              </Button>
              <Button
                variant="ghost"
                className={`${styles.alertAction} ${styles.alertActionDanger}`}
                onClick={() => onRemove(alert.id)}
              >
                {t("settings:subscriptions.jobAlerts.delete")}
              </Button>
            </div>
          </div>
          <div className={styles.alertCriteria}>
            {alert.criteria.map((criterion, index) => (
              <span key={index} className={styles.critChip}>
                {criterion.label}
              </span>
            ))}
          </div>
          <div className={styles.alertRow}>
            <span>{t("settings:subscriptions.jobAlerts.statusLabel")}</span>
            <span className={styles.live}>
              {t("settings:subscriptions.jobAlerts.statusLive", {
                frequency: t(
                  `settings:subscriptions.alertBuilder.frequency.${alert.frequencyId}`,
                ),
              })}
            </span>
          </div>
          <div className={styles.alertRow}>
            <span>{t("settings:subscriptions.jobAlerts.matchesLabel")}</span>
            <b>
              {alert.matches === null
                ? t("settings:subscriptions.jobAlerts.matchesNew_other", {
                    count: 0,
                  })
                : t("settings:subscriptions.jobAlerts.matchesNew", {
                    count: alert.matches,
                  })}
            </b>
          </div>
          <div className={styles.alertRow}>
            <span>{t("settings:subscriptions.jobAlerts.lastSentLabel")}</span>
            <b>
              {alert.lastSent
                ? `${fmt.date(alert.lastSent, { weekday: "short", day: "numeric", month: "short" })} · ${fmt.time(alert.lastSent)}`
                : t("settings:subscriptions.jobAlerts.lastSentNotSentYet")}
            </b>
          </div>
        </div>
      ))}
      <Button variant="ghost" className={styles.addCard} onClick={onCreate}>
        {t("settings:subscriptions.jobAlerts.createCta")}
      </Button>
    </>
  );
}

export function PronounSection({
  selectedPronouns,
  togglePronoun,
  pronVis,
  setPronVis,
}: {
  selectedPronouns: Set<string>;
  togglePronoun: (pronoun: string) => void;
  pronVis: Record<string, boolean>;
  setPronVis: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const { t } = useTranslation();
  const pronounVisibility = useMemo(() => buildPronounVisibility(t), [t]);

  return (
    <>
      <div className={styles.sectionH}>
        {t("settings:subscriptions.pronouns.sectionHeading")}
      </div>
      <div className={styles.pronCard}>
        <div className={styles.pronCurrent}>
          <Translation
            i18nKey="settings:subscriptions.pronouns.currentlyUsing"
            values={{ pronoun: "he/him" }}
            components={{ b: <b /> }}
          />
        </div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--plum)",
            marginBottom: 10,
          }}
        >
          {t("settings:subscriptions.pronouns.pickOneOrMore")}
        </h4>
        <div className={styles.pronGrid}>
          {PRONOUN_OPTIONS.map((pronoun) => (
            <div
              key={pronoun}
              className={`${styles.pronChip} ${selectedPronouns.has(pronoun) ? styles.pronChipSelected : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedPronouns.has(pronoun)}
              onClick={() => togglePronoun(pronoun)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePronoun(pronoun);
                }
              }}
            >
              {pronoun.includes("/") ? (
                <>
                  {pronoun.split("/")[0]}
                  <em>/</em>
                  {pronoun.split("/")[1]}
                </>
              ) : (
                pronoun
              )}
            </div>
          ))}
        </div>
        <div className={styles.pronCustom}>
          <input
            className={styles.pronInput}
            type="text"
            placeholder={t("settings:subscriptions.pronouns.customPlaceholder")}
          />
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-40)",
            marginTop: 10,
            lineHeight: 1.55,
          }}
        >
          <Translation
            i18nKey="settings:subscriptions.pronouns.customHint"
            components={{ em: <em /> }}
          />
        </p>
      </div>

      <div className={styles.pronCard}>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--plum)",
            marginBottom: 14,
          }}
        >
          {t("settings:subscriptions.pronouns.whereTheyShow")}
        </h4>
        {pronounVisibility.map((visibilityOption) => (
          <div key={visibilityOption.id} className={styles.pronVisRow}>
            <div className="lbl">
              <b>{visibilityOption.label}</b>
              <span>{visibilityOption.desc}</span>
            </div>
            <label className={styles.toggleSw}>
              <input
                type="checkbox"
                checked={pronVis[visibilityOption.id]}
                disabled={visibilityOption.disabled}
                onChange={(e) =>
                  setPronVis((prev) => ({
                    ...prev,
                    [visibilityOption.id]: e.target.checked,
                  }))
                }
              />
              <div
                className={styles.toggleTrack}
                style={
                  visibilityOption.disabled
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : undefined
                }
              />
              <div className={styles.toggleThumb} />
            </label>
          </div>
        ))}
      </div>
    </>
  );
}

/** Build a JobAlert card record from a saved-search draft. */
export function alertFromDraft(draft: AlertDraft, t: TFunction): JobAlert {
  return {
    id: draft.id,
    ic: (draft.title.trim()[0] ?? "A").toUpperCase(),
    title: draft.title,
    desc: (
      <>
        {t("settings:subscriptions.jobAlerts.statusLive", {
          frequency: t(
            `settings:subscriptions.alertBuilder.frequency.${draft.frequencyId}`,
          ),
        })}
      </>
    ),
    criteria: [
      {
        label: (
          <Translation
            i18nKey="settings:subscriptions.jobAlerts.criteria.title"
            values={{ value: draft.keywords }}
            components={{ b: <b /> }}
          />
        ),
      },
      {
        label: (
          <Translation
            i18nKey="settings:subscriptions.jobAlerts.criteria.location"
            values={{
              value: t(
                `settings:subscriptions.alertBuilder.location.${draft.location}`,
              ),
            }}
            components={{ b: <b /> }}
          />
        ),
      },
      ...(draft.minSalary
        ? [
            {
              label: (
                <Translation
                  i18nKey="settings:subscriptions.jobAlerts.criteria.minSalary"
                  values={{ value: draft.minSalary }}
                  components={{ b: <b /> }}
                />
              ),
            },
          ]
        : []),
    ],
    frequencyId: draft.frequencyId,
    matches: null,
    lastSent: null,
  };
}

/** Reverse a JobAlert card into an editable draft (best-effort, mock data). */
export function draftFromAlert(alert: JobAlert): AlertDraft {
  return {
    id: alert.id,
    title: alert.title,
    keywords: "",
    location: "lisbon",
    minSalary: "",
    frequencyId: alert.frequencyId,
  };
}

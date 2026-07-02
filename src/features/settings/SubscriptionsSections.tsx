import { type Dispatch, type SetStateAction } from "react";
import { FiBell } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import {
  NEWSLETTERS,
  PRONOUN_OPTIONS,
  PRONOUN_VISIBILITY,
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
  return (
    <>
      <div className={styles.sectionH}>Newsletter streams · 3 available</div>
      {NEWSLETTERS.map((nl) => (
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
  onEdit: (a: JobAlert) => void;
  onRemove: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className={styles.sectionH}>Saved searches &amp; job alerts</div>
      {visibleAlerts.length === 0 && (
        <EmptyState
          icon={<FiBell />}
          title="No alerts yet"
          description="Save a search and we'll quietly let you know when something matching it comes up — no inbox noise, only what you asked for."
          action={{ label: "Set one up", onClick: onCreate }}
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
                Edit
              </Button>
              <Button
                variant="ghost"
                className={`${styles.alertAction} ${styles.alertActionDanger}`}
                onClick={() => onRemove(alert.id)}
              >
                Delete
              </Button>
            </div>
          </div>
          <div className={styles.alertCriteria}>
            {alert.criteria.map((c, i) => (
              <span key={i} className={styles.critChip}>
                {c.label}
              </span>
            ))}
          </div>
          <div className={styles.alertRow}>
            <span>Status</span>
            <span className={styles.live}>{alert.status}</span>
          </div>
          <div className={styles.alertRow}>
            <span>Matches in last week</span>
            <b>{alert.matches}</b>
          </div>
          <div className={styles.alertRow}>
            <span>Last sent</span>
            <b>{alert.lastSent}</b>
          </div>
        </div>
      ))}
      <Button variant="ghost" className={styles.addCard} onClick={onCreate}>
        + Create a new alert
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
  togglePronoun: (p: string) => void;
  pronVis: Record<string, boolean>;
  setPronVis: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <>
      <div className={styles.sectionH}>
        Pronouns · how you appear across QueerPulse
      </div>
      <div className={styles.pronCard}>
        <div className={styles.pronCurrent}>
          Currently using{" "}
          <b>
            he<em>/</em>him
          </b>{" "}
          on your profile · shown next to your name in all member-facing
          surfaces
        </div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--plum)",
            marginBottom: 10,
          }}
        >
          Pick one or more
        </h4>
        <div className={styles.pronGrid}>
          {PRONOUN_OPTIONS.map((p) => (
            <div
              key={p}
              className={`${styles.pronChip} ${selectedPronouns.has(p) ? styles.pronChipSelected : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedPronouns.has(p)}
              onClick={() => togglePronoun(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePronoun(p);
                }
              }}
            >
              {p.includes("/") ? (
                <>
                  {p.split("/")[0]}
                  <em>/</em>
                  {p.split("/")[1]}
                </>
              ) : (
                p
              )}
            </div>
          ))}
        </div>
        <div className={styles.pronCustom}>
          <input
            className={styles.pronInput}
            type="text"
            placeholder="Or write your own · e.g. xe/xem · zie/hir"
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
          Use commas to add multiple, separated by season or context if you'd
          like. <em>e.g. he/him (formal), they/them (close friends)</em>.
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
          Where they show
        </h4>
        {PRONOUN_VISIBILITY.map((pv) => (
          <div key={pv.id} className={styles.pronVisRow}>
            <div className="lbl">
              <b>{pv.label}</b>
              <span>{pv.desc}</span>
            </div>
            <label className={styles.toggleSw}>
              <input
                type="checkbox"
                checked={pronVis[pv.id]}
                disabled={pv.disabled}
                onChange={(e) =>
                  setPronVis((prev) => ({
                    ...prev,
                    [pv.id]: e.target.checked,
                  }))
                }
              />
              <div
                className={styles.toggleTrack}
                style={
                  pv.disabled
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
export function alertFromDraft(d: AlertDraft): JobAlert {
  return {
    id: d.id,
    ic: (d.title.trim()[0] ?? "A").toUpperCase(),
    title: d.title,
    desc: <>Matching jobs sent · {d.frequency.toLowerCase()}</>,
    criteria: [
      {
        label: (
          <>
            Title: <b>{d.keywords}</b>
          </>
        ),
      },
      {
        label: (
          <>
            Location: <b>{d.location}</b>
          </>
        ),
      },
      ...(d.minSalary
        ? [
            {
              label: (
                <>
                  Min salary: <b>{d.minSalary}</b>
                </>
              ),
            },
          ]
        : []),
    ],
    status: `Live · ${d.frequency.toLowerCase()}`,
    matches: "New",
    lastSent: "Not sent yet",
  };
}

/** Reverse a JobAlert card into an editable draft (best-effort, mock data). */
export function draftFromAlert(a: JobAlert): AlertDraft {
  return {
    id: a.id,
    title: a.title,
    keywords: "",
    location: "Lisbon",
    minSalary: "",
    frequency: "Weekly digest",
  };
}

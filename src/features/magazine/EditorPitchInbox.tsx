import {
  PITCHES,
  PITCH_TOTAL,
  type Pitch,
  type TriageVerdict,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

const TINT_CLASS = {
  coral: styles.tintCoral,
  jade: styles.tintJade,
  plum: styles.tintPlum,
} as const;

const HIDDEN = PITCH_TOTAL - PITCHES.length;

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Pitch triage inbox — quick Yes/Maybe/No + checkbox select for bulk. */
export function EditorPitchInbox({
  pitches,
  query,
  selected,
  leaving,
  onToggleSelect,
  onTriage,
  onShowMore,
}: {
  pitches: Pitch[];
  query: string;
  selected: Set<string>;
  leaving: Set<string>;
  onToggleSelect: (id: string) => void;
  onTriage: (id: string, verdict: TriageVerdict) => void;
  onShowMore: () => void;
}) {
  return (
    <section className={styles.sec}>
      <h2 className={styles.secH2}>
        <span>
          Pitch inbox · <em>{PITCH_TOTAL}</em>
        </span>
        <span className={styles.ct}>
          avg response 6 days · triage in bulk ↓
        </span>
      </h2>
      <div className={styles.pieces}>
        {pitches.length === 0 ? (
          <div className={cx(styles.empty, styles.small)}>
            <b>No pitches match “{query}”</b>
          </div>
        ) : (
          <>
            <div className={styles.pitchBody}>
              {pitches.map((p) => (
                <PitchRow
                  key={p.id}
                  pitch={p}
                  selected={selected.has(p.id)}
                  leaving={leaving.has(p.id)}
                  onToggleSelect={onToggleSelect}
                  onTriage={onTriage}
                />
              ))}
            </div>
            <div className={styles.pitchFoot}>
              <button type="button" onClick={onShowMore}>
                Show {HIDDEN} more pitches →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PitchRow({
  pitch: p,
  selected,
  leaving,
  onToggleSelect,
  onTriage,
}: {
  pitch: Pitch;
  selected: boolean;
  leaving: boolean;
  onToggleSelect: (id: string) => void;
  onTriage: (id: string, verdict: TriageVerdict) => void;
}) {
  return (
    <div
      className={cx(
        styles.pitchRow,
        selected && styles.sel,
        leaving && styles.leaving,
      )}
      data-pitch-id={p.id}
    >
      <input
        type="checkbox"
        className={styles.pitchCheck}
        checked={selected}
        onChange={() => onToggleSelect(p.id)}
        aria-label={`Select pitch from ${p.name}`}
      />
      <span className={cx(styles.pitchAv, TINT_CLASS[p.tint])}>
        {initials(p.name)}
      </span>
      <div className={styles.pitchInfo}>
        <b>
          {p.name} · {p.title}
          {p.newVoice && <span className={styles.nv}> new voice</span>}
        </b>
        <span>
          {p.kind} · sent {p.when}
        </span>
      </div>
      <div className={styles.pitchQuick}>
        <button
          type="button"
          className={styles.yes}
          onClick={() => onTriage(p.id, "yes")}
        >
          Yes
        </button>
        <button type="button" onClick={() => onTriage(p.id, "maybe")}>
          Maybe
        </button>
        <button
          type="button"
          className={styles.no}
          onClick={() => onTriage(p.id, "no")}
        >
          No
        </button>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import {
  SECTIONS,
  ACTIVITY,
  WORD_TARGET,
  editorLoad,
  loadGap,
  issueProgress,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

function editorDot(ed: Editor): string | undefined {
  return ed === "Marta" ? styles.edMarta : styles.edSara;
}

/** Issue 10 progress: pieces ready, word count, time to close. */
export function ProgressCard({ pieces }: { pieces: Piece[] }) {
  const p = issueProgress(pieces);
  return (
    <div className={styles.sideCard}>
      <h4>Issue 10 progress</h4>
      <div className={styles.issueBar}>
        <div className={styles.issueBarRow}>
          <span>Pieces ready</span>
          <b>
            {p.ready} / {p.total}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${p.readyPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>Word count</span>
          <b>
            {p.words.toLocaleString()} / {WORD_TARGET.toLocaleString()}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${p.wordPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>Time to close</span>
          <b>11 days</b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: "64%" }} />
        </div>
      </div>
    </div>
  );
}

/** Words-per-editor workload with a rebalancing hint. */
export function EditorLoadCard({
  pieces,
  me,
}: {
  pieces: Piece[];
  me: Editor;
}) {
  const rows = editorLoad(pieces, me);
  const max = Math.max(1, ...rows.map((r) => r.words));
  const gap = loadGap(pieces);
  const hint =
    gap > 0
      ? `Sara is carrying ${gap.toLocaleString()} more words. Reassign to balance.`
      : gap < 0
        ? `Marta is carrying ${(-gap).toLocaleString()} more words. Reassign to balance.`
        : "Load is evenly balanced across editors.";

  return (
    <div className={styles.sideCard}>
      <h4>Editor load</h4>
      {rows.map((r) => (
        <div key={r.editor} className={cx(styles.loadRow, r.mine && styles.me)}>
          <div className={styles.loadTop}>
            <b>
              <span className={cx(styles.chipDot, editorDot(r.editor))} />
              {r.editor}
              {r.mine && " · you"}
            </b>
            <span>
              {r.count} pieces · {r.words.toLocaleString()}w
              {r.late > 0 && <em className={styles.ll}> · {r.late} late</em>}
            </span>
          </div>
          <div className={styles.bar}>
            <span style={{ width: `${(r.words / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className={styles.loadHint}>{hint}</div>
    </div>
  );
}

function Dots({ filled, planned }: { filled: number; planned: number }) {
  return (
    <span className={styles.secSlots}>
      {Array.from({ length: planned }).map((_, i) => (
        <span key={i} className={cx(styles.slot, i < filled && styles.on)} />
      ))}
    </span>
  );
}

/** Planned vs filled slots per magazine section. */
export function SectionBudgetCard() {
  const open = SECTIONS.reduce(
    (a, s) => a + Math.max(0, s.planned - s.filled),
    0,
  );
  return (
    <div className={styles.sideCard}>
      <h4>
        Section budget <span className={styles.free}>{open} slots open</span>
      </h4>
      {SECTIONS.map((s) => {
        const gap = s.planned - s.filled;
        return (
          <div
            key={s.name}
            className={cx(styles.secRow, gap > 0 && styles.gap)}
          >
            <span className={styles.secName}>{s.name}</span>
            <Dots filled={s.filled} planned={s.planned} />
            <span className={cx(styles.secCount, gap > 0 && styles.need)}>
              {gap > 0 ? `need ${gap}` : <FiCheck aria-label="filled" />}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Contributor mix, pay status, geography, and live search match. */
export function ContributorMixCard({
  pieces,
  query,
}: {
  pieces: Piece[];
  query: string;
}) {
  const q = query.toLowerCase();
  const match = q
    ? [...new Set(pieces.map((p) => p.author))].filter((a) =>
        a.toLowerCase().includes(q),
      )
    : [];

  return (
    <div className={styles.sideCard}>
      <h4>Contributors · this issue</h4>
      <div className={styles.mixRow}>
        <b>11</b>
        <span>contributors · 8 writers · 2 illustrators · 1 photographer</span>
      </div>
      <div className={styles.mixSplit}>
        <div className={styles.mixCell}>
          <b className={styles.jade}>4</b>
          <span>new voices</span>
        </div>
        <div className={styles.mixCell}>
          <b>7</b>
          <span>returning</span>
        </div>
      </div>
      <div className={styles.pay}>
        <div className={styles.payHead}>Contributor pay</div>
        <div className={styles.payBar}>
          <span
            className={cx(styles.paySeg, styles.paid)}
            style={{ width: "33%" }}
          />
          <span
            className={cx(styles.paySeg, styles.inv)}
            style={{ width: "25%" }}
          />
          <span
            className={cx(styles.paySeg, styles.none)}
            style={{ width: "42%" }}
          />
        </div>
        <div className={styles.payKey}>
          <span>
            <i className={styles.paid} />4 paid
          </span>
          <span>
            <i className={styles.inv} />3 awaiting
          </span>
          <span>
            <i className={styles.none} />5 to invoice
          </span>
        </div>
      </div>
      <div className={styles.geo}>
        Lisbon 6 · Porto 2 · Madrid 1 · Faro 1 · Berlin 1
      </div>
      {q && (
        <div className={styles.contribMatch}>
          {match.length
            ? `Matching: ${match.join(", ")}`
            : "No contributor matches"}
        </div>
      )}
      <Link to={routes.author} className={styles.contribLink}>
        See contributor profiles →
      </Link>
    </div>
  );
}

/** Recent editorial activity feed. */
export function ActivityCard() {
  const dotClass = {
    coral: styles.tCoral,
    jade: styles.tJade,
    plum: styles.tPlum,
  };
  return (
    <div className={styles.sideCard}>
      <h4>Recent activity</h4>
      {ACTIVITY.map((a, i) => (
        <div key={i} className={styles.actRow}>
          <span className={cx(styles.actDot, dotClass[a.tint])} />
          <div>
            <span className={styles.actTxt}>
              <b>{a.who}</b> {a.act} <i>{a.obj}</i>
            </span>
            <span className={styles.actWhen}>{a.when}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Coral quick-actions card. */
export function QuickActionsCard({
  onStub,
}: {
  onStub: (msg: string) => void;
}) {
  return (
    <div className={cx(styles.sideCard, styles.qaCard)}>
      <h4>Quick actions</h4>
      <div className={styles.qa}>
        <button
          type="button"
          onClick={() => onStub("Opening bulk pitch triage")}
        >
          → Send pitch decisions in bulk
        </button>
        <button
          type="button"
          onClick={() => onStub("Drafting reminders to 3 contributors")}
        >
          → Email contributors waiting
        </button>
        <Link to={routes.issue}>→ Preview issue layout</Link>
        <button
          type="button"
          onClick={() => onStub("Contributor list exported (CSV)")}
        >
          → Export contributor list (CSV)
        </button>
      </div>
    </div>
  );
}

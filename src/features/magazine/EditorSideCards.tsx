import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  SECTIONS,
  ACTIVITY,
  WORD_TARGET,
  CURRENT_ISSUE,
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

/** Issue N progress: pieces ready, word count, time to close. */
export function ProgressCard({ pieces }: { pieces: Piece[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const p = issueProgress(pieces);
  return (
    <div className={styles.sideCard}>
      <h4>
        {t("magazine:editor.sideCards.progressHeading", {
          number: CURRENT_ISSUE.number,
        })}
      </h4>
      <div className={styles.issueBar}>
        <div className={styles.issueBarRow}>
          <span>{t("magazine:editor.sideCards.piecesReady")}</span>
          <b>
            {p.ready} / {p.total}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${p.readyPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>{t("magazine:editor.sideCards.wordCount")}</span>
          <b>
            {fmt.number(p.words)} / {fmt.number(WORD_TARGET)}
          </b>
        </div>
        <div className={styles.bar}>
          <span style={{ width: `${p.wordPct}%` }} />
        </div>
        <div className={styles.issueBarRow} style={{ marginTop: 8 }}>
          <span>{t("magazine:editor.sideCards.timeToClose")}</span>
          <b>{t("magazine:editor.sideCards.daysLeft", { count: 11 })}</b>
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
  const { t } = useTranslation();
  const fmt = useFormat();
  const rows = editorLoad(pieces, me);
  const max = Math.max(1, ...rows.map((r) => r.words));
  const gap = loadGap(pieces);
  const hint =
    gap > 0
      ? t("magazine:editor.sideCards.loadHintOtherMore", {
          editor: "Sara",
          amount: fmt.number(gap),
        })
      : gap < 0
        ? t("magazine:editor.sideCards.loadHintOtherMore", {
            editor: "Marta",
            amount: fmt.number(-gap),
          })
        : t("magazine:editor.sideCards.loadHintBalanced");

  return (
    <div className={styles.sideCard}>
      <h4>{t("magazine:editor.sideCards.editorLoadHeading")}</h4>
      {rows.map((r) => (
        <div key={r.editor} className={cx(styles.loadRow, r.mine && styles.me)}>
          <div className={styles.loadTop}>
            <b>
              <span className={cx(styles.chipDot, editorDot(r.editor))} />
              {r.editor}
              {r.mine && ` · ${t("magazine:editor.sideCards.you")}`}
            </b>
            <span>
              {t("magazine:editor.sideCards.piecesWords", {
                count: r.count,
                words: fmt.number(r.words),
              })}
              {r.late > 0 && (
                <em className={styles.ll}>
                  {" "}
                  ·{" "}
                  {t("magazine:editor.sideCards.lateCount", { count: r.late })}
                </em>
              )}
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
  const { t } = useTranslation();
  const open = SECTIONS.reduce(
    (a, s) => a + Math.max(0, s.planned - s.filled),
    0,
  );
  return (
    <div className={styles.sideCard}>
      <h4>
        {t("magazine:editor.sideCards.sectionBudgetHeading")}{" "}
        <span className={styles.free}>
          {t("magazine:editor.sideCards.slotsOpen", { count: open })}
        </span>
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
              {gap > 0 ? (
                t("magazine:editor.sideCards.needCount", { count: gap })
              ) : (
                <FiCheck
                  aria-label={t("magazine:editor.sideCards.filledAria")}
                />
              )}
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
  const { t } = useTranslation();
  const q = query.toLowerCase();
  const match = q
    ? [...new Set(pieces.map((p) => p.author))].filter((a) =>
        a.toLowerCase().includes(q),
      )
    : [];

  return (
    <div className={styles.sideCard}>
      <h4>{t("magazine:editor.sideCards.contributorsHeading")}</h4>
      {/* This aggregate role/geography breakdown is mock analytics content
          (would come from an API stats endpoint in live mode) — left as-is. */}
      <div className={styles.mixRow}>
        <b>11</b>
        <span>contributors · 8 writers · 2 illustrators · 1 photographer</span>
      </div>
      <div className={styles.mixSplit}>
        <div className={styles.mixCell}>
          <b className={styles.jade}>4</b>
          <span>{t("magazine:editor.sideCards.newVoices")}</span>
        </div>
        <div className={styles.mixCell}>
          <b>7</b>
          <span>{t("magazine:editor.sideCards.returning")}</span>
        </div>
      </div>
      <div className={styles.pay}>
        <div className={styles.payHead}>
          {t("magazine:editor.sideCards.contributorPay")}
        </div>
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
            <i className={styles.paid} />4 {t("magazine:editor.sideCards.paid")}
          </span>
          <span>
            <i className={styles.inv} />3{" "}
            {t("magazine:editor.sideCards.awaiting")}
          </span>
          <span>
            <i className={styles.none} />5{" "}
            {t("magazine:editor.sideCards.toInvoice")}
          </span>
        </div>
      </div>
      <div className={styles.geo}>
        Lisbon 6 · Porto 2 · Madrid 1 · Faro 1 · Berlin 1
      </div>
      {q && (
        <div className={styles.contribMatch}>
          {match.length
            ? t("magazine:editor.sideCards.matching", {
                names: match.join(", "),
              })
            : t("magazine:editor.sideCards.noContributorMatch")}
        </div>
      )}
      <Link to={routes.author} className={styles.contribLink}>
        {t("magazine:editor.sideCards.seeContributorProfiles")}
      </Link>
    </div>
  );
}

/** Recent editorial activity feed. */
export function ActivityCard() {
  const { t } = useTranslation();
  const dotClass = {
    coral: styles.tCoral,
    jade: styles.tJade,
    plum: styles.tPlum,
  };
  return (
    <div className={styles.sideCard}>
      <h4>{t("magazine:editor.sideCards.recentActivity")}</h4>
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
  const { t } = useTranslation();
  return (
    <div className={cx(styles.sideCard, styles.qaCard)}>
      <h4>{t("magazine:editor.sideCards.quickActions")}</h4>
      <div className={styles.qa}>
        <button
          type="button"
          onClick={() => onStub(t("magazine:editor.toast.openingBulkTriage"))}
        >
          {t("magazine:editor.sideCards.sendPitchDecisions")}
        </button>
        <button
          type="button"
          onClick={() =>
            onStub(t("magazine:editor.toast.draftingReminders", { count: 3 }))
          }
        >
          {t("magazine:editor.sideCards.emailContributorsWaiting")}
        </button>
        <Link to={routes.issue}>
          {t("magazine:editor.sideCards.previewIssueLayout")}
        </Link>
        <button
          type="button"
          onClick={() =>
            onStub(t("magazine:editor.toast.contributorListExported"))
          }
        >
          {t("magazine:editor.sideCards.exportContributorList")}
        </button>
      </div>
    </div>
  );
}

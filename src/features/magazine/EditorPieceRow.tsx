import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiArrowRight, FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { Popover, StageMenu, AssignMenu, MoreMenu } from "./EditorPopover";
import {
  dueInfo,
  isLate,
  blockedLine,
  STAGE_LABEL_KEY,
  type Piece,
  type Editor,
  type Stage,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

const STAGE_CLASS: Record<Stage, string | undefined> = {
  Commissioned: styles.neutral,
  Drafting: styles.drafting,
  "In review": styles.review,
  "First edit": styles.editing,
  Copyedit: styles.check,
  "Fact-check": styles.check,
  "Sensitivity read": styles.sens,
  Ready: styles.ready,
};

const DUE_CLASS = {
  ready: styles.ready,
  late: styles.late,
  soon: styles.soon,
  normal: undefined,
} as const;

const BLK_CLASS = {
  court: styles.court,
  other: styles.other,
  writer: styles.writer,
  note: undefined,
} as const;

function editorDot(ed: Editor): string | undefined {
  return ed === "Marta" ? styles.edMarta : styles.edSara;
}

/** Render a title, converting <em>…</em> markers into coral <em> nodes. */
function renderEm(title: string): ReactNode {
  return title.split(/(<em>.*?<\/em>)/g).map((part, i) => {
    const m = part.match(/^<em>(.*?)<\/em>$/);
    return m ? <em key={i}>{m[1]}</em> : part;
  });
}

function artClass(state: Piece["art"]["state"]): string | undefined {
  if (state === "in") return styles.done;
  if (state === "na") return styles.na;
  return styles.pend;
}

export interface PieceRowHandlers {
  loads: Record<Editor, number>;
  onSetStage: (piece: Piece, stage: Stage) => void;
  onAssign: (piece: Piece, editor: Editor) => void;
  onHandoff: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onDuplicate: (piece: Piece) => void;
}

/** One piece in the in-flight table, with inline stage/editor/more menus. */
export function EditorPieceRow({
  piece: p,
  me,
  focused,
  handlers,
}: {
  piece: Piece;
  me: Editor;
  focused: boolean;
  handlers: PieceRowHandlers;
}) {
  const { t } = useTranslation();
  const di = dueInfo(p.due, t);
  const late = isLate(p);
  const pct = p.pct ? ` · ${p.pct}%` : "";
  const blk = blockedLine(p, me, t);

  return (
    <div
      className={cx(styles.pieceRow, focused && styles.kbd)}
      data-piece-id={p.id}
    >
      <div>
        <div className={styles.pieceTitle}>{renderEm(p.title)}</div>
        <div className={styles.pieceBy}>
          {p.author} · {p.words.toLocaleString()} words · {p.section}
          {p.newVoice && (
            <span className={styles.nv}> · {t("magazine:editor.pieceRow.newVoice")}</span>
          )}
        </div>
        <div className={styles.pcChips}>
          <Popover
            render={({ toggle }) => (
              <button
                type="button"
                className={cx(styles.chip, styles.editorChip)}
                onClick={toggle}
              >
                <span className={cx(styles.chipDot, editorDot(p.editor))} />
                {t("magazine:editor.pieceRow.withEditor", { editor: p.editor })}{" "}
                <FiChevronDown size={12} aria-hidden />
              </button>
            )}
          >
            {(close) => (
              <AssignMenu
                piece={p}
                loads={handlers.loads}
                onPick={(ed) => handlers.onAssign(p, ed)}
                onHandoff={() => handlers.onHandoff(p)}
                close={close}
              />
            )}
          </Popover>
          <span className={cx(styles.artChip, artClass(p.art.state))}>
            <span className={styles.artDot} />
            {p.art.label}
          </span>
        </div>
      </div>

      <div className={styles.pcStatus}>
        <Popover
          render={({ toggle }) => (
            <button
              type="button"
              className={cx(styles.pieceStatus, STAGE_CLASS[p.stage])}
              onClick={toggle}
            >
              {t(STAGE_LABEL_KEY[p.stage])}
              {pct} <FiChevronDown size={11} aria-hidden />
            </button>
          )}
        >
          {(close) => (
            <StageMenu
              piece={p}
              onPick={(stage) => handlers.onSetStage(p, stage)}
              close={close}
            />
          )}
        </Popover>
        {late && <span className={styles.lateFlag}>{di.label}</span>}
        {blk && (
          <span className={cx(styles.blk, BLK_CLASS[blk.cls])}>{blk.text}</span>
        )}
      </div>

      <div className={cx(styles.pcDue, DUE_CLASS[di.cls])} title={di.abs}>
        {di.label}
      </div>

      <div className={styles.pcAct}>
        <Link to={routes.issue} className={styles.pieceAction}>
          {t("magazine:editor.pieceRow.open")} <FiArrowRight size={12} aria-hidden />
        </Link>
        <Popover
          align="right"
          render={({ toggle }) => (
            <button
              type="button"
              className={styles.rowMore}
              onClick={toggle}
              aria-label={t("magazine:editor.pieceRow.moreActionsAria")}
            >
              <FiMoreHorizontal size={16} aria-hidden />
            </button>
          )}
        >
          {(close) => (
            <MoreMenu
              piece={p}
              onChase={() => handlers.onChase(p)}
              onHandoff={() => handlers.onHandoff(p)}
              onDuplicate={() => handlers.onDuplicate(p)}
              close={close}
            />
          )}
        </Popover>
      </div>
    </div>
  );
}

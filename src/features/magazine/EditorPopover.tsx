import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PIPELINE,
  EDITORS,
  stripEm,
  firstName,
  STAGE_LABEL_KEY,
  type Piece,
  type Editor,
  type Stage,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

function editorDot(ed: Editor): string | undefined {
  return ed === "Marta" ? styles.edMarta : styles.edSara;
}

interface TriggerCtx {
  open: boolean;
  toggle: () => void;
}

/**
 * Anchored menu popover. Renders its trigger inline and portals the menu to
 * <body> with fixed positioning so the table's `overflow:hidden` never clips
 * it. Closes on outside click, Escape, scroll, and resize.
 */
export function Popover({
  render,
  children,
  align = "left",
}: {
  render: (ctx: TriggerCtx) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !popRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const pw = popRef.current.offsetWidth;
    let left = align === "right" ? r.right - pw : r.left;
    if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
    if (left < 12) left = 12;
    setPos({ top: r.bottom + 6, left });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (
        wrapRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={styles.popWrap} ref={wrapRef}>
      {render({ open, toggle: () => setOpen((o) => !o) })}
      {open &&
        createPortal(
          <div
            ref={popRef}
            className={styles.pop}
            style={
              pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }
            }
            role="menu"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Stage-picker menu content. */
export function StageMenu({
  piece,
  onPick,
  close,
}: {
  piece: Piece;
  onPick: (stage: Stage) => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.popHead}>
        {t("magazine:editor.popover.movePiece", { title: stripEm(piece.title) })}
      </div>
      {PIPELINE.map((s, i) => {
        const cur = s === piece.stage;
        return (
          <button
            key={s}
            type="button"
            role="menuitem"
            className={cx(styles.popItem, cur && styles.cur)}
            onClick={() => {
              onPick(s);
              close();
            }}
          >
            <span className={styles.popNum}>{i + 1}</span>
            {t(STAGE_LABEL_KEY[s])}
            {cur && <em>{t("magazine:editor.popover.current")}</em>}
          </button>
        );
      })}
    </>
  );
}

/** Editor-assignment menu content. */
export function AssignMenu({
  piece,
  loads,
  onPick,
  onHandoff,
  close,
}: {
  piece: Piece;
  loads: Record<Editor, number>;
  onPick: (editor: Editor) => void;
  onHandoff: () => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.popHead}>
        {t("magazine:editor.popover.editorForPiece")}
      </div>
      {EDITORS.map((ed) => {
        const cur = ed === piece.editor;
        return (
          <button
            key={ed}
            type="button"
            role="menuitem"
            className={cx(styles.popItem, cur && styles.cur)}
            onClick={() => {
              onPick(ed);
              close();
            }}
          >
            <span className={cx(styles.chipDot, editorDot(ed))} />
            {ed}
            <em>
              {t(
                cur
                  ? "magazine:editor.popover.piecesCountCurrent"
                  : "magazine:editor.popover.piecesCount",
                { count: loads[ed] },
              )}
            </em>
          </button>
        );
      })}
      <button
        type="button"
        role="menuitem"
        className={cx(styles.popItem, styles.handoff)}
        onClick={() => {
          close();
          onHandoff();
        }}
      >
        <FiEdit3 aria-hidden /> {t("magazine:editor.popover.handOffWithNote")}
      </button>
    </>
  );
}

/** Row "⋯" overflow menu content. */
export function MoreMenu({
  piece,
  onChase,
  onHandoff,
  onDuplicate,
  close,
}: {
  piece: Piece;
  onChase: () => void;
  onHandoff: () => void;
  onDuplicate: () => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <button
        type="button"
        role="menuitem"
        className={styles.popItem}
        onClick={() => {
          close();
          onChase();
        }}
      >
        {t("magazine:editor.popover.nudge", { name: firstName(piece.author) })}
      </button>
      <button
        type="button"
        role="menuitem"
        className={styles.popItem}
        onClick={() => {
          close();
          onHandoff();
        }}
      >
        {t("magazine:editor.popover.handOffToCoEditor")}
      </button>
      <Link
        className={styles.popItem}
        role="menuitem"
        to={routes.issue}
        onClick={close}
      >
        {t("magazine:editor.popover.previewInLayout")}
      </Link>
      <button
        type="button"
        role="menuitem"
        className={styles.popItem}
        onClick={() => {
          close();
          onDuplicate();
        }}
      >
        {t("magazine:editor.popover.duplicateBrief")}
      </button>
    </>
  );
}

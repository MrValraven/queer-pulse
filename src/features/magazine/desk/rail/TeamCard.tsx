import { useMemo, useRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { cx } from "../../../../shared/lib/cx";
import type { DeskSummaryView } from "../../api/useDeskSummary";
import { firstName } from "../../data/desk.copy";
import type { Editor, Piece } from "../../data/desk.data";
import { RailAvatar } from "./RailAvatar";
import { RailCard } from "./RailCard";
import { avatarIdentity } from "./railIdentity";
import styles from "./rail.module.css";

export interface TeamCardProps {
  editorLoad: DeskSummaryView["editorLoad"];
  editors: Editor[];
  /** The signed-in editor's id. */
  me: string;
  editorFilter: string | null;
  onEditorFilter: (editorId: string | null) => void;
  /** The active scope's pieces (`tracks.activePieces`), the same list the
   *  editor filter narrows. When given, each row counts only that editor's
   *  in-flight pieces (`stage !== "Published"`) in this list instead of
   *  `entry.count`, so the number a row shows is the number clicking it
   *  filters to. `editorLoad` still supplies the roster and each editor's
   *  cap. Without it a row falls back to `entry.count` (desk-wide, every
   *  stage), so callers that have not wired this prop yet keep compiling. */
  pieces?: Piece[];
}

/** Every editor's in-flight (not yet Published) piece count in `pieces`. */
function inFlightCountByEditor(pieces: Piece[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const piece of pieces) {
    if (piece.stage === "Published") continue;
    counts.set(piece.editorId, (counts.get(piece.editorId) ?? 0) + 1);
  }
  return counts;
}

/**
 * Who carries how much, and a way into anyone's queue. Each row is a toggle:
 * pressing it filters the desk to that editor's pieces, pressing it again
 * clears the filter. Over capacity is the one loud state (late tone, a warning
 * icon and a spoken suffix); everyone else stays calm. A desk with one editor
 * has no one to compare against, so the card hides below two.
 */
export function TeamCard({
  editorLoad,
  editors,
  me,
  editorFilter,
  onEditorFilter,
  pieces,
}: TeamCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const rowListRef = useRef<HTMLUListElement>(null);
  const inFlightCounts = useMemo(
    () => (pieces ? inFlightCountByEditor(pieces) : null),
    [pieces],
  );
  if (editorLoad.length < 2) return null;

  const isViewingSomeoneElse = editorFilter !== null && editorFilter !== me;
  const viewedEditor = editors.find((editor) => editor.id === editorFilter);

  // "Show everyone" removes the row it sits in, so the focused button
  // unmounts and focus would drop to <body>. Once the clear has committed,
  // hand focus to the first team row instead, a neighbour that stays put.
  const showEveryone = () => {
    onEditorFilter(null);
    requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (focused === null || focused === document.body) {
        rowListRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    });
  };

  return (
    <RailCard kind="team" title={t("magazine:desk.rail.team.title")}>
      <ul className={styles.rowList} ref={rowListRef}>
        {editorLoad.map((entry) => {
          const editor = editors.find(
            (candidate) => candidate.id === entry.editorId,
          );
          const label = editor ? firstName(editor.name) : entry.editorId;
          const identity = avatarIdentity(editor, label);
          const count = inFlightCounts
            ? (inFlightCounts.get(entry.editorId) ?? 0)
            : entry.count;
          const isOverCap = count > entry.cap;
          const isActive = editorFilter === entry.editorId;
          const fillPercent =
            entry.cap > 0 ? Math.min(100, (count / entry.cap) * 100) : 100;
          return (
            <li key={entry.editorId}>
              <button
                type="button"
                className={cx(styles.rowButton, styles.teamRow)}
                aria-pressed={isActive}
                data-over-cap={isOverCap}
                onClick={() => onEditorFilter(isActive ? null : entry.editorId)}
              >
                <RailAvatar initials={identity.initials} tint={identity.tint} />
                <span className={styles.teamName}>{label}</span>
                <span className={styles.meter} aria-hidden="true">
                  <span
                    className={cx(
                      styles.meterFill,
                      isOverCap && styles.meterFillOver,
                    )}
                    style={{ inlineSize: `${fillPercent}%` }}
                  />
                </span>
                <span
                  className={styles.teamCount}
                  data-zero={count === 0}
                  aria-hidden="true"
                >
                  {isOverCap ? <FiAlertTriangle size={12} /> : null}
                  {format.number(count)}
                </span>
                <span className="visuallyHidden">
                  {t("magazine:desk.rail.team.loadAria", {
                    count,
                    load: format.number(count),
                    cap: format.number(entry.cap),
                  })}
                  {isOverCap
                    ? t("magazine:desk.rail.team.overCapacitySuffix")
                    : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {isViewingSomeoneElse ? (
        <p className={styles.viewingLine}>
          <span>
            {t("magazine:desk.rail.team.viewingQueue", {
              name: viewedEditor
                ? firstName(viewedEditor.name)
                : (editorFilter ?? ""),
            })}
          </span>
          <button
            type="button"
            className={styles.textButton}
            onClick={showEveryone}
          >
            {t("magazine:desk.rail.team.showEveryone")}
          </button>
        </p>
      ) : null}
    </RailCard>
  );
}

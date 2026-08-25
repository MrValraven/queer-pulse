import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiEdit3, FiFileText, FiLayers, FiSearch, FiZap } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../../shared/components/ui/modalStack";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceFormat } from "../data/desk.data";
import styles from "./CommandPalette.module.css";

export interface CommandPalettePiece {
  id: string;
  title: string;
  format: PieceFormat;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  pieces: CommandPalettePiece[];
  onSelectPiece: (id: string) => void;
  onGoDesk: () => void;
  onNewPiece: () => void;
}

interface CommandRow {
  key: string;
  label: string;
  icon: ReactNode;
  kind: string;
  run: () => void;
}

const FORMAT_ICON: Record<PieceFormat, ReactNode> = {
  article: <FiFileText aria-hidden />,
  deck: <FiLayers aria-hidden />,
};

const MAX_RESULTS = 8;

/**
 * ⌘K-style command palette: jump straight to a piece by title, or run one of
 * two fixed actions (start a new piece, go to the desk). Filters the combined
 * list by substring, caps it at 8 rows, Enter runs the first hit, Escape (or
 * a scrim click) closes. Renders nothing while closed.
 */
export function CommandPalette({
  open,
  onClose,
  pieces,
  onSelectPiece,
  onGoDesk,
  onNewPiece,
}: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  // Tracks the previous `open` value so the query can be reset the instant
  // the palette opens, adjusted during render rather than in an effect (an
  // effect that calls setState synchronously on mount triggers an avoidable
  // extra render — see https://react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setQuery("");
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteId = useId();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    pushModal(paletteId);
    // Autofocus the search field the moment the palette mounts.
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      popModal(paletteId);
      cancelAnimationFrame(frame);
    };
  }, [open, paletteId]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isTopmostModal(paletteId)) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, paletteId]);

  const rows = useMemo<CommandRow[]>(() => {
    const actionKind = t("magazine:desk.palette.kindAction");
    const formatKind: Record<PieceFormat, string> = {
      article: t("magazine:desk.palette.kindArticle"),
      deck: t("magazine:desk.palette.kindDeck"),
    };
    const staticRows: CommandRow[] = [
      {
        key: "new-piece",
        label: t("magazine:desk.palette.writePiece"),
        icon: <FiEdit3 aria-hidden />,
        kind: actionKind,
        run: onNewPiece,
      },
      {
        key: "go-desk",
        label: t("magazine:desk.palette.goToDesk"),
        icon: <FiZap aria-hidden />,
        kind: actionKind,
        run: onGoDesk,
      },
    ];
    const pieceRows: CommandRow[] = pieces.map((piece) => ({
      key: `piece-${piece.id}`,
      label: piece.title,
      icon: FORMAT_ICON[piece.format],
      kind: formatKind[piece.format],
      run: () => onSelectPiece(piece.id),
    }));
    return [...staticRows, ...pieceRows];
  }, [pieces, onNewPiece, onGoDesk, onSelectPiece, t]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? rows.filter((row) => row.label.toLowerCase().includes(needle))
      : rows;
    return matches.slice(0, MAX_RESULTS);
  }, [rows, query]);

  if (!open) return null;

  function runRow(row: CommandRow) {
    row.run();
    onClose();
  }

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label={t("magazine:desk.palette.ariaLabel")}
      >
        <div className={styles.searchRow}>
          <FiSearch aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredRows[0]) {
                event.preventDefault();
                runRow(filteredRows[0]);
              }
            }}
            placeholder={t("magazine:desk.palette.searchPlaceholder")}
            aria-label={t("magazine:desk.palette.searchAria")}
          />
        </div>
        <div
          className={styles.list}
          role="listbox"
          aria-label={t("magazine:desk.palette.commandsAria")}
        >
          {filteredRows.length === 0 ? (
            <div className={styles.noResults}>
              {t("magazine:desk.palette.noResults", { query })}
            </div>
          ) : (
            filteredRows.map((row) => (
              <button
                key={row.key}
                type="button"
                className={styles.row}
                onClick={() => runRow(row)}
                role="option"
                aria-selected={false}
              >
                <span className={styles.rowIcon}>{row.icon}</span>
                <span className={styles.rowLabel}>{row.label}</span>
                <span className={styles.rowKind}>{row.kind}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

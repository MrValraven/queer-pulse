import { useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Button, EmptyState, SearchInput } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { FormatBadge } from "../FormatBadge";
import { StagePill } from "../StagePill";
import type { Piece } from "../../data/desk.data";
import styles from "./AddPiecesPanel.module.css";

export interface AddPiecesPanelProps {
  /** The unfiled pool (`issueId === null`) — the only pieces this panel can
   *  pull in. Work already on another issue is left alone: moving it belongs
   *  to that issue's desk, not to this one. */
  unassignedPieces: Piece[];
  /** This issue's display number, for the confirm label. */
  issueNumber: string;
  isSaving: boolean;
  onAdd: (pieceIds: string[]) => void;
}

/**
 * Issue-first assignment: sit inside the issue and pull work into it, rather
 * than going piece by piece on the desk. Sits under the running order, since
 * what you add here lands at the end of that order.
 */
export function AddPiecesPanel({
  unassignedPieces,
  issueNumber,
  isSaving,
  onAdd,
}: AddPiecesPanelProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const lowerCaseQuery = query.trim().toLowerCase();
  const matchingPieces = lowerCaseQuery
    ? unassignedPieces.filter((piece) =>
        `${piece.title} ${piece.byline} ${piece.section}`
          .toLowerCase()
          .includes(lowerCaseQuery),
      )
    : unassignedPieces;

  function toggle(pieceId: string): void {
    setSelectedIds((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : [...current, pieceId],
    );
  }

  function add(): void {
    if (selectedIds.length === 0 || isSaving) return;
    onAdd(selectedIds);
    setSelectedIds([]);
  }

  return (
    <section className={styles.panel} aria-labelledby="add-pieces-heading">
      <div className={styles.head}>
        <div>
          <h3 id="add-pieces-heading" className={styles.title}>
            {t("magazine:issue.addPieces.title")}
          </h3>
          <p className={styles.sub}>{t("magazine:issue.addPieces.sub")}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={selectedIds.length === 0 || isSaving}
          onClick={add}
        >
          <FiPlus aria-hidden />
          {/* Plural categories put 0 in "other" (CLDR), which would read
              "Add 0 to issue 01" on the resting, disabled button — so the
              empty state gets its own count-free label. */}
          {selectedIds.length === 0
            ? t("magazine:issue.addPieces.addCtaEmpty", { number: issueNumber })
            : t("magazine:issue.addPieces.addCta", {
                count: selectedIds.length,
                number: issueNumber,
              })}
        </Button>
      </div>

      {unassignedPieces.length === 0 ? (
        <EmptyState
          title={t("magazine:issue.addPieces.emptyTitle")}
          description={t("magazine:issue.addPieces.emptyDescription")}
          compact
        />
      ) : (
        <>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("magazine:issue.addPieces.searchPlaceholder")}
            ariaLabel={t("magazine:issue.addPieces.searchLabel")}
          />
          <div className={styles.list}>
            {matchingPieces.map((piece) => {
              const isSelected = selectedIds.includes(piece.id);
              return (
                <button
                  key={piece.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  className={styles.row}
                  data-selected={isSelected}
                  onClick={() => toggle(piece.id)}
                >
                  <span className={styles.mark} data-on={isSelected} aria-hidden>
                    {isSelected && <FiCheck />}
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{piece.title}</span>
                    <span className={styles.rowSub}>
                      <FormatBadge format={piece.format} />
                      <span>{piece.section}</span>
                      <span>·</span>
                      <span>{piece.byline}</span>
                    </span>
                  </span>
                  <StagePill stage={piece.stage} />
                </button>
              );
            })}
            {matchingPieces.length === 0 && (
              <p className={styles.noMatches}>
                {t("magazine:issue.addPieces.noMatches")}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

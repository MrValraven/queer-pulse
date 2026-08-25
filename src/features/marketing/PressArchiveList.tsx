import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Piece, YearGroup } from "./pressArchive.data";
import styles from "./PressArchivePage.module.css";

function PressRowSkeleton() {
  // Mirrors the real .row grid: date column (auto), title block (1fr), outlet (auto).
  return (
    <div className={styles.row} aria-hidden>
      <div className={styles.date}>
        <SkeletonLine width={56} height={17} />
        <SkeletonLine width={44} height={11} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width={120} height={11} />
        <SkeletonLine width="70%" height={18} style={{ marginTop: 8 }} />
        <SkeletonLine width="45%" height={12} style={{ marginTop: 6 }} />
      </div>
      <SkeletonLine width={72} height={12} />
    </div>
  );
}

/** One placeholder year: a skeleton heading plus five skeleton rows. */
export function PressArchiveYearSkeleton() {
  return (
    <div>
      <h2 className={styles.year} aria-hidden>
        <SkeletonLine width={90} height={42} />
      </h2>
      {Array.from({ length: 5 }).map((_unused, skeletonIndex) => (
        <PressRowSkeleton key={skeletonIndex} />
      ))}
    </div>
  );
}

interface PressArchiveRowProps {
  piece: Piece;
  delay: number;
  onOpen: (piece: Piece) => void;
}

function PressArchiveRow({ piece, delay, onOpen }: PressArchiveRowProps) {
  const { t } = useTranslation();

  return (
    <FadeIn delay={delay}>
      <button
        type="button"
        className={styles.row}
        onClick={() => onOpen(piece)}
      >
        <div className={styles.date}>
          {piece.day} <em>{piece.month}</em>
          <span>{piece.kind}</span>
        </div>
        <div>
          <div
            className={styles.source}
            style={piece.sourceMuted ? { color: "var(--ink-60)" } : undefined}
          >
            {piece.pin && (
              <span className={styles.pin}>
                {t("marketing:pressArchive.pinBadge")}
              </span>
            )}
            {piece.source}
            <span className={styles.kind}>· {piece.sourceKind}</span>
          </div>
          <div className={styles.title}>{piece.title}</div>
          <div className={styles.meta}>{piece.meta}</div>
        </div>
        <div className={styles.out}>{piece.out}</div>
      </button>
    </FadeIn>
  );
}

export interface PressArchiveListProps {
  /** Year groups left after the chip + search filters, already emptied of
   *  non-matching pieces. */
  groups: YearGroup[];
  /** First paint of the archive (the prototype's simulated entrance beat). */
  isLoading: boolean;
  onOpenPiece: (piece: Piece) => void;
}

/** The archive body: skeletons while loading, an inline note when the filters
 *  match nothing, otherwise the year-grouped coverage rows. */
export function PressArchiveList({
  groups,
  isLoading,
  onOpenPiece,
}: PressArchiveListProps) {
  const { t } = useTranslation();

  if (isLoading) return <PressArchiveYearSkeleton />;

  if (groups.length === 0) {
    return (
      <p className={styles.empty}>{t("marketing:pressArchive.noResults")}</p>
    );
  }

  return (
    <>
      {groups.map((yearGroup) => (
        <div key={yearGroup.year}>
          <h2 className={styles.year}>
            {yearGroup.year.slice(0, 3)}
            <em>{yearGroup.year.slice(3)}</em>
            <span className={styles.ct}>{yearGroup.count}</span>
          </h2>
          {yearGroup.pieces.map((piece, pieceIndex) => (
            <PressArchiveRow
              key={piece.id}
              piece={piece}
              delay={Math.min(pieceIndex, 8) * 60}
              onOpen={onOpenPiece}
            />
          ))}
        </div>
      ))}
    </>
  );
}

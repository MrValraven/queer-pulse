import { IssuePlanSectionRow } from "./IssuePlanSectionRow";
import type { DeskTrack } from "./deskTrack";
import { formattedCountValues } from "./deskHeaderCopy";
import { issueSectionSlots, issueSlotTotals } from "./issueSlots";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Section, Stage } from "../data/desk.data";
import styles from "./IssuePlan.module.css";

export interface IssuePlanProps {
  /** The pieces the slot cards show: the desk's filtered list. */
  pieces: Piece[];
  sections: Section[];
  /** The issue's pieces before any filter (`useDeskTracks().issuePieces`).
   *  The summary and each section's count read these, so the plan says what
   *  the header pulse and the rail say while a filter narrows the cards.
   *  Defaults to `pieces`. */
  slotPieces?: Piece[];
  /** True while a search, chip or filter narrows `pieces`; the summary then
   *  tells screen readers how many of the scope's pieces the cards show. */
  isFiltered?: boolean;
  /** How many pieces the scope holds before filters, for that sentence.
   *  Defaults to `pieces.length`. */
  scopePieceCount?: number;
  /** Kept for the existing mount. Slot progress now reads the shared stage
   *  scale (`STAGE_STEP`), so the plan no longer needs the stage list. */
  stages?: Stage[];
  onOpen: (piece: Piece) => void;
  onCommission: (sectionName: string) => void;
  /** The scope being planned. Under "unassigned" the plan shows where unfiled
   *  pieces would fit and hides the commission slots. */
  track?: DeskTrack;
}

interface SummaryPart {
  key: string;
  labelKey: string;
  count: number;
}

/**
 * The desk's "issue plan" layout: a one-line summary of how full the issue
 * is, then one row per magazine section with its filled-of-target bar, a
 * slot card per piece and a "Commission for {section}" slot per gap. The
 * counts come from `issueSlots`, the same helper as the pulse and the rail,
 * over the unfiltered issue, so a filter only thins out the cards.
 *
 * Unfiled work has no issue to commission into, so under the "unassigned"
 * track the heading turns into "Where unfiled pieces would fit" and the gap
 * slots are left out; the counts stay, as a guide to which sections still have space.
 */
export function IssuePlan({
  pieces,
  sections,
  slotPieces = pieces,
  isFiltered = false,
  scopePieceCount = pieces.length,
  onOpen,
  onCommission,
  track = "issue",
}: IssuePlanProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const isUnfiled = track === "unassigned";
  const today = new Date();
  const sectionSlots = issueSectionSlots(slotPieces, sections);
  const rows = sections.map((section, sectionIndex) => ({
    section,
    sectionPieces: pieces.filter((piece) => piece.section === section.name),
    filled: sectionSlots[sectionIndex]?.filled ?? 0,
    gaps: sectionSlots[sectionIndex]?.open ?? section.target,
  }));
  const fullCount = rows.filter((row) => row.gaps === 0).length;
  const summaryParts: SummaryPart[] = [
    {
      key: "full",
      labelKey: "magazine:desk.issuePlan.summary.full",
      count: fullCount,
    },
    {
      key: "gaps",
      labelKey: "magazine:desk.issuePlan.summary.gaps",
      count: rows.length - fullCount,
    },
    {
      key: "open",
      labelKey: "magazine:desk.issuePlan.slotsOpen",
      count: issueSlotTotals(slotPieces, sections).open,
    },
  ];

  return (
    <div className={styles.plan}>
      {/* Visually hidden: names the layout for screen readers, so the
          section rows' slot titles below (`h3`) step down one level from it
          rather than skipping straight from the page's own `h1`. */}
      <h2 className="visuallyHidden">
        {t("magazine:desk.header.layout.issuePlan")}
      </h2>
      {isUnfiled && (
        <h3 className={styles.heading}>
          {t("magazine:desk.issuePlan.unfiledHeading")}
        </h3>
      )}
      <p className={styles.summary}>
        {summaryParts.map((part) => (
          <span
            key={part.key}
            className={cx(
              styles.summaryPart,
              part.count === 0 && styles.summaryZero,
            )}
          >
            {t(part.labelKey, formattedCountValues(part.count, format.number))}
          </span>
        ))}
        {isFiltered && (
          <span className="visuallyHidden">
            {t("magazine:desk.issuePlan.summary.filtered", {
              shown: format.number(pieces.length),
              ...formattedCountValues(scopePieceCount, format.number),
            })}
          </span>
        )}
      </p>
      {rows.map((row) => (
        <IssuePlanSectionRow
          key={row.section.name}
          section={row.section}
          sectionPieces={row.sectionPieces}
          filled={row.filled}
          gaps={row.gaps}
          shouldShowGaps={!isUnfiled}
          today={today}
          onOpen={onOpen}
          onCommission={onCommission}
        />
      ))}
    </div>
  );
}

import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { intlLocale } from "../../../../shared/i18n/locale";
import { formatDate } from "../../../../shared/lib/date";
import type { PublishGateItemDto } from "../../api/pieces.api";
import type { IssueLastShipDto } from "../../api/issueProduction.api";
import styles from "../pieceTabs.module.css";

/** Ship instants are rendered to the minute: "publishes 9 September 2026,
 *  09:00" is the whole point of a scheduled ship, and a bare date would hide
 *  the hour the pieces actually go live. */
const SHIP_INSTANT_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export interface ShipChecklistCardProps {
  checklist: PublishGateItemDto[];
  /** What the most recent ship did (ENG-110). Absent on an issue that has
   *  never shipped, and on any backend build older than that field. */
  lastShip?: IssueLastShipDto | null;
  onShip: () => void;
}

/**
 * The pre-ship checklist in the issue-production `.erail`: every item from
 * `IssueProductionDto.shipChecklist` (past-gate pieces, cover licensed,
 * coverlines proofed, contents blurbs, digest scheduled, corrections carried
 * over), plus the "Ship the issue" button that opens `ShipIssueModal`.
 *
 * The checklist itself is advisory: unlike `PublishGateCard`, the button is
 * never disabled, because a piece behind its gate simply holds rather than
 * blocking the whole issue. What a ship HELD is the part an editor needs
 * afterwards, so `lastShip` is rendered here piece by piece with its reasons.
 * Before ENG-110 that outcome was invisible and a held piece just never
 * appeared.
 */
export function ShipChecklistCard({
  checklist,
  lastShip,
  onShip,
}: ShipChecklistCardProps) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);
  const heldPieces = lastShip?.held ?? [];

  return (
    <div className={styles.card}>
      <h3>{t("magazine:issue.ship.checklistHeading")}</h3>
      <div className={styles.stack}>
        {checklist.map((item) => (
          <div
            key={item.label}
            className={cx(styles.gaterow, !item.done && styles.open)}
          >
            {item.done ? (
              <FiCheck className={styles.doneIcon} aria-hidden />
            ) : (
              <FiX className={styles.openIcon} aria-hidden />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {lastShip && (
        <div className={cx(styles.note, styles.noteStack)}>
          <b>
            {t("magazine:issue.ship.lastShipHeading", {
              date: formatDate(lastShip.shippedAt, locale, SHIP_INSTANT_FORMAT),
            })}
          </b>
          <span>
            {t("magazine:issue.ship.lastShipPublished", {
              count: lastShip.publishedPieceIds.length,
              date: formatDate(lastShip.publishAt, locale, SHIP_INSTANT_FORMAT),
            })}
          </span>
        </div>
      )}

      {heldPieces.length > 0 && (
        <div className={cx(styles.note, styles.warn, styles.noteStack)}>
          <b>
            <FiAlertTriangle aria-hidden />
            {t("magazine:issue.ship.heldHeading", {
              count: heldPieces.length,
            })}
          </b>
          <ul className={styles.ticks}>
            {heldPieces.map((piece) => (
              <li key={piece.pieceId} className={styles.open}>
                <FiX aria-hidden />
                <span>
                  <b>{piece.title}</b>
                  {piece.reasons.length > 0 && ` ${piece.reasons.join(", ")}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="plum" onClick={onShip}>
        {t("magazine:issue.ship.cta")}
      </Button>
    </div>
  );
}

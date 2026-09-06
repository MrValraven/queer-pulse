import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./DeskStats.module.css";

/**
 * Four desk-at-a-glance tiles: in flight, ready to lay out, behind schedule
 * (warn style), pitches waiting.
 */
export function DeskStats({
  pieces,
  pitchCount,
}: {
  pieces: Piece[];
  pitchCount: number;
}) {
  const { t } = useTranslation();
  // "In flight" is work still moving: everything before Ready. A published
  // piece has left the pipeline entirely, so counting it here would quietly
  // inflate the desk's workload for the rest of the issue's life.
  const inFlightCount = pieces.filter(
    (piece) => piece.stage !== "Ready" && piece.stage !== "Published",
  ).length;
  const readyCount = pieces.filter((piece) => piece.stage === "Ready").length;
  const lateCount = pieces.filter((piece) => piece.late).length;

  const tiles: { count: number; label: string; warn?: boolean }[] = [
    { count: inFlightCount, label: t("magazine:desk.stats.inFlight") },
    { count: readyCount, label: t("magazine:desk.stats.readyToLayOut") },
    {
      count: lateCount,
      label: t("magazine:desk.stats.behindSchedule"),
      warn: true,
    },
    { count: pitchCount, label: t("magazine:desk.stats.pitchesWaiting") },
  ];

  return (
    <div className={styles.stats}>
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cx(
            styles.stat,
            tile.warn && tile.count > 0 && styles.warn,
          )}
        >
          <b>{tile.count}</b>
          <span>{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

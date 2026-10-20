import { useState } from "react";
import { useExitTransition, usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./vouchGraphCanvas.module.css";

/** Which hint line a node tooltip shows: pointer gestures or keyboard keys. */
export type TipHintKind = "pointer" | "keyboard";

/** Matches the `.tipLeaving` animation length (var(--dur-fast)). */
const TIP_EXIT_MS = 150;

export type TipData =
  | {
      kind: "node";
      name: string;
      pronoun: string;
      role: string;
      vouchesIn: number;
      vouchesOut: number;
      joined: string;
      hintKind: TipHintKind;
    }
  | {
      kind: "edge";
      label: string;
      edgeKind?: "invite" | "vouch";
      relationship?: string;
      reason?: string;
      date: string;
      withdrawn?: boolean;
    };

/** `ownerIds`: the node, or both ends of the edge, the tip describes; the
 *  canvas drops the tip when one of them leaves the laid-out set. */
export type TipState = {
  data: TipData;
  x: number;
  y: number;
  ownerIds: string[];
} | null;

interface Props {
  tip: TipState;
}

/** Floating tooltip for nodes and edges, beside the cursor or, on keyboard
 *  focus, beside the node. Pointer-events: none. It keeps the last tip on
 *  screen while it fades out. */
export function VouchGraphTooltip({ tip: currentTip }: Props) {
  const isReducedMotion = usePrefersReducedMotion();
  const [lastTip, setLastTip] = useState<TipState>(currentTip);
  if (currentTip && currentTip !== lastTip) setLastTip(currentTip);
  const { isMounted, isExiting } = useExitTransition(
    !!currentTip,
    isReducedMotion ? 0 : TIP_EXIT_MS,
  );
  const shownTip = currentTip ?? lastTip;
  if (!isMounted || !shownTip) return null;
  return (
    <VouchGraphTooltipBody
      tip={shownTip.data}
      x={shownTip.x}
      y={shownTip.y}
      isExiting={isExiting}
    />
  );
}

function VouchGraphTooltipBody({
  tip,
  x,
  y,
  isExiting,
}: {
  tip: TipData;
  x: number;
  y: number;
  isExiting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={isExiting ? `${styles.tip} ${styles.tipLeaving}` : styles.tip}
      style={{ left: x, top: y }}
      role="tooltip"
    >
      {tip.kind === "node" ? (
        <>
          <div className={styles.tipName}>
            {tip.name} <span>{tip.pronoun}</span>
          </div>
          <div className={styles.tipRole}>{tip.role}</div>
          <div className={styles.tipMeta}>
            {t("admin:vouchGraph.tooltip.vouchesIn", {
              count: tip.vouchesIn,
            })}{" "}
            ·{" "}
            {t("admin:vouchGraph.tooltip.vouchesOut", {
              count: tip.vouchesOut,
            })}{" "}
            · {t("admin:vouchGraph.tooltip.joinedPrefix", { when: tip.joined })}
          </div>
          <div className={styles.tipHint}>
            {tip.hintKind === "keyboard"
              ? t("admin:vouchGraph.tooltip.hintKeyboard")
              : t("admin:vouchGraph.tooltip.hint")}
          </div>
        </>
      ) : (
        <>
          <div className={styles.tipName}>{tip.label}</div>
          {tip.edgeKind && (
            <div className={styles.tipTag}>
              {t(`admin:vouchGraph.edgeKind.${tip.edgeKind}`)}
            </div>
          )}
          {tip.relationship && (
            <div className={styles.tipTag}>{tip.relationship}</div>
          )}
          {tip.reason && <div className={styles.tipRole}>“{tip.reason}”</div>}
          <div className={tip.withdrawn ? styles.tipMetaWd : styles.tipMeta}>
            {tip.withdrawn
              ? t("admin:vouchGraph.tooltip.withdrawn", { date: tip.date })
              : tip.date}
          </div>
        </>
      )}
    </div>
  );
}

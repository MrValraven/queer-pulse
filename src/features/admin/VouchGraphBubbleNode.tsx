import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { FiMinus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BUBBLE_RADIUS } from "./vouchCanvas.helpers";
import type { InviteBubble } from "./vouchGraph.types";
import styles from "./vouchGraphCanvas.module.css";

interface BubbleNodeProps {
  bubble: InviteBubble;
  parentName: string;
  className: string;
  nodeRef: (element: SVGGElement | null) => void;
  /** Absent while the bubble fades out: it is then inert and hidden from AT. */
  onToggle?: (parentId: string) => void;
}

const ICON_SIZE = BUBBLE_RADIUS * 1.1;
/** The touch hit circle scales from the bubble's radius (CSS reads it). */
const hitStyle = { "--vg-node-r": BUBBLE_RADIUS } as CSSProperties;

/**
 * C2 invite bubble: a collapsed fan of invite-only leaves drawn as one disc
 * with the count, labelled "{count} invited". Expanded, it shrinks to a small
 * "Hide invited" handle. The size change and the count / icon swap animate in
 * CSS; the canvas paints its position like any other node.
 */
export function VouchGraphBubbleNode({
  bubble,
  parentName,
  className,
  nodeRef,
  onToggle,
}: BubbleNodeProps) {
  const { t } = useTranslation();
  const count = bubble.leafIds.length;
  const isInteractive = !!onToggle;
  const label = bubble.isExpanded
    ? t("admin:vouchGraph.canvas.bubbleCollapseLabel")
    : t("admin:vouchGraph.canvas.bubbleLabel", { count });
  const ariaLabel = bubble.isExpanded
    ? t("admin:vouchGraph.canvas.bubbleCollapseAria", {
        count,
        name: parentName,
      })
    : t("admin:vouchGraph.canvas.bubbleAria", { count, name: parentName });

  const toggle = () => onToggle?.(bubble.parentId);
  const onKeyDown = (event: ReactKeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };
  // Keeps the stage from starting a pan (and clearing the selection) under it.
  const stopStagePointer = (event: ReactPointerEvent<SVGGElement>) =>
    event.stopPropagation();

  return (
    <g
      ref={(element) => {
        nodeRef(element);
        // `inert` is missing from React's SVG prop types; set it directly.
        element?.toggleAttribute("inert", !isInteractive);
      }}
      className={className}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-hidden={isInteractive ? undefined : true}
      aria-expanded={isInteractive ? bubble.isExpanded : undefined}
      aria-label={ariaLabel}
      onPointerDown={isInteractive ? stopStagePointer : undefined}
      onPointerUp={isInteractive ? stopStagePointer : undefined}
      onClick={isInteractive ? toggle : undefined}
      onKeyDown={isInteractive ? onKeyDown : undefined}
    >
      {/* invisible hit circle: 44px on screen on touch screens */}
      <circle className={styles.hit} r={BUBBLE_RADIUS} style={hitStyle} />
      <g className={styles.nodeInner}>
        <g className={styles.bubbleBody}>
          <circle className={styles.halo} r={BUBBLE_RADIUS + 7} />
          <circle className={styles.bubbleDisc} r={BUBBLE_RADIUS} />
          <text
            className={styles.bubbleCount}
            dy={BUBBLE_RADIUS / 3}
            fontSize={BUBBLE_RADIUS * 0.8}
          >
            {count}
          </text>
          <FiMinus
            className={styles.bubbleIcon}
            x={-ICON_SIZE / 2}
            y={-ICON_SIZE / 2}
            size={ICON_SIZE}
            aria-hidden
          />
        </g>
      </g>
      {/* rises with the disc when it shrinks to the handle */}
      <g className={styles.bubbleLabelShift}>
        <text className={styles.nodeName} dy={BUBBLE_RADIUS + 16} fontSize={12}>
          {label}
        </text>
      </g>
    </g>
  );
}

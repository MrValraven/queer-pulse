import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VouchAvatar } from "./adminMembers.data";
import type { AvatarTone } from "./ui";
import styles from "./AdminMembersPage.module.css";

interface Props {
  center: { initials: string; tone: AvatarTone };
  nodes: VouchAvatar[];
}

/** token-backed fill/stroke for each avatar tone in the SVG */
const TONE_FILL: Record<AvatarTone, string> = {
  plum: "rgba(var(--plum-rgb), .14)",
  coral: "rgba(var(--accent-rgb), .16)",
  jade: "rgba(var(--jade-rgb), .16)",
  violet: "rgba(var(--violet-rgb), .16)",
  amber: "rgba(var(--amber-rgb), .18)",
  anon: "rgba(var(--plum-rgb), .08)",
};

const TONE_STROKE: Record<AvatarTone, string> = {
  plum: "var(--plum)",
  coral: "var(--accent-deep)",
  jade: "var(--jade)",
  violet: "var(--violet)",
  amber: "var(--amber)",
  anon: "rgba(var(--plum-rgb), .35)",
};

const W = 320;
const H = 240;
const CX = W / 2;
const CY = H / 2;
const RX = 128; // ellipse radius x
const RY = 92; // ellipse radius y
const CENTER_R = 26;
const NODE_R = 16;

export function AdminVouchGraph({ center, nodes }: Props) {
  const { t } = useTranslation();
  const reduced = usePrefersReducedMotion();
  const count = nodes.length;

  const placed = nodes.map((n, i) => {
    // distribute around the ellipse, starting at the top
    const angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
    return {
      ...n,
      x: CX + Math.cos(angle) * RX,
      y: CY + Math.sin(angle) * RY,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.graphSvg}
      role="img"
      aria-label={t("admin:vouchGraph.graph.ariaLabel", {
        count,
        initials: center.initials,
      })}
    >
      {/* connector lines first */}
      <g>
        {placed.map((n, i) => (
          <line
            key={`l-${i}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            className={styles.graphEdge}
            style={
              reduced
                ? undefined
                : ({ "--gdelay": `${120 + i * 50}ms` } as CSSProperties)
            }
          />
        ))}
      </g>

      {/* surrounding nodes */}
      <g>
        {placed.map((n, i) => (
          <g
            key={`n-${i}`}
            className={styles.graphNode}
            style={
              reduced
                ? undefined
                : ({ "--gdelay": `${200 + i * 50}ms` } as CSSProperties)
            }
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill={TONE_FILL[n.tone]}
              stroke={TONE_STROKE[n.tone]}
              strokeWidth={1.5}
            />
            <text x={n.x} y={n.y} className={styles.graphNodeText}>
              {n.initials}
            </text>
          </g>
        ))}
      </g>

      {/* central member node, drawn last so it sits on top */}
      <g className={styles.graphCenter}>
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="var(--plum)"
          stroke="var(--plum-deep)"
          strokeWidth={2}
        />
        <text x={CX} y={CY} className={styles.graphCenterText}>
          {center.initials}
        </text>
      </g>
    </svg>
  );
}

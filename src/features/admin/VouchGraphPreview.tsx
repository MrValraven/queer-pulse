import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AvatarTone } from "./ui";
import type {
  GraphNode,
  MemberDetail,
  VouchAvatar,
  VouchDirection,
} from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

const W = 360;
const H = 256;
const CX = W / 2;
const CY = H / 2;
const RX = 132;
const RY = 94;
const CENTER_R = 30;
const NODE_R = 18;
const MAX = 10;

/**
 * Token-backed fill/stroke per avatar tone, mirroring `adminUi.module.css`'s
 * `av_*` classes. Restated here (rather than imported) because this preview
 * draws its own SVG circles instead of `<AdminAvatar>`, and the vouch-graph
 * fixture's own tone map (`adminVouchGraph.data.ts`'s `TONE`) doesn't cover
 * `"anon"` and uses a different tone vocabulary from `AvatarTone`.
 */
const AVATAR_TONE_INK: Record<AvatarTone, { fill: string; stroke: string }> = {
  plum: { fill: "rgba(var(--plum-rgb), .1)", stroke: "var(--text-strong)" },
  coral: {
    fill: "rgba(var(--accent-rgb), .18)",
    stroke: "var(--accent-text)",
  },
  jade: { fill: "rgba(var(--jade-rgb), .2)", stroke: "var(--jade-ink)" },
  violet: { fill: "rgba(var(--violet-rgb), .18)", stroke: "var(--violet)" },
  amber: { fill: "rgba(var(--amber-rgb), .24)", stroke: "var(--amber-ink)" },
  anon: { fill: "rgba(var(--plum-rgb), .08)", stroke: "var(--ink-40)" },
};

/**
 * Per-direction edge styling. Both a colour AND a line weight/dash differ, so
 * the three kinds stay distinguishable without relying on colour alone. The
 * arrowhead points the way the vouch runs: `inbound` (someone trusts the
 * member) points at the centre, `outbound` (the member vouches for them)
 * points at the node, `mutual` has one at each end.
 */
const EDGE_STYLE: Record<
  VouchDirection,
  { className: string | undefined; markerStart?: string; markerEnd?: string }
> = {
  inbound: { className: styles.previewEdge, markerStart: "url(#vgArrowIn)" },
  outbound: {
    className: styles.previewEdgeOutbound,
    markerEnd: "url(#vgArrowOut)",
  },
  mutual: {
    className: styles.previewEdgeMutual,
    markerStart: "url(#vgArrowMutual)",
    markerEnd: "url(#vgArrowMutual)",
  },
};

/** Direction order for the legend — strongest signal (mutual) first. */
const LEGEND_ORDER: VouchDirection[] = ["mutual", "inbound", "outbound"];

const LEGEND_SWATCH_CLASS: Record<VouchDirection, string | undefined> = {
  mutual: styles.legendMutual,
  inbound: styles.legendInbound,
  outbound: styles.legendOutbound,
};

/**
 * A static thumbnail of a member's direct vouch network, built straight from
 * the drawer's own `detail.graph` (a real centre + up to `MAX` avatars from
 * the backend). Each edge is tagged with its direction, so the preview shows
 * both who trusts the member AND who the member vouches for, told apart by
 * colour, line style, and arrowhead. Same radial visual language as the
 * full-screen modal, but real for every member.
 */
export function VouchGraphPreview({
  graph,
  name,
}: {
  graph: MemberDetail["graph"];
  name: string;
}) {
  const { t } = useTranslation();
  const nodes = graph.nodes.slice(0, MAX);
  const n = nodes.length;
  const placed = nodes.map((node, i) => {
    const ang = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2;
    return { node, x: CX + Math.cos(ang) * RX, y: CY + Math.sin(ang) * RY };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.previewSvg}
      role="img"
      aria-label={t("admin:vouchGraph.preview.ariaLabel", { name, count: n })}
    >
      <defs>
        <ArrowMarker id="vgArrowIn" fill="rgba(var(--plum-rgb), .5)" />
        <ArrowMarker id="vgArrowOut" fill="rgba(var(--accent-rgb), .65)" />
        <ArrowMarker id="vgArrowMutual" fill="rgba(var(--jade-rgb), .65)" />
      </defs>

      {placed.map((p, i) => {
        const dx = p.x - CX,
          dy = p.y - CY;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len,
          uy = dy / len;
        const x1 = CX + ux * CENTER_R,
          y1 = CY + uy * CENTER_R;
        const x2 = p.x - ux * NODE_R,
          y2 = p.y - uy * NODE_R;
        const cx = (x1 + x2) / 2 + (-dy / len) * 14;
        const cy = (y1 + y2) / 2 + (dx / len) * 14;
        const edge = EDGE_STYLE[p.node.direction];
        return (
          <path
            key={i}
            className={edge.className}
            fill="none"
            markerStart={edge.markerStart}
            markerEnd={edge.markerEnd}
            d={`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`}
          />
        );
      })}

      {placed.map((p, i) => (
        <PreviewNode key={i} avatar={p.node} x={p.x} y={p.y} r={NODE_R} />
      ))}
      <PreviewNode avatar={graph.center} x={CX} y={CY} r={CENTER_R} focus />
    </svg>
  );
}

function ArrowMarker({ id, fill }: { id: string; fill: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={8}
      refY={5}
      markerWidth={6}
      markerHeight={6}
      orient="auto-start-reverse"
    >
      <path d="M0 0 L10 5 L0 10 z" fill={fill} />
    </marker>
  );
}

function PreviewNode({
  avatar,
  x,
  y,
  r,
  focus = false,
}: {
  avatar: VouchAvatar;
  x: number;
  y: number;
  r: number;
  focus?: boolean;
}) {
  const ink = AVATAR_TONE_INK[avatar.tone];
  const strokeWidth = focus ? 2.5 : 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={ink.fill} stroke={ink.stroke} strokeWidth={strokeWidth} />
      <text
        className={styles.previewInit}
        dy={r / 3}
        fontSize={focus ? r * 0.6 : r * 0.7}
        fill={ink.stroke}
      >
        {avatar.initials}
      </text>
    </g>
  );
}

/**
 * A key for the preview's directional edges — only the directions actually
 * present in the graph are listed, so a member with no outbound vouches shows
 * a plain "who trusts them" legend.
 */
export function VouchGraphLegend({ nodes }: { nodes: GraphNode[] }) {
  const { t } = useTranslation();
  const present = LEGEND_ORDER.filter((direction) =>
    nodes.some((node) => node.direction === direction),
  );
  if (present.length < 2) return null;
  return (
    <ul className={styles.previewLegend}>
      {present.map((direction) => (
        <li key={direction} className={styles.previewLegendItem}>
          <span
            className={[styles.legendSwatch, LEGEND_SWATCH_CLASS[direction]]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
          />
          {t(`admin:vouchGraph.preview.legend.${direction}`)}
        </li>
      ))}
    </ul>
  );
}

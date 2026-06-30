import { portrait } from "./adminPeople.data";
import { TONE, findEdge, neighbors, personById } from "./adminVouchGraph.data";
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
 * A static, faithful thumbnail of a member's 1-hop trust network — same visual
 * language as the full modal (photos, trust-tone rings, jade mutual ties,
 * verified ticks, curved connectors). Signals what "Explore network" opens.
 */
export function VouchGraphPreview({ focusId }: { focusId: string }) {
  const focus = personById[focusId]!;
  const nbrs = neighbors(focusId, true).slice(0, MAX);
  const n = nbrs.length;
  const placed = nbrs.map((id, i) => {
    const ang = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2;
    return { id, x: CX + Math.cos(ang) * RX, y: CY + Math.sin(ang) * RY };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.previewSvg}
      role="img"
      aria-label={`Trust network for ${focus.name}: ${n} direct vouch connection${n === 1 ? "" : "s"}`}
    >
      <defs>
        <clipPath id="pvClipC">
          <circle r={CENTER_R} />
        </clipPath>
        <clipPath id="pvClipN">
          <circle r={NODE_R} />
        </clipPath>
      </defs>

      {placed.map((p) => {
        const e = findEdge(focusId, p.id);
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
        const cls = [
          styles.previewEdge,
          e?.mutual && styles.previewEdgeMutual,
          e?.withdrawn && styles.previewEdgeWithdrawn,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <path
            key={p.id}
            className={cls}
            fill="none"
            d={`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`}
          />
        );
      })}

      {placed.map((p) => (
        <PreviewNode
          key={p.id}
          id={p.id}
          x={p.x}
          y={p.y}
          r={NODE_R}
          clip="pvClipN"
        />
      ))}
      <PreviewNode
        id={focusId}
        x={CX}
        y={CY}
        r={CENTER_R}
        clip="pvClipC"
        focus
      />
    </svg>
  );
}

function PreviewNode({
  id,
  x,
  y,
  r,
  clip,
  focus = false,
}: {
  id: string;
  x: number;
  y: number;
  r: number;
  clip: string;
  focus?: boolean;
}) {
  const p = personById[id]!;
  const ink = TONE[p.tone];
  const photo = !p.private && !p.anon ? portrait(p.name) : undefined;
  const verified = p.standing === "trusted" && !p.anon;
  const sw = focus ? 2.5 : 2;

  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="var(--cream)" />
      {photo ? (
        <>
          <image
            href={photo}
            x={-r}
            y={-r}
            width={r * 2}
            height={r * 2}
            clipPath={`url(#${clip})`}
            preserveAspectRatio="xMidYMid slice"
          />
          <circle r={r} fill="none" stroke={ink.stroke} strokeWidth={sw} />
        </>
      ) : (
        <>
          <circle r={r} fill={ink.fill} stroke={ink.stroke} strokeWidth={sw} />
          <text
            className={styles.previewInit}
            dy={r / 3}
            fontSize={focus ? r * 0.6 : r * 0.7}
            fill={p.anon ? "var(--ink-40)" : ink.stroke}
          >
            {p.initials}
          </text>
        </>
      )}
      {verified && (
        <>
          <circle
            cx={r * 0.72}
            cy={r * 0.72}
            r={4.5}
            fill="var(--jade)"
            stroke="var(--paper)"
            strokeWidth={2}
          />
          <path
            d={`M ${r * 0.72 - 2} ${r * 0.72} l 1.4 1.4 l 2.6 -3`}
            stroke="var(--paper)"
            strokeWidth={1.3}
            fill="none"
          />
        </>
      )}
    </g>
  );
}

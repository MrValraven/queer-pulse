import type {
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import styles from "./AdminVouchGraph.module.css";

interface NodeProps {
  person: VouchPerson;
  radius: number;
  isFocus: boolean;
  fill: string;
  stroke: string;
  /** portrait URL, when the member has one */
  photo?: string;
  className: string;
  nodeRef: (el: SVGGElement | null) => void;
  onPointerDown: (e: ReactPointerEvent<SVGGElement>) => void;
  onPointerMove: (e: ReactPointerEvent<SVGGElement>) => void;
  onPointerUp: (e: ReactPointerEvent<SVGGElement>) => void;
  onPointerEnter: (e: ReactPointerEvent<SVGGElement>) => void;
  onPointerLeave: () => void;
  onDoubleClick: (e: ReactMouseEvent<SVGGElement>) => void;
}

/** A single node in the trust graph: halo, disc, identity glyph, verified tick, name. */
export function VouchGraphNode({
  person,
  radius: r,
  isFocus,
  fill,
  stroke,
  photo,
  className,
  nodeRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onDoubleClick,
}: NodeProps) {
  const verified = !!person.verified;
  const showPhoto = !!photo && !person.private;

  return (
    <g
      ref={nodeRef}
      className={className}
      role="button"
      tabIndex={-1}
      aria-label={person.role ? `${person.name}, ${person.role}` : person.name}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onDoubleClick={onDoubleClick}
    >
      {/* inner group carries the entrance animation; positioning lives on the outer <g> */}
      <g className={styles.nodeInner}>
        <circle className={styles.halo} r={r + 7} />
        {/* opaque backing so edges never show through / cross the disc */}
        <circle className={styles.nodeBg} r={r} />

        {showPhoto ? (
          <>
            <image
              href={photo}
              x={-r}
              y={-r}
              width={r * 2}
              height={r * 2}
              clipPath={`url(#vgClip${Math.round(r)})`}
              preserveAspectRatio="xMidYMid slice"
              className={styles.photo}
            />
            <circle className={styles.disc} r={r} fill="none" stroke={stroke} />
          </>
        ) : (
          <>
            <circle className={styles.disc} r={r} fill={fill} stroke={stroke} />
            {person.private ? (
              <g
                className={styles.lock}
                stroke={stroke}
                fill="none"
                strokeWidth={1.6}
              >
                <rect
                  x={-r * 0.3}
                  y={-r * 0.02}
                  width={r * 0.6}
                  height={r * 0.46}
                  rx={2}
                />
                <path
                  d={`M ${-r * 0.18} ${-r * 0.02} V ${-r * 0.22} a ${r * 0.18} ${r * 0.18} 0 0 1 ${r * 0.36} 0 V ${-r * 0.02}`}
                />
              </g>
            ) : (
              <text
                className={styles.init}
                dy={r / 3}
                fontSize={isFocus ? r * 0.7 : r * 0.8}
                fill={stroke}
              >
                {person.initials}
              </text>
            )}
          </>
        )}

        {verified && (
          <>
            <circle className={styles.vb} cx={r * 0.72} cy={r * 0.72} r={5} />
            <path
              className={styles.vbt}
              d={`M ${r * 0.72 - 2.3} ${r * 0.72} l 1.6 1.6 l 3 -3.4`}
            />
          </>
        )}
      </g>
      <text className={styles.nodeName} dy={r + 16} fontSize={12}>
        {person.name.length > 16 ? `${person.name.slice(0, 15)}…` : person.name}
      </text>
    </g>
  );
}

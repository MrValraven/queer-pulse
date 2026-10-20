import type { CSSProperties } from "react";
import type { NodeHandlers } from "./vouchCanvas.helpers";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import styles from "./vouchGraphCanvas.module.css";

interface NodeProps {
  person: VouchPerson;
  radius: number;
  isFocus: boolean;
  fill: string;
  stroke: string;
  /** portrait URL, when the member has one */
  photo?: string;
  className: string;
  isSelected: boolean;
  nodeRef: (element: SVGGElement | null) => void;
  /** Absent while the node fades out: it is then inert and hidden from AT. */
  handlers?: NodeHandlers;
}

/** A single node in the trust graph: halo, disc, identity glyph, verified tick, name. */
export function VouchGraphNode({
  person,
  radius,
  isFocus,
  fill,
  stroke,
  photo,
  className,
  isSelected,
  nodeRef,
  handlers,
}: NodeProps) {
  const verified = !!person.verified;
  const showPhoto = !!photo && !person.private;
  const isInteractive = !!handlers;
  // The touch hit circle scales from the node's own radius (CSS reads it).
  const hitStyle = { "--vg-node-r": radius } as CSSProperties;

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
      aria-pressed={isInteractive ? isSelected : undefined}
      aria-label={person.role ? `${person.name}, ${person.role}` : person.name}
      {...handlers}
    >
      {/* invisible hit circle: 44px on screen on touch screens */}
      <circle className={styles.hit} r={radius} style={hitStyle} />
      {/* inner group carries the entrance animation and the hover lift; positioning lives on the outer <g> */}
      <g className={styles.nodeInner}>
        <circle className={styles.halo} r={radius + 7} />
        {/* opaque backing so edges never show through / cross the disc */}
        <circle className={styles.nodeBg} r={radius} />

        {showPhoto ? (
          <>
            <image
              href={photo}
              x={-radius}
              y={-radius}
              width={radius * 2}
              height={radius * 2}
              clipPath={`url(#vgClip${Math.round(radius)})`}
              preserveAspectRatio="xMidYMid slice"
              className={styles.photo}
            />
            <circle
              className={styles.disc}
              r={radius}
              fill="none"
              stroke={stroke}
            />
          </>
        ) : (
          <>
            <circle
              className={styles.disc}
              r={radius}
              fill={fill}
              stroke={stroke}
            />
            {person.private ? (
              <g
                className={styles.lock}
                stroke={stroke}
                fill="none"
                strokeWidth={1.6}
              >
                <rect
                  x={-radius * 0.3}
                  y={-radius * 0.02}
                  width={radius * 0.6}
                  height={radius * 0.46}
                  rx={2}
                />
                <path
                  d={`M ${-radius * 0.18} ${-radius * 0.02} V ${-radius * 0.22} a ${radius * 0.18} ${radius * 0.18} 0 0 1 ${radius * 0.36} 0 V ${-radius * 0.02}`}
                />
              </g>
            ) : (
              <text
                className={styles.init}
                dy={radius / 3}
                fontSize={isFocus ? radius * 0.7 : radius * 0.8}
                fill={stroke}
              >
                {person.initials}
              </text>
            )}
          </>
        )}

        {verified && (
          <>
            <circle
              className={styles.vb}
              cx={radius * 0.72}
              cy={radius * 0.72}
              r={5}
            />
            <path
              className={styles.vbt}
              d={`M ${radius * 0.72 - 2.3} ${radius * 0.72} l 1.6 1.6 l 3 -3.4`}
            />
          </>
        )}
      </g>
      <text className={styles.nodeName} dy={radius + 16} fontSize={12}>
        {person.name.length > 16 ? `${person.name.slice(0, 15)}…` : person.name}
      </text>
    </g>
  );
}

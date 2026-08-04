import { useMemo } from "react";
import { create as createQr } from "qrcode";
import styles from "./InvitePage.module.css";

/** Modules of quiet zone around the symbol — the QR spec asks for 4; we use a
 *  slightly tighter 3 so the code stays large in the panel while still scanning. */
const QUIET_ZONE = 3;

/**
 * A crisp, self-contained SVG QR code for an invite link — for handing the
 * invitation across a table at an event, no copy-paste needed.
 *
 * Rendered as a single `<path>` of unit squares (one per dark module) rather than
 * a bitmap, so it stays razor-sharp at any size. Colours come from theme-stable
 * tokens (`--cream-rgb` tile, `--plum` modules — neither flips in dark mode), so
 * the code keeps its high-contrast dark-on-light look a scanner expects in either
 * theme. Returns nothing if the value can't be encoded, so the panel degrades to
 * its copy-link + share row rather than showing a broken box.
 */
export function InviteQrCode({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const symbol = useMemo(() => {
    try {
      const { modules } = createQr(value, { errorCorrectionLevel: "M" });
      const { size, data } = modules;
      let path = "";
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (data[row * size + col]) path += `M${col} ${row}h1v1h-1z`;
        }
      }
      return { path, size };
    } catch {
      return null;
    }
  }, [value]);

  if (!symbol) return null;

  const extent = symbol.size + QUIET_ZONE * 2;

  return (
    <div className={className}>
      <svg
        className={styles.qrSvg}
        viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${extent} ${extent}`}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <rect
          className={styles.qrTile}
          x={-QUIET_ZONE}
          y={-QUIET_ZONE}
          width={extent}
          height={extent}
        />
        <path className={styles.qrModules} d={symbol.path} />
      </svg>
    </div>
  );
}

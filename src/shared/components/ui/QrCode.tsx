import { useMemo, type ReactNode } from "react";
import QRCode from "qrcode";

/**
 * ISO/IEC 18004 specifies four clear modules on every side. It is part of the
 * symbol rather than decoration around it: a scanner uses the quiet zone to
 * find the symbol's edges, and a code drawn tight to its container is measurably
 * harder to acquire.
 */
const QUIET_ZONE_MODULES = 4;

/**
 * Error correction level Q recovers about 25% of the codewords, as against M's
 * 15%. The extra redundancy pays for the brand mark punched into the middle,
 * and for the wear a printed card picks up in a wallet.
 *
 * NOT level H, which is the usual choice for a logo QR. Measured against this
 * app's real payload, H produces a 61-module grid, and at the printed size a
 * membership card can give it that works out at 0.377mm per module, under the
 * roughly 0.4mm a phone camera needs. Q lands at 53 modules and stays above the
 * floor. See `cardPrintQr.test.ts`, which asserts exactly that.
 */
const ERROR_CORRECTION_LEVEL = "Q";

/**
 * The mark's width, as a fraction of the symbol's. At 0.2 it occludes about 4%
 * of the symbol's area, comfortably inside Q's budget even allowing for
 * Reed-Solomon interleaving, which concentrates a contiguous blot into a few
 * codewords rather than spreading it evenly.
 */
const MARK_WIDTH_RATIO = 0.2;

/** The glyph's height inside its plate, leaving the plate a visible edge. */
const MARK_GLYPH_RATIO = 0.74;

export interface QrCodeProps {
  /** What a scanner resolves. */
  url: string;
  /** Names the symbol for a screen reader. Empty when the symbol is
   *  decorative and an ancestor already carries the label. */
  ariaLabel: string;
  /** Rendered pixel size of the square SVG. */
  size: number;
  /** The colour of the light squares, and of the mark's plate. */
  lightFill: string;
  /** The colour of the dark modules, and of the Q itself. */
  darkFill: string;
  /**
   * Paint `lightFill` behind the whole symbol.
   *
   * True wherever the ground underneath cannot be trusted to be light: a
   * membership card can carry a pride flag, an uploaded photo, or one of four
   * dark skins, and a scanner needs dark-on-light POLARITY rather than merely
   * contrast. False where the symbol already sits on a known light surface,
   * which keeps that surface showing through as it does today.
   */
  hasLightPlate?: boolean;
  /**
   * Rendered in place of the symbol when the URL cannot be encoded, so each
   * caller states the failure in its own terms. A card says its code is
   * unavailable; a share sheet offers the raw link instead.
   */
  fallback?: ReactNode;
  className?: string;
}

/**
 * A scannable QR code with the QueerPulse Q at its centre, drawn as real SVG
 * elements: CSP-safe, with no external image request, no canvas, and no
 * `dangerouslySetInnerHTML`.
 *
 * The Q is an actual `<text>` glyph in `--serif` at weight 600, which is
 * literally the wordmark's Q (see `Navbar.module.css`, where `QueerPulse`
 * renders in the same family and weight with only the "Pulse" half italic).
 * Set as live CSS rather than baked into path data, so it follows the brand
 * font if that ever changes, and falls back through the same stack the
 * wordmark does if Fraunces has not loaded yet.
 *
 * On an encoding failure it renders the caller's `fallback`, so the symbol
 * never degrades into a blank hole.
 */
export function QrCode({
  url,
  ariaLabel,
  size,
  lightFill,
  darkFill,
  hasLightPlate = false,
  fallback = null,
  className,
}: QrCodeProps) {
  const symbol = useMemo(() => {
    try {
      return QRCode.create(url, {
        errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
      });
    } catch {
      return null;
    }
  }, [url]);

  if (!symbol) return <>{fallback}</>;

  const { modules } = symbol;
  const moduleCount = modules.size;
  const total = moduleCount + QUIET_ZONE_MODULES * 2;

  const darkModules: ReactNode[] = [];
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (!modules.get(row, column)) continue;
      darkModules.push(
        <rect
          key={`${row}-${column}`}
          x={column + QUIET_ZONE_MODULES}
          y={row + QUIET_ZONE_MODULES}
          width={1}
          height={1}
          fill={darkFill}
        />,
      );
    }
  }

  const centre = total / 2;
  const markSize = moduleCount * MARK_WIDTH_RATIO;

  return (
    <svg
      className={className}
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
    >
      {/* The modules are the only part that wants hard pixel edges. The plate
          and the glyph are curves, and would look chewed under crispEdges. */}
      <g shapeRendering="crispEdges">
        {hasLightPlate && (
          <rect x={0} y={0} width={total} height={total} fill={lightFill} />
        )}
        {darkModules}
      </g>

      {/* Decorative: the symbol above already carries the label, and a screen
          reader announcing a lone "Q" would be noise. */}
      <g aria-hidden="true">
        <rect
          x={centre - markSize / 2}
          y={centre - markSize / 2}
          width={markSize}
          height={markSize}
          fill={lightFill}
        />
        <text
          x={centre}
          y={centre}
          textAnchor="middle"
          dominantBaseline="central"
          fill={darkFill}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: `${markSize * MARK_GLYPH_RATIO}px`,
          }}
        >
          Q
        </text>
      </g>
    </svg>
  );
}

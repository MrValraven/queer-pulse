import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button, Modal } from "../../shared/components/ui";
import {
  MARK_INK_RATIO,
  MARK_OPTICAL_NUDGE_RATIO,
  markModulesFor,
} from "../../shared/components/ui/qrCentreMark";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type { Member } from "./data/members";
import styles from "./ProfileQrModal.module.css";

/**
 * Level Q recovers about 25% of the codewords, against M's 15%. The extra
 * redundancy pays for the Q punched into the middle. Same choice, for the same
 * reason, as the shared `QrCode` component.
 */
const ERROR_CORRECTION_LEVEL = "Q";

/** Quiet-zone modules the encoder draws around the symbol. */
const QUIET_ZONE_MODULES = 1;

const CANVAS_SIZE = 232;

/** QR contrast needs a real light/dark pair; tokens don't apply inside the
 *  generated bitmap itself. --plum on white. */
const DARK_FILL = "#2D1B3D";
const LIGHT_FILL = "#FFFFFF";

/** Arbitrary; text metrics scale linearly, so this only needs to be large
 *  enough that rounding in the returned metrics does not matter. */
const PROBE_FONT_SIZE = 100;

const FALLBACK_SERIF = '"Fraunces", Georgia, serif';

/**
 * A real, scannable QR code encoding a member's profile URL, plus a "save to
 * photos" PNG download. Renders via canvas (`QRCode.toCanvas`) so the
 * download can read pixels straight off it with `toDataURL` — the source
 * design's QR grid was a fake seeded-PRNG pattern for visual mockup only, not
 * an actual encoder, so it couldn't be ported as-is. Self-contained: only
 * mounted while open, so `Modal` owns the scroll-lock.
 *
 * The QueerPulse Q is painted onto the canvas after the encoder has run, so it
 * survives into the saved PNG rather than being a DOM overlay the download
 * would drop. It matches the shared `QrCode` component's geometry: a square
 * light plate a fifth of the symbol wide, with the wordmark's Q inside it.
 */
export function ProfileQrModal({
  profile,
  onClose,
}: {
  profile: Member;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Points at the normal `/members/:slug` profile, not the stripped-down
  // `/public-profile/:slug` surface — deliberate: the primary use case is
  // showing this to someone in person, and they land on the full profile
  // once scanned. `/members/:slug` is gated (see `GATED_PATTERNS` in
  // authGate.ts), so a logged-out scanner is bounced to sign-in first
  // (redirected back to this profile afterward) rather than seeing anything
  // immediately. `toAbsoluteUrl` resolves against the fixed `SITE_ORIGIN`,
  // not whatever origin happened to serve this page, matching how
  // `personaShareUrl` builds other shareable links. The profile is fixed for
  // the modal's lifetime, so this is plain derived data — no state needed,
  // and no dependency on navigation while open.
  const url = toAbsoluteUrl(`${routes.members}/${profile.slug}`);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isCancelled = false;

    QRCode.toCanvas(canvas, url, {
      width: CANVAS_SIZE,
      margin: QUIET_ZONE_MODULES,
      errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
      color: { dark: DARK_FILL, light: LIGHT_FILL },
    })
      // Wait for the brand serif before painting the glyph: canvas text takes
      // whatever is loaded at the moment it is drawn, with no re-render when a
      // webfont arrives later the way DOM text gets.
      .then(() => document.fonts.ready)
      .then(() => {
        if (!isCancelled) drawCentreMark(canvas, url);
      })
      .catch(() => {
        // Best-effort; a failed render just leaves the canvas blank, no error
        // UI needed for a non-critical share affordance.
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // The slug drives an on-disk filename — strip anything that isn't a safe
    // filename character rather than trusting it to already be one (slugs
    // are backend-authoritative in live mode, not just our own kebab-case
    // mocks).
    const safeSlug = profile.slug.replace(/[^a-zA-Z0-9_-]/g, "-");
    const link = document.createElement("a");
    link.download = `${safeSlug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <Modal
      title={t("members:profile.qr.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("members:profile.qr.doneCta")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t("members:profile.qr.save")}
          </Button>
        </>
      }
    >
      <p className={styles.intro}>{t("members:profile.qr.intro")}</p>
      <div className={styles.qrbox}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={styles.canvas}
        />
        <div className={styles.who}>
          <b>
            {profile.first} {profile.last}
          </b>
          <span>{url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Paints the light plate and the Q over the middle of an already-encoded
 * symbol. The plate is a square with hard corners, deliberately: a rounded
 * plate reads as a sticker sitting on the code rather than part of it.
 *
 * The font family comes from the live `--serif` token so the mark follows the
 * brand face, mirroring how the SVG `QrCode` sets it in CSS.
 */
function drawCentreMark(canvas: HTMLCanvasElement, url: string) {
  const context = canvas.getContext("2d");
  if (!context) return;

  let moduleCount: number;
  try {
    moduleCount = QRCode.create(url, {
      errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
    }).modules.size;
  } catch {
    return;
  }

  // Read the module pitch off the canvas the encoder actually sized, rather
  // than assuming CANVAS_SIZE: `toCanvas` rounds its width to a whole number
  // of pixels, and the pitch is rarely a whole number of them (232px over 35
  // modules is 6.63 each).
  const modulePixels = canvas.width / (moduleCount + QUIET_ZONE_MODULES * 2);
  const markModules = markModulesFor(moduleCount);

  // Both edges are CEILED, which is the exact inverse of how the encoder
  // assigns a pixel to a module: it paints pixel p in module
  // `floor((p - margin) / pitch)`, so a module's last pixel is the one below
  // the next boundary's ceiling. Rounding instead leaves a one-pixel sliver of
  // the border module alive on whichever side happened to round down — a
  // lopsided edge that reads as the mark being off centre.
  const edge = (module: number) =>
    Math.ceil((QUIET_ZONE_MODULES + module) * modulePixels);
  const near = edge((moduleCount - markModules) / 2);
  const far = edge((moduleCount + markModules) / 2);
  const centre = (near + far) / 2;

  context.fillStyle = LIGHT_FILL;
  context.fillRect(near, near, far - near, far - near);

  const serif =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--serif")
      .trim() || FALLBACK_SERIF;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  // Size by MEASURED ink rather than by font size. A font size buys a
  // different amount of visible letter in every face, so asking for the cap
  // height the mark wants, and solving for the size that delivers it, is what
  // keeps the Q filling its plate whether Fraunces loaded or Georgia stood in.
  // Text metrics scale linearly with the size, so one probe gives the ratios.
  const targetInk = (far - near) * MARK_INK_RATIO;
  context.font = `600 ${PROBE_FONT_SIZE}px ${serif}`;
  const probeBowl = context.measureText("O");
  const probeGlyph = context.measureText("Q");
  const probeInkWidth =
    probeGlyph.actualBoundingBoxRight + probeGlyph.actualBoundingBoxLeft;
  const fontSize = Math.min(
    (targetInk * PROBE_FONT_SIZE) / probeBowl.actualBoundingBoxAscent,
    // A Q is a touch wider than it is tall in most serifs. Held to the same
    // target so a wide face spills into the margin rather than over the code.
    (targetInk * PROBE_FONT_SIZE) / probeInkWidth,
  );
  context.font = `600 ${fontSize}px ${serif}`;

  // Centre the INK, not the type. `textAlign: "center"` centres the advance
  // width, which includes side bearings that need not be equal.
  const opticalNudge = (far - near) * MARK_OPTICAL_NUDGE_RATIO;
  const glyph = context.measureText("Q");
  const x =
    centre -
    (glyph.actualBoundingBoxRight - glyph.actualBoundingBoxLeft) / 2 -
    opticalNudge;

  // Vertically the reference is an O rather than the Q itself: the Q's tail
  // drops below the baseline, and centring ink that includes it would push the
  // bowl up. Type sets a Q's bowl on the same line as an O and lets the tail
  // overhang, so that is what gets centred here.
  const bowl = context.measureText("O");
  const y =
    centre +
    (bowl.actualBoundingBoxAscent - bowl.actualBoundingBoxDescent) / 2 -
    opticalNudge;

  context.fillStyle = DARK_FILL;
  context.fillText("Q", x, y);
}

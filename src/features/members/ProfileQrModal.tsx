import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button, Modal } from "../../shared/components/ui";
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

/** The mark's width, as a fraction of the symbol's — about 4% of its area. */
const MARK_WIDTH_RATIO = 0.2;

/** The glyph's height inside its plate, leaving the plate a visible edge. */
const MARK_GLYPH_RATIO = 0.74;

const CANVAS_SIZE = 232;

/** QR contrast needs a real light/dark pair; tokens don't apply inside the
 *  generated bitmap itself. --plum on white. */
const DARK_FILL = "#2D1B3D";
const LIGHT_FILL = "#FFFFFF";

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
          width={232}
          height={232}
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
  // than assuming CANVAS_SIZE: `toCanvas` rounds its width up to a whole
  // number of modules.
  const modulePixels = canvas.width / (moduleCount + QUIET_ZONE_MODULES * 2);
  const markSize = Math.round(moduleCount * MARK_WIDTH_RATIO * modulePixels);
  const centre = canvas.width / 2;
  const origin = Math.round(centre - markSize / 2);

  context.fillStyle = LIGHT_FILL;
  context.fillRect(origin, origin, markSize, markSize);

  const serif =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--serif")
      .trim() || FALLBACK_SERIF;
  context.fillStyle = DARK_FILL;
  context.font = `600 ${markSize * MARK_GLYPH_RATIO}px ${serif}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Q", centre, centre);
}

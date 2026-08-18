import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { toAbsoluteUrl } from "../../shared/seo";
import type { Member } from "./data/members";
import styles from "./ProfileQrModal.module.css";

/**
 * A real, scannable QR code encoding a member's public profile URL, plus a
 * "save to photos" PNG download. Renders via canvas (`QRCode.toCanvas`) so
 * the download can read pixels straight off it with `toDataURL` — the source
 * design's QR grid was a fake seeded-PRNG pattern for visual mockup only, not
 * an actual encoder, so it couldn't be ported as-is. Self-contained: only
 * mounted while open, so `Modal` owns the scroll-lock.
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
  // `/members/:slug` is gated (see `GATED_PATTERNS` in authGate.ts) — a
  // logged-out scanner would just get bounced to sign-in, defeating the
  // point of a scannable profile QR. `/public-profile/:slug` is the one
  // member surface meant to be readable without a session (see
  // `PublicProfileBySlug.tsx`'s doc comment). `toAbsoluteUrl` resolves
  // against the fixed `SITE_ORIGIN`, not whatever origin happened to serve
  // this page, matching how `personaShareUrl` builds other shareable links.
  // The profile is fixed for the modal's lifetime, so this is plain derived
  // data — no state needed, and no dependency on navigation while open.
  const url = toAbsoluteUrl(`${routes.publicProfile}/${profile.slug}`);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 232,
      margin: 1,
      // --plum on white — QR contrast needs a real light/dark pair, tokens
      // don't apply inside the generated bitmap itself.
      color: { dark: "#2D1B3D", light: "#FFFFFF" },
    }).catch(() => {
      // Best-effort; a failed render just leaves the canvas blank, no error
      // UI needed for a non-critical share affordance.
    });
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

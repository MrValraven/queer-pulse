import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileQR.module.css";

interface SubprofileQRProps {
  /** The URL the QR code resolves to (the persona's public share link). */
  url: string;
  ariaLabel: string;
  /** Rendered pixel size of the SVG (square). Defaults to 220. */
  size?: number;
}

type QRState =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error" };

/**
 * Scannable QR code for a persona's public share URL, rendered as inline SVG
 * (CSP-safe — no external image request, no canvas). Generation is async
 * (`qrcode`'s `toString` returns a promise), so this owns a small loading /
 * error state machine; on error it falls back to the raw URL as a plain link
 * so the share flow degrades gracefully rather than showing a blank card.
 */
export function SubprofileQR({ url, ariaLabel, size = 220 }: SubprofileQRProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<QRState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // Async QR generation (qrcode.toString promise); cancelled via cleanup below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });

    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: size,
      // Plum ink for the modules; transparent light so the surrounding card
      // surface shows through instead of a boxed-in white square. This is
      // rendered image data (the QR's own fill), not UI chrome — see
      // docs/superpowers/plans/2026-07-25-subprofiles-4c-qr-vcard.md.
      color: { dark: "#2D1B3D", light: "#00000000" },
    })
      .then((svg) => {
        if (!cancelled) setState({ status: "ready", svg });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (state.status === "error") {
    return (
      <div className={styles.card} style={{ width: size, height: size }}>
        <p className={styles.fallbackHint}>{t("subprofiles:qr.error")}</p>
        <a href={url} className={styles.fallbackLink}>
          {url}
        </a>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div
        className={styles.card}
        style={{ width: size, height: size }}
        aria-busy="true"
      >
        <span className={styles.loadingHint}>{t("subprofiles:qr.loading")}</span>
      </div>
    );
  }

  return (
    <div
      className={styles.card}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: state.svg }}
    />
  );
}

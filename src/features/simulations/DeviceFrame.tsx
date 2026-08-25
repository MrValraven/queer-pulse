import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DeviceFrame.module.css";

export type Device = "mobile" | "desktop";

interface DeviceFrameProps {
  src: string;
  title: string;
  device: Device;
  /** Called when Escape is pressed while focus is inside the running
   *  simulation iframe. The sandbox iframe is same-origin, so the parent can
   *  attach a keydown listener directly to its contentWindow. */
  onEscape?: () => void;
}

type Status = "loading" | "ready" | "error";

/** Tracks the outcome of the most recently framed src/device pair, keyed so
 *  that switching device or src re-enters "loading" instead of showing a
 *  stale ready/error state from the previous iframe. */
interface LoadState {
  key: string;
  status: "ready" | "error";
}

/** Phone/desktop framed iframe host for a sandboxed simulation instance. The
 *  iframe is always tagged data-sandbox="1" so the booted app instance forces
 *  offline demo mode (see shared/sandbox/sandbox.ts). Shows a loading overlay
 *  until the iframe fires onLoad, or an error message if it fires onError. */
export function DeviceFrame({
  src,
  title,
  device,
  onEscape,
}: DeviceFrameProps) {
  const { t } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState | null>(null);
  const frameKey = `${device}:${src}`;
  const status: Status =
    loadState && loadState.key === frameKey ? loadState.status : "loading";

  // Tracks the cleanup for the contentWindow keydown listener attached on
  // the most recent load, so a reframe (device/src change) or unmount tears
  // down the previous listener instead of leaking it.
  const escapeCleanupRef = useRef<(() => void) | null>(null);

  const handleFrameLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    setLoadState({ key: frameKey, status: "ready" });
    escapeCleanupRef.current?.();
    escapeCleanupRef.current = null;
    if (!onEscape) return;
    try {
      const frameWindow = event.currentTarget.contentWindow;
      if (!frameWindow) return;
      const handleFrameKeyDown = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === "Escape") onEscape();
      };
      frameWindow.addEventListener("keydown", handleFrameKeyDown);
      escapeCleanupRef.current = () =>
        frameWindow.removeEventListener("keydown", handleFrameKeyDown);
    } catch {
      // A cross-origin frame would throw on contentWindow access; sandbox
      // frames are same-origin so this is purely defensive.
    }
  };

  // React never delivers `onError` for an <iframe>: it registers only `load`
  // as a non-delegated event for iframe/object/embed (see the `case "iframe"`
  // arm of react-dom's event registration), so an `onError` prop here is dead
  // code and the failure overlay below could never appear. The listener has to
  // go on the node itself. Re-runs on `frameKey` because the iframe is keyed
  // on it and remounts when the device or src changes.
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    const frameNode = frameRef.current;
    if (!frameNode) return undefined;
    const handleNativeError = () => {
      setLoadState({ key: frameKey, status: "error" });
      escapeCleanupRef.current?.();
      escapeCleanupRef.current = null;
    };
    frameNode.addEventListener("error", handleNativeError);
    return () => frameNode.removeEventListener("error", handleNativeError);
  }, [frameKey]);

  useEffect(() => () => escapeCleanupRef.current?.(), []);

  return (
    <div className={styles.stage}>
      <div
        className={[
          styles.frame,
          device === "mobile" ? styles.frameMobile : styles.frameDesktop,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {status === "loading" && (
          <div className={styles.overlay}>
            {t("simulations:player.loading")}
          </div>
        )}
        {status === "error" && (
          <div className={styles.overlay}>
            {t("simulations:player.loadError")}
          </div>
        )}
        <iframe
          key={frameKey}
          ref={frameRef}
          src={src}
          title={title}
          data-sandbox="1"
          className={styles.iframe}
          onLoad={handleFrameLoad}
        />
      </div>
    </div>
  );
}

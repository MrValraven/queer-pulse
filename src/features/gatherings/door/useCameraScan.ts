import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cardTokenFromScan, isCameraScanSupported } from "./cardScan";

/** What a barcode detector hands back. Typed locally because `BarcodeDetector`
 *  is not in the DOM lib yet: it ships in Chromium browsers and nowhere else,
 *  which is exactly why the door never depends on it alone. */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorLike;

/** How often the frame is inspected. Four times a second reads a card held up
 *  to a phone instantly and leaves the device alone the rest of the time. */
const SCAN_INTERVAL_MS = 250;

export type CameraScanState =
  "unsupported" | "starting" | "scanning" | "denied" | "failed";

/**
 * A live camera reading membership-card QR codes (LOC-03).
 *
 * Real, and honest about where it is not. `BarcodeDetector` exists in Chromium
 * and nowhere else, so on an iPhone this reports `unsupported` and the door
 * falls back to the typed code, which works everywhere. Nothing here pretends
 * to scan: there is no simulated read, and no code path invents a guest.
 *
 * The stream is stopped on unmount and whenever the hook is disabled, so the
 * camera light goes out with the modal.
 */
export function useCameraScan(
  isEnabled: boolean,
  onToken: (cardToken: string) => void,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // The callback is held in a ref so a fresh closure from the caller never
  // restarts the camera. Written in a layout effect rather than during render,
  // which the refs lint rightly forbids.
  const onTokenRef = useRef(onToken);
  useLayoutEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);
  const [state, setState] = useState<CameraScanState>(() =>
    isCameraScanSupported() ? "starting" : "unsupported",
  );

  useEffect(() => {
    if (!isEnabled || !isCameraScanSupported()) return;
    // Captured up front: by cleanup time the ref may already point elsewhere.
    const videoElement = videoRef.current;
    let stream: MediaStream | null = null;
    let intervalId: number | undefined;
    let isCancelled = false;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (isCancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const DetectorConstructor = (
          window as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
        ).BarcodeDetector;
        const detector = new DetectorConstructor({ formats: ["qr_code"] });
        setState("scanning");
        intervalId = window.setInterval(() => {
          void (async () => {
            const element = videoRef.current;
            if (!element || element.readyState < 2) return;
            try {
              const codes = await detector.detect(element);
              const raw = codes[0]?.rawValue;
              if (!raw) return;
              const token = cardTokenFromScan(raw);
              if (token) onTokenRef.current(token);
            } catch {
              // A single unreadable frame is ordinary. The next one is along
              // in a quarter of a second.
            }
          })();
        }, SCAN_INTERVAL_MS);
      } catch (error) {
        if (isCancelled) return;
        const isDenied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "SecurityError");
        setState(isDenied ? "denied" : "failed");
      }
    };
    void start();

    return () => {
      isCancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, [isEnabled]);

  return { videoRef, state };
}

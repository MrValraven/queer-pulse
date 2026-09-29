import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject, SyntheticEvent } from "react";
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
  /** Bumped to replay: it joins the iframe's key, so a change tears the old
   *  instance down and boots a fresh one. The only way to watch a one-shot
   *  flow (the launch sequence) more than once without reloading the page. */
  replayKey?: number;
}

type Status = "loading" | "ready" | "error";

/** CSS viewport of a current mid-size phone (iPhone 14/15/16). The mobile
 *  frame always renders at exactly this size so the booted app lays out as it
 *  would on a real device; a stage too small to hold it scales the whole
 *  phone down instead of squashing the viewport. */
const PHONE_VIEWPORT_WIDTH = 390;
const PHONE_VIEWPORT_HEIGHT = 844;
/** The frame's 1px border sits outside the viewport (content-box sizing), so
 *  the phone's footprint is the viewport plus a border on each side. */
const PHONE_FRAME_BORDER_WIDTH = 1;
const PHONE_OUTER_WIDTH = PHONE_VIEWPORT_WIDTH + 2 * PHONE_FRAME_BORDER_WIDTH;
const PHONE_OUTER_HEIGHT = PHONE_VIEWPORT_HEIGHT + 2 * PHONE_FRAME_BORDER_WIDTH;

/** Desktop scrollbars take ~15px out of the phone viewport, which real phones
 *  never do (theirs overlay the content). Hidden inside the mobile frame only;
 *  wheel and trackpad scrolling still work. */
const PHONE_SCROLLBAR_STYLE =
  "*{scrollbar-width:none}*::-webkit-scrollbar{display:none}";

function hideFrameScrollbars(frameNode: HTMLIFrameElement) {
  const frameDocument = frameNode.contentDocument;
  if (!frameDocument?.head) return;
  const styleNode = frameDocument.createElement("style");
  styleNode.textContent = PHONE_SCROLLBAR_STYLE;
  frameDocument.head.appendChild(styleNode);
}

/** Largest scale (capped at 1) at which the phone fits the stage's content
 *  box, kept current as the window resizes. */
function usePhoneScale(
  stageRef: RefObject<HTMLDivElement | null>,
  isEnabled: boolean,
) {
  const [phoneScale, setPhoneScale] = useState(1);
  useLayoutEffect(() => {
    const stageNode = stageRef.current;
    if (!isEnabled || !stageNode) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      setPhoneScale(
        Math.min(1, width / PHONE_OUTER_WIDTH, height / PHONE_OUTER_HEIGHT),
      );
    });
    observer.observe(stageNode);
    return () => observer.disconnect();
  }, [stageRef, isEnabled]);
  return phoneScale;
}

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
  replayKey = 0,
}: DeviceFrameProps) {
  const { t } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState | null>(null);
  const frameKey = `${device}:${src}:${replayKey}`;
  const status: Status =
    loadState && loadState.key === frameKey ? loadState.status : "loading";
  const isMobile = device === "mobile";
  const stageRef = useRef<HTMLDivElement | null>(null);
  const phoneScale = usePhoneScale(stageRef, isMobile);

  // Tracks the cleanup for the contentWindow keydown listener attached on
  // the most recent load, so a reframe (device/src change) or unmount tears
  // down the previous listener instead of leaking it.
  const escapeCleanupRef = useRef<(() => void) | null>(null);

  const handleFrameLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    setLoadState({ key: frameKey, status: "ready" });
    escapeCleanupRef.current?.();
    escapeCleanupRef.current = null;
    if (isMobile) {
      try {
        hideFrameScrollbars(event.currentTarget);
      } catch {
        // Same-origin sandbox frames allow this; purely defensive, as below.
      }
    }
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

  // The slot takes the phone's scaled footprint in layout, since a transform
  // alone would leave the stage centring and scrolling the unscaled phone.
  const phoneSlotStyle: CSSProperties | undefined = isMobile
    ? {
        width: PHONE_OUTER_WIDTH * phoneScale,
        height: PHONE_OUTER_HEIGHT * phoneScale,
      }
    : undefined;
  const phoneFrameStyle: CSSProperties | undefined = isMobile
    ? {
        width: PHONE_VIEWPORT_WIDTH,
        height: PHONE_VIEWPORT_HEIGHT,
        transform: `translate(-50%, -50%) scale(${phoneScale})`,
      }
    : undefined;

  return (
    <div ref={stageRef} className={styles.stage}>
      <div
        className={isMobile ? styles.slotMobile : styles.slotDesktop}
        style={phoneSlotStyle}
      >
        <div
          className={[
            styles.frame,
            isMobile ? styles.frameMobile : styles.frameDesktop,
          ]
            .filter(Boolean)
            .join(" ")}
          style={phoneFrameStyle}
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
    </div>
  );
}

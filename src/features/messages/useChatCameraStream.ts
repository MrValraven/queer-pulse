// src/features/messages/useChatCameraStream.ts
import { useEffect, useRef, useState } from "react";

export type ChatCameraStreamState = "starting" | "live" | "denied" | "failed";

/**
 * Manages the live `getUserMedia` stream behind `ChatCameraCapture`'s in-app
 * camera sheet: starts a video stream for the given facing mode, tears the
 * previous stream down first whenever `facingMode` flips (front/back), and
 * stops every track on unmount so the camera light goes out the moment the
 * sheet closes. Mirrors `useCameraScan`'s own start/cleanup shape (see
 * `features/gatherings/door/useCameraScan.ts`) without its barcode-detection
 * loop: this sheet only needs a live viewfinder plus an on-demand single-frame
 * capture, which the caller does itself with its own canvas and shutter
 * button once `state` is `"live"`.
 */
export function useChatCameraStream(facingMode: "environment" | "user") {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<ChatCameraStreamState>("starting");

  useEffect(() => {
    // Captured up front, mirroring `useCameraScan`: by cleanup time the ref
    // may already point somewhere else (or nowhere, on unmount).
    const videoElement = videoRef.current;
    let stream: MediaStream | null = null;
    let isCancelled = false;
    // Resets the previous facing mode's outcome (`live`/`denied`/`failed`)
    // back to `starting` the moment the flip button is pressed, so the
    // error panel or a stale viewfinder doesn't linger while the new stream
    // negotiates; the async `start()` below is what actually depends on the
    // camera hardware, this is a synchronous external-system sync ahead of it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("starting");

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (!isCancelled) setState("live");
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
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, [facingMode]);

  return { videoRef, state };
}

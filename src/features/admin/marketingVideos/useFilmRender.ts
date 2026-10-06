import { useCallback, useEffect, useRef, useState } from "react";
import { filmUrl, scoreUrl, type MarketingVideo } from "./marketingVideos.data";
import {
  EncoderUnavailableError,
  renderFilm,
  type RenderProgress,
  type RenderStage,
  type RenderedFilm,
} from "./render/renderFilm";
import { CaptureError, requestTabShare } from "./render/tabCapture";

export type RenderFailure =
  "denied" | "wrongTab" | "stopped" | "stalled" | "encoder" | "failed";

export type RenderState =
  | { status: "idle" }
  | { status: "sharing" }
  | {
      status: "running";
      progress: RenderProgress;
      /** Seconds spent recording frames so far, for the time-left estimate. */
      elapsedSeconds: number;
    }
  | { status: "done"; film: RenderedFilm; url: string }
  | { status: "failed"; reason: RenderFailure };

function failureOf(error: unknown): RenderFailure {
  if (error instanceof CaptureError) {
    switch (error.failure) {
      case "denied":
        return "denied";
      case "wrong-tab":
        return "wrongTab";
      case "stopped":
        return "stopped";
      case "stalled":
        return "stalled";
      default:
        return "failed";
    }
  }
  if (error instanceof EncoderUnavailableError) return "encoder";
  return "failed";
}

/**
 * Renders one film to a downloadable file. `start` must be called from the
 * click that starts the render: it opens the browser's share picker, which
 * only appears in response to a user gesture.
 */
export function useFilmRender(video: MarketingVideo) {
  const [state, setState] = useState<RenderState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  const releaseFile = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      releaseFile();
    },
    [releaseFile],
  );

  const start = useCallback(
    (stage: RenderStage) => {
      abortRef.current?.abort();
      releaseFile();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ status: "sharing" });
      let framesStartedAt = 0;

      const run = async () => {
        let stream: MediaStream | null = null;
        try {
          // First call, still inside the click: the picker needs the gesture.
          stream = await requestTabShare();
          const film = await renderFilm({
            id: video.id,
            filmUrl: filmUrl(video.id),
            scoreUrl: scoreUrl(video.id),
            stream,
            stage,
            signal: controller.signal,
            onProgress: (progress) => {
              if (progress.step === "frames" && !framesStartedAt) {
                framesStartedAt = performance.now();
              }
              setState({
                status: "running",
                progress,
                elapsedSeconds: framesStartedAt
                  ? (performance.now() - framesStartedAt) / 1000
                  : 0,
              });
            },
          });
          if (controller.signal.aborted) return;
          const url = URL.createObjectURL(film.blob);
          urlRef.current = url;
          setState({ status: "done", film, url });
        } catch (error) {
          stream?.getTracks().forEach((track) => track.stop());
          if (controller.signal.aborted) {
            setState({ status: "idle" });
            return;
          }
          setState({ status: "failed", reason: failureOf(error) });
        }
      };
      void run();
    },
    [releaseFile, video.id],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort(new DOMException("Stopped", "AbortError"));
  }, []);

  const reset = useCallback(() => {
    releaseFile();
    setState({ status: "idle" });
  }, [releaseFile]);

  return { state, start, stop, reset };
}

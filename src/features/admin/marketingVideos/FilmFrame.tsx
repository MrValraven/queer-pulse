import { useLayoutEffect, useRef, type Ref } from "react";
import styles from "./MarketingVideos.module.css";

const FILM_WIDTH = 1920;

interface FilmFrameProps {
  src: string;
  /** Names the frame for assistive tech (iframes need a title). */
  title: string;
  iframeRef?: Ref<HTMLIFrameElement>;
  onLoad?: () => void;
  loading?: "lazy" | "eager";
}

/**
 * A film at its native 1920x1080, scaled down to fill its box. Films are laid
 * out in absolute pixels, so they are never resized, only scaled, which keeps
 * the preview identical to the rendered file.
 */
export function FilmFrame({
  src,
  title,
  iframeRef,
  onLoad,
  loading = "lazy",
}: FilmFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  // The scale is written straight onto the iframe from the observer, which
  // runs after layout and before paint. Going through React state would paint
  // one frame late, so a resized box (the preview going full screen) would
  // briefly show the film at its old size.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const iframe = box.querySelector("iframe");
      if (iframe) iframe.style.transform = `scale(${width / FILM_WIDTH})`;
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boxRef} className={styles.filmBox}>
      <iframe
        ref={iframeRef}
        className={styles.filmIframe}
        src={src}
        title={title}
        width={FILM_WIDTH}
        height={1080}
        loading={loading}
        tabIndex={-1}
        onLoad={onLoad}
      />
    </div>
  );
}

import { useLayoutEffect } from "react";
import { MapLoading } from "./MapLoading";
import s from "./localMap.module.css";

/** What the directory shows while the lazy map view downloads. It is the map
 *  view's own stage (same wrap, padding, frame and height) with the loader in
 *  it, so the handover to the real view changes nothing on screen. It reports
 *  when it first appeared, and the real view resumes its entrance and loader
 *  from that moment, so the visitor sees one continuous load. */
export function DirectoryMapFallback({
  onShown,
}: {
  onShown: (shownAt: number) => void;
}) {
  useLayoutEffect(() => {
    onShown(performance.now());
  }, [onShown]);

  return (
    <div className="wrap">
      <div className={s.directoryMapBody}>
        <div className={s.stage}>
          <div className={s.stageMap}>
            <div className={s.stageMapCanvas} />
            <MapLoading ready={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

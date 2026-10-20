import type { HullScene } from "./vouchCanvas.helpers";
import styles from "./vouchGraphCanvas.module.css";

interface SceneHullsProps {
  hullScenes: HullScene[];
  /** Scenes mode: the hulls fade in; elsewhere they fade out. */
  isVisible: boolean;
  registerHull: (sceneId: string, element: SVGPathElement | null) => void;
}

/**
 * C5: one soft convex hull per primary scene with 3+ visible members, drawn
 * under the edges in the scene colour. The painter writes each path's `d`
 * from the live node positions; this layer only owns the elements and their
 * fade.
 */
export function VouchGraphSceneHulls({
  hullScenes,
  isVisible,
  registerHull,
}: SceneHullsProps) {
  return (
    <g
      className={
        isVisible ? `${styles.hulls} ${styles.hullsVisible}` : styles.hulls
      }
      aria-hidden
    >
      {hullScenes.map((scene) => (
        <path
          key={scene.sceneId}
          ref={(element) => registerHull(scene.sceneId, element)}
          className={styles.hull}
          fill={scene.color}
          stroke={scene.color}
        />
      ))}
    </g>
  );
}

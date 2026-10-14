import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import type { StudioSceneCardView } from "./api/studioDiscovery.adapters";
import css from "./StudioCuration.module.css";

/** A scene on the home row: cover, name and city, one link. */
export function StudioSceneCard({ scene }: { scene: StudioSceneCardView }) {
  return (
    <Link to={scene.href} className={css.sceneCard}>
      <span className={css.sceneCover}>
        <ImageSlot
          src={scene.coverUrl ?? undefined}
          tint={scene.tint}
          width="100%"
          height="100%"
          radius={12}
          placeholder={scene.name}
          style={{ position: "absolute", inset: 0 }}
        />
      </span>
      <span className={css.sceneName}>{scene.name}</span>
      <span className={css.sceneCity}>{scene.city}</span>
    </Link>
  );
}

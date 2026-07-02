import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import ss from "./studio.module.css";
import { ALSO } from "./studioSheetStore.data";

export function StudioSheetAlso() {
  const loading = useSimulatedLoad();

  return (
    <section className={ss.row}>
      <div className={ss.rowH}>
        <h2>
          From the same <em>transcriber</em>
        </h2>
        <div className={ss.sub}>
          Teresa Rocha · 84 sheets · €0.55 reaches her per download
        </div>
      </div>
      {loading ? (
        <StudioCardGridSkeleton className={ss.rowGrid} count={ALSO.length} />
      ) : (
        <div className={ss.rowGrid}>
          {ALSO.map((a, i) => (
            <FadeIn
              key={a.pre}
              delay={Math.min(i, 8) * 60}
              as={Link}
              to={routes.studioSheetStore}
              className={ss.card}
            >
              <div className={ss.cardCov} style={{ aspectRatio: "0.77" }}>
                <ImageSlot
                  src={a.image}
                  tint={a.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder="score"
                  style={{ position: "absolute", inset: 0 }}
                />
                <span
                  className={`${ss.tag} ${a.tag === "Free read" ? ss.tagFree : ss.tagMem}`}
                >
                  {a.tag}
                </span>
              </div>
              <h4>
                {a.pre}
                <em>{a.em}</em>
              </h4>
              <div className={ss.meta}>{a.who}</div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}

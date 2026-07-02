import { Link } from "react-router-dom";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { linkToPath, routes } from "../../app/routeMap";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { OFF_AIR_LIBRARY, QUIET_HOURS } from "./studioOffAir.data";
import studioStyles from "./studio.module.css";

const cardTitle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 400,
  fontSize: 15,
  color: "rgba(247,243,238,.92)",
  letterSpacing: "-0.01em",
};
const meta: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(247,243,238,.4)",
};
const curator: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(247,243,238,.5)",
};
const rowNote: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(247,243,238,.4)",
};
const rowLink: React.CSSProperties = {
  marginLeft: "auto",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(247,243,238,.6)",
};

export function StudioOffAirShelves({ loading }: { loading: boolean }) {
  return (
    <>
      {/* Carry on section */}
      <section className={studioStyles.row} style={{ paddingTop: 24 }}>
        <div className={studioStyles.rowH}>
          <h2>
            Carry on where you <em>left off</em>
          </h2>
          <div style={rowNote}>
            From your library · plays on, broadcast or not
          </div>
          <Link to={routes.studioLibrary} style={rowLink}>
            Library →
          </Link>
        </div>
        {loading ? (
          <StudioCardGridSkeleton className={studioStyles.rowGrid} count={4} />
        ) : (
          <div className={studioStyles.rowGrid}>
            {OFF_AIR_LIBRARY.map((item, i) => (
              <FadeIn
                key={item.title}
                delay={Math.min(i, 8) * 60}
                as={Link}
                to={linkToPath(item.to)}
                className={studioStyles.card}
              >
                <div className={studioStyles.cardCov}>
                  <ImageSlot
                    src={item.image}
                    tint={item.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder="cover"
                  />
                  {item.tag && (
                    <span
                      className={`${studioStyles.tag} ${item.tag === "mem" ? studioStyles.tagMem : studioStyles.tagFree}`}
                    >
                      {item.tagLabel}
                    </span>
                  )}
                </div>
                {item.curator && <div style={curator}>{item.curator}</div>}
                <h4 style={cardTitle}>
                  {item.title} <em>{item.titleEm}</em>
                </h4>
                <div style={meta}>{item.meta}</div>
                {item.pay && (
                  <div style={meta}>
                    per play <em style={{ color: "var(--accent)" }}>€0.05</em>
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Quiet hours section */}
      <section className={studioStyles.row} style={{ paddingBottom: 50 }}>
        <div className={studioStyles.rowH}>
          <h2>
            For the <em>small hours</em>
          </h2>
          <div style={rowNote}>
            Council collections that don't need the lights on
          </div>
          <Link to={routes.studioSearch} style={rowLink}>
            All →
          </Link>
        </div>
        {loading ? (
          <StudioCardGridSkeleton className={studioStyles.rowGrid} count={4} />
        ) : (
          <div className={studioStyles.rowGrid}>
            {QUIET_HOURS.map((item, i) => (
              <FadeIn
                key={item.title}
                delay={Math.min(i, 8) * 60}
                as={Link}
                to={linkToPath(item.to)}
                className={studioStyles.card}
              >
                <div className={studioStyles.cardCov}>
                  <ImageSlot
                    src={item.image}
                    tint={item.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder="cover"
                  />
                </div>
                <div style={curator}>{item.curator}</div>
                <h4 style={cardTitle}>
                  {item.title} <em>{item.titleEm}</em>
                </h4>
                <div style={meta}>{item.meta}</div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

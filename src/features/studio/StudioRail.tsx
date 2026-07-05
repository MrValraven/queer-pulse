import { Link, NavLink } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  RAIL_MAIN,
  CONTRIBUTE,
  GOVERNANCE,
  UTILITY,
  LIBRARY,
  type RailLink,
} from "./studioShell.data";
import styles from "./studio.module.css";

function railClass({ isActive }: { isActive: boolean }) {
  return [styles.railItem, isActive && styles.railItemOn]
    .filter(Boolean)
    .join(" ");
}

function RailGroup({ items }: { items: RailLink[] }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          end={item.end}
          className={railClass}
        >
          <span className={styles.nm}>{item.label}</span>
        </NavLink>
      ))}
    </>
  );
}

export function StudioRail() {
  return (
    <aside className={styles.rail}>
      <div className={styles.brandRow}>
        <span className={styles.pulseDot} aria-hidden />
        <Link to={routes.homepage} className={styles.brand}>
          Queer<em>Pulse</em>
        </Link>
        <span className={styles.product}>Studio</span>
      </div>

      <div className={styles.railGrp}>
        <RailGroup items={RAIL_MAIN} />
      </div>

      <div className={styles.railDivider} />

      <div className={styles.railGrp}>
        <h5>Contribute</h5>
        <RailGroup items={CONTRIBUTE} />
      </div>

      <div className={styles.railGrp}>
        <h5>Governance</h5>
        <RailGroup items={GOVERNANCE} />
      </div>

      <div className={styles.railGrp}>
        <h5>The co-op</h5>
        <RailGroup items={UTILITY} />
      </div>

      <div className={styles.railDivider} />

      <div className={styles.railGrp}>
        <h5>In your library</h5>
        {LIBRARY.map((pl) => (
          <Link key={pl.name} to={pl.to} className={styles.plItem}>
            <span className={styles.plCov}>
              <ImageSlot
                src={pl.image}
                tint={pl.tint}
                width={36}
                height={36}
                radius={5}
                placeholder=""
              />
            </span>
            <span>
              <span className={styles.plName} style={{ display: "block" }}>
                {pl.name}
                <em>{pl.em}</em>
              </span>
              <span className={styles.plMeta}>{pl.meta}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className={styles.railFoot}>
        <em>Sustained</em> by you since Feb 2026.
        <span className={styles.pay}>
          You've paid <b>€312</b> to 47 artists this year.
        </span>
      </div>
    </aside>
  );
}

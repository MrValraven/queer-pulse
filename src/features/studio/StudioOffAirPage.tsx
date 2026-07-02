import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { StudioOffAirHero } from "./StudioOffAirHero";
import { StudioOffAirShelves } from "./StudioOffAirShelves";
import styles from "./StudioOffAirPage.module.css";

export function StudioOffAirPage() {
  const loading = useSimulatedLoad();

  return (
    <StudioShell>
      <StudioOffAirHero />

      <p className={styles.browseNote}>
        The doors are shut, but the shelves are open.{" "}
        <em>Browse anything below</em> — it all still plays.
      </p>

      <StudioOffAirShelves loading={loading} />
    </StudioShell>
  );
}

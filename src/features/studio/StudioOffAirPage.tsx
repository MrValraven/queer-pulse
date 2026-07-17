import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { StudioOffAirHero } from "./StudioOffAirHero";
import { StudioOffAirShelves } from "./StudioOffAirShelves";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./StudioOffAirPage.module.css";

export function StudioOffAirPage() {
  const loading = useSimulatedLoad();

  return (
    <StudioShell>
      <StudioOffAirHero />

      <p className={styles.browseNote}>
        <Translation
          i18nKey="studio:offAir.page.browseNote"
          components={{ em: <em /> }}
        />
      </p>

      <StudioOffAirShelves loading={loading} />
    </StudioShell>
  );
}

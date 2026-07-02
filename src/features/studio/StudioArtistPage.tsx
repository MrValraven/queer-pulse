import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioArtistHero } from "./StudioArtistHero";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioArtistSidebar } from "./StudioArtistSidebar";
import { TABS } from "./studioArtist.data";
import styles from "./studio.module.css";

export function StudioArtistPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Music");
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <StudioArtistHero onTip={() => setTipOpen(true)} />

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t}
            className={[styles.tab, tab === t && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <section className={styles.detailGrid}>
        <div>
          <StudioArtistMain tab={tab} />
        </div>
        <StudioArtistSidebar onTip={() => setTipOpen(true)} />
      </section>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}

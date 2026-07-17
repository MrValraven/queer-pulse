import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioArtistHero } from "./StudioArtistHero";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioArtistSidebar } from "./StudioArtistSidebar";
import { TABS, type ArtistTabId } from "./studioArtist.data";
import styles from "./studio.module.css";

export function StudioArtistPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ArtistTabId>("music");
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <StudioArtistHero onTip={() => setTipOpen(true)} />

      <div className={styles.tabs}>
        {TABS.map((tabItem) => (
          <button
            type="button"
            key={tabItem.id}
            className={[styles.tab, tab === tabItem.id && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(tabItem.id)}
          >
            {t(tabItem.labelKey)}
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

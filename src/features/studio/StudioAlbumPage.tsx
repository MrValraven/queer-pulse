import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioAlbumHero } from "./StudioAlbumHero";
import { StudioAlbumMain } from "./StudioAlbumMain";
import { StudioAlbumSidebar } from "./StudioAlbumSidebar";
import { StudioAlbumMore } from "./StudioAlbumMore";
import { TABS } from "./studioAlbum.data";
import styles from "./studio.module.css";

export function StudioAlbumPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tracklist");
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <StudioAlbumHero onTip={() => setTipOpen(true)} />

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
        <StudioAlbumMain tab={tab} />
        <StudioAlbumSidebar onTip={() => setTipOpen(true)} />
      </section>

      <StudioAlbumMore />

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}

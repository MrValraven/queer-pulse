import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioAlbumHero } from "./StudioAlbumHero";
import { StudioAlbumMain } from "./StudioAlbumMain";
import { StudioAlbumSidebar } from "./StudioAlbumSidebar";
import { StudioAlbumMore } from "./StudioAlbumMore";
import { TABS, type AlbumTabId } from "./studioAlbum.data";
import styles from "./studio.module.css";

export function StudioAlbumPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AlbumTabId>("tracklist");
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <StudioAlbumHero onTip={() => setTipOpen(true)} />

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

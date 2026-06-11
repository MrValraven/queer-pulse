import { PageShell } from "../../shared/components/layout";
import {
  PodcastHero,
  PodcastListenRow,
  PodcastEpisodes,
  PodcastSidebar,
} from "./PodcastShowSections";
import styles from "./PodcastShowPage.module.css";

export function PodcastShowPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <PodcastHero />
        <PodcastListenRow />
        <div className={styles.body}>
          <PodcastEpisodes />
          <PodcastSidebar />
        </div>
      </div>
    </PageShell>
  );
}

import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import { useSimulatedLoad } from "../../shared/hooks";
import { TagPageHero } from "./TagPageHero";
import { TagPageList } from "./TagPageList";
import styles from "./TagPage.module.css";

export function TagPage() {
  const loading = useSimulatedLoad();
  const [activeChip, setActiveChip] = useState(0);

  return (
    <PageShell>
      <MagazineMasthead active="longreads" />
      <div className={styles.page}>
        <TagPageHero activeChip={activeChip} onChip={setActiveChip} />
        <TagPageList
          key={activeChip}
          loading={loading}
          activeChip={activeChip}
          onResetChip={() => setActiveChip(0)}
        />
      </div>
    </PageShell>
  );
}

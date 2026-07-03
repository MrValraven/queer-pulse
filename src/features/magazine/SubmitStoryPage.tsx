import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import { SubmitStoryIntro } from "./SubmitStoryIntro";
import { SubmitStoryEditor } from "./SubmitStoryEditor";
import { SubmitStorySidebar } from "./SubmitStorySidebar";
import { SubmitStorySuccess } from "./SubmitStorySuccess";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStoryPage() {
  const [sentTitle, setSentTitle] = useState<string | null>(null);

  if (sentTitle !== null) {
    return <SubmitStorySuccess working={sentTitle} />;
  }

  return (
    <PageShell>
      <MagazineMasthead active="write" />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.hero}>
            <SubmitStoryIntro />
          </div>
          <div className={styles.editorGrid}>
            <SubmitStoryEditor onSubmit={setSentTitle} />
            <SubmitStorySidebar />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

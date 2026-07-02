import { PageShell } from "../../shared/components/layout";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorHeader } from "./AuthorHeader";
import { AuthorWork } from "./AuthorWork";
import styles from "./AuthorPage.module.css";

export function AuthorPage() {
  return (
    <PageShell>
      <MagazineMasthead />
      <div className={styles.page}>
        <AuthorHeader />
        <AuthorWork />
      </div>
    </PageShell>
  );
}

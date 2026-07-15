import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorHeader } from "./AuthorHeader";
import { AuthorWork } from "./AuthorWork";
import { AUTHORS, DEFAULT_AUTHOR_SLUG } from "./authorContent.data";
import { useAuthorPageData } from "./api/useAuthorPageData";
import styles from "./AuthorPage.module.css";

export function AuthorPage() {
  const { slug = DEFAULT_AUTHOR_SLUG } = useParams();
  const { data: liveAuthor } = useAuthorPageData(slug);
  const author = liveAuthor ?? AUTHORS[slug];

  if (!author) {
    return (
      <PageShell>
        <MagazineMasthead />
        <div className={styles.notFound}>
          <h2>We couldn't find that writer.</h2>
          <p>They may have moved on, or the link may be incomplete.</p>
          <Button to={routes.magazine}>Back to the magazine</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <MagazineMasthead />
      <div className={styles.page}>
        <AuthorHeader author={author} />
        <AuthorWork author={author} />
      </div>
    </PageShell>
  );
}

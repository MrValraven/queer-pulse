import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorHeader } from "./AuthorHeader";
import { AuthorWork } from "./AuthorWork";
import { AUTHORS, DEFAULT_AUTHOR_SLUG } from "./authorContent.data";
import { useAuthorPageData } from "./api/useAuthorPageData";
import styles from "./AuthorPage.module.css";

export function AuthorPage() {
  const { t } = useTranslation();
  const { slug = DEFAULT_AUTHOR_SLUG } = useParams();
  const { data: liveAuthor } = useAuthorPageData(slug);
  const author = liveAuthor ?? AUTHORS[slug];

  if (!author) {
    return (
      <PageShell>
        <MagazineMasthead />
        <div className={styles.notFound}>
          <h2>{t("magazine:author.notFoundTitle")}</h2>
          <p>{t("magazine:author.notFoundBody")}</p>
          <Button to={routes.magazine}>{t("magazine:author.notFoundCta")}</Button>
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

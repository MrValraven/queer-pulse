import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorHeader } from "./AuthorHeader";
import { AuthorWork } from "./AuthorWork";
import { AUTHORS, DEFAULT_AUTHOR_SLUG } from "./authorContent.data";
import { useAuthorPageData } from "./api/useAuthorPageData";
import styles from "./AuthorPage.module.css";

function AuthorLoadingState() {
  return (
    <PageShell>
      <MagazineMasthead />
      <div className={styles.page}>
        <div className={styles.hero} aria-hidden>
          <div>
            <SkeletonLine width={140} height={12} style={{ marginBottom: 16 }} />
            <SkeletonLine
              width="70%"
              height={64}
              style={{ marginBottom: 16 }}
            />
            <SkeletonLine
              width={220}
              height={18}
              style={{ marginBottom: 22 }}
            />
            <SkeletonLine width="90%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLine width="80%" height={16} />
          </div>
          <SkeletonLine
            height="auto"
            style={{
              aspectRatio: "3 / 4",
              borderRadius: 20,
              width: "100%",
              maxWidth: 300,
            }}
          />
        </div>
      </div>
    </PageShell>
  );
}

export function AuthorPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { slug = DEFAULT_AUTHOR_SLUG } = useParams();
  const { data: liveAuthor, isLoading } = useAuthorPageData(slug);

  // Demo mode uses the curated AUTHORS mock (the hook returns `null` in demo);
  // live mode uses ONLY the merged live author — never the mock — so a failed
  // or unknown live fetch falls through to the not-found wall below instead of
  // silently rendering fabricated content.
  const author = demoMode ? AUTHORS[slug] : liveAuthor;

  if (!demoMode && isLoading) {
    return <AuthorLoadingState />;
  }

  if (!author) {
    return (
      <PageShell>
        <MagazineMasthead />
        <div className={styles.notFound}>
          <h2>{t("magazine:author.notFoundTitle")}</h2>
          <p>{t("magazine:author.notFoundBody")}</p>
          <Button to={routes.magazine}>
            {t("magazine:author.notFoundCta")}
          </Button>
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

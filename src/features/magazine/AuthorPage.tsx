import { Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorHeader } from "./AuthorHeader";
import { AuthorWork } from "./AuthorWork";
import { AUTHORS, DEFAULT_AUTHOR_SLUG } from "./authorContent.data";
import { getMember } from "../members/data/members";
import { useAuthorPageData } from "./api/useAuthorPageData";
import { MagazineLoadError } from "./MagazineLoadError";
import { clampDescription, nodeToText, nodeToTitleText } from "./nodeText";
import styles from "./AuthorPage.module.css";

function AuthorLoadingState() {
  return (
    <PageShell>
      <MagazineMasthead />
      <div className={styles.page}>
        <div className={styles.hero} aria-hidden>
          <div>
            <SkeletonLine
              width={140}
              height={12}
              style={{ marginBottom: 16 }}
            />
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

/**
 * `/magazine/author` with no `:slug`. Demo mode opens the curated default
 * writer; live mode has no member at that mock slug, so it used to fetch it
 * and land on the not-found wall. It goes to the authors directory instead,
 * which is the real "which writers are there" surface (PRD-101).
 */
export function AuthorPage() {
  const { demoMode } = useDemoMode();
  const { slug } = useParams();
  const resolved = slug ?? (demoMode ? DEFAULT_AUTHOR_SLUG : null);
  if (!resolved) return <Navigate to={routes.magazineAuthors} replace />;
  return <AuthorProfile slug={resolved} />;
}

function AuthorProfile({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const {
    data: liveAuthor,
    isLoading,
    isError,
    refetch,
  } = useAuthorPageData(slug);

  // Demo mode uses the curated AUTHORS mock (the hook returns `null` in demo);
  // live mode uses ONLY the merged live author — never the mock — so a failed
  // or unknown live fetch falls through to the not-found wall below instead of
  // silently rendering fabricated content.
  //
  // CON-11: the demo registry keys its writers by member slug for the ones who
  // are also members, so the byline/member link is a real lookup here rather
  // than a guess. Live mode gets `memberSlug` off the DTO.
  const demoAuthor = AUTHORS[slug];
  const author = demoMode
    ? demoAuthor && {
        ...demoAuthor,
        memberSlug: getMember(slug) ? slug : null,
        pieceCount: demoAuthor.articles.length,
      }
    : liveAuthor;

  if (!demoMode && isLoading) {
    return <AuthorLoadingState />;
  }

  if (!demoMode && isError) {
    // The fetch failed, so the writer may well exist: offer a retry instead of
    // the not-found wall, and keep the outage out of the index (FE-CNT-08).
    return (
      <PageShell>
        <PageMeta title={t("magazine:load.errorMetaTitle")} noIndex />
        <MagazineMasthead />
        <div className={styles.notFound}>
          <MagazineLoadError onRetry={() => void refetch()} />
        </div>
      </PageShell>
    );
  }

  if (!author) {
    return (
      <PageShell>
        <PageMeta title={t("magazine:author.notFoundMetaTitle")} noIndex />
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

  // A shared byline link has to preview as that writer, never as the site
  // homepage (FE-CNT-12). The name carries a coral <em> and a trailing full
  // stop in the view model, so it is flattened for the tab title.
  const authorName = nodeToTitleText(author.name);
  const authorBio = clampDescription(nodeToText(author.bio));

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:author.metaTitle", { name: authorName })}
        description={
          authorBio ||
          t("magazine:author.metaDescription", { name: authorName })
        }
        canonical={`${routes.author}/${author.slug}`}
        image={author.portrait || undefined}
        type="profile"
      />
      <MagazineMasthead />
      <div className={styles.page}>
        <AuthorHeader author={author} />
        <AuthorWork author={author} />
      </div>
    </PageShell>
  );
}

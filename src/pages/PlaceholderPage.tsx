import { useLocation } from "react-router-dom";
import { PageShell } from "../shared/components/layout";
import { Button, Eyebrow } from "../shared/components/ui";
import { Translation } from "../shared/i18n/Translation";
import { useTranslation } from "../shared/i18n/useTranslation";
import styles from "./PlaceholderPage.module.css";

/**
 * Turn a path like "/business-directory" into "Business Directory". This is
 * derived from the route slug, not authored copy — it stays English in both
 * locales since there's no mapping from arbitrary un-built route slugs to
 * pt-PT titles.
 */
function titleFromPath(pathname: string): string {
  const slug = pathname.replace(/^\//, "").split("/")[0];
  if (!slug) return "QueerPulse";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const title = titleFromPath(pathname);

  return (
    <PageShell>
      <section className={styles.page}>
        <div className={styles.inner}>
          <Eyebrow className={styles.eyebrow}>
            {t("system:placeholder.eyebrow")}
          </Eyebrow>
          <h1 className={styles.title}>
            <Translation
              i18nKey="system:placeholder.title"
              values={{ title }}
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("system:placeholder.sub")}</p>
          <Button size="lg" to="/">
            {t("system:placeholder.backCta")}
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

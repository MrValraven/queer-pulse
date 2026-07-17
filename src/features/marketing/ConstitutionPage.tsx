import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ARTICLES } from "./constitution.data";
import styles from "./ConstitutionPage.module.css";

const N = ({ n }: { n: string }) => <span className={styles.num}>{n}</span>;

export function ConstitutionPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink
            to={routes.governance}
            label={t("marketing:hub.governanceLabel")}
          />
          <div className={styles.eyebrow}>
            {t("marketing:constitution.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:constitution.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:constitution.hero.dek1"
              components={{ b: <b />, em: <em /> }}
            />
          </p>
          <p className={styles.dek}>{t("marketing:constitution.hero.dek2")}</p>
          <p className={styles.meta}>
            <Translation
              i18nKey="marketing:constitution.hero.meta"
              components={{ b: <b /> }}
            />
          </p>
        </div>
      </section>

      <nav className={styles.toc}>
        <div className={styles.tocInner}>
          {ARTICLES.map((article) => (
            <a key={article.id} href={`#${article.id}`}>
              {t(article.tocKey)}
            </a>
          ))}
        </div>
      </nav>

      <article className={styles.body}>
        {ARTICLES.map((article, articleIndex) => (
          <section className={styles.art} id={article.id} key={article.id}>
            <div className={styles.artNum}>
              {t("marketing:constitution.artNumLabel")} <em>{article.roman}</em>
            </div>
            <h2>
              <Translation
                i18nKey={article.titleKey}
                components={{ em: <em /> }}
              />
            </h2>
            {article.clauseKeys.map((clauseKey, clauseIndex) => (
              <p className={styles.clause} key={clauseKey}>
                <N n={`§${articleIndex + 1}·${clauseIndex + 1}`} />
                <Translation
                  i18nKey={clauseKey}
                  components={{ strong: <strong />, em: <em /> }}
                />
              </p>
            ))}
            {article.quoteKey && (
              <p className={styles.quote}>
                <Translation
                  i18nKey={article.quoteKey}
                  components={{ em: <em /> }}
                />
              </p>
            )}
          </section>
        ))}
      </article>

      <div className={styles.version}>
        <Translation
          i18nKey="marketing:constitution.footer.version"
          components={{ b: <b /> }}
        />{" "}
        <a>{t("marketing:constitution.footer.downloadPdf")}</a> ·{" "}
        {t("marketing:constitution.footer.seeAssembly")} ·{" "}
        {t("marketing:constitution.footer.readCodeOfConduct")}
      </div>
    </PageShell>
  );
}

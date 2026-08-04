import { FiCheckCircle, FiHeart } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { PROVIDERS } from "./queerPaediatricians.data";
import styles from "./resources.module.css";

export function QueerPaediatriciansPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const pageTitle = t("resources:queerPaediatricians.meta.title");
  const pageDescription = t("resources:queerPaediatricians.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/queer-paediatricians",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/queer-paediatricians" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:queerPaediatricians.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:queerPaediatricians.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:queerPaediatricians.hero.lead")}
        anchors={[
          {
            label: t("resources:queerPaediatricians.hero.anchor.list"),
            href: "#list",
          },
          {
            label: t("resources:queerPaediatricians.hero.anchor.how"),
            href: "#how",
          },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="list">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:queerPaediatricians.list.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:queerPaediatricians.list.lead")}
          </Reveal>
          {demoMode ? (
            <div className={styles.grid}>
              {PROVIDERS.map((p, i) => (
                <Reveal key={p.name} className={styles.card} delay={i * 55}>
                  <span className={styles.verifiedTag}>
                    <FiCheckCircle aria-hidden /> {p.checked}
                  </span>
                  <div className={styles.cardName} style={{ fontSize: 19 }}>
                    {p.name}
                  </div>
                  <div className={styles.archiveMeta}>
                    {p.practice} · {p.neighbourhood}
                  </div>
                  <div className={styles.cardSpec}>{p.notedFor}</div>
                  <div className={styles.tags}>
                    {p.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ))}
              <div className={`${styles.card} ${styles.cardDashed}`}>
                {t("resources:queerPaediatricians.suggest.prompt")}
                <Button
                  variant="ghost"
                  style={{ marginTop: 12 }}
                  onClick={() =>
                    showToast(t("resources:queerPaediatricians.suggest.toast"))
                  }
                >
                  {t("resources:queerPaediatricians.suggest.cta")}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<FiHeart />}
              title={t("resources:queerPaediatricians.live.title")}
              description={t("resources:queerPaediatricians.live.body")}
              action={{
                label: t("resources:queerPaediatricians.live.cta"),
                to: routes.forum,
              }}
            />
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:queerPaediatricians.how.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "64ch" }}>
            {t("resources:queerPaediatricians.how1")}
          </Reveal>
          <Reveal as="p" className={styles.leadP} style={{ maxWidth: "64ch" }}>
            {t("resources:queerPaediatricians.how2")}
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:queerPaediatricians.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:queerPaediatricians.outro.sub")}
      >
        <Button to={routes.forum} variant="primary" size="lg">
          {t("resources:queerPaediatricians.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}

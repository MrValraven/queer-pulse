import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { WhatSection, HowSection, WhySection } from "./CommunitiesAboutSections";
import styles from "./CommunitiesAboutPage.module.css";

export function CommunitiesAboutPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:communitiesAbout.meta.title");
  const pageDescription = t("marketing:communitiesAbout.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.aboutCommunities },
        ])}
      />
      <PageHero
        plum={false}
        eyebrow={t("marketing:communitiesAbout.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:communitiesAbout.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:communitiesAbout.hero.sub")}
      />

      <div className={styles.page}>
        <WhatSection />
        <HowSection />
        <WhySection />
      </div>

      <Outro
        title={t("marketing:communitiesAbout.outro.title")}
        sub={t("marketing:communitiesAbout.outro.sub")}
      >
        <Button to={routes.requestInvite}>{t("nav:requestInvite")}</Button>
      </Outro>
    </PageShell>
  );
}

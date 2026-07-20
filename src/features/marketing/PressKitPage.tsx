import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { PressKitDownloadModal } from "./PressKitDownloadModal";
import { buildKitManifest, buildKitPreview } from "./pressKitAssets.data";
import {
  BoilerplateSection,
  ColourSection,
  CoverageSection,
  DownloadsSection,
  FactsSection,
  MarkSection,
  PhotographySection,
  TeamSection,
} from "./PressKitSections";
import styles from "./PressKitPage.module.css";

export function PressKitPage() {
  const { t } = useTranslation();
  const [showDownload, setShowDownload] = useState(false);
  const kitManifest = useMemo(() => buildKitManifest(t), [t]);
  const kitPreview = useMemo(() => buildKitPreview(t), [t]);
  const pageTitle = t("marketing:pressKit.meta.title");
  const pageDescription = t("marketing:pressKit.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.pressKit },
        ])}
      />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {t("marketing:pressKit.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:pressKit.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:pressKit.hero.dek"
              components={{ b: <b /> }}
            />
          </p>
          <div className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowDownload(true)}
            >
              {t("marketing:pressKit.hero.downloadKitCta")}
            </Button>
            <Button href="mailto:press@queerpulse.app" variant="ghost">
              {t("marketing:pressKit.hero.askPersonCta")}
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.contactStrip}>
        <div className={styles.contactInner}>
          <span>
            <Translation
              i18nKey="marketing:pressKit.contact.deskLabel"
              components={{ b: <b /> }}
            />{" "}
            <a href="mailto:press@queerpulse.app">press@queerpulse.app</a>
          </span>
          <span className={styles.sep}>·</span>
          <span>
            <Translation
              i18nKey="marketing:pressKit.contact.phoneLabel"
              components={{ b: <b /> }}
            />
          </span>
          <span className={styles.sep}>·</span>
          <span>
            <Translation
              i18nKey="marketing:pressKit.contact.responseLabel"
              components={{ b: <b /> }}
            />
          </span>
          <span className={styles.sep}>·</span>
          <span>
            <Translation
              i18nKey="marketing:pressKit.contact.languagesLabel"
              components={{ b: <b /> }}
            />
          </span>
        </div>
      </div>

      <div className={styles.page}>
        <BoilerplateSection />
        <MarkSection />
        <ColourSection />
        <PhotographySection />
        <TeamSection />
        <FactsSection />
        <CoverageSection />
        <DownloadsSection />

        <div className={styles.footerNote}>
          <Translation
            i18nKey="marketing:pressKit.footerNote.licence"
            components={{
              a: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content -- false positive: an element template for <Translation>, which clones it with the translated children at render.
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer"
                />
              ),
            }}
          />
          <br />
          <Translation
            i18nKey="marketing:pressKit.footerNote.commercial"
            // eslint-disable-next-line jsx-a11y/anchor-has-content -- false positive: an element template for <Translation>, which clones it with the translated children at render.
            components={{ a: <a href="mailto:press@queerpulse.app" /> }}
          />
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="marketing:pressKit.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:pressKit.outro.sub")}
      >
        <Button size="lg" href="mailto:press@queerpulse.app">
          {t("marketing:pressKit.outro.contactCta")}
        </Button>
      </Outro>

      {showDownload && (
        <PressKitDownloadModal
          eyebrow={t("marketing:pressKit.downloadModal.eyebrow")}
          title={
            <Translation
              i18nKey="marketing:pressKit.downloadModal.title"
              components={{ em: <em /> }}
            />
          }
          lead={
            <Translation
              i18nKey="marketing:pressKit.downloadModal.lead"
              components={{ b: <b /> }}
            />
          }
          rows={kitPreview}
          asset={kitManifest}
          buttonLabel={t("marketing:pressKit.downloadModal.buttonLabel")}
          onClose={() => setShowDownload(false)}
        />
      )}

      <SubpageIndex
        title={t("marketing:pressKit.subpageIndex.title")}
        items={[
          {
            label: t("marketing:pressKit.subpageIndex.archive.label"),
            to: routes.pressArchive,
            blurb: t("marketing:pressKit.subpageIndex.archive.blurb"),
          },
        ]}
      />
    </PageShell>
  );
}

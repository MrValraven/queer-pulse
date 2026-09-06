import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { PressKitDownloadModal } from "./PressKitDownloadModal";
import { PRESS_ASSETS, buildKitPreview } from "./pressKitAssets.data";
import {
  BoilerplateSection,
  ColourSection,
  CoverageSection,
  DownloadsSection,
  FactsSection,
  MarkSection,
  TeamSection,
} from "./PressKitSections";
import styles from "./PressKitPage.module.css";

export function PressKitPage() {
  const { t } = useTranslation();
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
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
      <PageHero
        plum={false}
        eyebrow={t("marketing:pressKit.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:pressKit.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="marketing:pressKit.hero.dek"
            components={{ b: <b /> }}
          />
        }
      >
        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsDownloadOpen(true)}
          >
            {t("marketing:pressKit.hero.downloadKitCta")}
          </Button>
          {/* PRD-272. Every press call on this page used to be a
              `mailto:hello@queerpulse.com`, so a journalist on deadline
              landed in a shared mailbox with no queue, no assignment and no
              status. `?topic=press` is the Contact page's own press route:
              the same tracked `inquiries` row the Contact form writes, worked
              in `/admin/inquiries`. */}
          <Button to={`${routes.contact}?topic=press`} variant="ghost">
            {t("marketing:pressKit.hero.askPersonCta")}
          </Button>
        </div>
      </PageHero>

      <div className={styles.contactStrip}>
        <div className={styles.contactInner}>
          <span>
            <Translation
              i18nKey="marketing:pressKit.contact.deskLabel"
              components={{ b: <b /> }}
            />{" "}
            {/* The desk address stays PUBLISHED — a press page that hides how
                to reach the desk is not a press page — but it is no longer a
                `mailto:` affordance, because the tracked route is the button
                above and a link that opens a mail client is exactly what
                PRD-272 is about. Plain text: copyable, honest, untracked only
                if a journalist chooses it. */}
            <span className={styles.contactEmail}>
              {t("marketing:pressKit.contact.email")}
            </span>
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
        <TeamSection />
        <FactsSection />
        <CoverageSection />
        <DownloadsSection />

        <div className={styles.footerNote}>
          <Translation
            i18nKey="marketing:pressKit.footerNote.licence"
            components={{
              a: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- false positive: an element template for <Translation>, which clones it with the translated children (its accessible name) at render.
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
          <br />
          <Translation
            i18nKey="marketing:pressKit.footerNote.commercial"
            components={{ a: <Link to={`${routes.contact}?topic=press`} /> }}
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
        <Button size="lg" to={`${routes.contact}?topic=press`}>
          {t("marketing:pressKit.outro.askCta")}
        </Button>
      </Outro>

      {isDownloadOpen && (
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
          asset={PRESS_ASSETS.completeKit}
          buttonLabel={t("marketing:pressKit.downloadModal.buttonLabel")}
          onClose={() => setIsDownloadOpen(false)}
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

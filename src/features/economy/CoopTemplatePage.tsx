import { Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COOP_TEMPLATE_CONTENT,
  type CoopTemplateSlug,
} from "./coopTemplateContent.data";
import styles from "./CoopTemplatePage.module.css";

const VALID_SLUGS = Object.keys(COOP_TEMPLATE_CONTENT) as CoopTemplateSlug[];

/**
 * Full in-app document for one housing co-op formation template. Cards on
 * `HousingCoopPage` link here by slug; the content itself lives in
 * `coopTemplateContent.data.tsx` (English-authored drafts, not yet translated
 * — PT falls back to the same text, same as the rest of the platform-authored
 * housing co-op content).
 *
 * DEFERRED (tracker P3-27): `coopTemplateContent.data.tsx` is ~750 lines of
 * legal/organisational formation prose across several templates. Localising it
 * to pt-PT at EN/PT parity is a professional legal-translation task, not a
 * mechanical string move, so it is intentionally left English-only for now (the
 * page shows a disclaimer). The chrome around it (back link, disclaimer) IS
 * already routed through the `economy` catalog. Localise the document bodies in
 * a dedicated i18n pass when PT translation capacity is available.
 */
export function CoopTemplatePage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !VALID_SLUGS.includes(slug as CoopTemplateSlug)) {
    return <Navigate to={routes.housingCoop} replace />;
  }
  const doc = COOP_TEMPLATE_CONTENT[slug as CoopTemplateSlug];

  return (
    <PageShell>
      <div className={styles.page}>
        <article className={styles.doc}>
          <div className="wrap">
            <HubBackLink
              to={routes.housingCoop}
              label={t("economy:coopTemplate.back")}
              tone="light"
            />
            <div className={styles.tag}>{doc.tag}</div>
            <h1 className={styles.title}>
              {doc.title} <em>{doc.titleEm}</em>
            </h1>
            <p className={styles.intro}>{doc.intro}</p>
            <p className={styles.disclaimer}>
              {t("economy:coopTemplate.disclaimer")}
            </p>
            {doc.sections.map((section) => (
              <section className={styles.section} key={section.heading}>
                <h2>{section.heading}</h2>
                {section.blocks.map((block, index) =>
                  block.kind === "p" ? (
                    <p key={index}>{block.text}</p>
                  ) : (
                    <ul key={index}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </PageShell>
  );
}

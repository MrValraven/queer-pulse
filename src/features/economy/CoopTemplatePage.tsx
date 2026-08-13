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
 * `HousingCoopPage` link here by slug. The document's SHAPE (sections and
 * blocks) lives in `coopTemplateContent.data.tsx`; its prose is localised in the
 * `economy` catalog under `coopTemplate.doc.<slug>.*` (EN + pt-PT), so the page
 * renders in the active language like the rest of the platform. The page walks
 * the shape and resolves each heading, paragraph, and list item by index.
 *
 * NOTE: the pt-PT co-op template copy is a DRAFT machine translation and needs
 * professional legal review before launch — it is legal/governance prose. The
 * page also shows a disclaimer on every document.
 */
export function CoopTemplatePage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !VALID_SLUGS.includes(slug as CoopTemplateSlug)) {
    return <Navigate to={routes.housingCoop} replace />;
  }
  const doc = COOP_TEMPLATE_CONTENT[slug as CoopTemplateSlug];
  const base = `economy:coopTemplate.doc.${doc.slug}`;

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
            <div className={styles.tag}>{t(`${base}.tag`)}</div>
            <h1 className={styles.title}>
              {t(`${base}.title`)} <em>{t(`${base}.titleEm`)}</em>
            </h1>
            <p className={styles.intro}>{t(`${base}.intro`)}</p>
            <p className={styles.disclaimer}>
              {t("economy:coopTemplate.disclaimer")}
            </p>
            {doc.sections.map((section, sectionIndex) => {
              const sectionBase = `${base}.s${sectionIndex}`;
              return (
                <section className={styles.section} key={sectionIndex}>
                  <h2>{t(`${sectionBase}.h`)}</h2>
                  {section.blocks.map((block, blockIndex) =>
                    block.kind === "p" ? (
                      <p key={blockIndex}>
                        {t(`${sectionBase}.b${blockIndex}`)}
                      </p>
                    ) : (
                      <ul key={blockIndex}>
                        {Array.from(
                          { length: block.items },
                          (_element, itemIndex) => (
                            <li key={itemIndex}>
                              {t(`${sectionBase}.b${blockIndex}.${itemIndex}`)}
                            </li>
                          ),
                        )}
                      </ul>
                    ),
                  )}
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </PageShell>
  );
}

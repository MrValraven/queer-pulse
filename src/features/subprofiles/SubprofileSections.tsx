import { FiExternalLink } from "react-icons/fi";
import {
  ImageSlot,
  Reveal,
  SectionHead,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import styles from "./SubprofileSections.module.css";

/** A field is rendered only when the section's descriptor lists it AND the item
 *  actually carries a value — so each kind shows exactly the shape spec §3.3
 *  gives it, and nothing empty. `tags` counts as present only when non-empty. */
function shows(
  section: SubprofileSectionView,
  item: SubprofileItemView,
  field: keyof SubprofileItemView,
): boolean {
  if (!section.fields.includes(field)) return false;
  const value = item[field];
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function ItemCard({
  section,
  item,
}: {
  section: SubprofileSectionView;
  item: SubprofileItemView;
}) {
  const { t } = useTranslation();
  const hasImage = shows(section, item, "imageUrl");
  return (
    <article className={styles.card}>
      {hasImage && (
        <ImageSlot
          src={item.imageUrl}
          alt={item.title}
          tint="plum"
          height={168}
          radius={14}
          className={styles.cardImage}
        />
      )}
      <div className={styles.cardBody}>
        <h3 className={styles.itemTitle}>{item.title}</h3>
        {shows(section, item, "subtitle") && (
          <p className={styles.itemSubtitle}>{item.subtitle}</p>
        )}
        {(shows(section, item, "date") || shows(section, item, "meta")) && (
          <p className={styles.itemMeta}>
            {shows(section, item, "date") && (
              <span className={styles.date}>{item.date}</span>
            )}
            {shows(section, item, "meta") && <span>{item.meta}</span>}
          </p>
        )}
        {shows(section, item, "description") && (
          <p className={styles.itemDesc}>{item.description}</p>
        )}
        {shows(section, item, "tags") && (
          <TagRow className={styles.itemTags}>
            {item.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        )}
        {shows(section, item, "url") && (
          <a
            className={styles.visit}
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("subprofiles:page.visit")} <FiExternalLink aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}

/** The universal `links` section: a compact row of external links rather than
 *  full cards — each item is just a label (title) and a url. */
function LinksRow({ section }: { section: SubprofileSectionView }) {
  return (
    <ul className={styles.linksRow}>
      {section.items.map((item) => (
        <li key={`${item.title}::${item.url}`}>
          <a
            className={styles.linkPill}
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {item.title} <FiExternalLink aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Renders a public persona's sections. `sections` arrives already grouped and
 *  empty-dropped from the adapter (`buildSections`), ordered by `sectionsForKind`.
 *  Each section shows a `SectionHead` (icon + label) then its items. */
export function SubprofileSections({
  sections,
}: {
  sections: SubprofileSectionView[];
}) {
  const { t } = useTranslation();
  if (sections.length === 0) return null;
  return (
    <div className={styles.sections}>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Reveal as="section" key={section.section} className={styles.section}>
            <SectionHead
              title={
                <span className={styles.headTitle}>
                  <Icon aria-hidden className={styles.headIcon} />
                  {t(section.labelKey)}
                </span>
              }
            />
            {section.section === "links" ? (
              <LinksRow section={section} />
            ) : (
              <div className={styles.grid}>
                {section.items.map((item) => (
                  <ItemCard
                    key={`${item.title}::${item.url}::${item.date}`}
                    section={section}
                    item={item}
                  />
                ))}
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

import { FiExternalLink } from "react-icons/fi";
import { initialsFromName } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import { Link } from "react-router-dom";
import {
  Avatar,
  ImageSlot,
  Reveal,
  SectionHead,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CollaboratorDTO } from "./api/subprofiles.api";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { collaboratorHref } from "./collaborators.data";
import styles from "./SubprofileSections.module.css";

/** Credit row for an item's collaborators — a small "with" label plus each
 *  collaborator as an avatar+name link (member profile or persona page).
 *  Renders nothing when the item has none. */
function ItemCollaborators({
  collaborators,
}: {
  collaborators: CollaboratorDTO[];
}) {
  const { t } = useTranslation();
  if (collaborators.length === 0) return null;
  return (
    <div className={styles.collaborators}>
      <span className={styles.collabLabel}>{t("subprofiles:collab.with")}</span>
      <ul className={styles.collabList}>
        {collaborators.map((collaborator) => (
          <li key={collaborator.handle}>
            <Link
              className={styles.collabLink}
              to={collaboratorHref(collaborator)}
            >
              <Avatar
                initials={initialsFromName(collaborator.name, "?")}
                src={collaborator.avatarUrl ?? undefined}
                alt={collaborator.name}
                size={22}
              />
              <span className={styles.collabName}>{collaborator.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
        <ItemCollaborators collaborators={item.collaborators} />
        {shows(section, item, "url") && safeHref(item.url) && (
          <a
            className={styles.visit}
            href={safeHref(item.url) ?? undefined}
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
      {section.items.map((item) => {
        // Skip any member-supplied link whose scheme isn't safe to render.
        const linkHref = safeHref(item.url);
        if (!linkHref) return null;
        return (
          <li key={`${item.title}::${item.url}`}>
            <a
              className={styles.linkPill}
              href={linkHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              {item.title} <FiExternalLink aria-hidden />
            </a>
          </li>
        );
      })}
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

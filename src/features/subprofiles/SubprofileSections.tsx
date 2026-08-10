import { safeHref } from "../../shared/lib/safeHref";
import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isUpcoming, sectionShape } from "./personaSkinRender";
import type { PersonaViewMode } from "./personaSkinRender";
import { SubprofileItemRow } from "./SubprofileItemRow";
import { SubprofileItemTile } from "./SubprofileItemTile";
import type {
  PublicSubprofileView,
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";

/** A `.pp-sec`'s items in `.pp-list`/`.pp-tiles`/upcoming+`.pp-past` shape,
 *  per `sectionShape()`. Shared by the content-section loop below. */
function SectionBody({
  shape,
  items,
  skin,
  interactive,
  onOpenWork,
}: {
  shape: "list" | "visual" | "stage-split";
  items: SubprofileItemView[];
  skin: SkinFamily;
  interactive: boolean;
  onOpenWork?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();

  if (shape === "visual") {
    return (
      <div className="pp-tiles">
        {items.map((item, index) => (
          <SubprofileItemTile
            key={`${item.title}::${item.date}::${index}`}
            item={item}
            index={index}
            onOpenWork={interactive && skin === "studio" ? onOpenWork : undefined}
          />
        ))}
      </div>
    );
  }

  if (shape === "stage-split") {
    const upcoming = items.filter((item) => isUpcoming(item.date));
    const past = items.filter((item) => !isUpcoming(item.date));
    return (
      <>
        <div className="pp-list">
          {upcoming.map((item, index) => (
            <SubprofileItemRow
              key={`${item.title}::${item.date}::${index}`}
              item={item}
              skin={skin}
              interactive={interactive}
            />
          ))}
        </div>
        {past.length > 0 && (
          <div className="pp-past">
            <span className="pp-past-label">{t("subprofiles:row.played")}</span>
            <div className="pp-list">
              {past.map((item, index) => (
                <SubprofileItemRow
                  key={`${item.title}::${item.date}::${index}`}
                  item={item}
                  skin={skin}
                  interactive={interactive}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="pp-list">
      {items.map((item, index) => (
        <SubprofileItemRow
          key={`${item.title}::${item.date}::${index}`}
          item={item}
          skin={skin}
          interactive={interactive}
        />
      ))}
    </div>
  );
}

/** The universal `links` section — a `.pp-list` of `.pp-row.pp-link` rows
 *  rather than the shape-dispatched content sections above. In `preview`
 *  mode (`interactive` false) each row is a non-navigable look-alike (a
 *  `<div>`, same classes/content) rather than a real `<a>` — a Phase-3
 *  editor preview must never let a click actually navigate away. */
function LinksSection({
  section,
  interactive,
}: {
  section: SubprofileSectionView;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section className="pp-sec">
      <header>
        <h2>{t(section.labelKey)}</h2>
      </header>
      <div className="pp-list">
        {section.items.map((item) => {
          const linkHref = safeHref(item.url);
          if (!linkHref) return null;
          const rowContent = (
            <>
              <b>{item.title}</b>
              <span className="href">{linkHref}</span>
            </>
          );
          if (!interactive) {
            return (
              <div
                key={`${item.title}::${item.url}`}
                className="pp-row pp-link"
              >
                {rowContent}
              </div>
            );
          }
          return (
            <a
              key={`${item.title}::${item.url}`}
              className="pp-row pp-link"
              href={linkHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              {rowContent}
            </a>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Renders a public persona's sections onto the page host's `.pp-body`. Each
 * section's shape (`.pp-list` / `.pp-tiles` / upcoming+`.pp-past`) comes from
 * `sectionShape()` (Task 2) — same markup for every skin, `data-skin` on the
 * page's `.pp` ancestor decides how it looks. The universal `links` section
 * renders separately, last, as plain link rows rather than shape-dispatched.
 * `featuredHidden` drops the item already shown in the page's Spotlight (or,
 * for the table skin, its `MenuCard`) from its own section list.
 */
export function SubprofileSections({
  persona,
  skin,
  mode,
  featuredHidden,
  onOpenWork,
}: {
  persona: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  featuredHidden: boolean;
  /** Opens the studio lightbox on a clicked tile — only meaningful (and only
   *  read) for `skin === "studio"`'s visual sections; see
   *  `SubprofileItemTile`. */
  onOpenWork?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const interactive = mode !== "preview";
  const linksSection = persona.sections.find((s) => s.section === "links");
  const contentSections = persona.sections.filter((s) => s.section !== "links");

  return (
    <>
      {contentSections.map((section) => {
        const items = featuredHidden
          ? section.items.filter((item) => !item.isFeatured)
          : section.items;
        if (items.length === 0) return null;
        const shape = sectionShape(section.section, skin, items);
        return (
          <Reveal as="section" key={section.section} className="pp-sec">
            <header>
              <h2>{t(section.labelKey)}</h2>
              {items.length > 1 && <span className="count">{items.length}</span>}
            </header>
            <SectionBody
              shape={shape}
              items={items}
              skin={skin}
              interactive={interactive}
              onOpenWork={onOpenWork}
            />
          </Reveal>
        );
      })}
      {linksSection && linksSection.items.length > 0 && (
        <LinksSection section={linksSection} interactive={interactive} />
      )}
    </>
  );
}

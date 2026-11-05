import { useTranslation } from "../../shared/i18n/useTranslation";
import { poemsYearSpan } from "./poemYearGroups";
import { PosterSectionCaption } from "./PosterSectionCaption";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SubprofileSection } from "./api/subprofiles.api";

/**
 * A `.pp-sec`'s header: the section's h2 and, beside it, a count badge once
 * the section holds more than one item. The poems section trades the badge
 * for a centred caption under the h2 ("9 poems · 2024 to 2026"). The Poster
 * skin's events, nights, clients and roster sections also write a caption
 * line ("4 coming up · 7 past · since 2025"), which only that skin shows.
 * That caption counts `captionItems` when given: the whole section, the
 * featured event included, so it agrees with the page foot.
 */
export function PersonaSectionHeader({
  section,
  labelKey,
  items,
  captionItems,
}: {
  section: SubprofileSection;
  labelKey: string;
  items: SubprofileItemView[];
  /** Every item in the section, the one the spotlight shows included. The
   *  Poster caption counts these; falls back to `items`. */
  captionItems?: SubprofileItemView[];
}) {
  const { t } = useTranslation();
  return (
    <header>
      <h2 id={`pp-sec-${section}`}>{t(labelKey)}</h2>
      {section === "poems" ? (
        <PoemsCaption items={items} />
      ) : (
        items.length > 1 && (
          <>
            <span
              className="count"
              aria-label={t("subprofiles:section.countLabel", {
                count: items.length,
              })}
            >
              {items.length}
            </span>
            {/* The page skin writes the count out as a caption line under the
                h2 and hides the bare badge; every other skin hides this one. */}
            <span className="count-caption">
              {t("subprofiles:section.countLabel", { count: items.length })}
            </span>
          </>
        )
      )}
      <PosterSectionCaption section={section} items={captionItems ?? items} />
    </header>
  );
}

/** "9 poems · 2024 to 2026", or "3 poems · 2025" when every dated poem shares
 *  one year. With no dated poem at all the span is left out and the line falls
 *  back to the plain item count. */
function PoemsCaption({ items }: { items: SubprofileItemView[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  const yearSpan = poemsYearSpan(items);
  const spanLabel =
    yearSpan &&
    (yearSpan.from === yearSpan.to
      ? String(yearSpan.from)
      : t("subprofiles:section.yearSpan", {
          from: yearSpan.from,
          to: yearSpan.to,
        }));
  return (
    <p className="pp-sec-caption">
      {spanLabel
        ? t("subprofiles:section.poemsCaption", {
            count: items.length,
            span: spanLabel,
          })
        : t("subprofiles:section.countLabel", { count: items.length })}
    </p>
  );
}

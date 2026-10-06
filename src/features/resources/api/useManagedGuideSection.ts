import { useContext } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ManagedGuideRowContext } from "../sectionComposedGuides";
import type { GuideSection } from "./resources.api";
import { useManagedGuide } from "./useManagedGuide";

/**
 * One editor-written section of a guide, found by its anchor, for a page that
 * composes its managed sections one at a time (RES-F5). Null in three cases:
 * the guide has no row, its sections lack this anchor, or that section has no
 * blocks yet. The page then renders its own catalog copy for that part.
 *
 * The language rule matches `ManagedGuideBody`: the Portuguese sections when
 * the reader is in Portuguese and any exist, the English sections otherwise.
 * A row from `ManagedGuideRowContext` for this slug wins over the public
 * lookup, which is then skipped: that is how the admin preview shows an
 * unpublished guide's sections. Without one, demo mode never has a row, so it
 * always reads the catalog copy.
 */
export function useManagedGuideSection(
  slug: string,
  anchor: string,
): GuideSection | null {
  const providedRow = useContext(ManagedGuideRowContext);
  const isRowProvided = providedRow?.slug === slug;
  const { guide: publicGuide } = useManagedGuide(slug, {
    isEnabled: !isRowProvided,
  });
  const { language } = useTranslation();
  const guide = isRowProvided ? providedRow : publicGuide;
  if (!guide) return null;

  const isPortuguese = language === "pt";
  const sections =
    (isPortuguese && guide.sectionsPt?.length ? guide.sectionsPt : null) ??
    guide.sections;
  return (
    sections.find(
      (section) => section.id === anchor && section.blocks.length > 0,
    ) ?? null
  );
}

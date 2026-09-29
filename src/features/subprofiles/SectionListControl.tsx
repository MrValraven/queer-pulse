import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { useSectionListFocusFallback } from "./useSectionListFocusFallback";
import { useSectionListSection } from "./useSectionListSection";
import { SubprofileSectionEditor } from "./SubprofileSectionEditor";

/**
 * A persona section's whole item list inside a Page blocks chapter: the
 * section editor it had as its own pane (drawer, reorder, feature, gallery
 * picker), its rows drawn as one hairline list in the chapter's card
 * (`isInChapter`). Rows live on the editor context, so switching chapters
 * never loses them. The chapter title or card heading already names the
 * section, so the list is named for assistive tech only. Renders nothing when
 * the loaded persona lacks the section.
 *
 * When a dialog closes and the button that opened it is gone (the gallery's
 * Add button once it is full, or rows re-seeded by a restore), focus lands
 * on the list wrapper (`useSectionListFocusFallback`), which is focusable
 * only for that visit.
 */
export function SectionListControl({ control }: { control: SkinBlockControl }) {
  const { t } = useTranslation();
  const { subprofile } = useSubprofileEditorContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const focusHandlers = useSectionListFocusFallback(wrapperRef);
  const section = useSectionListSection(control);
  if (!section) return null;
  return (
    <div
      ref={wrapperRef}
      role="group"
      aria-label={t(control.labelKey)}
      {...focusHandlers}
    >
      <SubprofileSectionEditor
        subprofileId={subprofile.id}
        section={section}
        isInChapter
        isFeatureHidden={control.isFeatureHidden}
      />
    </div>
  );
}

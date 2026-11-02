import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { isStudioMusicSection } from "./personaStudio";
import { useSectionListFocusFallback } from "./useSectionListFocusFallback";
import { useSectionListSection } from "./useSectionListSection";
import { StudioSectionPanel } from "./StudioSectionPanel";
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
 * The Studio-backed music chapters (Discography, Mixes) put the Studio panel
 * above the list and leave out the list's own empty line, "Insert examples"
 * and Add, since releases are uploaded in Studio. Items the section already
 * holds keep their rows and their editing.
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
  const isStudioBacked = isStudioMusicSection(subprofile.kind, section.section);
  return (
    <div
      ref={wrapperRef}
      role="group"
      aria-label={t(control.labelKey)}
      {...focusHandlers}
    >
      {isStudioBacked && <StudioSectionPanel />}
      <SubprofileSectionEditor
        subprofileId={subprofile.id}
        section={section}
        isInChapter
        isFeatureHidden={control.isFeatureHidden}
        kind={subprofile.kind}
        isStudioBacked={isStudioBacked}
      />
    </div>
  );
}

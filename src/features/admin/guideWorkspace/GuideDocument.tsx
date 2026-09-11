import { useRef, useState } from "react";
import { FiCopy, FiPlus } from "react-icons/fi";
import { SelectionToolbar } from "../../../shared/components/richText/SelectionToolbar";
import {
  SlashMenu,
  type SlashMenuOption,
  type SlashMenuPoint,
} from "../../../shared/components/richText/SlashMenu";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GuideBlockKind } from "../api/adminResourceGuides.api";
import type { SectionsUpdate } from "./guideDocumentOps";
import type { DraftSection } from "./guideDraft";
import { findSectionById, translationFlags } from "./guideTranslation";
import type { GuideValidationIssue } from "./guideValidation";
import {
  GUIDE_BLOCK_KIND_HINTS,
  GUIDE_BLOCK_KIND_ORDER,
  NEW_SECTION_OPTION_ID,
} from "./guideWorkspace.data";
import { GuideSectionEditor } from "./GuideSectionEditor";
import { useGuideBlockEditing } from "./useGuideBlockEditing";
import { useGuideStructureEditing } from "./useGuideStructureEditing";
import styles from "./GuideDocument.module.css";

export interface GuideDocumentProps {
  sections: DraftSection[];
  englishSections: DraftSection[] | null;
  issues: GuideValidationIssue[];
  onSectionsChange: (update: SectionsUpdate) => void;
  onActiveSectionChange: (sectionKey: string) => void;
  onCopyEnglishStructure: () => void;
}

interface SlashState {
  sectionKey: string;
  blockKey: string;
  at: SlashMenuPoint;
}

/**
 * The editable guide body for one language: sections, the floating
 * formatting toolbar, the "/" menu and the add bar. While editing PT it also
 * shows each section's English source and offers to copy the English
 * structure.
 */
export function GuideDocument({
  sections,
  englishSections,
  issues,
  onSectionsChange,
  onActiveSectionChange,
  onCopyEnglishStructure,
}: GuideDocumentProps) {
  const { t } = useTranslation();
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [slashState, setSlashState] = useState<SlashState | null>(null);
  const editing = useGuideBlockEditing({ sections, onSectionsChange });
  const structure = useGuideStructureEditing({
    sections,
    onSectionsChange,
    focusLater: editing.focusLater,
  });
  const missingEnglishCount = englishSections
    ? translationFlags(englishSections, sections).missingEnglishSections.length
    : 0;

  const kindLabel = (kind: GuideBlockKind) =>
    t(`admin:adminResourceGuides.blockKind.${kind}`);
  const slashOptions: SlashMenuOption[] = [
    ...GUIDE_BLOCK_KIND_ORDER.map((kind) => ({
      id: kind,
      label: kindLabel(kind),
      hint: GUIDE_BLOCK_KIND_HINTS[kind] || undefined,
    })),
    {
      id: NEW_SECTION_OPTION_ID,
      label: t("admin:guideWorkspace.document.addSectionCta"),
    },
  ];

  function openSlash(
    sectionKey: string,
    blockKey: string,
    element: HTMLElement,
  ) {
    const bounds = element.getBoundingClientRect();
    setSlashState({
      sectionKey,
      blockKey,
      at: { x: bounds.left, y: bounds.bottom + 8 },
    });
  }

  return (
    <div className={styles.document}>
      {englishSections && missingEnglishCount > 0 && (
        <div className={styles.copyStructure}>
          <p className={styles.copyStructureText}>
            {t("admin:guideWorkspace.document.copyEnglishHint", {
              count: missingEnglishCount,
            })}
          </p>
          <Button variant="ghost" size="sm" onClick={onCopyEnglishStructure}>
            <FiCopy aria-hidden />{" "}
            {t("admin:guideWorkspace.document.copyEnglishCta")}
          </Button>
        </div>
      )}

      <div
        ref={documentRef}
        className={styles.sections}
        role="group"
        aria-label={t("admin:guideWorkspace.document.label")}
        onPaste={editing.handlePaste}
      >
        {sections.length === 0 && (
          <p className={styles.empty}>
            {t("admin:guideWorkspace.document.empty")}
          </p>
        )}
        {sections.map((section, sectionIndex) => (
          <GuideSectionEditor
            key={section.key}
            section={section}
            sectionIndex={sectionIndex}
            sectionCount={sections.length}
            englishMatch={
              englishSections
                ? (findSectionById(englishSections, section.id) ?? null)
                : undefined
            }
            issues={issues.filter((issue) => issue.sectionKey === section.key)}
            editing={editing}
            structure={structure}
            onFocusSection={() => onActiveSectionChange(section.key)}
            onSlashOpen={(blockKey, element) =>
              openSlash(section.key, blockKey, element)
            }
          />
        ))}
      </div>

      <div
        className={styles.addBar}
        role="group"
        aria-label={t("admin:guideWorkspace.document.addBarLabel")}
      >
        {GUIDE_BLOCK_KIND_ORDER.map((kind) => (
          <Button
            key={kind}
            variant="ghost"
            size="sm"
            onClick={() => structure.appendBlock(kind)}
          >
            <FiPlus aria-hidden /> {kindLabel(kind)}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={structure.appendSection}>
          <FiPlus aria-hidden />{" "}
          {t("admin:guideWorkspace.document.addSectionCta")}
        </Button>
        <span className={styles.addBarHint}>
          {t("admin:guideWorkspace.document.hint")}
        </span>
      </div>

      <SelectionToolbar scopeRef={documentRef} />
      {slashState && (
        <SlashMenu
          at={slashState.at}
          options={slashOptions}
          onPick={(optionId) => {
            structure.pickSlashOption(
              slashState.sectionKey,
              slashState.blockKey,
              optionId,
            );
            setSlashState(null);
          }}
          onClose={() => setSlashState(null)}
        />
      )}
    </div>
  );
}

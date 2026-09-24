import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EmailBlock } from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { EmailAddBlockBar } from "./EmailAddBlockBar";
import { EmailBlockRow } from "./EmailBlockRow";
import {
  createBlock,
  moveBlock,
  removeBlock,
  updateBlock,
} from "./emailBlockOps";
import styles from "./emailTemplateEditor.module.css";

interface EmailBlockEditorProps {
  blocks: EmailBlock[];
  /** Functional, so rapid edits never apply to a stale block list. */
  onBlocksChange: (update: (blocks: EmailBlock[]) => EmailBlock[]) => void;
  onFocusField: FocusFieldHandler;
  /** Keeps field ids unique per language tab. */
  idPrefix: string;
}

export function EmailBlockEditor({
  blocks,
  onBlocksChange,
  onFocusField,
  idPrefix,
}: EmailBlockEditorProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.blockEditor}>
      {blocks.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("admin:emailTemplates.blocks.empty")}
        </p>
      ) : (
        <ol className={styles.blockList}>
          {blocks.map((block, index) => (
            <EmailBlockRow
              key={block.id}
              block={block}
              fieldId={`${idPrefix}-${block.id}`}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onFocusField={onFocusField}
              onChange={(next) =>
                onBlocksChange((current) =>
                  updateBlock(current, block.id, next),
                )
              }
              onMove={(delta) =>
                onBlocksChange((current) =>
                  moveBlock(
                    current,
                    current.findIndex((candidate) => candidate.id === block.id),
                    delta,
                  ),
                )
              }
              onRemove={() =>
                onBlocksChange((current) => removeBlock(current, block.id))
              }
            />
          ))}
        </ol>
      )}
      <EmailAddBlockBar
        onAdd={(type) =>
          onBlocksChange((current) => [...current, createBlock(type)])
        }
      />
    </div>
  );
}

import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EmailBlock } from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { EmailBlockFields } from "./EmailBlockFields";
import styles from "./emailTemplateEditor.module.css";

interface EmailBlockRowProps {
  block: EmailBlock;
  fieldId: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (next: EmailBlock) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onFocusField: FocusFieldHandler;
}

export function EmailBlockRow({
  block,
  fieldId,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
  onFocusField,
}: EmailBlockRowProps) {
  const { t } = useTranslation();
  const typeName = t(`admin:emailTemplates.blocks.type.${block.type}`);
  return (
    <li className={styles.blockRow}>
      <div className={styles.blockHead}>
        <span className={styles.blockType}>{typeName}</span>
        <div className={styles.blockActions}>
          <IconButton
            size="sm"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label={t("admin:emailTemplates.blocks.moveUp", {
              type: typeName,
            })}
          >
            <FiArrowUp aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label={t("admin:emailTemplates.blocks.moveDown", {
              type: typeName,
            })}
          >
            <FiArrowDown aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            onClick={onRemove}
            aria-label={t("admin:emailTemplates.blocks.remove", {
              type: typeName,
            })}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </div>
      </div>
      <EmailBlockFields
        block={block}
        fieldId={fieldId}
        onChange={onChange}
        onFocusField={onFocusField}
      />
    </li>
  );
}

import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EmailBlockType } from "../emailTemplate.types";
import styles from "./emailTemplateEditor.module.css";

const BLOCK_TYPES: EmailBlockType[] = [
  "heading",
  "paragraph",
  "button",
  "image",
  "divider",
  "spacer",
  "html",
];

/** One plain button per block type: no menu to open, every option visible. */
export function EmailAddBlockBar({
  onAdd,
}: {
  onAdd: (type: EmailBlockType) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.addBar}
      role="group"
      aria-labelledby="email-add-block-label"
    >
      <span id="email-add-block-label" className={styles.chipsLabel}>
        {t("admin:emailTemplates.blocks.addLabel")}
      </span>
      {BLOCK_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          className={styles.chip}
          onClick={() => onAdd(type)}
        >
          <FiPlus aria-hidden />
          {t(`admin:emailTemplates.blocks.type.${type}`)}
        </button>
      ))}
    </div>
  );
}

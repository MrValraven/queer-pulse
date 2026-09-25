import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { FormField, IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  EMAIL_FEATURE_ICONS,
  EMAIL_FEATURE_ITEMS_MAX,
  type EmailBlock,
  type EmailFeatureIcon,
  type EmailFeatureItem,
} from "../emailTemplate.types";
import type { FocusFieldHandler } from "./activeField";
import { createFeatureItem, moveInList } from "./emailBlockOps";
import { EMAIL_FEATURE_ICON_GLYPHS } from "./emailFeatureIcons.data";
import { EmailTextField } from "./EmailTextField";
import styles from "./emailTemplateEditor.module.css";

type FeatureListBlock = Extract<EmailBlock, { type: "featureList" }>;

function isFeatureIcon(value: string): value is EmailFeatureIcon {
  return EMAIL_FEATURE_ICONS.some((icon) => icon === value);
}

let nextRowKey = 0;
const newRowKey = () => `feature-row-${nextRowKey++}`;

interface EmailFeatureItemFieldsProps {
  item: EmailFeatureItem;
  fieldId: string;
  rowNumber: number;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
  onChange: (next: EmailFeatureItem) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onFocusField: FocusFieldHandler;
}

/** One feature row: its icon, title and text, with its own move and remove. */
function EmailFeatureItemFields({
  item,
  fieldId,
  rowNumber,
  isFirst,
  isLast,
  isOnly,
  onChange,
  onMove,
  onRemove,
  onFocusField,
}: EmailFeatureItemFieldsProps) {
  const { t } = useTranslation();
  const field = (key: string) => t(`admin:emailTemplates.blocks.field.${key}`);
  const rowValues = { number: rowNumber };
  const IconGlyph = EMAIL_FEATURE_ICON_GLYPHS[item.icon];
  return (
    <li className={styles.featureRow}>
      <div className={styles.blockHead}>
        <span className={styles.featureRowTitle}>
          {t("admin:emailTemplates.blocks.featureRow", rowValues)}
        </span>
        <div className={styles.blockActions}>
          <IconButton
            size="sm"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label={t(
              "admin:emailTemplates.blocks.featureMoveUp",
              rowValues,
            )}
          >
            <FiArrowUp aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label={t(
              "admin:emailTemplates.blocks.featureMoveDown",
              rowValues,
            )}
          >
            <FiArrowDown aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            disabled={isOnly}
            onClick={onRemove}
            aria-label={t(
              "admin:emailTemplates.blocks.featureRemove",
              rowValues,
            )}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </div>
      </div>
      {/* The disc beside the select keeps FormField from wiring the label, so
          the select names itself with the same words. */}
      <FormField label={field("featureIcon")}>
        <div className={styles.iconPicker}>
          <span className={styles.iconDisc}>
            <IconGlyph aria-hidden />
          </span>
          <select
            id={`${fieldId}-icon`}
            className={styles.select}
            aria-label={field("featureIcon")}
            value={item.icon}
            onChange={(event) => {
              const icon = event.target.value;
              if (isFeatureIcon(icon)) onChange({ ...item, icon });
            }}
          >
            {EMAIL_FEATURE_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {t(`admin:emailTemplates.blocks.featureIcon.${icon}`)}
              </option>
            ))}
          </select>
        </div>
      </FormField>
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-title`}
        label={field("featureTitle")}
        maxLength={80}
        value={item.title}
        onChange={(title) => onChange({ ...item, title })}
      />
      <EmailTextField
        onFocusField={onFocusField}
        id={`${fieldId}-text`}
        label={field("featureText")}
        maxLength={300}
        isMultiline
        rows={2}
        value={item.text}
        onChange={(text) => onChange({ ...item, text })}
      />
    </li>
  );
}

interface EmailFeatureListFieldsProps {
  block: FeatureListBlock;
  fieldId: string;
  onChange: (next: EmailBlock) => void;
  onFocusField: FocusFieldHandler;
}

/**
 * One to `EMAIL_FEATURE_ITEMS_MAX` rows. Rows carry no ids of their own, so
 * this keeps a parallel list of React keys that moves with them: a moved row
 * keeps its focused button, the way a moved block does.
 */
export function EmailFeatureListFields({
  block,
  fieldId,
  onChange,
  onFocusField,
}: EmailFeatureListFieldsProps) {
  const { t } = useTranslation();
  const { items } = block;
  const [rowKeys, setRowKeys] = useState(() => items.map(newRowKey));
  const keys =
    rowKeys.length === items.length
      ? rowKeys
      : items.map((_, rowIndex) => `feature-row-at-${rowIndex}`);
  const hasRoomForRow = items.length < EMAIL_FEATURE_ITEMS_MAX;

  function setItems(nextItems: EmailFeatureItem[], nextKeys: string[]) {
    setRowKeys(nextKeys);
    onChange({ ...block, items: nextItems });
  }

  return (
    <div className={styles.fieldStack}>
      <ol className={styles.featureList}>
        {items.map((item, rowIndex) => (
          <EmailFeatureItemFields
            key={keys[rowIndex]}
            item={item}
            fieldId={`${fieldId}-row-${rowIndex}`}
            rowNumber={rowIndex + 1}
            isFirst={rowIndex === 0}
            isLast={rowIndex === items.length - 1}
            isOnly={items.length === 1}
            onFocusField={onFocusField}
            onChange={(nextItem) =>
              setItems(
                items.map((current, index) =>
                  index === rowIndex ? nextItem : current,
                ),
                keys,
              )
            }
            onMove={(delta) =>
              setItems(
                moveInList(items, rowIndex, delta),
                moveInList(keys, rowIndex, delta),
              )
            }
            onRemove={() => {
              if (items.length === 1) return;
              setItems(
                items.filter((_, index) => index !== rowIndex),
                keys.filter((_, index) => index !== rowIndex),
              );
            }}
          />
        ))}
      </ol>
      {hasRoomForRow && (
        <button
          type="button"
          className={`${styles.chip} ${styles.featureAdd}`}
          onClick={() =>
            setItems([...items, createFeatureItem()], [...keys, newRowKey()])
          }
        >
          <FiPlus aria-hidden />
          {t("admin:emailTemplates.blocks.featureAdd")}
        </button>
      )}
    </div>
  );
}

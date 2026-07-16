import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import type { SubprofileItemDTO } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { FIELD_META } from "./subprofileEditor.data";
import { ImageUploadField } from "./ImageUploadField";
import styles from "./SubprofileEditor.module.css";

type Field = keyof SubprofileItemDTO;

interface SubprofileItemEditorProps {
  item: SubprofileItemView;
  index: number;
  /** The fields this section surfaces (from `SECTION_META[section].fields`). */
  fields: Field[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<SubprofileItemView>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

/**
 * Edits ONE item, rendering only the inputs its section declares — an image
 * picker (when `imageUrl` is a field), the text fields in order, then a tags
 * input (when `tags` is a field). `title` is always present and required.
 * Mirrors `WorkItemEditor`.
 */
export function SubprofileItemEditor({
  item,
  index,
  fields,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onMove,
}: SubprofileItemEditorProps) {
  const textFields = fields.filter(
    (f) => f !== "imageUrl" && f !== "tags" && f !== "section",
  );

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.itemNum}>Item {index + 1}</span>
        <div className={styles.itemTools}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label="Move up"
          >
            <FiArrowUp size={15} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label="Move down"
          >
            <FiArrowDown size={15} aria-hidden />
          </button>
          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            <FiTrash2 size={14} aria-hidden /> Remove
          </button>
        </div>
      </div>

      {fields.includes("imageUrl") && (
        <ImageUploadField
          value={item.imageUrl}
          kind="work-image"
          onChange={(imageUrl) => onChange({ imageUrl })}
        />
      )}

      {textFields.map((field) => {
        const meta = FIELD_META[field];
        if (!meta) return null;
        const value = (item[field as keyof SubprofileItemView] as string) ?? "";
        return (
          <FormField
            key={field}
            label={meta.label}
            required={field === "title"}
          >
            {meta.multiline ? (
              <textarea
                value={value}
                placeholder={meta.placeholder}
                onChange={(e) =>
                  onChange({
                    [field]: e.target.value,
                  } as Partial<SubprofileItemView>)
                }
              />
            ) : (
              <input
                value={value}
                placeholder={meta.placeholder}
                onChange={(e) =>
                  onChange({
                    [field]: e.target.value,
                  } as Partial<SubprofileItemView>)
                }
              />
            )}
          </FormField>
        );
      })}

      {fields.includes("tags") && (
        <FormField label={FIELD_META.tags!.label} helper="Separate with commas">
          <input
            value={item.tags.join(", ")}
            placeholder={FIELD_META.tags!.placeholder}
            onChange={(e) =>
              onChange({
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
        </FormField>
      )}
    </article>
  );
}

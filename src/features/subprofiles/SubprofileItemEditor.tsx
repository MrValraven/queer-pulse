import { FiArrowDown, FiArrowUp, FiStar, FiTrash2 } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemDTO } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { FIELD_META } from "./subprofileEditor.data";
import { ImageUploadField } from "./ImageUploadField";
import { HandleChipInput } from "./HandleChipInput";
import styles from "./SubprofileEditor.module.css";

type Field = keyof SubprofileItemDTO;

interface SubprofileItemEditorProps {
  item: SubprofileItemView;
  index: number;
  /** The fields this section surfaces (from `SECTION_META[section].fields`). */
  fields: Field[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  onChange: (patch: Partial<SubprofileItemView>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onToggleFeatured: () => void;
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
  canFeature,
  onChange,
  onRemove,
  onMove,
  onToggleFeatured,
}: SubprofileItemEditorProps) {
  const { t } = useTranslation();
  const textFields = fields.filter(
    (f) => f !== "imageUrl" && f !== "tags" && f !== "section",
  );

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.itemNum}>
          {t("subprofiles:itemEditor.itemNumber", { n: index + 1 })}
        </span>
        <div className={styles.itemTools}>
          {canFeature && (
            <button
              type="button"
              className={
                item.isFeatured
                  ? `${styles.featureBtn} ${styles.featureBtnActive}`
                  : styles.featureBtn
              }
              onClick={onToggleFeatured}
              aria-pressed={item.isFeatured}
              aria-label={t(
                item.isFeatured
                  ? "subprofiles:itemEditor.unfeature"
                  : "subprofiles:itemEditor.feature",
              )}
              title={t(
                item.isFeatured
                  ? "subprofiles:itemEditor.unfeature"
                  : "subprofiles:itemEditor.feature",
              )}
            >
              <FiStar size={15} aria-hidden />
              {item.isFeatured && (
                <span>{t("subprofiles:itemEditor.featuredBadge")}</span>
              )}
            </button>
          )}
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label={t("subprofiles:itemEditor.moveUp")}
          >
            <FiArrowUp size={15} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label={t("subprofiles:itemEditor.moveDown")}
          >
            <FiArrowDown size={15} aria-hidden />
          </button>
          <button type="button" className={styles.removeBtn} onClick={onRemove}>
            <FiTrash2 size={14} aria-hidden />{" "}
            {t("subprofiles:itemEditor.remove")}
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
            label={t(meta.labelKey)}
            required={field === "title"}
          >
            {meta.multiline ? (
              <textarea
                value={value}
                placeholder={t(meta.placeholderKey)}
                onChange={(e) =>
                  onChange({
                    [field]: e.target.value,
                  } as Partial<SubprofileItemView>)
                }
              />
            ) : (
              <input
                value={value}
                placeholder={t(meta.placeholderKey)}
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
        <FormField
          label={t(FIELD_META.tags!.labelKey)}
          helper={t("subprofiles:itemEditor.tagsHelper")}
        >
          <input
            value={item.tags.join(", ")}
            placeholder={t(FIELD_META.tags!.placeholderKey)}
            onChange={(e) =>
              onChange({
                tags: e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          />
        </FormField>
      )}

      <HandleChipInput
        collaborators={item.collaborators}
        onChange={(collaborators) => onChange({ collaborators })}
      />
    </article>
  );
}

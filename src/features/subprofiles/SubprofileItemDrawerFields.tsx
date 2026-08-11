import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemDTO } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { FIELD_META } from "./subprofileEditor.data";
import { ImageUploadField } from "./ImageUploadField";
import { HandleChipInput } from "./HandleChipInput";
import { RICH_FIELDS_FOR_SECTION, type RichFieldDescriptor } from "./richFields.data";

type Field = keyof SubprofileItemDTO;

/** Split a textarea's lines into `structured.snippet` — same trim+drop-blank
 *  shape as the tags input's comma-split, just newline-delimited. `null`
 *  when every line was blank, so an untouched/cleared snippet doesn't leave
 *  a stray empty array in the payload. */
function parseSnippetLines(raw: string): string[] | null {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : null;
}

function RichFieldControl({
  descriptor,
  draft,
  onPatch,
}: {
  descriptor: RichFieldDescriptor;
  draft: SubprofileItemView;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t } = useTranslation();

  if (descriptor.key === "snippet") {
    const value = draft.structured?.snippet?.join("\n") ?? "";
    return (
      <FormField label={t(descriptor.labelKey)}>
        <textarea
          value={value}
          placeholder={
            descriptor.placeholderKey ? t(descriptor.placeholderKey) : undefined
          }
          onChange={(e) =>
            onPatch({
              structured: {
                ...(draft.structured ?? {}),
                snippet: parseSnippetLines(e.target.value),
              },
            })
          }
        />
      </FormField>
    );
  }

  const richKey = descriptor.key;
  const rawValue = (draft[richKey as keyof SubprofileItemView] as string | null) ?? "";

  if (descriptor.kind === "select") {
    return (
      <FormField label={t(descriptor.labelKey)}>
        <select
          value={rawValue}
          onChange={(e) =>
            onPatch({ [richKey]: e.target.value || null })
          }
        >
          {descriptor.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </FormField>
    );
  }

  return (
    <FormField label={t(descriptor.labelKey)}>
      <input
        value={rawValue}
        placeholder={
          descriptor.placeholderKey ? t(descriptor.placeholderKey) : undefined
        }
        onChange={(e) =>
          onPatch({ [richKey]: e.target.value || null })
        }
      />
    </FormField>
  );
}

/**
 * Renders one item's editable fields inside the drawer: the base
 * `SECTION_META[section].fields` (image / text / tags — moved here verbatim
 * from the retired `SubprofileItemEditor`), then the section's rich-field
 * overlay from `richFields.data.ts` (Task 2), then the universal collaborator
 * chip input — except for the `gallery` section (image-only: a gallery photo
 * has no collaborators and the public view never shows them).
 * `structured.courses` is intentionally never rendered — it
 * round-trips untouched via `itemsToInputDto` (deferred, see the Phase 3 plan).
 */
export function SubprofileItemDrawerFields({
  draft,
  fields,
  onPatch,
}: {
  draft: SubprofileItemView;
  fields: Field[];
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t } = useTranslation();
  const textFields = fields.filter(
    (f) => f !== "imageUrl" && f !== "tags" && f !== "section",
  );
  const richFields = RICH_FIELDS_FOR_SECTION[draft.section] ?? [];

  return (
    <>
      {fields.includes("imageUrl") && (
        <ImageUploadField
          value={draft.imageUrl}
          kind="work-image"
          onChange={(imageUrl) => onPatch({ imageUrl })}
        />
      )}

      {textFields.map((field) => {
        const meta = FIELD_META[field];
        if (!meta) return null;
        const value = (draft[field as keyof SubprofileItemView] as string) ?? "";
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
                onChange={(e) => onPatch({ [field]: e.target.value })}
              />
            ) : (
              <input
                value={value}
                placeholder={t(meta.placeholderKey)}
                onChange={(e) => onPatch({ [field]: e.target.value })}
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
            value={draft.tags.join(", ")}
            placeholder={t(FIELD_META.tags!.placeholderKey)}
            onChange={(e) =>
              onPatch({
                tags: e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          />
        </FormField>
      )}

      {richFields.map((descriptor) => (
        <RichFieldControl
          key={descriptor.key}
          descriptor={descriptor}
          draft={draft}
          onPatch={onPatch}
        />
      ))}

      {draft.section !== "gallery" && (
        <HandleChipInput
          collaborators={draft.collaborators}
          onChange={(collaborators) => onPatch({ collaborators })}
        />
      )}
    </>
  );
}

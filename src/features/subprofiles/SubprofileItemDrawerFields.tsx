import { DatePicker, FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemDTO } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { FIELD_META, ITEM_LINKS_SECTIONS } from "./subprofileEditor.data";
import { ImageUploadField } from "./ImageUploadField";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { SubprofileItemLinksField } from "./SubprofileItemLinksField";
import {
  RICH_FIELDS_FOR_SECTION,
  type RichFieldDescriptor,
} from "./richFields.data";
import { PoemVersionsEditor } from "./poem/PoemVersionsEditor";
import { poemHasContent } from "./poem/poemBlocks";

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

/** Seed value for a month picker (`yyyy-mm`). A bare `yyyy-mm` passes through;
 *  a legacy free-text date ("July 2025") is best-effort parsed so the picker
 *  opens on the stored month; anything unparseable ("Ongoing") shows empty and
 *  the stored value is left untouched until the user picks a month. */
function toMonthValue(raw: string): string {
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return "";
  const date = new Date(parsed);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  const rawValue =
    (draft[richKey as keyof SubprofileItemView] as string | null) ?? "";

  if (descriptor.kind === "select") {
    return (
      <FormField label={t(descriptor.labelKey)}>
        <Select
          options={(descriptor.options ?? []).map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          value={rawValue}
          onChange={(value) => onPatch({ [richKey]: value || null })}
        />
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
        onChange={(e) => onPatch({ [richKey]: e.target.value || null })}
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
  const isPoems = draft.section === "poems";
  const textFields = fields.filter(
    (field) =>
      field !== "imageUrl" &&
      field !== "tags" &&
      field !== "section" &&
      !(isPoems && field === "description"),
  );
  const richFields = RICH_FIELDS_FOR_SECTION[draft.section] ?? [];

  return (
    <>
      {fields.includes("imageUrl") && (
        <div className="pe-field-wide">
          <ImageUploadField
            value={draft.imageUrl}
            kind="work-image"
            onChange={(imageUrl) => onPatch({ imageUrl })}
          />
        </div>
      )}

      {textFields.map((field) => {
        const meta = FIELD_META[field];
        if (!meta) return null;
        const value = (draft[field] as string) ?? "";
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
            ) : meta.inputType === "month" ? (
              <DatePicker
                mode="month"
                label={t(meta.labelKey)}
                value={toMonthValue(value) || null}
                onChange={(monthValue) =>
                  onPatch({ [field]: monthValue ?? "" })
                }
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

      {isPoems && (
        <div className="pe-field-wide">
          <PoemVersionsEditor
            value={draft.structured?.poemVersions ?? null}
            legacyPoem={draft.structured?.poem ?? null}
            description={draft.description}
            onChange={(versions) => {
              const primaryBlocks = versions[0]?.blocks ?? [];
              onPatch({
                // Poem body becomes the single source of truth: clear the legacy
                // `description` once real blocks exist so we don't persist two.
                description: poemHasContent(primaryBlocks)
                  ? ""
                  : draft.description,
                structured: {
                  ...(draft.structured ?? {}),
                  poemVersions: versions,
                  // Mirror the default (first) translation into the legacy
                  // `poem` field so the row teaser, authorship record and
                  // revision history keep reading `structured.poem` unchanged.
                  poem: primaryBlocks,
                },
              });
            }}
          />
        </div>
      )}

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
        <div className="pe-field-wide">
          <CollaboratorSelect
            collaborators={draft.collaborators}
            onChange={(collaborators) => onPatch({ collaborators })}
          />
        </div>
      )}

      {ITEM_LINKS_SECTIONS.has(draft.section) && (
        <div className="pe-field-wide">
          <SubprofileItemLinksField
            links={draft.structured?.links ?? []}
            onChange={(links) =>
              onPatch({
                structured: {
                  ...(draft.structured ?? {}),
                  links: links.length ? links : null,
                },
              })
            }
          />
        </div>
      )}
    </>
  );
}

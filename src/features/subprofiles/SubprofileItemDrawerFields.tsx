import { useState } from "react";
import { DatePicker, FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemDTO } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import {
  CREDENTIAL_PHOTO_SECTIONS,
  FIELD_META,
  ITEM_LINKS_SECTIONS,
  itemFieldMeta,
} from "./subprofileEditor.data";
import { SubprofileItemTextField } from "./SubprofileItemTextField";
import { SkinAutoGrowTextarea } from "./SkinAutoGrowTextarea";
import { useEditorPersonaKind } from "./useEditorPersonaKind";
import { ImageUploadField } from "./ImageUploadField";
import styles from "./SubprofileEditor.module.css";
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

/**
 * The snippet textarea keeps the text exactly as typed and only stores the
 * cleaned-up lines. Rendering the stored lines straight back (joined) threw
 * away a new line the moment it was typed — the trailing empty line was
 * dropped on every keystroke — so a second line could never be started.
 */
function SnippetField({
  descriptor,
  draft,
  onPatch,
}: {
  descriptor: RichFieldDescriptor;
  draft: SubprofileItemView;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(
    () => draft.structured?.snippet?.join("\n") ?? "",
  );
  return (
    <FormField label={t(descriptor.labelKey)}>
      <SkinAutoGrowTextarea
        className={styles.growTextarea}
        value={text}
        placeholder={
          descriptor.placeholderKey ? t(descriptor.placeholderKey) : undefined
        }
        onChange={(typed) => {
          setText(typed);
          onPatch({
            structured: {
              ...(draft.structured ?? {}),
              snippet: parseSnippetLines(typed),
            },
          });
        }}
      />
    </FormField>
  );
}

/** Split the tags input on commas — trimmed, blanks dropped. */
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * The comma-separated tags input, holding the text as typed for the same
 * reason as `SnippetField`: re-joining the parsed tags on every keystroke
 * swallowed the comma as soon as it was typed, so a second tag could only
 * ever be pasted in.
 */
function TagsField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(() => tags.join(", "));
  return (
    <FormField
      label={t(FIELD_META.tags!.labelKey)}
      helper={t("subprofiles:itemEditor.tagsHelper")}
    >
      <input
        value={text}
        placeholder={t(FIELD_META.tags!.placeholderKey)}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseTags(e.target.value));
        }}
      />
    </FormField>
  );
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
    return (
      <SnippetField descriptor={descriptor} draft={draft} onPatch={onPatch} />
    );
  }

  const richKey = descriptor.key;
  const rawValue =
    (draft[richKey as keyof SubprofileItemView] as string | null) ?? "";

  if (descriptor.kind === "time") {
    return (
      <FormField label={t(descriptor.labelKey)}>
        <DatePicker
          mode="time"
          label={t(descriptor.labelKey)}
          value={/^\d{2}:\d{2}$/.test(rawValue) ? rawValue : null}
          onChange={(time) => onPatch({ [richKey]: time })}
        />
      </FormField>
    );
  }

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
 * overlay from `richFields.data.ts` (Task 2). Collaborators, the spotlight
 * and the authorship record live in the drawer's settings rail
 * (`ItemDrawerSettings`), apart from what the piece itself says.
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
  // The kind words some sections' fields its own way (a game master's
  // campaign schedule, a session's day).
  const kind = useEditorPersonaKind();
  const isPoems = draft.section === "poems";
  const textFields = fields.filter(
    (field) =>
      field !== "imageUrl" &&
      field !== "tags" &&
      field !== "section" &&
      !(isPoems && field === "description"),
  );
  const richFields = RICH_FIELDS_FOR_SECTION[draft.section] ?? [];
  // A certificate or diploma photo is public on the persona page and often
  // shows a legal name or an ID number, so its field says so up front.
  const isCredentialPhoto = CREDENTIAL_PHOTO_SECTIONS.has(draft.section);

  return (
    <>
      {fields.includes("imageUrl") && (
        <div>
          <ImageUploadField
            value={draft.imageUrl}
            kind="work-image"
            onChange={(imageUrl) => onPatch({ imageUrl })}
            placeholder={
              isCredentialPhoto
                ? t("subprofiles:credentialPhoto.placeholder")
                : undefined
            }
          />
          {isCredentialPhoto && (
            <p className={styles.linkHelp}>
              {t("subprofiles:credentialPhoto.privacyNote")}
            </p>
          )}
        </div>
      )}

      {textFields.map((field) => {
        const meta = itemFieldMeta(field, draft.section, kind);
        if (!meta) return null;
        return (
          <SubprofileItemTextField
            key={field}
            meta={meta}
            value={(draft[field] as string) ?? ""}
            isRequired={field === "title"}
            onChange={(value) => onPatch({ [field]: value })}
          />
        );
      })}

      {isPoems && (
        <div>
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
        <TagsField tags={draft.tags} onChange={(tags) => onPatch({ tags })} />
      )}

      {richFields.map((descriptor) => (
        <RichFieldControl
          key={descriptor.key}
          descriptor={descriptor}
          draft={draft}
          onPatch={onPatch}
        />
      ))}

      {ITEM_LINKS_SECTIONS.has(draft.section) && (
        <div>
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

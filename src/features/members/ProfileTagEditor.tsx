import { useState } from "react";
import { TagPicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileTagBrowserModal } from "./ProfileTagBrowserModal";
import { POPULAR_PROFILE_TAGS, PROFILE_TAG_OPTIONS } from "./profileTags.data";

/**
 * Tag picker for the profile and its board items: skills from the curated
 * vocabulary (PROFILE_TAG_OPTIONS), found by search, a popular row, or the
 * full grouped list in `ProfileTagBrowserModal`. Only listed tags can be
 * added, stored in the list's own casing; legacy off-list tags still show and
 * remove. The shared `TagPicker` owns the look, keys and motion.
 */
export function TagEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  function add(candidate: string) {
    const canonical = PROFILE_TAG_OPTIONS.find(
      (option) => option.toLowerCase() === candidate.trim().toLowerCase(),
    );
    if (!canonical) return;
    const isChosen = tags.some(
      (tag) => tag.toLowerCase() === canonical.toLowerCase(),
    );
    if (!isChosen) onChange([...tags, canonical]);
  }

  return (
    <>
      <TagPicker
        tags={tags}
        options={PROFILE_TAG_OPTIONS}
        suggestions={POPULAR_PROFILE_TAGS}
        onAdd={add}
        onRemove={(tag) => onChange(tags.filter((entry) => entry !== tag))}
        browse={{
          label: t("members:profileEdit.tagBrowser.open"),
          onClick: () => setIsBrowserOpen(true),
        }}
        labels={{
          input: t("members:profileEdit.addTagLabel"),
          placeholder:
            placeholder ?? t("members:profileEdit.searchTagPlaceholder"),
          remove: (tag) => t("members:profileEdit.removeTagLabel", { tag }),
          suggestions: t("members:profileEdit.popularTagsLabel"),
          noMatch: (query) =>
            t("members:profileEdit.tagBrowser.noMatches", { query }),
        }}
      />
      {isBrowserOpen && (
        <ProfileTagBrowserModal
          tags={tags}
          onChange={onChange}
          onClose={() => setIsBrowserOpen(false)}
        />
      )}
    </>
  );
}

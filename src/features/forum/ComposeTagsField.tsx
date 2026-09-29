import { useState } from "react";
import { Collapse, TagPicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ComposeTagsField.module.css";
import { ForumTagBrowseList } from "./ForumTagBrowseList";
import { FORUM_TAG_OPTIONS, POPULAR_FORUM_TAGS } from "./forumTags.data";

const MAX_TAGS = 5;

/**
 * Tag picker for the thread's "Edit tags" modal: choose from the curated
 * vocabulary in `forumTags.data.ts`, search it, quick-add from a popular row,
 * or expand the full grouped list. The × on a chip removes one.
 *
 * It used to serve the compose modal as well. That composer is gone, and the
 * full page at `/forum/new` has its own `ComposeTagsSection`, so this is now
 * the editing half alone, with its own field styles (see the module CSS).
 *
 * Only words in the vocabulary can be added, so the archive stays filed under
 * one set of words rather than drifting into near-duplicates that split a topic
 * across two filter links. Tags that predate the list still render as chips and
 * can still be removed, they just can't be re-added.
 *
 * The browse list expands INLINE rather than in its own modal: the call site
 * is already a modal, and stacking a second one over it to pick a word is a
 * heavier escape path than the choice deserves.
 *
 * The field itself is the shared `TagPicker`, closed to `FORUM_TAG_OPTIONS`;
 * a full set shows `labels.full` in place of the input.
 */
export function ComposeTagsField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const { t } = useTranslation();
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const isAtCap = tags.length >= MAX_TAGS;

  function add(candidate: string) {
    if (!FORUM_TAG_OPTIONS.includes(candidate)) return;
    if (tags.includes(candidate) || isAtCap) return;
    onChange([...tags, candidate]);
  }

  function remove(tag: string) {
    onChange(tags.filter((existing) => existing !== tag));
  }

  function toggle(tag: string) {
    if (tags.includes(tag)) remove(tag);
    else add(tag);
  }

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>
        {t("forum:compose.tagsFieldLabel")}
      </span>
      <TagPicker
        frame="boxed"
        tags={tags}
        options={FORUM_TAG_OPTIONS}
        suggestions={POPULAR_FORUM_TAGS}
        limit={MAX_TAGS}
        formatTag={(tag) => `#${tag}`}
        onAdd={add}
        onRemove={remove}
        browse={{
          label: t(
            isBrowseOpen
              ? "forum:compose.hideTagList"
              : "forum:compose.browseTags",
          ),
          onClick: () => setIsBrowseOpen((open) => !open),
          isExpanded: isBrowseOpen,
        }}
        labels={{
          input: t("forum:compose.tagsSearchLabel"),
          placeholder: t("forum:compose.tagsPlaceholder"),
          remove: (tag) => t("forum:compose.removeTagAria", { tag }),
          add: (tag) => t("forum:compose.addTagAria", { tag }),
          suggestions: t("forum:compose.popularTagsLabel"),
          noMatch: (query) => t("forum:compose.tagsNoMatch", { query }),
          full: t("forum:composePage.tags.full", { max: MAX_TAGS }),
        }}
      />
      <Collapse isOpen={isBrowseOpen}>
        <ForumTagBrowseList tags={tags} isAtCap={isAtCap} onToggle={toggle} />
      </Collapse>
      <span className={styles.tagsHint}>
        {t("forum:compose.tagsHint", { max: MAX_TAGS })}
      </span>
    </div>
  );
}

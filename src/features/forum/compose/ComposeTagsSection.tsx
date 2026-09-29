import { useId, useState } from "react";
import { Collapse, TagPicker } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ForumTagBrowseList } from "../ForumTagBrowseList";
import { FORUM_TAG_OPTIONS, POPULAR_FORUM_TAGS } from "../forumTags.data";
import { COMPOSE_TAG_LIMIT } from "./composeThread.types";
import styles from "./ComposeTagsSection.module.css";

// ── Tags ────────────────────────────────────────────────────────────────────
// A chip box with a search input sitting inside it, a counter, quick-add
// chips, and a "Browse all tags" toggle that expands the grouped vocabulary
// inline.
//
// Both forum tag fields share the `TagPicker` closed to the curated list in
// `forumTags.data.ts`: this one and `ComposeTagsField` in the thread edit
// modal. Members search the list, tap a quick-add chip or pick from the
// browse list; `addTag` also refuses any word outside the vocabulary. The
// quick-add row shows the draft's category suggestions, and the popular tags
// while there are none. Tags already on a restored draft that predate the list
// still render as chips and can be removed.

export interface ComposeTagsSectionProps {
  /** The tags on the draft, without their leading `#`. */
  tags: readonly string[];
  /** Adds a word from the vocabulary. Normalizing, the vocabulary check,
   *  de-duplicating and capping all happen in `addTag`. */
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
  /** Tags worth offering for the draft's category, already filtered by the
   *  hook to ones not yet chosen. */
  suggestedTags: readonly string[];
}

export function ComposeTagsSection({
  tags,
  onAddTag,
  onRemoveTag,
  suggestedTags,
}: ComposeTagsSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const inputHintId = useId();
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const isAtCap = tags.length >= COMPOSE_TAG_LIMIT;
  const hasCategorySuggestions = suggestedTags.length > 0;

  function toggleTag(tag: string) {
    if (tags.includes(tag)) onRemoveTag(tag);
    else onAddTag(tag);
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {t("forum:composePage.section.tags.title")}
        </h2>
        <span className={styles.optional}>
          {t("forum:composePage.section.optional")}
        </span>
        <p className={styles.hint}>
          {t("forum:composePage.section.tags.hint")}
        </p>
        <span className={styles.counter} aria-hidden>
          {t("forum:composePage.tags.counter", {
            count: tags.length,
            max: COMPOSE_TAG_LIMIT,
          })}
        </span>
      </div>

      <TagPicker
        frame="boxed"
        tags={tags}
        options={FORUM_TAG_OPTIONS}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
        suggestions={
          hasCategorySuggestions ? suggestedTags : POPULAR_FORUM_TAGS
        }
        limit={COMPOSE_TAG_LIMIT}
        formatTag={(tag) => `#${tag}`}
        inputDescribedBy={inputHintId}
        hint={
          <p id={inputHintId} className={styles.inputHint}>
            {t("forum:compose.tagsHint", { max: COMPOSE_TAG_LIMIT })}
          </p>
        }
        browse={{
          label: t(
            isBrowseOpen
              ? "forum:compose.hideTagList"
              : "forum:compose.browseTags",
          ),
          onClick: () => setIsBrowseOpen((isOpen) => !isOpen),
          isExpanded: isBrowseOpen,
        }}
        labels={{
          input: t("forum:compose.tagsSearchLabel"),
          placeholder: t("forum:compose.tagsPlaceholder"),
          remove: (tag) => t("forum:compose.removeTagAria", { tag }),
          add: (tag) => t("forum:compose.addTagAria", { tag }),
          suggestions: hasCategorySuggestions
            ? t("forum:composePage.tags.suggestLabel")
            : t("forum:compose.popularTagsLabel"),
          noMatch: (query) => t("forum:compose.tagsNoMatch", { query }),
          full: t("forum:composePage.tags.full", { max: COMPOSE_TAG_LIMIT }),
        }}
      />
      <Collapse isOpen={isBrowseOpen}>
        <ForumTagBrowseList
          tags={tags}
          isAtCap={isAtCap}
          onToggle={toggleTag}
        />
      </Collapse>
    </section>
  );
}

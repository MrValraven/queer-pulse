import { useRef } from "react";
import { useDebouncedValue } from "../../../shared/hooks";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityType } from "../../homepage/data/types";
import { MAX_COMMUNITY_TAGS } from "../communityTags.data";
import { CommunityTagPicker } from "../CommunityTagPicker";
import {
  CATEGORY_OPTIONS,
  TYPE_TAG_SUGGESTIONS,
  initialsOf,
} from "./startCommunity.data";
import { useCommunities } from "../api/useCommunities";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/** Chapter 1 — Why: name, purpose, category, tags, plus a similar-spaces nudge. */
export function StepWhy({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  // Tracks which tag ids were auto-applied for the *previously* selected
  // category, so switching category again swaps out only the tags this
  // suggestion added — anything the founder picked or removed themselves is
  // left untouched. Resets (harmlessly) if the founder navigates away from
  // this chapter and back, since the step remounts.
  const previousSuggestionRef = useRef<string[]>([]);

  const handleTypeSelect = (type: CommunityType) => {
    const suggested = TYPE_TAG_SUGGESTIONS[type] ?? [];
    const previousSuggested = previousSuggestionRef.current;
    const keptTags = draft.tags.filter(
      (id) => !previousSuggested.includes(id) || suggested.includes(id),
    );
    const nextTags = [...keptTags];
    for (const id of suggested) {
      if (nextTags.length >= MAX_COMMUNITY_TAGS) break;
      if (!nextTags.includes(id)) nextTags.push(id);
    }
    previousSuggestionRef.current = suggested;
    set({ type, tags: nextTags });
  };
  // "A few spaces already sound a little like this" has to be measured against
  // the real directory: the static mock registry would show a live founder
  // prototype communities that do not exist on the platform while missing the
  // actual collisions. `useCommunities` is the one search that is right in both
  // modes (server ILIKE in live, the same registry filter in demo), debounced
  // so it fans out once the founder pauses rather than per keystroke.
  const debouncedName = useDebouncedValue(draft.name.trim(), 300);
  const hasEnoughToSearch = debouncedName.length >= 3;
  const { items: nameMatches } = useCommunities(
    { q: debouncedName || undefined },
    { enabled: hasEnoughToSearch },
  );
  const similar = hasEnoughToSearch ? nameMatches.slice(0, 3) : [];

  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-name">
          {t("communities:start.why.nameLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <input
          id="sc-name"
          type="text"
          className={`${styles.input} ${styles.big}`}
          placeholder={t("communities:start.why.namePlaceholder")}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        {similar.length > 0 && (
          <div className={styles.collision}>
            <div className={styles.colHead}>
              {t("communities:start.why.collisionHead")}
            </div>
            {similar.map((c) => (
              <div key={c.slug ?? c.name} className={styles.colMatch}>
                <span className={`${styles.trAv} ${styles.tintFacePlum}`}>
                  {initialsOf(c.name)}
                </span>
                <span className={styles.cmInfo}>
                  <b>{c.name}</b>
                  <span>{c.typeLabel}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="sc-purpose">
          {t("communities:start.why.purposeLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-purpose"
          className={styles.textarea}
          placeholder={t("communities:start.why.purposePlaceholder")}
          value={draft.purpose}
          onChange={(e) => set({ purpose: e.target.value })}
        />
        <span className={styles.hint}>
          {t("communities:start.why.purposeHint")}
        </span>
      </div>

      <div className={styles.field}>
        <label>
          {t("communities:start.why.kindLabel")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <div className={styles.chipRow}>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              className={[
                styles.chip,
                draft.type === c.type && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={draft.type === c.type}
              onClick={() => handleTypeSelect(c.type)}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <CommunityTagPicker
        label={t("communities:start.why.tagsLabel")}
        helper={t("communities:start.why.tagsHint", {
          count: MAX_COMMUNITY_TAGS,
        })}
        selectedIds={draft.tags}
        onChange={(tags) => set({ tags })}
      />
    </div>
  );
}

/** Chapter 2 — Who: the people this space is meant to hold. */
export function StepWho({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-whofor">
          {t("communities:start.who.label")}{" "}
          <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-whofor"
          className={styles.textarea}
          placeholder={t("communities:start.who.placeholder")}
          value={draft.whoFor}
          onChange={(e) => set({ whoFor: e.target.value })}
        />
        <span className={styles.hint}>
          <Translation
            i18nKey="communities:start.who.hint"
            components={{ em: <em /> }}
          />
        </span>
      </div>
    </div>
  );
}

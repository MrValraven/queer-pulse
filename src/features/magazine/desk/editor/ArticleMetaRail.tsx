import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

export interface ArticleMetaRailProps {
  section: string;
  onSectionChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  /** Read-only — the byline lives on the piece record (`byline` on
   * `PieceRecordDto`), not on `ArticleDraftDto`. Shown here for context, but
   * editing it belongs on the piece record's Brief tab. */
  byline: string;
  /** The contributor's credit-line qualifier (e.g. "Contributing editor").
   * `ArticleDraftDto` has no field for this yet, so it's editor-local only
   * for this phase — it does not round-trip through `save()` and resets on
   * reload, same as the plan's own "Suggesting" toggle stub. */
  role: string;
  onRoleChange: (value: string) => void;
  /** Read-only — `slug` is server-derived (`ArticleDraftDto`), not part of
   * `UpdateArticleDraftDto`. */
  slug: string;
  readMinutes: number;
  wordCount: number;
}

/** "one, two ,three,, " → ["one", "two", "three"]. */
function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCsv(values: string[]): string {
  return values.join(", ");
}

/**
 * The piece's editorial metadata: section, byline (read-only), role, tags,
 * slug (read-only), and the current read-time. Ported from the design
 * prototype's meta rail (`mag-write.jsx`). Every editable field patches
 * straight into `ArticleEditorPage`'s state, which the page's autosave
 * debounce picks up like any block edit.
 */
export function ArticleMetaRail({
  section,
  onSectionChange,
  tags,
  onTagsChange,
  byline,
  role,
  onRoleChange,
  slug,
  readMinutes,
  wordCount,
}: ArticleMetaRailProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <h3>{t("magazine:write.meta.title")}</h3>

      <FormField label={t("magazine:write.meta.sectionLabel")}>
        <input
          type="text"
          value={section}
          onChange={(event) => onSectionChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("magazine:write.meta.bylineLabel")}
        helper={t("magazine:write.meta.bylineHelper")}
      >
        <input type="text" value={byline} readOnly />
      </FormField>

      <FormField
        label={t("magazine:write.meta.roleLabel")}
        helper={t("magazine:write.meta.roleHelper")}
      >
        <input
          type="text"
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("magazine:write.meta.tagsLabel")}
        helper={t("magazine:write.meta.tagsHelper")}
      >
        <input
          type="text"
          value={joinCsv(tags)}
          onChange={(event) => onTagsChange(splitCsv(event.target.value))}
        />
      </FormField>

      <FormField
        label={t("magazine:write.meta.slugLabel")}
        helper={t("magazine:write.meta.slugHelper")}
      >
        <input type="text" value={slug} readOnly />
      </FormField>

      <div className={styles.kvs}>
        <div className={styles.kv}>
          <span>{t("magazine:write.meta.wordCountLabel")}</span>
          <b>{wordCount}</b>
        </div>
        <div className={styles.kv}>
          <span>{t("magazine:write.meta.readTimeLabel")}</span>
          <b>{t("magazine:format.min", { count: readMinutes })}</b>
        </div>
      </div>
    </div>
  );
}

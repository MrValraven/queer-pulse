import { FormField } from "../../../../shared/components/ui";
import { ImageUploadField } from "../../../subprofiles/ImageUploadField";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ArticleSeoFields } from "./ArticleSeoFields";
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
  /** The contributor's credit-line qualifier (e.g. "Contributing editor") —
   * a real `MagazineArticle.role` column, round-trips through `save()` like
   * every other field on this rail (mirrors `MagazineDeck.role`). */
  role: string;
  onRoleChange: (value: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  /**
   * CON-04 — the piece's LEAD ART: the photograph or illustration that runs
   * on the article page and on every card pointing at it. Whichever reference
   * the editor currently holds (the resolved `/files/<key>` URL the draft was
   * seeded with, or the bare storage key a fresh upload just produced); the
   * backend collapses both to a key.
   *
   * Separate from `socialImage` below, which is the share-card override. An
   * editor may set either without the other.
   */
  heroImageKey: string;
  onHeroImageKeyChange: (value: string) => void;
  socialImage: string;
  onSocialImageChange: (value: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (value: string) => void;
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
 * slug (read-only), the current read-time, and SEO/social fields
 * (`ArticleSeoFields`). Ported from the design prototype's meta rail
 * (`mag-write.jsx`). Every editable field patches straight into
 * `ArticleEditorPage`'s state, which the page's autosave debounce picks up
 * like any block edit.
 */
export function ArticleMetaRail({
  section,
  onSectionChange,
  tags,
  onTagsChange,
  byline,
  role,
  onRoleChange,
  metaDescription,
  onMetaDescriptionChange,
  heroImageKey,
  onHeroImageKeyChange,
  socialImage,
  onSocialImageChange,
  canonicalUrl,
  onCanonicalUrlChange,
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

      <FormField
        label={t("magazine:write.meta.heroImageLabel")}
        helper={t("magazine:write.meta.heroImageHelper")}
      >
        <ImageUploadField
          // The same upload surface a magazine cover uses: a 2:1 plate, up to
          // 10 MB, at least 1200x600. Reusing the kind reuses its reframe
          // aspect, its media-library label and its `/files/*` visibility
          // rather than inventing a fourth near-identical one.
          kind="story-cover"
          value={heroImageKey}
          onChange={onHeroImageKeyChange}
          size={120}
          placeholder={t("magazine:write.meta.heroImagePlaceholder")}
        />
      </FormField>

      <ArticleSeoFields
        metaDescription={metaDescription}
        onMetaDescriptionChange={onMetaDescriptionChange}
        socialImage={socialImage}
        onSocialImageChange={onSocialImageChange}
        canonicalUrl={canonicalUrl}
        onCanonicalUrlChange={onCanonicalUrlChange}
      />

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

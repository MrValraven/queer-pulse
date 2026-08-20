import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

export interface ArticleSeoFieldsProps {
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  socialImage: string;
  onSocialImageChange: (value: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (value: string) => void;
}

/**
 * The article's SEO/social fields — split out of `ArticleMetaRail` to keep
 * that component small (component-decomposition convention). No equivalent
 * existed on `MagazineArticle` before this pass (CNT-7 audit follow-up):
 * `metaDescription`/`socialImage`/`canonicalUrl` are new columns, all
 * optional, all round-tripping through `save()` like every other meta field.
 */
export function ArticleSeoFields({
  metaDescription,
  onMetaDescriptionChange,
  socialImage,
  onSocialImageChange,
  canonicalUrl,
  onCanonicalUrlChange,
}: ArticleSeoFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.seoFields}>
      <FormField
        label={t("magazine:write.meta.metaDescriptionLabel")}
        helper={t("magazine:write.meta.metaDescriptionHelper")}
      >
        <textarea
          rows={2}
          value={metaDescription}
          onChange={(event) => onMetaDescriptionChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("magazine:write.meta.socialImageLabel")}
        helper={t("magazine:write.meta.socialImageHelper")}
      >
        <input
          type="text"
          value={socialImage}
          onChange={(event) => onSocialImageChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("magazine:write.meta.canonicalUrlLabel")}
        helper={t("magazine:write.meta.canonicalUrlHelper")}
      >
        <input
          type="text"
          value={canonicalUrl}
          onChange={(event) => onCanonicalUrlChange(event.target.value)}
        />
      </FormField>
    </div>
  );
}

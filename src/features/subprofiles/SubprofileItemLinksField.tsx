import { FiPlus, FiX } from "react-icons/fi";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SOCIAL_PLATFORMS,
  socialHref,
  socialPlatform,
} from "../../shared/social/socialPlatforms";
import type { SocialLinkDTO } from "./api/subprofiles.api";
import { MAX_ITEM_LINKS } from "./subprofileEditor.data";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileSocialLinksEditor.module.css";

/** Every named platform is a brand noun and stays untranslated in every locale;
 *  only the generic "Other link" fallback is platform chrome — mirrors
 *  `SubprofileSocialLinksEditor`'s `platformLabel`. */
function platformLabel(
  key: string,
  label: string,
  t: (key: string) => string,
): string {
  return key === "other" ? t("subprofiles:socialEditor.other") : label;
}

/**
 * Controlled editor for an item's typed social links (e.g. a project's GitHub /
 * demo / docs). Each row is a platform select plus a handle/URL field with a
 * live `socialHref` preview, capped at `MAX_ITEM_LINKS`. Every edit calls
 * `onChange` with the whole next array — no local state, no save button; the
 * owning drawer persists it into the item's `structured.links`. Row markup
 * mirrors `SubprofileSocialLinksEditor` and reuses its CSS module.
 */
export function SubprofileItemLinksField({
  links,
  onChange,
}: {
  links: SocialLinkDTO[];
  onChange: (links: SocialLinkDTO[]) => void;
}) {
  const { t } = useTranslation();
  const atMax = links.length >= MAX_ITEM_LINKS;

  function patch(index: number, patchValue: Partial<SocialLinkDTO>) {
    onChange(
      links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patchValue } : link,
      ),
    );
  }
  function remove(index: number) {
    onChange(links.filter((_, linkIndex) => linkIndex !== index));
  }
  function add() {
    if (atMax) return;
    onChange([...links, { platform: "website", urlOrHandle: "" }]);
  }

  return (
    <div className={styles.fieldWrap}>
      <span className={styles.fieldLabel}>
        {t("subprofiles:itemLinks.label")}
      </span>
      <div className={styles.linksEditor}>
        {links.map((link, index) => {
          const meta = socialPlatform(link.platform);
          const Icon = meta.icon;
          const href = socialHref(link.platform, link.urlOrHandle);
          const label = platformLabel(meta.key, meta.label, t);
          return (
            <div key={index} className={styles.linkGroup}>
              <div className={styles.linkRow}>
                <span className={styles.linkIcon} aria-hidden>
                  <Icon size={16} />
                </span>
                <Select
                  className={styles.linkPlatform}
                  size="sm"
                  label={t("subprofiles:socialEditor.platformLabel")}
                  options={SOCIAL_PLATFORMS.map((platformOption) => ({
                    value: platformOption.key,
                    label: platformLabel(
                      platformOption.key,
                      platformOption.label,
                      t,
                    ),
                  }))}
                  value={link.platform}
                  onChange={(value) => patch(index, { platform: value ?? "" })}
                />
                <input
                  className={`${styles.inlineInput} ${styles.linkInput}`}
                  value={link.urlOrHandle}
                  placeholder={meta.placeholder}
                  aria-label={t("subprofiles:socialEditor.linkFor", {
                    platform: label,
                  })}
                  onChange={(event) =>
                    patch(index, { urlOrHandle: event.target.value })
                  }
                />
                <button
                  type="button"
                  className={styles.linkRemove}
                  aria-label={t("subprofiles:socialEditor.removeLinkFor", {
                    platform: label,
                  })}
                  onClick={() => remove(index)}
                >
                  <FiX size={15} />
                </button>
              </div>
              {href && <p className={styles.preview}>{href}</p>}
            </div>
          );
        })}
      </div>

      <div>
        <button
          type="button"
          className={sharedStyles.addBtn}
          onClick={add}
          disabled={atMax}
        >
          <FiPlus size={18} aria-hidden /> {t("subprofiles:itemLinks.add")}
        </button>
        {atMax && (
          <p className={sharedStyles.capHint}>
            {t("subprofiles:socialEditor.capHint")}
          </p>
        )}
      </div>

      <span className={styles.fieldHelper}>
        {t("subprofiles:itemLinks.helper")}
      </span>
    </div>
  );
}

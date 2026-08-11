import { FiLink, FiPlus, FiX } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SOCIAL_PLATFORMS,
  socialHref,
  socialPlatform,
} from "../../shared/social/socialPlatforms";
import type { SocialLinkDTO } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  useSubprofileEditorContext,
  withSocialUid,
} from "./subprofileEditorContext";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileSocialLinksEditor.module.css";

/** Mirrors the backend `MAX_SOCIAL_LINKS` validator. */
const MAX_SOCIAL_LINKS = 20;

/** Every named platform is a brand noun and stays untranslated in every
 *  locale; only the generic "Other link" fallback is platform chrome —
 *  mirrors `members/SocialLinksEditor`'s `platformLabel`. */
function platformLabel(
  key: string,
  label: string,
  t: (key: string) => string,
): string {
  return key === "other" ? t("subprofiles:socialEditor.other") : label;
}

/**
 * Owner editor for a persona's social links: add/remove rows, each a platform
 * select plus a handle/URL field with a live icon + resolved-href preview via
 * `socialHref`, capped at `MAX_SOCIAL_LINKS`. Rows are CONTROLLED by
 * `SubprofileEditorContext` (`socialRows`/`setSocialRows`) — no local state
 * and no Save button; the global savebar's `saveAll()` PUTs the whole list.
 * Mirrors `members/SocialLinksEditor`'s add/remove UX.
 */
export function SubprofileSocialLinksEditor({
  subprofile: _subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { socialRows: rows, setSocialRows } = useSubprofileEditorContext();

  const atMax = rows.length >= MAX_SOCIAL_LINKS;

  function patch(uid: string, patchValue: Partial<SocialLinkDTO>) {
    setSocialRows(
      rows.map((row) => (row._uid === uid ? { ...row, ...patchValue } : row)),
    );
  }
  function remove(uid: string) {
    setSocialRows(rows.filter((row) => row._uid !== uid));
  }
  function add() {
    if (atMax) return;
    setSocialRows([...rows, withSocialUid({ platform: "website", urlOrHandle: "" })]);
  }

  return (
    <section className={sharedStyles.card}>
      <div className={sharedStyles.cardHead}>
        <span className={sharedStyles.cardIcon}>
          <FiLink size={20} aria-hidden />
        </span>
        <h2 className={sharedStyles.cardTitle}>
          {t("subprofiles:socialEditor.title")}
        </h2>
      </div>

      <div className={styles.linksEditor}>
        {rows.map((row) => {
          const meta = socialPlatform(row.platform);
          const Icon = meta.icon;
          const href = socialHref(row.platform, row.urlOrHandle);
          const label = platformLabel(meta.key, meta.label, t);
          return (
            <FadeIn key={row._uid} className={styles.linkGroup}>
              <div className={styles.linkRow}>
                <span className={styles.linkIcon} aria-hidden>
                  <Icon size={16} />
                </span>
                <select
                  className={styles.linkSelect}
                  value={row.platform}
                  aria-label={t("subprofiles:socialEditor.platformLabel")}
                  onChange={(event) =>
                    patch(row._uid, { platform: event.target.value })
                  }
                >
                  {SOCIAL_PLATFORMS.map((platformOption) => (
                    <option key={platformOption.key} value={platformOption.key}>
                      {platformLabel(platformOption.key, platformOption.label, t)}
                    </option>
                  ))}
                </select>
                <input
                  className={`${styles.inlineInput} ${styles.linkInput}`}
                  value={row.urlOrHandle}
                  placeholder={meta.placeholder}
                  aria-label={t("subprofiles:socialEditor.linkFor", {
                    platform: label,
                  })}
                  onChange={(event) =>
                    patch(row._uid, { urlOrHandle: event.target.value })
                  }
                />
                <button
                  type="button"
                  className={styles.linkRemove}
                  aria-label={t("subprofiles:socialEditor.removeLinkFor", {
                    platform: label,
                  })}
                  onClick={() => remove(row._uid)}
                >
                  <FiX size={15} />
                </button>
              </div>
              {href && <p className={styles.preview}>{href}</p>}
            </FadeIn>
          );
        })}
      </div>

      <div className={sharedStyles.sectionFoot}>
        <div>
          <button
            type="button"
            className={sharedStyles.addBtn}
            onClick={add}
            disabled={atMax}
          >
            <FiPlus size={18} aria-hidden /> {t("subprofiles:socialEditor.add")}
          </button>
          {atMax && (
            <p className={sharedStyles.capHint}>
              {t("subprofiles:socialEditor.capHint")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

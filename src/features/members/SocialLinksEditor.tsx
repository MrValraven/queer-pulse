import { FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import { SOCIAL_PLATFORMS, socialPlatform } from "./socialLinks.data";
import styles from "./ProfileEdit.module.css";

/** Platform display label: every entry except the generic fallback is a
 *  proper platform name (Instagram, GitHub, …) and stays untranslated in
 *  every locale, like a brand noun. Only the generic "Other link" fallback
 *  is platform chrome. */
function platformLabel(
  key: string,
  label: string,
  t: (key: string) => string,
): string {
  return key === "other" ? t("members:social.other") : label;
}

/**
 * Edit-mode "Links" control: add / remove rows, each a platform select plus a
 * handle/URL field. Bound to the draft in `ProfileProvider` via `onChange`.
 * Empty rows are kept while editing (so a just-added row isn't yanked away) and
 * filtered out on save by the provider.
 */
export function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (next: SocialLink[]) => void;
}) {
  const { t } = useTranslation();
  function update(index: number, patch: Partial<SocialLink>) {
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function remove(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...links, { platform: "website", urlOrHandle: "" }]);
  }

  return (
    <div className={styles.linksEditor}>
      {links.map((link, i) => {
        const meta = socialPlatform(link.platform);
        const Icon = meta.icon;
        return (
          <div key={i} className={styles.linkRow}>
            <span className={styles.linkIcon} aria-hidden>
              <Icon size={16} />
            </span>
            <select
              className={styles.linkSelect}
              value={link.platform}
              aria-label={t("members:social.platformLabel")}
              onChange={(e) => update(i, { platform: e.target.value })}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.key} value={p.key}>
                  {platformLabel(p.key, p.label, t)}
                </option>
              ))}
            </select>
            <input
              className={`${styles.inlineInput} ${styles.linkInput}`}
              value={link.urlOrHandle}
              placeholder={meta.placeholder}
              aria-label={t("members:social.linkFor", {
                platform: platformLabel(meta.key, meta.label, t),
              })}
              onChange={(e) => update(i, { urlOrHandle: e.target.value })}
            />
            <button
              type="button"
              className={styles.linkRemove}
              aria-label={t("members:social.removeLinkFor", {
                platform: platformLabel(meta.key, meta.label, t),
              })}
              onClick={() => remove(i)}
            >
              <FiX size={15} />
            </button>
          </div>
        );
      })}
      <button type="button" className={styles.addRowBtn} onClick={add}>
        <FiPlus size={15} aria-hidden /> {t("members:social.addLink")}
      </button>
    </div>
  );
}

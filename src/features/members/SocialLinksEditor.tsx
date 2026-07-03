import { FiPlus, FiX } from "react-icons/fi";
import type { SocialLink } from "./data/members";
import { SOCIAL_PLATFORMS, socialPlatform } from "./socialLinks.data";
import styles from "./ProfileEdit.module.css";

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
              aria-label="Link platform"
              onChange={(e) => update(i, { platform: e.target.value })}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              className={`${styles.inlineInput} ${styles.linkInput}`}
              value={link.urlOrHandle}
              placeholder={meta.placeholder}
              aria-label={`${meta.label} link`}
              onChange={(e) => update(i, { urlOrHandle: e.target.value })}
            />
            <button
              type="button"
              className={styles.linkRemove}
              aria-label={`Remove ${meta.label} link`}
              onClick={() => remove(i)}
            >
              <FiX size={15} />
            </button>
          </div>
        );
      })}
      <button type="button" className={styles.addRowBtn} onClick={add}>
        <FiPlus size={15} aria-hidden /> Add a link
      </button>
    </div>
  );
}

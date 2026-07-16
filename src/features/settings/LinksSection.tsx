import { FiPlus, FiX } from "react-icons/fi";
import type { SocialLink } from "../members/data/members";
import { SOCIAL_PLATFORMS, socialPlatform } from "../members/socialLinks.data";
import styles from "./EditProfilePage.module.css";

/**
 * Settings "Links & social" editor: add / remove multiple links, each a platform
 * select + a handle/URL field showing the platform's icon. Bound to the shared
 * profile draft (`draft.socials`) by the pane via `onChange`. Empty rows are kept
 * while editing and filtered out on save by ProfileProvider.
 */
export function LinksSection({
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
    <div className={styles.section} id="links">
      <h2 className={styles.sectionTitle}>
        Links <em>&amp; social</em>
      </h2>
      <p className={styles.sectionSub}>
        Add your website and social profiles. Each one shows with its icon on
        your profile.
      </p>
      <div className={styles.linksList}>
        {links.map((link, i) => {
          const meta = socialPlatform(link.platform);
          const Icon = meta.icon;
          return (
            <div key={i} className={styles.linkRow}>
              <span className={styles.linkIcon} aria-hidden>
                <Icon size={17} />
              </span>
              <select
                className={`${styles.fieldSelect} ${styles.linkPlatform}`}
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
                className={styles.fieldInput}
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
                <FiX size={16} />
              </button>
            </div>
          );
        })}
        <button type="button" className={styles.addLinkBtn} onClick={add}>
          <FiPlus size={15} aria-hidden /> Add a link
        </button>
      </div>
    </div>
  );
}

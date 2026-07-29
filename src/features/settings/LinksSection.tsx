import { FiPlus, FiX } from "react-icons/fi";
import type { SocialLink } from "../members/data/members";
import { SOCIAL_PLATFORMS, socialPlatform } from "../members/socialLinks.data";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  function update(index: number, patch: Partial<SocialLink>) {
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function remove(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }
  function add() {
    onChange([
      ...links,
      { id: crypto.randomUUID(), platform: "website", urlOrHandle: "" },
    ]);
  }

  return (
    <div className={styles.section} id="links">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.links.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>{t("settings:editProfile.links.sub")}</p>
      <div className={styles.linksList}>
        {links.map((link, i) => {
          const meta = socialPlatform(link.platform);
          const Icon = meta.icon;
          return (
            // Key by the stable minted id where present (added rows) so removing
            // a middle row doesn't shift each following row's identity and leak
            // its input focus/IME state; server links without an id keep index.
            <div key={link.id ?? `loaded:${i}`} className={styles.linkRow}>
              <span className={styles.linkIcon} aria-hidden>
                <Icon size={17} />
              </span>
              <select
                className={`${styles.fieldSelect} ${styles.linkPlatform}`}
                value={link.platform}
                aria-label={t("settings:editProfile.links.platformAriaLabel")}
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
                aria-label={t("settings:editProfile.links.linkAriaLabel", {
                  platform: meta.label,
                })}
                onChange={(e) => update(i, { urlOrHandle: e.target.value })}
              />
              <button
                type="button"
                className={styles.linkRemove}
                aria-label={t("settings:editProfile.links.removeAriaLabel", {
                  platform: meta.label,
                })}
                onClick={() => remove(i)}
              >
                <FiX size={16} />
              </button>
            </div>
          );
        })}
        <button type="button" className={styles.addLinkBtn} onClick={add}>
          <FiPlus size={15} aria-hidden />{" "}
          {t("settings:editProfile.links.addLink")}
        </button>
      </div>
    </div>
  );
}

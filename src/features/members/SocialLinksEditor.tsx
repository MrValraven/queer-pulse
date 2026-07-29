import { FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import { SOCIAL_PLATFORMS, socialPlatform } from "./socialLinks.data";
import { useRowKeys } from "./useRowKeys";
import styles from "./ProfileEdit.module.css";

/**
 * Advisory-only sniff test: a non-empty value is "fine" when it reads like an
 * @handle or a URL-ish string (a scheme, or a dotted host with no whitespace).
 * Empty is never an error. This never blocks editing — it only surfaces a hint.
 */
function looksLikeLinkOrHandle(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("@")) return true;
  if (/\s/.test(trimmed)) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return trimmed.includes(".");
}

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
  const { keys, appendKey, removeKeyAt } = useRowKeys(links.length);
  function update(index: number, patch: Partial<SocialLink>) {
    onChange(
      links.map((link, rowIndex) =>
        rowIndex === index ? { ...link, ...patch } : link,
      ),
    );
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(links.filter((_, rowIndex) => rowIndex !== index));
  }
  function add() {
    appendKey();
    onChange([...links, { platform: "website", urlOrHandle: "" }]);
  }

  return (
    <div className={styles.linksEditor}>
      {links.map((link, index) => {
        const meta = socialPlatform(link.platform);
        const Icon = meta.icon;
        const rowKey = keys[index];
        const isInvalid = !looksLikeLinkOrHandle(link.urlOrHandle);
        const errorId = `${rowKey}-error`;
        return (
          <div
            key={rowKey}
            className={styles.linkRow}
            // Allow the advisory hint (below) to wrap onto its own line without
            // shrinking the inputs — .linkRow is a non-wrapping flex row.
            style={isInvalid ? { flexWrap: "wrap" } : undefined}
          >
            <span className={styles.linkIcon} aria-hidden>
              <Icon size={16} />
            </span>
            <select
              className={styles.linkSelect}
              value={link.platform}
              aria-label={t("members:social.platformLabel")}
              onChange={(event) => update(index, { platform: event.target.value })}
            >
              {SOCIAL_PLATFORMS.map((platform) => (
                <option key={platform.key} value={platform.key}>
                  {platformLabel(platform.key, platform.label, t)}
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
              aria-invalid={isInvalid || undefined}
              aria-describedby={isInvalid ? errorId : undefined}
              onChange={(event) =>
                update(index, { urlOrHandle: event.target.value })
              }
            />
            <button
              type="button"
              className={styles.linkRemove}
              aria-label={t("members:social.removeLinkFor", {
                platform: platformLabel(meta.key, meta.label, t),
              })}
              onClick={() => remove(index)}
            >
              <FiX size={15} />
            </button>
            {isInvalid && (
              <span
                id={errorId}
                role="alert"
                // No CSS-module class for this advisory hint (module.css is owned
                // elsewhere); tokens-only inline style mirrors `.saveError`.
                style={{
                  flexBasis: "100%",
                  color: "var(--accent-ink)",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                {t("members:profileEdit.validation.invalidUrl")}
              </span>
            )}
          </div>
        );
      })}
      <button type="button" className={styles.addRowBtn} onClick={add}>
        <FiPlus size={15} aria-hidden /> {t("members:social.addLink")}
      </button>
    </div>
  );
}

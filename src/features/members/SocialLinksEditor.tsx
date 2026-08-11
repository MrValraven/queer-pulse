import { FiPlus, FiX } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import { SOCIAL_PLATFORMS, socialHref, socialPlatform } from "./socialLinks.data";
import { useRowKeys } from "./useRowKeys";
import styles from "./ProfileEdit.module.css";

/**
 * Advisory-only sniff test: a non-empty value is "fine" when it would resolve to
 * a real link for this platform. We defer to `socialHref` — the same builder
 * read-mode uses — so a bare handle like "mrvalraven" on a platform with an
 * `hrefPrefix` (Instagram, X, …) is correctly accepted, not flagged. The lone
 * extra allowance is an @-address on prefix-less platforms (e.g. a Mastodon
 * "@you@instance"), which read-mode renders as a plain, readable chip rather
 * than a link. Empty is never an error; this never blocks editing — it only
 * surfaces a hint.
 */
function looksLikeLinkOrHandle(platform: string, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/\s/.test(trimmed)) return false;
  if (socialHref(platform, trimmed)) return true;
  return trimmed.startsWith("@");
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
        const isInvalid = !looksLikeLinkOrHandle(link.platform, link.urlOrHandle);
        const errorId = `${rowKey}-error`;
        return (
          <FadeIn
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
          </FadeIn>
        );
      })}
      <button type="button" className={styles.addRowBtn} onClick={add}>
        <FiPlus size={15} aria-hidden /> {t("members:social.addLink")}
      </button>
    </div>
  );
}

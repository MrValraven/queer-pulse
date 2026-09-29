import { m, useIsPresent } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import {
  SOCIAL_PLATFORMS,
  socialHref,
  socialPlatform,
} from "./socialLinks.data";
import styles from "./ProfileEdit.module.css";

// ── One row of the profile Links editor ─────────────────────────────────────
// Split out of `SocialLinksEditor.tsx`, which renders it inside an
// `AnimatePresence`: the row grows in when a link is added and folds away when
// one is removed. It shares the profile editor's stylesheet.

/**
 * Advisory-only sniff test: a non-empty value is "fine" when it would resolve to
 * a real link for this platform. We defer to `socialHref`, the same builder
 * read-mode uses, so a bare handle like "mrvalraven" on a platform with an
 * `hrefPrefix` (Instagram, X, …) is correctly accepted. The lone extra
 * allowance is an @-address on prefix-less platforms (e.g. a Mastodon
 * "@you@instance"), which read-mode renders as a plain, readable chip rather
 * than a link. Empty is never an error; this never blocks editing, it only
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

/** The house spring curve (`--ease`), as the cubic bezier motion expects. */
const LINK_ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

interface SocialLinksEditorRowProps {
  link: SocialLink;
  /** The row's stable React key, reused for its hint's id. */
  rowKey: string;
  onUpdate: (patch: Partial<SocialLink>) => void;
  onRemove: () => void;
}

export function SocialLinksEditorRow({
  link,
  rowKey,
  onUpdate,
  onRemove,
}: SocialLinksEditorRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // A folding row keeps the handlers of its last render, whose row index now
  // points at a different link, so it takes no input while it goes.
  const isPresent = useIsPresent();
  const meta = socialPlatform(link.platform);
  const Icon = meta.icon;
  const label = platformLabel(meta.key, meta.label, t);
  const isInvalid = !looksLikeLinkOrHandle(link.platform, link.urlOrHandle);
  const errorId = `${rowKey}-error`;
  return (
    // The item animates its height and clips only while it moves; the spacing
    // and the focus rings live on the row inside, so neither snaps at the end.
    <m.div
      inert={!isPresent}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{
        height: "auto",
        opacity: 1,
        transitionEnd: { overflow: "visible" },
      }}
      exit={{ height: 0, opacity: 0, overflow: "hidden" }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: LINK_ROW_EASE }}
    >
      <div
        className={styles.linkRow}
        // Allow the advisory hint (below) to wrap onto its own line without
        // shrinking the inputs: .linkRow is a non-wrapping flex row.
        style={isInvalid ? { flexWrap: "wrap" } : undefined}
      >
        <span className={styles.linkIcon} aria-hidden>
          <Icon size={16} />
        </span>
        <Select
          label={t("members:social.platformLabel")}
          options={SOCIAL_PLATFORMS.map((platform) => ({
            value: platform.key,
            label: platformLabel(platform.key, platform.label, t),
          }))}
          value={link.platform}
          onChange={(value) => onUpdate({ platform: value ?? link.platform })}
        />
        <input
          className={`${styles.inlineInput} ${styles.linkInput}`}
          value={link.urlOrHandle}
          placeholder={meta.placeholder}
          aria-label={t("members:social.linkFor", { platform: label })}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? errorId : undefined}
          onChange={(event) => onUpdate({ urlOrHandle: event.target.value })}
        />
        <button
          type="button"
          className={styles.linkRemove}
          aria-label={t("members:social.removeLinkFor", { platform: label })}
          onClick={onRemove}
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
    </m.div>
  );
}

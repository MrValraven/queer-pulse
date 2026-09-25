import { FiLock, FiUsers } from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import type { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ComposeAudience } from "./composeThread.types";
import styles from "./ComposeAudienceList.module.css";

// ── One community row in "Who sees it?" ─────────────────────────────────────
// Split out of `ComposeAudienceList`, which owns the radiogroup and its
// keyboard model; this only draws a row and reports the press.

export interface AudienceRowProps {
  audience: ComposeAudience;
  isChecked: boolean;
  radioProps: ReturnType<
    ReturnType<typeof useRovingRadioGroup<HTMLButtonElement>>["getRadioProps"]
  >;
  onSelect: (communitySlug: string) => void;
}

export function AudienceRow({
  audience,
  isChecked,
  radioProps,
  onSelect,
}: AudienceRowProps) {
  const { t } = useTranslation();
  return (
    <button
      {...radioProps}
      type="button"
      role="radio"
      aria-checked={isChecked}
      className={styles.row}
      onClick={() => onSelect(audience.slug)}
    >
      <span className={styles.radioDot} aria-hidden />
      <Avatar initials={initialsOf(audience.name)} size={32} tint="plum" />
      <span className={styles.rowText}>
        <span className={styles.rowName}>
          {audience.name}
          {audience.isPrivate && (
            <span className={styles.privateTag}>
              <FiLock aria-hidden />
              {t("forum:composePage.audience.private")}
            </span>
          )}
        </span>
        <span className={styles.rowSub}>
          {t(
            audience.isPrivate
              ? "forum:composePage.audience.privateSub"
              : "forum:composePage.audience.openSub",
          )}
        </span>
      </span>
      {audience.memberCount !== undefined && (
        <span className={styles.memberCount}>
          <FiUsers aria-hidden />
          {t("forum:composePage.audience.memberCount", {
            count: audience.memberCount,
          })}
        </span>
      )}
    </button>
  );
}

/**
 * Up to two initials from a community's own name. Member-authored text, so it
 * is read defensively: a one-word name gives one letter, and a name that is
 * all punctuation gives none rather than throwing.
 */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

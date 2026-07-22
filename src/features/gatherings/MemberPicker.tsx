import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Avatar, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { CohostCandidate } from "./manageCohosts.data";
import styles from "./ManageCohosts.module.css";

interface MemberPickerProps {
  /** Everyone selectable. */
  candidates: CohostCandidate[];
  /** Slugs to hide entirely (e.g. people already added). */
  excludeSlugs?: string[];
  /** Currently-selected slugs (checkbox mode). Omit for single-tap mode. */
  selected?: string[];
  /** Toggle a slug. In single-tap mode this fires once with the picked slug. */
  onToggle: (slug: string) => void;
  /** Disable further additions once the cap is hit (unselected rows greyed). */
  atCap?: boolean;
  /** Show a checkbox on each row (multi-select). Off = single-tap add. */
  multiSelect?: boolean;
  /** Secondary line + search field: the member's role (default) or their @slug. */
  secondaryField?: "role" | "slug";
  searchLabel?: string;
  /** Search-box placeholder. Defaults to the cohost picker's "name or role" copy. */
  placeholder?: string;
}

/** Searchable member list shared by the invite + add-cohost modals. */
export function MemberPicker({
  candidates,
  excludeSlugs = [],
  selected = [],
  onToggle,
  atCap = false,
  multiSelect = false,
  secondaryField = "role",
  searchLabel,
  placeholder,
}: MemberPickerProps) {
  const { t } = useTranslation();
  const resolvedSearchLabel =
    searchLabel ?? t("gatherings:cohost.picker.searchLabelDefault");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (excludeSlugs.includes(candidate.slug)) return false;
      if (!normalizedQuery) return true;
      const secondary =
        secondaryField === "slug" ? candidate.slug : candidate.role;
      return (
        candidate.name.toLowerCase().includes(normalizedQuery) ||
        secondary.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [candidates, excludeSlugs, query, secondaryField]);

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={placeholder ?? t("gatherings:cohost.picker.placeholder")}
        ariaLabel={resolvedSearchLabel}
      />
      <div
        className={styles.pickerList}
        role="listbox"
        aria-label={resolvedSearchLabel}
      >
        {visible.length === 0 ? (
          <div className={styles.noResults}>
            {t("gatherings:cohost.picker.noResults", { query })}
          </div>
        ) : (
          visible.map((candidate) => {
            const isOn = selected.includes(candidate.slug);
            const disabled = multiSelect && atCap && !isOn;
            return (
              <button
                key={candidate.slug}
                type="button"
                role="option"
                aria-selected={isOn}
                disabled={disabled}
                className={[styles.pickerRow, isOn && styles.pickerRowActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggle(candidate.slug)}
              >
                <Avatar
                  initials={candidate.initials}
                  tint={candidate.tint}
                  src={candidate.photo}
                  size={38}
                />
                <div className={styles.pickerInfo}>
                  <div className={styles.pickerName}>
                    <span className={styles.nameRow}>
                      {candidate.name}
                      <MemberStaffBadge slug={candidate.slug} />
                    </span>
                  </div>
                  <div className={styles.pickerRole}>
                    {secondaryField === "slug"
                      ? `@${candidate.slug}`
                      : candidate.role}
                  </div>
                </div>
                {multiSelect && (
                  <span
                    className={[styles.checkBox, isOn && styles.checkBoxOn]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    {isOn && <FiCheck />}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

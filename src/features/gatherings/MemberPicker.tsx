import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Avatar, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  searchLabel?: string;
}

/** Searchable member list shared by the invite + add-cohost modals. */
export function MemberPicker({
  candidates,
  excludeSlugs = [],
  selected = [],
  onToggle,
  atCap = false,
  multiSelect = false,
  searchLabel,
}: MemberPickerProps) {
  const { t } = useTranslation();
  const resolvedSearchLabel =
    searchLabel ?? t("gatherings:cohost.picker.searchLabelDefault");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (excludeSlugs.includes(c.slug)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
      );
    });
  }, [candidates, excludeSlugs, query]);

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("gatherings:cohost.picker.placeholder")}
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
          visible.map((c) => {
            const isOn = selected.includes(c.slug);
            const disabled = multiSelect && atCap && !isOn;
            return (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={isOn}
                disabled={disabled}
                className={[styles.pickerRow, isOn && styles.pickerRowActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggle(c.slug)}
              >
                <Avatar
                  initials={c.initials}
                  tint={c.tint}
                  src={c.photo}
                  size={38}
                />
                <div className={styles.pickerInfo}>
                  <div className={styles.pickerName}>{c.name}</div>
                  <div className={styles.pickerRole}>{c.role}</div>
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

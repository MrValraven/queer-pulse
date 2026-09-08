import { useId, useState } from "react";
import { FiChevronUp, FiInfo, FiPlus } from "react-icons/fi";
import { Button, ChipSelect } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui/FormField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMMUNITY_TAGS,
  MAX_COMMUNITY_TAGS,
  hasOverlappingTags,
} from "./communityTags.data";
import styles from "./CommunityTagPicker.module.css";

interface CommunityTagPickerProps {
  label: string;
  helper?: string;
  selectedIds: string[];
  onChange: (next: string[]) => void;
}

/**
 * The curated tag multi-select, shared by `EditCommunityModal` and the
 * Start-a-Community wizard's "why" chapter (chapter 1 — the only place tags
 * can be picked at creation time). A `ChipSelect` over the full
 * `COMMUNITY_TAGS` vocab, capped at `MAX_COMMUNITY_TAGS`, plus a soft
 * "these often go together" nudge (`TAG_OVERLAP_CLUSTERS`,
 * `communityTags.data.ts`) once 2+ selected tags share a cluster. The hint is
 * informational only — it never blocks toggling a tag or submitting.
 *
 * The picker opens collapsed once anything is chosen: the vocab is 53 chips,
 * ten-odd wrapped rows that every unrelated edit (welcome message, access,
 * roster) has to scroll past, while the tags already on the community are the
 * only ones an owner usually needs to see. Collapsed still renders the chosen
 * chips as live chips, so removing one never needs the list open. With nothing
 * chosen there is nothing to collapse, so it starts open rather than reading
 * as an empty field.
 */
export function CommunityTagPicker({
  label,
  helper,
  selectedIds,
  onChange,
}: CommunityTagPickerProps) {
  const { t } = useTranslation();
  // Initial only: expanding is the member's call from here on, so a state
  // where they empty the picker while it is open leaves it open.
  const [isOpen, setIsOpen] = useState(() => selectedIds.length === 0);
  const listId = useId();

  const toggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (!isSelected && selectedIds.length >= MAX_COMMUNITY_TAGS) return;
    onChange(
      isSelected
        ? selectedIds.filter((tagId) => tagId !== id)
        : [...selectedIds, id],
    );
  };

  const showOverlapHint = hasOverlappingTags(selectedIds);
  // Catalog order in both states, so a chip never jumps position between the
  // collapsed and open list.
  const visibleTags = isOpen
    ? COMMUNITY_TAGS
    : COMMUNITY_TAGS.filter((tag) => selectedIds.includes(tag.id));

  return (
    <FormField
      label={label}
      helper={
        showOverlapHint ? (
          <>
            {helper}
            {helper && <br />}
            <span className={styles.overlapHint}>
              <FiInfo aria-hidden />
              {t("communities:tagPicker.overlapHint")}
            </span>
          </>
        ) : (
          helper
        )
      }
    >
      <div className={styles.picker}>
        <div id={listId}>
          {visibleTags.length > 0 ? (
            <ChipSelect
              label={label}
              options={visibleTags.map((tag) => ({
                value: tag.id,
                label: t(tag.labelKey),
              }))}
              selected={new Set(selectedIds)}
              onToggle={toggle}
            />
          ) : (
            <p className={styles.empty}>{t("communities:tagPicker.empty")}</p>
          )}
        </div>
        <div className={styles.footer}>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={() => setIsOpen((wasOpen) => !wasOpen)}
          >
            {isOpen ? <FiChevronUp aria-hidden /> : <FiPlus aria-hidden />}
            {isOpen
              ? t("communities:tagPicker.collapse")
              : t(
                  selectedIds.length > 0
                    ? "communities:tagPicker.addMore"
                    : "communities:tagPicker.choose",
                )}
          </Button>
          <span className={styles.count}>
            {t("communities:tagPicker.count", {
              count: selectedIds.length,
              max: MAX_COMMUNITY_TAGS,
            })}
          </span>
        </div>
      </div>
    </FormField>
  );
}

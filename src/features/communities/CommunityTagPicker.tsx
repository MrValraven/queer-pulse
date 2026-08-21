import { FiInfo } from "react-icons/fi";
import { ChipSelect } from "../../shared/components/ui";
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
 */
export function CommunityTagPicker({
  label,
  helper,
  selectedIds,
  onChange,
}: CommunityTagPickerProps) {
  const { t } = useTranslation();

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
      <ChipSelect
        label={label}
        options={COMMUNITY_TAGS.map((tag) => ({
          value: tag.id,
          label: t(tag.labelKey),
        }))}
        selected={new Set(selectedIds)}
        onToggle={toggle}
      />
    </FormField>
  );
}

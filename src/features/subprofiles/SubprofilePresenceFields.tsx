import { FiCheck } from "react-icons/fi";
import { FormField, SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccentKey, AvailabilityKey } from "./api/subprofiles.api";
import { ImageUploadField } from "./ImageUploadField";
import {
  accentStyle,
  ACCENT_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "./subprofilePresence.data";
import styles from "./SubprofilePresenceFields.module.css";

/** Mirrors the backend `MAX_CTA_LABEL` validator. */
const MAX_CTA_LABEL = 40;

interface SubprofilePresenceFieldsProps {
  coverUrl: string;
  onCoverUrlChange: (value: string) => void;
  onCoverPreviewChange: (value: string | null) => void;
  coverBleed: boolean;
  onCoverBleedChange: (value: boolean) => void;
  accent: AccentKey | "";
  onAccentChange: (value: AccentKey) => void;
  availability: AvailabilityKey | "";
  onAvailabilityChange: (value: AvailabilityKey | "") => void;
  ctaLabel: string;
  onCtaLabelChange: (value: string) => void;
  ctaUrl: string;
  onCtaUrlChange: (value: string) => void;
  /** The CTA label + URL are out of sync (one set, one blank) — a save-blocking
   *  pairing. Surfaces inline on whichever half is still empty. */
  ctaMismatch: boolean;
}

/**
 * The persona's "presence" controls: cover image, a curated accent colour, an
 * availability status, and an optional contact CTA (label + URL, saved
 * together). Renders the editor's "Presence" rail pane body, fed by
 * `useSubprofileMetaEditor`'s state (via `EditorPaneRouter`). Purely
 * controlled — the parent owns state and the PATCH.
 */
export function SubprofilePresenceFields({
  coverUrl,
  onCoverUrlChange,
  onCoverPreviewChange,
  coverBleed,
  onCoverBleedChange,
  accent,
  onAccentChange,
  availability,
  onAvailabilityChange,
  ctaLabel,
  onCtaLabelChange,
  ctaUrl,
  onCtaUrlChange,
  ctaMismatch,
}: SubprofilePresenceFieldsProps) {
  const { t } = useTranslation();

  // Point the error at the half that's missing: a label with nowhere to go, or
  // a link with no call to action.
  const ctaLabelError =
    ctaMismatch && !ctaLabel.trim()
      ? t("subprofiles:metaForm.ctaLabelError")
      : undefined;
  const ctaUrlError =
    ctaMismatch && !ctaUrl.trim()
      ? t("subprofiles:metaForm.ctaUrlError")
      : undefined;

  return (
    <>
      <FormField label={t("subprofiles:metaForm.coverLabel")}>
        <ImageUploadField
          value={coverUrl}
          kind="story-cover"
          size={160}
          placeholder={t("subprofiles:metaForm.coverPlaceholder")}
          onChange={onCoverUrlChange}
          onPreviewChange={onCoverPreviewChange}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.bannerEdgeLabel")}
        helper={t("subprofiles:metaForm.bannerEdgeHelper")}
      >
        <SegmentedControl
          label={t("subprofiles:metaForm.bannerEdgeLabel")}
          options={[
            { value: "contained", label: t("subprofiles:metaForm.bannerEdgeContained") },
            { value: "bleed", label: t("subprofiles:metaForm.bannerEdgeBleed") },
          ]}
          value={coverBleed ? "bleed" : "contained"}
          onChange={(value) => onCoverBleedChange(value === "bleed")}
          disabledOptions={!coverUrl ? ["contained", "bleed"] : undefined}
        />
      </FormField>

      <FormField label={t("subprofiles:metaForm.accentLabel")}>
        <div
          className={styles.swatchRow}
          role="group"
          aria-label={t("subprofiles:metaForm.accentLabel")}
        >
          {ACCENT_OPTIONS.map((key) => {
            const isSelected = accent === key;
            return (
              <button
                key={key}
                type="button"
                className={styles.swatch}
                style={accentStyle(key)}
                data-selected={isSelected || undefined}
                aria-pressed={isSelected}
                aria-label={t(`subprofiles:accent.${key}`)}
                onClick={() => onAccentChange(key)}
              >
                {isSelected && <FiCheck size={16} aria-hidden />}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label={t("subprofiles:metaForm.availabilityLabel")}>
        <select
          value={availability}
          onChange={(event) =>
            onAvailabilityChange(event.target.value as AvailabilityKey | "")
          }
        >
          <option value="">
            {t("subprofiles:metaForm.availabilityUnset")}
          </option>
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.ctaLabelLabel")}
        helper={t("subprofiles:metaForm.ctaHelper")}
        error={ctaLabelError}
      >
        <input
          value={ctaLabel}
          maxLength={MAX_CTA_LABEL}
          placeholder={t("subprofiles:metaForm.ctaLabelPlaceholder")}
          onChange={(event) => onCtaLabelChange(event.target.value)}
        />
      </FormField>

      <FormField label={t("subprofiles:metaForm.ctaUrlLabel")} error={ctaUrlError}>
        <input
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          value={ctaUrl}
          placeholder={t("subprofiles:metaForm.ctaUrlPlaceholder")}
          onChange={(event) => onCtaUrlChange(event.target.value)}
        />
      </FormField>
    </>
  );
}

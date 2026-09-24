import { FiCheck } from "react-icons/fi";
import {
  FormField,
  SegmentedControl,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import type { AccentKey, AvailabilityKey } from "./api/subprofiles.api";
import { ImageUploadField } from "./ImageUploadField";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";
import { SubprofilePresenceCtaFields } from "./SubprofilePresenceCtaFields";
import {
  accentStyle,
  ACCENT_OPTIONS,
  AVAILABILITY_OPTIONS,
  THERAPIST_AVAILABILITY_LABEL_KEYS,
} from "./subprofilePresence.data";
import styles from "./SubprofilePresenceFields.module.css";
import { useEditorPersonaKind } from "./useEditorPersonaKind";

interface SubprofilePresenceFieldsProps {
  coverUrl: string;
  /** Saved reframe crop for the committed cover, shown as the slot's focal
   *  point until a fresh pick this session supersedes it. */
  coverCrop?: CropRect;
  onCoverUrlChange: (value: string) => void;
  onCoverPreviewChange: (value: string | null, crop?: CropRect) => void;
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
 * controlled: the parent owns state and the PATCH. For a therapist the cover
 * is a thin band above the profile, the availability follows the status set
 * in Page blocks, and the button is the "Book the free call" one, so those
 * fields explain themselves in that kind's terms.
 */
export function SubprofilePresenceFields({
  coverUrl,
  coverCrop,
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
  const isTherapist = useEditorPersonaKind() === "therapist";

  return (
    <>
      <FormField
        id={FIELD_ANCHOR_ID.cover}
        label={t("subprofiles:metaForm.coverLabel")}
        // State the banner's real shape up front. The reframe editor used to
        // frame these at the magazine cover's 2:1 while the page painted a far
        // wider strip, so members were being told one set of dimensions and
        // shown another.
        helper={t(
          isTherapist
            ? "subprofiles:editorTherapist.coverHelper"
            : "subprofiles:metaForm.coverHelper",
        )}
      >
        <ImageUploadField
          value={coverUrl}
          // Its own kind, not the magazine's `story-cover`: a persona banner
          // reframes at 3:1 (the shape it actually paints at) rather than the
          // 2:1 plate a magazine cover is, and takes a higher resolution cap
          // because it spans the full viewport.
          kind="persona-cover"
          focus={coverCrop}
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
            {
              value: "contained",
              label: t("subprofiles:metaForm.bannerEdgeContained"),
            },
            {
              value: "bleed",
              label: t("subprofiles:metaForm.bannerEdgeBleed"),
            },
          ]}
          value={coverBleed ? "bleed" : "contained"}
          onChange={(value) => onCoverBleedChange(value === "bleed")}
          disabledOptions={!coverUrl ? ["contained", "bleed"] : undefined}
        />
      </FormField>

      <FormField
        id={FIELD_ANCHOR_ID.accent}
        label={t("subprofiles:metaForm.accentLabel")}
      >
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

      <FormField
        id={FIELD_ANCHOR_ID.availability}
        label={t("subprofiles:metaForm.availabilityLabel")}
        helper={
          isTherapist
            ? t("subprofiles:editorTherapist.availabilityHelper")
            : undefined
        }
      >
        <Select
          options={[
            { value: "", label: t("subprofiles:metaForm.availabilityUnset") },
            ...AVAILABILITY_OPTIONS.map((option) => ({
              value: option.value,
              // Therapists read the same words as their page's status pill.
              label: t(
                isTherapist
                  ? THERAPIST_AVAILABILITY_LABEL_KEYS[option.value]
                  : option.labelKey,
              ),
            })),
          ]}
          value={availability}
          onChange={(value) =>
            onAvailabilityChange((value ?? "") as AvailabilityKey | "")
          }
        />
      </FormField>

      <SubprofilePresenceCtaFields
        ctaLabel={ctaLabel}
        onCtaLabelChange={onCtaLabelChange}
        ctaUrl={ctaUrl}
        onCtaUrlChange={onCtaUrlChange}
        ctaMismatch={ctaMismatch}
        isTherapist={isTherapist}
      />
    </>
  );
}

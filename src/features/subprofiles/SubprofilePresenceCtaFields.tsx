import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";

/** Mirrors the backend `MAX_CTA_LABEL` validator. */
const MAX_CTA_LABEL = 40;

interface SubprofilePresenceCtaFieldsProps {
  ctaLabel: string;
  onCtaLabelChange: (value: string) => void;
  ctaUrl: string;
  onCtaUrlChange: (value: string) => void;
  /** The CTA label + URL are out of sync (one set, one blank): a save-blocking
   *  pairing. Surfaces inline on whichever half is still empty. */
  ctaMismatch: boolean;
  /** A therapist's button is the "Book the free call" button in the hero and
   *  the contact card, so its helper and placeholder say so. */
  isTherapist: boolean;
}

/**
 * The persona's optional contact button: a label and a link, saved together.
 * Part of the "Presence" pane (`SubprofilePresenceFields`). Purely controlled.
 */
export function SubprofilePresenceCtaFields({
  ctaLabel,
  onCtaLabelChange,
  ctaUrl,
  onCtaUrlChange,
  ctaMismatch,
  isTherapist,
}: SubprofilePresenceCtaFieldsProps) {
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
      <FormField
        id={FIELD_ANCHOR_ID.ctaLabel}
        label={t("subprofiles:metaForm.ctaLabelLabel")}
        helper={t(
          isTherapist
            ? "subprofiles:editorTherapist.ctaHelper"
            : "subprofiles:metaForm.ctaHelper",
        )}
        error={ctaLabelError}
      >
        <input
          value={ctaLabel}
          maxLength={MAX_CTA_LABEL}
          placeholder={t(
            isTherapist
              ? "subprofiles:editorTherapist.ctaLabelPlaceholder"
              : "subprofiles:metaForm.ctaLabelPlaceholder",
          )}
          onChange={(event) => onCtaLabelChange(event.target.value)}
        />
      </FormField>

      <FormField
        id={FIELD_ANCHOR_ID.ctaUrl}
        label={t("subprofiles:metaForm.ctaUrlLabel")}
        error={ctaUrlError}
      >
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

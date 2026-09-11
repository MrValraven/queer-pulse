import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field } from "../CreateGatheringFields";
import { GATE_ANCHOR } from "../createGathering.data";
import { CoverUpload } from "../fields/CoverUpload";
import type { GatheringForm } from "../useGatheringForm";

/**
 * The optional cover photo in the wizard (ruling R16).
 *
 * `coverImageUrl` is the storage key the payload sends; `coverPreviewUrl` is
 * what the preview card paints straight away. The upload itself, and taking
 * back the uploads a host abandoned, is the shared `CoverUpload`, which the
 * edit-details modal uses too.
 */
export function CoverImageField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <Field
      label={t("gatherings:create.v2.what.coverLabel")}
      labelId={labelId}
      isOptional
      hint={t("gatherings:create.v2.what.coverHint")}
      anchorId={GATE_ANCHOR.cover}
    >
      <CoverUpload
        value={form.coverImageUrl}
        onChange={form.setCoverImageUrl}
        onPreviewChange={form.setCoverPreviewUrl}
        labelledBy={labelId}
      />
    </Field>
  );
}

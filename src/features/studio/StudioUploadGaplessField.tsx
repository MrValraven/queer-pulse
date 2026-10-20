import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** Play without gaps: the player runs this release's tracks straight into
 *  each other. The box sits in `typeOptions`, which keeps the field's
 *  full-width input and block label styles off it. */
export function StudioUploadGaplessField({
  form,
  setField,
}: Pick<StudioUploadDraft, "form" | "setField">) {
  const { t } = useTranslation();
  const hintId = useId();
  return (
    <div className={s.field}>
      <div className={s.typeOptions}>
        <label>
          <input
            type="checkbox"
            checked={form.isGapless}
            aria-describedby={hintId}
            onChange={(event) => setField("isGapless", event.target.checked)}
          />{" "}
          {t("studio:uploadFlow.release.gaplessLabel")}
        </label>
      </div>
      <p id={hintId} className={s.fhint}>
        {t("studio:uploadFlow.release.gaplessHint")}
      </p>
    </div>
  );
}

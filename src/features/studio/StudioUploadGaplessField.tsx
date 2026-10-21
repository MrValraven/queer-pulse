import { CheckLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** Play without gaps: the player runs this release's tracks straight into
 *  each other. The shared CheckLine carries the choice and its hint in one
 *  pressable card (aria-pressed), as every other on/off line in the app. */
export function StudioUploadGaplessField({
  form,
  setField,
}: Pick<StudioUploadDraft, "form" | "setField">) {
  const { t } = useTranslation();
  return (
    <div className={`${s.field} ${s.checkField}`}>
      <CheckLine
        checked={form.isGapless}
        onChange={(isGapless) => setField("isGapless", isGapless)}
        title={t("studio:uploadFlow.release.gaplessLabel")}
        sub={t("studio:uploadFlow.release.gaplessHint")}
      />
    </div>
  );
}

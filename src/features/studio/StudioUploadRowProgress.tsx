import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { UploadRow } from "./useStudioTrackUploads";
import tracksStyles from "./StudioUploadTracks.module.css";

const MOVING_STAGES: ReadonlySet<UploadRow["stage"]> = new Set([
  "converting",
  "uploading",
  "confirming",
]);

/** A converted file keeps its full bar while it waits for its track, so the
 *  bar never blinks out between converting and uploading. */
const isBarShown = (row: UploadRow) =>
  MOVING_STAGES.has(row.stage) ||
  ((row.stage === "queued" || row.stage === "creating") && row.progress > 0);

/** One bar for a WAV's whole way in: converting, then uploading. The tab
 *  hint shows only while the browser converts. */
export function StudioUploadRowProgress({
  row,
  label,
}: {
  row: UploadRow;
  label: { title: string; position: number };
}) {
  const { t } = useTranslation();
  const isConverting = row.stage === "converting";
  return (
    <>
      <Collapse isOpen={isBarShown(row)}>
        <progress
          className={tracksStyles.progress}
          max={100}
          value={row.progress}
          aria-label={t(
            isConverting
              ? "studio:uploadFlow.files.convertProgressLabel"
              : "studio:uploadFlow.files.progressLabel",
            label,
          )}
        />
      </Collapse>
      <Collapse isOpen={isConverting}>
        <p className={tracksStyles.convertingHint}>
          {t("studio:uploadFlow.files.convertingHint")}
        </p>
      </Collapse>
    </>
  );
}

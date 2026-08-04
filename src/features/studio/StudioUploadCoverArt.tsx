import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Check } from "./StudioUploadIcons";
import s from "./creator.module.css";

export function CoverArt() {
  const { t } = useTranslation();
  return (
    <div className={s.uploaded}>
      <h4>
        <Translation
          i18nKey="studio:upload.coverArt.heading"
          components={{ em: <em /> }}
          values={{ readyCount: 1, totalCount: 1 }}
        />
      </h4>
      <div className={s.fileRow}>
        <span
          className={s.fileIc}
          style={{
            background: "rgba(var(--accent-rgb),.16)",
            color: "var(--accent)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ width: 16, height: 16 }}
          >
            <rect x={3} y={3} width={18} height={18} rx={2} />
            <circle cx={9} cy={9} r={2} />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </span>
        <div>
          <h5>cidade_cover.jpg</h5>
          <div className={s.fileMeta}>
            2400 × 2400 · sRGB · 4.2 MB · no text in upper third
          </div>
        </div>
        <span className={s.fileCheck}>
          <Check />
          {t("studio:upload.files.okReady")}
        </span>
      </div>
    </div>
  );
}

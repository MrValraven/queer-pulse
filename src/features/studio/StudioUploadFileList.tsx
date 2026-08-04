import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { UPLOAD_FILES } from "./studioUpload.data";
import { WaveIcon, Check, Warn } from "./StudioUploadIcons";
import s from "./creator.module.css";

export function FileList() {
  const { t } = useTranslation();
  const [showLoud, setShowLoud] = useState(false);
  const readyCount = UPLOAD_FILES.filter((file) => file.ok).length;
  return (
    <div className={s.uploaded}>
      <h4>
        <Translation
          i18nKey="studio:upload.files.heading"
          components={{ em: <em /> }}
          values={{ readyCount, totalCount: UPLOAD_FILES.length }}
        />
      </h4>
      {UPLOAD_FILES.map((file) => (
        <div key={file.name} className={s.fileRow}>
          <span
            className={[s.fileIc, !file.ok && s.fileIcWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {file.ok ? <WaveIcon /> : <Warn />}
          </span>
          <div>
            <h5>{file.name}</h5>
            <div className={s.fileMeta}>{file.meta}</div>
          </div>
          <span
            className={[s.fileCheck, !file.ok && s.fileCheckWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {file.ok ? <Check /> : <Warn />}
            {file.ok
              ? t("studio:upload.files.okReady")
              : t("studio:upload.files.loudnessCheck")}
          </span>
        </div>
      ))}
      <div className={s.warnCard}>
        <Warn />
        <div>
          <strong>
            {t("studio:upload.files.loudWarning.title", { trackNumber: 4 })}
          </strong>{" "}
          <Translation
            i18nKey="studio:upload.files.loudWarning.body"
            components={{ em: <em /> }}
            values={{ measuredLoudness: "−7.8 LUFS", targetLoudness: "−14" }}
          />{" "}
          <button
            type="button"
            className={s.loudToggle}
            aria-expanded={showLoud}
            onClick={() => setShowLoud((v) => !v)}
          >
            {showLoud
              ? t("studio:upload.files.loudToggle.hide")
              : t("studio:upload.files.loudToggle.show")}{" "}
            {showLoud ? (
              <FiChevronUp aria-hidden />
            ) : (
              <FiChevronDown aria-hidden />
            )}
          </button>
          {showLoud && (
            <div className={s.loudExplainer}>
              <Translation
                i18nKey="studio:upload.files.loudExplainer"
                components={{ em: <em /> }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Warn } from "./StudioUploadIcons";
import s from "./creator.module.css";

/** The demo's loudness warning on one track. It stays in the showcase. */
export function StudioUploadLoudnessNote() {
  const { t } = useTranslation();
  const [showLoud, setShowLoud] = useState(false);
  return (
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
          onClick={() => setShowLoud((wasShown) => !wasShown)}
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
  );
}

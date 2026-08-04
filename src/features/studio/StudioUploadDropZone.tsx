import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./creator.module.css";

export function DropZone() {
  const { t } = useTranslation();
  return (
    <div className={s.dropzone}>
      <div className={s.uploadIcon}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{ width: 22, height: 22 }}
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <h3>
        <Translation
          i18nKey="studio:upload.dropzone.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p>{t("studio:upload.dropzone.body")}</p>
      <p className={s.uploadTypes}>
        <Translation
          i18nKey="studio:upload.dropzone.accepts"
          components={{ em: <em style={{ color: "var(--jade-light)" }} /> }}
        />
      </p>
    </div>
  );
}

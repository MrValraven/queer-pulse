import { useId } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./creator.module.css";

export function MetadataStep({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const titleFieldId = useId();
  const yearFieldId = useId();
  const genreFieldId = useId();
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
          <Translation
            i18nKey="studio:upload.metadata.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.cardSub}>{t("studio:upload.metadata.sub")}</div>
      </div>
      <div className={s.field}>
        <label htmlFor={titleFieldId}>
          {t("studio:upload.metadata.field.title")}
        </label>
        {/* Defaults below prefill this artist's own release — content. */}
        <input id={titleFieldId} type="text" defaultValue="Cidade dos santos" />
      </div>
      <div className={s.field}>
        <label htmlFor={yearFieldId}>
          {t("studio:upload.metadata.field.year")}
        </label>
        <input id={yearFieldId} type="text" defaultValue="2026" />
      </div>
      <div className={s.field}>
        <label htmlFor={genreFieldId}>
          {t("studio:upload.metadata.field.genre")}
        </label>
        <select
          id={genreFieldId}
          defaultValue={t("studio:upload.metadata.genre.fado")}
        >
          <option>{t("studio:upload.metadata.genre.fado")}</option>
          <option>{t("studio:upload.metadata.genre.electronic")}</option>
          <option>{t("studio:upload.metadata.genre.folk")}</option>
          <option>{t("studio:upload.metadata.genre.experimental")}</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Button variant="ghost" onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("studio:upload.metadata.backCta")}
        </Button>
        <Button onClick={onSubmit}>
          {t("studio:upload.metadata.submitCta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}

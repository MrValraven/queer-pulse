import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { UPLOAD_STEPS } from "./studioUpload.data";
import { UploadMainCol, UploadSidebar } from "./StudioUploadSections";
import s from "./creator.module.css";

export function StudioUploadPage() {
  const { t } = useTranslation();
  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>{t("studio:upload.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:upload.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div
            className="sub"
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "rgba(247,243,238,.62)",
              marginTop: 14,
            }}
          >
            {t("studio:upload.hero.sub")}
          </div>
        </div>
      </section>

      <div className={s.stepper}>
        {UPLOAD_STEPS.map((step) => (
          <div
            key={step.num}
            className={[s.step, step.on && s.stepOn].filter(Boolean).join(" ")}
          >
            <span className={s.stepNum}>{step.num}</span>
            <span className={s.stepNm}>
              {t(step.nmKey)}
              <small>{t(step.subKey)}</small>
            </span>
          </div>
        ))}
      </div>

      <section className={s.body}>
        <UploadMainCol />
        <UploadSidebar />
      </section>
    </StudioCreatorShell>
  );
}

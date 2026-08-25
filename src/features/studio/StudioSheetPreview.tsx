import { ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./sheet.module.css";
import {
  SPECS,
  scoreCoverImage,
  SHEET_TITLE,
  SHEET_COMPOSER,
  SHEET_ALBUM,
  SHEET_TRANSCRIBER,
} from "./studioSheetStore.data";

// Content: technical sheet-music facts and the transcriber's avatar
// initials — comes from the sheet-music record in live mode.
const SHEET_KEY_SIGNATURE_NOTE = " · voice & piano · D minor";
const TRANSCRIBER_INITIALS = "TR";

export function StudioSheetPreview() {
  const { t } = useTranslation();

  return (
    <div>
      <div className={s.sheetHead}>
        <div className={s.sheetCv}>
          <ImageSlot
            src={scoreCoverImage}
            tint="coral"
            width="100%"
            height="100%"
            radius={10}
            placeholder={`${t("studio:media.scoreLabel")} ${t("studio:media.coverLabel")}`}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={s.sheetHi}>
          <div className={s.eb}>{t("studio:sheet.preview.eyebrow")}</div>
          <h1>{SHEET_TITLE}</h1>
          <div className={s.sheetBy}>
            <Translation
              i18nKey="studio:sheet.preview.byLine"
              components={{ strong: <strong />, em: <em /> }}
              values={{ composer: SHEET_COMPOSER, album: SHEET_ALBUM }}
            />
          </div>
          <div className={s.specs}>
            {SPECS.map((sp) => (
              <span key={sp} className={s.spec}>
                {sp}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={s.previewLbl}>
        <Translation
          i18nKey="studio:sheet.preview.freePreview"
          components={{ em: <em /> }}
          values={{ page: 1, total: 4 }}
        />
      </div>
      <div className={s.pdf}>
        <div className={s.watermark}>{t("studio:sheet.preview.watermark")}</div>
        <div className={s.pdfTitle}>{SHEET_TITLE}</div>
        <div className={s.pdfSub}>
          {SHEET_COMPOSER}
          {SHEET_KEY_SIGNATURE_NOTE}
        </div>
        {[0, 1, 2].map((g) => (
          <div key={g}>
            <div className={s.staff}>
              {[0, 1, 2, 3, 4].map((l) => (
                <div key={l} className={s.ln} />
              ))}
            </div>
            {g < 2 && (
              <div className={s.notesRow}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <span
                    key={n}
                    className={[s.noteD, n % 3 === 1 && s.s]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div className={s.pdfFade}>
          <span className={s.lock}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x={3} y={11} width={18} height={11} rx={2} />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <Translation
              i18nKey="studio:sheet.preview.lockedPages"
              values={{ from: 2, to: 4 }}
            />
          </span>
        </div>
      </div>

      <div className={s.transcriber}>
        <span
          className="av"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(74,140,111,.2)",
            color: "var(--jade-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--serif)",
            fontSize: 14,
            flex: "none",
          }}
        >
          {TRANSCRIBER_INITIALS}
        </span>
        <div>
          <h5>
            <Translation
              i18nKey="studio:sheet.preview.transcribedBy"
              components={{ em: <em /> }}
              values={{ name: SHEET_TRANSCRIBER }}
            />
          </h5>
          <p>
            {t("studio:sheet.preview.transcriberRole")} ·{" "}
            <Translation
              i18nKey="studio:sheet.preview.transcriberNote"
              components={{ em: <em /> }}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

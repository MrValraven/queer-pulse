import { ImageSlot } from "../../shared/components/ui";
import s from "./sheet.module.css";
import { SPECS, scoreCoverImage } from "./studioSheetStore.data";

export function StudioSheetPreview() {
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
            placeholder="score cover"
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={s.sheetHi}>
          <div className={s.eb}>Lead sheet · transcription</div>
          <h1>
            Carta para a <em>santa</em>
          </h1>
          <div className={s.sheetBy}>
            music &amp; lyrics by <strong>Mariana Sol</strong> · from{" "}
            <em>Cidade dos santos</em>
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
        Free preview · <em>page 1 of 4</em>
      </div>
      <div className={s.pdf}>
        <div className={s.watermark}>QUEERPULSE · PREVIEW</div>
        <div className={s.pdfTitle}>Carta para a santa</div>
        <div className={s.pdfSub}>
          Mariana Sol · voice &amp; piano · D minor
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
            Pages 2–4 unlock on purchase
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
          TR
        </span>
        <div>
          <h5>
            Transcribed by <em>Teresa Rocha</em>
          </h5>
          <p>
            Community transcriber ·{" "}
            <em>paid from your purchase, not the fund, when you buy</em>
          </p>
        </div>
      </div>
    </div>
  );
}

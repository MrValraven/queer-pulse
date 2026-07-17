import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILE, WF } from "./studioTriage.data";
import s from "./council.module.css";

/** This specific submission's artist name — content, interpolated into the
 * translated decision copy below. */
const CURRENT_SUBMISSION_ARTIST_NAME = "Renato";

export function StudioTriageDetail() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <aside className={s.aside}>
      <h2>
        The piano <em>I waited for</em>
      </h2>
      <div className={s.asideWho}>Renato V. · Porto · single · 4:40</div>

      <div className={s.playerMini}>
        <div className={s.pmWf}>
          {WF.map((h, i) => (
            <span
              key={i}
              className={i < 6 ? s.played : undefined}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className={s.pmCtrl}>
          <button
            type="button"
            className={s.pmPlay}
            aria-label={t("studio:triage.detail.playAria")}
          >
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </button>
          <div className={s.pmTimes}>
            <span className="e" style={{ color: "var(--accent)" }}>
              1:48
            </span>
            <span>4:40</span>
          </div>
        </div>
      </div>

      <div className={s.claimRow}>
        <div className="av">SM</div>
        <div className={s.text}>
          <b>Claimed by Sara M.</b>
          You're answering this one. <em>D. Okoye second-reading queued.</em>
        </div>
      </div>

      <div className={s.detailBlock}>
        <h4>{t("studio:triage.detail.fileHeading")}</h4>
        <div className={s.dGrid}>
          {FILE.map(([labelKey, value], fileRowIndex) => (
            <span key={fileRowIndex} style={{ display: "contents" }}>
              <span className={s.k}>{t(labelKey)}</span>
              <span className={s.v}>{value}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={s.detailBlock}>
        <h4>{t("studio:triage.detail.flaggedHeading", { count: 3 })}</h4>
        <p style={{ fontStyle: "italic", color: "rgba(247,243,238,.6)" }}>
          D. Okoye: "the bridge at 2:14 is the thing." · João R.: "PT feels
          regional — Porto, not Lisbon." · Yara R.: "i'd put this on the
          standards collection in a year, easily."
        </p>
      </div>

      <h3 className={s.shortlistH}>
        <Translation
          i18nKey="studio:triage.detail.answerHeading"
          components={{ em: <em /> }}
        />
      </h3>
      <div className={s.decision}>
        <h4>
          {t("studio:triage.detail.decision.heading", {
            artistName: CURRENT_SUBMISSION_ARTIST_NAME,
          })}
        </h4>
        <textarea
          placeholder={t("studio:triage.detail.decision.placeholder")}
        />
        <div
          className="hint"
          style={{
            fontSize: 11.5,
            color: "rgba(247,243,238,.5)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            marginTop: 8,
          }}
        >
          <Translation
            i18nKey="studio:triage.detail.decision.hint"
            components={{ em: <em style={{ color: "var(--accent)" }} /> }}
          />
        </div>
        <div
          className="actions"
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={s.bt}
            onClick={() =>
              showToast(t("studio:triage.detail.toast.held"), "info")
            }
          >
            {t("studio:triage.detail.holdCta")}
          </button>
          <button
            type="button"
            className={s.bt}
            onClick={() =>
              showToast(
                t("studio:triage.detail.toast.passed", {
                  artistName: CURRENT_SUBMISSION_ARTIST_NAME,
                }),
                "success",
              )
            }
          >
            {t("studio:triage.detail.passCta")}
          </button>
          <button
            type="button"
            className={`${s.bt} ${s.btP}`}
            onClick={() =>
              showToast(t("studio:triage.detail.toast.addedToSlate"), "success")
            }
          >
            {t("studio:triage.detail.addToSlateCta")}
          </button>
        </div>
      </div>
    </aside>
  );
}

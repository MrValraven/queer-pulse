import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  DELETED_KEYS,
  DURATIONS,
  PAUSE_EFFECT_KEYS,
  type LeaveState,
  type PauseDurationId,
} from "./leave.data";
import s from "./flows.module.css";

export function LeaveConsidering({
  onPause,
  onDelete,
}: {
  onPause: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${s.card} ${s.cardWide} ${s.screenIn}`}>
      <Link to={routes.settings} className={s.backLink}>
        {t("safety:leave.backLink")}
      </Link>
      <div className={s.title}>
        <Translation
          i18nKey="safety:leave.considering.title"
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.sub}>{t("safety:leave.considering.sub")}</div>

      <div className={s.lossCard}>
        <div className={s.lcLabel}>{t("safety:leave.deleted.label")}</div>
        {DELETED_KEYS.map((key) => (
          <div key={key} className={s.lossItem}>
            <span className={s.lossDot} />
            {t(key)}
          </div>
        ))}
        <div className={s.privacyNote}>
          <Translation
            i18nKey="safety:leave.considering.privacyNote"
            components={{ link: <Link to={routes.safety} /> }}
          />
        </div>
      </div>

      <div className={s.altLabel}>{t("safety:leave.considering.altLabel")}</div>
      <div className={s.altCard}>
        <span
          className={s.altIcon}
          style={{ background: "rgba(74,140,111,.1)" }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <circle
              cx={9}
              cy={9}
              r={6.5}
              stroke="var(--jade)"
              strokeWidth={1.6}
            />
            <path
              d="M6.5 9h5M9 6.5v5"
              stroke="var(--jade)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <div className={s.altTitle}>
            {t("safety:leave.considering.pauseTitle")}
          </div>
          <div className={s.altDesc}>
            {t("safety:leave.considering.pauseDesc")}
          </div>
          <Button variant="ghost" onClick={onPause}>
            {t("safety:leave.considering.pauseCta")}
          </Button>
        </div>
      </div>
      <div className={s.altCard}>
        <span
          className={s.altIcon}
          style={{ background: "rgba(45,27,61,.06)" }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <path
              d="M9 3v12M3 9h12"
              stroke="rgba(45,27,61,.4)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <div className={s.altTitle}>
            {t("safety:leave.considering.quietTitle")}
          </div>
          <div className={s.altDesc}>
            {t("safety:leave.considering.quietDesc")}
          </div>
          <Button variant="ghost" to={routes.settings}>
            {t("safety:leave.considering.quietCta")}
          </Button>
        </div>
      </div>

      <div className={s.divider} />
      <div className={s.stillWant}>
        {t("safety:leave.considering.stillWant")}
      </div>
      <textarea
        className={s.reasonTa}
        placeholder={t("safety:leave.considering.reasonPlaceholder")}
      />
      <button type="button" className={s.deleteBtn} onClick={onDelete}>
        {t("safety:leave.considering.deleteCta")}
      </button>
    </div>
  );
}

export function LeavePausing({
  dur,
  onDur,
  onBack,
  onPaused,
  onDelete,
}: {
  dur: PauseDurationId;
  onDur: (d: PauseDurationId) => void;
  onBack: () => void;
  onPaused: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${s.card} ${s.screenIn}`}>
      <button type="button" className={s.backLink} onClick={onBack}>
        {t("safety:leave.pausing.backCta")}
      </button>
      <div className={s.title}>
        <Translation
          i18nKey="safety:leave.pausing.title"
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.sub} style={{ marginBottom: 22 }}>
        {t("safety:leave.pausing.sub")}
      </div>
      <div className={s.durOpts}>
        {DURATIONS.map((d) => (
          <div
            key={d.id}
            className={[s.durOpt, dur === d.id && s.durOptSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onDur(d.id)}
            role="radio"
            aria-checked={dur === d.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDur(d.id);
              }
            }}
          >
            <span className={s.ocRadio}>
              <span className={s.ocDot} />
            </span>
            <div>
              <div className={s.durTitle}>{t(d.labelKey)}</div>
              <div className={s.durDesc}>
                {t("safety:leave.duration.backOn", {
                  date: fmt.date(d.backDate),
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.lossCard} style={{ marginBottom: 22 }}>
        <div className={s.lcLabel}>
          {t("safety:leave.pausing.effectsLabel")}
        </div>
        {PAUSE_EFFECT_KEYS.map((key) => (
          <div key={key} className={s.lossItem}>
            <span className={s.lossDot} style={{ background: "var(--jade)" }} />
            {t(key)}
          </div>
        ))}
      </div>
      <div className={s.actions}>
        <Button onClick={onPaused}>{t("safety:leave.pausing.pauseCta")}</Button>
        <button type="button" className={s.cancelLink} onClick={onDelete}>
          {t("safety:leave.pausing.deleteInsteadCta")}
        </button>
      </div>
    </div>
  );
}

export function LeavePaused({
  dur,
  onSettings,
}: {
  dur: PauseDurationId;
  onSettings: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const match = DURATIONS.find((d) => d.id === dur);
  return (
    <div className={`${s.card} ${s.pausedCard} ${s.screenIn}`}>
      <div className={s.pausedIcon}>
        <FiCheck />
      </div>
      <div className={s.title}>
        <Translation
          i18nKey="safety:leave.paused.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={s.pausedSub}>{t("safety:leave.paused.sub")}</p>
      <div className={s.pausedReturn}>
        <span className={s.pausedReturnLbl}>
          {t("safety:leave.paused.reactivateLabel")}
        </span>
        <span className={s.pausedReturnVal}>
          {match
            ? t("safety:leave.duration.backOn", {
                date: fmt.date(match.backDate),
              })
            : null}
        </span>
      </div>
      <div className={s.pausedActions}>
        <Button variant="ghost-dark" to={routes.signIn}>
          {t("safety:leave.paused.comeBackCta")}
        </Button>
        <Button variant="ghost-dark" onClick={onSettings}>
          {t("safety:leave.paused.backToSettingsCta")}
        </Button>
      </div>
    </div>
  );
}

export function LeaveConfirmed() {
  const { t } = useTranslation();
  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(45,27,61,.07)" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8"
            stroke="var(--plum)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d="M12 8v4.5M16 4l-1.5 4-4-1.5"
            stroke="var(--plum)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        <Translation
          i18nKey="safety:leave.confirmed.title"
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.sub}>{t("safety:leave.confirmed.sub")}</div>
      <div className={s.timeline}>
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlActive}`}>1</div>
          <div className={s.tlLabel}>
            {t("safety:leave.confirmed.timeline.submitted")}
          </div>
        </div>
        <div className={s.tlLine} />
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlPending}`}>2</div>
          <div className={s.tlLabel}>
            {t("safety:leave.confirmed.timeline.processing")}
          </div>
        </div>
        <div className={s.tlLine} />
        <div className={s.tlStep}>
          <div className={`${s.tlDot} ${s.tlPending}`}>3</div>
          <div className={s.tlLabel}>
            {t("safety:leave.confirmed.timeline.deleted")}
          </div>
        </div>
      </div>
      <div className={s.reportNote} style={{ borderTop: "none" }}>
        {t("safety:leave.confirmed.cancelNote")}
        <br />
        <Link to={routes.signIn}>{t("safety:leave.confirmed.cancelCta")}</Link>
      </div>
    </div>
  );
}

export type { LeaveState };

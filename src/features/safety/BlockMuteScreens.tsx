import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, DetailRows } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  MUTE_DURATIONS,
  type BlockMuteTarget,
  type MuteDurationId,
} from "./blockMute.data";
import s from "./flows.module.css";

function durationLabel(t: (key: string) => string, id: MuteDurationId) {
  return t(MUTE_DURATIONS.find((d) => d.id === id)!.labelKey);
}

export function BlockMuteChoose({
  target,
  timedMuteAllowed,
  chosen,
  onChoose,
  muteDur,
  onMuteDur,
  onContinue,
  onCancel,
}: {
  target: BlockMuteTarget;
  /** In live mode with a real target the backend has no timed mute, so only
   *  "until I unmute" is offered; the demo explainer keeps the timed choices. */
  timedMuteAllowed: boolean;
  chosen: "mute" | "block" | null;
  onChoose: (c: "mute" | "block") => void;
  muteDur: MuteDurationId;
  onMuteDur: (d: MuteDurationId) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const name = target.firstName;

  return (
    <div className={`${s.card} ${s.screenIn}`}>
      <div className={s.memberRow}>
        <div className={s.memAv}>{target.initials}</div>
        <div>
          <div className={s.memName}>{target.fullName}</div>
          {target.meta && <div className={s.memMeta}>{target.meta}</div>}
        </div>
      </div>

      <div className={s.cardHead}>
        <Translation
          i18nKey="safety:blockMute.choose.title"
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.cardSub}>
        {t("safety:blockMute.choose.sub", { name })}
      </div>

      <div
        className={[s.optionCard, chosen === "mute" && s.optionSelected]
          .filter(Boolean)
          .join(" ")}
      >
        <label className={s.ocHeader}>
          <input
            type="radio"
            name="block-mute-choice"
            className={s.ocRadioInput}
            checked={chosen === "mute"}
            onChange={() => onChoose("mute")}
          />
          <span className={s.ocRadio} aria-hidden>
            <span className={s.ocDot} />
          </span>
          <span className={s.ocTitle}>
            {t("safety:blockMute.choose.muteTitle", { name })}
          </span>
        </label>
        <div className={s.ocDesc}>{t("safety:blockMute.choose.muteDesc")}</div>
        {chosen === "mute" && (
          <div className={s.subOpts}>
            <div className={s.subLabel}>
              {t("safety:blockMute.choose.muteScopeLabel")}
            </div>
            <label className={s.checkRow}>
              <input type="checkbox" defaultChecked />{" "}
              {t("safety:blockMute.choose.postsUpdates")}
            </label>
            <label className={s.checkRow}>
              <input type="checkbox" defaultChecked />{" "}
              {t("safety:blockMute.choose.commentsReplies")}
            </label>
            <label className={s.checkRow}>
              <input type="checkbox" />{" "}
              {t("safety:blockMute.choose.gatheringInvites")}
            </label>
            <div className={s.subLabel} style={{ marginTop: 14 }}>
              {t("safety:blockMute.choose.durationLabel")}
            </div>
            {timedMuteAllowed ? (
              <div className={s.durationRow}>
                {MUTE_DURATIONS.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    className={[s.durBtn, muteDur === d.id && s.durBtnActive]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMuteDur(d.id);
                    }}
                  >
                    {t(d.labelKey)}
                  </button>
                ))}
              </div>
            ) : (
              // Live backend has no timed mute — a real mute lasts until unmute.
              <div className={s.warnBox}>
                {t("safety:blockMute.choose.liveDurationNote")}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={[s.optionCard, chosen === "block" && s.optionSelected]
          .filter(Boolean)
          .join(" ")}
      >
        <label className={s.ocHeader}>
          <input
            type="radio"
            name="block-mute-choice"
            className={s.ocRadioInput}
            checked={chosen === "block"}
            onChange={() => onChoose("block")}
          />
          <span className={s.ocRadio} aria-hidden>
            <span className={s.ocDot} />
          </span>
          <span className={s.ocTitle}>
            {t("safety:blockMute.choose.blockTitle", { name })}
          </span>
        </label>
        <div className={s.ocDesc}>{t("safety:blockMute.choose.blockDesc")}</div>
        {chosen === "block" && (
          <div className={s.subOpts}>
            <div className={s.warnBox}>
              <Translation
                i18nKey="safety:blockMute.choose.blockNote"
                values={{ name }}
                components={{ strong: <strong /> }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={s.actions}>
        <Button disabled={!chosen} onClick={onContinue}>
          {t("safety:blockMute.choose.continueCta")}
        </Button>
        <button type="button" className={s.cancelLink} onClick={onCancel}>
          {t("safety:blockMute.choose.cancelCta")}
        </button>
      </div>
    </div>
  );
}

export function BlockMuteMuted({
  target,
  muteDur,
  onUndo,
}: {
  target: BlockMuteTarget;
  muteDur: MuteDurationId;
  onUndo: () => void;
}) {
  const { t } = useTranslation();
  const name = target.firstName;

  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(45,27,61,.07)" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 8.5h13M5.5 12h8M5.5 15.5h5"
            stroke="var(--plum)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        <Translation
          i18nKey="safety:blockMute.muted.title"
          values={{ name }}
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.sub}>{t("safety:blockMute.muted.sub")}</div>
      <div className={s.summary}>
        <DetailRows
          dense
          rows={[
            {
              label: t("safety:blockMute.muted.summaryLabel"),
              value: t("safety:blockMute.muted.postsComments"),
            },
            {
              label: t("safety:blockMute.muted.durationLabel"),
              value: durationLabel(t, muteDur),
            },
            {
              label: t("safety:blockMute.muted.notifiedLabel", { name }),
              value: t("safety:common.no"),
            },
          ]}
        />
      </div>
      <Link to={routes.settings} className={s.manageLink}>
        {t("safety:blockMute.muted.manageLink")} <FiArrowRight aria-hidden />
      </Link>
      <button type="button" className={s.undoLink} onClick={onUndo}>
        {t("safety:blockMute.muted.undoCta", { name })}
      </button>
    </div>
  );
}

export function BlockMuteBlocked({
  target,
  onUndo,
}: {
  target: BlockMuteTarget;
  onUndo: () => void;
}) {
  const { t } = useTranslation();
  const name = target.firstName;

  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(45,27,61,.08)" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <circle cx={12} cy={12} r={8} stroke="var(--plum)" strokeWidth={2} />
          <path
            d="M6.5 6.5l11 11"
            stroke="var(--plum)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        <Translation
          i18nKey="safety:blockMute.blocked.title"
          values={{ name }}
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.sub}>{t("safety:blockMute.blocked.sub", { name })}</div>
      <div className={s.summary}>
        <DetailRows
          dense
          rows={[
            {
              label: t("safety:blockMute.blocked.visibleLabel"),
              value: t("safety:common.no"),
            },
            {
              label: t("safety:blockMute.blocked.messageLabel"),
              value: t("safety:common.no"),
            },
            {
              label: t("safety:blockMute.blocked.notifiedLabel", { name }),
              value: t("safety:common.no"),
            },
          ]}
        />
      </div>
      <Link to={routes.settings} className={s.manageLink}>
        {t("safety:blockMute.blocked.manageLink")} <FiArrowRight aria-hidden />
      </Link>
      <button type="button" className={s.undoLink} onClick={onUndo}>
        {t("safety:blockMute.blocked.undoCta", { name })}
      </button>
      <div className={s.reportNote}>
        <Translation
          i18nKey="safety:blockMute.blocked.reportNote"
          components={{ link: <Link to={routes.report} /> }}
        />
      </div>
    </div>
  );
}

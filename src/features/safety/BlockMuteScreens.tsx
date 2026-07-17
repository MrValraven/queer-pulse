import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  MEMBER_FIRST_NAME,
  MEMBER_FULL_NAME,
  MUTE_DURATIONS,
  type MuteDurationId,
} from "./blockMute.data";
import s from "./flows.module.css";

function durationLabel(t: (key: string) => string, id: MuteDurationId) {
  return t(MUTE_DURATIONS.find((d) => d.id === id)!.labelKey);
}

export function BlockMuteChoose({
  chosen,
  onChoose,
  muteDur,
  onMuteDur,
  onContinue,
  onCancel,
}: {
  chosen: "mute" | "block" | null;
  onChoose: (c: "mute" | "block") => void;
  muteDur: MuteDurationId;
  onMuteDur: (d: MuteDurationId) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const name = MEMBER_FIRST_NAME;

  return (
    <div className={`${s.card} ${s.screenIn}`}>
      <div className={s.memberRow}>
        <div className={s.memAv}>SR</div>
        <div>
          <div className={s.memName}>{MEMBER_FULL_NAME}</div>
          <div className={s.memMeta}>she/her · Lisbon</div>
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
        onClick={() => onChoose("mute")}
      >
        <div className={s.ocHeader}>
          <span className={s.ocRadio}>
            <span className={s.ocDot} />
          </span>
          <span className={s.ocTitle}>
            {t("safety:blockMute.choose.muteTitle", { name })}
          </span>
        </div>
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
          </div>
        )}
      </div>

      <div
        className={[s.optionCard, chosen === "block" && s.optionSelected]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onChoose("block")}
      >
        <div className={s.ocHeader}>
          <span className={s.ocRadio}>
            <span className={s.ocDot} />
          </span>
          <span className={s.ocTitle}>
            {t("safety:blockMute.choose.blockTitle", { name })}
          </span>
        </div>
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
  muteDur,
  onUndo,
}: {
  muteDur: MuteDurationId;
  onUndo: () => void;
}) {
  const { t } = useTranslation();
  const name = MEMBER_FIRST_NAME;

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
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.muted.summaryLabel")}
          </span>
          <span className={s.csVal}>
            {t("safety:blockMute.muted.postsComments")}
          </span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.muted.durationLabel")}
          </span>
          <span className={s.csVal}>{durationLabel(t, muteDur)}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.muted.notifiedLabel", { name })}
          </span>
          <span className={s.csVal}>{t("safety:common.no")}</span>
        </div>
      </div>
      <Link to={routes.settings} className={s.manageLink}>
        {t("safety:blockMute.muted.manageLink")}
      </Link>
      <button type="button" className={s.undoLink} onClick={onUndo}>
        {t("safety:blockMute.muted.undoCta", { name })}
      </button>
    </div>
  );
}

export function BlockMuteBlocked({ onUndo }: { onUndo: () => void }) {
  const { t } = useTranslation();
  const name = MEMBER_FIRST_NAME;

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
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.blocked.visibleLabel")}
          </span>
          <span className={s.csVal}>{t("safety:common.no")}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.blocked.messageLabel")}
          </span>
          <span className={s.csVal}>{t("safety:common.no")}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:blockMute.blocked.notifiedLabel", { name })}
          </span>
          <span className={s.csVal}>{t("safety:common.no")}</span>
        </div>
      </div>
      <Link to={routes.settings} className={s.manageLink}>
        {t("safety:blockMute.blocked.manageLink")}
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

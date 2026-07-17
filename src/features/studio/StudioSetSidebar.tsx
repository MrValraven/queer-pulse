import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TRACKS } from "./studioSetSubmission.data";
import s from "./funding.module.css";

const SET_PAYOUT_POOL = 11.4;

/** Stable ids — never the translated label (§5.1 trap: this `<select>` had
 * no `value=`, so the option label WAS the stored value). */
const SET_TYPES = [
  { id: "liveDjSet", labelKey: "studio:setSubmission.sidebar.type.liveDjSet" },
  { id: "studioMix", labelKey: "studio:setSubmission.sidebar.type.studioMix" },
  {
    id: "recordedBroadcast",
    labelKey: "studio:setSubmission.sidebar.type.recordedBroadcast",
  },
];

interface StudioSetSidebarProps {
  matched: number;
  held: number;
}

export function StudioSetSidebar({ matched, held }: StudioSetSidebarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [setType, setSetType] = useState(SET_TYPES[0]!.id);

  return (
    <div className={s.djSide}>
      <div className={s.djCard}>
        <h3>
          <Translation
            i18nKey="studio:setSubmission.sidebar.detailsHeading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.field}>
          <label>{t("studio:setSubmission.sidebar.titleLabel")}</label>
          <input type="text" defaultValue="House for the tired" />
        </div>
        <div className={s.field}>
          <label>{t("studio:setSubmission.sidebar.typeLabel")}</label>
          <select
            value={setType}
            onChange={(event) => setSetType(event.target.value)}
          >
            {SET_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {t(type.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={s.djCard}>
        <h3>
          <Translation
            i18nKey="studio:setSubmission.sidebar.payoutPreviewHeading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.djRow}>
          <span>{t("studio:setSubmission.sidebar.tracksInSet")}</span>
          <span
            className="v"
            style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
          >
            {TRACKS.length}
          </span>
        </div>
        <div className={s.djRow}>
          <span>{t("studio:setSubmission.sidebar.matchedPaying")}</span>
          <span
            className={`${s.v} jade`}
            style={{
              fontFamily: "var(--serif)",
              color: "var(--jade-light)",
            }}
          >
            {t("studio:setSubmission.sidebar.tracksCount", { count: matched })}
          </span>
        </div>
        <div className={s.djRow}>
          <span>{t("studio:setSubmission.sidebar.onHold")}</span>
          <span
            className={`${s.v} warn`}
            style={{ fontFamily: "var(--serif)", color: "var(--accent)" }}
          >
            {t("studio:setSubmission.sidebar.tracksCount", { count: held })}
          </span>
        </div>
        <div className={s.djRow}>
          <span>{t("studio:setSubmission.sidebar.payoutPool")}</span>
          <span
            className="v"
            style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.currency(SET_PAYOUT_POOL)}
            </em>
          </span>
        </div>
        <div className={s.holdNote}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x={3} y={11} width={18} height={11} rx={2} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            <Translation
              i18nKey="studio:setSubmission.sidebar.holdNote"
              components={{ em: <em /> }}
            />
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`${s.bt} ${s.btJade} ${s.btLg}`}
        onClick={() =>
          showToast(t("studio:setSubmission.sidebar.submittedToast"), "success")
        }
      >
        {t("studio:setSubmission.sidebar.submitCta")}
      </button>
    </div>
  );
}

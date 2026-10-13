import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILTERS, CALLS } from "./studioOpenCalls.data";
import { StudioOpenCallCard } from "./StudioOpenCallCard";
import { StudioOpenCallSkeleton } from "./StudioOpenCallSkeleton";
import s from "./funding.module.css";

const APPLIED_CALL_CURATOR_INITIALS = "SM";
const APPLIED_CALL_CURATOR_NAME = "Sara Marques";
const APPLIED_CALL_TRACK = "A Beja";
const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};
const APPLIED_ON = new Date("2026-06-02T12:00:00Z");
const CLAIMED_ON = new Date("2026-06-04T12:00:00Z");
const DECISION_BY = new Date("2026-06-18T12:00:00Z");

/** The demo's council-run calls, with the applied example. */
export function StudioOpenCallsShowcase() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [filter, setFilter] = useState(FILTERS[0]!.id);
  const loading = useSimulatedLoad();

  return (
    <div className={s.wrap}>
      <div className={s.hero}>
        <div className={`${s.eb} ${s.ebAccent}`}>
          {t("studio:calls.hero.eyebrow")}
        </div>
        <h1>
          <Translation
            i18nKey="studio:calls.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>
          <Translation
            i18nKey="studio:calls.hero.dek"
            components={{ em: <em /> }}
          />
        </div>
      </div>

      <div className={s.filter}>
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f.id}
            className={[s.chip, filter === f.id && s.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setFilter(f.id)}
          >
            {t(f.labelKey)}
          </button>
        ))}
        <span className={s.filterCount}>
          <Translation
            i18nKey="studio:calls.filter.openCount"
            components={{ em: <em /> }}
            values={{ count: 7, applied: 2 }}
          />
        </span>
      </div>

      <div className={s.calls}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <StudioOpenCallSkeleton key={i} />
          ))
        ) : (
          <>
            {CALLS.map((c, i) => (
              <FadeIn key={c.id} delay={Math.min(i, 8) * 60}>
                <StudioOpenCallCard call={c} />
              </FadeIn>
            ))}

            {/* Applied state */}
            <FadeIn delay={Math.min(CALLS.length, 8) * 60}>
              <div className={s.call} style={{ opacity: 0.72 }}>
                <div className={s.callTop}>
                  <div className={s.callCur}>
                    <span className={`${s.av} ${s.jade}`}>
                      {APPLIED_CALL_CURATOR_INITIALS}
                    </span>
                    <div>
                      <div className={s.nm}>{APPLIED_CALL_CURATOR_NAME}</div>
                      <div className={s.ro}>
                        {t("studio:demo.calls.seat", { seat: 1 })}
                      </div>
                    </div>
                  </div>
                  <div className={s.callMain}>
                    <div className={s.callTags}>
                      <span className={`${s.callTag} ${s.tagCommission}`}>
                        {t("studio:demo.calls.tag.commission")}
                      </span>
                      <span className={`${s.callTag} ${s.tagApplied}`}>
                        {t("studio:demo.calls.tag.applied", {
                          date: fmt.date(APPLIED_ON, SHORT_DATE),
                        })}
                      </span>
                    </div>
                    <h3>
                      <Translation
                        i18nKey="studio:demo.calls.applied.title"
                        components={{ em: <em /> }}
                      />
                    </h3>
                    <p className={s.brief}>
                      <Translation
                        i18nKey="studio:demo.calls.applied.brief"
                        components={{ em: <em /> }}
                        values={{
                          track: APPLIED_CALL_TRACK,
                          claimedOn: fmt.date(CLAIMED_ON, SHORT_DATE),
                          decisionBy: fmt.date(DECISION_BY, SHORT_DATE),
                        }}
                      />
                    </p>
                  </div>
                  <div className={s.callAmt}>
                    <div
                      className={s.v}
                      style={{
                        fontFamily: "var(--serif)",
                        fontWeight: 300,
                        fontSize: 28,
                        color: "rgba(var(--studio-ink-rgb), 1)",
                      }}
                    >
                      <em
                        style={{
                          fontStyle: "normal",
                          color: "var(--studio-accent-text)",
                        }}
                      >
                        {fmt.currency(500)}
                      </em>
                    </div>
                    <div
                      className={s.l}
                      style={{
                        fontSize: 11,
                        color: "var(--studio-text-faint)",
                      }}
                    >
                      {t("studio:calls.applied.flatLabel")}
                    </div>
                  </div>
                </div>
                <div className={s.callFoot}>
                  <div className={s.callMeta}>
                    <span>
                      {t("studio:calls.applied.statusPrefix")}{" "}
                      <em>{t("studio:demo.calls.applied.statusNote")}</em>
                    </span>
                    <span className={s.dot} />
                    <span>
                      {t("studio:calls.applied.decisionBy", {
                        date: fmt.date(DECISION_BY, SHORT_DATE),
                      })}
                    </span>
                  </div>
                  <div className={s.callActions}>
                    <button
                      type="button"
                      className={s.bt}
                      onClick={() =>
                        showToast(
                          t("studio:calls.applied.withdrawnToast"),
                          "info",
                        )
                      }
                    >
                      {t("studio:calls.applied.withdrawCta")}
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  );
}

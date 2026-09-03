import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILTERS, CALLS } from "./studioOpenCalls.data";
import { StudioOpenCallCard } from "./StudioOpenCallCard";
import { StudioOpenCallSkeleton } from "./StudioOpenCallSkeleton";
import s from "./funding.module.css";

// Content: the mock "already applied" call — curator identity, call type/
// status tags, title, brief, and status note. Mirrors CALLS in
// studioOpenCalls.data.tsx, which already keeps these fields as plain
// content strings, never translated.
const APPLIED_CALL_CURATOR_INITIALS = "SM";
const APPLIED_CALL_CURATOR_NAME = "Sara Marques";
const APPLIED_CALL_CURATOR_ROLE = "Council · seat 1";
const APPLIED_CALL_TYPE_TAG = "Commission";
const APPLIED_CALL_STATUS_TAG = "Applied · 2 Jun";
const APPLIED_CALL_TITLE_PRE = "Closing theme for the ";
const APPLIED_CALL_TITLE_EM = "Pride assembly";
const APPLIED_CALL_BRIEF_PRE = "You attached ";
const APPLIED_CALL_BRIEF_TRACK = "A Beja";
const APPLIED_CALL_BRIEF_POST =
  " and a note. Sara claimed it on 4 June. Decision by 18 June. You'll hear back here and by email, with a sentence either way.";
const APPLIED_CALL_STATUS_NOTE = "in review with Sara";

export function StudioOpenCallsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [filter, setFilter] = useState(FILTERS[0]!.id);
  const loading = useSimulatedLoad();

  return (
    <StudioShell>
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
                        <div className={s.ro}>{APPLIED_CALL_CURATOR_ROLE}</div>
                      </div>
                    </div>
                    <div className={s.callMain}>
                      <div className={s.callTags}>
                        <span className={`${s.callTag} ${s.tagCommission}`}>
                          {APPLIED_CALL_TYPE_TAG}
                        </span>
                        <span className={`${s.callTag} ${s.tagApplied}`}>
                          {APPLIED_CALL_STATUS_TAG}
                        </span>
                      </div>
                      <h3>
                        {APPLIED_CALL_TITLE_PRE}
                        <em>{APPLIED_CALL_TITLE_EM}</em>
                      </h3>
                      <p className={s.brief}>
                        {APPLIED_CALL_BRIEF_PRE}
                        <em>{APPLIED_CALL_BRIEF_TRACK}</em>
                        {APPLIED_CALL_BRIEF_POST}
                      </p>
                    </div>
                    <div className={s.callAmt}>
                      <div
                        className="v"
                        style={{
                          fontFamily: "var(--serif)",
                          fontWeight: 300,
                          fontSize: 28,
                          color: "rgb(var(--cream-rgb))",
                        }}
                      >
                        <em
                          style={{
                            fontStyle: "normal",
                            color: "var(--accent)",
                          }}
                        >
                          {fmt.currency(500)}
                        </em>
                      </div>
                      <div
                        className="l"
                        style={{ fontSize: 11, color: "rgba(247,243,238,.4)" }}
                      >
                        {t("studio:calls.applied.flatLabel")}
                      </div>
                    </div>
                  </div>
                  <div className={s.callFoot}>
                    <div className={s.callMeta}>
                      <span>
                        {t("studio:calls.applied.statusPrefix")}{" "}
                        <em>{APPLIED_CALL_STATUS_NOTE}</em>
                      </span>
                      <span className={s.dot} />
                      <span>
                        {t("studio:calls.applied.decisionBy", {
                          date: "18 Jun",
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
    </StudioShell>
  );
}

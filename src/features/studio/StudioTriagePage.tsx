import { AnimatePresence, m } from "motion/react";
import { useId, useMemo, useState } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { tabPanelProps } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { StudioTriageDetail } from "./StudioTriageDetail";
import { triageSubmissionKeyOf } from "./StudioTriageDetail.data";
import { StudioTriageList } from "./StudioTriageList";
import { buildSubs, KPIS, MEDIAN_REPLY_DAYS, TABS } from "./studioTriage.data";
import { STUDIO_FADE } from "./studioMotion";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import s from "./council.module.css";
import css from "./StudioTriage.module.css";

/** "New this week": the count the header names, read from the New tab so
 *  the two can never disagree. */
const NEW_THIS_WEEK = Number(TABS.find((tab) => tab.id === "new")?.ct ?? 0);

/** The demo curator triage: the queue tabs, the submissions, and the
 *  detail of the one picked, which follows the pick. */
export function StudioTriagePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const tabsId = useId();
  const detailId = useId();
  const [tab, setTab] = useState("new");
  const submissions = useMemo(() => buildSubs(t, fmt), [t, fmt]);
  const [selectedKey, setSelectedKey] = useState(() =>
    submissions[0] ? triageSubmissionKeyOf(submissions[0]) : "",
  );
  const selected =
    submissions.find(
      (submission) => triageSubmissionKeyOf(submission) === selectedKey,
    ) ?? submissions[0];
  useStudioDocumentTitle(t("studio:triage.documentTitle"));

  return (
    <StudioShell>
      <div className={s.wrap}>
        <section className={s.trH}>
          <div>
            <div className={s.eb}>{t("studio:triage.header.eyebrow")}</div>
            <div className={`${s.pageH} ${css.pageHead}`}>
              <h1>
                <Translation
                  i18nKey="studio:triage.header.title"
                  components={{ em: <em /> }}
                  values={{ count: NEW_THIS_WEEK }}
                />
              </h1>
            </div>
            <div className={s.sub}>
              <Translation
                i18nKey="studio:triage.header.sub"
                components={{ em: <em /> }}
                values={{ days: fmt.number(MEDIAN_REPLY_DAYS) }}
              />
            </div>
          </div>
          <div className={`${s.kpiStrip} ${css.kpiGrid}`}>
            {KPIS.map((kpi) => (
              <div key={kpi.labelKey} className={s.kpiMini}>
                <div
                  className={[s.v, kpi.jade && s.jade]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {kpi.v}
                </div>
                <div className={s.l}>{t(kpi.labelKey)}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={css.tabsFade}>
          <StudioTablist
            tabs={TABS.map((tabOption) => ({
              id: tabOption.id,
              labelKey: tabOption.labelKey,
              badge: <span className={s.ctNum}>{` ${tabOption.ct}`}</span>,
            }))}
            activeId={tab}
            onChange={setTab}
            idPrefix={tabsId}
            label={t("studio:triage.tabsLabel")}
          />
        </div>

        <div {...tabPanelProps(tabsId, tab)} className={s.trBody}>
          <StudioTriageList
            tab={tab}
            submissions={submissions}
            selectedKey={selectedKey}
            detailId={detailId}
            onSelect={setSelectedKey}
            onBackToNew={() => setTab("new")}
          />
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <m.div
                key={triageSubmissionKeyOf(selected)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reducedMotion ? { duration: 0.12 } : STUDIO_FADE}
              >
                <StudioTriageDetail id={detailId} submission={selected} />
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </StudioShell>
  );
}

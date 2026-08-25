import {
  Stepper,
  DetailRows,
  type StepperStep,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  buildAppealResultConfigs,
  type AppealResultConfig,
  type AppealTone,
} from "./appealPanels.data";
import s from "./flows.module.css";

/** Report filed → appeal submitted → decision, as a vertical stepper timeline.
 *  `pending` marks the decision step as not-yet-reached; `done` completes all. */
export function AppealTimeline({ stage }: { stage: "pending" | "done" }) {
  const { t } = useTranslation();
  const steps: StepperStep[] = [
    { key: "filed", label: t("safety:appeal.timeline.filed") },
    { key: "submitted", label: t("safety:appeal.timeline.submitted") },
    { key: "decision", label: t("safety:appeal.timeline.decision") },
  ];
  return (
    <Stepper
      steps={steps}
      current={stage === "done" ? steps.length : 1}
      orientation="vertical"
      marker="number"
      ariaLabel={t("safety:appeal.ref.label")}
      className={s.appealTimeline}
    />
  );
}

/** Icon-circle background tint per outcome (token-based rgba). */
const ICON_BG: Record<AppealTone, string> = {
  pending: "rgba(var(--accent-rgb), 0.1)",
  overturned: "rgba(var(--jade-rgb), 0.1)",
  upheld: "rgba(var(--plum-rgb), 0.07)",
};

/**
 * One data-driven appeal outcome panel — the consolidation of the former
 * pending / overturned / upheld panels, which shared the same
 * card → icon → title → sub → reference rows → timeline → info box → footer
 * shape and differed only in content. `config` (from `buildAppealResultConfigs`)
 * carries the per-outcome parts; `tone` drives the icon tint, title emphasis,
 * info box variant and timeline stage.
 */
export function AppealResultPanel({ config }: { config: AppealResultConfig }) {
  const { t } = useTranslation();
  const emphasis =
    config.tone === "overturned" ? (
      <em style={{ color: "var(--jade)" }} />
    ) : (
      <em />
    );
  const infoClass = config.tone === "upheld" ? s.infoPlum : s.infoJade;
  const stage = config.tone === "pending" ? "pending" : "done";

  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: ICON_BG[config.tone] }}>
        {config.icon}
      </div>
      <div className={s.title}>
        <Translation i18nKey={config.titleKey} components={{ em: emphasis }} />
      </div>
      <div className={s.sub}>{t(config.subKey)}</div>
      <div className={s.refBox}>
        <DetailRows dense rows={config.refRows} />
      </div>
      <AppealTimeline stage={stage} />
      <div className={`${s.infoBox} ${infoClass}`}>
        <Translation
          i18nKey={config.infoKey}
          components={{ strong: <strong /> }}
        />
      </div>
      {config.actions}
    </div>
  );
}

/** Backward-compatible thin wrappers over `AppealResultPanel`. */
export function AppealPendingPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <AppealResultPanel config={buildAppealResultConfigs(t, fmt).pending} />
  );
}

export function AppealOverturnedPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <AppealResultPanel config={buildAppealResultConfigs(t, fmt).overturned} />
  );
}

export function AppealUpheldPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return <AppealResultPanel config={buildAppealResultConfigs(t, fmt).upheld} />;
}

import { useId, type ReactNode } from "react";
import { Toggle } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./StudioSettingsPage.module.css";

export function SettingsSection({
  labelKey,
  titleKey,
  children,
}: {
  labelKey: string;
  titleKey: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={s.sec} aria-labelledby={headingId}>
      <div className={s.secLbl}>{t(labelKey)}</div>
      <h2 id={headingId}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h2>
      {children}
    </section>
  );
}

/** One switch row. The description is the switch's `aria-describedby`, and a
 *  switch that cannot move yet says why in the same description. */
export function ToggleOption({
  headingKey,
  bodyKey,
  isOn,
  isLoading = false,
  onToggle,
  action,
}: {
  headingKey: string;
  bodyKey: string;
  isOn: boolean;
  /** Until the stored row has loaded a switch does nothing. */
  isLoading?: boolean;
  onToggle: () => void;
  /** A control that sits beside the switch (for example Clear). */
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  const bodyId = useId();
  const loadingId = useId();
  return (
    <div className={`${s.opt} ${isLoading ? s.optLoading : ""}`}>
      <div className={s.ot}>
        <h3>{t(headingKey)}</h3>
        <p id={bodyId}>{t(bodyKey)}</p>
        {isLoading && (
          <p id={loadingId} className={s.srOnly}>
            {t("studio:settingsLive.loadingReason")}
          </p>
        )}
      </div>
      <div className={s.optControls}>
        {action}
        <Toggle
          checked={isOn}
          onChange={() => {
            if (!isLoading) onToggle();
          }}
          label={t(headingKey)}
          aria-describedby={isLoading ? `${bodyId} ${loadingId}` : bodyId}
        />
      </div>
    </div>
  );
}

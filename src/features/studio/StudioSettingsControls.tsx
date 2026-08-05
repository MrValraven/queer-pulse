import type { RadioOpt } from "./studioSettings.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./StudioSettingsPage.module.css";

export function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  /** Accessible name for the switch — the setting it controls (the caller's
   *  adjacent heading). Passed by the caller because this primitive is reused
   *  across every setting and cannot know which one it toggles. */
  label?: string;
}) {
  return (
    <div
      className={`${s.tgSw} ${on ? s.tgSwOn : ""}`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="switch"
      tabIndex={0}
      aria-checked={on}
      aria-label={label}
    />
  );
}

export function Seg({
  opts,
  active,
  onChange,
}: {
  opts: string[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className={s.seg}>
      {opts.map((o) => (
        <button
          type="button"
          key={o}
          className={`${s.segBtn} ${active === o ? s.segBtnOn : ""}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function RadioCards({
  opts,
  active,
  onChange,
}: {
  opts: RadioOpt[];
  active: string;
  onChange: (k: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.rcards}>
      {opts.map((o) => (
        <div
          key={o.key}
          className={`${s.rcard} ${active === o.key ? s.rcardOn : ""}`}
          role="button"
          tabIndex={0}
          aria-label={t(o.labelKey)}
          onClick={() => onChange(o.key)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(o.key);
            }
          }}
        >
          <div className={s.rdot} />
          <div>
            <h5>
              {t(o.labelKey)}
              {o.badgeKey && <span className={s.badge}>{t(o.badgeKey)}</span>}
            </h5>
            <p>{t(o.subKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

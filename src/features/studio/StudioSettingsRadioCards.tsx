import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RadioOpt } from "./studioSettings.data";
import s from "./StudioSettingsPage.module.css";

/** Settings' radio cards on the shared radiogroup, so each card exposes its
 *  selected state and keeps its description. */
export function StudioSettingsRadioCards({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: RadioOpt[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <RadioCardGroup
      value={value}
      onChange={onChange}
      ariaLabel={ariaLabel}
      className={s.rcards}
      optionClassName={s.rcard}
      checkedClassName={s.rcardOn}
      options={options.map((option) => ({
        id: option.key,
        render: (
          <>
            <span className={s.rdot} aria-hidden />
            <span className={s.rcardText}>
              <span className={s.rcardTitle}>
                {t(option.labelKey)}
                {option.badgeKey && (
                  <span className={s.badge}>{t(option.badgeKey)}</span>
                )}
              </span>
              <span className={s.rcardSub}>{t(option.subKey)}</span>
            </span>
          </>
        ),
      }))}
    />
  );
}

import { RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { OptionRow } from "../listBusiness.data";
import styles from "../ListBusinessPage.module.css";

/** Stacked radio cards with a title + description per option, used for the
 *  owner's connection to the place and for how much of their identity shows. */
export function RadioStack({
  options,
  value,
  onChange,
  label,
}: {
  options: OptionRow[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <RadioCardGroup
      className={styles.stack}
      optionClassName={styles.radioOpt}
      checkedClassName={styles.optOn}
      ariaLabel={label}
      value={value}
      onChange={onChange}
      options={options.map((o) => ({
        id: o.id,
        render: (
          <>
            <span className={styles.roDot} aria-hidden />
            <span className={styles.radioTxt}>
              <b>{t(o.labelKey)}</b>
              <span>{t(o.descKey)}</span>
            </span>
          </>
        ),
      }))}
    />
  );
}

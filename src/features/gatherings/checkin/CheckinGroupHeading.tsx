import type { Ref } from "react";
import { FiChevronDown } from "react-icons/fi";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import styles from "./CheckinGroupHeading.module.css";

interface CheckinGroupHeadingProps {
  id: string;
  /** A plural catalog key whose `{count}` is the group's size. */
  labelKey:
    "gatherings:checkin.groups.expected" | "gatherings:checkin.groups.arrived";
  count: number;
  /** Set for a heading that focus can be sent to (`tabIndex={-1}`). */
  headingRef?: Ref<HTMLHeadingElement>;
  /** Makes the heading a disclosure button that folds the group away. */
  toggle?: {
    isOpen: boolean;
    controlsId: string;
    onToggle: () => void;
  };
}

/** A guest group's `h3`, its count rolling as guests arrive. */
export function CheckinGroupHeading({
  id,
  labelKey,
  count,
  headingRef,
  toggle,
}: CheckinGroupHeadingProps) {
  const format = useFormat();
  const label = (
    <Translation
      i18nKey={labelKey}
      values={{ count }}
      slots={{
        count: (
          <RollingNumber value={format.number(count)} numericValue={count} />
        ),
      }}
    />
  );

  return (
    <h3
      id={id}
      ref={headingRef}
      tabIndex={headingRef ? -1 : undefined}
      className={styles.groupTitle}
    >
      {toggle ? (
        <button
          type="button"
          className={`${styles.groupHeading} ${styles.groupToggle}`}
          aria-expanded={toggle.isOpen}
          aria-controls={toggle.isOpen ? toggle.controlsId : undefined}
          onClick={toggle.onToggle}
        >
          <span>{label}</span>
          <FiChevronDown aria-hidden className={styles.chevron} />
        </button>
      ) : (
        // The inner span keeps the label's text and rolling count one flex
        // item, so the heading's gap never splits "( 4 )" apart.
        <span className={styles.groupHeading}>
          <span>{label}</span>
        </span>
      )}
    </h3>
  );
}

import type { IconType } from "react-icons";
import {
  FiGlobe,
  FiMail,
  FiShare2,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { EventVisibility } from "./api/events.api";
import { AUDIENCE_SCOPE_OPTIONS } from "./audienceScope.data";
import styles from "./AudienceScopeField.module.css";

// Icon-component lookup per scope tier. It stays colocated with the component
// because it holds imported react-icons components. "public" is included only
// so the lookup stays total; the wizard offers the other tiers (see
// events.api.ts).
const SCOPE_ICON: Record<EventVisibility, IconType> = {
  public: FiGlobe,
  members: FiGlobe,
  extended_network: FiShare2,
  network: FiUserCheck,
  community: FiUsers,
  invite_only: FiMail,
};

export interface AudienceScopeFieldProps {
  value: EventVisibility;
  onChange: (value: EventVisibility) => void;
  /** Whether the "Community members" tier should be offered. True only when
   *  the gathering has a community attached: in the create wizard, once the
   *  host picks one of their communities; in edit, when the gathering is
   *  already filed to one. Mutually exclusive with the network tiers: picking
   *  this tier is only possible while a community is attached. */
  communityAvailable: boolean;
  fieldId: string;
  /** The field's root. The class hooks below are each merged after the
   *  field's own class, so a caller that restyles the field (the create
   *  wizard) names what it styles and leaves the markup's shape alone. */
  className?: string;
  labelClassName?: string;
  hintClassName?: string;
  /** The radiogroup container. */
  groupClassName?: string;
  /** Every option card. */
  optionClassName?: string;
  /** Added to the chosen option card on top of `optionClassName`. */
  checkedClassName?: string;
  /** The round icon at the start of each card. */
  iconClassName?: string;
  /** Where the hint sits: over the cards (the default, the edit modal's look)
   *  or under them (the wizard's). The DOM follows the same order, so a
   *  screen reader meets the hint where the eye does. */
  hintPlacement?: "above" | "below";
}

export function AudienceScopeField({
  value,
  onChange,
  communityAvailable,
  fieldId,
  className,
  labelClassName,
  hintClassName,
  groupClassName,
  optionClassName,
  checkedClassName,
  iconClassName,
  hintPlacement = "above",
}: AudienceScopeFieldProps) {
  const { t } = useTranslation();
  const label = t("gatherings:audienceScope.label");
  const labelId = `${fieldId}-label`;
  const hintId = `${fieldId}-hint`;
  const options = AUDIENCE_SCOPE_OPTIONS.filter(
    (option) => option.id !== "community" || communityAvailable,
  );
  const hint = (
    <p className={cx(styles.hint, hintClassName)} id={hintId}>
      {t("gatherings:audienceScope.hint")}
    </p>
  );

  return (
    <div className={className}>
      {/* A `role="radiogroup"` container is not a labelable form control, so
       *  this stays a plain labelled div (a `<label htmlFor>` would be inert),
       *  tied to the group below through `aria-labelledby` and
       *  `aria-describedby`. */}
      <div className={cx(styles.label, labelClassName)} id={labelId}>
        {label}
      </div>
      {hintPlacement === "above" && hint}
      <RadioCardGroup<EventVisibility>
        id={fieldId}
        className={cx(styles.stack, groupClassName)}
        optionClassName={cx(styles.option, optionClassName)}
        checkedClassName={cx(styles.optionOn, checkedClassName)}
        ariaLabel={label}
        ariaLabelledBy={labelId}
        ariaDescribedBy={hintId}
        value={value}
        onChange={onChange}
        options={options.map((option) => {
          const Icon = SCOPE_ICON[option.id];
          return {
            id: option.id,
            render: (
              <>
                <span className={cx(styles.icon, iconClassName)}>
                  <Icon aria-hidden />
                </span>
                <span className={styles.text}>
                  <b>{t(option.labelKey)}</b>
                  <span>{t(option.helperKey)}</span>
                </span>
              </>
            ),
          };
        })}
      />
    </div>
  );
}

import type { IconType } from "react-icons";
import { FiGlobe, FiMail, FiShare2, FiUserCheck, FiUsers } from "react-icons/fi";
import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventVisibility } from "./api/events.api";
import { AUDIENCE_SCOPE_OPTIONS } from "./audienceScope.data";
import styles from "./AudienceScopeField.module.css";

// Icon-component lookup per scope tier — stays colocated with the component
// (like CapacityStep's own maps) because it references imported react-icons
// components, not translated/mock data. "public" is included only so the
// lookup stays total; the wizard never offers it (see events.api.ts).
const SCOPE_ICON: Record<EventVisibility, IconType> = {
  public: FiGlobe,
  members: FiGlobe,
  extended_network: FiShare2,
  network: FiUserCheck,
  community: FiUsers,
  invite_only: FiMail,
};

export function AudienceScopeField({
  value,
  onChange,
  communityAvailable,
  fieldId,
}: {
  value: EventVisibility;
  onChange: (value: EventVisibility) => void;
  /** Whether the "Community members" tier should be offered. True only when
   *  the gathering has a community attached — in the create wizard, once the
   *  host picks one of their communities; in edit, when the gathering is
   *  already filed to one. Mutually exclusive with the network tiers: picking
   *  this tier is only possible while a community is attached. */
  communityAvailable: boolean;
  fieldId: string;
}) {
  const { t } = useTranslation();
  const label = t("gatherings:audienceScope.label");
  const labelId = `${fieldId}-label`;
  const hintId = `${fieldId}-hint`;
  const options = AUDIENCE_SCOPE_OPTIONS.filter(
    (option) => option.id !== "community" || communityAvailable,
  );

  return (
    <div>
      {/* A `role="radiogroup"` container isn't a labelable form control, so
       *  this stays a plain labelled div (not a `<label htmlFor>`, which
       *  would be inert) — associated to the group below via
       *  `aria-labelledby`/`aria-describedby`, matching the group-label
       *  pattern CapacityStep already uses for its accessibility checklist. */}
      <div className={styles.label} id={labelId}>
        {label}
      </div>
      <p className={styles.hint} id={hintId}>
        {t("gatherings:audienceScope.hint")}
      </p>
      <RadioCardGroup<EventVisibility>
        id={fieldId}
        className={styles.stack}
        optionClassName={styles.option}
        checkedClassName={styles.optionOn}
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
                <span className={styles.icon}>
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

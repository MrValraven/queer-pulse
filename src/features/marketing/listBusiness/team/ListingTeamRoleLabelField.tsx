import { useEffect, useRef } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { LISTING_TEAM_LIMITS } from "../api/listingTeam.types";

/**
 * The one-line role a persona shows on the page. It hands back the raw typed
 * value; callers send `normalizeRoleLabel(value)`.
 */
export function ListingTeamRoleLabelField({
  id,
  value,
  onChange,
  isDisabled = false,
  shouldAutoFocus = false,
  describedById,
  onSubmit,
  onCancel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  /** Moves focus into the input when the field mounts. */
  shouldAutoFocus?: boolean;
  /** Id of the element naming whose role this is, read with the field. */
  describedById?: string;
  /** Called on Enter. */
  onSubmit?: () => void;
  /** Called on Escape. */
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (shouldAutoFocus) inputRef.current?.focus();
  }, [shouldAutoFocus]);
  return (
    <FormField
      label={t("marketing:listBusiness.team.roleLabel.label")}
      helper={t("marketing:listBusiness.team.roleLabel.hint")}
    >
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        maxLength={LISTING_TEAM_LIMITS.roleLabelMax}
        placeholder={t("marketing:listBusiness.team.roleLabel.placeholder")}
        disabled={isDisabled}
        aria-describedby={describedById}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSubmit) {
            event.preventDefault();
            onSubmit();
          } else if (event.key === "Escape" && onCancel) {
            event.preventDefault();
            onCancel();
          }
        }}
      />
    </FormField>
  );
}

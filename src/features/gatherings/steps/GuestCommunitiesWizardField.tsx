import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field } from "../CreateGatheringFields";
import { GuestCommunitiesPicker } from "../GuestCommunitiesPicker";
import type { GatheringForm } from "../useGatheringForm";

/**
 * "Guest communities (optional)" in chapter 3, under the community picker.
 * Locked with its own hint until a lead is picked. Every row reads "Sends
 * when you publish": the invites go out after the create returns a slug.
 */
export function GuestCommunitiesWizardField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputId = `${fieldId}-guest-communities`;
  return (
    <Field
      label={t("gatherings:guestCommunities.label")}
      htmlFor={inputId}
      isOptional
    >
      <GuestCommunitiesPicker
        inputId={inputId}
        describedById={`${inputId}-hint`}
        helper={t(
          form.communitySlug === ""
            ? "gatherings:guestCommunities.lockedHint"
            : "gatherings:guestCommunities.hint",
        )}
        leadSlug={form.communitySlug}
        guests={form.guestCommunities}
        unsentLabel={t("gatherings:guestCommunities.status.unsentCreate")}
        onChange={form.setGuestCommunities}
      />
    </Field>
  );
}

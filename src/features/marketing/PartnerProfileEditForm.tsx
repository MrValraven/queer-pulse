import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { OwnedPartnerDTO } from "./api/partners.api";
import { useUpdateMyPartner } from "./api/useMyPartners";
import {
  toPartnerProfileDraft,
  toUpdatePartnerProfileDto,
  type PartnerProfileDraft,
} from "./partnerProfileDraft";
import {
  PartnerProfileContactFields,
  PartnerProfileOrgFields,
  PartnerProfilePitchFields,
} from "./PartnerProfileFields";
import { PartnerProfileStaffFields } from "./PartnerProfileStaffFields";
import styles from "./PartnerProfileEditPage.module.css";

/**
 * The editable half of a partner's own profile (PRD-263).
 *
 * WHAT IS HERE is everything the organisation is the only reliable source for:
 * where it is, how to reach it, what it does, how it is funded. None of it
 * needs re-review, because none of it makes a claim about QueerPulse, and a
 * stale phone number on a public support page is a worse outcome than a
 * partner mistyping its own address.
 *
 * WHAT IS NOT is shown read-only by `PartnerProfileStaffFields` rather than
 * hidden, so the boundary reads as a boundary instead of as a bug.
 *
 * The long-form body blocks the public page can carry (`stats`, `aboutMore`,
 * `jointWork`, `timeline`, `how`, `atGlance`) are not editable here yet: they
 * are repeaters, the API accepts them, and staff can still set them. Nothing
 * about this form prevents them being added later.
 */
export function PartnerProfileEditForm({
  partner,
}: {
  partner: OwnedPartnerDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updatePartner = useUpdateMyPartner();
  // Seeded once. The page remounts this component per partner (`key`), so a
  // refetch landing mid-edit cannot reach in and overwrite what is being typed.
  const [draft, setDraft] = useState<PartnerProfileDraft>(() =>
    toPartnerProfileDraft(partner),
  );

  function setField<Field extends keyof PartnerProfileDraft>(
    field: Field,
    value: PartnerProfileDraft[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (updatePartner.isPending) return;
    updatePartner.mutate(
      { id: partner.id, dto: toUpdatePartnerProfileDto(draft) },
      {
        onSuccess: () =>
          showToast(t("marketing:partnerProfileEdit.savedToast"), "success"),
        onError: (error) =>
          showToast(
            describeError(
              t("marketing:partnerProfileEdit.errorToast"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <PartnerProfileStaffFields partner={partner} />
      <PartnerProfileOrgFields draft={draft} onChange={setField} />
      <PartnerProfilePitchFields draft={draft} onChange={setField} />
      <PartnerProfileContactFields draft={draft} onChange={setField} />

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={updatePartner.isPending}
          aria-busy={updatePartner.isPending}
        >
          {updatePartner.isPending
            ? t("marketing:partnerProfileEdit.actions.saving")
            : t("marketing:partnerProfileEdit.actions.save")}
        </Button>
        <Button variant="ghost" to={`${routes.partner}/${partner.slug}`}>
          {t("marketing:partnerProfileEdit.actions.viewPublic")}
        </Button>
      </div>
    </form>
  );
}

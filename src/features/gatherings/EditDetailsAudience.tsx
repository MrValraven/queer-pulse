import { useId } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { AudienceScopeField } from "./AudienceScopeField";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsSection } from "./EditDetailsSection";

/**
 * "Who it's for" in the edit-details modal: the community the gathering is
 * filed to and who can see it.
 *
 * Split out of `EditDetailsModal` so both stay inside the 200-line rule. The
 * two fields are one decision: the "Community members" tier exists only while
 * a community is attached.
 */
export function EditDetailsAudience({
  draft,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const myCommunityOptions = useMyCommunityOptions();

  // Mirrors `useGatheringForm`'s `setCommunitySlug`: clearing the community
  // while "Community members" is the chosen audience would leave it pointing
  // at an audience that no longer exists, so it falls back to the default
  // ("members", Public) the moment the community is cleared. One patch, since
  // both fields live on the same draft.
  const setCommunitySlug = (value: string) =>
    onChange({
      communitySlug: value,
      visibility:
        !value && draft.visibility === "community"
          ? "members"
          : draft.visibility,
    });

  return (
    <EditDetailsSection
      title={t("gatherings:manage.editModal.section.audience")}
    >
      {myCommunityOptions.length > 0 && (
        <FormField label={t("gatherings:create.step3.communityLabel")}>
          <Select
            options={[
              {
                value: "",
                label: t("gatherings:create.step3.communityNone"),
              },
              ...myCommunityOptions.map((community) => ({
                value: community.slug,
                label: community.name,
              })),
            ]}
            value={draft.communitySlug}
            onChange={(value) => setCommunitySlug(value ?? "")}
          />
        </FormField>
      )}
      {/* Reads the IN-PROGRESS draft, so picking or clearing a community in
          this same edit shows or hides the "Community members" tier straight
          away, exactly like the create wizard's `form.communitySlug !== ""`. */}
      <AudienceScopeField
        fieldId={`${fieldId}-audience`}
        value={draft.visibility}
        onChange={(value) => onChange({ visibility: value })}
        communityAvailable={draft.communitySlug !== ""}
      />
    </EditDetailsSection>
  );
}

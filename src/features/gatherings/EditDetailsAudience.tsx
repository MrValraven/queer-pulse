import { useId } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { AudienceScopeField } from "./AudienceScopeField";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsSection } from "./EditDetailsSection";
import { CapacityStepper } from "./fields/CapacityStepper";
import {
  editCapacityProblem,
  isEditCapacityLowered,
} from "./manageGatheringState";
import { MAX_CAPACITY, MIN_CAPACITY } from "./steps/whoChapter.data";
import styles from "./EditDetailsModal.module.css";

/**
 * "Who it's for" in the edit-details modal: the community the gathering is
 * filed to, who can see it, and how many people can go.
 *
 * Split out of `EditDetailsModal` so both stay inside the 200-line rule. The
 * first two fields are one decision: the "Community members" tier exists only
 * while a community is attached. The capacity is the wizard's own stepper, in
 * the same chapter the wizard asks it.
 */
export function EditDetailsAudience({
  draft,
  openedWithCapacity,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** The capacity the modal opened with, which is the saved one. The field
   *  compares against it to say what a lower number means, and a legacy
   *  number outside the stepper's range still saves while it is unchanged. */
  openedWithCapacity: string;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const myCommunityOptions = useMyCommunityOptions();
  const isCapacityOutOfRange =
    editCapacityProblem(draft, openedWithCapacity) === "outOfRange";

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
        <FormField
          label={t("gatherings:create.step3.communityLabel")}
          helper={t("gatherings:create.step3.communityHint")}
        >
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
      <CapacityStepper
        className={styles.capacityField}
        label={t("gatherings:create.step3.capLabel")}
        value={draft.capacity}
        onChange={(value) => onChange({ capacity: value })}
        // The server keeps everyone already going when the number drops, so
        // a host lowering it hears that before saving. An out-of-range number
        // says why the save is held instead.
        hint={
          !isCapacityOutOfRange &&
          isEditCapacityLowered(draft, openedWithCapacity)
            ? t("gatherings:manage.editModal.capacityLowerHint")
            : undefined
        }
        error={
          isCapacityOutOfRange
            ? t("gatherings:manage.editModal.capacityRangeError", {
                min: MIN_CAPACITY,
                max: MAX_CAPACITY,
              })
            : undefined
        }
      />
    </EditDetailsSection>
  );
}

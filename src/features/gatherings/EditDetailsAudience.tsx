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
import { useHostableCommunities } from "./useHostableCommunities";
import styles from "./EditDetailsModal.module.css";

/**
 * "Who it's for" in the edit-details modal: the community the gathering is
 * hosted with, who can see it, and how many people can go.
 *
 * Split out of `EditDetailsModal` so both stay inside the 200-line rule. The
 * first two fields are separate choices that touch at one point: the
 * "Community members" tier exists only while a community is attached, but
 * attaching one never narrows who can see the gathering. The capacity is the
 * wizard's own stepper, in the same chapter the wizard asks it.
 */
export function EditDetailsAudience({
  draft,
  openedWithCapacity,
  savedCommunitySlug,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** The capacity the modal opened with, which is the saved one. The field
   *  compares against it to say what a lower number means, and a legacy
   *  number outside the stepper's range still saves while it is unchanged. */
  openedWithCapacity: string;
  /** The community the gathering is hosted with now ("" for none). */
  savedCommunitySlug: string;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { options: hostableOptions } = useHostableCommunities();
  const myCommunityOptions = useMyCommunityOptions();
  // Only communities the editor runs or moderates can be picked. The one the
  // gathering is already hosted with stays listed even when they don't (a
  // co-host, or a host who has since stepped down), so the field shows the
  // truth and they can still clear it, just not move it somewhere else.
  const isSavedHostable =
    savedCommunitySlug === "" ||
    hostableOptions.some((community) => community.slug === savedCommunitySlug);
  const communityOptions = isSavedHostable
    ? hostableOptions
    : [
        {
          slug: savedCommunitySlug,
          name:
            myCommunityOptions.find(
              (community) => community.slug === savedCommunitySlug,
            )?.name ?? savedCommunitySlug,
        },
        ...hostableOptions,
      ];
  const isCapacityOutOfRange =
    editCapacityProblem(draft, openedWithCapacity) === "outOfRange";
  // The server keeps everyone already going when the number drops, so a host
  // lowering it hears that before saving; an out-of-range number says why the
  // save is held instead. Any cap also counts the host, who holds a spot. The
  // modal is open to co-hosts too, so that line names the host neutrally.
  const capacityHintLines = isCapacityOutOfRange
    ? []
    : [
        isEditCapacityLowered(draft, openedWithCapacity)
          ? t("gatherings:manage.editModal.capacityLowerHint")
          : null,
        draft.capacity.trim() === ""
          ? null
          : t("gatherings:create.step3.capIncludesHostHint"),
      ].filter(Boolean);

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
      {communityOptions.length > 0 && (
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
              ...communityOptions.map((community) => ({
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
        hint={
          capacityHintLines.length > 0 ? capacityHintLines.join(" ") : undefined
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

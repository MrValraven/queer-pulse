import { useId, useState } from "react";
import { Button, FormField, Modal, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { AudienceScopeField } from "./AudienceScopeField";
import type { EventVisibility } from "./api/events.api";
import { EditDetailsFormat } from "./EditDetailsFormat";
import { EditDetailsSchedule } from "./EditDetailsSchedule";
import type { FormatDetails, GatheringFamily } from "./gatheringCatalog";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { canSaveEditDraft } from "./manageGatheringState";
import { ATTENDEE_COUNT } from "./manageGathering.data";
import styles from "./GatheringModals.module.css";

export interface GatheringDetailsDraft {
  title: string;
  /** The gathering's real start moment, as the local `"yyyy-mm-ddThh:mm"`
   *  wire value `DatePicker`'s `datetime` mode reads/writes (see
   *  `dateToDatetimeValue`), never a formatted display string, so saving
   *  actually reschedules the event rather than just relabelling it. */
  startAt: string;
  /** When the gathering ends, in the same local `"yyyy-mm-ddThh:mm"` wire
   *  value `startAt` uses, or `""` when it states no end. The empty string is
   *  a SAVED ANSWER rather than a field still to be filled in: an end is
   *  optional on a gathering, the host can clear one that already exists, and
   *  `buildEditPatch` puts an explicit `null` on the wire for it. Same
   *  empty-string sentinel convention as `communitySlug` below.
   *
   *  It is editable at all because a start is: moving a 23:00 start to 06:00
   *  used to push it past the stored end, and the only thing that came back
   *  was a 400 with nothing on the form to change. */
  endAt: string;
  location: string;
  description: string;
  /** Who can find and RSVP to this gathering. See `AudienceScopeField`. */
  visibility: EventVisibility;
  /** The community this gathering is filed to, or `""` for none: mirrors
   *  `useGatheringForm`'s `communitySlug` convention exactly (same "no
   *  community" empty-string sentinel), since it's now settable in both
   *  create and edit. */
  communitySlug: string;
  /** The gathering's family, or `""` for a gathering nobody has classified.
   *  Same empty-string sentinel `communitySlug` above uses. */
  gatheringFamily: GatheringFamily | "";
  /** A curated catalog key, `"other"`, or `""` for nothing chosen. */
  format: string;
  /** The host's own words, when `format` is `"other"`. */
  otherText: string;
  /** The family's own questions, answered. `{}` for none. */
  formatDetails: FormatDetails;
}

export function EditDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GatheringDetailsDraft;
  onClose: () => void;
  onSave: (draft: GatheringDetailsDraft) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const myCommunityOptions = useMyCommunityOptions();
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  const [done, setDone] = useState(false);

  const set = <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  // Mirrors `useGatheringForm`'s `setCommunitySlug`: clearing the community
  // while "Community members" is the selected audience scope leaves it
  // pointing at an audience that no longer exists, so fall back to the
  // default ("members", Public) the moment it's cleared. One `setDraft` call
  // (not two separate pieces of state, unlike the wizard) since both fields
  // already live on the same draft object.
  const setCommunitySlug = (value: string) =>
    setDraft((current) => ({
      ...current,
      communitySlug: value,
      visibility:
        !value && current.visibility === "community"
          ? "members"
          : current.visibility,
    }));
  // Reactive to the IN-PROGRESS draft rather than the persisted `initial`
  // value, so picking/clearing a community in this same session immediately
  // shows/hides the "Community members" tier, exactly like the create
  // wizard's `form.communitySlug !== ""`.
  const communityAvailable = draft.communitySlug !== "";
  // Lives in `manageGatheringState` beside the patch builder it gates, so the
  // rule that decides whether a draft may be saved and the code that puts it
  // on the wire cannot drift apart. `EditDetailsSchedule` reads the schedule
  // half of the same rule through `editScheduleProblem`.
  const canSave = canSaveEditDraft(draft);

  const save = () => {
    if (!canSave) return;
    onSave(draft);
    setDone(true);
  };

  if (done) {
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:manage.editModal.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="gatherings:manage.editModal.successSub"
            values={{ title: draft.title }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.editModal.successMeta", {
          count: ATTENDEE_COUNT,
        })}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:manage.editModal.eyebrow")}
      title={t("gatherings:manage.editModal.title")}
      sub={t("gatherings:manage.editModal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {t("gatherings:manage.editModal.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <FormField label={t("gatherings:manage.editModal.fieldTitle")} required>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </FormField>
        {/* Family, format, the host's own words and the family's own
            questions, all four of which move together when the family
            changes. The patch it hands back is merged into the draft here,
            so the coupling between them stays in one place. */}
        <EditDetailsFormat
          draft={draft}
          onChange={(patch) =>
            setDraft((current) => ({ ...current, ...patch }))
          }
        />
        <EditDetailsSchedule
          draft={draft}
          onChangeStartAt={(value) => set("startAt", value)}
          onChangeEndAt={(value) => set("endAt", value)}
        />
        <FormField
          label={t("gatherings:manage.editModal.fieldLocation")}
          required
        >
          <input
            type="text"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
          />
        </FormField>
        <FormField label={t("gatherings:manage.editModal.fieldDescription")}>
          <textarea
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </FormField>
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
        <AudienceScopeField
          fieldId={`${fieldId}-audience`}
          value={draft.visibility}
          onChange={(value) => set("visibility", value)}
          communityAvailable={communityAvailable}
        />
      </div>
    </Modal>
  );
}

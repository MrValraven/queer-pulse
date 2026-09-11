import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditDetailsAudience } from "./EditDetailsAudience";
import { EditDetailsCare } from "./EditDetailsCare";
import { EditDetailsCost } from "./EditDetailsCost";
import { EditDetailsCover } from "./EditDetailsCover";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsFormat } from "./EditDetailsFormat";
import { EditDetailsRsvp } from "./EditDetailsRsvp";
import { EditDetailsSchedule } from "./EditDetailsSchedule";
import { EditDetailsSection } from "./EditDetailsSection";
import { sanitizeThemes } from "./gatheringExtras";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { canSaveEditDraft } from "./manageGatheringState";
import { ATTENDEE_COUNT } from "./manageGathering.data";
import { MAX_DESCRIPTION_STORAGE_LENGTH } from "./steps/whatChapter.data";
import styles from "./GatheringModals.module.css";

// The draft's shape lives in `editDetailsDraft.ts`. Re-exported so the
// sections that read it from the modal keep doing so.
export type { GatheringDetailsDraft };

/**
 * Edit a published gathering in five titled sections: the gathering, when and
 * where, who it is for, taking care, and RSVPs. Each section hands back a
 * partial draft that is merged here, so the modal owns one draft and
 * `buildEditPatch` reads all of it.
 */
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
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  const [done, setDone] = useState(false);

  const set = <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const merge = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  // Family, format, the host's own words and the family's own questions move
  // together when the family changes. A new family also drops the themes its
  // own questions already ask (ruling R6), the rule the wizard applies.
  const mergeFormat = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => {
      const next = { ...current, ...patch };
      return patch.gatheringFamily === undefined
        ? next
        : {
            ...next,
            themes: sanitizeThemes(next.themes, next.gatheringFamily),
          };
    });
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
        <EditDetailsSection
          title={t("gatherings:manage.editModal.section.gathering")}
        >
          <FormField
            label={t("gatherings:manage.editModal.fieldTitle")}
            required
          >
            <input
              type="text"
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
            />
          </FormField>
          <EditDetailsFormat draft={draft} onChange={mergeFormat} />
          <FormField label={t("gatherings:manage.editModal.fieldDescription")}>
            <textarea
              maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </FormField>
          <EditDetailsCover
            coverImageUrl={draft.coverImageUrl}
            onChange={(value) => set("coverImageUrl", value)}
          />
        </EditDetailsSection>
        <EditDetailsSection
          title={t("gatherings:manage.editModal.section.whenWhere")}
        >
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
          <EditDetailsCost
            costKind={draft.costKind}
            cost={draft.cost}
            onChange={merge}
          />
        </EditDetailsSection>
        <EditDetailsAudience draft={draft} onChange={merge} />
        <EditDetailsCare draft={draft} onChange={merge} />
        <EditDetailsRsvp draft={draft} onChange={merge} />
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditOpportunityFields } from "./EditOpportunityFields";
import type { OpportunityEditDraft } from "./volunteerOpportunities.types";

/**
 * The poster's "edit this opportunity" modal, covering the same core fields
 * `PostOpportunityCoreFields` collects at creation (minus the rich optional
 * body: why/tasks/commitments/team aren't editable here) plus the combined
 * organization picker. Mirrors `gatherings/EditDetailsModal`'s shape: a
 * controlled draft, a required-field gate, `onSave` fires once and the
 * parent owns the actual mutation + success/error feedback.
 */
export function EditOpportunityModal({
  initial,
  onClose,
  onSave,
}: {
  initial: OpportunityEditDraft;
  onClose: () => void;
  onSave: (draft: OpportunityEditDraft) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<OpportunityEditDraft>(initial);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof OpportunityEditDraft>(
    key: K,
    value: OpportunityEditDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const spotsNumber = Number.parseInt(draft.spotsTotal, 10);
  const canSave =
    draft.org.trim().length > 0 &&
    draft.role.trim().length > 0 &&
    draft.time.trim().length > 0 &&
    draft.location.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    Number.isFinite(spotsNumber) &&
    spotsNumber > 0;

  const save = () => {
    setSubmitted(true);
    if (!canSave) return;
    onSave(draft);
    onClose();
  };

  return (
    <Modal
      eyebrow={t("marketing:postOpportunity.edit.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:postOpportunity.edit.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("marketing:postOpportunity.edit.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={save}>
            {t("marketing:postOpportunity.edit.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("marketing:postOpportunity.edit.cancelCta")}
          </Button>
        </>
      }
    >
      <EditOpportunityFields draft={draft} set={set} submitted={submitted} />
    </Modal>
  );
}

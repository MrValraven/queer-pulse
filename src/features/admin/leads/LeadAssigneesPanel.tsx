import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState } from "../ui";
import type { LeadDTO, LeadStaffSummaryDTO } from "./api/leads.types";
import {
  useAssignLeadStaff,
  useLeadIsWriting,
  useUnassignLeadStaff,
} from "./api/useLeadMutations";
import { LEAD_ASSIGNEE_PHONE_QUERY } from "./leadAssignees.data";
import { isLeadViewer, leadStaffLabelOf } from "./leadAssignees.model";
import { LeadAssigneeChips } from "./LeadAssigneeChips";
import { LeadAssigneesHeadingRow } from "./LeadAssigneesHeadingRow";
import { LeadAssigneePicker } from "./LeadAssigneePicker";
import { LeadAssigneePopover } from "./LeadAssigneePopover";
import { leadFieldErrorOf, type LeadFieldError } from "./leadForm.model";
import { LeadRefusalLine } from "./LeadRefusalLine";
import { useLeadViewerId } from "./useLeadViewerId";
import adminStyles from "./AdminLead.module.css";
import styles from "./LeadAssigneesPanel.module.css";

type LeadAssigneeWriteKind = "assign" | "unassign";

/**
 * The staff in charge of a lead. With nobody, a line says so. Each person in
 * charge shows as a pill with Unassign; Assign staff, beside the heading,
 * opens the staff picker under the button, or as a sheet on a phone, and it
 * stays open while people are checked and unchecked. Refusals name their cause: in the picker
 * for a pick, under the pills for an Unassign.
 */
export function LeadAssigneesPanel({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const viewerId = useLeadViewerId();
  const isPhone = useMediaQuery(LEAD_ASSIGNEE_PHONE_QUERY);
  const assignButtonRef = useRef<HTMLButtonElement>(null);
  const [isPicking, setIsPicking] = useState(false);
  // Read when a refusal lands, which can be after the picker closed.
  const isPickingRef = useRef(false);
  useEffect(() => {
    isPickingRef.current = isPicking;
  }, [isPicking]);
  const [pickerError, setPickerError] = useState<LeadFieldError | null>(null);
  const [panelError, setPanelError] = useState<LeadFieldError | null>(null);
  const assign = useAssignLeadStaff(lead.id);
  const unassign = useUnassignLeadStaff(lead.id);
  const isWriting = useLeadIsWriting();
  const isBusy = assign.isPending || unassign.isPending || isWriting;
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would send two writes.
  const isSendingRef = useRef(false);

  function toastFor(kind: LeadAssigneeWriteKind, person: LeadStaffSummaryDTO) {
    const isSelf = isLeadViewer(person, viewerId);
    const name = leadStaffLabelOf(person, viewerId, t);
    if (kind === "assign") {
      return isSelf
        ? t("admin:leads.assignees.assignedSelfToast")
        : t("admin:leads.assignees.assignedToast", { name });
    }
    return isSelf
      ? t("admin:leads.assignees.unassignedSelfToast")
      : t("admin:leads.assignees.unassignedToast", { name });
  }

  function write(
    kind: LeadAssigneeWriteKind,
    person: LeadStaffSummaryDTO,
    onError: (cause: unknown) => void,
  ) {
    if (isBusy || isSendingRef.current) return;
    isSendingRef.current = true;
    setPanelError(null);
    setPickerError(null);
    const mutation = kind === "assign" ? assign : unassign;
    mutation.mutate(
      { userId: person.id },
      {
        onSuccess: () => showToast(toastFor(kind, person), "success"),
        onError,
        onSettled: () => {
          isSendingRef.current = false;
        },
      },
    );
  }

  // A refusal shows in the picker while it is open, else under the pills,
  // so its cause is never lost.
  function toggleFromPicker(person: LeadStaffSummaryDTO, isAssigned: boolean) {
    write(isAssigned ? "unassign" : "assign", person, (cause) => {
      const error = leadFieldErrorOf(cause);
      if (isPickingRef.current) setPickerError(error);
      else setPanelError(error);
    });
  }

  function unassignFromChip(person: LeadStaffSummaryDTO) {
    write("unassign", person, (cause) =>
      setPanelError(leadFieldErrorOf(cause)),
    );
  }

  function togglePicker() {
    if (isPicking) {
      setIsPicking(false);
      return;
    }
    setPickerError(null);
    setIsPicking(true);
  }

  function closePicker(shouldRestoreFocus: boolean) {
    setIsPicking(false);
    if (shouldRestoreFocus) assignButtonRef.current?.focus();
  }

  const picker = (
    <LeadAssigneePicker
      assignees={lead.assignees}
      viewerId={viewerId}
      isBusy={isBusy}
      error={pickerError}
      onToggle={toggleFromPicker}
    />
  );
  const pickerLabel = t("admin:leads.assignees.assignCta");

  return (
    <section className={adminStyles.section} aria-labelledby={headingId}>
      <LeadAssigneesHeadingRow
        headingId={headingId}
        assignButtonRef={assignButtonRef}
        isPicking={isPicking}
        onTogglePicker={togglePicker}
      />
      <div className={styles.content}>
        <Collapse isOpen={lead.assignees.length === 0}>
          <AdminEmptyState
            size="inline"
            icon={FiUsers}
            title={t("admin:leads.assignees.none")}
          />
        </Collapse>
        <Collapse isOpen={lead.assignees.length > 0}>
          <LeadAssigneeChips
            assignees={lead.assignees}
            viewerId={viewerId}
            isBusy={isBusy}
            onUnassign={unassignFromChip}
          />
        </Collapse>
        <LeadRefusalLine error={panelError} />
      </div>
      <AnimatePresence initial={false}>
        {isPicking &&
          (isPhone ? (
            <Modal
              key="sheet"
              title={pickerLabel}
              bodyClassName={styles.sheetBody}
              onClose={() => setIsPicking(false)}
              footer={
                <Button variant="ghost" onClick={() => setIsPicking(false)}>
                  {t("admin:leads.assignees.close")}
                </Button>
              }
            >
              {picker}
            </Modal>
          ) : (
            <LeadAssigneePopover
              key="popover"
              anchorRef={assignButtonRef}
              label={pickerLabel}
              onClose={closePicker}
            >
              {picker}
            </LeadAssigneePopover>
          ))}
      </AnimatePresence>
    </section>
  );
}

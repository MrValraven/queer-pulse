import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiUser, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { AdminAvatar, AdminChip } from "../ui";
import {
  leadStaffInitialsOf,
  leadStaffToneOf,
} from "../leads/leadAssignees.model";
import type {
  CulturalStaffSummaryDTO,
  CulturalTaskDTO,
} from "./api/culturalProduction.types";
import {
  useAssignCulturalTask,
  useIsCulturalWriteInFlight,
  useUnassignCulturalTask,
} from "./api/useCulturalTaskMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { CulturalStaffPickerButton } from "./CulturalStaffPickerButton";
import { focusAssignTrigger, refusedAssigneeIdOf } from "./taskForm.model";
import { useCulturalViewerId } from "./useCulturalViewerId";
import styles from "./TaskForm.module.css";

const STAFF_KEY = "admin:culturalProduction.staff";
const CHIP_SECONDS = 0.2;
const CHIP_EASE = [0.22, 0.68, 0.16, 1] as const;

/** "You" for the viewer, else the person's name. */
function culturalStaffNameOf(
  person: CulturalStaffSummaryDTO,
  viewerId: string | null,
  translate: TFunction,
): string {
  return person.id === viewerId
    ? translate(`${STAFF_KEY}.you`)
    : person.displayName;
}

/** One removable pill per person; the one a refusal names is marked. */
export function TaskAssigneeChips({
  people,
  isBusy,
  refusedPersonId = null,
  refusalId,
  onRemove,
  onFocusFallback,
}: {
  people: readonly CulturalStaffSummaryDTO[];
  isBusy: boolean;
  refusedPersonId?: string | null;
  refusalId?: string;
  onRemove: (person: CulturalStaffSummaryDTO) => void;
  /** Focuses Assign staff once the last pill is gone. */
  onFocusFallback: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const viewerId = useCulturalViewerId();
  const transition = {
    duration: reducedMotion ? 0 : CHIP_SECONDS,
    ease: CHIP_EASE,
  };
  const hiddenScale = reducedMotion ? 1 : 0.96;
  const listRef = useRef<HTMLUListElement>(null);
  // The pill whose Remove focus moves to once the removed one is gone: the
  // next, else the previous, else (null) Assign staff.
  const pendingFocusRef = useRef<{
    removedId: string;
    targetId: string | null;
  } | null>(null);

  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (pending === null) return;
    if (people.some((person) => person.id === pending.removedId)) {
      // A refused removal settles with the person still here.
      if (!isBusy) pendingFocusRef.current = null;
      return;
    }
    pendingFocusRef.current = null;
    const target = listRef.current?.querySelector<HTMLElement>(
      `[data-remove-for="${CSS.escape(pending.targetId ?? "")}"]`,
    );
    if (pending.targetId !== null && target) target.focus();
    else onFocusFallback();
  }, [people, isBusy, onFocusFallback]);

  function remove(person: CulturalStaffSummaryDTO, index: number) {
    if (isBusy) return;
    const neighbour = people[index + 1] ?? people[index - 1] ?? null;
    pendingFocusRef.current = {
      removedId: person.id,
      targetId: neighbour?.id ?? null,
    };
    onRemove(person);
  }

  return (
    <ul ref={listRef} className={styles.chipList}>
      <AnimatePresence initial={false}>
        {people.map((person, index) => {
          const isRefused = person.id === refusedPersonId;
          const initials = leadStaffInitialsOf(person.displayName);
          return (
            <m.li
              key={person.id}
              layout={reducedMotion ? false : "position"}
              className={styles.chipItem}
              data-refused={isRefused || undefined}
              initial={{ opacity: 0, scale: hiddenScale }}
              animate={{ opacity: 1, scale: 1, transition }}
              exit={{ opacity: 0, scale: hiddenScale, transition }}
            >
              <AdminChip
                tone={isRefused ? "danger" : "plum"}
                className={styles.chip}
              >
                <AdminAvatar
                  size="sm"
                  src={person.avatarUrl ?? undefined}
                  alt=""
                  initials={initials === "" ? <FiUser /> : initials}
                  tone={leadStaffToneOf(person.id)}
                />
                <span className={styles.chipName}>
                  {culturalStaffNameOf(person, viewerId, t)}
                </span>
                <Button
                  variant="quiet"
                  size="sm"
                  className={styles.chipRemove}
                  aria-label={
                    person.id === viewerId
                      ? t(`${STAFF_KEY}.unassignSelfAria`)
                      : t(`${STAFF_KEY}.unassignAria`, {
                          name: person.displayName,
                        })
                  }
                  data-remove-for={person.id}
                  aria-describedby={isRefused ? refusalId : undefined}
                  aria-disabled={isBusy || undefined}
                  onClick={() => remove(person, index)}
                >
                  <FiX aria-hidden />
                </Button>
              </AdminChip>
            </m.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

type AssigneeWrite = "assign" | "unassign";

/** The drawer's Assigned to: the pills with Unassign and Assign staff. Each
 *  press writes at once, one write at a time; a success toasts and a
 *  refusal names its cause under the pills and in the picker. */
export function TaskDrawerAssignees({ task }: { task: CulturalTaskDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const refusalId = useId();
  const viewerId = useCulturalViewerId();
  const assign = useAssignCulturalTask(task.id);
  const unassign = useUnassignCulturalTask(task.id);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const isBusy = assign.isPending || unassign.isPending || isWriteInFlight;
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick second press would send a second write.
  const isSendingRef = useRef(false);
  const [refusal, setRefusal] = useState<unknown>(null);
  const headRef = useRef<HTMLDivElement>(null);

  function toastFor(kind: AssigneeWrite, person: CulturalStaffSummaryDTO) {
    const isSelf = person.id === viewerId;
    const name = person.displayName;
    if (kind === "assign")
      return isSelf
        ? t(`${STAFF_KEY}.assignedSelfToast`)
        : t(`${STAFF_KEY}.assignedToast`, { name });
    return isSelf
      ? t(`${STAFF_KEY}.unassignedSelfToast`)
      : t(`${STAFF_KEY}.unassignedToast`, { name });
  }

  function write(kind: AssigneeWrite, person: CulturalStaffSummaryDTO) {
    if (isBusy || isSendingRef.current) return;
    isSendingRef.current = true;
    setRefusal(null);
    const mutation = kind === "assign" ? assign : unassign;
    mutation.mutate(
      { userId: person.id },
      {
        onSuccess: () => showToast(toastFor(kind, person), "success"),
        onError: (cause) => setRefusal(cause),
        onSettled: () => {
          isSendingRef.current = false;
        },
      },
    );
  }

  // `isSelected` is whether the person was assigned before the press (the
  // picker's convention): true unassigns them, false assigns them.
  function toggle(person: CulturalStaffSummaryDTO, isSelected: boolean) {
    write(isSelected ? "unassign" : "assign", person);
  }

  return (
    <section className={styles.assignees} aria-labelledby={headingId}>
      <div ref={headRef} className={styles.assigneesHead}>
        <h3 id={headingId} className={styles.assigneesHeading}>
          {t("admin:culturalProduction.tasks.form.assigneesLabel")}
        </h3>
        <CulturalStaffPickerButton
          label={t("admin:culturalProduction.tasks.form.assignCta")}
          selectedPeople={task.assignees}
          onToggle={toggle}
          isBusy={isBusy}
        />
      </div>
      <Collapse isOpen={task.assignees.length === 0}>
        <p className={styles.assigneesNone}>
          {t("admin:culturalProduction.tasks.row.unassigned")}
        </p>
      </Collapse>
      <TaskAssigneeChips
        people={task.assignees}
        isBusy={isBusy}
        refusedPersonId={refusedAssigneeIdOf(refusal)}
        refusalId={refusalId}
        onRemove={(person) => write("unassign", person)}
        onFocusFallback={() => focusAssignTrigger(headRef.current)}
      />
      <CulturalRefusalLine error={refusal} id={refusalId} />
    </section>
  );
}

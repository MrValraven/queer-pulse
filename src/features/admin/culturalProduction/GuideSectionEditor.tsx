import { AnimatePresence } from "motion/react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  FormField,
  IconButton,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPanel } from "../ui";
import {
  CULTURAL_GUIDE_SECTION_STEPS_MAX,
  CULTURAL_GUIDE_STEPS_MAX,
} from "./api/culturalProduction.types";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  sectionControlId,
  type GuideFieldTarget,
  type GuideMoveDirection,
  type GuideSectionControl,
  type GuideSectionDraft,
  type GuideStepDraft,
} from "./guideEditor.model";
import { GuideStepEditor } from "./GuideStepEditor";
import styles from "./GuideEditor.module.css";

const KEY = "admin:culturalProduction.guides.editor";

/** What a section editor asks of the guide editor, by index. */
export interface GuideSectionHandlers {
  updateSection: (
    sectionIndex: number,
    changes: Partial<Pick<GuideSectionDraft, "heading" | "body">>,
  ) => void;
  moveSection: (sectionIndex: number, direction: GuideMoveDirection) => void;
  removeSection: (sectionIndex: number) => void;
  addStep: (sectionIndex: number) => void;
  updateStep: (
    sectionIndex: number,
    stepIndex: number,
    changes: Partial<Pick<GuideStepDraft, "text" | "daysText">>,
  ) => void;
  moveStep: (
    sectionIndex: number,
    stepIndex: number,
    direction: GuideMoveDirection,
  ) => void;
  removeStep: (sectionIndex: number, stepIndex: number) => void;
}

/** Move the section up or down, or remove it, in the panel header. */
function SectionActions({
  controlId,
  sectionIndex,
  sectionCount,
  isDisabled,
  onMove,
  onRemove,
}: {
  controlId: (control: GuideSectionControl) => string;
  sectionIndex: number;
  sectionCount: number;
  isDisabled: boolean;
  onMove: (direction: GuideMoveDirection) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rowActions}>
      <IconButton
        id={controlId("moveUp")}
        size="sm"
        aria-label={t(`${KEY}.moveSectionUpCta`)}
        tooltip
        disabled={isDisabled || sectionIndex === 0}
        onClick={() => onMove("up")}
      >
        <FiArrowUp aria-hidden />
      </IconButton>
      <IconButton
        id={controlId("moveDown")}
        size="sm"
        aria-label={t(`${KEY}.moveSectionDownCta`)}
        tooltip
        disabled={isDisabled || sectionIndex === sectionCount - 1}
        onClick={() => onMove("down")}
      >
        <FiArrowDown aria-hidden />
      </IconButton>
      <IconButton
        id={controlId("remove")}
        size="sm"
        aria-label={t(`${KEY}.removeSectionCta`)}
        tooltip
        disabled={isDisabled}
        onClick={onRemove}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
    </div>
  );
}

/**
 * One section: its heading, its text (with the body format hint) and its
 * checklist, in a panel whose header moves the section up or down or
 * removes it. Steps grow in and fold away. A refusal that names this section
 * or one of its steps shows beside the field it names.
 */
export function GuideSectionEditor({
  idPrefix,
  section,
  sectionIndex,
  sectionCount,
  guideStepCount,
  refusal,
  target,
  isDisabled,
  handlers,
}: {
  idPrefix: string;
  section: GuideSectionDraft;
  sectionIndex: number;
  sectionCount: number;
  guideStepCount: number;
  refusal: unknown;
  target: GuideFieldTarget | null;
  isDisabled: boolean;
  handlers: GuideSectionHandlers;
}) {
  const { t } = useTranslation();
  const controlId = (control: GuideSectionControl) =>
    sectionControlId(idPrefix, section.key, control);
  const sectionTarget =
    refusal !== null && target !== null && target.sectionIndex === sectionIndex
      ? target
      : null;
  const refusalFor = (field: GuideFieldTarget["field"]) =>
    sectionTarget?.field === field ? refusal : null;
  const headingRefusal = refusalFor("heading");
  const bodyRefusal = refusalFor("body");
  const daysHintId = `${controlId("addStep")}-days-hint`;
  const isStepLimitReached =
    section.steps.length >= CULTURAL_GUIDE_SECTION_STEPS_MAX ||
    guideStepCount >= CULTURAL_GUIDE_STEPS_MAX;

  return (
    <AdminPanel
      as="div"
      title={t(`${KEY}.sectionLabel`, { number: sectionIndex + 1 })}
      actions={
        <SectionActions
          controlId={controlId}
          sectionIndex={sectionIndex}
          sectionCount={sectionCount}
          isDisabled={isDisabled}
          onMove={(direction) => handlers.moveSection(sectionIndex, direction)}
          onRemove={() => handlers.removeSection(sectionIndex)}
        />
      }
      bodyClassName={styles.sectionBody}
    >
      <div className={styles.fieldBlock}>
        <FormField
          label={t(`${KEY}.headingLabel`)}
          required
          className={styles.field}
        >
          <input
            id={controlId("heading")}
            type="text"
            value={section.heading}
            disabled={isDisabled}
            aria-describedby={
              headingRefusal === null
                ? undefined
                : `${controlId("heading")}-refusal`
            }
            aria-invalid={headingRefusal !== null || undefined}
            onChange={(event) =>
              handlers.updateSection(sectionIndex, {
                heading: event.target.value,
              })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={headingRefusal}
          id={`${controlId("heading")}-refusal`}
        />
      </div>
      <div className={styles.fieldBlock}>
        <FormField
          label={t(`${KEY}.bodyLabel`)}
          helper={t(`${KEY}.bodyHint`)}
          className={styles.field}
        >
          <textarea
            id={controlId("body")}
            rows={6}
            value={section.body}
            disabled={isDisabled}
            aria-describedby={
              bodyRefusal === null ? undefined : `${controlId("body")}-refusal`
            }
            aria-invalid={bodyRefusal !== null || undefined}
            onChange={(event) =>
              handlers.updateSection(sectionIndex, { body: event.target.value })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={bodyRefusal}
          id={`${controlId("body")}-refusal`}
        />
      </div>
      <div className={styles.checklist}>
        <h3 className={styles.checklistHeading}>{t(`${KEY}.stepsHeading`)}</h3>
        <Collapse isOpen={section.steps.length > 0}>
          <p id={daysHintId} className={styles.hint}>
            {t(`${KEY}.stepDaysHint`)}
          </p>
        </Collapse>
        <ol className={styles.stepList}>
          <AnimatePresence initial={false}>
            {section.steps.map((step, stepIndex) => {
              const stepField =
                sectionTarget?.stepIndex === stepIndex
                  ? sectionTarget.field
                  : null;
              return (
                <CollapseListItem key={step.key}>
                  <GuideStepEditor
                    idPrefix={idPrefix}
                    step={step}
                    stepIndex={stepIndex}
                    stepCount={section.steps.length}
                    daysHintId={daysHintId}
                    refusal={stepField === null ? null : refusal}
                    refusalField={stepField}
                    isDisabled={isDisabled}
                    onChange={(changes) =>
                      handlers.updateStep(sectionIndex, stepIndex, changes)
                    }
                    onMove={(direction) =>
                      handlers.moveStep(sectionIndex, stepIndex, direction)
                    }
                    onRemove={() =>
                      handlers.removeStep(sectionIndex, stepIndex)
                    }
                  />
                </CollapseListItem>
              );
            })}
          </AnimatePresence>
        </ol>
        <div>
          <Button
            id={controlId("addStep")}
            variant="ghost"
            size="sm"
            disabled={isDisabled || isStepLimitReached}
            onClick={() => handlers.addStep(sectionIndex)}
          >
            <FiPlus aria-hidden />
            {t(`${KEY}.addStepCta`)}
          </Button>
        </div>
        <CulturalRefusalLine error={refusalFor("steps")} />
      </div>
    </AdminPanel>
  );
}

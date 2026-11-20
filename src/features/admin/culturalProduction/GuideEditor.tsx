import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_GUIDE_SECTIONS_MAX,
  CULTURAL_GUIDE_STEPS_MAX,
  culturalReasonOf,
  type CulturalGuideDTO,
} from "./api/culturalProduction.types";
import { culturalKeys } from "./api/culturalProductionKeys";
import {
  useIsCulturalWriteInFlight,
  useReplaceCulturalGuide,
} from "./api/useCulturalGuideMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  bodyFromDraft,
  draftFromGuide,
  GUIDE_META_CONTROL,
  guideDraftReducer,
  isDraftChanged,
  localIssuesOf,
  newDraftKey,
  refusalOfIssue,
  refusalTargetOf,
  sectionControlId,
  stepControlId,
  stepCountOf,
  targetControlId,
  type GuideDraft,
  type GuideDraftAction,
  type GuideDraftMeta,
  type GuideMoveDirection,
} from "./guideEditor.model";
import { GuideEditorMeta } from "./GuideEditorMeta";
import {
  GuideSectionEditor,
  type GuideSectionHandlers,
} from "./GuideSectionEditor";
import styles from "./GuideEditor.module.css";

const KEY = "admin:culturalProduction.guides.editor";

/** The controls to focus after the next render, first enabled one wins. */
interface FocusRequest {
  ids: string[];
  shouldScroll: boolean;
}

/** The same move control on the moved row, or the other one once the row
 *  reaches an edge and this one turns disabled. */
function moveFocusIds(
  controlIdOf: (control: "moveUp" | "moveDown") => string,
  direction: GuideMoveDirection,
): string[] {
  return direction === "up"
    ? [controlIdOf("moveUp"), controlIdOf("moveDown")]
    : [controlIdOf("moveDown"), controlIdOf("moveUp")];
}

/** Every draft change, each clearing the shown refusal and placing focus:
 *  on the new heading or step after an add, on the control before the row
 *  after a remove, and on the moved row's move control after a move. */
function useGuideDraftHandlers({
  idPrefix,
  draft,
  dispatch,
  requestFocus,
  onChange,
}: {
  idPrefix: string;
  draft: GuideDraft;
  dispatch: Dispatch<GuideDraftAction>;
  requestFocus: (request: FocusRequest) => void;
  onChange: () => void;
}): GuideSectionHandlers & {
  setMeta: (meta: Partial<GuideDraftMeta>) => void;
  addSection: () => void;
} {
  const send = (action: GuideDraftAction, focusIds?: string[]) => {
    dispatch(action);
    onChange();
    if (focusIds) requestFocus({ ids: focusIds, shouldScroll: false });
  };
  const sectionKeyAt = (sectionIndex: number) =>
    draft.sections[sectionIndex]?.key ?? "";
  const stepKeyAt = (sectionIndex: number, stepIndex: number) =>
    draft.sections[sectionIndex]?.steps[stepIndex]?.key ?? "";
  return {
    setMeta: (meta) => send({ type: "setMeta", meta }),
    addSection: () => {
      const key = newDraftKey();
      send({ type: "addSection", key }, [
        sectionControlId(idPrefix, key, "heading"),
      ]);
    },
    updateSection: (sectionIndex, changes) =>
      send({ type: "updateSection", sectionIndex, changes }),
    moveSection: (sectionIndex, direction) => {
      const key = sectionKeyAt(sectionIndex);
      send(
        { type: "moveSection", sectionIndex, direction },
        moveFocusIds(
          (control) => sectionControlId(idPrefix, key, control),
          direction,
        ),
      );
    },
    removeSection: (sectionIndex) => {
      const previousKey = draft.sections[sectionIndex - 1]?.key;
      send(
        { type: "removeSection", sectionIndex },
        previousKey === undefined
          ? [`${idPrefix}-${GUIDE_META_CONTROL.summary}`]
          : [
              sectionControlId(idPrefix, previousKey, "addStep"),
              sectionControlId(idPrefix, previousKey, "heading"),
            ],
      );
    },
    addStep: (sectionIndex) => {
      const key = newDraftKey();
      send({ type: "addStep", sectionIndex, key }, [
        stepControlId(idPrefix, key, "text"),
      ]);
    },
    updateStep: (sectionIndex, stepIndex, changes) =>
      send({ type: "updateStep", sectionIndex, stepIndex, changes }),
    moveStep: (sectionIndex, stepIndex, direction) => {
      const key = stepKeyAt(sectionIndex, stepIndex);
      send(
        { type: "moveStep", sectionIndex, stepIndex, direction },
        moveFocusIds(
          (control) => stepControlId(idPrefix, key, control),
          direction,
        ),
      );
    },
    removeStep: (sectionIndex, stepIndex) => {
      const previousKey =
        draft.sections[sectionIndex]?.steps[stepIndex - 1]?.key;
      send(
        { type: "removeStep", sectionIndex, stepIndex },
        previousKey === undefined
          ? [sectionControlId(idPrefix, sectionKeyAt(sectionIndex), "body")]
          : [stepControlId(idPrefix, previousKey, "remove")],
      );
    },
  };
}

/** Moves focus once the render that made the requested control lands: the
 *  first id on the page whose control is enabled wins. */
function useFocusAfterRender() {
  const { reducedMotion } = useMotionPrefs();
  const request = useRef<FocusRequest | null>(null);
  useEffect(() => {
    const pending = request.current;
    if (pending === null) return;
    request.current = null;
    const element = pending.ids
      .map((id) => document.getElementById(id))
      .find(
        (candidate) =>
          candidate !== null &&
          !(candidate instanceof HTMLButtonElement && candidate.disabled),
      );
    if (!element) return;
    if (pending.shouldScroll)
      element.scrollIntoView({
        block: "center",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    element.focus({ preventScroll: pending.shouldScroll });
  });
  return (next: FocusRequest) => {
    request.current = next;
  };
}

/** Save guide and Cancel, with the line for a refusal that names no field
 *  and, after an edit conflict, "Load the latest version". */
function GuideEditorFoot({
  refusal,
  isConflict,
  isSaving,
  isWriting,
  onReload,
  onSave,
  onCancel,
}: {
  refusal: unknown;
  isConflict: boolean;
  isSaving: boolean;
  isWriting: boolean;
  onReload: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.foot}>
      <CulturalRefusalLine error={refusal} />
      <Collapse isOpen={isConflict}>
        <div className={styles.footReload}>
          <Button variant="ghost" size="sm" onClick={onReload}>
            {t(`${KEY}.reloadLatestCta`)}
          </Button>
        </div>
      </Collapse>
      <div className={styles.footActions}>
        <Button variant="ghost" onClick={onCancel}>
          {t("admin:culturalProduction.common.cancel")}
        </Button>
        <Button
          variant="primary"
          aria-disabled={isWriting || undefined}
          onClick={onSave}
        >
          {isSaving
            ? t("admin:culturalProduction.common.saving")
            : t(`${KEY}.saveCta`)}
        </Button>
      </div>
    </div>
  );
}

/**
 * The guide editor: title, event type, language and summary, then each
 * section with its heading, text and checklist, and "Add section" at the
 * end. Save guide sends the whole guide with the revision the edit started
 * from; a refusal shows beside the field it names and scrolls it into view.
 * When someone else saved first, the line by Save offers "Load the latest
 * version". Cancel with changes asks before discarding them.
 */
export function GuideEditor({
  guide,
  onDone,
}: {
  guide: CulturalGuideDTO;
  onDone: (saved: CulturalGuideDTO | null) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const idPrefix = `guide-editor-${useId()}`;
  const [startedFrom] = useState(guide);
  const [draft, dispatch] = useReducer(
    guideDraftReducer,
    guide,
    draftFromGuide,
  );
  const [refusal, setRefusal] = useState<unknown>(null);
  const [pendingLeave, setPendingLeave] = useState<"cancel" | "reload" | null>(
    null,
  );
  const replaceGuide = useReplaceCulturalGuide(guide.id);
  const isWriting = useIsCulturalWriteInFlight();
  const requestFocus = useFocusAfterRender();
  const handlers = useGuideDraftHandlers({
    idPrefix,
    draft,
    dispatch,
    requestFocus,
    onChange: () => setRefusal(null),
  });
  const target = refusal === null ? null : refusalTargetOf(refusal, draft);
  const isConflict =
    culturalReasonOf(refusal) === "CULTURAL_GUIDE_EDIT_CONFLICT";
  const guideStepCount = stepCountOf(draft);
  const titleId = `${idPrefix}-${GUIDE_META_CONTROL.title}`;

  // Links, the rail, browser Back and closing the tab ask before dropping
  // unsaved changes; a save in flight leaves freely.
  useUnsavedChangesGuard({
    active: isDraftChanged(draft, startedFrom) && !replaceGuide.isPending,
    confirmMessage: t(`${KEY}.discardTitle`),
    guardBackButton: true,
  });

  // The editor opens on the guide's title.
  useEffect(() => {
    document.getElementById(titleId)?.focus();
  }, [titleId]);

  const showRefusal = (cause: unknown) => {
    setRefusal(cause);
    const controlId = targetControlId(
      idPrefix,
      refusalTargetOf(cause, draft),
      draft,
    );
    if (controlId !== null)
      requestFocus({ ids: [controlId], shouldScroll: true });
  };

  const save = () => {
    if (isWriting) return;
    if (!isDraftChanged(draft, startedFrom)) {
      onDone(guide);
      return;
    }
    const firstIssue = localIssuesOf(draft)[0];
    if (firstIssue !== undefined) {
      showRefusal(refusalOfIssue(firstIssue));
      return;
    }
    setRefusal(null);
    replaceGuide.mutate(bodyFromDraft(draft, startedFrom.revision), {
      onSuccess: (saved) => {
        showToast(t(`${KEY}.savedToast`), "success");
        onDone(saved);
      },
      onError: (cause) => showRefusal(cause),
    });
  };

  const cancel = () => {
    if (isDraftChanged(draft, startedFrom)) setPendingLeave("cancel");
    else onDone(null);
  };

  const discard = () => {
    if (pendingLeave === "reload") {
      void queryClient.invalidateQueries({
        queryKey: culturalKeys.guide(guide.id, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: culturalKeys.guidesRoot });
    }
    setPendingLeave(null);
    onDone(null);
  };

  return (
    <div className={styles.editor}>
      <GuideEditorMeta
        idPrefix={idPrefix}
        meta={draft}
        refusal={refusal}
        refusalField={target?.field ?? null}
        isDisabled={isWriting}
        onChange={handlers.setMeta}
      />
      <section
        className={styles.sections}
        aria-labelledby={`${idPrefix}-sections-heading`}
      >
        <div className={styles.sectionsHead}>
          <h2
            id={`${idPrefix}-sections-heading`}
            className={styles.sectionsTitle}
          >
            {t(`${KEY}.sectionsHeading`)}
          </h2>
          <p className={styles.hint}>
            {t(`${KEY}.stepsTotal`, {
              count: guideStepCount,
              max: CULTURAL_GUIDE_STEPS_MAX,
            })}
          </p>
        </div>
        <ul className={styles.sectionList}>
          <AnimatePresence initial={false}>
            {draft.sections.map((section, sectionIndex) => (
              <CollapseListItem key={section.key}>
                <GuideSectionEditor
                  idPrefix={idPrefix}
                  section={section}
                  sectionIndex={sectionIndex}
                  sectionCount={draft.sections.length}
                  guideStepCount={guideStepCount}
                  refusal={refusal}
                  target={target}
                  isDisabled={isWriting}
                  handlers={handlers}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
        <div>
          <Button
            variant="ghost"
            disabled={
              isWriting || draft.sections.length >= CULTURAL_GUIDE_SECTIONS_MAX
            }
            onClick={handlers.addSection}
          >
            <FiPlus aria-hidden />
            {t(`${KEY}.addSectionCta`)}
          </Button>
        </div>
      </section>
      <GuideEditorFoot
        refusal={target?.field === "foot" ? refusal : null}
        isConflict={isConflict}
        isSaving={replaceGuide.isPending}
        isWriting={isWriting}
        onReload={() => setPendingLeave("reload")}
        onSave={save}
        onCancel={cancel}
      />
      <ConfirmDialog
        open={pendingLeave !== null}
        onClose={() => setPendingLeave(null)}
        onConfirm={discard}
        title={t(`${KEY}.discardTitle`)}
        description={t(`${KEY}.discardBody`)}
        confirmLabel={t(`${KEY}.discardCta`)}
        cancelLabel={t(`${KEY}.keepEditingCta`)}
        tone="destructive"
      />
    </div>
  );
}

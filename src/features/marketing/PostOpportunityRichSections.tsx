import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  defaultApplyRole,
  type PostOpportunityForm,
} from "./usePostOpportunityForm";
import { useTeamMemberOptions } from "./useTeamMemberOptions";
import { PostOpportunityInlineTextarea } from "./PostOpportunityInlineTextarea";
import {
  MAX_APPLY_ROLE_LENGTH,
  MAX_COMMITMENT_DETAIL_LENGTH,
  MAX_COMMITMENT_LABEL_LENGTH,
  MAX_HANDLE_LENGTH,
  MAX_TASK_DESCRIPTION_LENGTH,
  MAX_TASK_TITLE_LENGTH,
  MAX_TEAM_COUNT,
  MAX_TEAM_INTRO_LENGTH,
  MAX_TEAM_SLUG_LENGTH,
  commitmentLabelControlId,
  taskTitleControlId,
} from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Counters stay hidden until the row is focused, except when a field is
 *  within a tenth of its limit: then it stays visible as a warning. */
const isNearLimit = (length: number, max: number) => length >= max * 0.9;

/** The pair of counters under an inline row. `isPinned` keeps them visible
 *  outside focus. */
function InlineCounters({
  first,
  second,
  isPinned,
}: {
  first: string;
  second: string;
  isPinned: boolean;
}) {
  return (
    <div
      className={
        isPinned
          ? `${styles.inlineMeta} ${styles.inlineMetaPinned}`
          : styles.inlineMeta
      }
    >
      <span>{first}</span>
      <span>{second}</span>
    </div>
  );
}

/** Repeating "what you'd actually do" task rows, laid out as the tick list
 *  the detail page renders so the poster types straight into it. */
export function PostOpportunityTasks({ form }: { form: PostOpportunityForm }) {
  const { t } = useTranslation();
  const { state, setTask, addTask, removeTask, isTaskTitleMissing } = form;

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.tasksHeading")}
      </div>
      <div className={styles.taskList}>
        {state.tasks.map((task, index) => (
          <div className={styles.taskEditRow} key={index}>
            <div className={styles.taskEditIcon} aria-hidden>
              <FiCheck />
            </div>
            <div className={styles.taskEditFields}>
              <input
                id={taskTitleControlId(index)}
                type="text"
                className={styles.taskEditTitle}
                value={task.title}
                onChange={(e) => setTask(index, { title: e.target.value })}
                /* A row is only sent when it has a title, so a detail typed
                   under an empty one is flagged here rather than silently
                   dropped. This is also what a rejected submit's focus move
                   looks for. */
                aria-invalid={isTaskTitleMissing(index)}
                maxLength={MAX_TASK_TITLE_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskTitlePlaceholder",
                )}
                aria-label={t("marketing:postOpportunity.rich.taskTitleAria", {
                  index: index + 1,
                })}
              />
              <PostOpportunityInlineTextarea
                className={styles.taskEditDetail}
                value={task.description}
                onValueChange={(description) => setTask(index, { description })}
                maxLength={MAX_TASK_DESCRIPTION_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskDetailPlaceholder",
                )}
                aria-label={t("marketing:postOpportunity.rich.taskDetailAria", {
                  index: index + 1,
                })}
              />
              <InlineCounters
                first={`${task.title.length}/${MAX_TASK_TITLE_LENGTH}`}
                second={`${task.description.length}/${MAX_TASK_DESCRIPTION_LENGTH}`}
                isPinned={
                  isNearLimit(task.title.length, MAX_TASK_TITLE_LENGTH) ||
                  isNearLimit(
                    task.description.length,
                    MAX_TASK_DESCRIPTION_LENGTH,
                  )
                }
              />
            </div>
            {state.tasks.length > 1 && (
              <button
                type="button"
                className={styles.inlineRemove}
                onClick={() => removeTask(index)}
                aria-label={t("marketing:postOpportunity.rich.taskRemoveAria", {
                  index: index + 1,
                })}
              >
                <FiX aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className={styles.repAdd} onClick={addTask}>
        <FiPlus aria-hidden /> {t("marketing:postOpportunity.rich.addTask")}
      </button>
    </>
  );
}

/** Repeating honest-commitment cards (hours, cadence, duration…), laid out
 *  as the two-column card grid the detail page renders. */
export function PostOpportunityCommitments({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const {
    state,
    setCommitment,
    addCommitment,
    removeCommitment,
    isCommitmentLabelMissing,
  } = form;

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.commitmentsHeading")}
      </div>
      <div className={styles.commitEditGrid}>
        {state.commitments.map((commitment, index) => (
          <div className={styles.commitEditCard} key={index}>
            <input
              id={commitmentLabelControlId(index)}
              type="text"
              className={styles.commitEditLabel}
              value={commitment.label}
              onChange={(e) => setCommitment(index, { label: e.target.value })}
              aria-invalid={isCommitmentLabelMissing(index)}
              maxLength={MAX_COMMITMENT_LABEL_LENGTH}
              placeholder={t(
                "marketing:postOpportunity.rich.commitLabelPlaceholder",
              )}
              aria-label={t("marketing:postOpportunity.rich.commitLabelAria", {
                index: index + 1,
              })}
            />
            <PostOpportunityInlineTextarea
              className={styles.commitEditDetail}
              value={commitment.detail}
              onValueChange={(detail) => setCommitment(index, { detail })}
              maxLength={MAX_COMMITMENT_DETAIL_LENGTH}
              placeholder={t(
                "marketing:postOpportunity.rich.commitDetailPlaceholder",
              )}
              aria-label={t("marketing:postOpportunity.rich.commitDetailAria", {
                index: index + 1,
              })}
            />
            <InlineCounters
              first={`${commitment.label.length}/${MAX_COMMITMENT_LABEL_LENGTH}`}
              second={`${commitment.detail.length}/${MAX_COMMITMENT_DETAIL_LENGTH}`}
              isPinned={
                isNearLimit(
                  commitment.label.length,
                  MAX_COMMITMENT_LABEL_LENGTH,
                ) ||
                isNearLimit(
                  commitment.detail.length,
                  MAX_COMMITMENT_DETAIL_LENGTH,
                )
              }
            />
            {state.commitments.length > 1 && (
              <button
                type="button"
                className={`${styles.inlineRemove} ${styles.commitEditRemove}`}
                onClick={() => removeCommitment(index)}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitRemoveAria",
                  { index: index + 1 },
                )}
              >
                <FiX aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className={styles.repAdd} onClick={addCommitment}>
        <FiPlus aria-hidden />{" "}
        {t("marketing:postOpportunity.rich.addCommitment")}
      </button>
    </>
  );
}

/** Team intro, who applies to, partner slug, and contact handle. The team
 *  picker and contact handle are creation-only (`UpdateOpportunityDto` can't
 *  update them) so `editing` hides both in the edit flow. */
export function PostOpportunityTeamFields({
  form,
  editing = false,
}: {
  form: PostOpportunityForm;
  editing?: boolean;
}) {
  const { t } = useTranslation();
  const { state, set } = form;
  const teamOptions = useTeamMemberOptions();

  // Live preview of the submit-time fallback ("Role · Org") until the poster
  // types their own apply-as label — see `defaultApplyRole`.
  const applyRoleValue =
    state.applyRole || defaultApplyRole(state.role, state.org);

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.teamHeading")}
      </div>
      <FormField
        label={t("marketing:postOpportunity.rich.teamIntroLabel")}
        labelAside={`${state.teamIntro.length}/${MAX_TEAM_INTRO_LENGTH}`}
      >
        <input
          type="text"
          value={state.teamIntro}
          onChange={(e) => set("teamIntro", e.target.value)}
          maxLength={MAX_TEAM_INTRO_LENGTH}
          placeholder={t("marketing:postOpportunity.rich.teamIntroPlaceholder")}
        />
      </FormField>

      {!editing && (
        <FormField
          label={t("marketing:postOpportunity.rich.teamLabel")}
          helper={t("marketing:postOpportunity.rich.teamHelper", {
            maxCount: MAX_TEAM_COUNT,
            maxLength: MAX_TEAM_SLUG_LENGTH,
          })}
        >
          <Select
            multiple
            options={teamOptions}
            value={state.team}
            onChange={(value) => set("team", value)}
            placeholder={t("marketing:postOpportunity.rich.teamPlaceholder")}
            emptyText={t("marketing:postOpportunity.rich.teamEmpty")}
          />
        </FormField>
      )}

      {/* The organization this opportunity is attributed to is picked once,
          in Basics, through `OrganizationPickerField`: the single control
          that sets exactly one of `partnerSlug`/`communitySlug` and clears
          the other. No second slug field here. The free-text one that used
          to sit beside "Apply-as role label" only ever edited `partnerSlug`,
          so it read empty for a community link, and typing in it left both
          links set at once (the backend resolves the two independently). */}
      <FormField
        label={t("marketing:postOpportunity.rich.applyRoleLabel")}
        helper={t("marketing:postOpportunity.rich.applyRoleHelper")}
        labelAside={`${state.applyRole.length}/${MAX_APPLY_ROLE_LENGTH}`}
      >
        <input
          type="text"
          value={applyRoleValue}
          onChange={(e) => set("applyRole", e.target.value)}
          maxLength={MAX_APPLY_ROLE_LENGTH}
          placeholder={t("marketing:postOpportunity.rich.applyRolePlaceholder")}
        />
      </FormField>

      {!editing && (
        <FormField
          label={t("marketing:postOpportunity.rich.handleLabel")}
          helper={t("marketing:postOpportunity.rich.handleHelper")}
          labelAside={`${state.handle.length}/${MAX_HANDLE_LENGTH}`}
        >
          <input
            type="text"
            value={state.handle}
            onChange={(e) => set("handle", e.target.value)}
            maxLength={MAX_HANDLE_LENGTH}
            placeholder={t("marketing:postOpportunity.rich.handlePlaceholder")}
          />
        </FormField>
      )}
    </>
  );
}

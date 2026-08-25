import { FiPlus, FiX } from "react-icons/fi";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  defaultApplyRole,
  type PostOpportunityForm,
} from "./usePostOpportunityForm";
import { useTeamMemberOptions } from "./useTeamMemberOptions";
import {
  MAX_APPLY_ROLE_LENGTH,
  MAX_COMMITMENT_DETAIL_LENGTH,
  MAX_COMMITMENT_LABEL_LENGTH,
  MAX_HANDLE_LENGTH,
  MAX_PARTNER_SLUG_LENGTH,
  MAX_TASK_DESCRIPTION_LENGTH,
  MAX_TASK_TITLE_LENGTH,
  MAX_TEAM_COUNT,
  MAX_TEAM_INTRO_LENGTH,
  MAX_TEAM_SLUG_LENGTH,
} from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Repeating "what you'd actually do" task rows. */
export function PostOpportunityTasks({ form }: { form: PostOpportunityForm }) {
  const { t } = useTranslation();
  const { state, setTask, addTask, removeTask } = form;

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.tasksHeading")}
      </div>
      {state.tasks.map((task, index) => (
        <div className={styles.repRow} key={index}>
          <div className={styles.repFields}>
            <div className={styles.repFieldItem}>
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask(index, { title: e.target.value })}
                maxLength={MAX_TASK_TITLE_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskTitlePlaceholder",
                )}
                aria-label={t("marketing:postOpportunity.rich.taskTitleAria", {
                  index: index + 1,
                })}
              />
              <span className={styles.repFieldCount}>
                {task.title.length}/{MAX_TASK_TITLE_LENGTH}
              </span>
            </div>
            <div className={styles.repFieldItem}>
              <input
                type="text"
                value={task.description}
                onChange={(e) =>
                  setTask(index, { description: e.target.value })
                }
                maxLength={MAX_TASK_DESCRIPTION_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskDetailPlaceholder",
                )}
                aria-label={t("marketing:postOpportunity.rich.taskDetailAria", {
                  index: index + 1,
                })}
              />
              <span className={styles.repFieldCount}>
                {task.description.length}/{MAX_TASK_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
          {state.tasks.length > 1 && (
            <button
              type="button"
              className={styles.repRemove}
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
      <button type="button" className={styles.repAdd} onClick={addTask}>
        <FiPlus aria-hidden /> {t("marketing:postOpportunity.rich.addTask")}
      </button>
    </>
  );
}

/** Repeating honest-commitment rows (hours, cadence, duration…). */
export function PostOpportunityCommitments({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const { state, setCommitment, addCommitment, removeCommitment } = form;

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.rich.commitmentsHeading")}
      </div>
      {state.commitments.map((commitment, index) => (
        <div className={styles.repRow} key={index}>
          <div className={styles.repFields}>
            <div className={styles.repFieldItem}>
              <input
                type="text"
                value={commitment.label}
                onChange={(e) =>
                  setCommitment(index, { label: e.target.value })
                }
                maxLength={MAX_COMMITMENT_LABEL_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.commitLabelPlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitLabelAria",
                  { index: index + 1 },
                )}
              />
              <span className={styles.repFieldCount}>
                {commitment.label.length}/{MAX_COMMITMENT_LABEL_LENGTH}
              </span>
            </div>
            <div className={styles.repFieldItem}>
              <input
                type="text"
                value={commitment.detail}
                onChange={(e) =>
                  setCommitment(index, { detail: e.target.value })
                }
                maxLength={MAX_COMMITMENT_DETAIL_LENGTH}
                placeholder={t(
                  "marketing:postOpportunity.rich.commitDetailPlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitDetailAria",
                  { index: index + 1 },
                )}
              />
              <span className={styles.repFieldCount}>
                {commitment.detail.length}/{MAX_COMMITMENT_DETAIL_LENGTH}
              </span>
            </div>
          </div>
          {state.commitments.length > 1 && (
            <button
              type="button"
              className={styles.repRemove}
              onClick={() => removeCommitment(index)}
              aria-label={t("marketing:postOpportunity.rich.commitRemoveAria", {
                index: index + 1,
              })}
            >
              <FiX aria-hidden />
            </button>
          )}
        </div>
      ))}
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

      <div className={styles.row}>
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
            placeholder={t(
              "marketing:postOpportunity.rich.applyRolePlaceholder",
            )}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.rich.partnerSlugLabel")}
          helper={t("marketing:postOpportunity.rich.partnerSlugHelper")}
          labelAside={`${state.partnerSlug.length}/${MAX_PARTNER_SLUG_LENGTH}`}
        >
          <input
            type="text"
            value={state.partnerSlug}
            onChange={(e) => set("partnerSlug", e.target.value)}
            maxLength={MAX_PARTNER_SLUG_LENGTH}
            placeholder={t(
              "marketing:postOpportunity.rich.partnerSlugPlaceholder",
            )}
          />
        </FormField>
      </div>

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

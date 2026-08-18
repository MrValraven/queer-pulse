import { FiPlus, FiX } from "react-icons/fi";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { defaultApplyRole, type PostOpportunityForm } from "./usePostOpportunityForm";
import { useTeamMemberOptions } from "./useTeamMemberOptions";
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
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask(index, { title: e.target.value })}
              placeholder={t(
                "marketing:postOpportunity.rich.taskTitlePlaceholder",
              )}
              aria-label={t("marketing:postOpportunity.rich.taskTitleAria", {
                index: index + 1,
              })}
            />
            <input
              type="text"
              value={task.description}
              onChange={(e) => setTask(index, { description: e.target.value })}
              placeholder={t(
                "marketing:postOpportunity.rich.taskDetailPlaceholder",
              )}
              aria-label={t("marketing:postOpportunity.rich.taskDetailAria", {
                index: index + 1,
              })}
            />
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
            <input
              type="text"
              value={commitment.label}
              onChange={(e) =>
                setCommitment(index, { label: e.target.value })
              }
              placeholder={t(
                "marketing:postOpportunity.rich.commitLabelPlaceholder",
              )}
              aria-label={t("marketing:postOpportunity.rich.commitLabelAria", {
                index: index + 1,
              })}
            />
            <input
              type="text"
              value={commitment.detail}
              onChange={(e) =>
                setCommitment(index, { detail: e.target.value })
              }
              placeholder={t(
                "marketing:postOpportunity.rich.commitDetailPlaceholder",
              )}
              aria-label={t(
                "marketing:postOpportunity.rich.commitDetailAria",
                { index: index + 1 },
              )}
            />
          </div>
          {state.commitments.length > 1 && (
            <button
              type="button"
              className={styles.repRemove}
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
      <button type="button" className={styles.repAdd} onClick={addCommitment}>
        <FiPlus aria-hidden />{" "}
        {t("marketing:postOpportunity.rich.addCommitment")}
      </button>
    </>
  );
}

/** Team intro, who applies to, partner slug, and contact handle. */
export function PostOpportunityTeamFields({
  form,
}: {
  form: PostOpportunityForm;
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
      <FormField label={t("marketing:postOpportunity.rich.teamIntroLabel")}>
        <input
          type="text"
          value={state.teamIntro}
          onChange={(e) => set("teamIntro", e.target.value)}
          placeholder={t("marketing:postOpportunity.rich.teamIntroPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.rich.teamLabel")}
        helper={t("marketing:postOpportunity.rich.teamHelper")}
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

      <div className={styles.row}>
        <FormField
          label={t("marketing:postOpportunity.rich.applyRoleLabel")}
          helper={t("marketing:postOpportunity.rich.applyRoleHelper")}
        >
          <input
            type="text"
            value={applyRoleValue}
            onChange={(e) => set("applyRole", e.target.value)}
            placeholder={t(
              "marketing:postOpportunity.rich.applyRolePlaceholder",
            )}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.rich.partnerSlugLabel")}
          helper={t("marketing:postOpportunity.rich.partnerSlugHelper")}
        >
          <input
            type="text"
            value={state.partnerSlug}
            onChange={(e) => set("partnerSlug", e.target.value)}
            placeholder={t(
              "marketing:postOpportunity.rich.partnerSlugPlaceholder",
            )}
          />
        </FormField>
      </div>

      <FormField
        label={t("marketing:postOpportunity.rich.handleLabel")}
        helper={t("marketing:postOpportunity.rich.handleHelper")}
      >
        <input
          type="text"
          value={state.handle}
          onChange={(e) => set("handle", e.target.value)}
          placeholder={t("marketing:postOpportunity.rich.handlePlaceholder")}
        />
      </FormField>
    </>
  );
}

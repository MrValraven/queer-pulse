import { FiPlus, FiX } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Optional depth: the story, the tasks, the honest commitment, contact. */
export function PostOpportunityRichFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const {
    state,
    set,
    setTask,
    addTask,
    removeTask,
    setCommitment,
    addCommitment,
    removeCommitment,
  } = form;

  return (
    <details className={styles.optional}>
      <summary className={styles.optionalSummary}>
        {t("marketing:postOpportunity.rich.summary")}
      </summary>

      <div className={styles.optionalBody}>
        <div className={styles.sectionHead}>
          {t("marketing:postOpportunity.rich.whyHeading")}
        </div>
        <FormField
          label={t("marketing:postOpportunity.rich.whyLabel")}
          helper={t("marketing:postOpportunity.rich.whyHelper")}
        >
          <textarea
            rows={3}
            value={state.why}
            onChange={(e) => set("why", e.target.value)}
            placeholder={t("marketing:postOpportunity.rich.whyPlaceholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.rich.goodForLabel")}
          helper={t("marketing:postOpportunity.rich.goodForHelper")}
        >
          <textarea
            rows={3}
            value={state.goodFor}
            onChange={(e) => set("goodFor", e.target.value)}
            placeholder={t(
              "marketing:postOpportunity.rich.goodForPlaceholder",
            )}
          />
        </FormField>

        <div className={styles.sectionHead}>
          {t("marketing:postOpportunity.rich.tasksHeading")}
        </div>
        {state.tasks.map((task, i) => (
          <div className={styles.repRow} key={i}>
            <div className={styles.repFields}>
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask(i, { title: e.target.value })}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskTitlePlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.taskTitleAria",
                  { index: i + 1 },
                )}
              />
              <input
                type="text"
                value={task.desc}
                onChange={(e) => setTask(i, { desc: e.target.value })}
                placeholder={t(
                  "marketing:postOpportunity.rich.taskDetailPlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.taskDetailAria",
                  { index: i + 1 },
                )}
              />
            </div>
            {state.tasks.length > 1 && (
              <button
                type="button"
                className={styles.repRemove}
                onClick={() => removeTask(i)}
                aria-label={t(
                  "marketing:postOpportunity.rich.taskRemoveAria",
                  { index: i + 1 },
                )}
              >
                <FiX aria-hidden />
              </button>
            )}
          </div>
        ))}
        <button type="button" className={styles.repAdd} onClick={addTask}>
          <FiPlus aria-hidden /> {t("marketing:postOpportunity.rich.addTask")}
        </button>

        <div className={styles.sectionHead}>
          {t("marketing:postOpportunity.rich.commitmentsHeading")}
        </div>
        {state.commitments.map((c, i) => (
          <div className={styles.repRow} key={i}>
            <div className={styles.repFields}>
              <input
                type="text"
                value={c.label}
                onChange={(e) => setCommitment(i, { label: e.target.value })}
                placeholder={t(
                  "marketing:postOpportunity.rich.commitLabelPlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitLabelAria",
                  { index: i + 1 },
                )}
              />
              <input
                type="text"
                value={c.detail}
                onChange={(e) => setCommitment(i, { detail: e.target.value })}
                placeholder={t(
                  "marketing:postOpportunity.rich.commitDetailPlaceholder",
                )}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitDetailAria",
                  { index: i + 1 },
                )}
              />
            </div>
            {state.commitments.length > 1 && (
              <button
                type="button"
                className={styles.repRemove}
                onClick={() => removeCommitment(i)}
                aria-label={t(
                  "marketing:postOpportunity.rich.commitRemoveAria",
                  { index: i + 1 },
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

        <div className={styles.sectionHead}>
          {t("marketing:postOpportunity.rich.teamHeading")}
        </div>
        <FormField label={t("marketing:postOpportunity.rich.teamIntroLabel")}>
          <input
            type="text"
            value={state.teamIntro}
            onChange={(e) => set("teamIntro", e.target.value)}
            placeholder={t(
              "marketing:postOpportunity.rich.teamIntroPlaceholder",
            )}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.rich.teamLabel")}
          helper={t("marketing:postOpportunity.rich.teamHelper")}
        >
          <input
            type="text"
            value={state.team}
            onChange={(e) => set("team", e.target.value)}
            placeholder={t("marketing:postOpportunity.rich.teamPlaceholder")}
          />
        </FormField>

        <div className={styles.row}>
          <FormField
            label={t("marketing:postOpportunity.rich.applyRoleLabel")}
            helper={t("marketing:postOpportunity.rich.applyRoleHelper")}
          >
            <input
              type="text"
              value={state.applyRole}
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
            placeholder={t(
              "marketing:postOpportunity.rich.handlePlaceholder",
            )}
          />
        </FormField>
      </div>
    </details>
  );
}

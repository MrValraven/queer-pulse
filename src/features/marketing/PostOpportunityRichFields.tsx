import { FiPlus, FiX } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Optional depth: the story, the tasks, the honest commitment, contact. */
export function PostOpportunityRichFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
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
        Add more detail (optional)
      </summary>

      <div className={styles.optionalBody}>
        <div className={styles.sectionHead}>Why it matters</div>
        <FormField
          label="Why this role matters"
          helper="One paragraph per line."
        >
          <textarea
            rows={3}
            value={state.why}
            onChange={(e) => set("why", e.target.value)}
            placeholder="What changes because someone shows up for this."
          />
        </FormField>

        <FormField label="Who's good for this" helper="One paragraph per line.">
          <textarea
            rows={3}
            value={state.goodFor}
            onChange={(e) => set("goodFor", e.target.value)}
            placeholder="The temperament and skills that fit — not just the CV."
          />
        </FormField>

        <div className={styles.sectionHead}>What they'll actually do</div>
        {state.tasks.map((t, i) => (
          <div className={styles.repRow} key={i}>
            <div className={styles.repFields}>
              <input
                type="text"
                value={t.title}
                onChange={(e) => setTask(i, { title: e.target.value })}
                placeholder="Task title"
                aria-label={`Task ${i + 1} title`}
              />
              <input
                type="text"
                value={t.desc}
                onChange={(e) => setTask(i, { desc: e.target.value })}
                placeholder="One line on what it involves"
                aria-label={`Task ${i + 1} detail`}
              />
            </div>
            {state.tasks.length > 1 && (
              <button
                type="button"
                className={styles.repRemove}
                onClick={() => removeTask(i)}
                aria-label={`Remove task ${i + 1}`}
              >
                <FiX aria-hidden />
              </button>
            )}
          </div>
        ))}
        <button type="button" className={styles.repAdd} onClick={addTask}>
          <FiPlus aria-hidden /> Add a task
        </button>

        <div className={styles.sectionHead}>The commitment, honestly</div>
        {state.commitments.map((c, i) => (
          <div className={styles.repRow} key={i}>
            <div className={styles.repFields}>
              <input
                type="text"
                value={c.label}
                onChange={(e) => setCommitment(i, { label: e.target.value })}
                placeholder="e.g. 6-hour training"
                aria-label={`Commitment ${i + 1} label`}
              />
              <input
                type="text"
                value={c.detail}
                onChange={(e) => setCommitment(i, { detail: e.target.value })}
                placeholder="e.g. Two evenings before you start · required"
                aria-label={`Commitment ${i + 1} detail`}
              />
            </div>
            {state.commitments.length > 1 && (
              <button
                type="button"
                className={styles.repRemove}
                onClick={() => removeCommitment(i)}
                aria-label={`Remove commitment ${i + 1}`}
              >
                <FiX aria-hidden />
              </button>
            )}
          </div>
        ))}
        <button type="button" className={styles.repAdd} onClick={addCommitment}>
          <FiPlus aria-hidden /> Add a commitment
        </button>

        <div className={styles.sectionHead}>Team & contact</div>
        <FormField label="Intro to the team">
          <input
            type="text"
            value={state.teamIntro}
            onChange={(e) => set("teamIntro", e.target.value)}
            placeholder="e.g. 18 outreach volunteers active this quarter."
          />
        </FormField>

        <FormField
          label="Team members"
          helper="Comma-separated member handles / slugs already on the team."
        >
          <input
            type="text"
            value={state.team}
            onChange={(e) => set("team", e.target.value)}
            placeholder="catarina-v, jonas-f"
          />
        </FormField>

        <div className={styles.row}>
          <FormField
            label="Apply-as role label"
            helper="Defaults to “Role · Organisation”."
          >
            <input
              type="text"
              value={state.applyRole}
              onChange={(e) => set("applyRole", e.target.value)}
              placeholder="Community Outreach · ILGA Lisboa"
            />
          </FormField>

          <FormField label="Partner slug" helper="Links to a partner's page.">
            <input
              type="text"
              value={state.partnerSlug}
              onChange={(e) => set("partnerSlug", e.target.value)}
              placeholder="ilga-portugal"
            />
          </FormField>
        </div>

        <FormField
          label="Contact handle"
          helper="Where interested volunteers can reach you."
        >
          <input
            type="text"
            value={state.handle}
            onChange={(e) => set("handle", e.target.value)}
            placeholder="@yourhandle or an email"
          />
        </FormField>
      </div>
    </details>
  );
}

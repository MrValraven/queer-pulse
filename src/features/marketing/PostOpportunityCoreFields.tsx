import { FormField } from "../../shared/components/ui";
import type { Cause, Commit } from "./api/volunteering.api";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import { CAUSE_OPTIONS, COMMIT_OPTIONS } from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Required core fields: who, what, where, and how big the ask is. */
export function PostOpportunityCoreFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { state, set, errorFor } = form;
  return (
    <>
      <div className={styles.sectionHead}>The basics</div>

      <FormField label="Organisation" required error={errorFor("org")}>
        <input
          type="text"
          value={state.org}
          onChange={(e) => set("org", e.target.value)}
          placeholder="e.g. ILGA Portugal"
        />
      </FormField>

      <FormField label="Role title" required error={errorFor("role")}>
        <input
          type="text"
          value={state.role}
          onChange={(e) => set("role", e.target.value)}
          placeholder="e.g. Community Outreach Volunteer"
        />
      </FormField>

      <div className={styles.row}>
        <FormField label="Cause" required>
          <select
            value={state.cause}
            onChange={(e) => set("cause", e.target.value as Cause)}
          >
            {CAUSE_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Commitment level"
          required
          helper={COMMIT_OPTIONS.find((c) => c.value === state.commit)?.hint}
        >
          <select
            value={state.commit}
            onChange={(e) => set("commit", e.target.value as Commit)}
          >
            {COMMIT_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className={styles.sectionHead}>Time & place</div>

      <div className={styles.row}>
        <FormField label="Time commitment" required error={errorFor("time")}>
          <input
            type="text"
            value={state.time}
            onChange={(e) => set("time", e.target.value)}
            placeholder="e.g. 2–4 hrs/week"
          />
        </FormField>

        <FormField label="Location" required error={errorFor("location")}>
          <input
            type="text"
            value={state.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. In-person · Lisbon"
          />
        </FormField>
      </div>

      <FormField
        label="Spots available"
        required
        error={errorFor("spotsTotal")}
        helper="How many volunteers can you take on for this role?"
      >
        <input
          type="number"
          min={1}
          value={state.spotsTotal}
          onChange={(e) => set("spotsTotal", e.target.value)}
          placeholder="e.g. 24"
        />
      </FormField>

      <div className={styles.sectionHead}>The pitch</div>

      <FormField
        label="Short description"
        required
        error={errorFor("desc")}
        helper="One or two sentences shown on the listing card."
      >
        <textarea
          rows={3}
          value={state.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="What the volunteer will help with, in plain language."
        />
      </FormField>

      <FormField
        label="Skills"
        helper="Comma-separated — shown as hashtags on the card."
      >
        <input
          type="text"
          value={state.skills}
          onChange={(e) => set("skills", e.target.value)}
          placeholder="Communication, Languages, Event support"
        />
      </FormField>
    </>
  );
}

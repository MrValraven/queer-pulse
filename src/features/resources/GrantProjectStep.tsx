import { FormField } from "../../shared/components/ui";
import styles from "./MicroGrantsPage.module.css";

/* Step 2 — project details */
export function ProjectStep({
  projName,
  setProjName,
  projWhat,
  setProjWhat,
}: {
  projName: string;
  setProjName: (v: string) => void;
  projWhat: string;
  setProjWhat: (v: string) => void;
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        Tell us about <em>the project.</em>
      </div>
      <p className={styles.stepSub}>
        Be specific and honest. The review panel reads everything. Plain
        language beats formal language every time.
      </p>
      <FormField label="Project name">
        <input
          type="text"
          placeholder="A short, clear title"
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
        />
      </FormField>
      <FormField
        label="What will you make or do?"
        labelAside={`${projWhat.length} / 400`}
      >
        <textarea
          placeholder="Describe the project in plain terms. What will exist or happen that doesn't exist now?"
          value={projWhat}
          maxLength={400}
          onChange={(e) => setProjWhat(e.target.value)}
        />
      </FormField>
      <FormField label="Who benefits, and how?">
        <textarea placeholder="Who in the queer community will this reach? How will it make a difference to them?" />
      </FormField>
      <div className={styles.row2}>
        <FormField label="Timeline">
          <input type="text" placeholder="e.g. August–October 2026" />
        </FormField>
        <FormField label="Project stage">
          <select defaultValue="">
            <option value="">Select…</option>
            <option>Idea — not yet started</option>
            <option>In development</option>
            <option>Ready to go — just needs funding</option>
            <option>Ongoing — this would expand it</option>
          </select>
        </FormField>
      </div>
    </>
  );
}

import { useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import type { Job } from "./jobs.data";
import { AVAILABILITY } from "./jobApply.data";
import styles from "./JobApplyPage.module.css";

export interface JobApplyFields {
  name: string;
  pronouns: string;
  email: string;
  location: string;
  cvName: string;
  site: string;
  instagram: string;
  profileUrl: string;
  letter: string;
  when: string;
  salary: string;
  extra: string;
}

type SetField = <K extends keyof JobApplyFields>(
  key: K,
  value: JobApplyFields[K],
) => void;

interface SectionProps {
  job: Job;
  fields: JobApplyFields;
  setField: SetField;
}

function AboutSection({ fields, setField }: SectionProps) {
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>01</span>About you
      </h2>
      <p className={styles.secSub}>
        We pre-filled what we could from your profile. Edit anything that's
        changed.
      </p>
      <div className={styles.fieldRow}>
        <FormField label="Full name" required>
          <input
            type="text"
            value={fields.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </FormField>
        <FormField label="Pronouns" helper="Shown to the hiring team.">
          <input
            type="text"
            value={fields.pronouns}
            onChange={(e) => setField("pronouns", e.target.value)}
          />
        </FormField>
      </div>
      <div className={styles.fieldRow}>
        <FormField label="Email" required>
          <input
            type="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </FormField>
        <FormField label="Where are you based?" required>
          <input
            type="text"
            value={fields.location}
            onChange={(e) => setField("location", e.target.value)}
          />
        </FormField>
      </div>
    </section>
  );
}

function WorkSection({ fields, setField }: SectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>02</span>Your work
      </h2>
      <p className={styles.secSub}>
        A CV is great. A portfolio is better. Drop both if you can.
      </p>
      <FormField label="CV or résumé">
        <label className={styles.upload}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              setField("cvName", e.target.files?.[0]?.name ?? "")
            }
          />
          <span className={styles.uploadIc}>
            <FiUploadCloud size={20} aria-hidden />
          </span>
          <span className={styles.uploadText}>
            <span className={styles.uploadTitle}>
              {fields.cvName || "Drop PDF here, or click to choose"}
            </span>
            <span className={styles.uploadDesc}>Max 5 MB · PDF / DOCX</span>
          </span>
          <span className={styles.uploadCta}>Browse →</span>
        </label>
      </FormField>
      <FormField
        label="Portfolio links"
        helper="Your QueerPulse profile is auto-attached. Untick in Privacy if you'd rather not."
      >
        <div className={styles.idRow}>
          <span className={styles.idLink}>
            <span className={styles.idLinkIc}>W</span>
            <input
              type="url"
              placeholder="Your site or Are.na"
              value={fields.site}
              onChange={(e) => setField("site", e.target.value)}
            />
          </span>
          <span className={styles.idLink}>
            <span className={styles.idLinkIc}>IG</span>
            <input
              type="text"
              placeholder="@yourhandle"
              value={fields.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
            />
          </span>
          <span className={`${styles.idLink} ${styles.idLinkOwn}`}>
            <span className={styles.idLinkIc}>QP</span>
            <input type="text" value={fields.profileUrl} readOnly />
          </span>
        </div>
      </FormField>
    </section>
  );
}

function WhySection({ job, fields, setField }: SectionProps) {
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>03</span>Why this role?
      </h2>
      <p className={styles.secSub}>
        Two short paragraphs is more than enough. Be specific — what about{" "}
        {job.org}, and what you'd bring.
      </p>
      <FormField
        label="Cover note"
        labelAside={`${fields.letter.length} / 800`}
      >
        <textarea
          rows={6}
          maxLength={800}
          placeholder="What drew you to this role? What are you good at? What are you hoping to grow into?"
          value={fields.letter}
          onChange={(e) => setField("letter", e.target.value)}
        />
      </FormField>
      <FormField label="Available from">
        <div className={styles.radioGrid}>
          {AVAILABILITY.map((a) => (
            <label
              key={a.value}
              className={`${styles.rcard} ${
                fields.when === a.value ? styles.rcardOn : ""
              }`}
            >
              <input
                type="radio"
                name="when"
                checked={fields.when === a.value}
                onChange={() => setField("when", a.value)}
              />
              <span className={styles.rcardT}>{a.title}</span>
              <span className={styles.rcardD}>{a.desc}</span>
            </label>
          ))}
        </div>
      </FormField>
      <FormField
        label="Salary expectation"
        helper={`Posted range is ${job.salary}. You can name a number outside this — they'll consider.`}
      >
        <input
          type="text"
          placeholder="e.g. €1,400/mo, or open"
          value={fields.salary}
          onChange={(e) => setField("salary", e.target.value)}
        />
      </FormField>
    </section>
  );
}

function ExtraSection({ job, fields, setField }: SectionProps) {
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>04</span>One thing extra
        <span className={styles.secOpt}>— optional</span>
      </h2>
      <p className={styles.secSub}>
        Anything else you'd like {job.org} to know? Working hours, access needs,
        references — whatever's relevant.
      </p>
      <FormField
        label="Notes for the hiring team"
        labelAside={`${fields.extra.length} / 400`}
      >
        <textarea
          rows={4}
          maxLength={400}
          placeholder="I'd prefer Tuesdays and Thursdays in-office to coordinate with my kid's school pickup…"
          value={fields.extra}
          onChange={(e) => setField("extra", e.target.value)}
        />
      </FormField>
    </section>
  );
}

export function JobApplyForm({
  job,
  fields,
  setField,
  submitting,
  onSaveDraft,
  onSubmit,
}: SectionProps & {
  submitting: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <AboutSection job={job} fields={fields} setField={setField} />
      <WorkSection job={job} fields={fields} setField={setField} />
      <WhySection job={job} fields={fields} setField={setField} />
      <ExtraSection job={job} fields={fields} setField={setField} />

      <div className={styles.actions}>
        <div className={styles.saved}>
          <span className={styles.savedDot} />
          <span>Draft saved · just now</span>
        </div>
        <div className={styles.actionBtns}>
          <Button type="button" variant="ghost" onClick={onSaveDraft}>
            Save draft
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Sending…" : "Send application →"}
          </Button>
        </div>
      </div>
    </form>
  );
}

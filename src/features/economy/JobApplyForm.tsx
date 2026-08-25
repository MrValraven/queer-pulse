import { useRef } from "react";
import { FiArrowRight, FiUploadCloud } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>01</span>
        {t("economy:jobApply.aboutYouTitle")}
      </h2>
      <p className={styles.secSub}>{t("economy:jobApply.aboutYouSub")}</p>
      <div className={styles.fieldRow}>
        <FormField label={t("economy:jobApply.fullName")} required>
          <input
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </FormField>
        <FormField
          label={t("economy:jobApply.pronouns")}
          helper={t("economy:jobApply.pronounsHelper")}
        >
          <input
            type="text"
            value={fields.pronouns}
            onChange={(e) => setField("pronouns", e.target.value)}
          />
        </FormField>
      </div>
      <div className={styles.fieldRow}>
        <FormField label={t("economy:jobApply.email")} required>
          <input
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </FormField>
        <FormField label={t("economy:jobApply.location")} required>
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
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>02</span>
        {t("economy:jobApply.yourWorkTitle")}
      </h2>
      <p className={styles.secSub}>{t("economy:jobApply.yourWorkSub")}</p>
      <FormField label={t("economy:jobApply.cv")}>
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
              {fields.cvName || t("economy:jobApply.cvDrop")}
            </span>
            <span className={styles.uploadDesc}>
              {t("economy:jobApply.cvHint")}
            </span>
          </span>
          <span className={styles.uploadCta}>
            {t("economy:jobApply.browse")} <FiArrowRight aria-hidden />
          </span>
        </label>
      </FormField>
      <FormField
        label={t("economy:jobApply.portfolio")}
        helper={t("economy:jobApply.portfolioHelper")}
      >
        <div className={styles.idRow}>
          <span className={styles.idLink}>
            <span className={styles.idLinkIc}>W</span>
            <input
              type="url"
              placeholder={t("economy:jobApply.sitePlaceholder")}
              value={fields.site}
              onChange={(e) => setField("site", e.target.value)}
            />
          </span>
          <span className={styles.idLink}>
            <span className={styles.idLinkIc}>
              {t("economy:jobApply.identityIg")}
            </span>
            <input
              type="text"
              placeholder={t("economy:jobApply.instagramPlaceholder")}
              value={fields.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
            />
          </span>
          <span className={`${styles.idLink} ${styles.idLinkOwn}`}>
            <span className={styles.idLinkIc}>
              {t("economy:jobApply.identityQp")}
            </span>
            <input type="text" value={fields.profileUrl} readOnly />
          </span>
        </div>
      </FormField>
    </section>
  );
}

function WhySection({ job, fields, setField }: SectionProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>03</span>
        {t("economy:jobApply.whyTitle")}
      </h2>
      <p className={styles.secSub}>
        {t("economy:jobApply.whySub", { org: job.organization })}
      </p>
      <FormField
        label={t("economy:jobApply.coverNote")}
        labelAside={t("economy:jobApply.charCount", {
          used: fields.letter.length,
          max: 800,
        })}
      >
        <textarea
          rows={6}
          maxLength={800}
          placeholder={t("economy:jobApply.coverPlaceholder")}
          value={fields.letter}
          onChange={(e) => setField("letter", e.target.value)}
        />
      </FormField>
      <FormField label={t("economy:jobApply.availableFrom")}>
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
              <span className={styles.rcardT}>{t(a.titleKey)}</span>
              <span className={styles.rcardD}>{t(a.descKey)}</span>
            </label>
          ))}
        </div>
      </FormField>
      <FormField
        label={t("economy:jobApply.salaryExpectation")}
        helper={t("economy:jobApply.salaryHelper", { salary: job.salary })}
      >
        <input
          type="text"
          placeholder={t("economy:jobApply.salaryPlaceholder")}
          value={fields.salary}
          onChange={(e) => setField("salary", e.target.value)}
        />
      </FormField>
    </section>
  );
}

function ExtraSection({ job, fields, setField }: SectionProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2 className={styles.secHead}>
        <span className={styles.secNum}>04</span>
        {t("economy:jobApply.extraTitle")}
        <span className={styles.secOpt}>
          {t("economy:jobApply.extraOptional")}
        </span>
      </h2>
      <p className={styles.secSub}>
        {t("economy:jobApply.extraSub", { org: job.organization })}
      </p>
      <FormField
        label={t("economy:jobApply.extraLabel")}
        labelAside={t("economy:jobApply.charCount", {
          used: fields.extra.length,
          max: 400,
        })}
      >
        <textarea
          rows={4}
          maxLength={400}
          placeholder={t("economy:jobApply.extraPlaceholder")}
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
  const { t } = useTranslation();
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
          <span>{t("economy:jobApply.draftSavedJustNow")}</span>
        </div>
        <div className={styles.actionBtns}>
          <Button type="button" variant="ghost" onClick={onSaveDraft}>
            {t("economy:jobApply.saveDraft")}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              t("economy:jobApply.sending")
            ) : (
              <>
                {t("economy:jobApply.sendCta")} <FiArrowRight aria-hidden />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

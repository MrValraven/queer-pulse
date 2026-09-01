import { FiPlus, FiX } from "react-icons/fi";
import {
  Button,
  CheckLine,
  DatePicker,
  FormField,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BENEFITS,
  CATEGORIES,
  COMMITMENTS,
  CONTACT_METHODS,
  CURRENCIES,
  FORMATS,
  INCLUSIVITY,
  RATE_PER,
  SENIORITY,
  SKILL_SUGGESTIONS,
  TIMEZONES,
} from "./postJob.data";
import { MAX_SCREENING_QUESTIONS, type EditJobForm } from "./EditJobFormState";
import styles from "./EditJobPage.module.css";

/** Only shows a field's error once the poster has tried to save. */
function errorText(
  key: string | undefined,
  shouldShow: boolean,
  translate: (key: string) => string,
) {
  return shouldShow && key ? translate(key) : undefined;
}

interface FieldsProps {
  form: EditJobForm;
  showErrors: boolean;
}

/** What the role is and where it happens. */
export function EditJobRoleFields({ form, showErrors }: FieldsProps) {
  const { t } = useTranslation();
  const { draft, patch, errors } = form;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{t("economy:editJob.section.role")}</h2>

      <FormField
        label={t("economy:editJob.field.title")}
        required
        error={errorText(errors.title, showErrors, t)}
      >
        <input
          type="text"
          maxLength={200}
          value={draft.title}
          onChange={(event) => patch({ title: event.target.value })}
        />
      </FormField>

      <FormField
        label={t("economy:editJob.field.description")}
        required
        helper={t("economy:editJob.field.descriptionHelper")}
        error={errorText(errors.description, showErrors, t)}
      >
        <textarea
          rows={6}
          value={draft.description}
          onChange={(event) => patch({ description: event.target.value })}
        />
      </FormField>

      <div className={styles.row}>
        <FormField label={t("economy:editJob.field.category")}>
          <Select
            value={draft.category}
            onChange={(value) => patch({ category: value ?? draft.category })}
            options={CATEGORIES.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </FormField>
        <FormField label={t("economy:editJob.field.commitment")}>
          <Select
            value={draft.commitment}
            onChange={(value) =>
              patch({ commitment: value ?? draft.commitment })
            }
            options={COMMITMENTS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </FormField>
        <FormField label={t("economy:editJob.field.seniority")}>
          <Select
            value={draft.seniority}
            onChange={(value) => patch({ seniority: value ?? draft.seniority })}
            options={SENIORITY.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label={t("economy:editJob.field.format")}>
          <Select
            value={draft.format}
            onChange={(value) => patch({ format: value ?? draft.format })}
            options={FORMATS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </FormField>
        {form.needsCity && (
          <FormField
            label={t("economy:editJob.field.city")}
            required
            error={errorText(errors.city, showErrors, t)}
          >
            <input
              type="text"
              maxLength={200}
              value={draft.city}
              onChange={(event) => patch({ city: event.target.value })}
            />
          </FormField>
        )}
        {form.showsTimezone && (
          <FormField label={t("economy:editJob.field.timezone")}>
            <Select
              value={draft.timezone}
              onChange={(value) => patch({ timezone: value ?? draft.timezone })}
              options={TIMEZONES.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
            />
          </FormField>
        )}
      </div>

      <div className={styles.row}>
        <FormField label={t("economy:editJob.field.deadline")}>
          <DatePicker
            mode="date"
            label={t("economy:editJob.field.deadline")}
            value={draft.deadline || null}
            clearable
            onChange={(value) => patch({ deadline: value ?? "" })}
          />
        </FormField>
        <FormField
          label={t("economy:editJob.field.startDate")}
          helper={t("economy:editJob.field.startDateHelper")}
        >
          <input
            type="text"
            maxLength={100}
            value={draft.startDate}
            onChange={(event) => patch({ startDate: event.target.value })}
          />
        </FormField>
      </div>
    </section>
  );
}

/**
 * Pay. This is the half of the form the finding was actually about: a wrong
 * salary band used to be uncorrectable, so the only way out was closing the
 * listing and posting it again.
 */
export function EditJobPayFields({ form, showErrors }: FieldsProps) {
  const { t } = useTranslation();
  const { draft, patch, errors } = form;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{t("economy:editJob.section.pay")}</h2>

      <div className={styles.row}>
        <FormField label={t("economy:editJob.field.currency")}>
          <Select
            value={draft.currency}
            onChange={(value) => patch({ currency: value ?? draft.currency })}
            options={CURRENCIES.map((currency) => ({
              value: currency,
              label: currency,
            }))}
          />
        </FormField>
        <FormField label={t("economy:editJob.field.rateMin")}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.rateMin}
            onChange={(event) => patch({ rateMin: event.target.value })}
          />
        </FormField>
        <FormField
          label={t("economy:editJob.field.rateMax")}
          error={errorText(errors.rateMax, showErrors, t)}
        >
          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.rateMax}
            onChange={(event) => patch({ rateMax: event.target.value })}
          />
        </FormField>
        <FormField label={t("economy:editJob.field.ratePer")}>
          <Select
            value={draft.ratePer}
            onChange={(value) => patch({ ratePer: value ?? draft.ratePer })}
            options={RATE_PER.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </FormField>
      </div>

      <div className={styles.switches}>
        <CheckLine
          checked={draft.hidePay}
          onChange={(checked) => patch({ hidePay: checked })}
          title={t("economy:editJob.field.hidePay")}
          sub={t("economy:editJob.field.hidePayHelper")}
        />
        <CheckLine
          checked={draft.barter}
          onChange={(checked) => patch({ barter: checked })}
          title={t("economy:editJob.field.barter")}
          sub={t("economy:editJob.field.barterHelper")}
        />
      </div>
    </section>
  );
}

function CheckGrid({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className={styles.checkGrid}>
      {options.map((option) => (
        <CheckLine
          key={option}
          checked={selected.includes(option)}
          onChange={() => onToggle(option)}
          title={option}
        />
      ))}
    </div>
  );
}

/** Benefits, inclusivity, skills, screening questions and how to reach you. */
export function EditJobExtrasFields({ form, showErrors }: FieldsProps) {
  const { t } = useTranslation();
  const { draft, patch, toggleIn, errors } = form;

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {t("economy:editJob.section.whatYouOffer")}
        </h2>
        <p className={styles.cardSub}>
          {t("economy:editJob.section.benefitsSub")}
        </p>
        <CheckGrid
          options={BENEFITS}
          selected={draft.benefits}
          onToggle={(value) => toggleIn("benefits", value)}
        />
        <p className={styles.cardSub}>
          {t("economy:editJob.section.inclusivitySub")}
        </p>
        <CheckGrid
          options={INCLUSIVITY}
          selected={draft.inclusivity}
          onToggle={(value) => toggleIn("inclusivity", value)}
        />
        <p className={styles.cardSub}>{t("economy:editJob.section.tagsSub")}</p>
        <CheckGrid
          options={SKILL_SUGGESTIONS}
          selected={draft.tags}
          onToggle={(value) => toggleIn("tags", value)}
        />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {t("economy:editJob.section.screening")}
        </h2>
        <p className={styles.cardSub}>
          {t("economy:editJob.section.screeningSub")}
        </p>
        {draft.screening.map((question, index) => (
          <div key={index} className={styles.screeningRow}>
            <FormField
              className={styles.screeningField}
              label={t("economy:editJob.field.screeningQuestion", {
                index: index + 1,
              })}
            >
              <input
                type="text"
                maxLength={500}
                value={question}
                onChange={(event) =>
                  form.setScreeningQuestion(index, event.target.value)
                }
              />
            </FormField>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => form.removeScreeningQuestion(index)}
            >
              <FiX aria-hidden /> {t("economy:editJob.screening.remove")}
            </Button>
          </div>
        ))}
        {draft.screening.length < MAX_SCREENING_QUESTIONS && (
          <Button variant="ghost" size="sm" onClick={form.addScreeningQuestion}>
            <FiPlus aria-hidden /> {t("economy:editJob.screening.add")}
          </Button>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {t("economy:editJob.section.contact")}
        </h2>
        <CheckGrid
          options={CONTACT_METHODS}
          selected={draft.contacts}
          onToggle={(value) => toggleIn("contacts", value)}
        />
        <div className={styles.row}>
          <FormField
            label={t("economy:editJob.field.email")}
            error={errorText(errors.email, showErrors, t)}
          >
            <input
              type="email"
              value={draft.email}
              onChange={(event) => patch({ email: event.target.value })}
            />
          </FormField>
          <FormField
            label={t("economy:editJob.field.link")}
            helper={t("economy:editJob.field.linkHelper")}
            error={errorText(errors.link, showErrors, t)}
          >
            <input
              type="url"
              maxLength={500}
              value={draft.link}
              onChange={(event) => patch({ link: event.target.value })}
            />
          </FormField>
        </div>
      </section>
    </>
  );
}

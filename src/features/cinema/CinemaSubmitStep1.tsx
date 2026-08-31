import { ChipSelect, FormField, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COUNTRIES,
  FORMATS,
  IDENTITY_TAGS,
  LANGUAGES,
} from "./cinemaSubmit.data";
import type { SubmitForm } from "./useSubmitForm";
import { FbHead, FieldLabel, RadioGrid } from "./CinemaSubmitParts";
import { ContentNotesBuilder, PosterUpload } from "./CinemaSubmitWidgets";
import styles from "./CinemaSubmitPage.module.css";

/** Step 1 — basic information, shown on the film's public page. Split into
 * two sub-components (per the repo's <200-line-per-component convention):
 * the identifying-details fields, then the longer creative-copy fields. */
export function CinemaSubmitStep1({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={1}
        heading={
          <Translation
            i18nKey="cinema:submit.form.step1.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:submit.form.step1.sub")}
      />
      <Step1FilmDetails form={form} />
      <Step1CreativeFields form={form} />
    </div>
  );
}

/** Title, original title, year, runtime, country, language, format. */
function Step1FilmDetails({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <>
      <FormField label={t("cinema:submit.form.step1.title.label")} required>
        <input
          type="text"
          placeholder={t("cinema:submit.form.step1.title.placeholder")}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </FormField>

      <div className={styles.fieldRow}>
        <FormField
          label={
            <FieldLabel opt={t("cinema:submit.form.step1.originalTitle.opt")}>
              {t("cinema:submit.form.step1.originalTitle.label")}
            </FieldLabel>
          }
        >
          <input
            type="text"
            placeholder={t(
              "cinema:submit.form.step1.originalTitle.placeholder",
            )}
            value={draft.originalTitle}
            onChange={(e) => set("originalTitle", e.target.value)}
          />
        </FormField>
        <FormField label={t("cinema:submit.form.step1.year.label")}>
          <input
            type="number"
            placeholder="2026"
            value={draft.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.fieldRow3}>
        <FormField label={t("cinema:submit.form.step1.runtime.label")}>
          <input
            type="number"
            placeholder="92"
            value={draft.runtime}
            onChange={(e) => set("runtime", e.target.value)}
          />
        </FormField>
        <FormField label={t("cinema:submit.form.step1.country.label")}>
          <Select
            value={draft.country}
            onChange={(value) => set("country", value ?? "")}
            options={COUNTRIES.map((country) => ({
              value: country.value,
              label: t(country.labelKey),
            }))}
          />
        </FormField>
        <FormField label={t("cinema:submit.form.step1.language.label")}>
          <Select
            value={draft.language}
            onChange={(value) => set("language", value ?? "")}
            options={LANGUAGES.map((language) => ({
              value: language.value,
              label: t(language.labelKey),
            }))}
          />
        </FormField>
      </div>

      <FormField label={t("cinema:submit.form.step1.format.label")}>
        <RadioGrid
          options={FORMATS}
          value={draft.format}
          onChange={(formatValue) => set("format", formatValue)}
          ariaLabel={t("cinema:submit.form.step1.format.ariaLabel")}
        />
      </FormField>
    </>
  );
}

/** Synopsis, director's statement, identity tags, content notes, poster,
 * screener link. */
function Step1CreativeFields({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set, toggle } = form;
  const identities = new Set(draft.identities);
  return (
    <>
      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step1.synopsis.why")}>
            {t("cinema:submit.form.step1.synopsis.label")}
          </FieldLabel>
        }
        required
      >
        <textarea
          rows={5}
          placeholder={t("cinema:submit.form.step1.synopsis.placeholder")}
          value={draft.synopsis}
          onChange={(e) => set("synopsis", e.target.value)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel
            opt={t("cinema:submit.form.step1.statement.opt")}
            why={t("cinema:submit.form.step1.statement.why")}
          >
            {t("cinema:submit.form.step1.statement.label")}
          </FieldLabel>
        }
      >
        <textarea
          rows={4}
          placeholder={t("cinema:submit.form.step1.statement.placeholder")}
          value={draft.statement}
          onChange={(e) => set("statement", e.target.value)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step1.identityTags.why")}>
            {t("cinema:submit.form.step1.identityTags.label")}
          </FieldLabel>
        }
      >
        <ChipSelect
          label={t("cinema:submit.form.step1.identityTags.label")}
          options={IDENTITY_TAGS.map((tag) => ({
            value: tag.value,
            label: t(tag.labelKey),
          }))}
          selected={identities}
          onToggle={(value) => toggle("identities", value)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step1.contentNotes.why")}>
            {t("cinema:submit.form.step1.contentNotes.label")}
          </FieldLabel>
        }
      >
        <ContentNotesBuilder form={form} />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step1.poster.why")}>
            {t("cinema:submit.form.step1.poster.label")}
          </FieldLabel>
        }
      >
        <PosterUpload form={form} />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step1.screener.why")}>
            {t("cinema:submit.form.step1.screener.label")}
          </FieldLabel>
        }
        required
      >
        <input
          type="url"
          placeholder={t("cinema:submit.form.step1.screener.placeholder")}
          value={draft.screener}
          onChange={(e) => set("screener", e.target.value)}
        />
      </FormField>
    </>
  );
}

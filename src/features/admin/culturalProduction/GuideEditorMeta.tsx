import type { ReactNode } from "react";
import { FormField, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPanel } from "../ui";
import {
  CULTURAL_EVENT_TYPES,
  CULTURAL_GUIDE_LOCALES,
  isCulturalEventType,
  isCulturalGuideLocale,
} from "./api/culturalProduction.types";
import {
  CULTURAL_EVENT_TYPE_KEY,
  CULTURAL_GUIDE_LOCALE_KEY,
} from "./culturalProductionLabels.data";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  GUIDE_META_CONTROL,
  type GuideDraftMeta,
  type GuideField,
} from "./guideEditor.model";
import styles from "./GuideEditor.module.css";

const FORM_KEY = "admin:culturalProduction.guides.form";

type MetaField = keyof typeof GUIDE_META_CONTROL;

/** A field with its refusal line under it. */
function MetaFieldBlock({
  refusal,
  refusalId,
  children,
}: {
  refusal: unknown;
  refusalId: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fieldBlock}>
      {children}
      <CulturalRefusalLine error={refusal} id={refusalId} />
    </div>
  );
}

/**
 * The guide's title, event type, language and summary, at the top of the
 * editor. A refusal that names one of them shows under that field.
 */
export function GuideEditorMeta({
  idPrefix,
  meta,
  refusal,
  refusalField,
  isDisabled,
  onChange,
}: {
  idPrefix: string;
  meta: GuideDraftMeta;
  refusal: unknown;
  refusalField: GuideField | null;
  isDisabled: boolean;
  onChange: (changes: Partial<GuideDraftMeta>) => void;
}) {
  const { t } = useTranslation();
  const idOf = (field: MetaField) => `${idPrefix}-${GUIDE_META_CONTROL[field]}`;
  const refusalOf = (field: MetaField) =>
    refusal !== null && refusalField === field ? refusal : null;
  const describedBy = (field: MetaField) =>
    refusalOf(field) === null ? undefined : `${idOf(field)}-refusal`;
  const invalid = (field: MetaField) => refusalOf(field) !== null || undefined;
  const eventTypeOptions = CULTURAL_EVENT_TYPES.map((eventType) => ({
    value: eventType,
    label: t(CULTURAL_EVENT_TYPE_KEY[eventType]),
  }));
  const localeOptions = CULTURAL_GUIDE_LOCALES.map((locale) => ({
    value: locale,
    label: t(CULTURAL_GUIDE_LOCALE_KEY[locale]),
  }));

  return (
    <AdminPanel
      as="div"
      title={t("admin:culturalProduction.guides.editor.heading")}
      bodyClassName={styles.metaBody}
    >
      <MetaFieldBlock
        refusal={refusalOf("title")}
        refusalId={`${idOf("title")}-refusal`}
      >
        <FormField
          label={t(`${FORM_KEY}.titleLabel`)}
          required
          className={styles.field}
        >
          <input
            id={idOf("title")}
            type="text"
            value={meta.title}
            disabled={isDisabled}
            aria-invalid={invalid("title")}
            aria-describedby={describedBy("title")}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </FormField>
      </MetaFieldBlock>
      <div className={styles.metaPair}>
        <MetaFieldBlock
          refusal={refusalOf("eventType")}
          refusalId={`${idOf("eventType")}-refusal`}
        >
          <FormField
            label={t(`${FORM_KEY}.eventTypeLabel`)}
            required
            className={styles.field}
          >
            <Select
              id={idOf("eventType")}
              label={t(`${FORM_KEY}.eventTypeLabel`)}
              options={eventTypeOptions}
              value={meta.eventType}
              disabled={isDisabled}
              aria-invalid={invalid("eventType")}
              aria-describedby={describedBy("eventType")}
              onChange={(next) => {
                if (isCulturalEventType(next)) onChange({ eventType: next });
              }}
            />
          </FormField>
        </MetaFieldBlock>
        <MetaFieldBlock
          refusal={refusalOf("locale")}
          refusalId={`${idOf("locale")}-refusal`}
        >
          <FormField
            label={t(`${FORM_KEY}.localeLabel`)}
            required
            className={styles.field}
          >
            <Select
              id={idOf("locale")}
              label={t(`${FORM_KEY}.localeLabel`)}
              options={localeOptions}
              value={meta.locale}
              disabled={isDisabled}
              aria-invalid={invalid("locale")}
              aria-describedby={describedBy("locale")}
              onChange={(next) => {
                if (isCulturalGuideLocale(next)) onChange({ locale: next });
              }}
            />
          </FormField>
        </MetaFieldBlock>
      </div>
      <MetaFieldBlock
        refusal={refusalOf("summary")}
        refusalId={`${idOf("summary")}-refusal`}
      >
        <FormField
          label={t(`${FORM_KEY}.summaryLabel`)}
          helper={t(`${FORM_KEY}.summaryHint`)}
          className={styles.field}
        >
          <textarea
            id={idOf("summary")}
            rows={3}
            value={meta.summary}
            disabled={isDisabled}
            aria-invalid={invalid("summary")}
            aria-describedby={describedBy("summary")}
            onChange={(event) => onChange({ summary: event.target.value })}
          />
        </FormField>
      </MetaFieldBlock>
    </AdminPanel>
  );
}

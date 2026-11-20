import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, FormField, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import {
  CULTURAL_EVENT_TYPES,
  CULTURAL_GUIDE_LOCALES,
  CULTURAL_GUIDE_SUMMARY_MAX,
  CULTURAL_TITLE_MAX,
  culturalReasonOf,
  isCulturalEventType,
  isCulturalGuideLocale,
} from "./api/culturalProduction.types";
import { useCreateCulturalGuide } from "./api/useCulturalGuideMutations";
import {
  CULTURAL_EVENT_TYPE_KEY,
  CULTURAL_GUIDE_LOCALE_KEY,
} from "./culturalProductionLabels.data";
import { culturalGuidePath } from "./culturalProductionPaths";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  GUIDE_FORM_REASON_FIELD,
  localGuideFormRefusalOf,
  type GuideFormField,
  type GuideFormValues,
  type GuidePageRouterState,
} from "./guidesTab.data";
import styles from "./Guides.module.css";

const FORM_PREFIX = "admin:culturalProduction.guides.form";

/**
 * "Add a guide": title, event type, language (the app language to start)
 * and a short summary. Add guide stays pressable; a press with a field
 * missing names it under that field and sends nothing. A refusal shows
 * under the field it names and folds away on the next edit. A success
 * toasts and opens the new guide in its editor, ready for its sections.
 */
export function GuideFormDialog({ onClose }: { onClose: () => void }) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const [values, setValues] = useState<GuideFormValues>({
    title: "",
    eventType: null,
    locale: language,
    summary: "",
  });
  const [refusal, setRefusal] = useState<unknown>(null);
  // Set the moment a press is accepted, since `isPending` flips a render
  // later and a same-tick double press would add two guides.
  const isSendingRef = useRef(false);
  const createGuide = useCreateCulturalGuide();
  const refusalCode = culturalReasonOf(refusal);
  const refusalField: GuideFormField | null =
    refusalCode === null
      ? null
      : (GUIDE_FORM_REASON_FIELD[refusalCode] ?? null);
  const refusalOf = (field: GuideFormField | null) =>
    refusal !== null && refusalField === field ? refusal : null;

  const change = (nextValues: Partial<GuideFormValues>) => {
    setValues((current) => ({ ...current, ...nextValues }));
    setRefusal(null);
  };

  function close() {
    if (createGuide.isPending || isSendingRef.current) return;
    onClose();
  }

  function submit() {
    if (createGuide.isPending || isSendingRef.current) return;
    const localRefusal = localGuideFormRefusalOf(values);
    const { eventType } = values;
    if (localRefusal !== null || eventType === null) {
      setRefusal(localRefusal);
      return;
    }
    isSendingRef.current = true;
    setRefusal(null);
    const summary = values.summary.trim();
    createGuide.mutate(
      {
        title: values.title.trim(),
        eventType,
        locale: values.locale,
        ...(summary === "" ? {} : { summary }),
      },
      {
        onSuccess: (guide) => {
          showToast(t(`${FORM_PREFIX}.addedToast`), "success");
          onClose();
          const state: GuidePageRouterState = { isEditing: true };
          void navigate(culturalGuidePath(guide.id), { state });
        },
        onError: (cause) => setRefusal(cause),
        onSettled: () => {
          isSendingRef.current = false;
        },
      },
    );
  }

  return (
    <AdminModal
      title={t(`${FORM_PREFIX}.addTitle`)}
      onClose={close}
      footer={
        <>
          <Button
            variant="ghost"
            aria-disabled={createGuide.isPending || undefined}
            onClick={close}
          >
            {t("admin:culturalProduction.common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            aria-busy={createGuide.isPending || undefined}
            aria-disabled={createGuide.isPending || undefined}
          >
            {t(`${FORM_PREFIX}.saveAddCta`)}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <GuideFormFields
          idPrefix={idPrefix}
          values={values}
          onChange={change}
          refusalOf={refusalOf}
        />
        <CulturalRefusalLine error={refusalOf(null)} />
      </form>
    </AdminModal>
  );
}

/** The add form's four fields, each with the refusal line it owns. */
function GuideFormFields({
  idPrefix,
  values,
  onChange: change,
  refusalOf,
}: {
  idPrefix: string;
  values: GuideFormValues;
  onChange: (nextValues: Partial<GuideFormValues>) => void;
  refusalOf: (field: GuideFormField) => unknown;
}) {
  const { t } = useTranslation();
  const refusalIdOf = (field: GuideFormField) => `${idPrefix}-${field}-refusal`;
  const describedBy = (field: GuideFormField) =>
    refusalOf(field) !== null ? refusalIdOf(field) : undefined;
  return (
    <>
      <div className={styles.formField}>
        <FormField label={t(`${FORM_PREFIX}.titleLabel`)} required>
          <input
            id={`${idPrefix}-title`}
            type="text"
            value={values.title}
            maxLength={CULTURAL_TITLE_MAX}
            placeholder={t(`${FORM_PREFIX}.titlePlaceholder`)}
            aria-invalid={refusalOf("title") !== null || undefined}
            aria-describedby={describedBy("title")}
            onChange={(event) => change({ title: event.target.value })}
          />
        </FormField>
        <CulturalRefusalLine
          error={refusalOf("title")}
          id={refusalIdOf("title")}
        />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <FormField label={t(`${FORM_PREFIX}.eventTypeLabel`)} required>
            <Select
              id={`${idPrefix}-event-type`}
              label={t(`${FORM_PREFIX}.eventTypeLabel`)}
              options={CULTURAL_EVENT_TYPES.map((eventType) => ({
                value: eventType,
                label: t(CULTURAL_EVENT_TYPE_KEY[eventType]),
              }))}
              value={values.eventType}
              invalid={refusalOf("eventType") !== null}
              aria-describedby={describedBy("eventType")}
              onChange={(value) =>
                change({
                  eventType: isCulturalEventType(value) ? value : null,
                })
              }
            />
          </FormField>
          <CulturalRefusalLine
            error={refusalOf("eventType")}
            id={refusalIdOf("eventType")}
          />
        </div>
        <div className={styles.formField}>
          <FormField label={t(`${FORM_PREFIX}.localeLabel`)} required>
            <Select
              id={`${idPrefix}-locale`}
              label={t(`${FORM_PREFIX}.localeLabel`)}
              options={CULTURAL_GUIDE_LOCALES.map((locale) => ({
                value: locale,
                label: t(CULTURAL_GUIDE_LOCALE_KEY[locale]),
              }))}
              value={values.locale}
              invalid={refusalOf("locale") !== null}
              aria-describedby={describedBy("locale")}
              onChange={(value) => {
                if (isCulturalGuideLocale(value)) change({ locale: value });
              }}
            />
          </FormField>
          <CulturalRefusalLine
            error={refusalOf("locale")}
            id={refusalIdOf("locale")}
          />
        </div>
      </div>
      <div className={styles.formField}>
        <FormField
          label={t(`${FORM_PREFIX}.summaryLabel`)}
          helper={t(`${FORM_PREFIX}.summaryHint`)}
        >
          <textarea
            id={`${idPrefix}-summary`}
            rows={3}
            value={values.summary}
            maxLength={CULTURAL_GUIDE_SUMMARY_MAX}
            aria-invalid={refusalOf("summary") !== null || undefined}
            aria-describedby={describedBy("summary")}
            onChange={(event) => change({ summary: event.target.value })}
          />
        </FormField>
        <CulturalRefusalLine
          error={refusalOf("summary")}
          id={refusalIdOf("summary")}
        />
      </div>
    </>
  );
}

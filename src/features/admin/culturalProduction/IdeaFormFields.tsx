import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { FormField, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_EVENT_TYPES,
  CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_IDEA_STATUSES,
  isCulturalEventType,
  isCulturalIdeaStatus,
} from "./api/culturalProduction.types";
import {
  CULTURAL_EVENT_TYPE_KEY,
  CULTURAL_IDEA_STATUS_KEY,
} from "./culturalProductionLabels.data";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import {
  codePointLength,
  shouldShowCharacterCount,
  type IdeaFormField,
  type IdeaFormValues,
} from "./ideaForm.model";
import styles from "./Ideas.module.css";

const FORM_PREFIX = "admin:culturalProduction.ideas.form";

/** The description's live count, faded in once the text nears the limit. */
function DescriptionCount({ length }: { length: number }) {
  const { t } = useTranslation();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isShown = shouldShowCharacterCount(
    length,
    CULTURAL_IDEA_DESCRIPTION_MAX,
  );
  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.span
          key="count"
          className={
            length > CULTURAL_IDEA_DESCRIPTION_MAX
              ? styles.countOver
              : undefined
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReducedMotion ? 0 : 0.18 }}
        >
          {t(`${FORM_PREFIX}.characterCount`, {
            count: length,
            max: CULTURAL_IDEA_DESCRIPTION_MAX,
          })}
        </m.span>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * The idea form's fields: title, description with its live count from 80
 * percent of the limit, event type and, in edit mode, status. A refusal
 * folds open under the field it names; `refusalField` says which one.
 */
export function IdeaFormFields({
  idPrefix,
  values,
  onChange,
  error,
  refusalField,
  shouldShowStatus,
  isDisabled,
}: {
  idPrefix: string;
  values: IdeaFormValues;
  onChange: (next: IdeaFormValues) => void;
  error: unknown;
  refusalField: IdeaFormField | null;
  shouldShowStatus: boolean;
  isDisabled: boolean;
}) {
  const { t } = useTranslation();
  const refusalOf = (field: IdeaFormField) =>
    refusalField === field ? error : null;
  const refusalIdOf = (field: IdeaFormField) => `${idPrefix}-${field}-refusal`;
  const describedBy = (field: IdeaFormField) =>
    refusalField === field && error !== null ? refusalIdOf(field) : undefined;
  const eventTypeLabel = t(`${FORM_PREFIX}.eventTypeLabel`);
  const statusLabel = t(`${FORM_PREFIX}.statusLabel`);

  return (
    <div className={styles.formFields}>
      <div>
        <FormField label={t(`${FORM_PREFIX}.titleLabel`)} required>
          <input
            id={`${idPrefix}-title`}
            type="text"
            value={values.title}
            placeholder={t(`${FORM_PREFIX}.titlePlaceholder`)}
            disabled={isDisabled}
            aria-invalid={refusalField === "title" || undefined}
            aria-describedby={describedBy("title")}
            onChange={(event) =>
              onChange({ ...values, title: event.target.value })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={refusalOf("title")}
          id={refusalIdOf("title")}
        />
      </div>
      <div>
        <FormField
          label={t(`${FORM_PREFIX}.descriptionLabel`)}
          helper={t(`${FORM_PREFIX}.descriptionHint`)}
          labelAside={
            <DescriptionCount length={codePointLength(values.description)} />
          }
        >
          <textarea
            id={`${idPrefix}-description`}
            className={styles.description}
            rows={5}
            value={values.description}
            disabled={isDisabled}
            aria-invalid={refusalField === "description" || undefined}
            aria-describedby={describedBy("description")}
            onChange={(event) =>
              onChange({ ...values, description: event.target.value })
            }
          />
        </FormField>
        <CulturalRefusalLine
          error={refusalOf("description")}
          id={refusalIdOf("description")}
        />
      </div>
      <div className={styles.formPair}>
        <div>
          <FormField label={eventTypeLabel} required>
            <Select
              id={`${idPrefix}-eventType`}
              label={eventTypeLabel}
              options={CULTURAL_EVENT_TYPES.map((eventType) => ({
                value: eventType,
                label: t(CULTURAL_EVENT_TYPE_KEY[eventType]),
              }))}
              value={values.eventType}
              disabled={isDisabled}
              invalid={refusalField === "eventType"}
              aria-describedby={describedBy("eventType")}
              onChange={(eventType) => {
                if (isCulturalEventType(eventType))
                  onChange({ ...values, eventType });
              }}
            />
          </FormField>
          <CulturalRefusalLine
            error={refusalOf("eventType")}
            id={refusalIdOf("eventType")}
          />
        </div>
        {shouldShowStatus ? (
          <div>
            <FormField label={statusLabel}>
              <Select
                id={`${idPrefix}-status`}
                label={statusLabel}
                options={CULTURAL_IDEA_STATUSES.map((status) => ({
                  value: status,
                  label: t(CULTURAL_IDEA_STATUS_KEY[status]),
                }))}
                value={values.status}
                disabled={isDisabled}
                invalid={refusalField === "status"}
                aria-describedby={describedBy("status")}
                onChange={(status) => {
                  if (isCulturalIdeaStatus(status))
                    onChange({ ...values, status });
                }}
              />
            </FormField>
            <CulturalRefusalLine
              error={refusalOf("status")}
              id={refusalIdOf("status")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

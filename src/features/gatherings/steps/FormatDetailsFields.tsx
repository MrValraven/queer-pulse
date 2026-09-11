import { useId } from "react";
import { CheckLine, Select } from "../../../shared/components/ui";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, SwitchRow, TextInput } from "../CreateGatheringFields";
import {
  allowedDetailKeys,
  FORMAT_DETAIL_HINT_KEYS,
  FORMAT_DETAIL_LABEL_KEYS,
  MAX_BRING_LENGTH,
  MAX_RUNTIME_MINUTES,
  MIN_RUNTIME_MINUTES,
  TERRAIN_LABEL_KEYS,
  TERRAIN_VALUES,
  type FormatDetailKey,
  type FormatDetails,
  type GatheringFamily,
  type Terrain,
} from "../gatheringCatalog";
import styles from "../CreateGatheringPage.module.css";

/** The three yes-or-unsaid questions a family can ask. */
type BooleanDetailKey =
  "isAdultsOnly" | "isSoberFriendly" | "isBeginnerFriendly";

type DetailChangeHandler = <Key extends FormatDetailKey>(
  key: Key,
  value: FormatDetails[Key],
) => void;

interface DetailFieldsProps {
  detailKeys: readonly FormatDetailKey[];
  details: FormatDetails;
  onChange: DetailChangeHandler;
}

/** The stored answer to one of the three booleans, read as ticked or not. */
function isBooleanDetailOn(
  details: FormatDetails,
  key: BooleanDetailKey,
): boolean {
  return details[key] ?? false;
}

/** `false` is a real answer for none of the three: unticking means "the host
 *  has not said", which is `undefined`, so the bag stores only what the host
 *  actually chose. */
function booleanDetailValue(isOn: boolean): true | undefined {
  return isOn ? true : undefined;
}

/** A typed runtime, or `undefined` for an empty or unreadable field. */
function parsedRuntime(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function terrainOptions(t: TFunction) {
  return TERRAIN_VALUES.map((terrain) => ({
    value: terrain,
    label: t(TERRAIN_LABEL_KEYS[terrain]),
  }));
}

/**
 * The one or two questions this family actually raises, and nothing else.
 *
 * A picnic asks what to bring, a club night asks about the door and about
 * sober options, a walk asks about the ground, a screening asks how long the
 * film runs, and four of the nine families (meet, learn, care, organise) ask
 * nothing at all and render no block.
 *
 * Takes a family and a bag rather than the wizard's whole form object, because
 * the edit modal mounts the same component against a draft. `variant="wizard"`
 * draws each question as a Create Gathering v2 field (sentence-case label,
 * hint under the control, switch rows for the booleans); the default `modal`
 * keeps the edit modal's look.
 */
export function FormatDetailsFields({
  family,
  details,
  onChange,
  variant = "modal",
}: {
  family: GatheringFamily;
  details: FormatDetails;
  onChange: DetailChangeHandler;
  variant?: "wizard" | "modal";
}) {
  const detailKeys = allowedDetailKeys(family);
  if (detailKeys.length === 0) return null;
  return variant === "wizard" ? (
    <WizardDetailFields
      detailKeys={detailKeys}
      details={details}
      onChange={onChange}
    />
  ) : (
    <ModalDetailFields
      detailKeys={detailKeys}
      details={details}
      onChange={onChange}
    />
  );
}

/** The create wizard's look: one v2 `Field` per question. */
function WizardDetailFields({
  detailKeys,
  details,
  onChange,
}: DetailFieldsProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <>
      {detailKeys.map((key) => {
        if (key === "bring") {
          const inputId = `${fieldId}-bring`;
          return (
            <Field
              key={key}
              label={t(FORMAT_DETAIL_LABEL_KEYS.bring)}
              htmlFor={inputId}
              isOptional
              hint={t(FORMAT_DETAIL_HINT_KEYS.bring)}
            >
              <TextInput
                id={inputId}
                type="text"
                aria-describedby={`${inputId}-hint`}
                maxLength={MAX_BRING_LENGTH}
                value={details.bring ?? ""}
                onChange={(event) => onChange("bring", event.target.value)}
              />
            </Field>
          );
        }
        if (key === "terrain") {
          const selectId = `${fieldId}-terrain`;
          return (
            <Field
              key={key}
              label={t(FORMAT_DETAIL_LABEL_KEYS.terrain)}
              htmlFor={selectId}
              labelId={`${selectId}-label`}
              isOptional
              hint={t(FORMAT_DETAIL_HINT_KEYS.terrain)}
            >
              <Select
                id={selectId}
                labelledBy={`${selectId}-label`}
                aria-describedby={`${selectId}-hint`}
                options={terrainOptions(t)}
                value={details.terrain ?? null}
                clearable
                onChange={(value) =>
                  onChange("terrain", (value as Terrain | null) ?? undefined)
                }
              />
            </Field>
          );
        }
        if (key === "runtimeMinutes") {
          const inputId = `${fieldId}-runtime`;
          return (
            <Field
              key={key}
              label={t(FORMAT_DETAIL_LABEL_KEYS.runtimeMinutes)}
              htmlFor={inputId}
              isOptional
              hint={t(FORMAT_DETAIL_HINT_KEYS.runtimeMinutes)}
            >
              <TextInput
                id={inputId}
                type="number"
                aria-describedby={`${inputId}-hint`}
                min={MIN_RUNTIME_MINUTES}
                max={MAX_RUNTIME_MINUTES}
                value={
                  details.runtimeMinutes === undefined
                    ? ""
                    : String(details.runtimeMinutes)
                }
                onChange={(event) =>
                  onChange("runtimeMinutes", parsedRuntime(event.target.value))
                }
              />
            </Field>
          );
        }
        return (
          <SwitchRow
            key={key}
            variant="compact"
            title={t(FORMAT_DETAIL_LABEL_KEYS[key])}
            description={t(FORMAT_DETAIL_HINT_KEYS[key])}
            isChecked={isBooleanDetailOn(details, key)}
            onChange={(isOn) => onChange(key, booleanDetailValue(isOn))}
          />
        );
      })}
    </>
  );
}

/** The edit modal's look: uppercase labels, the hint above the control. */
function ModalDetailFields({
  detailKeys,
  details,
  onChange,
}: DetailFieldsProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <>
      {detailKeys.map((key) => {
        if (key === "bring") {
          return (
            <div key={key}>
              <label className={styles.label} htmlFor={`${fieldId}-bring`}>
                {t(FORMAT_DETAIL_LABEL_KEYS.bring)}
              </label>
              <p className={styles.hint} id={`${fieldId}-bring-hint`}>
                {t(FORMAT_DETAIL_HINT_KEYS.bring)}
              </p>
              <input
                id={`${fieldId}-bring`}
                className={styles.input}
                type="text"
                aria-describedby={`${fieldId}-bring-hint`}
                maxLength={MAX_BRING_LENGTH}
                value={details.bring ?? ""}
                onChange={(event) => onChange("bring", event.target.value)}
              />
            </div>
          );
        }
        if (key === "terrain") {
          return (
            <div key={key}>
              <label
                className={styles.label}
                id={`${fieldId}-terrain-label`}
                htmlFor={`${fieldId}-terrain`}
              >
                {t(FORMAT_DETAIL_LABEL_KEYS.terrain)}
              </label>
              <p className={styles.hint} id={`${fieldId}-terrain-hint`}>
                {t(FORMAT_DETAIL_HINT_KEYS.terrain)}
              </p>
              <Select
                id={`${fieldId}-terrain`}
                className={styles.formatDetailSelect}
                labelledBy={`${fieldId}-terrain-label`}
                aria-describedby={`${fieldId}-terrain-hint`}
                options={terrainOptions(t)}
                value={details.terrain ?? null}
                clearable
                onChange={(value) =>
                  onChange("terrain", (value as Terrain | null) ?? undefined)
                }
              />
            </div>
          );
        }
        if (key === "runtimeMinutes") {
          return (
            <div key={key}>
              <label className={styles.label} htmlFor={`${fieldId}-runtime`}>
                {t(FORMAT_DETAIL_LABEL_KEYS.runtimeMinutes)}
              </label>
              <p className={styles.hint} id={`${fieldId}-runtime-hint`}>
                {t(FORMAT_DETAIL_HINT_KEYS.runtimeMinutes)}
              </p>
              <input
                id={`${fieldId}-runtime`}
                className={styles.input}
                type="number"
                aria-describedby={`${fieldId}-runtime-hint`}
                min={MIN_RUNTIME_MINUTES}
                max={MAX_RUNTIME_MINUTES}
                value={
                  details.runtimeMinutes === undefined
                    ? ""
                    : String(details.runtimeMinutes)
                }
                onChange={(event) =>
                  onChange("runtimeMinutes", parsedRuntime(event.target.value))
                }
              />
            </div>
          );
        }
        // The three booleans. `CheckLine` carries its own title, sub and
        // pressed state, so the switch below stays one line per question.
        return (
          <div key={key} className={styles.formatDetailCheck}>
            <CheckLine
              checked={isBooleanDetailOn(details, key)}
              onChange={(nextChecked) =>
                onChange(key, booleanDetailValue(nextChecked))
              }
              title={t(FORMAT_DETAIL_LABEL_KEYS[key])}
              sub={t(FORMAT_DETAIL_HINT_KEYS[key])}
            />
          </div>
        );
      })}
    </>
  );
}

import { useId } from "react";
import { CheckLine, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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

/**
 * The one or two questions this family actually raises, and nothing else.
 *
 * The wizard's step-1 copy has always promised that the format "determines
 * some of the fields that follow" and nothing downstream ever read it. This is
 * that promise, kept at the smallest honest size: a picnic asks what to bring,
 * a club night asks about the door and about sober options, a walk asks about
 * the ground, a screening asks how long the film runs, and four of the nine
 * families (meet, learn, care, organise) ask nothing at all and render no
 * block.
 *
 * Takes a family and a bag rather than the wizard's whole form object, because
 * the edit modal mounts the same component against a draft.
 */
export function FormatDetailsFields({
  family,
  details,
  onChange,
}: {
  family: GatheringFamily;
  details: FormatDetails;
  onChange: <Key extends FormatDetailKey>(
    key: Key,
    value: FormatDetails[Key],
  ) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const detailKeys = allowedDetailKeys(family);
  if (detailKeys.length === 0) return null;

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
                options={TERRAIN_VALUES.map((terrain) => ({
                  value: terrain,
                  label: t(TERRAIN_LABEL_KEYS[terrain]),
                }))}
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
                onChange={(event) => {
                  const parsed = Number.parseInt(event.target.value, 10);
                  onChange(
                    "runtimeMinutes",
                    Number.isFinite(parsed) ? parsed : undefined,
                  );
                }}
              />
            </div>
          );
        }
        // The three booleans. `CheckLine` carries its own title, sub and
        // pressed state, so the switch below stays one line per question.
        const isAnsweredYes =
          key === "isAdultsOnly"
            ? (details.isAdultsOnly ?? false)
            : key === "isSoberFriendly"
              ? (details.isSoberFriendly ?? false)
              : (details.isBeginnerFriendly ?? false);
        return (
          <div key={key} className={styles.formatDetailCheck}>
            <CheckLine
              checked={isAnsweredYes}
              onChange={(nextChecked) =>
                onChange(
                  key,
                  // `false` is a real answer for none of the three: unticking
                  // means "the host has not said", which is `undefined`, so
                  // the bag never stores a negative nobody chose.
                  nextChecked ? true : undefined,
                )
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

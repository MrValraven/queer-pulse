import { useEffect, useRef } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, FormField, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import { missingCreditFieldOf, type CreditRow } from "./studioUploadCredits";
import fieldStyles from "./StudioTrackFields.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

export type { CreditRow } from "./studioUploadCredits";

let creditRowSequence = 0;
function createCreditRowId(): string {
  creditRowSequence += 1;
  return `credit-${creditRowSequence}`;
}

/** One credit row, with visible Name and Role labels. A direct child of
 *  AnimatePresence, so `useIsPresent` can make it inert while it fades out.
 *  `missingField` marks the half a half-filled row still needs. */
function CreditRowItem({
  credit,
  number,
  missingField,
  onEdit,
  onRemove,
}: {
  credit: CreditRow;
  number: number;
  missingField: "name" | "role" | null;
  onEdit: (field: "name" | "role", value: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const fieldClass = `${fieldStyles.studioField} ${tracksStyles.creditField}`;
  return (
    <m.div
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className={tracksStyles.creditRow}
      data-credit-id={credit.id}
      inert={!isPresent}
    >
      <FormField
        className={fieldClass}
        label={t("studio:uploadFlow.files.creditNameLabel")}
        error={
          missingField === "name"
            ? t("studio:uploadFlow.files.creditNeedsName")
            : undefined
        }
      >
        <input
          type="text"
          value={credit.name}
          maxLength={STUDIO_LIMITS.creditFieldMax}
          aria-label={t("studio:uploadFlow.files.creditName", { number })}
          onChange={(event) => onEdit("name", event.target.value)}
        />
      </FormField>
      <FormField
        className={fieldClass}
        label={t("studio:uploadFlow.files.creditRoleLabel")}
        error={
          missingField === "role"
            ? t("studio:uploadFlow.files.creditNeedsRole")
            : undefined
        }
      >
        <input
          type="text"
          value={credit.role}
          maxLength={STUDIO_LIMITS.creditFieldMax}
          aria-label={t("studio:uploadFlow.files.creditRole", { number })}
          onChange={(event) => onEdit("role", event.target.value)}
        />
      </FormField>
      <IconButton
        className={tracksStyles.creditRemove}
        onClick={onRemove}
        aria-label={t("studio:uploadFlow.files.removeCredit", { number })}
        tooltip
      >
        <FiX aria-hidden />
      </IconButton>
    </m.div>
  );
}

/** The credit rows of the track details panel. A removed row hands focus
 *  to the next credit's name, else the previous one's, else Add a credit. */
export function StudioUploadCreditsFieldset({
  credits,
  onChange,
  shouldShowErrors = false,
}: {
  credits: readonly CreditRow[];
  onChange: (credits: CreditRow[]) => void;
  /** After a refused save: half-filled rows say which half they need. */
  shouldShowErrors?: boolean;
}) {
  const { t } = useTranslation();
  const creditsRef = useRef<HTMLFieldSetElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const focusFrameRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (focusFrameRef.current !== null)
        cancelAnimationFrame(focusFrameRef.current);
    },
    [],
  );

  function changeCredit(rowId: string, field: "name" | "role", value: string) {
    onChange(
      credits.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    );
  }

  // The removed row fades out in place, so focus goes by id to a row that
  // stays.
  function removeCredit(index: number) {
    const neighbour = credits[index + 1] ?? credits[index - 1];
    onChange(credits.filter((_row, rowIndex) => rowIndex !== index));
    if (focusFrameRef.current !== null)
      cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      const target = neighbour
        ? creditsRef.current?.querySelector<HTMLInputElement>(
            `[data-credit-id="${neighbour.id}"] input`,
          )
        : addButtonRef.current;
      target?.focus();
    });
  }

  return (
    <fieldset ref={creditsRef} className={tracksStyles.credits}>
      <legend>{t("studio:uploadFlow.files.creditsLabel")}</legend>
      <AnimatePresence initial={false}>
        {credits.map((credit, index) => (
          <CreditRowItem
            key={credit.id}
            credit={credit}
            number={index + 1}
            missingField={
              shouldShowErrors ? missingCreditFieldOf(credit) : null
            }
            onEdit={(field, value) => changeCredit(credit.id, field, value)}
            onRemove={() => removeCredit(index)}
          />
        ))}
      </AnimatePresence>
      {credits.length < STUDIO_LIMITS.creditsMax && (
        <Button
          ref={addButtonRef}
          variant="quiet"
          size="sm"
          className={tracksStyles.addCredit}
          onClick={() =>
            onChange([
              ...credits,
              { id: createCreditRowId(), name: "", role: "" },
            ])
          }
        >
          <FiPlus aria-hidden /> {t("studio:uploadFlow.files.addCredit")}
        </Button>
      )}
    </fieldset>
  );
}

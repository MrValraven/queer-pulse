import { useEffect, useRef } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import tracksStyles from "./StudioUploadTracks.module.css";

/** One editable credit. `id` keys the row on screen; the save strips it. */
export interface CreditRow {
  id: string;
  name: string;
  role: string;
}

let creditRowSequence = 0;
function createCreditRowId(): string {
  creditRowSequence += 1;
  return `credit-${creditRowSequence}`;
}

/** One credit row. A direct child of AnimatePresence, so `useIsPresent` can
 *  make it inert while it fades out. */
function CreditRowItem({
  credit,
  number,
  onEdit,
  onRemove,
}: {
  credit: CreditRow;
  number: number;
  onEdit: (field: "name" | "role", value: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
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
      <input
        type="text"
        value={credit.name}
        maxLength={STUDIO_LIMITS.creditFieldMax}
        aria-label={t("studio:uploadFlow.files.creditName", { number })}
        onChange={(event) => onEdit("name", event.target.value)}
      />
      <input
        type="text"
        value={credit.role}
        maxLength={STUDIO_LIMITS.creditFieldMax}
        aria-label={t("studio:uploadFlow.files.creditRole", { number })}
        onChange={(event) => onEdit("role", event.target.value)}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("studio:uploadFlow.files.removeCredit", { number })}
      >
        <FiX aria-hidden />
      </button>
    </m.div>
  );
}

/** The credit rows of the track details panel. A removed row hands focus
 *  to the next credit's name, else the previous one's, else Add a credit. */
export function StudioUploadCreditsFieldset({
  credits,
  onChange,
}: {
  credits: readonly CreditRow[];
  onChange: (credits: CreditRow[]) => void;
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
            onEdit={(field, value) => changeCredit(credit.id, field, value)}
            onRemove={() => removeCredit(index)}
          />
        ))}
      </AnimatePresence>
      {credits.length < STUDIO_LIMITS.creditsMax && (
        <button
          ref={addButtonRef}
          type="button"
          className={tracksStyles.addCredit}
          onClick={() =>
            onChange([
              ...credits,
              { id: createCreditRowId(), name: "", role: "" },
            ])
          }
        >
          <FiPlus aria-hidden /> {t("studio:uploadFlow.files.addCredit")}
        </button>
      )}
    </fieldset>
  );
}

import { FiShield } from "react-icons/fi";
import type { Language, TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  feeChoiceInListKey,
  matchFeeChoice,
  resolveFeeChoice,
} from "./therapistFeeOptions";
import type { TherapistView } from "./therapistView";
import {
  CELL_GAP,
  PracticalCell,
  PracticalRow,
} from "./TherapistPracticalCells";
import { RevealBlock, RevealList } from "./TherapistReveal";
import styles from "./TherapistPractical.module.css";

/** The chosen payment methods as one phrase in the reader's language ("MB
 *  WAY, bank transfer or card"). Known methods use their in-list label, other
 *  entries stay as stored, and only the phrase's first letter is capitalised.
 *  British English keeps the list free of an Oxford comma. Falls back to the
 *  older payment text. */
function paymentText(
  t: TFunction,
  language: Language,
  fees: TherapistView["fees"],
): string {
  const labels = (fees?.paymentMethods ?? [])
    .map((method) => {
      const choice = matchFeeChoice(t, "paymentMethods", method);
      return choice ? t(feeChoiceInListKey(choice)) : method.trim();
    })
    .filter(Boolean);
  if (labels.length === 0) return fees?.payment ?? "";
  const locale = language === "pt" ? "pt-PT" : "en-GB";
  const phrase = new Intl.ListFormat(locale, {
    type: "disjunction",
  }).format(labels);
  return phrase.charAt(0).toLocaleUpperCase(locale) + phrase.slice(1);
}

/** The notice ("24 hours' notice") then the owner's note, as one line. A
 *  full stop joins them unless the notice already ends a sentence. */
function cancellationText(t: TFunction, fees: TherapistView["fees"]): string {
  const notice = resolveFeeChoice(
    t,
    "cancellationNotice",
    fees?.cancellationNotice ?? "",
  );
  const note = fees?.cancellation ?? "";
  if (!notice || !note) return notice || note;
  const isSentenceEnded = /[.!?…]$/.test(notice);
  return `${notice}${isSentenceEnded ? " " : ". "}${note}`;
}

export function SmallPrintCell({ view }: { view: TherapistView }) {
  const { t, language } = useTranslation();
  const fees = view.fees;
  // Each key is also the row's heading key under `smallPrint.`.
  const rows: { key: string; value: string }[] = [
    {
      key: "receiptTime",
      value: resolveFeeChoice(t, "receiptTime", fees?.receiptTime ?? ""),
    },
    { key: "payment", value: paymentText(t, language, fees) },
    { key: "cancellation", value: cancellationText(t, fees) },
  ].filter((row) => row.value !== "");
  const receipts = fees?.receipts ?? "";
  return (
    <PracticalCell
      icon={FiShield}
      title={t("subprofiles:therapist.practical.smallPrint.title")}
    >
      <RevealBlock
        isShown={!receipts && rows.length === 0}
        parentGap={CELL_GAP}
      >
        <p className={styles.missing}>
          {t("subprofiles:therapist.practical.smallPrint.unknown")}
        </p>
      </RevealBlock>
      <RevealBlock isShown={receipts !== ""} parentGap={CELL_GAP}>
        <p className={styles.soloLine}>{receipts}</p>
      </RevealBlock>
      <RevealBlock isShown={rows.length > 0} parentGap={CELL_GAP}>
        <dl className={styles.rows}>
          <RevealList>
            {rows.map((row) => (
              <PracticalRow
                key={row.key}
                label={t(
                  `subprofiles:therapist.practical.smallPrint.${row.key}`,
                )}
                value={row.value}
              />
            ))}
          </RevealList>
        </dl>
      </RevealBlock>
    </PracticalCell>
  );
}

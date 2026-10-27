import type { ReactNode } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import type { AdminFinLine } from "./api/adminGovernanceFinances.api";
import { buildLedgerComposition, enabledLines } from "./adminGovernanceLedger";
import {
  CompositionBar,
  LedgerRow,
  RemainderRow,
} from "./AdminGovernanceLedgerParts";
import styles from "./AdminGovernancePage.module.css";

type LedgerKind = "income" | "expense";

const EMPTY_COPY: Record<LedgerKind, { lineKey: string; ctaKey: string }> = {
  income: {
    lineKey: "governance.ledgerCard.empty.income",
    ctaKey: "governance.ledgerCard.empty.addIncome",
  },
  expense: {
    lineKey: "governance.ledgerCard.empty.expense",
    ctaKey: "governance.ledgerCard.empty.addExpense",
  },
};

/** One "where it comes from / where it goes" card: a stacked bar of the
 *  enabled lines against the card total, then one row per line. */
export function LedgerCard({
  titleKey,
  subKey,
  total,
  lines,
  note,
  kind,
  onEdit,
}: {
  titleKey: string;
  subKey: string;
  total: number | null;
  lines: AdminFinLine[];
  note?: ReactNode;
  kind: LedgerKind;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const shownLines = enabledLines(lines);
  const composition = buildLedgerComposition(shownLines, total, demoMode);
  const hasLines = shownLines.length > 0;

  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey={`admin:${titleKey}`}
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.cardSub}>
          {t(`admin:${subKey}`, { amount: fmt.currency(total ?? 0, "EUR") })}
        </p>
      </div>
      {hasLines ? (
        <>
          <CompositionBar composition={composition} />
          <ul className={styles.ledgerRows}>
            {composition.shares.map((share, index) => (
              <LedgerRow
                key={`${index}-${share.line.label}`}
                share={share}
                onEdit={onEdit}
              />
            ))}
            {composition.hasRemainder && (
              <RemainderRow composition={composition} onEdit={onEdit} />
            )}
          </ul>
        </>
      ) : (
        <LedgerEmpty kind={kind} onEdit={onEdit} />
      )}
      {note && (
        <div className={styles.ledgerFoot}>
          <p className={styles.ledgerNote}>{note}</p>
        </div>
      )}
    </div>
  );
}

function LedgerEmpty({
  kind,
  onEdit,
}: {
  kind: LedgerKind;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const copy = EMPTY_COPY[kind];
  return (
    <div className={styles.ledgerEmpty}>
      <p className={styles.ledgerEmptyLine}>{t(`admin:${copy.lineKey}`)}</p>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <FiPlus aria-hidden />
        {t(`admin:${copy.ctaKey}`)}
      </Button>
    </div>
  );
}

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
import { AdminEmptyState, AdminPanel } from "./ui";
import styles from "./AdminGovernancePage.module.css";
import { formatEuro } from "./adminEuro";

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

/** One "where it comes from / where it goes" panel: a stacked bar of the
 *  enabled lines against the panel total, then one row per line. */
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
    <AdminPanel
      className={styles.ledgerCard}
      bodyClassName={styles.ledgerBody}
      title={
        <Translation
          i18nKey={`admin:${titleKey}`}
          components={{ em: <em /> }}
        />
      }
      description={t(`admin:${subKey}`, {
        amount: formatEuro(fmt, total ?? 0),
      })}
    >
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
    </AdminPanel>
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
    <AdminEmptyState
      size="inline"
      title={t(`admin:${copy.lineKey}`)}
      action={
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <FiPlus aria-hidden />
          {t(`admin:${copy.ctaKey}`)}
        </Button>
      }
    />
  );
}

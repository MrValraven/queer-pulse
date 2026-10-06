import { useState } from "react";
import { Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FinancesEditFooter } from "./AdminGovernanceFinancesEditCells";
import {
  NotesFields,
  PartnersFields,
  ReserveFields,
  StatsFields,
} from "./AdminGovernanceFinancesReportFields";
import {
  buildReportBody,
  reportBlockedReason,
  toReportDrafts,
  type ReportDrafts,
  type ScopeResolver,
} from "./adminGovernanceFinancesReport.utils";
import { useUpdateAdminFinances } from "./api/useAdminGovernanceFinances";
import type { AdminFinanceLatest } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/**
 * PRD-447. The second Finances dialog: the words and disclosures the public
 * Governance page shows beside the figures (stat tiles, "How event finances
 * work" notes, disclosed partners, the operational reserve). Each list is
 * sent whole and only when it changed; the backend records one audit row per
 * changed list.
 */
export function AdminGovernanceFinancesReportEdit({
  latest,
  onClose,
}: {
  latest: AdminFinanceLatest;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminFinances();
  // A partner seeded before PRD-447 carries an i18n key; the editor shows its
  // words in the admin's language. Left as shown, the key goes back with the
  // save; edited, the typed words replace it (`buildReportBody`).
  const resolveScope: ScopeResolver = (partner) =>
    partner.scope ?? (partner.scopeKey ? t(partner.scopeKey) : "");
  const [drafts, setDrafts] = useState<ReportDrafts>(() =>
    toReportDrafts(latest, resolveScope),
  );

  const blockedReason = reportBlockedReason(drafts);
  const body =
    blockedReason === null ? buildReportBody(drafts, latest, resolveScope) : {};
  const blockedMessage =
    blockedReason === "amount"
      ? t("admin:governance.finances.edit.blockedByAmounts")
      : blockedReason === "text"
        ? t("admin:governance.finances.report.blockedByText")
        : null;

  const setSection = <Key extends keyof ReportDrafts>(
    key: Key,
    value: ReportDrafts[Key],
  ): void => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = () => {
    if (Object.keys(body).length === 0) {
      showToast(t("admin:governance.finances.edit.noChanges"), "info");
      onClose();
      return;
    }
    update.mutate(body, {
      onSuccess: () => {
        showToast(t("admin:governance.finances.report.saved"), "success");
        onClose();
      },
      onError: () => {
        showToast(t("admin:governance.finances.edit.error"), "error");
      },
    });
  };

  return (
    <Modal
      full
      onClose={onClose}
      eyebrow={t("admin:governance.finances.edit.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.finances.report.title"
          components={{ em: <em /> }}
        />
      }
      sub={
        <span className={styles.sub}>
          {t("admin:governance.finances.report.sub")}
        </span>
      }
      footer={
        <FinancesEditFooter
          changeCount={Object.keys(body).length}
          blockedMessage={blockedMessage}
          isPending={update.isPending}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    >
      <div className={styles.body}>
        <StatsFields
          rows={drafts.stats}
          onChange={(rows) => setSection("stats", rows)}
        />
        <NotesFields
          rows={drafts.eventNotes}
          onChange={(rows) => setSection("eventNotes", rows)}
        />
        <PartnersFields
          rows={drafts.partners}
          onChange={(rows) => setSection("partners", rows)}
        />
        <ReserveFields
          reserve={drafts.reserve}
          onChange={(reserve) => setSection("reserve", reserve)}
        />
      </div>
    </Modal>
  );
}

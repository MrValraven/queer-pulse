import { useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { RosterIssueResult } from "./api/cards.api";
import { useIssueAllCards } from "./api/useCardProgram";

/**
 * Bulk-issue cards across the roster, as its own deliberate act.
 *
 * This used to ride along on the designer's Save, so an owner nudging the
 * accent colour issued to the whole roster without asking. It is now a
 * separate, confirmed action that states what it will do to each group of
 * members, and reports back what it actually did rather than a single total
 * that counts members nothing happened to.
 */
export function CardIssueAction({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const issueAll = useIssueAllCards(slug);
  const [isConfirming, setIsConfirming] = useState(false);

  const issue = async () => {
    try {
      const result = await issueAll.mutateAsync();
      setIsConfirming(false);
      showToast(summarize(result, t), "success");
    } catch {
      setIsConfirming(false);
      showToast(t("common:toast.saveFailed"), "error");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirming(true)}
        disabled={issueAll.isPending}
      >
        {t("cards:modTools.issue")}
      </Button>

      <ConfirmDialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={() => void issue()}
        loading={issueAll.isPending}
        title={t("cards:modTools.issueConfirm.title")}
        description={t("cards:modTools.issueConfirm.body")}
        confirmLabel={t("cards:modTools.issueConfirm.confirm")}
        cancelLabel={t("communities:edit.cancel")}
      />
    </>
  );
}

/**
 * The result as one sentence, dropping the groups that came back empty. A
 * fixed "issued {n}, renewed {n}, skipped {n}" string would report three
 * numbers where usually only one of them is non-zero, and "0 skipped" invites
 * an owner to wonder what could have been skipped.
 */
function summarize(result: RosterIssueResult, t: TFunction): string {
  const parts: string[] = [];
  if (result.issued > 0) {
    parts.push(t("cards:modTools.issued.new", { count: result.issued }));
  }
  if (result.renewed > 0) {
    parts.push(t("cards:modTools.issued.renewed", { count: result.renewed }));
  }
  if (parts.length === 0) {
    parts.push(t("cards:modTools.issued.none"));
  }
  if (result.skipped > 0) {
    parts.push(t("cards:modTools.issued.skipped", { count: result.skipped }));
  }
  return parts.join(" ");
}

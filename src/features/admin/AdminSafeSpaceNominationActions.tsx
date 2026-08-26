import { useState } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AdminSafeSpaceDecideForm,
  AdminSafeSpaceReopenForm,
} from "./AdminSafeSpaceDecideForm";
import { useAdminSafeSpaceNominationAction } from "../safety/api/useAdminSafeSpaceNominations";
import type { AdminSafeSpaceNominationDTO } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/** The states the backend will accept a decision in. */
const DECIDABLE_STATUSES = ["acknowledged", "in_review"];

/**
 * Everything a reviewer can do to one nomination, in the order the published
 * six steps happen: acknowledge it (which stops the 48-hour clock and tells
 * the nominator), tie it to the listing under review so member visits can be
 * counted against it, then decide or re-open.
 *
 * Assigning also acknowledges a nomination nobody has acknowledged yet, so the
 * clock never reports a breach that is not one.
 */
export function AdminSafeSpaceNominationActions({
  nomination,
}: {
  nomination: AdminSafeSpaceNominationDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useAdminSafeSpaceNominationAction();
  const [listingRef, setListingRef] = useState(nomination.listingRef ?? "");
  const [note, setNote] = useState("");

  const isDecided = Boolean(nomination.decidedAt);
  const canDecide = DECIDABLE_STATUSES.includes(nomination.status);

  function acknowledge() {
    action.mutate(
      { kind: "acknowledge", id: nomination.id, note: note.trim() },
      {
        onSuccess: () => {
          showToast(t("safety:governance.toast.acknowledged"), "success");
          setNote("");
        },
        onError: () => showToast(t("safety:governance.toast.failed"), "error"),
      },
    );
  }

  function assign() {
    action.mutate(
      {
        kind: "assign",
        id: nomination.id,
        listingRef: listingRef.trim(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          showToast(t("safety:governance.toast.assigned"), "success");
          setNote("");
        },
        onError: () => showToast(t("safety:governance.toast.failed"), "error"),
      },
    );
  }

  return (
    <div className={styles.formStack}>
      {!nomination.acknowledgedAt && (
        <>
          <FormField
            label={t("safety:governance.action.acknowledgeLabel")}
            helper={t("safety:governance.action.acknowledgeHelper")}
          >
            <input
              className={styles.input}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("safety:governance.action.notePlaceholder")}
            />
          </FormField>
          <div className={styles.actionRow}>
            <Button
              variant="primary"
              disabled={action.isPending}
              onClick={acknowledge}
            >
              {t("safety:governance.action.acknowledgeCta")}
            </Button>
          </div>
        </>
      )}

      {!isDecided && (
        <>
          <FormField
            label={t("safety:governance.action.assignLabel")}
            helper={t("safety:governance.action.assignHelper")}
          >
            <input
              className={styles.input}
              value={listingRef}
              onChange={(event) => setListingRef(event.target.value)}
              placeholder={t("safety:governance.action.assignPlaceholder")}
            />
          </FormField>
          <div className={styles.actionRow}>
            <Button
              variant="ghost"
              disabled={!listingRef.trim() || action.isPending}
              onClick={assign}
            >
              {t("safety:governance.action.assignCta")}
            </Button>
          </div>
        </>
      )}

      {canDecide && <AdminSafeSpaceDecideForm nominationId={nomination.id} />}
      {isDecided && <AdminSafeSpaceReopenForm nominationId={nomination.id} />}
    </div>
  );
}

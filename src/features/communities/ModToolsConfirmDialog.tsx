import { useState } from "react";
import { ConfirmDialog, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { modConfirmCopy } from "./modToolsConfirm";
import { REASON_LABEL_KEYS, type ReasonCode } from "../safety/reportReasons";
import type { ModReport } from "./community.model";
import type { ModConfirmTarget } from "./useModToolsActions";

/**
 * Why a community moderator took something down.
 *
 * The post/reply reason set, minus `outing` and `doxxing`: those two are
 * emergency severity, and the server does not let a community moderator settle
 * an emergency report at all (TS-07). Offering them here would be offering a
 * button that always 403s.
 */
const REMOVAL_REASONS: ReasonCode[] = [
  "harassment",
  "hate_speech",
  "discrimination",
  "spam",
  "off_topic",
  "other",
];

/** The longest note the backend accepts (`ModActionDto.note`). */
const NOTE_MAX_LENGTH = 2000;

/**
 * The one confirmation step in front of every irreversible mod action.
 *
 * Removing a member, taking a post down and moving someone in or out of
 * co-ownership are each confirmed first, the same rule the danger zone
 * follows. It lives outside the console shell because the dialog outlives the
 * pane that opened it: a mod can only reach these actions from Members and
 * Reports, but the answer belongs to the tab, not to whichever pane is
 * showing.
 *
 * A takedown takes the longer route (`RemoveReportDialog`): since TS-08 it is
 * filed as a real `remove_content` action carrying the moderator's own reason
 * and words, so the confirmation is where those are collected.
 */
export function ModToolsConfirmDialog({
  confirming,
  isPending,
  onClose,
  onRemoveMember,
  onGrantCoOwner,
  onRevokeCoOwner,
  onRemoveReport,
}: {
  confirming: ModConfirmTarget;
  isPending: boolean;
  onClose: () => void;
  onRemoveMember: (memberSlug: string | undefined, name: string) => void;
  onGrantCoOwner: (memberSlug: string | undefined, name: string) => void;
  onRevokeCoOwner: (memberSlug: string | undefined, name: string) => void;
  onRemoveReport: (
    report: ModReport,
    decision: { reasonCode: ReasonCode; note: string },
  ) => void;
}) {
  const { t } = useTranslation();

  if (confirming.kind === "removeReport") {
    return (
      <RemoveReportDialog
        report={confirming.report}
        isPending={isPending}
        onClose={onClose}
        onConfirm={onRemoveReport}
      />
    );
  }

  const copy = modConfirmCopy(confirming, t);

  return (
    <ConfirmDialog
      open
      tone={copy.tone}
      loading={isPending}
      title={copy.title}
      description={copy.body}
      confirmLabel={isPending ? t("communities:common.loading") : copy.cta}
      onClose={onClose}
      onConfirm={() => {
        if (confirming.kind === "removeMember") {
          onRemoveMember(confirming.memberSlug, confirming.name);
        } else if (confirming.kind === "grantCoOwner") {
          onGrantCoOwner(confirming.memberSlug, confirming.name);
        } else {
          onRevokeCoOwner(confirming.memberSlug, confirming.name);
        }
      }}
    />
  );
}

/**
 * The takedown confirmation: which rule was broken, and the moderator's own
 * words about it.
 *
 * Both travel with the action to `PATCH /mod/reports/:id`, so the audit trail
 * reads "Removed content · Hate speech" with a sentence under it, instead of
 * the empty "Dismissed" every community removal used to be recorded as. The
 * note is required for exactly that reason: a takedown with no stated reason
 * is the thing this replaced.
 */
function RemoveReportDialog({
  report,
  isPending,
  onClose,
  onConfirm,
}: {
  report: ModReport;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (
    report: ModReport,
    decision: { reasonCode: ReasonCode; note: string },
  ) => void;
}) {
  const { t } = useTranslation();
  const [reasonCode, setReasonCode] = useState<ReasonCode>("other");
  const [note, setNote] = useState("");

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={isPending}
      title={t("communities:detail.modtools.confirm.removePost.title")}
      description={t("communities:detail.modtools.confirm.removePost.body")}
      confirmLabel={
        isPending
          ? t("communities:common.loading")
          : t("communities:detail.modtools.confirm.removePost.confirmCta")
      }
      onClose={onClose}
      onConfirm={() => onConfirm(report, { reasonCode, note: note.trim() })}
      reason={{
        value: note,
        onChange: setNote,
        label: t("communities:detail.modtools.confirm.removePost.noteLabel"),
        placeholder: t(
          "communities:detail.modtools.confirm.removePost.notePlaceholder",
        ),
        required: true,
        maxLength: NOTE_MAX_LENGTH,
      }}
    >
      <Select
        label={t("communities:detail.modtools.confirm.removePost.reasonLabel")}
        options={REMOVAL_REASONS.map((code) => ({
          value: code,
          label: t(REASON_LABEL_KEYS[code]),
        }))}
        value={reasonCode}
        onChange={(value) => setReasonCode((value ?? "other") as ReasonCode)}
      />
    </ConfirmDialog>
  );
}

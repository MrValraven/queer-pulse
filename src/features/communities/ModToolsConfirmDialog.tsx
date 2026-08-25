import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { modConfirmCopy } from "./modToolsConfirm";
import type { ModReport } from "./community.model";
import type { ModConfirmTarget } from "./useModToolsActions";

/**
 * The one confirmation step in front of every irreversible mod action.
 *
 * Removing a member, taking a post down and moving someone in or out of
 * co-ownership are each confirmed first, the same rule the danger zone
 * follows. It lives outside the console shell because the dialog outlives the
 * pane that opened it: a mod can only reach these actions from Members and
 * Reports, but the answer belongs to the tab, not to whichever pane is
 * showing.
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
  onRemoveReport: (report: ModReport) => void;
}) {
  const { t } = useTranslation();
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
        } else if (confirming.kind === "revokeCoOwner") {
          onRevokeCoOwner(confirming.memberSlug, confirming.name);
        } else {
          onRemoveReport(confirming.report);
        }
      }}
    />
  );
}

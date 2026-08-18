import { SideSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AccountDataDsar } from "./AccountDataDsar";
import { AccountDataExport } from "./AccountDataExport";
import { AccountDataStepAway } from "./AccountDataStepAway";

/**
 * "Your data" side sheet — the member-profile home for the account-lifecycle
 * actions GDPR requires: download (Art. 20), step away or erase (Art. 17),
 * and file a data-subject request (Arts. 15/16/21). Every backend endpoint
 * these sections call already exists (`/account/export`, `/account/deactivate`,
 * `/account/deletion-request`, `/account/dsar`); this is pure frontend wiring
 * onto the shared `SideSheet` primitive.
 */
export function AccountDataSheet({
  onClose,
  ownerSlug,
}: {
  onClose: () => void;
  ownerSlug: string;
}) {
  const { t } = useTranslation();
  return (
    <SideSheet title={t("members:profile.accountData.title")} onClose={onClose}>
      <AccountDataExport />
      <AccountDataStepAway ownerSlug={ownerSlug} />
      <AccountDataDsar />
    </SideSheet>
  );
}

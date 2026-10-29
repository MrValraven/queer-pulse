import { routes } from "../../app/routeMap";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMyPurchases } from "../studio/api/useStudioPurchaseLists";
import { DataCard } from "./SettingsControls";

/** The account pane's way into the member's music purchases. It opens once
 *  the list's first page has a purchase of any status, so a member whose
 *  claim was declined or lapsed still reaches the reason; a member with no
 *  purchase never sees it. The read is silent: a failure leaves the card
 *  closed and raises no toast. */
export function MusicPurchasesCard() {
  const { t } = useTranslation();
  const purchases = useStudioMyPurchases("all", { silentError: true });
  return (
    <Collapse isOpen={purchases.items.length > 0}>
      <DataCard
        title={t("studio:purchase.account.cardTitle")}
        description={t("studio:purchase.account.cardDesc")}
        button={t("studio:purchase.account.cardCta")}
        to={routes.musicPurchases}
      />
    </Collapse>
  );
}

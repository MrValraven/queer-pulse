import { FiMonitor, FiSmartphone } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * The library page's header actions: Open screen and Open remote. Each opens
 * a new tab, so the library stays where it was (the projector tab and the
 * phone remote run beside it).
 */
export function VjLibraryActions() {
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="ghost"
        to={routes.adminVjScreen}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("vj:page.openScreenAria")}
      >
        <FiMonitor aria-hidden />
        {t("vj:page.openScreen")}
      </Button>
      <Button
        variant="ghost"
        to={routes.adminVjRemote}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("vj:page.openRemoteAria")}
      >
        <FiSmartphone aria-hidden />
        {t("vj:page.openRemote")}
      </Button>
    </>
  );
}

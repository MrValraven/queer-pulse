import { Link } from "react-router-dom";
import { SuccessPanel } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import styles from "./housingModals.module.css";

interface HousingEnquirySentProps {
  toName: string;
  /** A MEASURED reply time, when one is on file. */
  responseTime?: string;
  /** The thread the enquiry landed in; null in demo and without a ref. */
  conversationId: string | null;
  onClose: () => void;
}

/** The confirmation `HousingEnquiryModal` swaps in once the server has the
 *  enquiry, handing over the thread it landed in. Renders on the same plum
 *  `SuccessPanel` every first-contact door's confirmation uses (see
 *  `DirectoryEnquiryModal`), so a member sees one success surface no matter
 *  which door they wrote through. */
export function HousingEnquirySent({
  toName,
  responseTime,
  conversationId,
  onClose,
}: HousingEnquirySentProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <SuccessPanel
      title={t("economy:housingModal.message.successTitle")}
      em={t("economy:housingModal.message.successEm")}
      onClose={onClose}
      closeLabel={t("economy:housingModal.done")}
      // Live only: a demo send resolves null, so there is no thread to open.
      footer={
        !demoMode && conversationId ? (
          <Link
            className={styles.threadLink}
            to={`${routes.messages}?c=${encodeURIComponent(conversationId)}`}
          >
            {t("economy:housingModal.message.openThreadCta")}
          </Link>
        ) : undefined
      }
    >
      <Translation
        i18nKey={
          responseTime
            ? "economy:housingModal.message.successBody"
            : "economy:housingModal.message.successBodyNoReplyTime"
        }
        values={{ toName, responseTime: responseTime ?? "" }}
        components={{ strong: <strong /> }}
      />
    </SuccessPanel>
  );
}

import { FiMail, FiPhone } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { mailtoHrefOf, telHrefOf } from "./leadContactLinks";
import styles from "./LeadDetails.module.css";

/** Email and Call in the page header, each folding in while the lead has
 *  that contact. Each fold may shrink to the row, so a long name wraps.
 *  The header slot draws nothing once both have folded away. */
export function LeadContactActions({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.contactActions}>
      <Collapse
        isOpen={lead.email !== null}
        className={styles.contactActionSlot}
      >
        <Button
          variant="ghost"
          size="sm"
          href={mailtoHrefOf(lead.email ?? "")}
          className={styles.contactAction}
        >
          <FiMail aria-hidden />
          {t("admin:leads.details.emailAction", { name: lead.name })}
        </Button>
      </Collapse>
      <Collapse
        isOpen={lead.phone !== null}
        className={styles.contactActionSlot}
      >
        <Button
          variant="ghost"
          size="sm"
          href={telHrefOf(lead.phone ?? "")}
          className={styles.contactAction}
        >
          <FiPhone aria-hidden />
          {t("admin:leads.details.phoneAction", { name: lead.name })}
        </Button>
      </Collapse>
    </div>
  );
}

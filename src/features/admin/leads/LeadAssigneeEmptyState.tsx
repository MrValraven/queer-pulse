import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState } from "../ui";
import {
  LEAD_ASSIGNEE_EMPTY_COPY,
  type LeadAssigneeEmptyViewName,
} from "./leadAssignees.data";

/** An In charge view that matches nothing while it is the only filter: it
 *  names the view ("No leads are assigned to you") and offers Show everyone,
 *  which drops the view and keeps the rest of the address. */
export function LeadAssigneeEmptyState({
  viewName,
  onShowEveryone,
}: {
  viewName: LeadAssigneeEmptyViewName;
  onShowEveryone: () => void;
}) {
  const { t } = useTranslation();
  const copy = LEAD_ASSIGNEE_EMPTY_COPY[viewName];
  return (
    <AdminEmptyState
      icon={copy.icon}
      title={t(copy.titleKey)}
      body={copy.bodyKey !== null ? t(copy.bodyKey) : undefined}
      action={
        <Button onClick={onShowEveryone}>
          {t("admin:leads.empty.showEveryone")}
        </Button>
      }
    />
  );
}

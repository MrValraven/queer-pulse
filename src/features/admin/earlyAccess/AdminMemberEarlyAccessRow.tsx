import { useId } from "react";
import { Collapse, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { useSetMemberEarlyAccess } from "../api/useAdminEarlyAccess";
import type { EarlyAccessGrantDTO } from "../api/adminEarlyAccess.types";
import { AdminAccessRow } from "../AdminAccessRow";
import { earlyAccessFeatureLabel } from "./earlyAccessFeatureLabel";
import accessStyles from "../AdminMemberAccessPanel.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * One feature in the drawer's Early access panel: whether the member has it,
 * since when and who turned it on, with a switch that saves at once. No
 * confirm, since a grant is reversible and every change is audited. The
 * switch has no disabled state, so a flip while this row's save is in flight
 * is ignored. A failed save rolls the switch back and says so right under
 * the status line, above the description, until the next attempt. The
 * description renders as this row's last child, since the shared row draws
 * its `footnote` below its children.
 */
export function AdminMemberEarlyAccessRow({
  memberId,
  featureKey,
  grant,
}: {
  memberId: string;
  featureKey: string;
  grant: EarlyAccessGrantDTO | null;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const setEarlyAccess = useSetMemberEarlyAccess();
  const descriptionId = useId();
  const { name, description } = earlyAccessFeatureLabel(t, featureKey);
  const isSaving = setEarlyAccess.isPending;
  const hasSaveFailed = setEarlyAccess.isError;
  const grantedOn = grant
    ? formatters.date(new Date(grant.grantedAt), DATE_OPTIONS)
    : "";

  return (
    <AdminAccessRow
      title={name}
      status={
        grant
          ? grant.grantedBy
            ? t("admin:earlyAccess.row.on", {
                date: grantedOn,
                staff: grant.grantedBy.displayName,
              })
            : t("admin:earlyAccess.row.onNoStaff", { date: grantedOn })
          : t("admin:earlyAccess.row.off")
      }
      tone={grant ? "on" : "off"}
      action={
        <div aria-busy={isSaving || undefined}>
          <Toggle
            checked={grant !== null}
            label={t("admin:earlyAccess.row.toggleLabel", { feature: name })}
            aria-describedby={description ? descriptionId : undefined}
            onChange={(isGranted) => {
              if (isSaving) return;
              setEarlyAccess.mutate({ memberId, featureKey, isGranted });
            }}
          />
        </div>
      }
    >
      {/* Always mounted, so the error is spoken when it folds in. */}
      <div role="status">
        <Collapse isOpen={hasSaveFailed}>
          <p className={`${accessStyles.footnote} ${accessStyles.status}`}>
            <span
              className={`${accessStyles.dot} ${accessStyles.dot_warn}`}
              aria-hidden
            />
            <span>{t("admin:earlyAccess.row.saveFailed")}</span>
          </p>
        </Collapse>
      </div>
      {description && (
        <p className={accessStyles.footnote}>
          <span id={descriptionId}>{description}</span>
        </p>
      )}
    </AdminAccessRow>
  );
}

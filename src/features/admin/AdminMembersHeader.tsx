import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminPageHeader } from "./ui";

/**
 * The members page header, split out of `AdminMembersPage` to keep that page
 * under the per-component line limit.
 *
 * DES-424: both counts are `undefined` until their read has answered. The
 * header then uses count-free copy, so a loading or failed read never says
 * "0 people" or "0 people are waiting".
 */
export function AdminMembersHeader({
  total,
  pendingCount,
  onOpenSuppression,
}: {
  /** The directory size, once the roster has answered. */
  total: number | undefined;
  /** Pending join requests, once that read has answered. */
  pendingCount: number | undefined;
  onOpenSuppression: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <AdminPageHeader
      eyebrow={t("admin:members.header.eyebrow")}
      title={
        <>
          {total === undefined
            ? t("admin:members.header.titleLine1NoCount")
            : t("admin:members.header.titleLine1", {
                total: fmt.number(total),
              })}
          <br />
          <Translation
            i18nKey="admin:members.header.titleLine2"
            components={{ em: <em /> }}
          />
        </>
      }
      sub={
        pendingCount === undefined
          ? t("admin:members.header.subNoCount")
          : t("admin:members.header.sub", { count: pendingCount })
      }
      actions={
        <>
          <Button variant="ghost" size="md" onClick={onOpenSuppression}>
            {t("admin:recovery.suppression.openCta")}
          </Button>
          <Button variant="ghost" size="md">
            {t("admin:members.header.exportCta")}
          </Button>
        </>
      }
    />
  );
}

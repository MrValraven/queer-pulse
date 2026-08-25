import { useState } from "react";
import {
  Badge,
  Button,
  MemberIdentity,
} from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { routes } from "../../../../app/routeMap";
import type { ListingCoManagerDTO } from "../api/listingCoManagers.api";
import { CO_MANAGER_STATUS_VIEW } from "./coManagers.data";
import styles from "./CoManagers.module.css";

/**
 * One person on a listing's roster: who they are, whether they can already
 * edit or are still deciding, and (for the owner) a quiet way to take the
 * place back.
 *
 * The removal confirm is inline rather than a dialog, because it is a small
 * reversible act and the copy is the point: nobody is being told off, and the
 * owner can ask them again whenever they like.
 */
export function CoManagerRosterRow({
  coManager,
  canRemove,
  isRemoving,
  onRemove,
}: {
  coManager: ListingCoManagerDTO;
  /** Owner-only: inviting and removing are theirs alone. */
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: (memberSlug: string) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isConfirming, setIsConfirming] = useState(false);

  const member = coManager.member;
  const memberName = member
    ? `${member.firstName} ${member.lastName}`.trim()
    : t("marketing:listBusiness.coManagers.formerMember");
  const statusView = CO_MANAGER_STATUS_VIEW[coManager.status];
  const isInvited = coManager.status === "invited";
  const removeKey = isInvited
    ? "marketing:listBusiness.coManagers.cancelInviteCta"
    : "marketing:listBusiness.coManagers.removeCta";

  return (
    <li className={styles.row}>
      <div className={styles.rowIdentity}>
        <MemberIdentity
          person={{
            slug: member?.slug,
            name: memberName,
            avatarUrl: member?.avatarUrl ?? undefined,
          }}
          to={member ? `${routes.members}/${member.slug}` : undefined}
          size={38}
          secondary={
            <span className={styles.rowMeta}>
              {t(
                isInvited
                  ? "marketing:listBusiness.coManagers.invitedOn"
                  : "marketing:listBusiness.coManagers.editingSince",
                {
                  date: format.date(
                    new Date(coManager.acceptedAt ?? coManager.invitedAt),
                    { day: "numeric", month: "long", year: "numeric" },
                  ),
                },
              )}
            </span>
          }
        />
      </div>

      {statusView && (
        <Badge tone={statusView.tone}>{t(statusView.labelKey)}</Badge>
      )}

      {canRemove && member && !isConfirming && (
        <div className={styles.rowActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfirming(true)}
          >
            {t(removeKey)}
          </Button>
        </div>
      )}

      {isConfirming && member && (
        <div
          className={styles.confirm}
          role="alertdialog"
          aria-label={t(removeKey)}
        >
          <p className={styles.confirmText}>
            <Translation
              i18nKey={
                isInvited
                  ? "marketing:listBusiness.coManagers.cancelInviteConfirm"
                  : "marketing:listBusiness.coManagers.removeConfirm"
              }
              values={{ name: memberName }}
              components={{ b: <b /> }}
            />
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" onClick={() => setIsConfirming(false)}>
              {t("marketing:listBusiness.coManagers.keepCta")}
            </Button>
            <Button
              variant="primary"
              disabled={isRemoving}
              onClick={() => onRemove(member.slug)}
            >
              {t(
                isInvited
                  ? "marketing:listBusiness.coManagers.cancelInviteYes"
                  : "marketing:listBusiness.coManagers.removeYes",
              )}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

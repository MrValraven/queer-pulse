import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type {
  CommunityInviteSkipReason,
  CommunityInvitesResponseDTO,
} from "./api/communityInvites.api";
import styles from "./ModToolsPanels.module.css";

const SKIP_REASON_KEY: Record<CommunityInviteSkipReason, string> = {
  unknown_member: "communities:detail.modtools.invites.skip.unknownMember",
  self: "communities:detail.modtools.invites.skip.self",
  system_account: "communities:detail.modtools.invites.skip.systemAccount",
  already_member: "communities:detail.modtools.invites.skip.alreadyMember",
  pending_request: "communities:detail.modtools.invites.skip.pendingRequest",
  banned: "communities:detail.modtools.invites.skip.banned",
};

/**
 * What the last invite call actually did, reported in full.
 *
 * Both halves are always shown when they are non-empty. A skipped person is a
 * person who did not get an invitation, and reporting the call as a flat
 * success would leave an owner believing they had reached someone they had
 * not. Each skip carries the server's own reason.
 */
export function ModToolsInviteResult({
  result,
  nameForSlug,
}: {
  result: CommunityInvitesResponseDTO;
  /** Resolves a profile slug to the name shown in the picker, so the report
   *  reads in the same terms the sender chose people in. */
  nameForSlug: (slug: string) => string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.result}>
      {result.invitedCount > 0 && (
        <>
          <div className={styles.resultHead}>
            {t("communities:detail.modtools.invites.result.invited", {
              total: fmt.number(result.invitedCount),
            })}
          </div>
          <ul className={styles.resultList}>
            {result.invited.map((slug) => (
              <li key={slug}>{nameForSlug(slug)}</li>
            ))}
          </ul>
        </>
      )}

      {result.skippedCount > 0 && (
        <>
          <div className={styles.resultHead}>
            {t("communities:detail.modtools.invites.result.skipped", {
              total: fmt.number(result.skippedCount),
            })}
          </div>
          <ul className={styles.resultList}>
            {result.skipped.map((skip) => (
              <li key={skip.slug}>
                {t("communities:detail.modtools.invites.result.skipRow", {
                  name: nameForSlug(skip.slug),
                  reason: t(SKIP_REASON_KEY[skip.reason]),
                })}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={styles.hint}>
        {t("communities:detail.modtools.invites.result.note")}
      </p>
    </div>
  );
}

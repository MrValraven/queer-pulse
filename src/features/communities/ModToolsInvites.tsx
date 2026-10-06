import { useState } from "react";
import type { MemberSelectPerson } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  MAX_INVITES_PER_CALL,
  type CommunityInvitesResponseDTO,
} from "./api/communityInvites.api";
import { isCommunityStaff } from "./communityStaff";
import type { CommunityRole } from "./membership.types";
import { ModToolsInvitePicker } from "./ModToolsInvitePicker";
import { ModToolsInviteResult } from "./ModToolsInviteResult";
import { ModToolsPendingInvites } from "./ModToolsPendingInvites";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * Staff invite members into the community after founding day.
 *
 * Until now the only invites a community could ever send were the ones its
 * founder typed on the create form, which capped every community at whoever
 * happened to be around on day one. The pool is the sender's own connections,
 * the same source the persona co-owner invite uses: a staff role is not a
 * reason to hand someone the whole member directory to page through. The
 * server searches and pages that pool and leaves out everyone who could not
 * be invited here anyway (`ModToolsInvitePicker`).
 *
 * An invitation is an invitation. Nobody selected here joins anything; the
 * result panel reports exactly who was reached and who was passed over.
 *
 * The invitations already out sit directly under the form
 * (`ModToolsPendingInvites`, PRD-140): "who have we already asked" and "who
 * shall we ask" are one question, and the answer to the first belongs beside
 * the control that acts on the second.
 */
export function ModToolsInvites({
  slug,
  role,
}: {
  slug: string;
  /** The viewer's own role on this roster, straight from the detail DTO's
   *  `myRole`. It gates the candidates and pending-invitations reads, which
   *  the server serves to owner, co-owner and moderator alone. */
  role: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isStaff = isCommunityStaff(role);
  // The last answer, with the people it named. The picker's rows change with
  // every search, so the names are kept from the selection that was sent.
  const [sent, setSent] = useState<{
    response: CommunityInvitesResponseDTO;
    sentPeople: ReadonlyMap<string, MemberSelectPerson>;
  } | null>(null);

  const nameForSlug = (memberSlug: string) =>
    sent?.sentPeople.get(memberSlug)?.name ?? memberSlug;

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.invites.label")}
      </div>
      <p className={styles.intro}>
        {t("communities:detail.modtools.invites.intro", {
          max: fmt.number(MAX_INVITES_PER_CALL),
        })}
      </p>

      <ModToolsInvitePicker
        slug={slug}
        isStaff={isStaff}
        onSent={(response, sentPeople) => setSent({ response, sentPeople })}
      />

      {sent && (
        <ModToolsInviteResult
          result={sent.response}
          nameForSlug={nameForSlug}
        />
      )}

      <ModToolsPendingInvites slug={slug} isStaff={isStaff} />
    </div>
  );
}

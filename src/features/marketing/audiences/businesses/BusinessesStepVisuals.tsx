import { FiCheck } from "react-icons/fi";
import { Badge } from "../../../../shared/components/ui/Badge";
import { MemberIdentity } from "../../../../shared/components/ui/MemberIdentity";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DirectoryCardAccess } from "../../DirectoryCardAccess";
import { DirectoryCardMeta } from "../../DirectoryCardMeta";
import { DirectoryCardPills } from "../../DirectoryCardPills";
import type { DirectoryPlace } from "../../directoryPlaces";
import type { ListingCoManagerDTO } from "../../listBusiness/api/listingCoManagers.api";
import { CO_MANAGER_STATUS_VIEW } from "../../listBusiness/coManagers/coManagers.data";
import type { ListingKind } from "../../listBusiness/listingMobile.data";
import dirStyles from "../../DirectoryPage.module.css";
import coManagerStyles from "../../listBusiness/coManagers/CoManagers.module.css";
import {
  BUSINESS_KIND_OPTIONS,
  WHERE_FOUND_DESC_KEYS,
} from "./businessesLanding.data";
import type { SampleThreadMessage } from "./businessesSample.data";
import { SampleMailboxThread } from "./SampleMailboxThread";
import styles from "./BusinessesStepVisuals.module.css";

/**
 * The wizard's first question, "Where do people find it?", with its three
 * answers in the wizard's own words and the first one picked.
 */
export function WhereFoundGlimpse({ pickedKind }: { pickedKind: ListingKind }) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <p className={styles.question}>
        {t("marketing:listBusiness.step0.whereFound.label")}
      </p>
      <ul className={styles.choices}>
        {BUSINESS_KIND_OPTIONS.map(({ id, labelKey, Icon }) => (
          <li
            key={id}
            className={styles.choice}
            data-picked={id === pickedKind ? "true" : undefined}
          >
            <span className={styles.choiceIcon}>
              <Icon aria-hidden />
            </span>
            <span className={styles.choiceText}>
              <b>{t(labelKey)}</b>
              <span>{t(WHERE_FOUND_DESC_KEYS[id])}</span>
            </span>
            {id === pickedKind && (
              <FiCheck aria-hidden className={styles.choiceCheck} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What a listing says about itself, from the real card pieces: its category
 * and neighbourhood, who owns and runs it with the owner's highlights, and
 * the accessibility answers that came back yes.
 */
export function ListingTagsGlimpse({ place }: { place: DirectoryPlace }) {
  return (
    <div className={`${dirStyles.card} ${styles.tagsCard}`}>
      <div className={dirStyles.name}>{place.name}</div>
      <DirectoryCardMeta place={place} />
      <DirectoryCardPills place={place} />
      <DirectoryCardAccess place={place} />
    </div>
  );
}

/**
 * One row of the co-manager roster, in the roster's own markup and copy:
 * the person, "Helping out since" or "Invitation sent", and the status
 * badge. Drawn here because the real `CoManagerRosterRow` shows the staff
 * and ambassador tags, which read the staff roster over the network; with
 * `showStaffBadge` off, `MemberIdentity` reads nothing.
 */
function SampleCoManagerRow({ coManager }: { coManager: ListingCoManagerDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const member = coManager.member;
  const memberName = member ? `${member.firstName} ${member.lastName}` : "";
  const statusView = CO_MANAGER_STATUS_VIEW[coManager.status];
  const isInvited = coManager.status === "invited";
  return (
    <li className={coManagerStyles.row}>
      <div className={coManagerStyles.rowIdentity}>
        <MemberIdentity
          person={{ slug: member?.slug, name: memberName }}
          size={38}
          showStaffBadge={false}
          secondary={
            <span className={coManagerStyles.rowMeta}>
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
    </li>
  );
}

/** The listing's co-manager roster, read-only: who can already edit, and
 *  who has been asked. */
export function CoManagerGlimpse({
  coManagers,
}: {
  coManagers: readonly ListingCoManagerDTO[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <p className={styles.question}>
        {t("forBusinesses:walkthrough.team.rosterTitle")}
      </p>
      <ul className={`${coManagerStyles.roster} ${styles.roster}`}>
        {coManagers.map((coManager) => (
          <SampleCoManagerRow key={coManager.id} coManager={coManager} />
        ))}
      </ul>
    </div>
  );
}

/** The same inbox from the team's side, replying as the business. */
export function TeamInboxGlimpse({
  businessName,
  messages,
}: {
  businessName: string;
  messages: readonly SampleThreadMessage[];
}) {
  const { t } = useTranslation();
  return (
    <SampleMailboxThread
      businessName={businessName}
      messages={messages}
      footer={
        <span className={styles.replyingAs}>
          <span className={styles.claimDot} aria-hidden="true" />
          {t("messages:mailbox.claim.mine")}
          <span aria-hidden="true">·</span>
          {t("messages:mailbox.composer.replyingAs", { name: businessName })}
        </span>
      }
    />
  );
}

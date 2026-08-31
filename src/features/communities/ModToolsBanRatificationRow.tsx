import { FiClock, FiInfo } from "react-icons/fi";
import { Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunityBanRatificationDTO } from "./api/communityBanRatifications.api";
import { CommunityRuleCitation } from "./CommunityRuleCitation";
import styles from "./ModToolsBanRatifications.module.css";

/** Which way a second signatory went. The wire literal is `decline`, and the
 *  buttons say the same word. */
export type CommunityBanRatifyDecision = "ratify" | "decline";

/** The proposer's display name, or the placeholder for an account erased since
 *  they asked. The hold outlives them either way. */
function proposerName(
  ref: CommunityBanRatificationDTO["requestedBy"],
  fallback: string,
): string {
  if (!ref) return fallback;
  return `${ref.firstName} ${ref.lastName}`.trim() || fallback;
}

/**
 * One permanent bar waiting on a second owner, co-owner or moderator (PRD-25).
 *
 * Built around the first moderator's own words, the same way the platform's
 * ratification card is: this is the surface where somebody decides whether to
 * put their name to keeping a person out of a community for good, and a
 * summary of the case is not enough to do that on.
 *
 * Three facts the row states out loud rather than leaving to be inferred:
 * what the member is serving RIGHT NOW (they are already out), when the hold
 * lapses, and what lapsing does. Inaction does not release anybody: the bar
 * simply stays at the fallback term. A reader who thinks otherwise would
 * decline by walking away.
 *
 * A proposer sees their own row with the buttons disabled and the reason in
 * words. Hiding it would leave them unable to see that their own request is
 * still waiting, which is the thing they most need to know.
 */
export function ModToolsBanRatificationRow({
  hold,
  fallbackDays,
  isDeciding,
  onDecide,
}: {
  hold: CommunityBanRatificationDTO;
  /** What an unsigned bar settles at, served by the API so no copy here
   *  hard-codes it. */
  fallbackDays: number;
  isDeciding: boolean;
  onDecide: (
    hold: CommunityBanRatificationDTO,
    decision: CommunityBanRatifyDecision,
  ) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const shortDate = (iso: string) =>
    `${fmt.date(new Date(iso), { day: "numeric", month: "short" })} ${fmt.time(new Date(iso))}`;

  const memberName = hold.member
    ? `${hold.member.firstName} ${hold.member.lastName}`.trim() ||
      hold.memberName
    : hold.memberName;
  const isSignable = !hold.isOwnProposal && !hold.isExpired;

  return (
    <li className={styles.hold}>
      <div className={styles.holdHead}>
        <h3 className={styles.title}>
          {t("communities:detail.modtools.ratifications.title", {
            name: memberName,
          })}
        </h3>
        <span
          className={[styles.lapse, hold.isExpired && styles.lapsed]
            .filter(Boolean)
            .join(" ")}
        >
          <FiClock aria-hidden />{" "}
          {hold.isExpired
            ? t("communities:detail.modtools.ratifications.lapsed")
            : t("communities:detail.modtools.ratifications.lapsesAt", {
                date: shortDate(hold.expiresAt),
              })}
        </span>
      </div>

      {hold.member && (
        <MemberIdentity
          person={{
            slug: hold.member.slug,
            name: memberName,
            avatarUrl: hold.member.avatarUrl ?? undefined,
          }}
          size={32}
        />
      )}

      <p className={styles.meta}>
        {hold.requestedBy
          ? t("communities:detail.modtools.ratifications.askedBy", {
              name: proposerName(
                hold.requestedBy,
                t("communities:detail.modtools.bans.formerMember"),
              ),
              date: shortDate(hold.requestedAt),
            })
          : t("communities:detail.modtools.ratifications.askedByGone", {
              date: shortDate(hold.requestedAt),
            })}
      </p>

      <blockquote className={styles.quote}>
        {hold.note ?? t("communities:detail.modtools.ratifications.noNote")}
      </blockquote>

      {hold.rule && <CommunityRuleCitation rule={hold.rule} />}

      <p className={styles.serving}>
        <FiInfo aria-hidden />
        <span>
          {hold.barExpiresAt
            ? t("communities:detail.modtools.ratifications.serving", {
                date: fmt.date(new Date(hold.barExpiresAt)),
              })
            : t("communities:detail.modtools.ratifications.servingPermanent")}
        </span>
      </p>

      <p className={styles.note}>
        {hold.isExpired
          ? t("communities:detail.modtools.ratifications.lapsedNote", {
              days: fallbackDays,
            })
          : t("communities:detail.modtools.ratifications.ifNobodySigns", {
              days: fallbackDays,
            })}
      </p>

      {hold.isOwnProposal && (
        <p className={styles.note}>
          {t("communities:detail.modtools.ratifications.ownProposal")}
        </p>
      )}

      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isSignable || isDeciding}
          onClick={() => onDecide(hold, "decline")}
        >
          {t("communities:detail.modtools.ratifications.declineCta")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={!isSignable || isDeciding}
          onClick={() => onDecide(hold, "ratify")}
        >
          {t("communities:detail.modtools.ratifications.ratifyCta")}
        </Button>
      </div>
    </li>
  );
}

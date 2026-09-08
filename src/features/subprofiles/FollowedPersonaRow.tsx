import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { personaOwnerAddress } from "./personaLinks.data";
import {
  personaAddressName,
  personaNameBesideCraft,
  personaTitleName,
} from "./subprofile-kinds";
import { skinFor } from "./subprofile-skins";
import type { FollowedPersonaDTO } from "./api/subprofiles.api";
import styles from "./FollowedPersonas.module.css";

/**
 * One persona in "the ones you follow": who it is, how long you have been
 * following, and the way to stop.
 *
 * THE LINK IS NEVER FABRICATED. The address comes from `personaOwnerAddress`,
 * the sanctioned builder, fed the creator's slug the server resolved. A
 * persona it cannot address (`"none"`, and `"pending"`, which cannot happen
 * here because the server already answered) renders as plain text with an
 * honest note rather than a `/p/<slug>` that resolves nowhere.
 *
 * NAMED THE WAY THE DIRECTORY CARD NAMES IT. A persona still carrying its
 * profession as a name ("Dancer") is titled "Owner Name | Dancer" through
 * `personaTitleName`, so this list reads as people rather than a column of
 * job titles — the row's own family pill says "Stage", never the craft, so
 * nothing is said twice. An unlinked persona ships no `ownerName` (the server
 * refuses to leak the tie) and keeps its bare name. The unfollow control and
 * its toast take `personaAddressName` instead, which is the same rule shaped
 * for a sentence: "You no longer follow Tiago", never "… follow Tiago | Dancer".
 *
 * UNFOLLOW WAITS FOR THE SERVER. `onUnfollow` resolves only once the request
 * has settled, and the row stays put and disabled until it does. Dropping the
 * row optimistically and putting it back on failure is worse than a moment's
 * wait: the row is the thing being removed, so a flicker reads as the product
 * changing its mind.
 */
export function FollowedPersonaRow({
  persona,
  onUnfollow,
  isUnfollowing,
}: {
  persona: FollowedPersonaDTO;
  onUnfollow: () => void;
  isUnfollowing: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const address = personaOwnerAddress(persona, persona.ownerSlug ?? undefined);
  const family = skinFor(persona.kind);
  const titleName = personaTitleName({
    displayName: persona.displayName,
    kind: persona.kind,
    ownerName: persona.ownerName,
  });
  const followedOn = fmt.date(new Date(persona.followedAt), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const identity = (
    <>
      <Avatar
        // Initials come from `personaNameBesideCraft`, never the composed
        // title: "Tiago Costa | Dancer" reads its first and last words as a
        // personal name and marks the fallback "TD". The owner's name alone
        // marks "TC", and a persona with a real name keeps its own initials.
        initials={initialsFromName(
          personaNameBesideCraft({
            displayName: persona.displayName,
            kind: persona.kind,
            ownerName: persona.ownerName,
          }),
          "?",
        )}
        src={persona.avatarUrl ?? undefined}
        tint="plum"
        size={48}
        className={styles.avatar}
      />
      <span className={styles.text}>
        <span className={styles.name}>{titleName}</span>
        <span className={styles.family}>
          {t(`subprofiles:family.${family}.label`)}
        </span>
        {persona.tagline && (
          <span className={styles.tagline}>{persona.tagline}</span>
        )}
      </span>
    </>
  );

  return (
    <li className={styles.row}>
      {address.status === "ready" ? (
        <Link className={styles.identity} to={address.path}>
          {identity}
        </Link>
      ) : (
        <span className={styles.identity}>
          {identity}
          <span className={styles.noAddress}>
            {t("subprofiles:following.noAddress")}
          </span>
        </span>
      )}
      <span className={styles.meta}>
        {persona.followerCount > 0 && (
          <span className={styles.followers}>
            <FiUsers aria-hidden />
            {t("subprofiles:following.followerCount", {
              count: persona.followerCount,
            })}
          </span>
        )}
        <span className={styles.since}>
          {t("subprofiles:following.since", { date: followedOn })}
        </span>
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={styles.unfollow}
        onClick={onUnfollow}
        disabled={isUnfollowing}
        aria-label={t("subprofiles:following.unfollowLabel", {
          name: personaAddressName({
            displayName: persona.displayName,
            kind: persona.kind,
            ownerName: persona.ownerName ?? undefined,
          }),
        })}
      >
        {isUnfollowing
          ? t("subprofiles:following.unfollowing")
          : t("subprofiles:following.unfollow")}
      </Button>
    </li>
  );
}

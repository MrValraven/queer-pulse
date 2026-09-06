import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { personaOwnerAddress } from "./personaLinks.data";
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
  const followedOn = fmt.date(new Date(persona.followedAt), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const identity = (
    <>
      <Avatar
        initials={initialsFromName(persona.displayName, "?")}
        src={persona.avatarUrl ?? undefined}
        tint="plum"
        size={48}
        className={styles.avatar}
      />
      <span className={styles.text}>
        <span className={styles.name}>{persona.displayName}</span>
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
          name: persona.displayName,
        })}
      >
        {isUnfollowing
          ? t("subprofiles:following.unfollowing")
          : t("subprofiles:following.unfollow")}
      </Button>
    </li>
  );
}

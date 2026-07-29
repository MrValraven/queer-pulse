import { FiShield } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { Avatar } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { initialsFromParts } from "../../../shared/lib/initials";
import styles from "./StartCommunityPage.module.css";

/** Chapter 0 — the reassuring opening, before any fields. */
export function StepOpening() {
  const { user } = useAuth();
  const firstName = user?.profile.firstName ?? "";
  const lastName = user?.profile.lastName ?? "";
  const initials = initialsFromParts(firstName, lastName) || "?";

  return (
    <div>
      <div className={styles.reassure}>
        <FiShield size={20} aria-hidden />
        <p>
          <Translation
            i18nKey="communities:start.opening.reassure"
            components={{ strong: <b /> }}
          />
        </p>
      </div>
      <div className={styles.signed}>
        <Avatar
          initials={initials}
          src={user?.profile.avatarUrl ?? undefined}
          tint="plum"
          size={26}
        />
        <Translation
          i18nKey="communities:start.opening.signed"
          components={{ strong: <b /> }}
          values={{ name: firstName }}
        />
      </div>
    </div>
  );
}

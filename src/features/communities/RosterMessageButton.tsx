import { FiMessageCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import type { RosterMember } from "./community.model";
import styles from "./CommunityHubTabs.module.css";

/**
 * The roster card's "Message" affordance: a `span role="button"` (no `<button>`
 * inside the profile `<Link>`, per the design rule). Its own component so
 * `useMemberContact` runs at a component top level rather than inside
 * RosterTab's `shown.map`, where a hook call would be illegal.
 */
export function RosterMessageButton({ member }: { member: RosterMember }) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(member.slug ?? "");
  const reachOut = () =>
    contact({ slug: member.slug ?? "", name: member.name });
  return (
    <span
      role="button"
      tabIndex={0}
      className={styles.msgBtn}
      onClick={reachOut}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") &&
        (event.preventDefault(), reachOut())
      }
    >
      <FiMessageCircle aria-hidden />{" "}
      {connected
        ? t("connect:contact.message")
        : t("communities:detail.roster.messageCta")}
    </span>
  );
}

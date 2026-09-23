import type { KeyboardEvent, MouseEvent } from "react";
import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SpaceCardModel } from "./community.model";
import gridStyles from "./CommunitiesPage.module.css";
import styles from "./SpacesTab.module.css";

/**
 * The footer action on a space card, driven by the space's tier:
 *
 *  - `public`: "Join", opening the join wizard.
 *  - `request`: "Request to join", the same wizard on its request path.
 *  - `invite`: a quiet "Invitation only" note, since only the space's
 *    moderators can let someone in.
 *  - `private`: nothing. Only its roster and the parent's staff see a private
 *    space's card, and the card itself links in.
 *
 * A viewer outside the parent's roster cannot join any space yet, so every
 * tier shows "Join {parent} first" in its place. The Spaces tab lives on the
 * parent's own page, whose hero carries the parent's Join button, so the note
 * points there and stays a note. A viewer already on the space's roster gets
 * no action at all: the card's badge says they are in.
 *
 * The card is one router `<Link>`, so the join control is a
 * `<span role="button">` that stops the click from following it.
 */
export function SpaceCardAction({
  space,
  isParentMember,
  parentName,
  onJoin,
}: {
  space: SpaceCardModel;
  isParentMember: boolean;
  parentName: string;
  onJoin: (space: SpaceCardModel) => void;
}) {
  const { t } = useTranslation();
  const tier = space.accessTier ?? "public";

  if (space.isMember || tier === "private") return null;

  if (!isParentMember) {
    return (
      <span className={styles.cardNote}>
        <FiLock aria-hidden />
        {t("communities:spaces.join.parentFirst", { name: parentName })}
      </span>
    );
  }

  if (tier === "invite") {
    return (
      <span className={styles.cardNote}>
        <FiLock aria-hidden />
        {t("communities:detail.join.inviteOnly")}
      </span>
    );
  }

  const startJoin = (
    event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onJoin(space);
  };

  return (
    <span
      className={gridStyles.joinBtn}
      role="button"
      tabIndex={0}
      onClick={startJoin}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") startJoin(event);
      }}
    >
      {tier === "public"
        ? t("communities:card.join.public")
        : t("communities:detail.join.request")}
    </span>
  );
}

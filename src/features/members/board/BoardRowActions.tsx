import { BoardRowVisitorActions } from "./BoardRowVisitorActions";
import { BoardRowOwnerActions } from "./BoardRowOwnerActions";
import type { BoardItem } from "../data/members";
import type { BoardLifespan } from "./boardLifespan";

/**
 * Every action a board row offers, split by who is looking.
 *
 * The owner renews (or reposts, once the post has lapsed) and marks found. A
 * visitor offers to help, with an optional line, which is where the detail a
 * post has no body field for gets exchanged.
 *
 * The two sides don't share any state (a confirm-armed flag, a note draft, a
 * has-responded flag), so each lives in its own component —
 * `BoardRowOwnerActions` and `BoardRowVisitorActions` — keeping both under
 * the 200-line component limit. This file stays the stable dispatcher
 * `BoardRow` renders.
 */
export function BoardRowActions({
  item,
  isSelf,
  memberSlug,
  memberFirst,
  lifespan,
  onClosed,
  onRenewed,
}: {
  item: BoardItem;
  isSelf: boolean;
  memberSlug: string;
  memberFirst: string;
  lifespan: BoardLifespan;
  onClosed: (closed: { closedNote?: string; closedAt?: string }) => void;
  onRenewed: (renewed: { expiresAt: string; renewCount: number }) => void;
}) {
  if (!isSelf) {
    return (
      <BoardRowVisitorActions
        item={item}
        memberSlug={memberSlug}
        memberFirst={memberFirst}
      />
    );
  }
  return (
    <BoardRowOwnerActions
      item={item}
      lifespan={lifespan}
      onClosed={onClosed}
      onRenewed={onRenewed}
    />
  );
}

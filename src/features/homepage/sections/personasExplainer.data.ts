import { FiCompass, FiLock, FiUsers } from "react-icons/fi";
import type { IconType } from "react-icons";

/** One "why personas are a member feature" pillar in the explainer modal. */
export interface PersonaPillar {
  id: string;
  Icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/**
 * The three reasons personas only exist behind the door, in display order.
 *
 * The showcase section above this modal already covers the pitch — separate
 * sides, per-persona identity and content, visibility control, linked or
 * discreet, three included with every account. NONE of that may be repeated
 * here: a visitor opens this modal having just read all of it, and a modal that
 * says it again reads as a wall rather than an answer. Every row below is
 * something the section does not say, and every row is grounded in code:
 *
 *  - `directory`: `/subprofiles` is the persona directory, listed in
 *    `GATED_PATTERNS` because `GET /subprofiles/directory` sits under the
 *    controller's `ActiveMemberGuard`. Personas are a discovery surface of
 *    their own, which is the thing a signed-out visitor cannot see at all.
 *  - `coOwned`: co-ownership (contract C6 — `InviteCoOwnerModal`,
 *    `SubprofileOwnersPanel`, `LeavePersonaModal`). A persona is not tied to
 *    one account, and an owner leaving does not take it down.
 *  - `behindTheDoor`: `Visibility = "open" | "network" | "private"`, where
 *    `network` renders the `members_only` wall in `SubprofilePage` for anyone
 *    signed out. This is the honest answer to "why can't I just look?".
 */
export const PERSONA_PILLARS: PersonaPillar[] = [
  {
    id: "directory",
    Icon: FiCompass,
    titleKey: "homepage:personasExplainer.pillars.directory.title",
    bodyKey: "homepage:personasExplainer.pillars.directory.body",
  },
  {
    id: "coOwned",
    Icon: FiUsers,
    titleKey: "homepage:personasExplainer.pillars.coOwned.title",
    bodyKey: "homepage:personasExplainer.pillars.coOwned.body",
  },
  {
    id: "behindTheDoor",
    Icon: FiLock,
    titleKey: "homepage:personasExplainer.pillars.behindTheDoor.title",
    bodyKey: "homepage:personasExplainer.pillars.behindTheDoor.body",
  },
];

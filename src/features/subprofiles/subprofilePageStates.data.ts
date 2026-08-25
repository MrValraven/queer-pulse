import type { IconType } from "react-icons";
import { FiLock, FiUsers, FiX } from "react-icons/fi";
import { routes } from "../../app/routeMap";

/** The four ways a persona page can come up empty (`personas-states.jsx`'s
 *  `PAGE_STATE_COPY` in the Phase-1 design ground truth). */
export type PersonaPageState =
  "not-found" | "private" | "members-only" | "removed";

export interface PageStateCopy {
  /** `undefined` for "not-found", which uses `SubprofileNotFoundArt` instead
   *  of a small icon. */
  icon?: IconType;
  titleKey: string;
  descriptionKey: string;
  actionLabelKey: string;
  actionTo: string;
  secondaryActionLabelKey?: string;
  secondaryActionTo?: string;
}

/**
 * Copy + destination for each state, keyed for `SubprofilePageStates`.
 *
 * All four states are reachable as of Phase 1b: the backend's public reads
 * (`getByHandle`, the owner-nested list) now return a 403 with a
 * `{ restrictedState: "private" | "members_only" | "removed" }` body when a
 * persona exists but this viewer can't see it, instead of collapsing that
 * into a plain 404. `usePublicSubprofile` maps that 403 to its `"restricted"`
 * result state (see that hook's `PublicSubprofileResult`), and
 * `SubprofilePage` maps the wire contract's underscore keys onto this
 * module's hyphenated `PersonaPageState` ones before rendering
 * `SubprofilePageStates`.
 *
 * `"not-found"` stays the outcome for a genuinely absent handle/slug, and
 * also for an unpublished draft viewed by anyone who isn't its owner —
 * that case is deliberately indistinguishable from absent (no signal that
 * "something exists here, you just can't see it yet"). An owner or
 * co-owner viewing their *own* draft is a different path entirely: it's an
 * `"ok"` result carrying `data.status === "draft"`, rendered by
 * `SubprofilePage` with `SubprofileDraftBanner` on top rather than any of
 * these four wall states.
 */
export const PAGE_STATE_COPY: Record<PersonaPageState, PageStateCopy> = {
  "not-found": {
    titleKey: "subprofiles:page.notFoundTitle",
    descriptionKey: "subprofiles:page.notFoundDescription",
    actionLabelKey: "subprofiles:page.notFoundAction",
    actionTo: routes.subprofiles,
  },
  private: {
    icon: FiLock,
    titleKey: "subprofiles:pageState.private.title",
    descriptionKey: "subprofiles:pageState.private.description",
    actionLabelKey: "subprofiles:pageState.private.action",
    actionTo: routes.subprofiles,
  },
  "members-only": {
    icon: FiUsers,
    titleKey: "subprofiles:pageState.membersOnly.title",
    descriptionKey: "subprofiles:pageState.membersOnly.description",
    actionLabelKey: "subprofiles:pageState.membersOnly.action",
    actionTo: routes.signIn,
    secondaryActionLabelKey:
      "subprofiles:pageState.membersOnly.secondaryAction",
    secondaryActionTo: routes.requestInvite,
  },
  removed: {
    icon: FiX,
    titleKey: "subprofiles:pageState.removed.title",
    descriptionKey: "subprofiles:pageState.removed.description",
    actionLabelKey: "subprofiles:pageState.removed.action",
    actionTo: routes.guidelines,
  },
};

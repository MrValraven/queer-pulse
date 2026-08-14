import type { IconType } from "react-icons";
import {
  FiUser,
  FiUsers,
  FiLayers,
  FiHeart,
  FiUserPlus,
  FiEdit3,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";

/**
 * The "Getting started" checklist — a few first moves a new member can make to
 * settle in. Each step is auto-detected as done from real account data (see
 * `useGettingStarted`), never ticked by hand, so the list reflects what someone
 * has actually done rather than a stored flag.
 *
 * i18n Pattern A: `titleKey`/`descKey`/`doneKey`/`ctaKey` hold `auth:` catalog
 * keys resolved by the page via `t()`. The icons and routes are the only
 * literal values — the copy lives in the catalogs (EN + PT).
 *
 * Live-only: the whole surface is gated on live mode (the page redirects home in
 * demo, the account-menu entry is hidden), so the detectors read the signed-in
 * member's real profile, memberships, personas, and eligibility signals.
 */
export interface GettingStartedStep {
  /** Stable id — the auto-detect key AND the i18n sub-namespace. */
  key: string;
  /** The action, e.g. "Join a community". */
  titleKey: string;
  /** The "why", shown while the step is still to do. */
  descKey: string;
  /** A warm line of reassurance shown once the step is done. */
  doneKey: string;
  /** The button label linking to where the member does it. */
  ctaKey: string;
  /** Where the CTA leads. */
  to: string;
  /** A quiet visual anchor in the step's ring (until it's a jade tick). */
  icon: IconType;
}

// XP granted per completed getting-started step (mirrors the backend
// XP_RULES getting-started rule perUnit; see recognition.scoring.ts).
export const GETTING_STARTED_STEP_XP = 25;

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    key: "profile",
    titleKey: "auth:gettingStarted.steps.profile.title",
    descKey: "auth:gettingStarted.steps.profile.desc",
    doneKey: "auth:gettingStarted.steps.profile.done",
    ctaKey: "auth:gettingStarted.steps.profile.cta",
    to: routes.accountProfile,
    icon: FiUser,
  },
  {
    key: "community",
    titleKey: "auth:gettingStarted.steps.community.title",
    descKey: "auth:gettingStarted.steps.community.desc",
    doneKey: "auth:gettingStarted.steps.community.done",
    ctaKey: "auth:gettingStarted.steps.community.cta",
    to: routes.communities,
    icon: FiUsers,
  },
  {
    key: "persona",
    titleKey: "auth:gettingStarted.steps.persona.title",
    descKey: "auth:gettingStarted.steps.persona.desc",
    doneKey: "auth:gettingStarted.steps.persona.done",
    ctaKey: "auth:gettingStarted.steps.persona.cta",
    to: routes.subprofilesDashboard,
    icon: FiLayers,
  },
  {
    key: "vouch",
    titleKey: "auth:gettingStarted.steps.vouch.title",
    descKey: "auth:gettingStarted.steps.vouch.desc",
    doneKey: "auth:gettingStarted.steps.vouch.done",
    ctaKey: "auth:gettingStarted.steps.vouch.cta",
    to: routes.members,
    icon: FiHeart,
  },
  {
    key: "connect",
    titleKey: "auth:gettingStarted.steps.connect.title",
    descKey: "auth:gettingStarted.steps.connect.desc",
    doneKey: "auth:gettingStarted.steps.connect.done",
    ctaKey: "auth:gettingStarted.steps.connect.cta",
    to: routes.members,
    icon: FiUserPlus,
  },
  {
    key: "post",
    titleKey: "auth:gettingStarted.steps.post.title",
    descKey: "auth:gettingStarted.steps.post.desc",
    doneKey: "auth:gettingStarted.steps.post.done",
    ctaKey: "auth:gettingStarted.steps.post.cta",
    to: routes.communities,
    icon: FiEdit3,
  },
];

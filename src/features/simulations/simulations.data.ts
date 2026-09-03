import { routes } from "../../app/routeMap";
import {
  DEMO_GATHERING_SLUGS,
  gatheringRecapPath,
  gatheringCancelledPath,
} from "../gatherings/data";

export interface SimFlow {
  /** Stable url-safe slug for /simulations/:id. */
  id: string;
  title: string;
  description: string;
  to: string;
}

export const SIM_GROUPS: { label: string; flows: SimFlow[] }[] = [
  {
    label: "Joining the community",
    flows: [
      {
        id: "join-queerpulse",
        title: "Join QueerPulse",
        description:
          "The full join journey end to end: open your invitation, create your account, complete new-member onboarding, and finish on the welcome tour.",
        to: routes.inviteLanding,
      },
      {
        id: "invite-someone",
        title: "Invite someone to QueerPulse",
        description:
          "Step into a member’s shoes and bring someone in: spend your monthly invite, write the vouch, and send it by email or a shareable link.",
        to: routes.invite,
      },
      {
        id: "request-an-invite",
        title: "Request an invite",
        description:
          "Walk through asking to join: the form a prospective member fills in when they don’t yet have an invitation.",
        to: routes.requestInvite,
      },
      {
        id: "vouch-for-someone",
        title: "Vouch for someone",
        description:
          "See how an existing member nominates and vouches for a friend to bring them into the network.",
        to: routes.vouch,
      },
      {
        id: "invite-expired",
        title: "Invite expired",
        description:
          "Preview the dead-end someone hits when they open an invitation link that has already expired.",
        to: routes.inviteExpired,
      },
    ],
  },
  {
    label: "Signing in & account access",
    flows: [
      {
        id: "sign-in",
        title: "Sign in",
        description:
          "The returning-member sign-in screen: email and password entry into the platform.",
        to: routes.signIn,
      },
      {
        id: "verification-needed",
        title: "Verification needed",
        description:
          "Preview the prompt shown when an account needs to verify identity before continuing.",
        to: routes.verificationNeeded,
      },
    ],
  },
  {
    label: "Events & hosting",
    flows: [
      {
        id: "rsvp-to-a-gathering",
        title: "RSVP to a gathering",
        description:
          "Walk through reserving a spot at an event and receiving your ticket.",
        to: routes.rsvp,
      },
      {
        id: "host-a-gathering",
        title: "Host a gathering",
        description:
          "The whole host journey: from the host pitch through creating, publishing and inviting a co-organiser to your gathering.",
        to: routes.host,
      },
      {
        id: "gathering-recap",
        title: "Gathering recap",
        description:
          "Preview the post-event recap a host or attendee sees once a gathering has wrapped.",
        to: gatheringRecapPath(DEMO_GATHERING_SLUGS.recap),
      },
      {
        id: "gathering-cancelled",
        title: "Gathering cancelled",
        description:
          "See the notice attendees receive when a gathering they signed up for is called off.",
        to: gatheringCancelledPath(DEMO_GATHERING_SLUGS.cancelled),
      },
    ],
  },
  {
    label: "Safety & moderation",
    flows: [
      {
        id: "report-someone",
        title: "Report someone",
        description:
          "Walk through reporting a member or piece of content to the moderation team.",
        to: routes.report,
      },
      {
        id: "block-and-mute",
        title: "Block & mute",
        description:
          "See the controls for blocking or muting another member to manage your own space.",
        to: routes.blockMute,
      },
      {
        id: "appeal-an-outcome",
        title: "Appeal an outcome",
        description:
          "Walk through appealing a moderation decision you disagree with.",
        to: routes.appealOutcome,
      },
      {
        id: "report-a-hate-crime",
        title: "Report a hate crime",
        description:
          "See the guided flow for documenting and reporting a hate crime.",
        to: routes.hateCrime,
      },
    ],
  },
  {
    label: "Your data & leaving",
    flows: [
      {
        id: "your-data-rights",
        title: "Your data rights",
        description:
          "Exercise your data rights: request a full export of your data or file a formal GDPR access request.",
        to: routes.dataExport,
      },
      {
        id: "leave-the-community",
        title: "Leave the community",
        description:
          "See the considered off-boarding flow for someone choosing to step away.",
        to: routes.deleteAccount,
      },
      {
        id: "delete-account",
        title: "Delete account",
        description:
          "Walk through permanently deleting an account and everything attached to it.",
        to: routes.deleteAccount,
      },
    ],
  },
  {
    label: "Work & economy",
    flows: [
      {
        id: "apply-to-a-job",
        title: "Apply to a job",
        description:
          "Find a role on the jobs board, submit your application, and track where it stands.",
        to: routes.jobs,
      },
      {
        id: "post-an-offer",
        title: "Post an offer",
        description:
          "Walk through listing something you can offer to the community.",
        to: routes.offer,
      },
      {
        id: "find-housing",
        title: "Find housing",
        description:
          "Browse the housing board and step into a listing as a prospective tenant.",
        to: routes.housing,
      },
      {
        id: "apply-for-a-micro-grant",
        title: "Apply for a micro-grant",
        description:
          "Walk through requesting financial support from the community grants pool.",
        to: routes.grants,
      },
      {
        id: "barter-exchange",
        title: "Barter exchange",
        description:
          "See the skills-and-goods barter flow members use to trade without money.",
        to: routes.barter,
      },
      {
        id: "find-a-mentor",
        title: "Find a mentor",
        description:
          "Walk through browsing mentors and requesting a mentorship match.",
        to: routes.mentorship,
      },
    ],
  },
  {
    label: "Cinema",
    flows: [
      {
        id: "watch-on-cinema",
        title: "Watch on Cinema",
        description: "Join Cinema and go straight into watching a film.",
        to: routes.cinemaMembership,
      },
    ],
  },
  {
    label: "Studio (for creators)",
    flows: [
      {
        id: "upload-and-get-paid",
        title: "Upload & get paid",
        description:
          "Walk the creator journey: uploading work and setting up payouts.",
        to: routes.studioUpload,
      },
      {
        id: "submit-to-an-open-call",
        title: "Submit to an open call",
        description:
          "See how a creator responds to an open call and submits a set.",
        to: routes.studioCalls,
      },
      {
        id: "studio-checkout",
        title: "Studio checkout",
        description: "Walk through purchasing from the Studio store.",
        to: routes.studioCheckout,
      },
      {
        id: "moderation-queue",
        title: "Moderation queue",
        description:
          "Step into the creator-side moderation flow: triage, flag review and council.",
        to: routes.studioTriage,
      },
    ],
  },
  {
    label: "Contribute",
    flows: [
      {
        id: "submit-a-story",
        title: "Submit a story",
        description: "Walk through sharing your story for the magazine.",
        to: routes.submitStory,
      },
    ],
  },
  {
    label: "System & account states",
    flows: [
      {
        id: "account-banned",
        title: "Account banned",
        description:
          "Preview the screen shown to a member whose account has been banned.",
        to: routes.accountBanned,
      },
      {
        id: "account-locked",
        title: "Account locked",
        description:
          "See the temporary lock screen shown after suspicious activity.",
        to: routes.accountLocked,
      },
      {
        id: "account-suspended",
        title: "Account suspended",
        description:
          "Preview the notice shown to a member whose account is suspended.",
        to: routes.accountSuspended,
      },
      {
        id: "maintenance-mode",
        title: "Maintenance mode",
        description:
          "See the page shown to everyone while the platform is down for maintenance.",
        to: routes.maintenance,
      },
      {
        id: "offline",
        title: "Offline",
        description:
          "Preview the fallback shown when a member loses their connection.",
        to: routes.offline,
      },
      {
        id: "server-error",
        title: "Server error",
        description:
          "Preview the 500 error page shown when something breaks on our side.",
        to: routes.serverError,
      },
      {
        id: "install-the-app",
        title: "Install the app",
        description:
          "See the prompt inviting members to install QueerPulse as an app.",
        to: routes.pwaPrompt,
      },
      {
        id: "app-launch",
        title: "Opening the installed app",
        description:
          "The boot sequence a member sees when they open QueerPulse from their home screen: the mark beating on plum, the wordmark rising, and the handoff into the feed. Normally only reachable on an installed phone.",
        to: appLaunchPreviewPath({ holdMs: 900 }),
      },
      {
        id: "app-launch-returning",
        title: "Opening the app as a returning member",
        description:
          "The warm start: instead of the slogan, the splash greets you by name for the time of day.",
        to: appLaunchPreviewPath({ holdMs: 900, name: "Tiago" }),
      },
      {
        id: "app-launch-slow",
        title: "Opening the app on a slow connection",
        description:
          "What the wait looks like when it runs long: the hairline stops pretending to measure, turns into a shimmer, and says it is still connecting.",
        to: appLaunchPreviewPath({ holdMs: 3400 }),
      },
      {
        id: "app-launch-offline",
        title: "Opening the app offline",
        description:
          "The offline path: the splash says you are offline and about to land on your saved feed, then takes a longer beat before handing over.",
        to: appLaunchPreviewPath({ holdMs: 2500, isOffline: true }),
      },
      {
        id: "app-launch-pride",
        title: "Opening the app during Pride",
        description:
          "The seasonal variant of the launch screen, which the app picks up from the date on its own. Trans Day of Remembrance and Lisbon summer work the same way.",
        to: appLaunchPreviewPath({ holdMs: 1400, season: "pride" }),
      },
    ],
  },
];

export function findSimFlow(id: string): SimFlow | undefined {
  for (const group of SIM_GROUPS) {
    const match = group.flows.find((flow) => flow.id === id);
    if (match) return match;
  }
  return undefined;
}

/** Append the sandbox flag, choosing ? or & so a path that already has a
 *  query string stays valid. */
export function withSandboxFlag(path: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}sandbox=1`;
}

/**
 * Build a launch-screen preview URL. The boot sequence only runs on a cold
 * start of the installed app, so these flags are the only way to look at it on
 * a desktop; they are ignored outside a sandbox or a dev server
 * (features/system/appLaunchPreview.ts).
 *
 * It rides on the feed because that is the screen the sequence hands off TO:
 * the exit flies its beating mark into the nav bar's live dot, which has to be
 * really there for the handoff to be worth previewing.
 */
export function appLaunchPreviewPath(options: {
  holdMs: number;
  name?: string;
  season?: string;
  isOffline?: boolean;
}): string {
  const params = new URLSearchParams({
    launch: "preview",
    launchHold: String(options.holdMs),
  });
  if (options.name) params.set("launchName", options.name);
  if (options.season) params.set("launchSeason", options.season);
  if (options.isOffline) params.set("launchOffline", "1");
  return `${routes.feed}?${params.toString()}`;
}

import { routes } from "../../app/routeMap";
import {
  DEMO_GATHERING_SLUGS,
  gatheringRecapPath,
  gatheringCancelledPath,
} from "../gatherings/data";

export interface SimFlow {
  title: string;
  description: string;
  to: string;
  /** Centred "state screen" — opens in an in-Settings device-frame preview
   *  instead of navigating away. */
  preview?: boolean;
}

export const SIM_GROUPS: { label: string; flows: SimFlow[] }[] = [
  {
    label: "Joining the community",
    flows: [
      {
        title: "Join QueerPulse",
        description: "The full join journey end to end: open your invitation, create your account, complete new-member onboarding, and finish on the welcome tour.",
        to: routes.inviteLanding,
      },
      {
        title: "Invite someone to QueerPulse",
        description: "Step into a member’s shoes and bring someone in: spend your monthly invite, write the vouch, and send it by email or a shareable link.",
        to: routes.invite,
      },
      {
        title: "Request an invite",
        description: "Walk through asking to join: the form a prospective member fills in when they don’t yet have an invitation.",
        to: routes.requestInvite,
        preview: true,
      },
      {
        title: "Vouch for someone",
        description: "See how an existing member nominates and vouches for a friend to bring them into the network.",
        to: routes.vouch,
      },
      {
        title: "Pending review",
        description: "See the holding screen shown while a new application is being reviewed by the community.",
        to: routes.pendingReview,
        preview: true,
      },
      {
        title: "Invite expired",
        description: "Preview the dead-end someone hits when they open an invitation link that has already expired.",
        to: routes.inviteExpired,
        preview: true,
      },
    ],
  },
  {
    label: "Signing in & account access",
    flows: [
      {
        title: "Sign in",
        description: "The returning-member sign-in screen: email and password entry into the platform.",
        to: routes.signIn,
      },
      {
        title: "Verification needed",
        description: "Preview the prompt shown when an account needs to verify identity before continuing.",
        to: routes.verificationNeeded,
        preview: true,
      },
    ],
  },
  {
    label: "Events & hosting",
    flows: [
      {
        title: "RSVP to a gathering",
        description: "Walk through reserving a spot at an event and receiving your ticket.",
        to: routes.rsvp,
      },
      {
        title: "Host a gathering",
        description: "The whole host journey: from the host pitch through creating, publishing and inviting a co-organiser to your gathering.",
        to: routes.host,
      },
      {
        title: "Gathering recap",
        description: "Preview the post-event recap a host or attendee sees once a gathering has wrapped.",
        to: gatheringRecapPath(DEMO_GATHERING_SLUGS.recap),
      },
      {
        title: "Gathering cancelled",
        description: "See the notice attendees receive when a gathering they signed up for is called off.",
        to: gatheringCancelledPath(DEMO_GATHERING_SLUGS.cancelled),
      },
    ],
  },
  {
    label: "Safety & moderation",
    flows: [
      {
        title: "Report someone",
        description: "Walk through reporting a member or piece of content to the moderation team.",
        to: routes.report,
      },
      {
        title: "Block & mute",
        description: "See the controls for blocking or muting another member to manage your own space.",
        to: routes.blockMute,
      },
      {
        title: "Appeal an outcome",
        description: "Walk through appealing a moderation decision you disagree with.",
        to: routes.appealOutcome,
      },
      {
        title: "Report a hate crime",
        description: "See the guided flow for documenting and reporting a hate crime.",
        to: routes.hateCrime,
      },
    ],
  },
  {
    label: "Your data & leaving",
    flows: [
      {
        title: "Your data rights",
        description: "Exercise your data rights: request a full export of your data or file a formal GDPR access request.",
        to: routes.dataExport,
      },
      {
        title: "Leave the community",
        description: "See the considered off-boarding flow for someone choosing to step away.",
        to: routes.deleteAccount,
      },
      {
        title: "Delete account",
        description: "Walk through permanently deleting an account and everything attached to it.",
        to: routes.deleteAccount,
      },
    ],
  },
  {
    label: "Work & economy",
    flows: [
      {
        title: "Apply to a job",
        description: "Find a role on the jobs board, submit your application, and track where it stands.",
        to: routes.jobs,
      },
      {
        title: "Post an offer",
        description: "Walk through listing something you can offer to the community.",
        to: routes.offer,
      },
      {
        title: "Find housing",
        description: "Browse the housing board and step into a listing as a prospective tenant.",
        to: routes.housing,
      },
      {
        title: "Apply for a micro-grant",
        description: "Walk through requesting financial support from the community grants pool.",
        to: routes.grants,
      },
      {
        title: "Barter exchange",
        description: "See the skills-and-goods barter flow members use to trade without money.",
        to: routes.barter,
      },
      {
        title: "Find a mentor",
        description: "Walk through browsing mentors and requesting a mentorship match.",
        to: routes.mentorship,
      },
    ],
  },
  {
    label: "Cinema",
    flows: [
      {
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
        title: "Upload & get paid",
        description: "Walk the creator journey: uploading work and setting up payouts.",
        to: routes.studioUpload,
      },
      {
        title: "Submit to an open call",
        description: "See how a creator responds to an open call and submits a set.",
        to: routes.studioCalls,
      },
      {
        title: "Studio checkout",
        description: "Walk through purchasing from the Studio store.",
        to: routes.studioCheckout,
      },
      {
        title: "Moderation queue",
        description: "Step into the creator-side moderation flow: triage, flag review and council.",
        to: routes.studioTriage,
      },
    ],
  },
  {
    label: "Contribute",
    flows: [
      {
        title: "Submit a story",
        description: "Walk through sharing your story for the magazine.",
        to: routes.submitStory,
      },
      {
        title: "Donate",
        description: "See the flow for making a one-off or recurring donation to the community.",
        to: routes.donate,
      },
    ],
  },
  {
    label: "System & account states",
    flows: [
      {
        title: "Account banned",
        description: "Preview the screen shown to a member whose account has been banned.",
        to: routes.accountBanned,
        preview: true,
      },
      {
        title: "Account locked",
        description: "See the temporary lock screen shown after suspicious activity.",
        to: routes.accountLocked,
        preview: true,
      },
      {
        title: "Account suspended",
        description: "Preview the notice shown to a member whose account is suspended.",
        to: routes.accountSuspended,
        preview: true,
      },
      {
        title: "Maintenance mode",
        description: "See the page shown to everyone while the platform is down for maintenance.",
        to: routes.maintenance,
        preview: true,
      },
      {
        title: "Offline",
        description: "Preview the fallback shown when a member loses their connection.",
        to: routes.offline,
        preview: true,
      },
      {
        title: "Geo-restricted",
        description: "See the screen shown when content isn’t available in the member’s region.",
        to: routes.geoRestricted,
        preview: true,
      },
      {
        title: "Server error",
        description: "Preview the 500 error page shown when something breaks on our side.",
        to: routes.serverError,
        preview: true,
      },
      {
        title: "Install the app",
        description: "See the prompt inviting members to install QueerPulse as an app.",
        to: routes.pwaPrompt,
        preview: true,
      },
    ],
  },
];

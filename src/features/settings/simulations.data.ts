import { routes } from '../../app/routeMap'

export interface SimFlow {
  title: string
  desc: string
  to: string
}

export const SIM_GROUPS: { label: string; flows: SimFlow[] }[] = [
  {
    label: 'Joining the community',
    flows: [
      {
        title: 'Invite landing',
        desc: 'Start from the invite landing page — the first screen someone sees when they open an invitation link.',
        to: routes.inviteLanding,
      },
      {
        title: 'Request an invite',
        desc: 'Walk through asking to join — the form a prospective member fills in when they don’t yet have an invitation.',
        to: routes.invite,
      },
      {
        title: 'Vouch for someone',
        desc: 'See how an existing member nominates and vouches for a friend to bring them into the network.',
        to: routes.vouch,
      },
      {
        title: 'New-member onboarding',
        desc: 'Walk through the guided setup someone completes right after accepting their invite.',
        to: routes.welcome,
      },
      {
        title: 'Welcome tour',
        desc: 'Take the orientation a member sees on their first visit — a quick tour of the platform and what to do next.',
        to: routes.welcomeTour,
      },
      {
        title: 'Pending review',
        desc: 'See the holding screen shown while a new application is being reviewed by the community.',
        to: routes.pendingReview,
      },
      {
        title: 'Invite expired',
        desc: 'Preview the dead-end someone hits when they open an invitation link that has already expired.',
        to: routes.inviteExpired,
      },
    ],
  },
  {
    label: 'Signing in & account access',
    flows: [
      {
        title: 'Sign in',
        desc: 'The returning-member sign-in screen — email and password entry into the platform.',
        to: routes.signIn,
      },
      {
        title: 'Create account',
        desc: 'Walk through setting up credentials for a brand-new account.',
        to: routes.createAccount,
      },
      {
        title: 'Magic-link sign-in',
        desc: 'See the passwordless flow — request a one-time sign-in link sent to your email.',
        to: routes.magicLink,
      },
      {
        title: 'Password reset',
        desc: 'Walk through forgetting your password and choosing a new one, end to end.',
        to: routes.passwordReset,
      },
      {
        title: 'Set a new password',
        desc: 'The screen where you choose a replacement password after following a reset link.',
        to: routes.setNewPassword,
      },
      {
        title: 'Confirm your email',
        desc: 'Preview the email-confirmation step that verifies a newly entered address.',
        to: routes.confirmEmail,
      },
      {
        title: 'Two-factor setup',
        desc: 'Walk through adding a second login step and saving your backup recovery codes.',
        to: routes.twoFactorSetup,
      },
      {
        title: 'Recovery codes',
        desc: 'See the one-time backup codes screen used to regain access if you lose your 2FA device.',
        to: routes.recoveryCodes,
      },
      {
        title: 'Verification needed',
        desc: 'Preview the prompt shown when an account needs to verify identity before continuing.',
        to: routes.verificationNeeded,
      },
    ],
  },
  {
    label: 'Events & hosting',
    flows: [
      {
        title: 'RSVP to a gathering',
        desc: 'Walk through reserving a spot at an event and receiving your ticket.',
        to: routes.rsvp,
      },
      {
        title: 'Host a gathering',
        desc: 'Start the host journey — from the host pitch through creating and publishing a gathering.',
        to: routes.host,
      },
      {
        title: 'Create a gathering',
        desc: 'Jump straight into the gathering-creation form a host fills in to list a new event.',
        to: routes.createGathering,
      },
      {
        title: 'Co-host invite',
        desc: 'See how a host brings in a co-organiser to help run their gathering.',
        to: routes.coHostInvite,
      },
      {
        title: 'Gathering recap',
        desc: 'Preview the post-event recap a host or attendee sees once a gathering has wrapped.',
        to: routes.gatheringRecap,
      },
      {
        title: 'Gathering cancelled',
        desc: 'See the notice attendees receive when a gathering they signed up for is called off.',
        to: routes.gatheringCancelled,
      },
    ],
  },
  {
    label: 'Safety & moderation',
    flows: [
      {
        title: 'Report someone',
        desc: 'Walk through reporting a member or piece of content to the moderation team.',
        to: routes.report,
      },
      {
        title: 'Block & mute',
        desc: 'See the controls for blocking or muting another member to manage your own space.',
        to: routes.blockMute,
      },
      {
        title: 'Appeal an outcome',
        desc: 'Walk through appealing a moderation decision you disagree with.',
        to: routes.appealOutcome,
      },
      {
        title: 'Crisis chat',
        desc: 'Preview the immediate-support chat available to members in distress.',
        to: routes.crisisChat,
      },
      {
        title: 'Report a hate crime',
        desc: 'See the guided flow for documenting and reporting a hate crime.',
        to: routes.hateCrime,
      },
    ],
  },
  {
    label: 'Managing your membership',
    flows: [
      {
        title: 'Manage membership',
        desc: 'Walk through viewing and changing your membership tier and benefits.',
        to: routes.membership,
      },
      {
        title: 'Subscriptions',
        desc: 'See the screen for managing recurring subscriptions and billing.',
        to: routes.subscriptions,
      },
      {
        title: 'Gift a membership',
        desc: 'Walk through buying and sending a membership to someone else.',
        to: routes.giftMembership,
      },
      {
        title: 'Export your data',
        desc: 'See how a member requests and downloads a full export of their data.',
        to: routes.dataExport,
      },
      {
        title: 'Data subject access request',
        desc: 'Walk through the formal GDPR request for the personal data held about you.',
        to: routes.dsar,
      },
      {
        title: 'Cancel membership',
        desc: 'Walk through pausing or cancelling a paid membership.',
        to: routes.cancelMembership,
      },
      {
        title: 'Leave the community',
        desc: 'See the considered off-boarding flow for someone choosing to step away.',
        to: routes.leave,
      },
      {
        title: 'Delete account',
        desc: 'Walk through permanently deleting an account and everything attached to it.',
        to: routes.deleteAccount,
      },
    ],
  },
  {
    label: 'Work & economy',
    flows: [
      {
        title: 'Apply to a job',
        desc: 'Walk through finding a role on the jobs board and submitting an application.',
        to: routes.jobs,
      },
      {
        title: 'Track an application',
        desc: 'See the status screen where a candidate follows where their application stands.',
        to: routes.applicationStatus,
      },
      {
        title: 'Post an offer',
        desc: 'Walk through listing something you can offer to the community.',
        to: routes.offer,
      },
      {
        title: 'Find housing',
        desc: 'Browse the housing board and step into a listing as a prospective tenant.',
        to: routes.housing,
      },
      {
        title: 'Apply for a micro-grant',
        desc: 'Walk through requesting financial support from the community grants pool.',
        to: routes.grants,
      },
      {
        title: 'Barter exchange',
        desc: 'See the skills-and-goods barter flow members use to trade without money.',
        to: routes.barter,
      },
      {
        title: 'Find a mentor',
        desc: 'Walk through browsing mentors and requesting a mentorship match.',
        to: routes.mentorship,
      },
    ],
  },
  {
    label: 'Cinema',
    flows: [
      {
        title: 'Join Cinema',
        desc: 'Walk through the Cinema membership and sign-up flow.',
        to: routes.cinemaMembership,
      },
      {
        title: 'Watch a film',
        desc: 'Step into a film page and start the viewing experience.',
        to: routes.film,
      },
    ],
  },
  {
    label: 'Studio (for creators)',
    flows: [
      {
        title: 'Upload & get paid',
        desc: 'Walk the creator journey — uploading work and setting up payouts.',
        to: routes.studioUpload,
      },
      {
        title: 'Submit to an open call',
        desc: 'See how a creator responds to an open call and submits a set.',
        to: routes.studioCalls,
      },
      {
        title: 'Studio checkout',
        desc: 'Walk through purchasing from the Studio store.',
        to: routes.studioCheckout,
      },
      {
        title: 'Moderation queue',
        desc: 'Step into the creator-side moderation flow — triage, flag review and council.',
        to: routes.studioTriage,
      },
    ],
  },
  {
    label: 'Contribute',
    flows: [
      {
        title: 'Submit a story',
        desc: 'Walk through sharing your story for the magazine.',
        to: routes.submitStory,
      },
      {
        title: 'Donate',
        desc: 'See the flow for making a one-off or recurring donation to the community.',
        to: routes.donate,
      },
    ],
  },
  {
    label: 'System & account states',
    flows: [
      {
        title: 'Account banned',
        desc: 'Preview the screen shown to a member whose account has been banned.',
        to: routes.accountBanned,
      },
      {
        title: 'Account locked',
        desc: 'See the temporary lock screen shown after suspicious activity.',
        to: routes.accountLocked,
      },
      {
        title: 'Account suspended',
        desc: 'Preview the notice shown to a member whose account is suspended.',
        to: routes.accountSuspended,
      },
      {
        title: 'Maintenance mode',
        desc: 'See the page shown to everyone while the platform is down for maintenance.',
        to: routes.maintenance,
      },
      {
        title: 'Offline',
        desc: 'Preview the fallback shown when a member loses their connection.',
        to: routes.offline,
      },
      {
        title: 'Geo-restricted',
        desc: 'See the screen shown when content isn’t available in the member’s region.',
        to: routes.geoRestricted,
      },
      {
        title: 'Server error',
        desc: 'Preview the 500 error page shown when something breaks on our side.',
        to: routes.serverError,
      },
      {
        title: 'Install the app',
        desc: 'See the prompt inviting members to install QueerPulse as an app.',
        to: routes.pwaPrompt,
      },
    ],
  },
]

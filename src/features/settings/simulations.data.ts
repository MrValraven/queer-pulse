import { routes } from '../../app/routeMap'

export interface SimFlow {
  title: string
  desc: string
  to: string
  /** Centred "state screen" — opens in an in-Settings device-frame preview
   *  instead of navigating away. */
  preview?: boolean
}

export const SIM_GROUPS: { label: string; flows: SimFlow[] }[] = [
  {
    label: 'Joining the community',
    flows: [
      {
        title: 'Join QueerPulse',
        desc: 'The full join journey end to end — open your invitation, create your account, complete new-member onboarding, and finish on the welcome tour.',
        to: routes.inviteLanding,
      },
      {
        title: 'Invite someone to QueerPulse',
        desc: 'Step into a member’s shoes and bring someone in — spend your monthly invite, write the vouch, and send it by email or a shareable link.',
        to: routes.invite,
      },
      {
        title: 'Request an invite',
        desc: 'Walk through asking to join — the form a prospective member fills in when they don’t yet have an invitation.',
        to: routes.requestInvite,
        preview: true,
      },
      {
        title: 'Vouch for someone',
        desc: 'See how an existing member nominates and vouches for a friend to bring them into the network.',
        to: routes.vouch,
      },
      {
        title: 'Pending review',
        desc: 'See the holding screen shown while a new application is being reviewed by the community.',
        to: routes.pendingReview,
        preview: true,
      },
      {
        title: 'Invite expired',
        desc: 'Preview the dead-end someone hits when they open an invitation link that has already expired.',
        to: routes.inviteExpired,
        preview: true,
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
        title: 'Magic-link sign-in',
        desc: 'See the passwordless flow — request a one-time sign-in link sent to your email.',
        to: routes.magicLink,
        preview: true,
      },
      {
        title: 'Reset your password',
        desc: 'The full password-recovery flow — request a reset link, then choose and confirm a new password.',
        to: routes.passwordReset,
        preview: true,
      },
      {
        title: 'Confirm your email',
        desc: 'Preview the email-confirmation step that verifies a newly entered address.',
        to: routes.confirmEmail,
        preview: true,
      },
      {
        title: 'Set up two-factor',
        desc: 'Add a second login step from start to finish — enable 2FA and save your one-time recovery codes.',
        to: routes.twoFactorSetup,
        preview: true,
      },
      {
        title: 'Verification needed',
        desc: 'Preview the prompt shown when an account needs to verify identity before continuing.',
        to: routes.verificationNeeded,
        preview: true,
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
        desc: 'The whole host journey — from the host pitch through creating, publishing and inviting a co-organiser to your gathering.',
        to: routes.host,
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
        title: 'Membership & billing',
        desc: 'Review and change your membership tier, benefits, and recurring billing all in one place.',
        to: routes.membership,
      },
      {
        title: 'Gift a membership',
        desc: 'Walk through buying and sending a membership to someone else.',
        to: routes.giftMembership,
      },
      {
        title: 'Your data rights',
        desc: 'Exercise your data rights — request a full export of your data or file a formal GDPR access request.',
        to: routes.dataExport,
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
        desc: 'Find a role on the jobs board, submit your application, and track where it stands.',
        to: routes.jobs,
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
        title: 'Watch on Cinema',
        desc: 'Join Cinema and go straight into watching a film.',
        to: routes.cinemaMembership,
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
        preview: true,
      },
      {
        title: 'Account locked',
        desc: 'See the temporary lock screen shown after suspicious activity.',
        to: routes.accountLocked,
        preview: true,
      },
      {
        title: 'Account suspended',
        desc: 'Preview the notice shown to a member whose account is suspended.',
        to: routes.accountSuspended,
        preview: true,
      },
      {
        title: 'Maintenance mode',
        desc: 'See the page shown to everyone while the platform is down for maintenance.',
        to: routes.maintenance,
        preview: true,
      },
      {
        title: 'Offline',
        desc: 'Preview the fallback shown when a member loses their connection.',
        to: routes.offline,
        preview: true,
      },
      {
        title: 'Geo-restricted',
        desc: 'See the screen shown when content isn’t available in the member’s region.',
        to: routes.geoRestricted,
        preview: true,
      },
      {
        title: 'Server error',
        desc: 'Preview the 500 error page shown when something breaks on our side.',
        to: routes.serverError,
        preview: true,
      },
      {
        title: 'Install the app',
        desc: 'See the prompt inviting members to install QueerPulse as an app.',
        to: routes.pwaPrompt,
        preview: true,
      },
    ],
  },
]

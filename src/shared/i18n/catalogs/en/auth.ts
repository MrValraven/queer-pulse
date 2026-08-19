import type { Catalog } from "../../types";

/**
 * Auth surfaces: sign-in, invite (send + landing chrome), onboarding,
 * request-invite, magic-link, confirm-email, and the shared 18+ attestation /
 * under-18 block. Content that in live mode arrives over the wire (a
 * fictional inviter's vouch quote, a member's own bio/role, a community's own
 * name/description) is deliberately left in English elsewhere in the feature
 * — see docs/i18n/extraction-brief.md §1.
 */
export const auth: Catalog = {
  // ── Shared chrome reused across several auth screens ──
  "common.backToProfile": "Back to profile",
  "common.copied": "Copied",
  "common.copy": "Copy",
  "common.delete": "Delete",
  "common.notAMemberYet": "Not a member yet?",
  "common.optionalSuffix": "(optional)",
  "common.resume": "Resume",
  "common.saving": "Saving…",

  // ── Sign in ──
  "signIn.title": "Welcome <em>back</em>",
  "signIn.subtitle": "Sign in to pick up where you left off.",
  "signIn.artCaption": "A queer network, <em>rooted in Lisbon.</em>",
  "signIn.email": "Email",
  "signIn.password": "Password",
  "signIn.submit": "Sign in",
  "signIn.forgot": "Forgot your password?",
  "signIn.connecting": "Connecting…",
  "signIn.googleCta": "Continue with Google",
  "signIn.notice.inviteRequired.title": "You'll need an invite",
  "signIn.notice.inviteRequired.body":
    "QueerPulse is invite-only. Ask a member you know, or request an invite and we'll take it from there.",
  "signIn.notice.accountSuppressed.title": "This account was deleted",
  "signIn.notice.accountSuppressed.body":
    "You asked us to erase this account, so we won't quietly re-create it. If you'd like to come back, ask a member for a fresh invite — or get in touch and we'll help.",
  "signIn.notice.ageAttestationRequired.title": "One box left to tick",
  "signIn.notice.ageAttestationRequired.body":
    "QueerPulse is 18+. Head back to your invite link and confirm you're 18 or older, then you're in.",
  "signIn.notice.inviteInvalid.title": "That invite isn't valid",
  "signIn.notice.inviteInvalid.body":
    "This invite link has expired or was already used. Ask your inviter for a fresh one, or request an invite yourself.",
  "signIn.notice.inviteEmailMismatch.title": "This invite was set for a different email",
  "signIn.notice.inviteEmailMismatch.body":
    "Someone set this invite aside for one specific address. Sign in with that email, or ask them for a new invite for the one you're using.",
  "signIn.notice.inviteInviterInactive.title": "The person who invited you has moved on",
  "signIn.notice.inviteInviterInactive.body":
    "Whoever sent this invite is no longer active on QueerPulse, so it can't bring you in. Ask another member you know for a fresh invite, or request one yourself.",
  "signIn.notice.accessDenied.title": "Sign-in was cancelled",
  "signIn.notice.accessDenied.body":
    "Looks like you cancelled the Google consent screen. No harm done — try again whenever you're ready.",
  "signIn.notice.noEmail.title": "We couldn't get your email",
  "signIn.notice.noEmail.body":
    "Google didn't share an email address with us, so we can't sign you in. Check your Google account's sharing settings and try again.",
  "signIn.notice.emailUnverified.title": "Verify your Google email first",
  "signIn.notice.emailUnverified.body":
    "Your Google account's email isn't verified yet. Verify it with Google, then come back and try again.",
  "signIn.notice.oauthFailed.title": "Something went sideways",
  "signIn.notice.oauthFailed.body":
    "Sign-in didn't complete on Google's side. Nothing was changed — try again in a moment.",
  "signIn.notice.offline.title": "You're offline",
  "signIn.notice.offline.body":
    "We can't reach QueerPulse without a connection. Check your Wi-Fi or data and try again.",
  "signIn.notice.serverError.title": "Something went wrong on our end",
  "signIn.notice.serverError.body":
    "Our server hit a snag{status}. This is on us, not you — try again shortly.",
  "signIn.notice.unreachable.title": "We can't reach QueerPulse",
  "signIn.notice.unreachable.body":
    "The server didn't respond. It might be waking up — give it a moment and try again.",

  // Registration is switched off platform-wide (or the platform is locked).
  // Not the visitor's fault and not retryable — the copy says so plainly and
  // does not invite them to try again in a loop.
  "signIn.notice.registrationDisabled.title": "New accounts are paused",
  "signIn.notice.registrationDisabled.body":
    "We’re not creating new accounts right now. If you already have one, you can still sign in.",

  // Pre-emptive states, rendered from GET /platform-status BEFORE submit so
  // nobody round-trips through Google only to be rejected at the callback.
  "signIn.closed.title": "New accounts are paused",
  "signIn.closed.body":
    "You can still sign in to an existing account below.",

  // ── The abstract "gathered hearth" illustration on the sign-in art tile ──
  "communityArt.ariaLabel":
    "Illustration of community members drifting toward a warm, welcoming centre",

  // ── Invite (send-invite dashboard + composer + link/email panels) ──
  "invite.eyebrow": "Invite someone in",
  "invite.title": "Bring someone <em>in</em>",
  "invite.sub":
    "QueerPulse grows by invitation, never advertising. Vouch for someone you trust.",
  "invite.quota.available_one": "{count} invite available this month",
  "invite.quota.available_other": "{count} invites available this month",
  "invite.quota.none": "No invites left this month",
  "invite.quota.resets_one": "Resets tomorrow",
  "invite.quota.resets_other": "Resets in {count} days",
  "invite.quota.resets_zero": "Resets today",
  "invite.deliveryMethod.ariaLabel": "Choose how to send the invite",
  "invite.deliveryMethod.email": "Email",
  "invite.deliveryMethod.link": "Share a link",

  "invite.compose.vouch.label": "Your vouch",
  "invite.compose.vouch.placeholder":
    "Why should they join? A sentence or two goes a long way.",
  "invite.compose.note.label": "Personal note",
  "invite.compose.note.placeholder": "Add a personal note (optional)",

  "invite.draft.title": "Invite to {name}",
  "invite.draft.titleFallbackName": "someone new",
  "invite.draft.descFallback": "An invite draft in progress",
  "invite.draft.savedJustNow": "Saved just now",
  "invite.draft.savedToast": "Draft saved",

  "invite.email.firstName.label": "First name",
  "invite.email.firstName.placeholder": "Alex",
  "invite.email.lastName.label": "Last name",
  "invite.email.lastName.placeholder": "Morais",
  "invite.email.email.label": "Email",
  "invite.email.email.placeholder": "you@example.com",
  "invite.email.howYouKnowThem.label": "How you know them",
  "invite.email.howYouKnowThem.helper":
    "Helps us understand the connection — never shown publicly.",
  "invite.email.howYouKnowThem.placeholder": "We met at…",
  "invite.email.note.label": "Personal note",
  "invite.email.note.placeholder": "Add a personal note (optional)",
  "invite.email.preview.label": "Preview",
  "invite.email.preview.subject": "{name} invited you to QueerPulse",
  "invite.email.preview.noteFallback": "Thought you'd belong here.",
  "invite.email.preview.openCta": "Open your invite",
  "invite.email.preview.expiresIn7Days": "Expires in 7 days",
  "invite.email.submit": "Send invite",
  "invite.email.saveAsDraft": "Save as draft",
  "invite.email.savedToDrafts": "Saved to Drafts",
  "invite.email.formNote": "They'll get a one-time link that's just for them.",

  "invite.link.previewLabel": "Preview",
  "invite.link.generateCta": "Generate invite link",
  "invite.link.generating": "Generating…",
  "invite.link.error.generic":
    "Something went wrong generating your link — try again.",
  "invite.link.formNote": "This link works once, for one person.",
  "invite.link.defaultVouch":
    "A quiet, vouched-for queer community in Lisbon. No ads, no algorithm. I think you'd belong here.",
  "invite.link.shareMessage":
    "{senderFirst} invited you to QueerPulse, a quiet, vouched-for queer community. Your personal invite: {url}",

  "invite.ready.headline": "Your invite is <em>ready</em>",
  "invite.ready.sub": "Share it however feels natural — it's good for one use.",
  "invite.ready.linkCopied": "Link copied",
  "invite.ready.copyFailed": "Couldn't copy — try selecting the link instead",
  "invite.ready.copyLinkAriaLabel": "Copy invite link",
  "invite.ready.shareThrough": "Share through",
  "invite.ready.qrHint": "Or let them scan it",
  "invite.ready.qrLabel": "QR code for this invite link — scan it to open the invitation",
  "invite.ready.oneTimeLink": "One-time link",
  "invite.ready.expiresIn7Days": "Expires in 7 days",
  "invite.ready.expiresOn": "Expires {date}",

  "invite.sent.headline": "Invite sent to <em>{name}</em>",
  "invite.sent.sub": "We'll let you know when {name} joins.",
  "invite.sent.summary.invited": "Invited",
  "invite.sent.summary.sent": "Sent",
  "invite.sent.summary.sentToday": "Today at {time}",
  "invite.sent.summary.expires": "Expires",

  "invite.sentList.label": "Invites you've sent",
  "invite.sentList.filter.all": "All",
  "invite.sentList.status.valid": "Pending",
  "invite.sentList.status.used": "Accepted",
  "invite.sentList.status.expired": "Expired",
  "invite.sentList.status.revoked": "Revoked",
  "invite.sentList.detail.joined": "Joined — welcome {name}",
  "invite.sentList.detail.sentExpires": "Sent {sent} · expires {expires}",
  "invite.sentList.detail.sentExpired": "Sent {sent} · expired {expires}",
  "invite.sentList.detail.sent": "Sent {sent}",
  "invite.sentList.revokeCta": "Revoke",
  "invite.sentList.revoking": "Revoking…",
  "invite.sentList.revokedToast": "Invite revoked — the link no longer works.",
  "invite.sentList.resendCta": "Send again",
  "invite.sentList.resending": "Sending…",
  "invite.sentList.resentToast": "Invite sent again — same link, fresh for another week.",
  "invite.sentList.resendError.notYours":
    "This isn't one of your invites to send again.",
  "invite.sentList.resendError.notFound":
    "We couldn't find that invite — it may have already been cleared.",
  "invite.sentList.resendError.notResendable":
    "Only an expired invite can be sent again — this one's already been used, withdrawn, or is still live.",
  "invite.sentList.resendError.generic":
    "Couldn't send that one again just now — give it another try in a moment.",

  // ── Invite unfurl preview card (mirrors the static Open Graph tags) ──
  "sharePreview.heroTitle.line1": "Walk into a room",
  "sharePreview.heroTitle.line2": "<em>where you already belong</em>",
  "sharePreview.heroExplainer": "A queer network. Rooted in Lisbon.",
  "sharePreview.heroSub": "Invite-only · 247 members",
  "sharePreview.title": "{senderName} invited you to QueerPulse",

  // ── 18+ self-attestation (shared by onboarding + request-invite) ──
  "ageAttestation.confirmLabel": "I confirm I'm 18 or older.",
  "ageAttestation.helper":
    "QueerPulse is an adults-only community — <eligibility>here's why</eligibility>. No ID needed; we trust you. <under18>Not 18 yet?</under18>",
  "adultsOnly.eyebrow": "Membership",
  "adultsOnly.ariaLabel": "Why QueerPulse is adults-only",
  "adultsOnly.title": "Why QueerPulse is <em>adults-only</em>",
  "adultsOnly.body1":
    "QueerPulse is open to anyone 18 or older who's invited or vouched into the community.",
  "adultsOnly.body2":
    "We keep it adults-only for a reason. So much of what happens here is frank talk about sex and sexual health, dating and nightlife, and the kind of unguarded conversation that only feels safe among adults. It isn't a fit for minors, and mixing the two would put everyone's safety at risk. Under-18s deserve queer community too; this just isn't the room for it yet.",
  "adultsOnly.reassure": "No ID needed. We trust you.",
  "adultsOnly.done": "Got it",

  // ── The humane under-18 block ──
  "under18.title": "We'll be here <em>when you're ready</em>",
  "under18.body1":
    "The community side of QueerPulse is 18+ for now, so we can't set you up with an account just yet — and that's not a judgement on you. But most of what we make is open to everyone, no login needed. You belong in queer community, and there's a lot of it waiting for you right here.",
  "under18.body2":
    "Have a read of the library and everything else that's yours right now:",
  "under18.link.library": "The library — free to browse, no account needed",
  "under18.link.queer101": "Queer 101 — the basics, no gatekeeping",
  "under18.link.comingOut": "Coming out, at your own pace",
  "under18.link.resources": "Community resources & support",
  "under18.link.eligibility": "Why we're 18+ (our Terms)",
  "under18.backDefault": "Back",

  // ── Confirm email (six-digit code) ──

  // ── Magic link sign-in ──

  // ── Request an invite (prospective-member ask-to-join form + confirmation) ──
  "requestInvite.eyebrow": "Request an invite",
  "requestInvite.title": "Ask to come <em>in.</em>",
  "requestInvite.sub":
    "QueerPulse grows through trust, not advertising. The surest way in is a member who'll vouch for you — if you know someone here, ask them. If you don't, tell us a little about you and we'll take it from there.",
  "requestInvite.alreadyMember": "Already a member? Sign in",
  "requestInvite.field.name.label": "Your name",
  "requestInvite.field.name.placeholder": "Alex",
  "requestInvite.field.name.error": "Tell us what to call you.",
  "requestInvite.field.city.label": "City",
  "requestInvite.field.city.placeholder": "Lisbon",
  "requestInvite.field.email.label": "Email",
  "requestInvite.field.email.placeholder": "you@example.com",
  "requestInvite.field.email.error":
    "That email doesn't look right — mind checking it?",
  "requestInvite.field.email.errorRequired":
    "We need an email so we can write back.",
  "requestInvite.field.mutual.label":
    "A member's email <optional>(optional)</optional>",
  "requestInvite.field.mutual.helper":
    "The email of a member who can vouch for you — it's how we match them, and the fastest route in.",
  "requestInvite.field.mutual.placeholder": "member@example.com",
  "requestInvite.field.mutual.error":
    "Enter a valid email, or leave this blank.",
  // Appended to the message so the reviewer sees who to match against — there is
  // no separate field for it on POST /join-requests.
  "requestInvite.field.mutual.messagePrefix":
    "A member who can vouch for me: {name}",
  "requestInvite.field.why.label": "Why QueerPulse",
  "requestInvite.field.why.placeholder":
    "What you're looking for, and what brings you here. A few honest sentences is plenty.",
  "requestInvite.field.why.error":
    "Tell us a little about what brings you here.",
  "requestInvite.agree":
    "I've read the <guidelines>community guidelines</guidelines> and I'm here in good faith.",
  "requestInvite.readHint":
    "Open the guidelines and read to the end to continue.",
  "requestInvite.submit": "Send my request",
  "requestInvite.sending": "Sending your request…",
  "requestInvite.submitError": "Could not send your request — please try again",
  // 429: the public form throttles at 3 requests/hour per IP. An immediate
  // retry can't succeed, so this sets the expectation plainly rather than
  // inviting one.
  "requestInvite.rateLimitedError":
    "You've reached the limit for now. Please wait a while and try again.",
  "requestInvite.under18BackLabel": "Back to the form",
  "requestInvite.sent.title": "You're on the <em>list.</em>",
  "requestInvite.sent.sub_withName":
    "Thanks, {name} — your request to join QueerPulse is in. Here's what happens from here.",
  "requestInvite.sent.sub_noName":
    "Thanks — your request to join QueerPulse is in. Here's what happens from here.",
  "requestInvite.sent.backHome": "Back to home",
  // The 409 case: an open request already exists for this email. Nothing went
  // wrong, so this reads as a confirmation, never as a failure.
  "requestInvite.already.title": "We already <em>have it.</em>",
  "requestInvite.already.sub_withName":
    "You've asked us before, {name} — your request is still with us and still being read. No need to send another.",
  "requestInvite.already.sub_noName":
    "You've asked us before — your request is still with us and still being read. No need to send another.",
  "requestInvite.whatNext.readsIt.title": "A real person reads it",
  "requestInvite.whatNext.readsIt.body":
    "No algorithm, no waitlist score — a member of the community looks at every request.",
  "requestInvite.whatNext.connection.title": "We look for a connection",
  "requestInvite.whatNext.connection.body":
    "If someone already here can vouch for you, that's the surest way in. Sharing their email helps us match them.",
  // Honest about the real mechanism: there is no mail service, so an approval
  // is a person sending a link by hand, and a decline sends nothing at all.
  // Promising "you hear back either way" would be a quiet lie to someone who
  // then waits for a reply that can never arrive.
  "requestInvite.whatNext.hearBack.title": "If it's a yes, someone gets in touch",
  "requestInvite.whatNext.hearBack.body":
    "A member sends your invite link to the address you gave us, usually within a couple of weeks. We can't reply to every request, so if it stays quiet, asking someone you already know here is the surest way in.",

  // Pre-emptive states, rendered from GET /platform-status BEFORE submit so
  // nobody fills in the whole form only to be rejected on submit.
  "requestInvite.closed.title": "Invite requests are paused",
  "requestInvite.closed.body":
    "We’re not taking new invite requests at the moment. Please check back soon.",
  "requestInvite.closedError":
    "Invite requests were paused while you were filling this in. Please try again later.",

  // ── Onboarding (the 7-step post-signup flow at /onboarding) ──
  "onboarding.stepLabel": "Step {current} of {total}",
  "onboarding.welcomeToQueerPulse": "Welcome to QueerPulse",
  "onboarding.stepIntro.heading": "Let's start your <em>onboarding</em>",
  "onboarding.stepIntro.body":
    "A few quick steps to set up your profile and find your people. It takes about two minutes — and you can change anything later.",
  "onboarding.stepIntro.cta": "Let's begin",
  "onboarding.preview.makeItYours.title": "Make it yours",
  "onboarding.preview.makeItYours.desc":
    "Add a photo so members can put a face to your name.",
  "onboarding.preview.setIntentions.title": "Set your intentions",
  "onboarding.preview.setIntentions.desc":
    "Tell us what brings you here, and we'll tailor things.",
  "onboarding.preview.findCommunities.title": "Find your communities",
  "onboarding.preview.findCommunities.desc":
    "Join the groups that match what you care about.",

  "onboarding.stepWelcome.eyebrowSuffix": "You're in",
  "onboarding.stepWelcome.heading": "Welcome, <em>{firstName}</em>",
  "onboarding.stepWelcome.memberSince": "Member since {since}",
  "onboarding.stepWelcome.invitedYou": "Invited you",
  "onboarding.stepWelcome.memberSinceRole": "Member since {since} · {role}",
  "onboarding.stepWelcome.vouchFallback":
    "{firstName} is thoughtful, creative, and exactly who we hoped would end up here.",
  "onboarding.stepWelcome.body":
    "QueerPulse is a cared-for professional network rooted in Lisbon. You were invited because someone here already knows you.",
  "onboarding.stepWelcome.cta": "Let's get started",
  "onboarding.stepWelcome.back": "Back",

  "onboarding.stepPhoto.heading": "Put a face to the <em>name</em>",
  "onboarding.stepPhoto.body":
    "A photo and a few quick details help members feel comfortable connecting with you. You can always add or change these later.",
  "onboarding.stepPhoto.captionPreview":
    "Looking good — tap the photo to change it",
  "onboarding.stepPhoto.captionGoogle":
    "From your Google account — tap the photo to change it",
  "onboarding.stepPhoto.captionUpload": "Tap to upload a photo",
  "onboarding.stepPhoto.uploadAriaLabel": "Upload a profile photo",
  "onboarding.stepPhoto.photoAlt": "Your profile photo",
  "onboarding.stepPhoto.placeholder": "your photo",
  "onboarding.stepPhoto.continue": "Continue",
  "onboarding.stepPhoto.skip": "Skip for now — you can add this later",
  "onboarding.stepPhoto.back": "Back",
  "onboarding.stepPhoto.uploadError":
    "We couldn't add that photo. Please try again.",
  "onboarding.stepPhoto.saveError":
    "We couldn't save that just now. Please try again.",
  "onboarding.stepPhoto.firstName.label": "First name",
  "onboarding.stepPhoto.lastName.label": "Last name",
  "onboarding.stepPhoto.name.helper":
    "This is what members will see on your profile. We pulled it from your Google account, but you can change it.",
  "onboarding.stepPhoto.preview.caption": "How your profile card will look",
  "onboarding.stepPhoto.pronouns.label": "Pronouns",
  "onboarding.stepPhoto.pronouns.helper":
    "However you'd like members to refer to you. Totally optional.",
  "onboarding.stepPhoto.pronouns.placeholder": "e.g. they/them",
  "onboarding.stepPhoto.pronouns.quickPickLabel": "Quick pick a pronoun set",
  "onboarding.stepPhoto.bio.label": "A line about you",
  "onboarding.stepPhoto.bio.helper":
    "Shows on your profile. You can change it anytime in Settings.",
  "onboarding.stepPhoto.bio.placeholder": "Say a little about who you are",

  "onboarding.stepNorms.heading": "This is a <em>cared-for</em> space",
  "onboarding.stepNorms.norm.bePresent.title": "Be present",
  "onboarding.stepNorms.norm.bePresent.desc":
    "Give conversations your genuine attention. Scrolling past is fine; engaging half-heartedly isn't.",
  "onboarding.stepNorms.norm.namesPronouns.title": "Respect names and pronouns",
  "onboarding.stepNorms.norm.namesPronouns.desc":
    "Use the name and pronouns each member shares. If you're unsure, ask — that's always welcome here.",
  "onboarding.stepNorms.norm.staysHere.title": "What's shared here stays here",
  "onboarding.stepNorms.norm.staysHere.desc":
    "Members share things here they might not share elsewhere. Treat that as a privilege.",
  "onboarding.stepNorms.norm.askBeforePhoto.title": "Ask before you photograph",
  "onboarding.stepNorms.norm.askBeforePhoto.desc":
    "At gatherings, always ask before photographing other members, even in a shared space.",
  "onboarding.stepNorms.agree":
    "I've read and agree to the <guidelines>Community Guidelines</guidelines>",
  "onboarding.stepNorms.readHint":
    "Open the guidelines and read to the end to continue.",
  "onboarding.stepNorms.continue": "I agree, continue",
  "onboarding.stepNorms.back": "Back",

  "onboarding.stepIntents.heading": "What brings you <em>here?</em>",
  "onboarding.stepIntents.hint": "Pick at least one — choose as many as fit.",
  "onboarding.stepIntents.continue": "Continue",
  "onboarding.stepIntents.back": "Back",
  "onboarding.stepIntents.saveError":
    "We couldn't save that just now. Please try again.",
  "onboarding.intent.community": "Community",
  "onboarding.intent.gatherings": "Gatherings & events",
  "onboarding.intent.professional": "Professional connections",
  "onboarding.intent.dating": "Dating",
  "onboarding.intent.friendship": "Friendship",
  "onboarding.intent.resources": "Resources & support",
  "onboarding.intent.contributing": "Contributing",
  "onboarding.intent.housing": "Housing",
  "onboarding.intent.flatmates": "Finding flatmates",
  "onboarding.intent.activism": "Activism",
  "onboarding.intent.creative": "Creative collaboration",
  "onboarding.intent.media": "Media & culture",
  "onboarding.intent.discussions": "Discussions",
  "onboarding.intent.mentorship": "Mentorship",

  "onboarding.stepCommunities.heading": "Find your <em>communities</em>",
  "onboarding.stepCommunities.body":
    "Groups you might like based on your interests.",
  "onboarding.stepCommunities.join": "Join",
  "onboarding.stepCommunities.joined": "Joined",
  "onboarding.stepCommunities.leave": "Leave community",
  "onboarding.stepCommunities.requested": "Requested",
  "onboarding.stepCommunities.continue": "Continue",
  "onboarding.stepCommunities.skip": "Skip for now — explore and join later",
  "onboarding.stepCommunities.back": "Back",
  "onboarding.stepCommunities.empty":
    "No suggestions right now — you can explore and join communities anytime.",

  "onboarding.stepDone.heading": "You're <em>part of it</em> now",
  "onboarding.stepDone.cta": "Go to my home",
  "onboarding.stepDone.notifications.title": "Stay in the loop",
  "onboarding.stepDone.notifications.desc":
    "Get notified about messages, invites, and gathering reminders on your phone. Change this anytime in Settings.",
  "onboarding.quickStart.browseDirectory.title": "Browse the member directory",
  "onboarding.quickStart.browseDirectory.desc":
    "Members across Lisbon and beyond",
  "onboarding.quickStart.gatherings.title": "See upcoming gatherings",
  "onboarding.quickStart.gatherings.desc":
    "Real-world events for the community",
  "onboarding.quickStart.magazine.title": "Read the community magazine",
  "onboarding.quickStart.magazine.desc": "Published the first of every month",
  "onboarding.quickStart.gettingStarted.title":
    "See your getting-started checklist",
  "onboarding.quickStart.gettingStarted.desc":
    "A few small milestones to help you settle in",

  // ── `tour.neighbourhood.elsewhere` is the only survivor of the removed
  //    Welcome tour (formerly /welcome-tour, a dead "faithful port" surface):
  //    listBusiness.data.ts's `hoodLabel()` still resolves the neighbourhood
  //    dropdown's catch-all option through this shared catalog string. ──
  "tour.neighbourhood.elsewhere": "Elsewhere in Lisbon",

  // ── Getting started — the first-steps checklist at /account/getting-started.
  //    Each step is auto-detected from real account data (see useGettingStarted). ──
  "gettingStarted.eyebrow": "New here",
  "gettingStarted.title": "Getting <em>started</em>",
  "gettingStarted.lede":
    "A few first moves to find your people and settle in. No rush — do them in any order, whenever you like.",
  "gettingStarted.progress": "{done} of {total} done",
  "gettingStarted.levelStrip.eyebrow": "Your level",
  "gettingStarted.levelStrip.progress": "{xp} of {xpMax} XP",
  "gettingStarted.levelStrip.hint": "Each step you finish earns XP toward your next level.",
  "gettingStarted.levelStrip.hintDone": "Keep exploring QueerPulse to earn more.",
  "gettingStarted.xpSources.eyebrow": "What's earned it so far",
  "gettingStarted.xpSources.amount": "+{xp} XP",
  "gettingStarted.xpSources.seeAll": "See full breakdown",
  "gettingStarted.xpSources.seeBadgesPage": "Go to Badges page",
  "gettingStarted.stepXp": "+{xp} XP",
  "gettingStarted.stepXpEarned": "+{xp} XP earned",
  "gettingStarted.success.badge": "You earned the First Steps badge.",
  "gettingStarted.meterAria": "{done} of {total} first steps done",
  "gettingStarted.checking": "Checking your progress…",
  "gettingStarted.doneLabel": "Done",
  "gettingStarted.steps.profile.title": "Fill in your profile",
  "gettingStarted.steps.profile.desc":
    "A photo and a few words help people recognise you and say hello.",
  "gettingStarted.steps.profile.done": "Your profile's looking like you.",
  "gettingStarted.steps.profile.cta": "Edit profile",
  "gettingStarted.steps.community.title": "Join a community",
  "gettingStarted.steps.community.desc":
    "Find the circles that fit — bookish, nightlife, activist — and drop in.",
  "gettingStarted.steps.community.done": "You're in — welcome to the circle.",
  "gettingStarted.steps.community.cta": "Find communities",
  "gettingStarted.steps.persona.title": "Create a persona",
  "gettingStarted.steps.persona.desc":
    "Give a side of yourself its own space — your DJ name, your art, your writing.",
  "gettingStarted.steps.persona.done": "Your persona has its own corner now.",
  "gettingStarted.steps.persona.cta": "Create a persona",
  "gettingStarted.steps.vouch.title": "Vouch for someone",
  "gettingStarted.steps.vouch.desc":
    "Vouch for someone you trust. It's how the network stays warm and real.",
  "gettingStarted.steps.vouch.done":
    "You've vouched — thank you for keeping it real.",
  "gettingStarted.steps.vouch.cta": "Browse members",
  "gettingStarted.steps.connect.title": "Connect with someone",
  "gettingStarted.steps.connect.desc":
    "Reach out to someone you'd like to know. Connecting opens up messaging.",
  "gettingStarted.steps.connect.done": "You've made your first connection.",
  "gettingStarted.steps.connect.cta": "Browse members",
  "gettingStarted.steps.post.title": "Share your first post",
  "gettingStarted.steps.post.desc":
    "Say hello in a community you've joined. No pressure — a sentence is plenty.",
  "gettingStarted.steps.post.done": "You've said your first hello.",
  "gettingStarted.steps.post.cta": "Open a community",
  "gettingStarted.allDone.title": "You're all",
  "gettingStarted.allDone.em": "set",
  "gettingStarted.allDone.body":
    "You've done the essentials. The rest of QueerPulse is yours to wander — take your time.",
  "gettingStarted.allDone.cta": "Explore QueerPulse",
  "gettingStarted.sideQuests.eyebrow": "Next up",
  "gettingStarted.sideQuests.title": "Side <em>quests</em>",
  "gettingStarted.sideQuests.lede":
    "Now that you're settled in, here's what's still there to discover: a few more things to try, each with a badge or perk waiting at the end.",
  "gettingStarted.sideQuests.cta": "Get started",
  "gettingStarted.sideQuests.showMore": "Show {count} more",
};

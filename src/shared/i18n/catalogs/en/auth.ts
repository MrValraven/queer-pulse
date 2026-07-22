import type { Catalog } from "../../types";

/**
 * Auth surfaces: sign-in, create-account, invite (send + landing chrome),
 * onboarding, the welcome tour, request-invite, magic-link, confirm-email,
 * and the shared 18+ attestation / under-18 block. Content that in live mode
 * arrives over the wire (a fictional inviter's vouch quote, a member's own
 * bio/role, a community's own name/description) is deliberately left in
 * English elsewhere in the feature — see docs/i18n/extraction-brief.md §1.
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

  // ── Create account ──
  "createAccount.eyebrow": "Almost there",
  "createAccount.title": "Create your <em>account</em>",
  "createAccount.vouchText":
    "<strong>{name}</strong> invited you to QueerPulse.",
  "createAccount.requiredLegend": "Fields marked <req>*</req> are required",
  "createAccount.legalNote":
    "You must be 18 or older to join (see our <eligibility>eligibility policy</eligibility>). By continuing, you agree to our <terms>Terms</terms> and <privacy>Privacy Policy</privacy>.",
  "createAccount.signinPrompt":
    "Already have an account? <signin>Sign in</signin>",
  "createAccount.submit": "Create account",
  "createAccount.section.account": "Account",
  "createAccount.section.about": "About you",
  "createAccount.section.visibility": "Visibility",
  "createAccount.field.firstName.label": "First name",
  "createAccount.field.firstName.placeholder": "Alex",
  "createAccount.field.lastName.label": "Last name",
  "createAccount.field.lastName.placeholder": "Morais",
  "createAccount.field.email.label": "Email",
  "createAccount.field.email.helper":
    "From your Google account — can't be changed here.",
  "createAccount.field.displayName.label": "Display name",
  "createAccount.field.displayName.helper":
    "How you'll appear across QueerPulse.",
  "createAccount.field.displayName.placeholder": "What should people call you?",
  "createAccount.field.pronouns.label": "Pronouns",
  "createAccount.field.pronouns.placeholder": "e.g. she/her",
  "createAccount.field.location.label": "Location",
  "createAccount.field.location.placeholder": "Lisbon",
  "createAccount.field.bio.label": "Bio",
  "createAccount.field.bio.placeholder": "A few words about you",
  "createAccount.error.firstRequired":
    "Your first name is missing — mind adding it?",
  "createAccount.error.lastRequired":
    "Your last name is missing — mind adding it?",
  "createAccount.error.inviteRedeemFailed":
    "We couldn't confirm your invite, but your account is ready — you're in.",
  "createAccount.visibility.open.label": "Open to connect",
  "createAccount.visibility.open.sub":
    "Anyone in the network can see your profile and say hello",
  "createAccount.visibility.network.label": "Network only",
  "createAccount.visibility.network.sub":
    "Reachable through mutual connections",
  "createAccount.visibility.private.label": "Keep it quiet for now",
  "createAccount.visibility.private.sub": "I'll reach out when I'm ready",

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
    "A quiet, vouched-for queer community in Lisbon — no ads, no algorithm. I think you'd belong here.",
  "invite.link.shareMessage":
    "{senderFirst} invited you to QueerPulse — a quiet, vouched-for queer community. Your personal invite: {url}",

  "invite.ready.headline": "Your invite is <em>ready</em>",
  "invite.ready.sub": "Share it however feels natural — it's good for one use.",
  "invite.ready.linkCopied": "Link copied",
  "invite.ready.copyFailed": "Couldn't copy — try selecting the link instead",
  "invite.ready.copyLinkAriaLabel": "Copy invite link",
  "invite.ready.shareThrough": "Share through",
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
  "invite.sentList.status.valid": "Pending",
  "invite.sentList.status.used": "Accepted",
  "invite.sentList.status.expired": "Expired",
  "invite.sentList.status.revoked": "Revoked",
  "invite.sentList.detail.joined": "Joined — welcome {name}",
  "invite.sentList.detail.sentExpires": "Sent {sent} · expires {expires}",
  "invite.sentList.detail.sentExpired": "Sent {sent} · expired {expires}",

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

  // ── The humane under-18 block ──
  "under18.title": "We'll be here <em>when you're ready</em>",
  "under18.body1":
    "QueerPulse is an 18+ community for now, so we can't set you up with an account just yet — and that's not a judgement on you. You belong in queer community; this particular room just isn't open to under-18s today. Come back when you turn 18 and there'll be a place for you.",
  "under18.body2":
    "In the meantime, there's plenty here that's for you right now:",
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
    "Anyone here you know <optional>(optional)</optional>",
  "requestInvite.field.mutual.helper":
    "Naming a mutual is the fastest route in — but it's not required.",
  "requestInvite.field.mutual.placeholder": "A member who can vouch for you",
  // Appended to the message so the reviewer sees the named mutual — there is no
  // separate field for it on POST /join-requests.
  "requestInvite.field.mutual.messagePrefix": "Someone who knows me here: {name}",
  "requestInvite.field.why.label": "Why QueerPulse",
  "requestInvite.field.why.placeholder":
    "What you're looking for, and what brings you here. A few honest sentences is plenty.",
  "requestInvite.field.why.error":
    "Tell us a little about what brings you here.",
  "requestInvite.agree":
    "I've read the <guidelines>community guidelines</guidelines> and I'm here in good faith.",
  "requestInvite.submit": "Send my request",
  "requestInvite.sending": "Sending your request…",
  "requestInvite.submitError": "Could not send your request — please try again",
  "requestInvite.under18BackLabel": "Back to the form",
  "requestInvite.sent.title": "You're on the <em>list.</em>",
  "requestInvite.sent.sub_withName":
    "Thanks, {name} — your request to join QueerPulse is in. Here's what happens from here.",
  "requestInvite.sent.sub_noName":
    "Thanks — your request to join QueerPulse is in. Here's what happens from here.",
  "requestInvite.sent.backHome": "← Back to home",
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
    "If someone already here can vouch for you, that's the surest way in. Naming a mutual helps.",
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
    "{firstName} is exactly the kind of person this community was built for — thoughtful, creative, and genuinely invested in making queer spaces better.",
  "onboarding.stepWelcome.body":
    "QueerPulse is a cared-for professional network rooted in Lisbon. You were invited because someone here knows your worth.",
  "onboarding.stepWelcome.cta": "Let's get started",

  "onboarding.stepPhoto.heading": "Put a face to the <em>name</em>",
  "onboarding.stepPhoto.body":
    "A photo helps members feel comfortable connecting with you. You can always add this later.",
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
  "onboarding.stepPhoto.back": "← Back",

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
  "onboarding.stepNorms.continue": "I agree, continue",
  "onboarding.stepNorms.back": "← Back",

  "onboarding.stepIntents.heading": "What brings you <em>here?</em>",
  "onboarding.stepIntents.hint": "Pick at least one — choose as many as fit.",
  "onboarding.stepIntents.continue": "Continue",
  "onboarding.stepIntents.back": "← Back",
  "onboarding.intent.community": "Community",
  "onboarding.intent.gatherings": "Gatherings & events",
  "onboarding.intent.professional": "Professional connections",
  "onboarding.intent.dating": "Dating",
  "onboarding.intent.resources": "Resources & support",
  "onboarding.intent.contributing": "Contributing",
  "onboarding.intent.housing": "Housing",
  "onboarding.intent.flatmates": "Finding flatmates",
  "onboarding.intent.activism": "Activism",
  "onboarding.intent.creative": "Creative collaboration",

  "onboarding.stepCommunities.heading": "Find your <em>communities</em>",
  "onboarding.stepCommunities.body":
    "Groups you might like based on your interests.",
  "onboarding.stepCommunities.join": "Join",
  "onboarding.stepCommunities.joined": "Joined",
  "onboarding.stepCommunities.continue": "Continue",
  "onboarding.stepCommunities.skip": "Skip for now — explore and join later",
  "onboarding.stepCommunities.back": "← Back",

  "onboarding.stepDone.heading": "You're <em>part of it</em> now",
  "onboarding.stepDone.cta": "Go to my home",
  "onboarding.quickStart.browseDirectory.title": "Browse the member directory",
  "onboarding.quickStart.browseDirectory.desc":
    "{count} members in Lisbon and beyond",
  "onboarding.quickStart.gatherings.title": "See upcoming gatherings",
  "onboarding.quickStart.gatherings.desc":
    "Real-world events for the community",
  "onboarding.quickStart.magazine.title": "Read the community magazine",
  "onboarding.quickStart.magazine.desc": "Published the first of every month",

  // ── Welcome tour (the separate 6-step guided tour at /welcome-tour) ──
  "tour.skipSetup": "Skip setup →",
  "tour.stepLabel": "Step {current} of {total}",
  "tour.allSet": "You're in!",
  "tour.nav.back": "← Back",
  "tour.nav.continue": "Continue →",

  "tour.welcome.eyebrow": "You're in",
  "tour.welcome.heading": "Welcome to <em>QueerPulse.</em>",
  "tour.welcome.body":
    "Somebody in the community thought you belonged here — and that's how everyone arrived. We're glad you made it.",
  "tour.welcome.q101Label": "Still finding the language?",
  "tour.welcome.q101Body":
    "If you're newly exploring your identity — not just new to Lisbon — <q101>Queer 101</q101> is a quiet place to start. No account needed to read it.",
  "tour.welcome.cta": "Let's set you up →",

  "tour.profile.eyebrow": "Your profile",
  "tour.profile.heading": "Tell us a little about <em>yourself.</em>",
  "tour.profile.body":
    "This is how the community will know you. You can change everything later.",
  "tour.profile.namePlaceholder": "Your name",
  "tour.profile.pronounsPlaceholder": "Pronouns (optional)",
  "tour.profile.rolePlaceholder": "What you do — your role or practice",
  "tour.profile.neighbourhoodDefault": "Your neighbourhood in Lisbon",
  "tour.profile.visibilityLabel": "How visible would you like to be?",

  "tour.visibility.open.title": "Open to connect",
  "tour.visibility.open.desc":
    "Anyone in the network can see your profile and say hello",
  "tour.visibility.network.title": "Network only",
  "tour.visibility.network.desc": "Reachable through mutual connections",
  "tour.visibility.private.title": "Keep it quiet for now",
  "tour.visibility.private.desc": "I'll reach out when I'm ready",

  "tour.interests.eyebrow": "Your world",
  "tour.interests.heading": "What matters <em>to you?</em>",
  "tour.interests.body":
    "We use this to suggest connections, gatherings, and communities. Select as many as you like.",
  "tour.interest.design": "Design",
  "tour.interest.tech": "Tech",
  "tour.interest.film": "Film",
  "tour.interest.music": "Music",
  "tour.interest.activism": "Activism",
  "tour.interest.wellbeing": "Wellbeing",
  "tour.interest.food": "Food",
  "tour.interest.sports": "Sports",
  "tour.interest.writing": "Writing",
  "tour.interest.craft": "Craft",
  "tour.interest.policy": "Policy",
  "tour.interest.community": "Community",

  "tour.communities.eyebrow": "Your spaces",
  "tour.communities.heading": "Which communities <em>call to you?</em>",
  "tour.communities.body":
    "Join now or explore later — you can always change this. Your choices are private.",

  "tour.connections.eyebrow": "First connections",
  "tour.connections.heading": "Three people worth <em>saying hello to.</em>",
  "tour.connections.body":
    "These are members who often welcome new arrivals. A quick message goes a long way.",
  "tour.connections.sayHello": "Say hello",
  "tour.connections.sent": "Sent",

  "tour.explore.eyebrow": "You're all set",
  "tour.explore.heading": "Welcome to the <em>community.</em>",
  "tour.explore.body":
    "You're officially in. Here's where to go first — there's no right answer, just what calls to you.",
  "tour.explore.cta": "Go to QueerPulse →",

  "tour.exploreCard.members.name": "Members",
  "tour.exploreCard.members.desc":
    "Browse and say hello to people in the network",
  "tour.exploreCard.gatherings.name": "Gatherings",
  "tour.exploreCard.gatherings.desc": "RSVP to something happening near you",
  "tour.exploreCard.communities.name": "Communities",
  "tour.exploreCard.communities.desc": "Find an ongoing group to join",
  "tour.exploreCard.culture.name": "Culture",
  "tour.exploreCard.culture.desc":
    "Book club, art showcase, commission board, radio",
  "tour.exploreCard.economy.name": "Economy",
  "tour.exploreCard.economy.desc":
    "Incubator, freelance tools, salary transparency",
  "tour.exploreCard.queer101.name": "Queer 101",
  "tour.exploreCard.queer101.desc":
    "Still exploring your identity? A quiet place to start",
  "tour.exploreCard.volunteer.name": "Volunteer",
  "tour.exploreCard.volunteer.desc":
    "Find a way to give back to the local community",
  "tour.exploreCard.arriving.name": "New to Lisbon?",
  "tour.exploreCard.arriving.desc":
    "A guide to settling into the queer scene here",
  "tour.exploreCard.sexualHealth.name": "Sexual health",
  "tour.exploreCard.sexualHealth.desc":
    "Testing, PrEP, HIV resources — queer-specific & direct",
  "tour.exploreCard.safeSpaces.name": "Safe spaces",
  "tour.exploreCard.safeSpaces.desc":
    "Community-verified venues — earned, not self-declared",
  "tour.exploreCard.sober.name": "Sober & social",
  "tour.exploreCard.sober.desc":
    "A full social life, without alcohol at the centre",

  "tour.neighbourhood.principeReal": "Príncipe Real",
  "tour.neighbourhood.mouraria": "Mouraria",
  "tour.neighbourhood.bairroAlto": "Bairro Alto",
  "tour.neighbourhood.caisDoSodre": "Cais do Sodré",
  "tour.neighbourhood.arroios": "Arroios",
  "tour.neighbourhood.alfama": "Alfama",
  "tour.neighbourhood.graca": "Graça",
  "tour.neighbourhood.marvila": "Marvila",
  "tour.neighbourhood.estrela": "Estrela",
  "tour.neighbourhood.intendente": "Intendente",
  "tour.neighbourhood.elsewhere": "Elsewhere in Lisbon",
  "tour.neighbourhood.newToLisbon": "New to Lisbon — still finding my feet",
};

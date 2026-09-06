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
  /** PRD-306. The way to `/auth/invite-code` from every page a person holding
   *  a bare code might land on first. */
  "common.haveAnInviteCode": "Have an invite code? Use it here",
  "common.notAMemberYet": "Not a member yet?",
  "common.optionalSuffix": "(optional)",

  // ── Sign in ──
  "signIn.title": "Welcome <em>back</em>",
  "signIn.subtitle": "Sign in to pick up where you left off.",
  "signIn.artCaption": "A queer network, <em>rooted in Lisbon.</em>",
  "signIn.connecting": "Connecting…",
  "signIn.googleCta": "Continue with Google",
  "signIn.notice.inviteRequired.title": "You'll need an invite",
  "signIn.notice.inviteRequired.body":
    "QueerPulse is invite-only. Ask a member you know, or request an invite and we'll take it from there.",
  "signIn.notice.accountSuppressed.title": "This account was deleted",
  "signIn.notice.accountSuppressed.body":
    "You asked us to erase this account, so we won't quietly re-create it. If you'd like to come back, ask a member for a fresh invite, or get in touch and we'll help.",
  "signIn.notice.ageAttestationRequired.title": "One box left to tick",
  "signIn.notice.ageAttestationRequired.body":
    "QueerPulse is 18+. Head back to your invite link and confirm you're 18 or older, then you're in.",
  "signIn.notice.inviteInvalid.title": "That invite isn't valid",
  "signIn.notice.inviteInvalid.body":
    "This invite link has expired or was already used. Ask your inviter for a fresh one, or request an invite yourself.",
  "signIn.notice.inviteEmailMismatch.title":
    "This invite was set for a different email",
  "signIn.notice.inviteEmailMismatch.body":
    "Someone set this invite aside for one specific address. Sign in with that email, or ask them for a new invite for the one you're using.",
  "signIn.notice.inviteInviterInactive.title":
    "The person who invited you has moved on",
  "signIn.notice.inviteInviterInactive.body":
    "Whoever sent this invite is no longer active on QueerPulse, so it can't bring you in. Ask another member you know for a fresh invite, or request one yourself.",
  "signIn.notice.accessDenied.title": "Sign-in was cancelled",
  "signIn.notice.accessDenied.body":
    "Looks like you cancelled the Google consent screen. No harm done. Try again whenever you're ready.",
  "signIn.notice.noEmail.title": "We couldn't get your email",
  "signIn.notice.noEmail.body":
    "Google didn't share an email address with us, so we can't sign you in. Check your Google account's sharing settings and try again.",
  "signIn.notice.emailUnverified.title": "Verify your Google email first",
  "signIn.notice.emailUnverified.body":
    "Your Google account's email isn't verified yet. Verify it with Google, then come back and try again.",
  // A NEW account was refused because the address is already on one (identity
  // is keyed on googleId, so this is a second Google identity for one address).
  // Retrying the same way can't work; the support link under the notice does.
  "signIn.notice.emailInUse.title": "That email already has an account",
  "signIn.notice.emailInUse.body":
    "This address is already on a QueerPulse account, so we can't open a second one for it. Sign in with the Google account you first joined with.",
  "signIn.notice.oauthFailed.title": "Something went sideways",
  "signIn.notice.oauthFailed.body":
    "Sign-in didn't complete on Google's side. Nothing was changed. Try again in a moment.",
  "signIn.notice.offline.title": "You're offline",
  "signIn.notice.offline.body":
    "We can't reach QueerPulse without a connection. Check your Wi-Fi or data and try again.",
  "signIn.notice.serverError.title": "Something went wrong on our end",
  "signIn.notice.serverError.body":
    "Our server hit a snag{status}. That one's on us. Try again shortly.",
  "signIn.notice.unreachable.title": "We can't reach QueerPulse",
  "signIn.notice.unreachable.body":
    "The server didn't respond. It might be waking up, so give it a moment and try again.",

  // Shown under a closed-door OAuth notice above (not the network-probe ones).
  // Covers members permanently locked out of their linked Google account, who
  // have no other recovery path here.
  "signIn.notice.support": "Still stuck? <a>Contact us</a>",

  // Registration is switched off platform-wide (or the platform is locked).
  // Not the visitor's fault and not retryable — the copy says so plainly and
  // does not invite them to try again in a loop.
  "signIn.notice.registrationDisabled.title": "New accounts are paused",
  "signIn.notice.registrationDisabled.body":
    "We’re not creating new accounts right now. If you already have one, you can still sign in.",

  // Pre-emptive states, rendered from GET /platform-status BEFORE submit so
  // nobody round-trips through Google only to be rejected at the callback.
  "signIn.closed.title": "New accounts are paused",
  "signIn.closed.body": "You can still sign in to an existing account below.",

  // ── The abstract "gathered hearth" illustration on the sign-in art tile ──
  "communityArt.ariaLabel":
    "Illustration of community members drifting toward a warm, welcoming centre",

  // ── Invite (send-invite dashboard + composer + link/email panels) ──
  "invite.eyebrow": "Invite someone in",
  "invite.title": "Bring someone <em>in</em>",
  "invite.sub":
    "Here's probably someone you know who would feel at home here. Invite them to join QueerPulse and vouch for them along the way.",
  "invite.quota.available_one": "{count} invite available this month",
  "invite.quota.available_other": "{count} invites available this month",
  "invite.quota.none": "No invites left this month",
  "invite.quota.resets_one": "Resets tomorrow",
  "invite.quota.resets_other": "Resets in {count} days",
  "invite.quota.resets_zero": "Resets today",

  "invite.compose.recipientEmail.label": "Who is this for",
  "invite.compose.recipientEmail.placeholder": "them@example.com",
  "invite.compose.recipientEmail.help":
    "Whoever redeems this invite joins with you on record as their voucher, and connected to you from day one. Fill in an address and only the person signing in with that Google account can redeem it, so a forwarded or screenshotted link gets nobody else in; leave it blank and anyone holding the link can use it.",
  "invite.compose.recipientEmail.noSend":
    "Filling this in sends nothing to that address. You still pass the link on yourself.",
  "invite.compose.recipientEmail.invalid":
    "That doesn't look like an email address. Check it, or leave the field empty.",
  "invite.compose.vouch.label": "Your vouch",
  "invite.compose.vouch.placeholder":
    "Why should they join? A sentence or two goes a long way.",
  "invite.compose.note.label": "Personal note",
  "invite.compose.note.placeholder": "Add a personal note (optional)",

  "invite.link.previewLabel": "Preview",
  "invite.link.generateCta": "Generate invite link",
  "invite.link.generating": "Generating…",
  "invite.link.error.generic":
    "Something went wrong generating your link. Try again.",
  "invite.link.error.quota":
    "You've used every invite in this month's allowance. It fills up again when the month resets.",
  "invite.link.formNote": "This link works once, for one person.",
  "invite.link.defaultVouch":
    "Someone in the community thinks you should be here. QueerPulse: a vouched-for queer network in Lisbon, built on trust.",
  "invite.link.shareMessage":
    "{senderFirst} invited you to QueerPulse, a quiet, vouched-for queer community. Your personal invite: {url}",

  "invite.ready.headline": "Your invite is <em>ready</em>",
  "invite.ready.sub": "Share it however feels natural. It's good for one use.",
  "invite.ready.pinnedTo":
    "Set aside for {email}. Only a Google account with that address can redeem it.",
  "invite.ready.pinnedSend":
    "Nothing was sent to them. Pass the link on yourself, however feels natural.",
  "invite.ready.linkCopied": "Link copied",
  "invite.ready.copyFailed": "Couldn't copy. Try selecting the link instead",
  "invite.ready.shareThrough": "Share through",
  "invite.ready.qrHint": "Or let them scan it",
  "invite.ready.qrLabel":
    "QR code for this invite link. Scan it to open the invitation",
  "invite.ready.oneTimeLink": "One-time link",
  "invite.ready.expiresIn7Days": "Expires in 7 days",
  "invite.ready.expiresOn": "Expires {date}",

  "invite.sentList.label": "Invites you've sent",
  "invite.sentList.filter.all": "All",
  "invite.sentList.status.valid": "Pending",
  "invite.sentList.status.used": "Accepted",
  "invite.sentList.status.expired": "Expired",
  "invite.sentList.status.revoked": "Revoked",
  "invite.sentList.detail.joined": "Joined. Welcome {name}",
  "invite.sentList.detail.sentExpires": "Sent {sent} · expires {expires}",
  "invite.sentList.detail.sentExpired": "Sent {sent} · expired {expires}",
  "invite.sentList.detail.sent": "Sent {sent}",
  "invite.sentList.anyoneWithLink": "Anyone with the link",
  "invite.sentList.pinnedNote": "Only this address can redeem it",
  "invite.sentList.copyLinkCta": "Copy link",
  "invite.sentList.copyLinkAriaLabel": "Copy link for the invite to {invite}",
  "invite.sentList.linkCopied": "Invite link copied",
  "invite.sentList.copyFailed":
    "Couldn't copy the link. Try selecting it instead.",
  "invite.sentList.revokeCta": "Revoke",
  "invite.sentList.revoking": "Revoking…",
  "invite.sentList.revokedToast": "Invite revoked. The link no longer works.",
  "invite.sentList.revokeConfirm.title": "Revoke this invite?",
  "invite.sentList.revokeConfirm.body":
    "Code {code} stops working the moment you revoke it, and there's no way to bring it back. If you've already passed it to someone, they won't be able to join with it.",
  "invite.sentList.revokeConfirm.confirm": "Revoke it",
  "invite.sentList.revokeConfirm.cancel": "Keep it live",
  "invite.sentList.revokeError":
    "We couldn't revoke that invite just now. It's still live, so give it another try in a moment.",
  "invite.sentList.resendCta": "Send again",
  "invite.sentList.resending": "Sending…",
  "invite.sentList.resentToast":
    "Invite sent again: same link, fresh for another week.",
  "invite.sentList.resendError.notYours":
    "This isn't one of your invites to send again.",
  "invite.sentList.resendError.notFound":
    "We couldn't find that invite. It may have already been cleared.",
  "invite.sentList.resendError.notResendable":
    "Only an expired invite can be sent again. This one's already been used, withdrawn, or is still live.",
  "invite.sentList.resendError.generic":
    "Couldn't send that one again just now. Give it another try in a moment.",

  // ── Invite unfurl preview card (mirrors the static Open Graph tags) ──
  "sharePreview.heroTitle.line1": "Walk into a room",
  "sharePreview.heroTitle.line2": "<em>where you already belong</em>",
  "sharePreview.heroExplainer": "A queer network. Rooted in Lisbon.",
  "sharePreview.heroSub_one": "Invite-only · {count} member",
  "sharePreview.heroSub_other": "Invite-only · {count} members",
  "sharePreview.title": "{senderName} invited you to QueerPulse",

  // ── 18+ self-attestation (shared by onboarding + request-invite) ──
  "ageAttestation.confirmLabel": "I confirm I'm 18 or older.",
  "ageAttestation.helper":
    "QueerPulse is an adults-only community. <eligibility>Here's why</eligibility>. No ID needed; we trust you. <under18>Not 18 yet?</under18>",
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
    "The community side of QueerPulse is 18+ for now, so we can't set you up with an account just yet. That says nothing about you. Most of what we make is open to everyone, no login needed. You belong in queer community, and there's a lot of it waiting for you right here.",
  "under18.body2":
    "Have a read of the library and everything else that's yours right now:",
  "under18.link.library": "The library: free to browse, no account needed",
  "under18.link.queer101": "Queer 101: the basics, no gatekeeping",
  "under18.link.comingOut": "Coming out, at your own pace",
  "under18.link.resources": "Community resources & support",
  "under18.link.eligibility": "Why we're 18+ (our Terms)",
  "under18.backDefault": "Back",
  "under18.link.contact": "Talk to us if something here looks wrong",
  // Shown when the person telling us they're under 18 already has a live
  // session (the onboarding wizard), where "go back" would just let them
  // re-attest. Signing out is the only way on from there.
  "under18.signedIn.body":
    "You're signed in right now, so we'll close that session here. Come back when you turn 18 and someone will gladly invite you in.",
  "under18.signOut": "Sign out",

  // ── Re-agreeing after the Terms or Community Guidelines change (ID-14) ──
  // Shown in a blocking sheet when a member's stored revision has fallen
  // behind. Dismissal is deliberately impossible, so the copy has to earn the
  // interruption: say what moved, offer the documents, and keep it short.
  "policyReacceptance.eyebrow": "Before you carry on",
  "policyReacceptance.title": "We've updated <em>the rules we share</em>",
  "policyReacceptance.lede":
    "Some of what you agreed to when you joined has changed. We'd rather ask than assume, so have a read and tell us you're on board.",
  "policyReacceptance.documents.terms": "Terms of Service",
  "policyReacceptance.documents.guidelines": "Community Guidelines",
  "policyReacceptance.versionChanged":
    "You agreed to version {previous}. Version {current} is now in effect.",
  "policyReacceptance.versionUnrecorded":
    "We have no agreement on record for you. Version {current} is now in effect.",
  "policyReacceptance.read": "Read it",
  "policyReacceptance.agree": "I've read it and I agree",
  "policyReacceptance.agreeing": "Saving…",
  "policyReacceptance.error":
    "We couldn't record that just now. Check your connection and try again.",
  "policyReacceptance.signOut": "Sign out instead",

  // ── Confirm email (six-digit code) ──

  // ── Magic link sign-in ──

  // ── Invite-code entry (/auth/invite-code) ──
  // PRD-306. A code with no link around it used to be a dead end. The only
  // doors in were the whole invite URL or Google sign-in, so a person holding
  // a perfectly good code had to apply again, spend one of their three
  // requests an hour, and wait in the review queue for an invite that already
  // existed. This page takes the code and hands off to the invite landing
  // page, which owns every answer about it: valid, expired, used, revoked.
  "inviteCode.eyebrow": "Have a code?",
  "inviteCode.title": "Type your <em>invite code.</em>",
  "inviteCode.sub":
    "Codes get read out loud and passed on without the link that carried them. Put yours in below and we'll take you straight to your invite.",
  "inviteCode.field.label": "Invite code",
  "inviteCode.field.placeholder": "QP-XXXX-XXXX",
  "inviteCode.field.helper":
    "Codes look like QP-XXXX-XXXX. Lower case and stray spaces are fine, we'll tidy those up.",
  "inviteCode.error.missing": "Type the code you were given.",
  "inviteCode.error.unusable":
    "That doesn't look like an invite code. Check it and try again.",
  "inviteCode.submit": "Open my invite",
  "inviteCode.requestInsteadLink": "No code? Ask for an invite",
  "inviteCode.alreadyMemberLink": "Already a member? Sign in",

  // ── Request an invite (prospective-member ask-to-join form + confirmation) ──
  "requestInvite.eyebrow": "Request an invite",
  "requestInvite.title": "Ask to come <em>in.</em>",
  "requestInvite.sub":
    "QueerPulse grows through trust. The surest way in is a member who'll vouch for you, so if you know someone here, ask them. If you don't, tell us a little about you and we'll take it from there.",
  "requestInvite.alreadyMember": "Already a member? Sign in",
  "requestInvite.checkStatusLink": "Already asked? Check on your request",
  "requestInvite.field.name.label": "Your name",
  "requestInvite.field.name.placeholder": "Alex",
  "requestInvite.field.name.error": "Tell us what to call you.",
  "requestInvite.field.city.label": "City",
  "requestInvite.field.city.placeholder": "Lisbon",
  "requestInvite.field.email.label": "Email",
  "requestInvite.field.email.placeholder": "you@example.com",
  "requestInvite.field.email.error":
    "That email doesn't look right. Mind checking it?",
  "requestInvite.field.email.errorRequired":
    "We need an email so we can write back.",
  "requestInvite.field.mutual.label":
    "A member's email <optional>(optional)</optional>",
  "requestInvite.field.mutual.helper":
    "The email of a member who can vouch for you. It's how we match them, and the fastest route in.",
  "requestInvite.field.mutual.placeholder": "member@example.com",
  "requestInvite.field.mutual.error":
    "Enter a valid email, or leave this blank.",
  // Appended to the message so the reviewer sees who to match against — there is
  // no separate field for it on POST /join-requests.
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
  "requestInvite.submitError": "Could not send your request. Please try again",
  // 429: the public form throttles at 3 requests/hour per IP. An immediate
  // retry can't succeed, so this sets the expectation plainly rather than
  // inviting one.
  "requestInvite.rateLimitedError":
    "You've reached the limit for now. Please wait a while and try again.",
  "requestInvite.under18BackLabel": "Back to the form",
  "requestInvite.sent.title": "You're on the <em>list.</em>",
  "requestInvite.sent.sub_withName":
    "Thanks, {name}. Your request to join QueerPulse is in. Keep the code below somewhere safe, it's how you check back on it.",
  "requestInvite.sent.sub_noName":
    "Thanks. Your request to join QueerPulse is in. Keep the code below somewhere safe, it's how you check back on it.",
  "requestInvite.sent.backHome": "Back to home",
  // The 409 case: an open request already exists for this email. Nothing went
  // wrong, so this reads as a confirmation, never as a failure.
  "requestInvite.already.title": "We already <em>have it.</em>",
  "requestInvite.already.sub_withName":
    "You've asked us before, {name}. Your request is still with us and still being read, so there's no need to send another.",
  "requestInvite.already.sub_noName":
    "You've asked us before. Your request is still with us and still being read, so there's no need to send another.",
  "requestInvite.whatNext.readsIt.title": "A real person reads it",
  "requestInvite.whatNext.readsIt.body":
    "A member of the community looks at every request, by hand. That's why it can take a few days.",
  "requestInvite.whatNext.connection.title": "We look for a connection",
  "requestInvite.whatNext.connection.body":
    "If someone already here can vouch for you, that's the surest way in. Sharing their email helps us match them.",
  // Replaces the old `hearBack` step, which promised a message no mail service
  // exists to send and then told anyone without an inside contact that silence
  // meant giving up. The mechanism is real now: they hold a code, and the
  // answer waits for them on their own status page.
  "requestInvite.whatNext.checkBack.title": "You check back with your code",
  "requestInvite.whatNext.checkBack.body":
    "Nothing gets emailed, so your reference code is how you find out. Open your status page whenever you like, and if it's a yes, your invite link is waiting there.",

  // ── The reference code, handed over on the confirmation screen ──
  // The backend keeps only a hash of this token and nothing ever re-sends it,
  // so this block is the whole delivery mechanism. Calm, and plain about why
  // it matters: frightening someone who has just asked to be let in would be
  // both unkind and counterproductive.
  "requestInvite.reference.title": "Your reference code",
  "requestInvite.reference.fieldLabel": "Reference code",
  "requestInvite.reference.copy": "Copy",
  "requestInvite.reference.copied": "Copied",
  "requestInvite.reference.copiedToast": "Reference code copied.",
  "requestInvite.reference.copyErrorToast":
    "We couldn't copy it. Select the code and copy it by hand.",
  "requestInvite.reference.body":
    "This code is how you check back on your request. Save it somewhere you'll find it again: nothing gets emailed, and we can't issue the code a second time.",
  "requestInvite.reference.checkCta": "Check on my request",
  // The 409 branch: an open request already exists, so no new row and no new
  // token. Never show an empty code slot; show the two ways back in.
  // There is deliberately no "type your email and we'll look it up" here: with
  // no email service, that form would have to answer the person typing, which
  // means telling any stranger whether a given address has applied.
  "requestInvite.reference.backTitle": "Getting back to your request",
  "requestInvite.reference.noCode":
    "Your first request already has a code, from the day you sent it. There's no new one here, because there's no new request.",
  "requestInvite.reference.enterCodeCta": "Check on my request with that code",
  "requestInvite.reference.signInBody":
    "Lost the code? Sign in with the Google account for the address you applied with. Proving the address is yours is what lets us take you back to your own request.",
  "requestInvite.reference.signInCta": "Continue with Google",

  // Pre-emptive states, rendered from GET /platform-status BEFORE submit so
  // nobody fills in the whole form only to be rejected on submit.
  "requestInvite.closed.title": "Invite requests are paused",
  "requestInvite.closed.body":
    "We’re not taking new invite requests at the moment. Please check back soon.",
  "requestInvite.closedError":
    "Invite requests were paused while you were filling this in. Please try again later.",

  // ── Join-request status (/auth/request-invite/status) ──
  // The applicant's own view of their request. Public: whoever needs this page
  // has no account by definition. Six states, one calm frame. Never write copy
  // implying a waiting list exists — the backend deliberately reports a
  // waitlisted request as "under review", because being told you are on a list
  // is a decision we have not actually made.
  "joinRequestStatus.eyebrow": "Your request",
  "joinRequestStatus.backHome": "Back to home",
  "joinRequestStatus.contactCta": "Get in touch",
  "joinRequestStatus.loading": "Looking up your request…",

  // The recovery path: they saved the code and lost the link.
  "joinRequestStatus.form.title": "Check on your <em>request.</em>",
  "joinRequestStatus.form.lead":
    "Enter the reference code you were given when you sent your request, and we'll tell you where it stands.",
  "joinRequestStatus.form.label": "Reference code",
  "joinRequestStatus.form.placeholder": "Paste your code here",
  "joinRequestStatus.form.helper":
    "It's the long code from the screen you saw right after sending your request.",
  "joinRequestStatus.form.error": "Enter the reference code you were given.",
  "joinRequestStatus.form.submit": "Check my request",

  // Still with a reviewer. No promised date, because we do not have one.
  "joinRequestStatus.underReview.eyebrow": "Still with us",
  "joinRequestStatus.underReview.title": "Your request is <em>being read.</em>",
  "joinRequestStatus.underReview.lead":
    "You sent it {ago}, on {date}. A member of the community reads every request by hand, and that can take a few days.",
  "joinRequestStatus.underReview.leadNoDate":
    "Your request is with a member of the community. They read every request by hand, and that can take a few days.",
  "joinRequestStatus.underReview.leadDateOnly":
    "You sent it on {date}. A member of the community reads every request by hand, and that can take a few days.",
  "joinRequestStatus.underReview.note":
    "There's nothing for you to do while you wait. Come back to this page whenever you like, your code keeps working.",
  "joinRequestStatus.underReview.foot":
    "Something changed, or you'd like to add to your request? <a>Get in touch</a>",
  // PRD-304. The deadline the queue holds itself to, told to the one person
  // waiting on it. The review queue has always stamped every request with a
  // three-day answer date and coloured a request that ran past it; the
  // applicant was told none of that, so day four felt exactly like day one and
  // someone writing in had nothing to point at. Nothing else will ever carry
  // this: no email is sent, and an applicant has no account to be notified in.
  "joinRequestStatus.underReview.dueBy": "We aim to answer you by {date}.",
  "joinRequestStatus.underReview.overdue":
    "We said we'd answer by {date}, and we're past it. We're sorry.",
  "joinRequestStatus.underReview.overdueFoot":
    "Waiting longer than we promised? <a>Get in touch</a> and we'll find out where your request got to.",

  // Approved, invite still live. The actual win.
  "joinRequestStatus.approved.eyebrow": "You're in",
  "joinRequestStatus.approved.title": "You're <em>welcome here.</em>",
  "joinRequestStatus.approved.lead":
    "Your request was approved on {date}. Your invite is below. Open it to make your account.",
  "joinRequestStatus.approved.leadNoDate":
    "Your request was approved. Your invite is below. Open it to make your account.",
  "joinRequestStatus.approved.linkLabel": "Your invite link",
  "joinRequestStatus.approved.copy": "Copy",
  "joinRequestStatus.approved.copied": "Copied",
  "joinRequestStatus.approved.copiedToast": "Invite link copied.",
  "joinRequestStatus.approved.copyErrorToast":
    "We couldn't copy it. Select the link and copy it by hand.",
  // PRD-02. The invite's deadline, on the screen that hands the invite over.
  // Nothing will chase the applicant about it: no email is ever sent, and they
  // have no account to be notified in. The clock behind these lines starts the
  // first time they open this page, so the date is always one they have been
  // shown before it matters.
  "joinRequestStatus.approved.deadline": "This link works until {date}.",
  "joinRequestStatus.approved.deadlineDays_one":
    "This link works for {count} more day, until {date}.",
  "joinRequestStatus.approved.deadlineDays_other":
    "This link works for {count} more days, until {date}.",
  "joinRequestStatus.approved.deadlineToday":
    "This link stops working today. Open it now.",
  "joinRequestStatus.approved.cta": "Open my invite",
  "joinRequestStatus.approved.note":
    "This invite brings one person in, and that person is you. Keep the link to yourself.",
  "joinRequestStatus.approved.foot": "Trouble opening it? <a>Get in touch</a>",

  // Approved, but the invite behind it is gone. THREE different situations,
  // which used to share one dead-end screen. Only the lapsed one is the
  // applicant's to undo, so only that one is offered a button.
  "joinRequestStatus.approvedSpent.signInCta": "I already made my account",

  // Lapsed. The recoverable one: the button mints a fresh window on the same
  // invite, so an approval can no longer expire into nothing.
  "joinRequestStatus.approvedSpent.expired.eyebrow": "Approved",
  "joinRequestStatus.approvedSpent.expired.title":
    "Your link <em>needs refreshing.</em>",
  "joinRequestStatus.approvedSpent.expired.lead":
    "You were approved on {date}, and the yes still stands. The link just sat unused long enough to lapse, which we can fix right here.",
  "joinRequestStatus.approvedSpent.expired.leadNoDate":
    "You were approved, and the yes still stands. The link just sat unused long enough to lapse, which we can fix right here.",
  "joinRequestStatus.approvedSpent.expired.cta": "Give me a fresh link",
  "joinRequestStatus.approvedSpent.expired.refreshing": "Getting your link",
  "joinRequestStatus.approvedSpent.expired.foot":
    "The yes still stands. Only the link lapsed.",

  // Already redeemed. Someone made an account with this invite, so there is
  // nothing to reissue and offering it would be a lie.
  "joinRequestStatus.approvedSpent.used.eyebrow": "Approved",
  "joinRequestStatus.approvedSpent.used.title":
    "This invite is <em>already spent.</em>",
  "joinRequestStatus.approvedSpent.used.lead":
    "You were approved on {date}, and an account has since been made with this invite. If that was you, sign in. If it wasn't, tell us straight away.",
  "joinRequestStatus.approvedSpent.used.leadNoDate":
    "You were approved, and an account has since been made with this invite. If that was you, sign in. If it wasn't, tell us straight away.",
  "joinRequestStatus.approvedSpent.used.foot":
    "One invite brings one person in, and this one has been used.",

  // Withdrawn by a moderator. Not the applicant's to undo, and no button
  // pretends otherwise. A person to talk to instead.
  "joinRequestStatus.approvedSpent.revoked.eyebrow": "Approved",
  "joinRequestStatus.approvedSpent.revoked.title":
    "This invite <em>is no longer open.</em>",
  "joinRequestStatus.approvedSpent.revoked.lead":
    "You were approved on {date}, but this invite has since been withdrawn. We can't turn it back on from here, and we'd rather you heard why from a person.",
  "joinRequestStatus.approvedSpent.revoked.leadNoDate":
    "You were approved, but this invite has since been withdrawn. We can't turn it back on from here, and we'd rather you heard why from a person.",
  "joinRequestStatus.approvedSpent.revoked.foot":
    "Write to us and someone will read it.",

  // Why a refresh was turned down. One sentence each, never a raw code.
  "joinRequestStatus.approvedSpent.refusal.INVITE_ALREADY_USED":
    "An account has already been made with this invite, so there's nothing to refresh.",
  "joinRequestStatus.approvedSpent.refusal.INVITE_REVOKED":
    "This invite has been withdrawn, so we can't refresh it from here.",
  "joinRequestStatus.approvedSpent.refusal.INVITE_REFRESH_LIMIT":
    "This link has been refreshed as many times as it can be. Get in touch and a person will sort it out.",
  "joinRequestStatus.approvedSpent.refusal.INVITE_REFRESH_UNAVAILABLE":
    "There's no invite on this request to refresh. Get in touch and a person will sort it out.",
  "joinRequestStatus.approvedSpent.refusal.unknown":
    "That didn't go through. Try once more, and get in touch if it still won't.",

  // Declined. The state that needs the most care: say what happened, keep the
  // limitation on our side of the table wherever that is honest, and always
  // leave a person to talk to.
  "joinRequestStatus.declined.eyebrow": "We've read it",
  "joinRequestStatus.declined.title": "Not this <em>time.</em>",
  "joinRequestStatus.declined.lead":
    "A member read your request on {date}, and we couldn't bring you in this time.",
  "joinRequestStatus.declined.leadNoDate":
    "A member read your request, and we couldn't bring you in this time.",
  // `underage` gets its own heading and lead, and renders the platform's
  // existing supportive 18+ notice in place of a reason: a young person must
  // meet an open door with a date on it, never a verdict on who they are.
  "joinRequestStatus.declined.titleUnderage":
    "We'll be here <em>when you're 18.</em>",
  "joinRequestStatus.declined.leadUnderage":
    "A member read your request on {date}. QueerPulse is 18+ for now, so we can't bring you in yet.",
  "joinRequestStatus.declined.leadUnderageNoDate":
    "A member read your request. QueerPulse is 18+ for now, so we can't bring you in yet.",
  "joinRequestStatus.declined.reasonTitle": "What we can tell you",
  "joinRequestStatus.declined.contactCta": "Get in touch",

  // Applicant-facing wording for the same closed reason keys the mod queue
  // picks from (`joinRequestDeclineReason.ts`). The admin labels are a
  // reviewer's shorthand and would land as an accusation here, so these say
  // what happened, whose limitation it was, and what to do next.
  "joinRequestStatus.declineReason.spam_pattern":
    "Your request arrived in a shape our reviewers mostly see from automated senders, so it didn't get the read it deserved. If you wrote it yourself, get in touch and we'll look at it again.",
  "joinRequestStatus.declineReason.underage":
    "QueerPulse is 18+ for now. That's about the law and about keeping adult spaces adult, and it says nothing about you.",
  "joinRequestStatus.declineReason.implausible":
    "The reviewer couldn't place enough of what you wrote to feel sure, and a short form gives them very little to go on. If someone already here knows you, ask them to vouch for you, and you're welcome to write to us in the meantime.",
  "joinRequestStatus.declineReason.safety_concern":
    "Something in the request raised a safety question for the people already here, so we held back. If you'd like to talk it through, write to us and a person will read it.",
  "joinRequestStatus.declineReason.other":
    "The reviewer didn't leave a reason we can show you here. If you'd like to understand it, write to us and a person will reply.",

  // One answer for both the 400 (malformed code) and the 404 (no such
  // request), so probing codes reveals nothing about which ones exist.
  "joinRequestStatus.notFound.eyebrow": "No match",
  "joinRequestStatus.notFound.title": "We couldn't <em>find that.</em>",
  "joinRequestStatus.notFound.lead":
    "We couldn't find a request for that code. Check it for a missing character or a stray space and try again. If it still doesn't work, get in touch and a person will help.",
  "joinRequestStatus.notFound.retryCta": "Try another code",

  // The server did not answer. Distinct from "no match": nothing is known
  // either way, and retrying is worth doing.
  "joinRequestStatus.unavailable.eyebrow": "No answer",
  "joinRequestStatus.unavailable.title":
    "We couldn't <em>reach QueerPulse.</em>",
  "joinRequestStatus.unavailable.lead":
    "The server didn't answer, so we can't tell you anything right now. Your request is untouched. Give it a moment and try again.",
  "joinRequestStatus.unavailable.retryCta": "Try again",
  "joinRequestStatus.unavailable.foot": "Still nothing? <a>Get in touch</a>",

  // ── Onboarding (the 7-step post-signup flow at /onboarding) ──
  "onboarding.stepLabel": "Step {current} of {total}",
  "onboarding.welcomeToQueerPulse": "Welcome to QueerPulse",
  "onboarding.stepIntro.heading": "Let's get you <em>settled in</em>",
  "onboarding.stepIntro.body":
    "A few quick steps to set up your profile and start finding your people. It'll only take a couple of minutes, and you can always change things later.",
  "onboarding.stepIntro.cta": "Let's begin",
  "onboarding.preview.makeItYours.title": "Make it yours",
  "onboarding.preview.makeItYours.desc":
    "Add a photo and a few details so people can get to know you.",
  "onboarding.preview.setIntentions.title": "What brings you here?",
  "onboarding.preview.setIntentions.desc":
    "Tell us a little about what you're looking for and what you'd like to be part of.",
  "onboarding.preview.findCommunities.title": "Find your communities",
  "onboarding.preview.findCommunities.desc":
    "Choose the communities that feel relevant to you and discover where you belong.",

  "onboarding.stepWelcome.eyebrowSuffix": "You're in",
  "onboarding.stepWelcome.heading": "Welcome, <em>{firstName}</em>",
  "onboarding.stepWelcome.memberSince": "Member since {since}",
  "onboarding.stepWelcome.invitedYou": "Invited you",
  "onboarding.stepWelcome.memberSinceRole": "Member since {since} · {role}",
  "onboarding.stepWelcome.vouchFallback":
    "{firstName} is thoughtful, creative, and exactly who we hoped would end up here.",
  "onboarding.stepWelcome.body1":
    "You're here because someone thought you should be.",
  "onboarding.stepWelcome.body2":
    "QueerPulse is a community for LGBTQ+ people and the people building, creating, and contributing around them in Lisbon.",
  "onboarding.stepWelcome.body3":
    "Someone who knows you invited you in. Now it's your turn to make the space your own.",
  "onboarding.stepWelcome.cta": "Let's get started",
  "onboarding.stepWelcome.back": "Back",

  "onboarding.stepPhoto.heading": "Put a face to the <em>name</em>",
  "onboarding.stepPhoto.body":
    "A photo and a few quick details help members feel comfortable connecting with you. You can always add or change these later.",
  "onboarding.stepPhoto.captionPreview":
    "Looking good. Tap the photo to change it",
  "onboarding.stepPhoto.captionGoogle":
    "From your Google account. Tap the photo to change it",
  "onboarding.stepPhoto.captionUpload": "Tap to upload a photo",
  "onboarding.stepPhoto.uploadAriaLabel": "Upload a profile photo",
  "onboarding.stepPhoto.photoAlt": "Your profile photo",
  "onboarding.stepPhoto.placeholder": "your photo",
  "onboarding.stepPhoto.continue": "Continue",
  "onboarding.stepPhoto.skip": "Skip for now, you can add this later",
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
    "Use the name and pronouns each member shares. If you're unsure, ask: that's always welcome here.",
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
  "onboarding.stepNorms.control.title": "You're always in control",
  "onboarding.stepNorms.control.desc":
    "You can block, mute, or report any member, any time. <a>See how blocking and muting work</a>.",

  "onboarding.stepIntents.heading": "What brings you <em>here?</em>",
  "onboarding.stepIntents.hint":
    "Pick at least one, and choose as many as fit.",
  "onboarding.stepIntents.continue": "Continue",
  "onboarding.stepIntents.skip": "Skip for now, you can share this later",
  "onboarding.stepIntents.back": "Back",
  "onboarding.stepIntents.saveError":
    "We couldn't save that just now. Please try again.",
  "onboarding.stepIntents.loadError.title":
    "We couldn't load <em>your answers</em>",
  "onboarding.stepIntents.loadError.body":
    "The intentions you saved before, and their visibility setting, didn't load. Try again, or skip this step and set them later in Settings.",
  "onboarding.stepIntents.visibility.title": "Show this on my profile",
  "onboarding.stepIntents.visibility.descPublic":
    "Other members will see what you're looking for on your profile.",
  "onboarding.stepIntents.visibility.descPrivate":
    "Kept to yourself. You can turn this on any time in Settings.",
  // ── Step 6: what do you do (StepWork) ───────────────────────────────────────
  // Writes the profile's own field/profession, which is what the member
  // directory filters on, so this step is what makes a new member findable by
  // their work. Optional: skipping writes nothing.
  "onboarding.stepWork.heading": "What do <em>you do?</em>",
  "onboarding.stepWork.hint":
    "Pick your field, then the roles that fit. This is public, and it's how people find you in the member directory.",
  "onboarding.stepWork.continue": "Continue",
  "onboarding.stepWork.skip": "Skip for now, you can add this later",
  "onboarding.stepWork.back": "Back",
  "onboarding.stepWork.saveError":
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
  "onboarding.stepCommunities.skip": "Skip for now, explore and join later",
  "onboarding.stepCommunities.back": "Back",
  "onboarding.stepCommunities.empty":
    "No suggestions right now. You can explore and join communities anytime.",

  "onboarding.stepDone.heading": "You're <em>part of it</em> now",
  "onboarding.stepDone.cta": "Go to my home",
  "onboarding.stepDone.notifications.title": "Stay in the loop",
  "onboarding.stepDone.notifications.desc":
    "Get notified about messages, invites, and gathering reminders on your phone. Change this anytime in Settings.",
  "onboarding.stepDone.stampFailed.title":
    "We couldn't save that you're finished",
  "onboarding.stepDone.stampFailed.desc":
    "You're in either way. Without this we might walk you through the same setup again next time.",
  "onboarding.stepDone.stampFailed.retry": "Try again",
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
    "A few first moves to find your people and settle in. No rush: do them in any order, whenever you like.",
  "gettingStarted.ledeProgress":
    "Nice progress so far: you've already done {done} of {total}. A few more moves to find your people and settle in.",
  "gettingStarted.progress": "{done} of {total} done",
  "gettingStarted.levelStrip.eyebrow": "Your level",
  "gettingStarted.levelStrip.progress": "{xp} of {xpMax} XP",
  "gettingStarted.levelStrip.hint":
    "Each step you finish earns XP toward your next level.",
  "gettingStarted.levelStrip.hintDone":
    "Keep exploring QueerPulse to earn more.",
  "gettingStarted.xpSources.eyebrow": "What's earned it so far",
  "gettingStarted.xpSources.amount": "+{xp} XP",
  "gettingStarted.xpSources.seeAll": "See full breakdown",
  "gettingStarted.xpSources.seeBadgesPage": "Go to Badges page",
  "gettingStarted.stepXp": "+{xp} XP",
  "gettingStarted.stepXpEarned": "+{xp} XP earned",
  // The badge NAME is interpolated from `badgeDisplayMetaFor("first-steps")`
  // rather than written here, so it cannot drift from the badge catalogue.
  // It used to be hardcoded in both languages, which meant a Portuguese
  // member read an English badge name at the end of onboarding. DES-143.
  "gettingStarted.success.badge": "You earned the {badge} badge.",
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
    "Find the circles that fit, whether bookish, nightlife or activist, and drop in.",
  "gettingStarted.steps.community.done": "You're in. Welcome to the circle.",
  "gettingStarted.steps.community.cta": "Find communities",
  "gettingStarted.steps.persona.title": "Create a persona",
  "gettingStarted.steps.persona.desc":
    "Give a side of yourself its own space: your DJ name, your art, your writing.",
  "gettingStarted.steps.persona.done": "Your persona has its own corner now.",
  "gettingStarted.steps.persona.cta": "Create a persona",
  "gettingStarted.steps.vouch.title": "Vouch for someone",
  "gettingStarted.steps.vouch.desc":
    "Vouch for someone you trust. It's how the network stays warm and real.",
  "gettingStarted.steps.vouch.done":
    "You've vouched. Thank you for keeping it real.",
  "gettingStarted.steps.vouch.cta": "Find someone to vouch for",
  "gettingStarted.steps.connect.title": "Connect with someone",
  "gettingStarted.steps.connect.desc":
    "Reach out to someone you'd like to know. Connecting opens up messaging.",
  "gettingStarted.steps.connect.done": "You've made your first connection.",
  "gettingStarted.steps.connect.cta": "Browse members",
  "gettingStarted.steps.post.title": "Share your first post",
  "gettingStarted.steps.post.desc":
    "Say hello in a community you've joined. No pressure: a sentence is plenty.",
  "gettingStarted.steps.post.done": "You've said your first hello.",
  "gettingStarted.steps.post.cta": "Open a community",
  "gettingStarted.allDone.title": "You're all",
  "gettingStarted.allDone.em": "set",
  "gettingStarted.allDone.body":
    "You've done the essentials. The rest of QueerPulse is yours to wander, so take your time.",
  "gettingStarted.allDone.cta": "Explore QueerPulse",
  "gettingStarted.sideQuests.eyebrow": "Next up",
  "gettingStarted.sideQuests.title": "Side <em>quests</em>",
  "gettingStarted.sideQuests.lede":
    "Now that you're settled in, here's what's still there to discover: a few more things to try, each with a badge or perk waiting at the end.",
  "gettingStarted.sideQuests.cta": "Get started",
  "gettingStarted.sideQuests.showMore": "Show {count} more",
};

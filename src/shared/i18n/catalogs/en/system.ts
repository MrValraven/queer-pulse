import type { Catalog } from "../../types";

/**
 * System — error/maintenance/status chrome and account-state screens
 * (`src/features/system/`), plus the two generic route fallbacks in
 * `src/pages/` (`system:notFound.*`, `system:placeholder.*` — that folder has
 * no namespace of its own, per the extraction brief).
 *
 * Scope: almost entirely platform-authored chrome — these are utility/error
 * pages, not content surfaces. Exceptions kept in English/untranslated and
 * NOT put through t(): the invite `note` a member writes to their invitee
 * (user-authored, fetched from the API in live mode), people's names, emails,
 * invite/case/incident IDs, and the invite `expiryLabel` string (owned by
 * `features/auth/api/useInvite.ts`, outside this namespace). See
 * `docs/i18n/extraction-brief.md` §1.
 */
export const system: Catalog = {
  // ── src/pages/NotFoundPage.tsx ────────────────────────────────────────────
  "notFound.eyebrow": "Page not found",
  "notFound.title.line1": "You've arrived",
  "notFound.title.line2": "<em>somewhere else.</em>",
  "notFound.sub":
    "The page you're looking for doesn't exist, has moved, or requires you to be logged in. It happens. Here are some places to go instead.",
  "notFound.homeCta": "Go to homepage",
  "notFound.backCta": "← Go back",
  "notFound.linksTitle": "Or try one of these",
  "notFound.links.magazine.label": "Magazine",
  "notFound.links.magazine.sub": "June 2026 issue",
  "notFound.links.gatherings.label": "Gatherings",
  "notFound.links.gatherings.sub": "Upcoming events",
  "notFound.links.readingGroups.label": "Reading groups",
  "notFound.links.readingGroups.sub": "8 groups open",
  "notFound.links.forum.label": "Forum",
  "notFound.links.forum.sub": "Community discussion",
  "notFound.links.help.label": "Help & FAQ",
  "notFound.links.help.sub": "Get answers",
  "notFound.links.contact.label": "Contact us",
  "notFound.links.contact.sub": "hello@queerpulse.pt",
  "notFound.searchPlaceholder": "Search the platform…",
  "notFound.searchCta": "Search",

  // ── src/pages/PlaceholderPage.tsx ─────────────────────────────────────────
  // `{title}` is derived from the URL slug (titleFromPath) — an unmapped route
  // name, not authored copy, so it stays English regardless of locale.
  "placeholder.eyebrow": "Coming soon",
  "placeholder.title": "{title} is <em>on the way.</em>",
  "placeholder.sub":
    "This part of QueerPulse is still being built. The homepage is live — explore members, gatherings, and the community there in the meantime.",
  "placeholder.backCta": "Back to home",

  // ── AccountBannedPage.tsx ─────────────────────────────────────────────────
  "accountBanned.kicker": "Account removed · final action",
  "accountBanned.heading": "Your account has been <em>closed.</em>",
  "accountBanned.lead1":
    "After a full moderation review and one round of appeal, your account has been permanently removed from QueerPulse. <em>This was not done lightly.</em>",
  "accountBanned.lead2":
    "Your active Sustainer membership has been <b>refunded pro-rated</b> to the card on file.",
  "accountBanned.violation.title": "Reason · referenced from your case file",
  "accountBanned.violation.body":
    "<b>§02·06</b> — Weaponising platform access against members. The pattern of behaviour was documented across <b>8 separate incidents</b> over four months and reviewed by two independent moderators.",
  "accountBanned.whatNow.row1.title": "You can appeal this decision once",
  "accountBanned.whatNow.row1.body":
    "Open within 14 days of removal. Reviewed by the Assembly's standing appeals panel — different humans than your case moderators. Response within 21 days.",
  "accountBanned.whatNow.row2.title":
    "Your data is removed from the platform within 30 days",
  "accountBanned.whatNow.row2.body":
    "Per our <a>privacy policy</a>. Posts you authored are anonymised, not deleted, unless you specifically request deletion below.",
  "accountBanned.whatNow.row3.title":
    "Public records of this action are not kept",
  "accountBanned.whatNow.row3.body":
    "The case file exists internally for 36 months. Your connections were notified you left, without reason. No member will know you were removed unless you tell them.",
  "accountBanned.whatNow.row4.title": "Crisis support remains available",
  "accountBanned.whatNow.row4.body":
    "The <wellbeingLink>resource library</wellbeingLink> is open to everyone, member or not.",
  "accountBanned.actions.appealCta": "File the appeal",
  "accountBanned.actions.eraseCta": "Request full data erasure",
  "accountBanned.foot":
    "If you believe this was the result of coordinated false reports, please include the names you suspect in the appeal — we investigate this carefully. <a>Re-read the Code of Conduct →</a>",

  // ── AccountLockedPage.tsx ─────────────────────────────────────────────────
  "accountLocked.kicker": "Account locked · temporary",
  "accountLocked.heading": "Your account is <em>on pause.</em>",
  "accountLocked.lead":
    "We spotted unusual sign-in activity on your account and locked it as a precaution. You're not in trouble — we'd rather over-react than risk it.",
  "accountLocked.reason1":
    "<b>5 failed sign-in attempts</b> in the last 12 minutes, from two devices.",
  "accountLocked.reason2":
    "<b>New location:</b> attempt from <b>Madrid, Spain</b> — you usually sign in from Lisbon.",
  "accountLocked.reason3":
    "<b>Lock will lift automatically</b> in 23 minutes — or use one of the options below to unlock now.",
  "accountLocked.whatNow.contact.title": "Contact the team",
  "accountLocked.whatNow.contact.desc":
    "If none of the above work, write to us and we'll verify you by hand.",
  "accountLocked.foot.incident": "Incident <idTag>{id}</idTag> · {time}",
  "accountLocked.foot.whyLink": "Why does this happen?",

  // ── AccountSuspendedPage.tsx ──────────────────────────────────────────────
  "accountSuspended.kicker": "Account paused · moderation action",
  "accountSuspended.heading":
    "Your account is <em>suspended</em> for {days} days.",
  "accountSuspended.lead":
    "A moderator reviewed a report and decided your recent message in <b>{channel}</b> crossed §02·02 of the Code of Conduct (<em>repeated misgendering</em>). This is a <b>temporary suspension at rung 3</b> of the moderation ladder.",
  "accountSuspended.details.action": "Action",
  "accountSuspended.details.actionValue": "{days}-day suspension",
  "accountSuspended.details.started": "Started",
  "accountSuspended.details.liftsAutomatically": "Lifts automatically",
  "accountSuspended.details.reviewedBy": "Reviewed by",
  "accountSuspended.details.reviewedByValue": "{name} + one anonymous mod",
  "accountSuspended.details.caseId": "Case ID",
  "accountSuspended.whatStays.title": "What still works · during suspension",
  "accountSuspended.whatStays.item1": "Reading public content & the magazine",
  "accountSuspended.whatStays.item2":
    "Attending gatherings you'd already RSVP'd to",
  "accountSuspended.whatStays.item3":
    "Crisis chat · always available, no exceptions",
  "accountSuspended.whatStays.item4":
    "Filing an appeal · response within 5 working days",
  "accountSuspended.actions.appealCta": "File an appeal",
  "accountSuspended.actions.ladderCta": "Read the ladder",
  "accountSuspended.actions.messageModCta": "Message the mod team",
  "accountSuspended.foot":
    "{percent}% of appeals are overturned. We publish the number annually. <a>See 2025 moderation stats →</a>",

  // ── GeoRestrictedPage.tsx ─────────────────────────────────────────────────
  "geoRestricted.eyebrow": "Region restricted",
  "geoRestricted.h1": "QueerPulse isn't <em>fully available</em> here yet.",
  "geoRestricted.lead":
    "It looks like you're connecting from a country where some QueerPulse features are restricted — most often because we don't have moderators in your timezone, or because we're working through local legal review. <em>Crisis support and safety resources are still open to you.</em>",
  "geoRestricted.why.title": "Why this happens",
  "geoRestricted.why.body":
    "We open access to a new region only when we have <em>at least one moderator in-country</em> and have reviewed the local legal framework for queer expression. It is intentionally slow. We don't want to advertise queer community to a place where members would be put at risk by joining.",
  "geoRestricted.can.title": "What you can still do · right now",
  "geoRestricted.can.readArticles.label":
    "Read all public articles & the magazine",
  "geoRestricted.can.readArticles.detail":
    "The full editorial archive is open · <a>browse →</a>",
  "geoRestricted.can.resources.label": "Browse vetted international resources",
  "geoRestricted.can.resources.detail":
    "Hotlines, queer-friendly legal aid, and emergency contacts in 14 other countries · <a>resource library →</a>",
  "geoRestricted.can.askUs.label": "Ask us to open access here",
  "geoRestricted.can.askUs.detail":
    "Tell us where you are (no need for your name) and what would help · <a>write to the team →</a>",
  "geoRestricted.detect":
    "Detected: <b>Portugal · Lisbon</b> · this is a demo of the region-restricted view.",
  "geoRestricted.goHome": "Go home →",

  // ── InterestsEditorModal.tsx + interestsEditor.data.ts ───────────────────
  "interestsEditor.closeAria": "Close",
  "interestsEditor.success.title": "Interests <em>updated.</em>",
  "interestsEditor.success.sub_one":
    "We've noted your {count} interest. A vouching member with overlapping interests will pick up your request — keeping these current can speed up the match.",
  "interestsEditor.success.sub_other":
    "We've noted your {count} interests. A vouching member with overlapping interests will pick up your request — keeping these current can speed up the match.",
  "interestsEditor.success.doneCta": "Done",
  "interestsEditor.eyebrow": "Invite request · interests",
  "interestsEditor.title": "Update your <em>interests.</em>",
  "interestsEditor.desc":
    "We match your request to a vouching member with overlapping interests. Pick the ones that fit — the more honest, the better the match.",
  "interestsEditor.count_one": "{count} selected",
  "interestsEditor.count_other": "{count} selected",
  "interestsEditor.pickAtLeastTwo": "pick at least 2",
  "interestsEditor.saveCta": "Save interests",
  "interestsEditor.cancelCta": "Cancel",
  "interestsEditor.options.filmCinema": "Film & cinema",
  "interestsEditor.options.readingGroups": "Reading groups",
  "interestsEditor.options.mutualAid": "Mutual aid",
  "interestsEditor.options.activism": "Activism",
  "interestsEditor.options.nightlife": "Nightlife",
  "interestsEditor.options.transHealthcare": "Trans healthcare",
  "interestsEditor.options.migrationVisas": "Migration & visas",
  "interestsEditor.options.housing": "Housing",
  "interestsEditor.options.mentorship": "Mentorship",
  "interestsEditor.options.musicStudio": "Music & studio",
  "interestsEditor.options.soberSpaces": "Sober spaces",
  "interestsEditor.options.parentingFamily": "Parenting & family",
  "interestsEditor.options.sports": "Sports",
  "interestsEditor.options.artMaking": "Art & making",
  "interestsEditor.options.techWork": "Tech & work",
  "interestsEditor.options.wellbeing": "Wellbeing",

  // ── InviteExpiredPage.tsx (invite state: expired / used / revoked / not found) ─
  "inviteState.expired.eyebrow": "Invite expired",
  "inviteState.expired.heading": "This link has <em>timed out.</em>",
  "inviteState.expired.lead":
    "Invites stay live for a while, and yours was sent a bit too long ago — so the slot we held for you has rotated back into the pool. The quickest way in is a fresh nudge from the person who vouched for you.",
  "inviteState.used.eyebrow": "Invite already used",
  "inviteState.used.heading": "This invite has <em>already been opened.</em>",
  "inviteState.used.lead":
    "Someone has already joined with this link — most likely you, on another device. If that was you, just sign in. If it wasn't, let the team know and we'll take a look.",
  "inviteState.revoked.eyebrow": "Invite withdrawn",
  "inviteState.revoked.heading": "This invite was <em>called back.</em>",
  "inviteState.revoked.lead":
    "The person who sent this invite, or a community steward, withdrew it before it was used. No harm done — you can ask for a new one whenever you're ready.",
  "inviteState.notFound.eyebrow": "Invite not found",
  "inviteState.notFound.heading": "We couldn't <em>place this link.</em>",
  "inviteState.notFound.lead":
    "This invite link doesn't match anything on our side. It may have been mistyped or cut short when it was shared. Ask for a fresh one and we'll get you in.",
  "inviteState.details.expiredOn": "Expired",
  "inviteState.details.vouchedBy": "Vouched by",
  "inviteState.actions.resend": "Ask {name} to re-send →",
  "inviteState.actions.requestNew": "Request a fresh invite",
  "inviteState.actions.signIn": "Sign in",
  "inviteState.actions.contact": "Talk to the team",
  "inviteState.foot.alreadyMember": "Already a member? <a>Sign in</a>",
  "inviteState.foot.needHelp": "Need help? <a>Ask the team</a>",

  // ── InviteLandingPage.tsx / InviteLandingViews.tsx / inviteLanding.data.ts ─
  "inviteLanding.loader.verifying": "Verifying your invite code…",
  "inviteLanding.loader.unsealing": "Unsealing {name}'s invitation…",
  "inviteLanding.loader.preparing": "Preparing your welcome…",
  "inviteLanding.what.private.strong": "Private by design.",
  "inviteLanding.what.private.rest":
    "Invite-only. 247 members. Not trying to grow for growth's sake.",
  "inviteLanding.what.noAds.strong": "No ads. No algorithm.",
  "inviteLanding.what.noAds.rest":
    "A platform that works for you, not for advertisers.",
  "inviteLanding.what.community.strong": "Real community.",
  "inviteLanding.what.community.rest":
    "Forum, events, a monthly magazine, and a mental health fund.",
  "inviteLanding.sealed.eyebrow": "You've been personally invited",
  "inviteLanding.sealed.title": "<em>{name}</em> invited you.",
  "inviteLanding.sealed.sub_one":
    "Invite-only · {count} member. This link was created for you and can only be opened once.",
  "inviteLanding.sealed.sub_other":
    "Invite-only · {count} members. This link was created for you and can only be opened once.",
  "inviteLanding.sealed.openCta": "Open invitation",
  "inviteLanding.opening.title": "An invitation from <em>{name}.</em>",
  "inviteLanding.card.inviterNoteWithSince":
    "Member since {since} · invited you",
  "inviteLanding.card.inviterNoteNoSince": "invited you",
  "inviteLanding.card.heading": "You belong <em>here.</em>",
  "inviteLanding.card.headerNote":
    "This invitation was created for you personally — it's yours, and yours alone.",
  "inviteLanding.card.noteFrom": "A note from {name}",
  "inviteLanding.card.tokenLabel": "Your invite code",
  "inviteLanding.card.validFor_one": "Valid for {count} day",
  "inviteLanding.card.validFor_other": "Valid for {count} days",
  "inviteLanding.card.expires": "Invite expires {date}",
  "inviteLanding.card.googleCta": "Register with Google",
  "inviteLanding.card.under18BackLabel": "Back to the invitation",
  "inviteLanding.card.consent":
    "By continuing you agree to our <termsLink>terms of use</termsLink> and <privacyLink>privacy policy</privacyLink>.",
  "inviteLanding.card.alreadyMember": "Already have an account? <a>Sign in</a>",
  "inviteLanding.card.notExpecting":
    "Not expecting this? <a>Privacy policy</a>",

  // ── MaintenancePage.tsx ───────────────────────────────────────────────────
  "maintenance.eyebrow": "Scheduled maintenance",
  "maintenance.heading": "Be right <em>back.</em>",
  "maintenance.lead":
    "We're shipping the <b>2.5 release</b> — better moderation tools, an upgraded crisis chat, and faster image uploads. Should be back in about <em>20 minutes</em>.",
  "maintenance.info.startedLabel": "Started",
  "maintenance.info.startedValue": "14:00 <em>WET</em>",
  "maintenance.info.backByLabel": "Back by",
  "maintenance.info.backByValue": "<em>~14:20</em> WET",
  "maintenance.affected.title": "What's down · what isn't",
  "maintenance.affected.web": "Web platform · everything except…",
  "maintenance.affected.mobile": "Mobile app · same deployment",
  "maintenance.affected.email": "Email notifications · queued, sent after",
  "maintenance.actions.statusCta": "Live status →",
  "maintenance.meta.line1":
    "Follow along on <a>status.queerpulse.app</a> · we post a public retrospective every time.",
  "maintenance.meta.line2":
    "Built by humans in Lisbon, who'd rather we ship slowly than break crisis support.",

  // ── OfflinePage.tsx ───────────────────────────────────────────────────────
  "offline.eyebrow": "No connection · cached version",
  "offline.h1": "You're <em>offline.</em>",
  "offline.lead":
    "No signal, or our servers can't be reached. <b>Don't worry</b> — your gathering RSVPs, your saved safe-spaces map, and your QR ticket are still here on this device.",
  "offline.cachedTitle": "Available offline · cached on your device",
  "offline.cached.ticket.label": "Your QR ticket — Open clinic night",
  "offline.cached.ticket.sub": "{date} · Café Beirão · cached 3h ago",
  "offline.cached.map.label": "Safe-spaces map · Lisbon",
  "offline.cached.map.sub": "42 venues · updated {when}",
  "offline.status": "Listening for signal",
  "offline.retryCta": "Try again",
  "offline.retryingCta": "Still offline",

  // ── PendingReviewPage.tsx ─────────────────────────────────────────────────
  "pendingReview.kicker": "Invite request · in queue",
  "pendingReview.heading": "You're <em>{position}th</em> in line.",
  "pendingReview.lead":
    "We open membership in cohorts. Your request to <b>{email}</b> is in the queue and a vouching member will review it within <b>~ 3 weeks</b>.",
  "pendingReview.position.title": "Your position",
  "pendingReview.position.body":
    "Out of {total} in queue · we admit <b>about {perMonth} / month</b> · ETA for you: <b>{eta}</b>",
  "pendingReview.position.etaValue": "late Jun / early Jul 2026",
  "pendingReview.timeline.step1.title": "Request received · {date}",
  "pendingReview.timeline.step1.desc":
    "You signed up · we logged your interest",
  "pendingReview.timeline.step2.title": "Awaiting vouching member",
  "pendingReview.timeline.step2.desc":
    "A current member is matching your interests · this takes 2–3 weeks",
  "pendingReview.timeline.step3.title": "Brief check-in call · 15 min",
  "pendingReview.timeline.step3.desc":
    "Light, friendly · just so we know who you are",
  "pendingReview.timeline.step4.title":
    "Invitation sent · activates within 14 days",
  "pendingReview.timeline.step4.desc":
    "You'll get an email with a single-use link",
  "pendingReview.actions.magazineCta": "Read the magazine →",
  "pendingReview.actions.vouchCta": "Ask a member to vouch",
  "pendingReview.actions.updateInterestsCta": "Update my interests",
  "pendingReview.foot.knowMember":
    "Already know a member who can vouch? <a>Send them a one-click vouch link</a> — bumps you ahead in the queue.",
  "pendingReview.foot.withdraw": "Want to withdraw? <a>Write to the team</a>.",

  // ── PwaPromptPage.tsx ─────────────────────────────────────────────────────
  "pwaPrompt.kicker": "Add to home screen · no app store needed",
  "pwaPrompt.heading": "Keep <em>QueerPulse</em> a tap away.",
  "pwaPrompt.lead":
    "Install the web app on your phone in 30 seconds. <em>Same as a regular app</em> — but no app-store account, no tracking, no review. Just a shortcut that opens crisis chat, your ticket, and the safe-spaces map in one tap.",
  "pwaPrompt.features.push.label": "Push notifications",
  "pwaPrompt.features.push.detail":
    "· RSVPs, replies, mentions · granular & quiet",
  "pwaPrompt.features.offline.label": "Works offline",
  "pwaPrompt.features.offline.detail":
    "· cached map, crisis chat, your QR ticket",
  "pwaPrompt.features.size.label": "~ 6 MB on your phone",
  "pwaPrompt.features.size.detail":
    "· no storage bloat · no background scanning",
  "pwaPrompt.tabs.ios": "iPhone",
  "pwaPrompt.tabs.android": "Android",
  "pwaPrompt.tabs.desktop": "Desktop",
  "pwaPrompt.instructions.ios.title": "iPhone · Safari · 3 taps",
  "pwaPrompt.instructions.ios.step1":
    "Tap the <b>Share</b> icon at the bottom of Safari",
  "pwaPrompt.instructions.ios.step2":
    "Scroll & tap <b>Add to Home Screen</b> <em>· near the bottom</em>",
  "pwaPrompt.instructions.ios.step3": "Tap <b>Add</b> in the top-right. Done.",
  "pwaPrompt.instructions.android.title": "Android · Chrome & Firefox · 2 taps",
  "pwaPrompt.instructions.android.step1":
    "Tap the <b>three-dot menu</b> top-right",
  "pwaPrompt.instructions.android.step2":
    "Choose <b>Install app</b> or <b>Add to home screen</b>",
  "pwaPrompt.instructions.android.step3":
    "Confirm · QueerPulse will appear with your other apps. <em>Works the same.</em>",
  "pwaPrompt.instructions.desktop.title": "Desktop · Chrome & Edge",
  "pwaPrompt.instructions.desktop.step1":
    "Look for the <b>install icon</b> in the address bar (right side)",
  "pwaPrompt.instructions.desktop.step2":
    "Click it, then <b>Install</b> in the popup",
  "pwaPrompt.instructions.desktop.step3":
    "Opens in its own window · pin to taskbar / Dock",
  "pwaPrompt.installCta": "Install now",
  "pwaPrompt.laterCta": "Maybe later",
  "pwaPrompt.actionsFoot":
    "Snoozing this stops us asking on this device for <b>30 days</b>.",
  "pwaPrompt.toast.installHint":
    "Look for the install prompt · usually top-right",
  "pwaPrompt.toast.snoozed": "Won't ask again for 30 days",

  // ── ServerErrorPage.tsx ───────────────────────────────────────────────────
  "serverError.countdown.label": "Estimated back online in",
  "serverError.demoModeAria": "Demo mode",
  "serverError.tabs.error": "500 Error",
  "serverError.tabs.maintenance": "Maintenance",
  "serverError.heading.error.line1": "Something went",
  "serverError.heading.error.line2": "<em>wrong on our end.</em>",
  "serverError.heading.maintenance.line1": "Planned maintenance.",
  "serverError.heading.maintenance.line2": "<em>Back soon.</em>",
  "serverError.sub.error":
    "This is our fault, not yours. We've been automatically notified and we're looking at it.",
  "serverError.sub.maintenance":
    "We're upgrading the platform. Shouldn't be long. We appreciate your patience.",
  "serverError.status.maintenance":
    "<strong>Planned downtime.</strong> Follow <a>status.queerpulse.pt</a> for updates.",
  "serverError.status.error":
    "<strong>Our team has been alerted.</strong> Check <a>status.queerpulse.pt</a> for live updates.",
  "serverError.actions.retryCta": "Try again",
  "serverError.actions.homeCta": "Go to homepage",
  "serverError.actions.statusCta": "Check platform status",
  "serverError.footer.contact": "If this keeps happening, <a>contact us</a>.",

  // ── StatusPage.tsx / StatusComponents.tsx / status.data.ts ───────────────
  "status.hero.allOperational": "All systems operational",
  "status.hero.title": "Platform <em>status</em>",
  "status.hero.sub": "Updated just now · Refreshes every 60 s",
  "status.hero.subLive": "Public uptime monitoring is on the way.",
  "status.live.title": "Live status reporting is coming soon",
  "status.live.description":
    "We're setting up public uptime monitoring, service health and incident history. Check back soon.",
  "status.services.sectionEye": "Services",
  "status.serviceStatus.operational": "Operational",
  "status.serviceStatus.degraded": "Degraded",
  "status.serviceStatus.outage": "Outage",
  "status.services.authentication.name": "Authentication",
  "status.services.authentication.desc": "Sign-in & invite system",
  "status.services.messages.name": "Messages",
  "status.services.messages.desc": "Direct & group messaging",
  "status.services.forum.name": "Forum",
  "status.services.forum.desc": "Community discussion boards",
  "status.services.eventsCalendar.name": "Events & Calendar",
  "status.services.eventsCalendar.desc": "Event discovery & RSVPs",
  "status.services.magazine.name": "Magazine",
  "status.services.magazine.desc": "Monthly publication & archive",
  "status.services.search.name": "Search",
  "status.services.search.desc": "Member & content search",
  "status.services.notifications.name": "Notifications",
  "status.services.notifications.desc": "In-app & email notifications",
  "status.services.fileStorage.name": "File storage",
  "status.services.fileStorage.desc": "Profile photos & attachments",
  "status.uptime.sectionEye": "90-day uptime",
  "status.uptime.pct": "{pct}% uptime",
  "status.uptime.tooltip.operational": "Operational — {date}",
  "status.uptime.tooltip.partial": "Partial outage — {date}",
  "status.uptime.tooltip.outage": "Outage — {date}",
  "status.uptime.axis.ninetyDaysAgo": "90 days ago",
  "status.uptime.axis.sixtyDaysAgo": "60 days ago",
  "status.uptime.axis.thirtyDaysAgo": "30 days ago",
  "status.uptime.axis.today": "Today",
  "status.incidents.sectionEye": "Incident history",
  "status.incidents.resolvedTag": "Resolved",
  "status.incidents.monitoringTag": "Monitoring",
  "status.incidents.messageLatency.title": "Message delivery latency",
  "status.incidents.messageLatency.text":
    "Some members experienced delays of 5–15 minutes in message delivery due to a queue backlog following a database migration. No messages were lost.",
  "status.incidents.searchRebuild.title": "Search index rebuild",
  "status.incidents.searchRebuild.text":
    "Full-text search returned stale results for approximately 3 hours while the index was rebuilt after a schema change. Browse-based discovery was unaffected.",
  "status.incidents.emailDelay.title": "Email notification delays",
  "status.incidents.emailDelay.text":
    "Notification emails were delayed by up to 45 minutes for a 2-hour window. All queued emails were delivered after the issue was resolved.",
  "status.incidents.dbUpgrade.title":
    "Scheduled maintenance — database upgrade",
  "status.incidents.dbUpgrade.text":
    "2-hour maintenance window for PostgreSQL major version upgrade. The platform was in read-only mode during this period.",
  "status.subscribe.title": "Get notified during incidents",
  "status.subscribe.body":
    "One email when something breaks, one when it's fixed. Nothing else.",
  "status.subscribe.placeholder": "your@email.com",
  "status.subscribe.cta": "Subscribe",
  "status.subscribe.toast": "You'll be notified during incidents.",
  "status.outro.line1": "A queer network.",
  "status.outro.line2": "<em>Rooted in Lisbon.</em>",
  "status.outro.sub": "Invite-only. Community-owned. Built to last.",
  "status.outro.cta": "Request an invite",

  // ── VerificationNeededPage.tsx / VerificationNeededSections.tsx ──────────
  "verificationNeeded.heading": "Quick check · <em>is this still you?</em>",
  "verificationNeeded.lead":
    "For your next step we need to confirm it's still you on this device. <b>This is one of two actions</b> we re-auth for: cancelling membership, or removing your account.",
  "verificationNeeded.actionCard":
    "You're about to <b>cancel your Sustainer membership</b>",
  "verificationNeeded.foot": "This re-auth expires in <b>{time}</b>.",
  "verificationNeeded.magicLink.intro":
    "We'll email a one-time confirmation link to <b>{email}</b>. Open it on this device to confirm it's you.",
  "verificationNeeded.magicLink.sendingCta": "Sending link…",
  "verificationNeeded.magicLink.sendCta": "Email me a confirmation link",
  "verificationNeeded.magicLink.sentTitle": "Link on its way",
  "verificationNeeded.magicLink.sentCopy":
    "Tap the link we sent to <b>{email}</b>, then come back here.",
  "verificationNeeded.magicLink.verifyingCta": "Verifying…",
  "verificationNeeded.magicLink.confirmCta": "I've opened the link",
  "verificationNeeded.magicLink.resendCountdown": "Resend in {seconds}s",
  "verificationNeeded.magicLink.resendCta": "Resend link",
  "verificationNeeded.success.title": "It's you — <em>verified.</em>",
  "verificationNeeded.success.sub":
    "Re-authentication confirmed. Taking you on to cancel your membership…",
  "verificationNeeded.success.continueCta": "Continue now",
  "verificationNeeded.expired.title": "This check <em>timed out.</em>",
  "verificationNeeded.expired.sub":
    "For your security, re-authentication only stays open for a few minutes. Start again to continue.",
  "verificationNeeded.expired.restartCta": "Start over",

  // ── Platform lockdown screen (member-facing kill-switch maintenance state) ─
  // DEVIATION from task-2-brief.md: the brief specifies "maintenance.eyebrow"
  // for this block, but that key already exists above (line ~239) for
  // MaintenancePage.tsx's scheduled-maintenance kicker ("Scheduled
  // maintenance"). A duplicate key in the same object literal is a hard `tsc`
  // error (TS1117: "An object literal cannot have multiple properties with
  // the same name"), verified locally before writing this file. Renamed to
  // "maintenance.brandEyebrow" to disambiguate; all other keys below are
  // verbatim from the brief.
  "maintenance.brandEyebrow": "QueerPulse",
  "maintenance.title": "We’ll be right back",
  // Fallback only — the admin's own message is shown when they set one.
  "maintenance.body":
    "QueerPulse is temporarily unavailable. Please check back soon.",
  "maintenance.stillSignedIn":
    "You’re still signed in. Everything will be here when we’re back.",
  "maintenance.retry": "Try again",
};

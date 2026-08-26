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
  "notFound.backCta": "Go back",
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
  "notFound.links.contact.sub": "hello@queerpulse.com",
  "notFound.searchPlaceholder": "Search the platform…",
  "notFound.searchCta": "Search",

  // ── src/pages/PlaceholderPage.tsx ─────────────────────────────────────────
  // `{title}` is derived from the URL slug (titleFromPath) — an unmapped route
  // name, not authored copy, so it stays English regardless of locale.
  "placeholder.title": "{title} is <em>on the way.</em>",

  // ── AccountBannedPage.tsx ─────────────────────────────────────────────────
  "accountBanned.kicker": "Account removed · final action",
  "accountBanned.heading": "Your account has been <em>closed.</em>",
  "accountBanned.lead1":
    "After a full moderation review and one round of appeal, your account has been permanently removed from QueerPulse. <em>This was not done lightly.</em>",
  "accountBanned.lead2":
    "Your active Sustainer membership has been <b>refunded pro-rated</b> to the card on file.",
  "accountBanned.violation.title": "Reason · referenced from your case file",
  "accountBanned.violation.body":
    "<b>§02·06</b>: Weaponising platform access against members. The pattern of behaviour was documented across <b>8 separate incidents</b> over four months and reviewed by two independent moderators.",
  "accountBanned.whatNow.row1.title": "You can appeal this decision once",
  "accountBanned.whatNow.row1.body":
    "Open within 14 days of removal. Reviewed by the Assembly's standing appeals panel, different humans than your case moderators. Response within 21 days.",
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
    "If you believe this was the result of coordinated false reports, please include the names you suspect in the appeal. We investigate this carefully. <a>Re-read the Code of Conduct</a>",

  // ── AccountLockedPage.tsx ─────────────────────────────────────────────────
  "accountLocked.kicker": "Account locked · temporary",
  "accountLocked.heading": "Your account is <em>on pause.</em>",
  "accountLocked.lead":
    "We spotted unusual sign-in activity on your account and locked it as a precaution. You're not in trouble. We'd rather over-react than risk it.",
  "accountLocked.reason1":
    "<b>5 failed sign-in attempts</b> in the last 12 minutes, from two devices.",
  "accountLocked.reason2":
    "<b>New location:</b> attempt from <b>Madrid, Spain</b>. You usually sign in from Lisbon.",
  "accountLocked.reason3":
    "<b>Lock will lift automatically</b> in 23 minutes, or use one of the options below to unlock now.",
  "accountLocked.whatNow.contact.title": "Contact the team",
  "accountLocked.whatNow.contact.desc":
    "If none of the above work, write to us and we'll verify you by hand.",
  "accountLocked.foot.whyLink": "Why does this happen?",

  // ── AccountSuspendedPage.tsx ──────────────────────────────────────────────
  "accountSuspended.kicker": "Account paused · moderation action",
  "accountSuspended.heading":
    "Your account is <em>suspended</em> for {days} days.",
  "accountSuspended.lead":
    "A moderator reviewed a report and decided your recent message in <b>{channel}</b> crossed §02·02 of the Code of Conduct (<em>repeated misgendering</em>). This is a <b>temporary suspension at rung 3</b> of the moderation ladder.",
  // Live-mode lead (real suspended member) — the specifics live in the reason
  // block below, sourced from the moderator's note, so this stays general.
  "accountSuspended.leadLive":
    "Your account is paused while a moderation decision stands. Here's what happened, and how to respond.",
  "accountSuspended.reason.title": "Why your account was paused",
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
    "{percent}% of appeals are overturned. We publish the number annually. <a>See 2025 moderation stats</a>",

  // ── InviteExpiredPage.tsx (invite state: expired / used / revoked / not found) ─
  "inviteState.expired.eyebrow": "Invite expired",
  "inviteState.expired.heading": "This link has <em>timed out.</em>",
  "inviteState.expired.lead":
    "Invites stay live for a while, and yours was sent a bit too long ago, so the slot we held for you has rotated back into the pool. The quickest way in is a fresh nudge from the person who vouched for you.",
  "inviteState.used.eyebrow": "Invite already used",
  "inviteState.used.heading": "This invite has <em>already been opened.</em>",
  "inviteState.used.lead":
    "Someone has already joined with this link. Most likely you, on another device. If that was you, just sign in. If it wasn't, let the team know and we'll take a look.",
  "inviteState.revoked.eyebrow": "Invite withdrawn",
  "inviteState.revoked.heading": "This invite was <em>called back.</em>",
  "inviteState.revoked.lead":
    "The person who sent this invite, or a community steward, withdrew it before it was used. No harm done. You can ask for a new one whenever you're ready.",
  "inviteState.notFound.eyebrow": "Invite not found",
  "inviteState.notFound.heading": "We couldn't <em>place this link.</em>",
  "inviteState.notFound.lead":
    "This invite link doesn't match anything on our side. It may have been mistyped or cut short when it was shared. Ask for a fresh one and we'll get you in.",
  "inviteState.inviterInactive.eyebrow": "Inviter no longer active",
  "inviteState.inviterInactive.heading":
    "The person who invited you has <em>moved on.</em>",
  "inviteState.inviterInactive.lead":
    "Whoever sent this invite is no longer active on QueerPulse, so their link can't bring you in. Nothing you did. Ask another member you know for a fresh invite, or request one and we'll take it from there.",
  "inviteState.details.expiredOn": "Expired",
  "inviteState.details.vouchedBy": "Vouched by",
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
    "A space where you know who you're sharing it with, and where your privacy is always yours to control.",
  "inviteLanding.what.noAds.strong": "Community comes first.",
  "inviteLanding.what.noAds.rest":
    "No ads competing for your attention and no algorithm deciding what you should see. QueerPulse is shaped around the people who use it.",
  "inviteLanding.what.community.strong": "Built for real life.",
  "inviteLanding.what.community.rest":
    "Discover people, places, events, and opportunities that help you find your way into queer life in Lisbon.",
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
    "Someone in the community thought you'd feel at home here. Your invitation is personal, and it's yours to accept.",
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
    "We're shipping the <b>2.5 release</b>: better moderation tools, an upgraded crisis chat, and faster image uploads. Should be back in about <em>20 minutes</em>.",
  "maintenance.info.startedLabel": "Started",
  "maintenance.info.startedValue": "14:00 <em>WET</em>",
  "maintenance.info.backByLabel": "Back by",
  "maintenance.info.backByValue": "<em>~14:20</em> WET",
  "maintenance.affected.title": "What's down · what isn't",
  "maintenance.affected.web": "Web platform · everything except…",
  "maintenance.affected.mobile": "Mobile app · same deployment",
  "maintenance.affected.email": "Email notifications · queued, sent after",
  "maintenance.actions.statusCta": "Live status",
  "maintenance.meta.line1":
    "Follow along on <a>status.queerpulse.app</a> · we post a public retrospective every time.",
  "maintenance.meta.line2":
    "Built by humans in Lisbon, who'd rather we ship slowly than break crisis support.",

  // ── OfflinePage.tsx ───────────────────────────────────────────────────────
  "offline.eyebrow": "No connection",
  "offline.h1": "You're <em>offline.</em>",
  "offline.lead":
    "No signal, or we can't reach our servers right now. <b>Pages you've already opened</b> on this device may still load. Try one below.",
  "offline.tryTitle": "Try a page you've opened before",
  "offline.links.feed.label": "Community feed",
  "offline.links.feed.sub": "The latest from your community",
  "offline.links.events.label": "Events",
  "offline.links.events.sub": "What's happening and your RSVPs",
  "offline.links.messages.label": "Messages",
  "offline.links.messages.sub": "Your recent conversations",
  "offline.status": "Listening for signal",
  "offline.retryCta": "Try again",
  "offline.retryingCta": "Still offline",

  // ── PwaPromptPage.tsx ─────────────────────────────────────────────────────
  "pwaPrompt.kicker": "Add to home screen · no app store needed",
  "pwaPrompt.heading": "Keep <em>QueerPulse</em> a tap away.",
  "pwaPrompt.lead":
    "Install the web app on your phone in 30 seconds. <em>Same as a regular app</em>, but no app-store account, no tracking, no review. Just a shortcut that opens crisis chat, your ticket, and the safe-spaces map in one tap.",
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

  // ── InstallNudge.tsx / PushNotificationRow.tsx ───────────────────────────
  // ID-17. iOS and iPadOS Safari hand `PushManager` only to a web app added to
  // the Home Screen, so on an iPhone every notification this platform sends is
  // gated behind an install step. Push is also the only out-of-band channel
  // QueerPulse has, so this copy names the install as the fix instead of
  // leaving the member on a "your browser can't do this yet" dead end.
  "pwaInstall.pushRow.helper":
    "On iPhone and iPad, notifications need QueerPulse added to your Home Screen. Safari only gives push to the installed app.",
  "pwaInstall.pushRow.cta": "How to install it",
  "pwaInstall.nudge.title": "Install QueerPulse",
  "pwaInstall.nudge.body":
    "Install the app to get notifications and keep QueerPulse a tap away.",
  "pwaInstall.nudge.bodyIos":
    "Add it to your Home Screen to get notifications. Takes about 30 seconds.",
  "pwaInstall.nudge.cta": "Show me how",
  "pwaInstall.nudge.dismiss": "Dismiss the install suggestion",

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
    "This is our fault. We've been automatically notified and we're looking at it.",
  "serverError.sub.maintenance":
    "We're upgrading the platform. Shouldn't be long. We appreciate your patience.",
  "serverError.status.maintenance":
    "<strong>Planned downtime.</strong> Follow <a>status.queerpulse.com</a> for updates.",
  "serverError.status.error":
    "<strong>Our team has been alerted.</strong> Check <a>status.queerpulse.com</a> for live updates.",
  "serverError.actions.retryCta": "Try again",
  "serverError.actions.homeCta": "Go to homepage",
  "serverError.actions.statusCta": "Check platform status",
  "serverError.footer.contact": "If this keeps happening, <a>contact us</a>.",

  // ── StatusPage.tsx / StatusComponents.tsx / status.data.ts ───────────────
  "status.hero.allOperational": "All systems operational",
  "status.hero.title": "Platform <em>status</em>",
  "status.hero.sub": "Updated just now · Refreshes every 60 s",
  "status.hero.subLive":
    "Live component health, plus anything the team has written up.",

  // ── StatusLive.tsx / StatusLiveComponents.tsx / StatusLiveIncidents.tsx ──
  // ID-16. The LIVE status surface, fed by the public `GET /status`. It renders
  // with no session at all, so this copy is read by people who are signed out,
  // suspended or locked out: it never assumes an account, and it says plainly
  // whether the trouble is ours.
  "status.live.overall.operational.title": "Everything is operational",
  "status.live.overall.operational.body":
    "Every part of the platform we can check is answering normally.",
  "status.live.overall.degraded.title": "Some parts are degraded",
  "status.live.overall.degraded.body":
    "Parts of the platform are slower or less reliable than usual right now. The details are below.",
  "status.live.overall.down.title": "We're having an outage",
  "status.live.overall.down.body":
    "At least one part of the platform isn't working. This one is on us, and there's nothing you need to do.",
  "status.live.state.operational": "Operational",
  "status.live.state.degraded": "Degraded",
  "status.live.state.down": "Down",
  "status.live.componentsHeading": "Parts of the platform",
  "status.live.component.accounts.name": "Sign-in and accounts",
  "status.live.component.accounts.desc":
    "Signing in, invites and account settings",
  "status.live.component.messaging.name": "Messages",
  "status.live.component.messaging.desc": "Direct and group messages",
  "status.live.component.communities.name": "Communities and forum",
  "status.live.component.communities.desc":
    "Community spaces, threads and gatherings",
  "status.live.component.directory.name": "Local directory",
  "status.live.component.directory.desc": "Places, safe spaces and the map",
  "status.live.component.magazine.name": "Magazine",
  "status.live.component.magazine.desc": "Articles, issues and the archive",
  "status.live.component.media.name": "Photos and uploads",
  "status.live.component.media.desc":
    "Avatars, galleries and anything you upload",
  "status.live.incidentsHeading": "Incidents",
  "status.live.incidentState.open": "Ongoing",
  "status.live.incidentState.monitoring": "Monitoring",
  "status.live.incidentState.resolved": "Resolved",
  "status.live.severity.minor": "Minor",
  "status.live.severity.major": "Major",
  "status.live.severity.critical": "Critical",
  "status.live.incidents.started": "Started {date} at {time}",
  "status.live.incidents.resolved": "resolved {date} at {time}",
  "status.live.incidents.affects": "Affects: {components}",
  "status.live.incidents.none.title": "No incidents in the last 30 days",
  "status.live.incidents.none.description":
    "Nothing has been written up recently. Whenever something goes wrong, this is where we say so.",
  "status.live.incidents.unavailable":
    "We couldn't load the incident history, which usually means the trouble is on our side. The component states above still stand.",
  "status.live.lastChecked": "Last checked {when}",
  "status.live.refreshCta": "Check again",
  "status.live.refreshingCta": "Checking",
  "status.live.refreshAriaLabel": "Check again for platform status updates",
  "status.live.signedOutNote":
    "This page works without an account. If everything here reads operational and you still can't sign in, the trouble sits with your account, and the team can look into that for you.",
  "status.live.unreachable.title": "We couldn't reach the status service",
  "status.live.unreachable.body":
    "Either the platform is down or your connection is. Try again in a moment.",
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
  "status.uptime.tooltip.operational": "Operational: {date}",
  "status.uptime.tooltip.partial": "Partial outage: {date}",
  "status.uptime.tooltip.outage": "Outage: {date}",
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
  "status.incidents.dbUpgrade.title": "Scheduled maintenance: database upgrade",
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
  // Step-up re-auth on QueerPulse is a Google sign-in round trip (see
  // features/settings/api/useReauthToken.ts). The pane that used to sit here
  // offered to email a one-time link; QueerPulse delivers no email, so it was
  // describing something that could never arrive.
  "verificationNeeded.confirm.intro":
    "Confirming means signing in with Google again as <b>{email}</b>, so a session someone else left open can't carry this through. Nothing is emailed.",
  "verificationNeeded.confirm.cta": "Confirm it's me",
  "verificationNeeded.confirm.verifyingCta": "Confirming…",
  "verificationNeeded.success.title": "It's you, <em>verified.</em>",
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

  // ── NewsletterUnsubscribePage.tsx (CNT-19: self-serve newsletter unsubscribe) ─
  "newsletterUnsubscribe.loading.eyebrow": "Newsletter",
  "newsletterUnsubscribe.loading.heading": "Confirming your request…",
  "newsletterUnsubscribe.success.eyebrow": "Unsubscribed",
  "newsletterUnsubscribe.success.heading": "You're off the <em>list.</em>",
  "newsletterUnsubscribe.success.lead":
    "This address is off the list. QueerPulse sends no email, so nothing was arriving here in the first place: this is about your address not sitting on a list you didn't want to be on. You can add it again from the homepage whenever you like.",
  "newsletterUnsubscribe.alreadyUnsubscribed.eyebrow": "Already unsubscribed",
  "newsletterUnsubscribe.alreadyUnsubscribed.heading":
    "Already <em>taken care of.</em>",
  "newsletterUnsubscribe.alreadyUnsubscribed.lead":
    "This address came off the list already, and it has stayed off. Nothing is going out to it here or anywhere else: QueerPulse sends no email.",
  "newsletterUnsubscribe.invalid.eyebrow": "Link not recognised",
  "newsletterUnsubscribe.invalid.heading":
    "We couldn't <em>place this link.</em>",
  "newsletterUnsubscribe.invalid.lead":
    "This unsubscribe link doesn't match anything on our side. It may be old or mistyped. Nothing is going out to the address either way, since QueerPulse sends no email, but tell the team if something looks wrong and we'll sort it.",
  "newsletterUnsubscribe.goHomeCta": "Back to homepage",
  "newsletterUnsubscribe.contactCta": "Talk to the team",

  // ── GenesisPage.tsx (one-time founder bootstrap; deleted post-launch) ────
  // "Genesis" is the internal name for this bootstrap flow, kept identical
  // across languages like the other product/brand nouns in this catalog.
  "genesis.eyebrow": "Platform bootstrap",
  "genesis.heading": "Genesis",
  "genesis.loggedIn.lead":
    "You're in. Claim admin to finish bootstrapping the platform.",
  "genesis.loggedIn.claimCta": "Claim admin",
  "genesis.loggedOut.lead":
    "Generate the founding invite. You'll join through the normal invite flow, invited by QueerPulse.",
  "genesis.loggedOut.generateCta": "Generate invite",
  "genesis.notice.closed": "Genesis is closed.",
  "genesis.notice.rejected": "This account cannot claim genesis.",
  "genesis.notice.failedFallback": "Something went wrong. Try again.",
  "genesis.notice.claimed": "You are now an admin.",
  "genesis.notice.demo": "Genesis isn't available in demo mode.",

  // ── AdminStatusIncidentsPage.tsx / AdminStatusIncidentForm.tsx (ID-16) ───
  // The operator desk behind the public status page. Filed in this catalog
  // rather than `admin.ts` deliberately: the copy and the surface it describes
  // are one feature, and the public half already lives here.
  "statusAdmin.navLabel": "Status incidents",
  "statusAdmin.breadcrumb": "Admin",
  "statusAdmin.eyebrow": "Platform",
  "statusAdmin.title": "Status <em>incidents</em>",
  "statusAdmin.headerSub":
    "What members see on the public status page. Anything published here is readable with no account, including by someone who can't sign in.",
  "statusAdmin.newCta": "New incident",
  "statusAdmin.empty": "Nothing has been written up yet.",
  "statusAdmin.loadError": "The incident list couldn't be loaded.",
  "statusAdmin.forbidden": "You don't have access to this panel.",
  "statusAdmin.demoNotice":
    "Demo mode writes nothing. Nothing you do here reaches the public status page.",
  "statusAdmin.row.started": "Started {date}",
  "statusAdmin.row.resolved": "Resolved {date}",
  "statusAdmin.row.affects": "Affects: {components}",
  "statusAdmin.row.affectsNone": "No parts marked as affected",
  "statusAdmin.row.author": "Written up by {name}",
  "statusAdmin.action.edit": "Edit",
  "statusAdmin.action.resolve": "Mark resolved",
  "statusAdmin.action.cancel": "Cancel",
  "statusAdmin.action.save": "Save changes",
  "statusAdmin.action.publish": "Publish incident",
  "statusAdmin.form.createEyebrow": "New incident",
  "statusAdmin.form.editEyebrow": "Edit incident",
  "statusAdmin.form.createTitle": "Write up an incident",
  "statusAdmin.form.editTitle": "Edit this incident",
  "statusAdmin.form.drawerLabel": "Incident editor",
  "statusAdmin.field.title": "Title",
  "statusAdmin.field.titleHint":
    "One line, plain language. This is the first thing a member reads.",
  "statusAdmin.field.body": "What's happening",
  "statusAdmin.field.bodyHint":
    "Plain text. Any markup is stripped when it's saved.",
  "statusAdmin.field.severity": "Severity",
  "statusAdmin.field.status": "Status",
  "statusAdmin.field.startedAt": "Started at",
  "statusAdmin.field.components": "Parts affected",
  "statusAdmin.field.componentsHint":
    "Whatever you tick here reads as degraded on the public page, or as down for a critical incident, until this is resolved.",
  "statusAdmin.severity.minor": "Minor",
  "statusAdmin.severity.major": "Major",
  "statusAdmin.severity.critical": "Critical",
  "statusAdmin.status.open": "Ongoing",
  "statusAdmin.status.monitoring": "Monitoring",
  "statusAdmin.status.resolved": "Resolved",
  "statusAdmin.toast.created": "Incident published.",
  "statusAdmin.toast.updated": "Incident updated.",
  "statusAdmin.toast.resolved": "Incident marked resolved.",
  "statusAdmin.error.create": "The incident couldn't be published.",
  "statusAdmin.error.save": "The changes couldn't be saved.",
  "statusAdmin.error.resolve": "The incident couldn't be marked resolved.",
  "statusAdmin.error.required": "Give the incident a title and a description.",
};

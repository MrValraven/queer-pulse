import type { Catalog } from "../../types";

/**
 * Settings — chrome-only sweep. Pane titles, labels, helper/description text,
 * toggle labels, confirmation dialogs, destructive-action warnings,
 * empty/error/success states, form labels, validation, and user-facing
 * attributes (`aria-label`/`title`/`alt`/`placeholder`).
 *
 * Left in English (not chrome, or a stored value — see inline notes at each
 * data file): mock account values standing in for fetched fields (email,
 * session records, linked-account handles), and any option list whose literal
 * string is itself the persisted value where a same-scope id/label-key split
 * wasn't possible (see `interests.data.ts` — IDENTITIES/LOOKING_FOR options).
 */
export const settings: Catalog = {
  // ── Settings nav (settings.data.ts NAV) ──────────────────────────────────
  "nav.group.preferences": "Preferences",
  "nav.group.privacyData": "Privacy & data",
  "nav.group.account": "Account",
  "nav.group.personalisation": "Personalisation",
  "nav.group.prototype": "Prototype",
  "nav.group.dangerZone": "Danger zone",
  "nav.item.notifications": "Notifications",
  "nav.item.language": "Language & terminology",
  "nav.item.data": "Data & privacy",
  "nav.item.visibility": "Visibility",
  "nav.item.safety": "Safety",
  "nav.item.profile": "Profile",
  "nav.item.account": "Account",
  "nav.item.profileTheme": "Profile theme",
  "nav.item.accessibility": "Accessibility",
  "nav.item.interests": "Interests",
  "nav.item.simulations": "Simulations",
  "nav.item.deleteAccount": "Delete account",

  // ── Community terminology guide (settings.data.ts TERMS) ─────────────────
  "terms.queer.name": "Queer",
  "terms.queer.def":
    "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; usage varies — some older members may prefer not to use it.",
  "terms.cisgender.name": "Cisgender",
  "terms.cisgender.def":
    "Describes someone whose gender identity matches the sex they were assigned at birth. Not a value judgement — simply a neutral descriptor.",
  "terms.nonBinary.name": "Non-binary",
  "terms.nonBinary.def":
    "A gender identity that sits outside the man/woman binary. Some non-binary people use they/them; always ask rather than assume.",
  "terms.twoSpirit.name": "Two-spirit",
  "terms.twoSpirit.def":
    "A term used by some Indigenous North American cultures for a person embodying both masculine and feminine spirits. Not interchangeable with Western LGBTQ+ terms.",

  // ── SettingsPage.tsx (save bar + delete-account confirm hand-off) ────────
  "page.saveBar.unsaved": "You have unsaved changes.",
  "page.saveBar.discard": "Discard",
  "page.saveBar.save": "Save changes",
  "page.saveBar.savedToast": "Settings saved",
  "page.saveBar.saveErrorToast":
    "We couldn't save your changes. Please try again.",

  // ── SettingsControls.tsx — DeleteAccountModal (first confirm step) ───────
  "controls.deleteModal.title": "Delete your account?",
  "controls.deleteModal.body":
    "Deleting permanently erases your profile, messages, community posts, and all associated data within 30 days. It cannot be undone. We recommend downloading your data first. Next, you'll confirm your password and we'll email you to finish the request.",
  "controls.deleteModal.cancel": "Cancel",
  "controls.deleteModal.continue": "Continue to delete",

  // ── SettingsModals.tsx — shared modal chrome ──────────────────────────────
  "modals.common.close": "Close",
  "modals.common.done": "Done",

  // ── SettingsModals.tsx — SuggestEditModal (terminology guide) ────────────
  "modals.suggestEdit.ariaLabel": "Suggest an edit to {term}",
  "modals.suggestEdit.success.title": "Thank you — <em>noted.</em>",
  "modals.suggestEdit.success.body":
    "Your suggested edit to <strong>{term}</strong> is with our community editors. Terminology changes are reviewed before going live; we'll let you know what happens.",
  "modals.suggestEdit.eyebrow": "Terminology · suggest an edit",
  "modals.suggestEdit.title": "Refine <em>{term}.</em>",
  "modals.suggestEdit.desc":
    "This guide is edited by the community. Suggest a clearer wording or a correction — every change is reviewed before publishing.",
  "modals.suggestEdit.wordingLabel": "Your suggested wording",
  "modals.suggestEdit.wordingPlaceholder": 'A clearer definition of "{term}"…',
  "modals.suggestEdit.whyLabel": "Why change it?",
  "modals.suggestEdit.optional": "(optional)",
  "modals.suggestEdit.whyPlaceholder": "Context that helps the editors",
  "modals.suggestEdit.sending": "Sending…",
  "modals.suggestEdit.send": "Send suggestion",
  "modals.suggestEdit.cancel": "Cancel",

  // ── SettingsModals.tsx — DataExportModal (simulated download) ────────────
  "modals.dataExport.eyebrow": "Data & privacy",
  "modals.dataExport.preparingBody":
    "Gathering your data and packaging it as a JSON file. This usually takes a moment…",
  "modals.dataExport.readyTitle": "Your export is <em>ready.</em>",
  "modals.dataExport.readyBody":
    "We've packaged your data as <strong>{filename}</strong>. In the real product we'd also email you a secure link — here you can download it now.",
  "modals.dataExport.downloadCta": "Download {filename}",

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Profile <em>theme.</em>",
  "personalisation.theme.sub":
    "Personalise how your profile and directory card look. Pick a pride flag, cover style, and pattern — and choose what shows up next to your name.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title": "Accessibility <em>preferences.</em>",
  "personalisation.accessibility.sub":
    "Tune display, motion, reading, and interaction to suit you. These settings apply across the whole platform.",
  "personalisation.accessibility.resetAll": "Reset all preferences",
  "personalisation.accessibility.resetNote":
    "This returns all display settings to their defaults. Your profile data is unaffected.",
  "personalisation.accessibility.deviceNote":
    "Your preferences are saved locally to this device.",
  "personalisation.accessibility.resetToast": "All preferences reset",

  // ── SafetyPane.tsx — quick-exit safety control ───────────────────────────
  // Precision matters here: quick exit clears the *screen*, it is not
  // anonymity and does not wipe browser history. Keep that distinction exact
  // in every locale.
  "safety.title": "Safety & <em>quick exit.</em>",
  "safety.sub":
    "A fast way to clear the screen if someone walks in. These settings live on this device only — they're never tied to your account.",
  "safety.gdprBox":
    "<strong>Quick exit is a fast screen-clear, not anonymity.</strong> It sends this tab to a neutral weather page and reopens QueerPulse in a separate tab. It can't wipe your earlier browser history, bookmarks, or address-bar suggestions — for that, also use a private window.",
  "safety.section.quickExit": "Quick exit",
  "safety.toggle.showButton.title": "Show the Quick exit button",
  "safety.toggle.showButton.desc":
    "A floating button, on every page, that leaves the site instantly. On by default for everyone's safety.",
  "safety.toggle.doubleTap.title": "Double-tap Shift shortcut",
  "safety.toggle.doubleTap.desc":
    "Tap the Shift key twice to leave without reaching for the button. Works only while the Quick exit button is on.",

  // ── InterestsPane.tsx ─────────────────────────────────────────────────────
  // NOTE: IDENTITIES.options / LOOKING_FOR.options (interests.data.ts) are the
  // literal *stored* values of draft.identities / draft.lookingFor, read
  // elsewhere in the app (Member type, directory) outside this sweep's scope.
  // Translating the label without a same-scope id/label-key split would
  // silently desync the stored value from its own display — left in English,
  // flagged in the sweep report for a coordinated follow-up.
  "interests.title": "Shape what you <em>see.</em>",
  "interests.sub":
    "These are private — not shown on your profile. They help us surface gatherings, members, and content that's relevant to you. Change them any time.",
  "interests.identities.heading": "Which identities feel like yours?",
  "interests.identities.skip": "Skip",
  "interests.identities.skipped": "Skipped",
  "interests.identities.helper":
    "Select as many as feel right. We use these to suggest relevant communities and content — not to categorise you.",
  "interests.lookingFor.heading": "What are you looking for here?",
  "interests.lookingFor.helper": "Select as many as you like.",
  "interests.life.heading": "A bit about your life",
  "interests.life.note": "(private — helps with local suggestions)",
  "interests.life.cityLabel": "City / region",
  "interests.life.languagesLabel": "Languages",
  "interests.life.languagesPlaceholder": "e.g. Portuguese, English",
  "interests.life.ageLabel": "Your age range",
  "interests.life.ageNote": "(optional — never shown to other members)",
  "interests.reading.heading": "What do you like reading?",
  "interests.reading.frequencyHeading":
    "How often do you want to hear from us?",
  "interests.content.heading": "Content settings",
  "interests.content.helper":
    "Turning these off never affects your community access — only your feed.",
  "interests.content.legalNote":
    "These preferences are private. Only you and QueerPulse can see them.",

  // ── interests.data.ts — age slider labels (only the index is stored) ────
  "interests.age.under25": "Under 25",
  "interests.age.25to35": "25–35",
  "interests.age.35to45": "35–45",
  "interests.age.45plus": "45+",

  // ── interests.data.ts — email frequency (id "daily"/"weekly"/"important"
  // is the stored value; only title/desc are translated) ───────────────────
  "interests.freq.daily.title": "Daily digest",
  "interests.freq.daily.desc": "One email per day with your top updates",
  "interests.freq.weekly.title": "Weekly roundup",
  "interests.freq.weekly.desc": "A curated weekly summary of what matters",
  "interests.freq.important.title": "Only important",
  "interests.freq.important.desc": "Just notifications that need your action",

  // ── interests.data.ts — reading preferences (UI-only toggles, no
  // persisted value beyond local component state) ─────────────────────────
  "interests.readingPref.longform": "Long-form articles & essays",
  "interests.readingPref.memberStories": "Member stories & personal essays",
  "interests.readingPref.resourcesGuides": "Resources & guides",
  "interests.readingPref.communityThreads": "Community threads & discussions",

  // ── interests.data.ts — content settings (same: UI-only toggles) ────────
  "interests.contentSetting.dating": "Dating & relationship content",
  "interests.contentSetting.mentalHealth": "Mental health & wellbeing content",
  "interests.contentSetting.sexualityIdentity":
    "Sexuality & identity exploration content",

  // ── SimulationPreviewModal.tsx ────────────────────────────────────────────
  "previewModal.ariaLabel": "Preview: {title}",
  "previewModal.kicker": "Preview",
  "previewModal.deviceGroupAriaLabel": "Preview width",
  "previewModal.mobile": "Mobile",
  "previewModal.desktop": "Desktop",
  "previewModal.openFullScreen": "Open full screen",
  "previewModal.closeAriaLabel": "Close preview",

  // ── SettingsPanes.tsx — NotificationsPane ────────────────────────────────
  "notifications.title": "Notification <em>preferences.</em>",
  "notifications.sub":
    "Granular control over what reaches you and how. We'll never send you something you haven't asked for.",
  "notifications.section.gatherings": "Gatherings",
  "notifications.section.messagesConnections": "Messages & connections",
  "notifications.section.communitiesBoard": "Communities & board",
  "notifications.section.delivery": "Delivery",
  "notifications.section.newslettersEmail": "Newsletters & email",
  "notifications.gatherings.newAnnounced.title": "New gathering announced",
  "notifications.gatherings.newAnnounced.desc":
    "When a gathering matching your interests is posted",
  "notifications.gatherings.rsvpReminder.title": "RSVP reminder",
  "notifications.gatherings.rsvpReminder.desc":
    "48 hours before a gathering you've said you're going to",
  "notifications.gatherings.lastFewSpots.title": "Last few spots",
  "notifications.gatherings.lastFewSpots.desc":
    "When a gathering you saved is almost full",
  "notifications.messages.newMessage.title": "New message",
  "notifications.messages.newMessage.desc":
    "When someone sends you a direct message",
  "notifications.messages.connectionRequest.title": "Connection request",
  "notifications.messages.connectionRequest.desc":
    "When someone asks to connect with you",
  "notifications.messages.sayHello.title": '"Say hello" received',
  "notifications.messages.sayHello.desc": "When someone waves at your profile",
  "notifications.communities.newPost.title": "New post in my communities",
  "notifications.communities.newPost.desc":
    "Activity in communities you've joined",
  "notifications.communities.threadReply.title": "Reply to a thread I'm in",
  "notifications.communities.threadReply.desc":
    "When someone responds to a thread you've participated in",
  "notifications.communities.weeklyDigest.title": "Weekly community digest",
  "notifications.communities.weeklyDigest.desc":
    "A quiet summary of what's happening — one email, once a week",
  "notifications.delivery.email.title": "Email notifications",
  "notifications.delivery.email.desc":
    "How often to batch and send notifications by email",
  "notifications.delivery.email.immediately": "Immediately",
  "notifications.delivery.email.dailyDigest": "Daily digest",
  "notifications.delivery.email.weeklyDigest": "Weekly digest",
  "notifications.delivery.email.never": "Never",
  "notifications.delivery.quietHours.title": "Quiet hours",
  "notifications.delivery.quietHours.desc":
    "Don't send anything between these hours",
  "notifications.delivery.quietHours.none": "No quiet hours",
  "notifications.newsletter.title": "Newsletter & email preferences",
  "notifications.newsletter.desc":
    "Choose which newsletters and email streams you receive — magazine issues, event digests, community announcements, and more.",
  "notifications.newsletter.manage": "Manage",

  // ── SettingsPanes.tsx — LanguagePane ──────────────────────────────────────
  "language.title": "Language & <em>terminology.</em>",
  "language.sub":
    "A living reference, kept up to date by the community. Search for a term to see how we use it across QueerPulse.",
  "language.section.platformPreference": "Platform language preference",
  "language.interfaceLanguage.title": "Interface language",
  "language.interfaceLanguage.desc":
    "The language QueerPulse uses for menus, labels, and system messages. Português is still being translated across the platform — some pages stay in English for now.",
  "language.section.terminologyGuide": "Community terminology guide",
  "language.searchPlaceholder": "Search terms…",

  // ── SettingsPanes.tsx — DataPane (privacy/GDPR — precision over style) ──
  "data.title": "Data & <em>privacy.</em>",
  "data.sub":
    "Your data belongs to you. We collect the minimum needed to run the platform and never sell it. You can download or delete everything at any time.",
  "data.gdprBox":
    "<strong>GDPR compliant.</strong> QueerPulse is subject to EU data protection law and the Portuguese RGPD. Your rights include access, correction, portability, and deletion. This page is how you exercise them.",
  "data.section.yourData": "Your data",
  "data.download.title": "Download your data",
  "data.download.desc":
    "A full export of your profile, messages, community posts, and activity. Delivered as a JSON file within 48 hours.",
  "data.download.cta": "Request export",
  "data.downloadMessages.title": "Download your messages",
  "data.downloadMessages.desc":
    "Your full message history, exported as plain text.",
  "data.downloadMessages.cta": "Export messages",
  "data.correct.title": "Correct inaccurate data",
  "data.correct.desc":
    "If we hold data about you that is factually incorrect, you have the right to have it corrected.",
  "data.correct.cta": "Contact data team",
  "data.section.cookiePrivacy": "Cookie & privacy choices",
  "data.consent.analytics.title": "Analytics & usage data",
  "data.consent.analytics.desc":
    "Anonymous, aggregate usage patterns to improve the platform. No individual tracking, no ad networks. Off unless you turn it on.",
  "data.consent.monitoring.title": "Crash & error reporting",
  "data.consent.monitoring.desc":
    "Automatic diagnostics when something breaks, so we can fix it faster. No advertising or profiling data.",
  "data.cookiePrefs.title": "Manage cookie preferences",
  "data.cookiePrefs.desc":
    "Review the full breakdown of what's stored and change any choice. Strictly necessary cookies keep you logged in and are always on.",
  "data.cookiePrefs.cta": "Open preferences",
  "data.section.personalisation": "Personalisation",
  "data.searchPersonalisation.title": "Search personalisation",
  "data.searchPersonalisation.desc":
    "Use your interests and connections to improve suggested members and gatherings. A product preference — this stays on your account, not tracking.",
  "data.section.dangerZone": "Danger zone",
  "data.deactivate.title": "Deactivate account",
  "data.deactivate.desc":
    "Your profile becomes invisible and you stop receiving notifications. You can reactivate at any time by logging back in. Your data is retained.",
  "data.deactivate.cta": "Deactivate",
  "data.deletePermanently.title": "Delete account permanently",
  "data.deletePermanently.desc":
    "Permanently deletes your profile, messages, and all associated data within 30 days. This cannot be undone.",
  "data.deletePermanently.cta": "Delete account",
  "data.fineprint":
    "Under GDPR Article 17, you have the right to erasure. Deletion requests are processed within 30 days. Some data may be retained where we have a legal obligation to do so.",
  "data.export.full.title": "Preparing your full export",
  "data.export.messages.title": "Preparing your messages",
  "data.export.messages.note": "Plain export of your full message history.",

  // ── SettingsPanes.tsx — SimulationsPane ───────────────────────────────────
  "simulations.title": "Flow <em>simulations.</em>",
  "simulations.sub":
    "Preview key member journeys end to end. State screens open in a device-frame preview right here; richer flows launch the real screens so you can walk through them exactly as someone else would.",
  "simulations.preview": "Preview",
  "simulations.start": "Start simulation",

  // ── SettingsPanes.tsx — VisibilityPane (who can find/reach you) ─────────
  // "v" ids (open/network/private) are the stored value — never translate the
  // id itself, only the label/description shown for it.
  "visibility.title": "Profile <em>visibility.</em>",
  "visibility.sub":
    "Control who can find and reach you. You can change this at any time with no questions asked.",
  "visibility.section.whoCanSee": "Who can see your profile",
  "visibility.open.title": "Open to connect",
  "visibility.open.desc":
    "Anyone in the network can see your profile and say hello",
  "visibility.network.title": "Network only",
  "visibility.network.desc": "Visible to people within two connections of you",
  "visibility.private.title": "Keep it quiet for now",
  "visibility.private.desc":
    "I'll reach out when I'm ready. Profile not visible in search.",
  "visibility.section.additionalControls": "Additional controls",
  "visibility.newArrivals.title": 'Show me in "New arrivals"',
  "visibility.newArrivals.desc":
    "Let the community know you've recently joined",
  "visibility.suggestedConnections.title": "Appear in suggested connections",
  "visibility.suggestedConnections.desc":
    "Allow the platform to suggest you to members with shared interests",
  "visibility.activityStatus.title": "Show activity status",
  "visibility.activityStatus.desc":
    "Let people see when you were last active (approximate)",

  // ── SettingsPanes.tsx — AccountPane ────────────────────────────────────────
  "account.title": "Account <em>settings.</em>",
  "account.sub": "Login and security preferences.",
  "account.section.account": "Account",
  "account.emailAddress.title": "Email address",
  "account.emailAddress.desc": "The address tied to your account and sign-in.",
  "account.section.security": "Security",
  "account.twoFactor.title": "Two-factor authentication",
  "account.twoFactor.desc":
    "Adds a second step when logging in from a new device",
  "account.loginAlerts.title": "Login alerts",
  "account.loginAlerts.desc":
    "Email me when my account is accessed from a new device",
};

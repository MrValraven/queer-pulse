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
  // ── Per-identity discoverability (IdentitySections.tsx) ─────────────────
  // This copy asks someone to disclose. It states the consequence and the
  // audience plainly and does nothing to encourage the answer: no reach, no
  // counts, no "help others find you". The retraction line is a promise the
  // backend keeps — the directory reads the published set live, so turning a
  // switch off takes effect on the next search.
  "discoverable.heading": "Being found by identity",
  "discoverable.helper":
    "Off unless you turn it on. Anything you turn on can be seen by other signed-in members when they filter the member directory — and nowhere else. Your identities stay off your profile either way.",
  "discoverable.retract":
    "Turn one off and you stop appearing in those searches straight away.",
  "discoverable.rowOn": "Members filtering by this can find you.",
  "discoverable.rowOff": "You don't appear in these searches.",
  "discoverable.toggleLabel": "Findable as {label}",
  "discoverable.empty":
    "Nothing here yet. Whatever you add above, you decide about one at a time.",
  "discoverable.unsaved":
    "Identities you've just added show up here once you save.",
  "discoverable.toast.removed": "You no longer appear in those searches.",
  "discoverable.error":
    "Couldn't save that — nothing changed. Try again in a moment.",

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

  // ── EditProfileSidebar.tsx / editProfileNav.data.tsx ─────────────────────
  "editProfile.nav.group.profile": "Profile",
  "editProfile.nav.group.privacy": "Privacy",
  "editProfile.nav.identity.label": "Identity & photo",
  "editProfile.nav.pronouns.label": "Pronouns & name",
  "editProfile.nav.bio.label": "Bio & occupation",
  "editProfile.nav.links.label": "Links & social",
  "editProfile.nav.skills.label": "Skills & interests",
  "editProfile.nav.visibility.label": "Field visibility",
  "editProfile.nav.more": "More",
  "editProfile.nav.pronounsGuideLink": "Pronouns guide",

  // ── EditProfilePage.tsx (save bar + saved confirmation) ──────────────────
  "editProfile.savedBar.updated": "Saved. Updated <strong>{sections}</strong>.",
  "editProfile.savedBar.upToDate": "Saved. Your profile is up to date.",
  "editProfile.saveBar.unsavedLabel": "Unsaved changes in {sections}",
  "editProfile.saveBar.discard": "Discard",
  "editProfile.saveBar.saving": "Saving…",
  "editProfile.saveBar.save": "Save profile",

  // ── EditProfilePane.tsx — toasts ──────────────────────────────────────────
  "editProfile.toast.photoRemoved": "Photo removed.",
  "editProfile.toast.photoRestored": "Photo restored from Google.",

  // ── EditProfileSections.tsx — IdentitySection ────────────────────────────
  "editProfile.identity.title": "Identity <em>& photo</em>",
  "editProfile.identity.sub": "This is how you appear to other members.",
  "editProfile.identity.uploadPhoto": "Upload new photo",
  "editProfile.identity.removePhoto": "Remove photo",
  "editProfile.identity.useGooglePhoto": "Use your Google photo",
  "editProfile.identity.photoHint.default":
    "JPG or PNG · max 5 MB · square works best",
  "editProfile.identity.photoHint.google":
    "We can bring back the photo from the account you signed in with.",
  "editProfile.identity.displayNameLabel": "Display name",
  "editProfile.identity.displayNameHint":
    "Your display name is what people read; your username below is your handle.",
  "editProfile.identity.locationLabel": "Location in Lisbon",
  "editProfile.identity.locationOptional": "optional",
  "editProfile.identity.locationPlaceholder": "e.g. Mouraria, Intendente…",
  "editProfile.identity.locationHint":
    "Neighbourhood-level only — never exact address.",

  // ── EditProfileSections.tsx — PronounsSection ────────────────────────────
  "editProfile.pronouns.title": "Pronouns <em>& name</em>",
  "editProfile.pronouns.sub":
    "Your chosen name and pronouns appear everywhere on the platform. See the <a>pronouns guide</a> if you're updating a legal name across the platform.",
  "editProfile.pronouns.label": "Pronouns",
  "editProfile.pronouns.writeOwnLabel": "Write your own",
  "editProfile.pronouns.writeOwnPlaceholder": "Or write your own…",
  "editProfile.pronouns.hint":
    "You can select multiple chips above. Pronouns are shown on your profile only — not in meta tags or URLs.",
  "editProfile.pronouns.chosenNameLabel": "Chosen name",
  "editProfile.pronouns.chosenNameOptional": "if different from display name",
  "editProfile.pronouns.chosenNamePlaceholder":
    "Name to use in all communications",
  "editProfile.pronouns.chosenNameHint":
    "Used in emails from us and in any platform communications.",

  // ── EditProfileSections.tsx — BioSection ─────────────────────────────────
  "editProfile.bio.title": "Bio <em>& occupation</em>",
  "editProfile.bio.sub":
    "Tell the community who you are. No CV language required.",
  "editProfile.bio.label": "Bio",
  "editProfile.bio.placeholder": "A few sentences about you…",
  "editProfile.bio.occupationLabel": "Occupation",
  "editProfile.bio.organisationLabel": "Organisation",
  "editProfile.bio.organisationOptional": "optional",
  "editProfile.bio.organisationPlaceholder": "Where you work or study",

  // ── LinksSection.tsx ──────────────────────────────────────────────────────
  "editProfile.links.title": "Links <em>& social</em>",
  "editProfile.links.sub":
    "Add your website and social profiles. Each one shows with its icon on your profile.",
  "editProfile.links.platformAriaLabel": "Link platform",
  "editProfile.links.linkAriaLabel": "{platform} link",
  "editProfile.links.removeAriaLabel": "Remove {platform} link",
  "editProfile.links.addLink": "Add a link",

  // ── EditProfileSections.tsx — SkillsSection ──────────────────────────────
  "editProfile.skills.title": "Skills <em>& interests</em>",
  "editProfile.skills.sub":
    "Used for matching in the skills exchange and connecting with members who share your interests.",
  "editProfile.skills.offerLabel": "Skills you can offer",
  "editProfile.skills.offerPlaceholder": "e.g. Legal advice, Graphic design…",
  "editProfile.skills.add": "Add",
  "editProfile.skills.interestsLabel": "Interests",
  "editProfile.skills.interestsPlaceholder":
    "e.g. Housing policy, Film, Cooking…",

  // ── EditProfileSections.tsx — VisibilitySection (cosmetic, comingSoon) ───
  "editProfile.visibility.title": "Field <em>visibility</em>",
  "editProfile.visibility.sub":
    "Per-field visibility is coming soon. For now, use the Visibility tab to set who can see your whole profile.",
  "editProfile.visibility.alwaysOn": "Always on",
  "editProfile.visibility.optionMembers": "Members",
  "editProfile.visibility.optionConnectionsOnly": "Connections only",
  "editProfile.visibility.optionHidden": "Hidden",
  "editProfile.visibility.field.displayName.name": "Display name",
  "editProfile.visibility.field.displayName.desc":
    "Always public within QueerPulse",
  "editProfile.visibility.field.photo.name": "Photo",
  "editProfile.visibility.field.photo.desc": "Profile picture",
  "editProfile.visibility.field.pronouns.name": "Pronouns",
  "editProfile.visibility.field.pronouns.desc":
    "How you'd like to be addressed",
  "editProfile.visibility.field.bio.name": "Bio",
  "editProfile.visibility.field.bio.desc": "Your introduction text",
  "editProfile.visibility.field.occupation.name": "Occupation",
  "editProfile.visibility.field.occupation.desc": "Job title and organisation",
  "editProfile.visibility.field.location.name": "Location",
  "editProfile.visibility.field.location.desc": "Neighbourhood in Lisbon",
  "editProfile.visibility.field.skills.name": "Skills",
  "editProfile.visibility.field.skills.desc": "Offered skills and interests",
  "editProfile.visibility.field.link.name": "Link",
  "editProfile.visibility.field.link.desc": "External URL on your profile",

  // ── UsernameSection.tsx ────────────────────────────────────────────────────
  "editProfile.username.title": "Your <em>username</em>",
  "editProfile.username.sub":
    "This is your handle across QueerPulse — how people find your profile. Choose one that's yours; you can change it later, though old links won't point here anymore.",
  "editProfile.username.fieldLabel": "Username",
  "editProfile.username.fieldHint":
    "Lowercase letters, numbers and hyphens — 3 to 30 characters.",
  "editProfile.username.save": "Save username",
  "editProfile.username.saving": "Saving…",
  "editProfile.username.previewPrefix":
    "Your profile lives at <strong>/members/{handle}</strong>",
  "editProfile.username.toast.updated": "Username updated.",
  "editProfile.username.error.taken":
    "Someone already goes by that — try another one.",
  "editProfile.username.error.reserved":
    "That word's kept for the platform — try another.",
  "editProfile.username.error.invalid":
    "That username isn't allowed — check the format and try again.",
  "editProfile.username.error.generic":
    "We couldn't update your username just now — try again.",

  // ── UsernameField.tsx / usernameField.data.ts ────────────────────────────
  "usernameField.defaultLabel": "Username",
  "usernameField.placeholder": "yourname",
  "usernameField.checking": "Checking…",
  "usernameField.free": "Looks free — this one can be yours.",
  "usernameField.yours": "This is your handle.",
  "usernameField.reason.invalid":
    "Handles are 3–30 characters — lowercase letters, numbers and hyphens.",
  "usernameField.reason.reserved":
    "That word's kept for the platform — try another.",
  "usernameField.reason.taken":
    "Someone already goes by that — try another one.",

  // ── SessionsPage.tsx — chrome (mock session records stay English: demo
  // fallback for GET /account/sessions, live device/UA content) ────────────
  "sessions.ago.justNow": "just now",
  "sessions.ago.unknown": "unknown",
  "sessions.backToSecurity": "← Security",
  "sessions.eyebrow": "Security · Active sessions",
  "sessions.h1": "Where you're <em>signed in</em> right now.",
  "sessions.lead":
    "Every device with an active session. If something here looks unfamiliar, sign it out — and read <a>what to do next</a>.",
  "sessions.bulk.onlyDevice": "This is the only device you're signed in on.",
  "sessions.bulk.multi_one":
    "You're signed in on <strong>{count} device</strong>. Anything you don't recognise, sign it out.",
  "sessions.bulk.multi_other":
    "You're signed in on <strong>{count} devices</strong>. Anything you don't recognise, sign it out.",
  "sessions.bulk.signOutAll": "Sign out all other sessions",
  "sessions.sectionActiveNow": "Active now",
  "sessions.card.badgeThis": "This session",
  "sessions.card.badgeReview": "Review",
  "sessions.card.signedIn": "Signed in <strong>{when}</strong>",
  "sessions.card.lastActivity": "Last activity <strong>{when}</strong>",
  "sessions.card.current": "Current",
  "sessions.card.signOut": "Sign out",
  "sessions.empty.error.title": "We couldn't load your sessions",
  "sessions.empty.error.desc":
    "Rather than show you a list we can't stand behind, we've shown you nothing. Try again in a moment.",
  "sessions.empty.none.title": "No active sessions",
  "sessions.empty.none.desc":
    "Nothing is signed in right now — not even this device, which usually means your session is about to be refreshed.",
  "sessions.toast.signedOut":
    "Session ended. If we didn't recognise that device, we'll email the address on file.",
  "sessions.toast.signedOutError":
    "We couldn't sign that session out. Try again.",
  "sessions.toast.signedOutAll": "All other sessions signed out",
  "sessions.toast.signedOutAllError":
    "We couldn't sign the others out. Try again.",
  "sessions.footNote":
    "<strong>Something looks wrong?</strong> Sign out anything you don't recognise, then <a>tell us what happened</a> — we'll help you lock things down. When you sign an unrecognised session out, we email the address on file so there's an out-of-band record of what happened.",

  // ── DataExportPage.tsx — hero + toast + outro ────────────────────────────
  "dataExport.hero.eyebrow": "Your data · GDPR Art. 20",
  "dataExport.hero.titleLine1": "Your data.",
  "dataExport.hero.titleLine2": "Yours to take.",
  "dataExport.hero.sub":
    "Under GDPR, you have the right to receive a copy of all personal data we hold about you, in a machine-readable format. This page is how you request it. No forms. No waiting rooms. Just your data.",
  "dataExport.toast.selectType": "Select at least one data type.",
  "dataExport.outro.titleLine1": "Questions about",
  "dataExport.outro.titleLine2": "your data?",
  "dataExport.outro.sub":
    "Write to our data team. We respond to all requests within 5 working days.",
  "dataExport.outro.cta": "Contact us",

  // ── DataExportSections.tsx — DataExportSteps ─────────────────────────────
  "dataExport.steps.step1.label": "Choose what to export",
  "dataExport.steps.step1.desc":
    "Select the data types you want included in your archive.",
  "dataExport.steps.step2.label": "Confirm your identity",
  "dataExport.steps.step2.desc":
    "We email a verification link to your registered address.",
  "dataExport.steps.step3.label": "Download your archive",
  "dataExport.steps.step3.desc": "A single-use link, available for 7 days.",

  // ── DataExportSections.tsx — DataExportForm ──────────────────────────────
  "dataExport.form.title": "Request your <em>data archive</em>",
  "dataExport.form.sub":
    "Select the categories you want included. You can request a full export or only specific data types. We'll email you a secure link the moment your archive is ready.",
  "dataExport.form.includeLabel": "What to include",
  "dataExport.form.formatLabel": "File format",
  "dataExport.form.legalNote":
    "Under <strong>GDPR Article 20</strong>, we provide your data within <strong>30 days</strong> of a verified request. The archive is encrypted in transit and the download link is single-use.",
  "dataExport.form.submitting": "Requesting…",
  "dataExport.form.submit": "Request my data archive",
  // "JSON"/"CSV" are technical format abbreviations, identical in both
  // locales; only "Both" is prose. The button's displayed text renders this
  // key — the underlying Format value ("Both") stays the stable stored id.
  "dataExport.format.both": "Both",

  // ── dataExport.data.ts — DATA_TYPES (form checklist) ─────────────────────
  "dataExport.type.profile.label": "Profile & identity",
  "dataExport.type.profile.sub": "Name, pronouns, bio, photo",
  "dataExport.type.messages.label": "Messages",
  "dataExport.type.messages.sub": "All direct & group conversations",
  "dataExport.type.forumPosts.label": "Forum posts",
  "dataExport.type.forumPosts.sub": "All posts, replies, reactions",
  "dataExport.type.events.label": "Events",
  "dataExport.type.events.sub": "RSVPs, attendance history",
  "dataExport.type.connections.label": "Connections",
  "dataExport.type.connections.sub": "Members you follow or are connected to",
  "dataExport.type.activityLog.label": "Activity log",
  "dataExport.type.activityLog.sub": "Login history, device sessions",

  // ── DataExportSections.tsx — DataExportStatus ────────────────────────────
  "dataExport.status.ready.title": "Your archive is ready",
  "dataExport.status.ready.body":
    "We've also emailed this link to your registered address. It's single-use.",
  "dataExport.status.ready.bodyWithExpiry":
    "We've also emailed this link to your registered address. It's single-use and expires on <strong>{date}</strong>.",
  "dataExport.status.expired.title": "That link has expired",
  "dataExport.status.expired.body":
    "For your safety, export links expire after 7 days. Request a fresh archive and we'll build it again.",
  "dataExport.status.failed.title": "That didn't work",
  "dataExport.status.failed.body":
    "We couldn't build your archive just now — nothing left your account. Try again in a moment.",
  "dataExport.status.retry": "Request again",
  "dataExport.status.building.title": "Building your archive",
  "dataExport.status.building.body":
    "We're gathering your data and packaging it up. This can take a little while — we'll email you the moment it's ready, so you can close this page.",
  "dataExport.status.download": "Download {filename}",

  // ── DataExportSections.tsx — DataExportIncluded ──────────────────────────
  "dataExport.included.title": "What's <em>included</em>",
  "dataExport.included.sub":
    "A breakdown of every data category we hold and what each contains.",

  // ── dataExport.data.ts — ACCORDION_ITEMS ─────────────────────────────────
  "dataExport.accordion.profile.title": "Profile & identity",
  "dataExport.accordion.profile.body":
    "Your display name, username, pronouns, bio, occupation, profile photo, and any links you've added to your profile.",
  "dataExport.accordion.messages.title": "Messages",
  "dataExport.accordion.messages.body":
    "All direct messages and group conversations you participated in. Includes message content, timestamps, and read receipts. Messages from members who have deleted their accounts are anonymised.",
  "dataExport.accordion.forumPosts.title": "Forum posts & replies",
  "dataExport.accordion.forumPosts.body":
    "Every post and reply you made in the forum, including the thread it belongs to, any edits, and reactions you gave or received.",
  "dataExport.accordion.events.title": "Events",
  "dataExport.accordion.events.body":
    "Events you RSVPd to, events you marked as interested, attendance confirmation where applicable, and any event-related messages.",
  "dataExport.accordion.connections.title": "Connections",
  "dataExport.accordion.connections.body":
    "A list of members you follow, members who follow you, and any explicit connection relationships. Does not include the contact details of other members.",
  "dataExport.accordion.activitySessions.title": "Activity & sessions",
  "dataExport.accordion.activitySessions.body":
    "Login timestamps, device types (browser/OS), IP addresses (last 90 days only), and active session information. We do not log browsing history within the platform.",
  "dataExport.accordion.preferences.title": "Preferences & settings",
  "dataExport.accordion.preferences.body":
    "Your notification preferences, privacy settings, language selection, and any other account configuration you've set.",
  "dataExport.accordion.payments.title": "Payments (if applicable)",
  "dataExport.accordion.payments.body":
    "If you have contributed to any paid events or the community fund, a record of transaction dates and amounts. No card details are stored — payments are processed by Stripe.",

  // ── dataExport.data.ts — shared accordion tag dictionary ─────────────────
  "dataExport.tag.name": "name",
  "dataExport.tag.pronouns": "pronouns",
  "dataExport.tag.bio": "bio",
  "dataExport.tag.photo": "photo",
  "dataExport.tag.occupation": "occupation",
  "dataExport.tag.links": "links",
  "dataExport.tag.content": "content",
  "dataExport.tag.timestamps": "timestamps",
  "dataExport.tag.readReceipts": "read receipts",
  "dataExport.tag.attachments": "attachments",
  "dataExport.tag.posts": "posts",
  "dataExport.tag.replies": "replies",
  "dataExport.tag.edits": "edits",
  "dataExport.tag.reactions": "reactions",
  "dataExport.tag.rsvps": "RSVPs",
  "dataExport.tag.attendance": "attendance",
  "dataExport.tag.interest": "interest",
  "dataExport.tag.follows": "follows",
  "dataExport.tag.connections": "connections",
  "dataExport.tag.blockedList": "blocked list",
  "dataExport.tag.logins": "logins",
  "dataExport.tag.deviceTypes": "device types",
  "dataExport.tag.ipAddresses": "IP addresses",
  "dataExport.tag.sessions": "sessions",
  "dataExport.tag.notifications": "notifications",
  "dataExport.tag.privacy": "privacy",
  "dataExport.tag.language": "language",
  "dataExport.tag.appearance": "appearance",
  "dataExport.tag.transactions": "transactions",
  "dataExport.tag.amounts": "amounts",
  "dataExport.tag.dates": "dates",
  "dataExport.demoArchiveNote":
    "Demo export generated in-browser — no personal data left this device.",

  // ── SaveButton.tsx — reusable save control, shared across several panes ──
  "saveButton.defaultLabel": "Save changes",
  "saveButton.savingLabel": "Saving…",
  "saveButton.savedLabel": "Saved",

  // ── NotificationPreferencesPage.tsx + Sections — a standalone prototype
  // notification-matrix page (distinct from SettingsPanes' NotificationsPane) ─
  "notifPrefs.sidebar.account": "Account",
  "notifPrefs.sidebar.editProfile": "Edit profile",
  "notifPrefs.sidebar.notifications": "Notifications",
  "notifPrefs.sidebar.privacy": "Privacy",
  "notifPrefs.sidebar.dangerZone": "Danger zone",
  "notifPrefs.sidebar.deactivateAccount": "Deactivate account",
  "notifPrefs.title": "Notification <em>preferences</em>",
  "notifPrefs.sub":
    "Control exactly what QueerPulse sends you, and when. We default to less — you can always turn more on.",
  "notifPrefs.digest.sectionLabel": "Email digest",
  "notifPrefs.digest.frequencyLabel": "Digest frequency",
  "notifPrefs.digest.frequencySub":
    "A summary of activity since your last visit. Never promotional.",
  "notifPrefs.digest.freq.never": "Never",
  "notifPrefs.digest.freq.daily": "Daily",
  "notifPrefs.digest.freq.weeklyMonday": "Weekly (Monday)",
  "notifPrefs.digest.freq.fortnightly": "Fortnightly",
  "notifPrefs.digest.includesLabel": "Digest includes",
  "notifPrefs.digest.includesSub":
    "Which sections appear in your digest email.",
  "notifPrefs.digest.includes.forumEvents": "Forum highlights + Events",
  "notifPrefs.digest.includes.everything": "Everything",
  "notifPrefs.digest.includes.eventsOnly": "Events only",
  "notifPrefs.digest.includes.forumOnly": "Forum only",
  "notifPrefs.matrix.sectionLabel": "What triggers a notification",
  "notifPrefs.matrix.colEvent": "Event",
  "notifPrefs.matrix.colInApp": "In-app",
  "notifPrefs.matrix.colEmail": "Email",
  "notifPrefs.matrix.colPush": "Push",
  "notifPrefs.row.dm.label": "Direct message received",
  "notifPrefs.row.dm.sub": "Someone sends you a DM",
  "notifPrefs.row.forumReply.label": "Forum reply to your post",
  "notifPrefs.row.forumReply.sub": "Someone replies to a thread you started",
  "notifPrefs.row.forumMention.label": "Forum mention",
  "notifPrefs.row.forumMention.sub": "Someone uses @yourname in a post",
  "notifPrefs.row.rsvpReminder.label": "Event RSVP reminder",
  "notifPrefs.row.rsvpReminder.sub": "24h before an event you've signed up for",
  "notifPrefs.row.newEvent.label": "New event in your area",
  "notifPrefs.row.newEvent.sub": "Events matching your interests",
  "notifPrefs.row.magazineIssue.label": "Magazine new issue",
  "notifPrefs.row.magazineIssue.sub": "When the monthly issue goes live",
  "notifPrefs.row.connectionRequest.label": "Connection request",
  "notifPrefs.row.connectionRequest.sub": "A member wants to connect with you",
  "notifPrefs.row.mentalHealthFund.label": "Mental health fund update",
  "notifPrefs.row.mentalHealthFund.sub":
    "If you're using the fund, status changes",
  "notifPrefs.quietHours.sectionLabel": "Quiet hours",
  "notifPrefs.quietHours.enableTitle": "Enable quiet hours",
  "notifPrefs.quietHours.enableDesc":
    "No push notifications during these hours. Email and in-app unaffected.",
  "notifPrefs.quietHours.from": "From",
  "notifPrefs.quietHours.until": "Until",
  "notifPrefs.alwaysOn.sectionLabel": "Always on · cannot be disabled",
  "notifPrefs.alwaysOn.securityAlerts.title": "Security alerts",
  "notifPrefs.alwaysOn.securityAlerts.desc":
    "New sign-in from an unrecognised device or location.",
  "notifPrefs.alwaysOn.dataExportReady.title": "Data export ready",
  "notifPrefs.alwaysOn.dataExportReady.desc":
    "When your data archive is available to download.",
  "notifPrefs.alwaysOn.moderationDecisions.title": "Moderation decisions",
  "notifPrefs.alwaysOn.moderationDecisions.desc":
    "If a moderator acts on content you posted.",
  "notifPrefs.saveBar.note": "Changes are saved automatically.",
  "notifPrefs.saveBar.label": "Save preferences",
  "notifPrefs.toast.saved": "Notification preferences saved.",

  // ── AccessibilityPreferencesPage.tsx + Sections — the full accessibility
  // page (SettingsPersonalisation's AccessibilityPane is a summary card that
  // links here). Only Reduce motion is functional; the rest are labelled but
  // non-functional mocks — translate labels only, per the sweep brief. ─────
  "a11y.sidebar.preferences": "Preferences",
  "a11y.sidebar.display": "Display",
  "a11y.sidebar.motion": "Motion",
  "a11y.sidebar.reading": "Reading",
  "a11y.sidebar.interaction": "Interaction",
  "a11y.sidebar.reset": "Reset",
  "a11y.section.display.eyebrow": "Display",
  "a11y.section.display.desc":
    "These settings apply across the whole platform.",
  "a11y.toggle.highContrast.title": "High contrast mode",
  "a11y.toggle.highContrast.desc":
    "Increases colour contrast for better readability. Affects text, borders, and focus rings.",
  "a11y.toggle.largerText.title": "Increase text size",
  "a11y.toggle.largerText.desc":
    "Makes body text slightly larger across all pages.",
  "a11y.toggle.dyslexia.title": "Dyslexia-friendly font",
  "a11y.toggle.dyslexia.desc":
    "Wider letter-spacing and increased line height for improved readability.",
  "a11y.textSize.label": "Text size",
  "a11y.textSize.preview":
    "The quick brown fox crossed Príncipe Real and found a community waiting on the other side.",
  "a11y.section.motion.eyebrow": "Motion",
  "a11y.section.motion.desc":
    "Control animations and transitions across the platform.",
  "a11y.toggle.reduceMotion.title": "Reduce motion",
  "a11y.toggle.reduceMotion.desc":
    "Disables animations, transitions, and pulse effects across the platform.",
  "a11y.toggle.pauseDecorative.title": "Pause decorative animations",
  "a11y.toggle.pauseDecorative.desc":
    "Stops background orbs, pulse dots, and loading spinners from animating.",
  "a11y.preview.liveLabel": "Live preview",
  "a11y.preview.cardText":
    "This card animates on load — toggle motion settings to see the effect.",
  "a11y.section.reading.eyebrow": "Reading",
  "a11y.section.reading.desc":
    "Adjust how content is displayed for comfortable reading.",
  "a11y.toggle.wideSpacing.title": "Wider line spacing",
  "a11y.toggle.wideSpacing.desc":
    "Increases space between lines of text (line-height: 2.0).",
  "a11y.toggle.focusRings.title": "Show focus indicators",
  "a11y.toggle.focusRings.desc":
    "Adds visible keyboard focus rings on all interactive elements.",
  "a11y.colorTheme.label": "Colour theme",
  "a11y.colorTheme.headingLabel": "Heading colour style",
  "a11y.colorTheme.default": "Default",
  "a11y.colorTheme.softer": "Softer",
  "a11y.colorTheme.highContrast": "High contrast",
  "a11y.section.interaction.eyebrow": "Interaction",
  "a11y.section.interaction.desc": "Adjust how you interact with the platform.",
  "a11y.toggle.largeTargets.title": "Larger tap targets",
  "a11y.toggle.largeTargets.desc":
    "Increases minimum button and link size for easier touch interaction.",
  "a11y.toggle.stickyNav.title": "Sticky navigation",
  "a11y.toggle.stickyNav.desc":
    "Keeps the navigation bar always visible while scrolling.",
  "a11y.toggle.skipLink.title": "Skip to content link",
  "a11y.toggle.skipLink.desc":
    'On by default. Press Tab and a "Skip to main content" link appears at the top, so you can jump straight past the navigation. Turning it off removes that shortcut — the link stays hidden until it\'s focused, so leaving it on costs you nothing.',

  // ── DeleteAccountPage.tsx / DeleteAccountSection.tsx / DeleteAccountSections.tsx
  // — the off-ramp flow. Precision matters (danger zone) — matches the wording
  // already established in DataPane's deactivate/delete cards. `phrase` is a
  // client-only typed-confirmation string (never sent anywhere), so it's safe
  // to translate in full — display and match target resolve from the same key. ─
  "deleteAccount.page.title": "Leaving <em>QueerPulse?</em>",
  "deleteAccount.page.sub":
    "We're sorry to see you go. Before you decide, choose the option that fits your situation.",
  "deleteAccount.pending.title": "Deletion <em>scheduled.</em>",
  "deleteAccount.pending.sub":
    "You asked us to delete your account. Here's where that stands.",
  "deleteAccount.pauseStrip.text":
    "Not sure? Consider <strong>pausing notifications</strong> for a month instead. You stay a member without the noise.",
  "deleteAccount.pauseStrip.cta": "Turn off all emails and digests",
  "deleteAccount.toast.pausedEmails":
    "All email notifications paused for 30 days.",
  "deleteAccount.whatHappens.title.deactivate":
    "What happens when you deactivate",
  "deleteAccount.whatHappens.title.delete": "What happens when you delete",
  "deleteAccount.confirm.typeLabel":
    'Type <strong>"{phrase}"</strong> to confirm',
  "deleteAccount.confirm.cancelBtn": "Cancel",
  "deleteAccount.pending.cancelling": "Cancelling…",
  "deleteAccount.pending.cancelBtn": "Cancel deletion",
  "deleteAccount.toast.cancelled": "Deletion cancelled — welcome back.",
  "deleteAccount.toast.cancelError":
    "We couldn't cancel that just now. Try again.",
  "deleteAccount.options.deactivate.title": "Deactivate",
  "deleteAccount.options.deactivate.desc":
    "Your profile becomes invisible. Your data is preserved. You can reactivate any time by signing back in.",
  "deleteAccount.options.deactivate.tag": "Reversible",
  "deleteAccount.options.delete.title": "Delete account",
  "deleteAccount.options.delete.desc":
    "Permanently erases your account and all associated data within 30 days. This cannot be undone.",
  "deleteAccount.options.delete.tag": "Permanent",
  "deleteAccount.pending.banner":
    "<strong>Your account is scheduled for deletion.</strong> Everything is hidden now and will be permanently erased on <strong>{date}</strong>. Changed your mind? You can still cancel and pick up where you left off.",
  "deleteAccount.wh.deactivate.profileHidden":
    "Your <strong>profile is hidden</strong> immediately — no other member can find or view it.",
  "deleteAccount.wh.deactivate.dataPreserved":
    "Your <strong>data is fully preserved</strong>: messages, posts, history remain intact.",
  "deleteAccount.wh.deactivate.reactivateInstantly":
    "<strong>Reactivate instantly</strong> by signing back in with Google.",
  "deleteAccount.wh.deactivate.nameRemoved":
    "Your <strong>name is removed</strong> from member lists and search results.",
  "deleteAccount.wh.deactivate.attributedDeactivated":
    "Event RSVPs and forum contributions are <strong>attributed to [deactivated member]</strong>.",
  "deleteAccount.wh.delete.queuedForDeletion":
    "<strong>All your data is queued for deletion</strong> and permanently erased within 30 days.",
  "deleteAccount.wh.delete.messagesDeleted":
    "Messages you sent <strong>are deleted from all conversations</strong> — recipients lose them too.",
  "deleteAccount.wh.delete.postsRemoved":
    "Your forum posts are <strong>permanently removed</strong> — not anonymised, deleted.",
  "deleteAccount.wh.delete.emailSuppressed":
    "Your email address is <strong>added to a suppression list</strong> so we don't accidentally re-create your account.",
  "deleteAccount.wh.delete.exportFirst":
    "You can request a <strong>data archive before deleting</strong> — do that first.",
  "deleteAccount.phrase.deactivate": "deactivate my account",
  "deleteAccount.phrase.delete": "delete my account",
  "deleteAccount.confirmHint.deactivate":
    "You can undo this at any time by signing back in.",
  "deleteAccount.confirmHint.delete":
    "You'll have 30 days to change your mind. After that it can't be reversed.",
  "deleteAccount.btnLabel.deactivate": "Deactivate my account",
  "deleteAccount.btnLabel.delete": "Permanently delete my account",

  // ── DestructiveActionFlow.tsx + destructiveFlows.data.tsx — shared
  // confirm → loading → result dialog for deactivate/delete ────────────────
  "destructiveFlow.backToHome": "Back to QueerPulse",
  "destructiveFlow.error.title": "That didn't <em>go through.</em>",
  "destructiveFlow.error.body":
    "We couldn't complete this just now — nothing was changed. Check your connection and try again, or come back in a moment.",
  "destructiveFlow.error.close": "Close",
  "destructiveFlow.error.tryAgain": "Try again",
  "destructiveFlow.confirm.notNow": "Not now",
  "destructiveFlow.deactivate.eyebrow": "Deactivate account",
  "destructiveFlow.deactivate.title": "Hide your profile <em>for now?</em>",
  "destructiveFlow.deactivate.body":
    "Your profile becomes invisible and notifications stop. <strong>Nothing is deleted</strong> — sign back in any time and you pick up exactly where you left off.",
  "destructiveFlow.deactivate.confirmLabel": "Deactivate",
  "destructiveFlow.deactivate.loadingText": "Deactivating your account…",
  "destructiveFlow.deactivate.resultTitle": "You're <em>signed off.</em>",
  "destructiveFlow.deactivate.resultBody":
    "Your profile is hidden and your data is safely preserved. Whenever you're ready, sign in and everything comes back. We'll be here.",
  "destructiveFlow.delete.eyebrow": "Delete account",
  "destructiveFlow.delete.title": "Delete <em>permanently?</em>",
  "destructiveFlow.delete.body":
    "This queues your profile, messages, and all associated data for erasure within 30 days. <strong>This cannot be undone.</strong>",
  "destructiveFlow.delete.confirmLabel": "Delete my account",
  "destructiveFlow.delete.loadingText": "Scheduling your account for deletion…",
  "destructiveFlow.delete.resultTitle": "It's <em>scheduled.</em>",
  "destructiveFlow.delete.resultBody":
    "Your account is scheduled for deletion. Check your inbox for a confirmation email — you have <strong>30 days</strong> to cancel by signing back in. After that, your data is permanently erased. Take care of yourself.",

  // ── ThemeStudio.tsx / profileTheme.data.ts — profile theme picker. Pride
  // flag NAMES (FLAG_SWATCHES.label) are deliberately left in English: they're
  // the stored `title` tooltip and several are contested-neologism territory
  // in pt-PT (e.g. "aromantic") — flagged for native-speaker review rather
  // than guessed. The persisted value is the array index either way, never
  // the label, so this is a translate-later content decision, not a bug. ───
  "themeStudio.sectionLabel": "Profile theme",
  "themeStudio.sub":
    "Shown on your public profile and in the member directory.",
  "themeStudio.prideThemesLabel": "Pride themes",
  "themeStudio.coverStyleLabel": "Cover style",
  "themeStudio.coverPatternLabel": "Cover pattern",
  "themeStudio.badgeDisplayLabel": "Badge display",
  "themeStudio.showBadgesToggle": "Show badges on profile",
  "themeStudio.showLevelToggle": "Show level on profile",
  "themeStudio.previewLabel": "Preview",
  "themeStudio.previewHintTop": "Updates live as you pick a theme.",
  "themeStudio.profileCardLabel": "Profile card",
  "themeStudio.directoryCardLabel": "Directory card",
  "themeStudio.directoryHint":
    "This is how your profile appears in search results and the member directory.",
  "themeStudio.memberSince": "Lisbon · Member since {year}",
  "themeStudio.levelPreview": "Lv.4 · Familiar",
  "themeStudio.cover.stripe": "Bold stripe",
  "themeStudio.pattern.none": "Solid",
  "themeStudio.pattern.stripe": "Diagonal stripes",
  "themeStudio.pattern.dots": "Dot grid",
  "themeStudio.pattern.grid": "Grid",
  "themeStudio.badge.foundingMember": "Founding Member (Legendary)",
  "themeStudio.badge.eventHost": "Event Host (Legendary)",
  "themeStudio.badge.sustainer": "Sustainer (Rare)",
  "themeStudio.badge.regular": "Regular (Rare)",
  "themeStudio.badge.vouch": "Vouch (Rare)",
  "themeStudio.backToProfile": "← My profile",
  "themeStudio.saveTheme": "Save theme",
  "themeStudio.toast.saved": "Theme saved",

  // ── MembershipPage.tsx / MembershipSidebar.tsx / membership.data.tsx —
  // Membership & Billing cluster. Money and dates are never baked into these
  // strings — components interpolate `fmt.currency()`/`fmt.date()` results
  // into the `{amount}`/`{date}`/`{period}` tokens below. ──────────────────
  "membership.breadcrumb.current": "Membership",
  "membership.page.title": "Your <em>membership</em>",
  "membership.tabs.plan": "Plan",
  "membership.tabs.billing": "Billing",
  "membership.tabs.access": "Access",

  "membership.tier.hardship.name": "Hardship waiver",
  "membership.tier.hardship.desc":
    "Community supported — fully funded by Sustaining members. No questions asked, no expiry, no means testing.",
  "membership.tier.solidarity.name": "Solidarity",
  "membership.tier.solidarity.desc":
    "The most common choice. Pay what genuinely sustains you — anything between {min} and {max}.",
  "membership.tier.sustaining.name": "Sustaining",
  "membership.tier.sustaining.desc":
    "Your contribution funds access for members who can't afford it. Any amount above {threshold} goes directly into the solidarity pool.",
  "membership.tier.sub.free": "{amount} / month",
  "membership.tier.sub.range": "{min}–{max} / month",
  "membership.tier.sub.plus": "{amount}+ / month",
  "membership.tier.amount.other": "Other",
  "membership.tier.amount.otherSub": "amount",
  "membership.tier.customAmountPlaceholder": "e.g. {amount} / month",

  "membership.current.eyebrow": "Current plan",
  "membership.current.tierLabel": "Sustaining member",
  "membership.current.cadence": "/ month",
  "membership.current.since": "Member since {date}",
  "membership.current.activeBadge": "Active",

  "membership.plan.switchTier": "Switch tier",
  "membership.plan.fineprint":
    "Changes take effect at the next billing date. You'll never be locked out mid-cycle.",
  "membership.plan.saving": "Saving…",
  "membership.plan.saveCta": "Save changes →",
  "membership.plan.pauseCta": "Pause for 1 month",
  "membership.plan.cancelCta": "Cancel membership",
  "membership.plan.pauseConfirmText":
    "Pausing means your access continues until {date}, then suspends for 30 days. You can unpause at any time. Your position in the community is never affected.",
  "membership.plan.confirmPause": "Confirm pause",
  "membership.plan.keepActive": "Keep active",
  "membership.plan.beforeYouGo": "Before you go",
  "membership.plan.cancelConfirmText":
    "If it's financial, there's a hardship waiver — you stay in the community at no cost. If you're taking a break, the pause option keeps your account warm. If we've done something wrong, we want to know.",
  "membership.plan.keepMembership": "Keep membership",
  "membership.plan.toast.updated":
    "Plan updated. Changes take effect on {date}.",
  "membership.plan.toast.paused":
    "Membership paused from {date}. Resume anytime from this page.",
  "membership.plan.toast.cancelled":
    "Membership cancelled. Your access continues until {date}.",

  "membership.sidebar.activeMember": "Active member",
  "membership.sidebar.solidarityLink": "About solidarity pricing →",

  "membership.status.tierLabel": "Sustaining tier",
  "membership.status.renewal": "Next renewal: {date}",

  "membership.contribution.label": "contributed to date",
  "membership.contribution.since_one": "Since {date} · {count} month",
  "membership.contribution.since_other": "Since {date} · {count} months",
  "membership.contribution.impact.therapyHours":
    "Approximately {count} hours of the mental health access programme",
  "membership.contribution.impact.microGrants_one":
    "{count} micro-grant for members in financial need",
  "membership.contribution.impact.microGrants_other":
    "{count} micro-grants for members in financial need",
  "membership.contribution.impact.hardshipAccess_one":
    "Platform access for ~{count} member on hardship waivers",
  "membership.contribution.impact.hardshipAccess_other":
    "Platform access for ~{count} members on hardship waivers",

  "membership.billing.sectionPaymentHistory": "Payment history",
  "membership.billing.sectionPaymentMethod": "Payment method",
  "membership.billing.sectionInvoices": "Invoices",
  "membership.billing.row.lastPayment": "Last payment",
  "membership.billing.row.nextBillingDate": "Next billing date",
  "membership.billing.row.billingCycle": "Billing cycle",
  "membership.billing.row.amount": "Amount",
  "membership.billing.cycle.monthly": "Monthly",
  "membership.billing.updateCard": "Update card",
  "membership.billing.downloadPdf": "Download PDF",
  "membership.billing.cardForm.note":
    "Enter your new card details. We use Stripe for secure card handling — we never store card numbers.",
  "membership.billing.cardForm.cardNumberLabel": "Card number",
  "membership.billing.cardForm.expiryLabel": "Expiry",
  "membership.billing.cardForm.cvcLabel": "CVC",
  "membership.billing.cardForm.nameLabel": "Name on card",
  "membership.billing.cardForm.namePlaceholder": "Full name",
  "membership.billing.cardForm.saving": "Saving…",
  "membership.billing.cardForm.save": "Save card",
  "membership.billing.cardForm.cancel": "Cancel",
  "membership.billing.toast.invalidCard": "Please enter a valid card number.",
  "membership.billing.toast.cardUpdated": "Card updated.",
  "membership.billing.toast.invoiceDownloaded":
    "Invoice for {period} downloaded",
  "membership.billing.paymentMethod.expires": "Expires {date}",

  "membership.invoice.eyebrow": "Invoice · {period}",
  "membership.invoice.title": "Your <em>invoice.</em>",
  "membership.invoice.paidInFullShort": "Paid in full",
  "membership.invoice.totalLabel": "Total",
  "membership.invoice.lineItemLabel": "Sustaining membership",
  "membership.invoice.vatNote": "VAT reverse-charged · {amount}",
  "membership.invoice.downloadCta": "Download invoice",
  "membership.invoice.docTitle": "QueerPulse — Membership invoice",
  "membership.invoice.invoiceNumberLabel": "Invoice number:",
  "membership.invoice.billingPeriodLabel": "Billing period:",
  "membership.invoice.issuedToLabel": "Issued to:",
  "membership.invoice.lineItemsHeading": "Line items",
  "membership.invoice.totalRow": "Total",
  "membership.invoice.paidInFullLong":
    "Paid in full. Thank you for sustaining the community.",

  "membership.access.lead":
    "Everything your Sustaining membership unlocks. Changing tiers doesn't affect access until the current cycle ends.",
  "membership.access.item.magazine.label": "Magazine & editorial",
  "membership.access.item.magazine.note": "All issues + archive",
  "membership.access.item.forum.label": "Community forum",
  "membership.access.item.forum.note": "Post, reply, vote",
  "membership.access.item.dm.label": "Direct messages",
  "membership.access.item.dm.note": "Unlimited conversations",
  "membership.access.item.readingGroups.label": "Reading groups",
  "membership.access.item.readingGroups.note_one":
    "{count} group currently running",
  "membership.access.item.readingGroups.note_other":
    "{count} groups currently running",
  "membership.access.item.gatheringTickets.label": "Gathering tickets",
  "membership.access.item.gatheringTickets.note":
    "Member pricing on all paid events",
  "membership.access.item.jobBoard.label": "Job board & skill listings",
  "membership.access.item.jobBoard.note": "Post and apply",
  "membership.access.item.resourceLibrary.label": "Resource library",
  "membership.access.item.resourceLibrary.note":
    "Housing, health, legal, finance",
  "membership.access.item.mentalHealth.label": "Mental health access programme",
  "membership.access.item.mentalHealth.note": "Subsidised therapy referrals",
  "membership.access.item.microGrants.label": "Micro-grant applications",
  "membership.access.item.microGrants.note": "Quarterly — up to {amount}",
  "membership.access.item.directory.label": "Member directory & discovery",
  "membership.access.item.directory.note_one":
    "Find and connect with {count} member",
  "membership.access.item.directory.note_other":
    "Find and connect with {count} members",

  // ── CancelMembershipPage.tsx / CancelMembershipSteps.tsx /
  // cancelMembership.data.tsx / CancelConfirmModal.tsx — cancellation funnel.
  // Precision matters here (§6): every refund/no-refund/access-end sentence
  // was translated literally, not paraphrased. Money and dates are always
  // interpolated via `fmt.currency()`/`fmt.date()`, never baked in. ────────
  "cancelMembership.page.backLink": "← Membership",
  "cancelMembership.page.eyebrow": "Cancel · Sustainer (annual)",
  "cancelMembership.page.title": "Sorry to see you <em>thinking about it.</em>",
  "cancelMembership.page.lead":
    "No dark patterns — three quick steps and you're out, or you can pause or downshift instead. Either way, no shame. Your community access remains.",
  "cancelMembership.page.cancelledToast": "Membership cancelled · email sent",
  "cancelMembership.stepper.options": "Options",
  "cancelMembership.stepper.tellUsWhy": "Tell us why",
  "cancelMembership.stepper.confirm": "Confirm",

  "cancelMembership.alt.pause.eyebrow": "Pause · Sustainer",
  "cancelMembership.alt.pause.title": "Pause for <em>3 months?</em>",
  "cancelMembership.alt.pause.body":
    "We'll freeze your renewal for <b>3 months</b>. You keep full access the whole time, and we won't charge you until you resume — you can undo it any time.",
  "cancelMembership.alt.pause.confirmLabel": "Yes, pause it",
  "cancelMembership.alt.downshift.eyebrow": "Downshift to Member",
  "cancelMembership.alt.downshift.title": "Switch to <em>Member?</em>",
  "cancelMembership.alt.downshift.body":
    "You'll move to <b>Member · {amount} / year</b>. You keep all community access, but Sustainer-only perks (Open Studio, ILGA consult, magazine) wind down at the end of your term. Upgrade back any time.",
  "cancelMembership.alt.downshift.confirmLabel": "Yes, switch to Member",
  "cancelMembership.alt.solidarity.eyebrow": "Solidarity rate",
  "cancelMembership.alt.solidarity.title":
    "Drop to the <em>solidarity rate?</em>",
  "cancelMembership.alt.solidarity.body":
    "You'll pay <b>{amount} / year</b>, no questions asked — the community fund covers the difference, genuinely. You keep <b>every Sustainer perk</b> exactly as it is now.",
  "cancelMembership.alt.solidarity.confirmLabel":
    "Yes, drop to {amount} / year",

  "cancelMembership.reason.r1":
    "<b>Money is tight.</b> The price isn't right for me right now.",
  "cancelMembership.reason.r2":
    "<b>I'm not using it enough.</b> Logging in less than I'd like.",
  "cancelMembership.reason.r3":
    "<b>I'm leaving Lisbon</b> or no longer based here.",
  "cancelMembership.reason.r4":
    "<b>Something happened on the platform</b> that I want to flag.",
  "cancelMembership.reason.r5":
    "<b>I don't see the value</b> in the perks I'm paying for.",
  "cancelMembership.reason.r6": "<b>Other / prefer not to say.</b>",

  "cancelMembership.ends.openStudio.title": "Sustainer-only Open Studio",
  "cancelMembership.ends.openStudio.desc":
    "You'll lose your standing invite to the monthly sessions.",
  "cancelMembership.ends.magazine.title": "Magazine subscription",
  "cancelMembership.ends.magazine.desc":
    "Quarterly print magazine stops shipping after the next issue.",
  "cancelMembership.ends.legalConsult.title": "Free ILGA legal consult",
  "cancelMembership.ends.legalConsult.desc":
    "Your unused consult for this year expires when membership ends.",
  "cancelMembership.ends.badge.title": "Sustainer badge",
  "cancelMembership.ends.badge.desc":
    "The little heart on your profile goes away.",

  "cancelMembership.stays.account.title": "Your account & connections",
  "cancelMembership.stays.account.desc":
    "Profile, messages, connections, communities — all stay.",
  "cancelMembership.stays.gatherings.title": "Gatherings & communities",
  "cancelMembership.stays.gatherings.desc":
    "You can still RSVP, attend, and host.",
  "cancelMembership.stays.wellbeing.title": "Wellbeing resources",
  "cancelMembership.stays.wellbeing.desc":
    "Crisis chat, directory, vetted therapists — open to everyone.",
  "cancelMembership.stays.safeSpaces.title": "Safe-spaces network",
  "cancelMembership.stays.safeSpaces.desc":
    "The whole point of QueerPulse stays free.",

  "cancelMembership.options.currentTitle": "Your current <em>membership</em>",
  "cancelMembership.options.currentTierLabel": "Sustainer · <em>annual</em>",
  "cancelMembership.options.currentMeta":
    "Renewed <b>{renewedDate}</b> · next charge <b>{nextChargeDate}</b>",
  "cancelMembership.options.perYear": "/ year",
  "cancelMembership.options.beforeYouGoTitle":
    "Before you go — <em>three softer options</em>",
  "cancelMembership.options.sub":
    "Each takes 30 seconds. You can always come back to cancel.",
  "cancelMembership.options.pauseTitle": "Pause for 3 months",
  "cancelMembership.options.pauseDesc":
    "We freeze your renewal. You keep access. We don't charge until you resume.",
  "cancelMembership.options.downshiftTitle":
    "Downshift to Member ({amount} / year)",
  "cancelMembership.options.downshiftDesc":
    "Keep all community access. Drop Sustainer-only perks (open studio, ILGA consult, magazine).",
  "cancelMembership.options.solidarityTitle": "Drop to solidarity rate",
  "cancelMembership.options.solidarityDesc":
    "{amount} / year, no questions asked. The fund covers the difference. <b>Genuinely.</b>",
  "cancelMembership.options.continueCancellingCta": "Continue cancelling →",
  "cancelMembership.keepSustainerCta": "Keep my Sustainer",

  "cancelMembership.reasons.title": "Help us <em>understand.</em>",
  "cancelMembership.reasons.sub":
    "Optional, but useful. We read every response. Pick what fits.",
  "cancelMembership.reasons.addNote": "Anything you'd like to add? (optional)",
  "cancelMembership.reasons.placeholder":
    "A sentence or two helps us notice patterns. Nothing's shown to other members.",
  "cancelMembership.backCta": "← Back",
  "cancelMembership.continueCta": "Continue →",

  "cancelMembership.confirm.title": "One last <em>check.</em>",
  "cancelMembership.confirm.sub":
    "Here's what changes when you cancel — and what doesn't.",
  "cancelMembership.confirm.whatEnds": "What ends",
  "cancelMembership.confirm.whatStays": "What stays — free, forever",
  "cancelMembership.confirm.accessContinuesNote":
    "Your access continues until <b>{date}</b>. No refund — but no further charges.",
  "cancelMembership.confirm.writeToUs":
    "If something feels off, write to <a>cancel@queerpulse.app</a> — a real person reads it.",
  "cancelMembership.confirm.checkboxLabel":
    "I understand my Sustainer membership will not renew, and <b>my access ends {date}</b>. I can come back any time.",
  "cancelMembership.confirm.cancelMyMembershipCta": "Cancel my membership",

  "cancelMembership.done.title": "Until <em>next time.</em>",
  "cancelMembership.done.accessNote":
    "Your Sustainer membership won't renew. Access continues through <b>{date}</b>.",
  "cancelMembership.done.emailNote":
    "We sent a confirmation to <b>{email}</b> with everything written down.",
  "cancelMembership.done.mistakeNote":
    "If this was a mistake, you can resubscribe one-tap from the email or your account settings — no penalty.",
  "cancelMembership.backToHomeCta": "Back to home",
  "cancelMembership.resubscribeCta": "Resubscribe",

  "cancelMembership.paused.title": "Paused — <em>see you soon.</em>",
  "cancelMembership.paused.lead1":
    "We've frozen your Sustainer renewal for <b>3 months</b>. You keep full access the whole time — and we won't charge you a cent until you resume.",
  "cancelMembership.paused.lead2":
    "Your renewal moves to <b>{date}</b>. We sent the details to <b>{email}</b>.",
  "cancelMembership.paused.note":
    "Changed your mind? You can resume any time — it picks up right where you left off, no penalty.",
  "cancelMembership.backToMembershipCta": "Back to membership",
  "cancelMembership.paused.undoCta": "Undo pause",

  "cancelMembership.downshifted.title": "Welcome to <em>Member.</em>",
  "cancelMembership.downshifted.lead1":
    "You're on the <b>Member</b> plan now — <b>{amount} / year</b>. All your community access stays exactly as it was.",
  "cancelMembership.downshifted.lead2":
    "Your Sustainer-only perks (Open Studio, ILGA consult, the print magazine) wind down at the end of your current term. Your next charge is <b>{amount} on {date}</b>.",
  "cancelMembership.downshifted.note":
    "Confirmation is on its way to <b>{email}</b>. You can upgrade back to Sustainer any time.",
  "cancelMembership.downshifted.undoCta": "Undo — keep Sustainer",

  "cancelMembership.solidarity.title":
    "You're on the <em>solidarity rate.</em>",
  "cancelMembership.solidarity.lead1":
    "From your next renewal you'll pay <b>{amount} / year</b> — and you keep <b>every Sustainer perk</b> exactly as it is now. The community fund covers the rest.",
  "cancelMembership.solidarity.lead2":
    "Your next charge is <b>{amount} on {date}</b>. We sent the details to <b>{email}</b>.",
  "cancelMembership.solidarity.note":
    "When things ease up, you can move back to the full rate any time — no pressure, no reminder.",
  "cancelMembership.solidarity.undoCta": "Undo",

  // ── GiftMembershipPage.tsx / GiftMembershipForm.tsx / giftMembership.data.tsx
  // — gift & sponsor flow. Recipient name/contact/note default values stay
  // English (fictional example content, not chrome — same rule as a mock bio). ─
  "giftMembership.hero.eyebrow": "Sustainer · gift & sponsor",
  "giftMembership.hero.title": "Give somebody else <em>a seat.</em>",
  "giftMembership.hero.dek":
    "Two ways to do this. <b>Gift</b> someone you know directly — a friend, a partner, the person who introduced you to all this. Or <b>sponsor anonymously</b> — your gift goes into a pool a member applies to, no questions asked, when they need it. <em>Both keep someone here who might otherwise have stepped back.</em>",
  "giftMembership.modes.title": "Which <em>gift</em> are you making?",
  "giftMembership.mode.gift.title": "Gift it · <em>to someone you know</em>",
  "giftMembership.mode.gift.body":
    "For: a partner. A friend. The colleague who keeps asking how to join. <b>They get an invitation by name</b>, with a personal note from you. They sign up using a single-use link. If they decline, you get refunded.",
  "giftMembership.mode.gift.priceSub": "/ year · Sustainer · same as your own",
  "giftMembership.mode.sponsor.title":
    "Sponsor · <em>anonymously, for whoever needs it</em>",
  "giftMembership.mode.sponsor.body_one":
    "For: paying forward. Your gift sits in the <b>solidarity pool</b>. Members who can't afford the {amount} apply with a sentence — we approve, no proof asked. <em>{count} member is in the pool right now.</em> Your gift gets matched within days.",
  "giftMembership.mode.sponsor.body_other":
    "For: paying forward. Your gift sits in the <b>solidarity pool</b>. Members who can't afford the {amount} apply with a sentence — we approve, no proof asked. <em>{count} members are in the pool right now.</em> Your gift gets matched within days.",
  "giftMembership.mode.sponsor.priceSub":
    "give any amount · matched by name or anonymously",
  "giftMembership.form.title": "Gift details · <em>tell us who's it for</em>",
  "giftMembership.form.sub":
    "All editable until they accept. You can also schedule the delivery — for a birthday, a coming-out anniversary, the day they need it most.",
  "giftMembership.sponsorFoot.title":
    "Or skip the form · <em>sponsor anonymously</em>",
  "giftMembership.sponsorFoot.body":
    "If you'd rather not name a recipient, <a>drop your gift into the solidarity-membership pool</a>. We match it with a member who applied — usually within 48 hours. <em>You get a thank-you and a count; not a name.</em>",

  "giftMembership.delivery.now.label": "Now",
  "giftMembership.delivery.now.desc":
    "Sent in the next minute · email arrives instantly",
  "giftMembership.delivery.now.note": "delivered immediately",
  "giftMembership.delivery.schedule.label": "Schedule",
  "giftMembership.delivery.schedule.desc":
    "Pick a date · we send at 09:00 in their timezone",
  "giftMembership.delivery.schedule.note": "scheduled · pick a date next step",
  "giftMembership.delivery.print.label": "Print & post",
  "giftMembership.delivery.print.desc":
    "+ {amount} postage · risograph card · arrives in 5–7 days",
  "giftMembership.delivery.print.note": "printed + posted · +{amount}",

  "giftMembership.anon.no": "No — show my name to the recipient",
  "giftMembership.anon.yes": "Yes — anonymous to recipient",
  "giftMembership.anon.initials": "Just my initials",

  "giftMembership.form.sectionRecipient": "Recipient",
  "giftMembership.form.recipientNameLabel": "Their name",
  "giftMembership.form.recipientNameHint": "— how they'll be addressed",
  "giftMembership.form.recipientContactLabel": "Their email · or phone",
  "giftMembership.form.recipientContactHint":
    "We use it once · to send the invitation. They control what happens after.",
  "giftMembership.form.sectionFromYou": "From you",
  "giftMembership.form.senderNameLabel": "How you'd like to be named",
  "giftMembership.form.anonLabel": "Anonymous?",
  "giftMembership.form.anonHint": "just to them",
  "giftMembership.form.noteLabel": "A short note",
  "giftMembership.form.noteHint":
    "— optional · plain text · printed on the card",
  "giftMembership.form.charCount": "{count} / 280 characters",
  "giftMembership.form.sectionDelivery": "Delivery",
  "giftMembership.form.deliveryIntro": "When should the invitation arrive?",
  "giftMembership.form.previewHeading": "Preview · what they'll see",
  "giftMembership.form.previewStamp": "From a friend",
  "giftMembership.form.previewTitle":
    "{name} — someone got <em>your back.</em>",
  "giftMembership.form.previewSender":
    "— <b>{sender}</b> · with a year of Sustainer membership · {amount} · activate any time before <b>{date}</b>",
  "giftMembership.form.summary":
    "One Sustainer gift · <b>{amount}</b> · {deliveryNote}",
  "giftMembership.form.payCta": "Pay · gift {name} →",
  "giftMembership.form.toast.charged":
    "Charged {amount} · invitation sent to {name}",

  // ── LinkProviderModal.tsx ─────────────────────────────────────────────────
  "linkProvider.ariaLabel": "Authorize {provider}",
  "linkProvider.eyebrow": "Authorize · {provider}",
  "linkProvider.continueWith": "Continue with {provider}",
  "linkProvider.requestingAccess": "QueerPulse is requesting access",
  "linkProvider.authorizing": "Authorizing…",
  "linkProvider.authorizeCta": "Authorize {provider}",
  "linkProvider.cancel": "Cancel",
  "linkProvider.linkedTitle": "{provider} <em>linked.</em>",
  "linkProvider.linkedSub":
    "You can now sign in to QueerPulse with {provider}. Revoke it any time from this page — your messages and memberships were never shared.",
  "linkProvider.done": "Done",

  // ── IntegrationsModal.tsx ─────────────────────────────────────────────────
  "integrationsModal.ariaLabel": "Available integrations",
  "integrationsModal.eyebrow": "Connect another",
  "integrationsModal.title": "Available <em>integrations.</em>",
  "integrationsModal.desc":
    "Each integration is scoped narrowly — none can read your DMs, drafts, billing, or community memberships.",
  "integrationsModal.connectedTag": "Connected",
  "integrationsModal.connectCta": "Connect",
};

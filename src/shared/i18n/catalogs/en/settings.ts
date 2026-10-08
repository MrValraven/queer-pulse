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
  "nav.group.dangerZone": "Danger zone",
  "nav.item.notifications": "Notifications",
  "nav.item.language": "Language & terminology",
  "nav.item.data": "Data & privacy",
  "nav.item.visibility": "Visibility",
  "nav.item.profile": "Profile",
  "nav.item.account": "Account",
  "nav.item.profileTheme": "Profile theme",
  "nav.item.accessibility": "Accessibility",
  "nav.item.interests": "Interests",
  "nav.item.blockedUsers": "Blocked and muted",
  "nav.item.uploads": "My uploads",
  "nav.item.deleteAccount": "Delete account",

  // ── Community terminology guide (settings.data.ts TERMS) ─────────────────
  "terms.queer.name": "Queer",
  "terms.queer.def":
    "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; usage varies: some older members may prefer not to use it.",
  "terms.cisgender.name": "Cisgender",
  "terms.cisgender.def":
    "Describes someone whose gender identity matches the sex they were assigned at birth. It is a neutral descriptor, carrying no judgement.",
  "terms.nonBinary.name": "Non-binary",
  "terms.nonBinary.def":
    "A gender identity that sits outside the man/woman binary. Some non-binary people use they/them; always ask rather than assume.",
  "terms.twoSpirit.name": "Two-spirit",
  "terms.twoSpirit.def":
    "A term used by some Indigenous North American cultures for a person embodying both masculine and feminine spirits. Not interchangeable with Western LGBTQ+ terms.",

  // ── SettingsPage.tsx (save bar + delete-account confirm hand-off) ────────
  "page.saveBar.unsaved": "You have unsaved changes.",
  "page.saveBar.changesCount_one": "{count} change",
  "page.saveBar.changesCount_other": "{count} changes",
  "page.saveBar.discard": "Discard",
  "page.saveBar.save": "Save changes",
  "page.saveBar.savedToast": "Settings saved",
  "page.saveBar.saveErrorToast":
    "We couldn't save your changes. Please try again.",
  "page.leaveConfirm":
    "You have unsaved changes here. Leave without saving them?",

  // ── SettingsSaveBar.tsx — "what changed" disclosure (settings.data.ts
  //    changeLabelKey()). Most entries reuse an existing label elsewhere in
  //    the app; these two have no list-friendly existing label to reuse.
  "changes.interests.identities": "Identities",
  "changes.interests.lookingFor": "What you're looking for",

  // ── SettingsControls.tsx — DeleteAccountModal (first confirm step) ───────
  "controls.deleteModal.title": "Delete your account?",
  "controls.deleteModal.body":
    "Deleting permanently erases your profile, messages, community posts, and all associated data within 30 days. It cannot be undone. We recommend downloading your data first. Next, you'll confirm it's you and finish the request right here.",
  "controls.deleteModal.cancel": "Cancel",
  "controls.deleteModal.continue": "Continue to delete",

  // ── SuggestEditModal (terminology guide) ────────────

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Profile <em>theme.</em>",
  "personalisation.theme.sub":
    "Personalise how your profile and directory card look. Pick a pride flag, cover style, and pattern, and choose what shows up next to your name.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title": "Accessibility <em>preferences.</em>",
  "personalisation.accessibility.sub":
    "Tune text size, motion, reading and navigation to suit you. Every preference here is live: what you change saves the moment you change it and applies across the whole platform.",
  "personalisation.accessibility.resetAll": "Reset all preferences",
  "personalisation.accessibility.resetNote":
    "This returns the preferences you can change back to their defaults. Your profile data is unaffected.",
  "personalisation.accessibility.deviceNote":
    "Your preferences are saved locally to this device.",
  "personalisation.accessibility.resetToast": "All preferences reset",

  // ── InterestsPane.tsx ─────────────────────────────────────────────────────
  // IDENTITIES.options / LOOKING_FOR.options (interests.data.ts) stay the
  // literal stored values. Their display labels resolve through
  // identityLabel / lookingForLabel to the keys below (DES-430).
  "identity.chip.gay": "Gay",
  "identity.chip.lesbian": "Lesbian",
  "identity.chip.bisexual": "Bisexual",
  "identity.chip.pansexual": "Pansexual",
  "identity.chip.queer": "Queer",
  "identity.chip.trans": "Trans",
  "identity.chip.nonBinary": "Non-binary",
  "identity.chip.genderqueer": "Genderqueer",
  "identity.chip.genderfluid": "Genderfluid",
  "identity.chip.asexual": "Asexual",
  "identity.chip.aromantic": "Aromantic",
  "identity.chip.intersex": "Intersex",
  "identity.chip.twoSpirit": "Two-spirit",
  "identity.chip.questioning": "Questioning",
  "identity.chip.ally": "Ally",
  "identity.chip.queerPersonOfColour": "Queer person of colour",
  "identity.chip.disabledOrChronicallyIll": "Disabled or chronically ill",
  "identity.chip.preferNotToSay": "Prefer not to say",
  "lookingFor.chip.communityFriendship": "Community & friendship",
  "lookingFor.chip.professionalNetworking": "Professional networking",
  "lookingFor.chip.gatheringsEvents": "Gatherings & events",
  "lookingFor.chip.creativeCollaboration": "Creative collaboration",
  "lookingFor.chip.housingFlatmates": "Housing & flatmates",
  "lookingFor.chip.resourcesSupport": "Resources & support",
  "lookingFor.chip.activismOrganising": "Activism & organising",
  "lookingFor.chip.datingRelationships": "Dating & relationships",
  "lookingFor.chip.mentorshipGiving": "Mentorship (giving)",
  "lookingFor.chip.mentorshipSeeking": "Mentorship (seeking)",
  "lookingFor.chip.readingCulture": "Reading & culture",
  "lookingFor.chip.queerParenting": "Queer parenting",
  "lookingFor.chip.nightlife": "Nightlife",
  "interests.title": "Shape what you <em>see.</em>",
  "interests.sub":
    "These are private (not shown on your profile). They help us surface gatherings, members, and content that's relevant to you. Change them any time.",
  "interests.identities.heading": "Which identities feel like yours?",
  "interests.identities.skip": "Skip",
  "interests.identities.helper":
    "Select as many as feel right. We use these to suggest relevant communities and content. They are never used to categorise you.",
  // ── Per-identity discoverability (IdentitySections.tsx) ─────────────────
  // This copy asks someone to disclose. It states the consequence and the
  // audience plainly and does nothing to encourage the answer: no reach, no
  // counts, no "help others find you". The retraction line is a promise the
  // backend keeps — the directory reads the published set live, so turning a
  // switch off takes effect on the next search.
  "discoverable.heading": "Being found by identity",
  "discoverable.helper":
    "Off unless you turn it on. Anything you turn on can be seen by other signed-in members when they filter the member directory, and nowhere else. Your identities stay off your profile either way.",
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
    "Couldn't save that. Nothing changed. Try again in a moment.",

  "interests.lookingFor.heading": "What are you looking for here?",
  "interests.lookingFor.helper": "Select as many as you like.",
  "interests.lookingFor.showOnProfile":
    "Show what I'm looking for on my profile",
  "interests.professional.heading": "What you do",
  "interests.professional.helper":
    "These three are public. They show on your profile card and let people find you through the member directory's filters.",
  "interests.professional.languagesHeading": "Languages you speak",
  "interests.life.heading": "A bit about your life",
  "interests.life.note": "(private: helps with local suggestions)",
  "interests.life.cityLabel": "City / region",
  "interests.life.languagesLabel": "Languages",
  "interests.life.languagesPlaceholder": "e.g. Portuguese, English",
  "interests.life.ageLabel": "Your age range",
  "interests.life.ageNote": "(optional: never shown to other members)",
  "interests.reading.heading": "What do you like reading?",
  "interests.reading.frequencyHeading":
    "How often do you want to hear from us?",
  "interests.content.heading": "Content settings",
  "interests.content.helper":
    "Turning these off never affects your community access, only your feed.",
  "interests.content.legalNote":
    "These preferences are private. Only you and QueerPulse can see them.",

  // ── interests.data.ts — age slider labels (only the index is stored) ────
  "interests.age.under25": "Under 25",
  "interests.age.25to35": "25–35",
  "interests.age.35to45": "35–45",
  "interests.age.45plus": "45+",

  // ── interests.data.ts: how often the feed digest gathers up (id
  // "daily"/"weekly"/"important" is the stored value; only title/desc are
  // translated). Names no email: QueerPulse delivers none and never will, so
  // "hear from us" here means what lands in the app. ───────────────────────
  "interests.freq.daily.title": "Daily digest",
  "interests.freq.daily.desc": "One roundup a day with your top updates",
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

  // ── interests.data.ts — content settings. Persisted since PRD-10 through
  // `GET|PUT /me/content-sensitivity`. Each `.desc` names what the switch
  // takes away, because these now really remove things from the feed and a
  // member should see the cost before they flip one. ──────────────────────
  "interests.contentSetting.dating": "Dating & relationship content",
  "interests.contentSetting.dating.desc":
    "Hides posts and gatherings from dating, relationship and kink communities",
  "interests.contentSetting.mentalHealth": "Mental health & wellbeing content",
  "interests.contentSetting.mentalHealth.desc":
    "Hides posts and gatherings from mental health, wellbeing and recovery communities",
  "interests.contentSetting.sexualityIdentity":
    "Sexuality & identity exploration content",
  "interests.contentSetting.sexualityIdentity.desc":
    "Hides posts and gatherings from sexuality, gender and coming-out communities",
  "interests.content.toastError": "We couldn't save that setting. Try again.",

  // ── SettingsPanes.tsx — NotificationsPane ────────────────────────────────
  "notifications.title": "Notification <em>preferences.</em>",
  "notifications.sub":
    "Granular control over what reaches you and how. We'll never send you something you haven't asked for.",
  // Live save failures for one toggle (useNotificationPreferences).
  "notifications.toast.saveError":
    "We couldn't save that notification setting. Please try again.",
  "notifications.toast.saveErrorReason":
    "We couldn't save that notification setting: {reason}.",
  "notifications.section.gatherings": "Gatherings",
  "notifications.section.messagesConnections": "Messages & connections",
  "notifications.section.communitiesBoard": "Communities & board",
  "notifications.section.delivery": "Delivery",

  // ── Notification volume (SOC-10) ──────────────────────────────────────────
  "notifications.section.phonePush": "On your phone",
  "notifications.section.inApp": "In the app",
  "notifications.messageSound.title": "Message sound",
  "notifications.messageSound.desc":
    "Play a soft chime when a message arrives while QueerPulse is open. Muted chats stay silent.",
  "notifications.section.yourWork": "Your work and your listings",
  "notifications.volume.eventInvites.title": "New gathering announced",
  "notifications.volume.eventInvites.desc":
    "When you are invited to a gathering",
  "notifications.volume.eventReminders.title": "RSVP reminder",
  "notifications.volume.eventReminders.desc":
    "Before a gathering you said you are going to",
  "notifications.volume.eventActivity.title": "Activity on gatherings you run",
  "notifications.volume.eventActivity.desc":
    "New RSVPs, and invitations to co-host",
  "notifications.volume.eventCapacity.title": "Last few spots",
  "notifications.volume.eventCapacity.desc":
    "When a gathering you saved, or said maybe to, is nearly full",
  "notifications.volume.newMessages.title": "New message",
  "notifications.volume.newMessages.desc":
    "When someone sends you a direct message",
  "notifications.volume.connections.title": "Connection requests",
  "notifications.volume.connections.desc":
    "When someone asks to connect, sends a hello with their request, or accepts yours",
  "notifications.volume.vouches.title": "Vouches",
  "notifications.volume.vouches.desc":
    "When someone vouches for you, or for a space you run",
  "notifications.volume.invitations.title": "Invitations and introductions",
  "notifications.volume.invitations.desc":
    "When an invite you sent is accepted, someone introduces you, or a community invites you in",
  "notifications.volume.mentions.title": "Mentions",
  "notifications.volume.mentions.desc":
    "When someone names you in a post or a discussion",
  "notifications.volume.replies.title": "Replies to threads you are in",
  "notifications.volume.replies.desc":
    "When someone responds in a discussion you have taken part in",
  "notifications.volume.posts.title": "New posts in your communities",
  "notifications.volume.posts.desc":
    "Ordinary posts and shared resources. Set the level per community below to keep some communities loud and others quiet",
  "notifications.volume.announcements.title": "Community announcements",
  "notifications.volume.announcements.desc":
    "Only what an owner or moderator marked as an announcement",
  "notifications.volume.topicFollows.title": "Topics you follow",
  "notifications.volume.topicFollows.desc":
    "New posts under a topic you chose to follow",
  // PRD-208. Deliberately parallel to topicFollows above, which is the switch
  // beside it in the same group: same shape of promise, same phrasing, no
  // trailing period, matching every other row in this list.
  "notifications.volume.personaFollows.title": "Personas you follow",
  "notifications.volume.personaFollows.desc":
    "New work from a persona you chose to follow",
  "notifications.volume.recognition.title": "Recognition",
  "notifications.volume.recognition.desc":
    "Levels, badges, endorsements, credits, and new followers",
  "notifications.volume.personas.title": "Personas",
  "notifications.volume.personas.desc":
    "Invitations to co-own a persona, and who joined one",
  "notifications.volume.listings.title": "Listings you manage",
  "notifications.volume.listings.desc":
    "Public questions, accepted edits, and co-manager invitations",
  "notifications.volume.opportunities.title": "Opportunities",
  "notifications.volume.opportunities.desc":
    "Applications to what you posted, swap proposals, and homes matching a search you saved",
  "notifications.volume.magazine.title": "The magazine",
  "notifications.volume.magazine.desc":
    "Messages on a piece you are working on, and a new issue shipping",
  "notifications.volume.alwaysOn.label": "Always delivered",
  "notifications.volume.alwaysOn.desc":
    "Safety and moderation outcomes, account and security alerts, changes to a community you belong to, and decisions on things you asked for are always delivered. They cannot be turned off.",
  "notifications.perCommunity.label": "Volume, community by community",
  "notifications.perCommunity.intro":
    "Turn a busy community down without leaving it. This is the same setting the community's own page offers.",
  "notifications.perCommunity.rowDesc": "How much you hear from this community",
  "notifications.perCommunity.level.all": "Everything",
  "notifications.perCommunity.level.announcements": "Announcements only",
  "notifications.perCommunity.level.muted": "Off",
  "notifications.delivery.quietHours.title": "Quiet hours",
  "notifications.delivery.quietHours.desc":
    "Hold your phone notifications during these hours, read on your own clock. Nothing is lost: everything still arrives in your notifications, it just does not buzz.",
  "notifications.delivery.quietHours.none": "No quiet hours",

  "notifications.phonePush.title": "Phone notifications",
  "notifications.phonePush.desc":
    "Get a nudge on your phone when someone messages you, even when QueerPulse is closed. Add QueerPulse to your home screen first.",
  "notifications.phonePush.unsupported":
    "Your browser can’t show phone notifications yet.",
  "notifications.phonePush.blocked":
    "Notifications are blocked. Turn them back on in your browser settings, then try again.",
  "notifications.phonePush.previews.title": "Hide notification previews",
  "notifications.phonePush.previews.desc":
    "Show that something arrived without naming who it is from or what it says. Applies on every device you are signed in on, including iPhone. Useful if other people can see your lock screen.",
  "notifications.phonePush.previews.error":
    "We could not save that. Your previews have not changed.",
  "notifications.phonePush.test.title": "Send yourself a test",
  "notifications.phonePush.test.desc":
    "Send a notification to your own devices to check everything's working.",
  "notifications.phonePush.test.action": "Send test",
  "notifications.phonePush.test.sent": "Test sent. Check your device",
  "notifications.phonePush.test.error":
    "Couldn't send the test. Try again in a moment",
  "notifications.phonePush.manage.title": "Manage your devices",
  "notifications.phonePush.manage.desc":
    "See every device receiving your push notifications, and remove any you don't recognise.",
  "notifications.phonePush.manage.cta": "Manage devices",

  // ── SettingsPanes.tsx — LanguagePane ──────────────────────────────────────
  "language.title": "Language & <em>terminology.</em>",
  "language.sub":
    "A living reference, kept up to date by the community. Search for a term to see how we use it across QueerPulse.",
  "language.section.platformPreference": "Platform language preference",
  "language.interfaceLanguage.title": "Interface language",
  "language.interfaceLanguage.desc":
    "The language QueerPulse uses for menus, labels, and system messages. Português is still being translated across the platform. Some pages stay in English for now.",
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
    "Use your interests and connections to improve suggested members and gatherings. This is a product preference that stays on your account, kept separate from tracking.",
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
  "visibility.privateNetwork.label": "Keep my trust network private",
  "visibility.privateNetwork.help":
    "Hide who's vouched for you, and who you've vouched for, from other members. Admins can still see it for safety.",
  "visibility.featuredConsent.label": "Let admins feature you on the homepage",
  "visibility.featuredConsent.description":
    "Public, opted-in members may be picked to appear on the homepage from time to time. Turn it off whenever you'd rather stay out of the spotlight.",
  "visibility.featuredConsent.disabledHint":
    'Set your visibility to "Open to connect" first. Only public profiles can be featured.',
  "visibility.newArrivals.title": 'Show me in "New arrivals"',
  "visibility.newArrivals.desc":
    "Let the community know you've recently joined",
  "visibility.suggestedConnections.title": "Appear in suggested connections",
  // States the one-directional part plainly, at the switch: turning this off
  // stops you being offered to other people and changes nothing about what
  // you are offered, or about the member directory.
  "visibility.suggestedConnections.desc":
    "Let the platform offer you to members with shared interests. Turn it off and you still see suggestions yourself, and you stay in the member directory.",
  "visibility.suggestedConnections.toastError":
    "We couldn't save that setting. Try again.",
  "visibility.activityStatus.title": "Show activity status",
  // The same opt-out the profile's "Who sees what" sheet offers. The second
  // line is used when there is a band to name: a privacy switch you can't see
  // the effect of is a switch nobody trusts.
  "visibility.activityStatus.desc":
    "Let people see roughly how recently you were here. We keep the month and nothing finer.",
  "visibility.activityStatus.descWithBand":
    "Let people see roughly how recently you were here. Right now you read as: {band}.",
  "visibility.activityStatus.toastError":
    "We couldn't save that setting. Try again.",

  // PRD-353: "Who can add me to groups" (GroupAddPolicySection). Only ever an
  // accepted connection of the adder can add or invite you, so there is no
  // third "everyone" option; this only decides whether that connection seats
  // you directly (`connections`, the default) or has to invite you first
  // (`invite_only`).
  "visibility.groupAddPolicy.title": "Who can add me to groups",
  "visibility.groupAddPolicy.connections.label": "My connections",
  "visibility.groupAddPolicy.inviteOnly.label":
    "Nobody, send me an invite instead",
  "visibility.groupAddPolicy.explanation":
    "Only your connections can ever add you to a group or invite you to one.",
  "visibility.groupAddPolicy.toastError":
    "We couldn't save that setting. Try again.",

  // Scan section 9: the messaging privacy pane (MessagingPrivacySection,
  // api/useMessagingPrivacy). Read receipts, the typing indicator and online
  // status are reciprocal: turning one off also hides what other people share
  // with you.
  "visibility.messagingPrivacy.title": "Messaging privacy",
  "visibility.messagingPrivacy.readReceipts.label": "Read receipts",
  "visibility.messagingPrivacy.readReceipts.help":
    "Let people see when you've read their messages. Turn this off and you'll stop seeing when they've read yours too.",
  "visibility.messagingPrivacy.typing.label": "Typing indicator",
  "visibility.messagingPrivacy.typing.help":
    "Show when you're typing a reply. Turn this off and you'll stop seeing when others are typing too.",
  "visibility.messagingPrivacy.presence.label": "Online status",
  "visibility.messagingPrivacy.presence.help":
    "Let your connections see when you're online. Turn this off and you'll stop seeing when they're online too.",
  "visibility.messagingPrivacy.whoCanMessage.title": "Who can message me",
  "visibility.messagingPrivacy.whoCanMessage.everyone.label": "Everyone",
  "visibility.messagingPrivacy.whoCanMessage.everyone.hint":
    "Anyone can start a conversation with you, following your profile's visibility settings.",
  "visibility.messagingPrivacy.whoCanMessage.introduced.label":
    "People we both know",
  "visibility.messagingPrivacy.whoCanMessage.introduced.hint":
    "New messages need someone you both know to introduce you first.",
  "visibility.messagingPrivacy.whoCanMessage.connections.label":
    "Only my connections",
  "visibility.messagingPrivacy.whoCanMessage.connections.hint":
    "New messages and connection requests are limited to people you're already connected with. Enquiries about your housing or other listings still reach you.",
  "visibility.messagingPrivacy.toastError":
    "We couldn't save that. Check your connection and try again.",

  // ── SettingsPanes.tsx — AccountPane ────────────────────────────────────────
  "account.title": "Account <em>settings.</em>",
  "account.sub": "Login and security preferences.",
  "account.section.account": "Account",
  "account.emailAddress.title": "Email address",
  "account.emailAddress.desc": "The address tied to your account and sign-in.",
  // Placeholder while /auth/me is still resolving. Was a bare em dash.
  "account.emailAddress.notSet": "Not set yet",
  "account.section.security": "Security",
  "account.twoFactor.title": "Two-factor authentication",
  // You sign in with Google, so QueerPulse has no password and no second
  // factor of its own to add. Google's is the one that protects this account,
  // and since account re-linking landed it protects the way back in too.
  "account.twoFactor.desc":
    "You sign in with Google, so your Google account's own 2-step verification is what protects QueerPulse. It also protects the way back in if you ever lose access.",
  "account.twoFactor.cta": "Set it up at Google",
  "account.loginAlerts.title": "Login alerts",
  // Names the two channels that exist. The previous line said "Email me",
  // which QueerPulse has never been able to do and never will.
  "account.loginAlerts.desc":
    "Tell me here and on my phone when my account is signed in to from a device I haven't used before",
  "account.loginAlerts.toastError": "We couldn't save that setting. Try again.",
  "account.sessions.title": "Active sessions",
  "account.sessions.desc":
    "See every device signed into your account right now, and sign out anywhere you don't recognize.",
  "account.sessions.cta": "Manage sessions",
  "account.securityHub.title": "Your account security",
  "account.securityHub.desc":
    "How you sign in, which devices are signed in right now, which ones get push, and the export and deletion controls.",
  "account.securityHub.cta": "Open security",
  "account.disclosure.title": "Report a security vulnerability",
  "account.disclosure.desc":
    "Found a bug or a weakness in QueerPulse? Our disclosure policy explains how to report it and what happens next.",
  "account.disclosure.cta": "Read the policy",

  // ── AccountSecurityPage.tsx — the member's own security hub (ID-15) ───────
  // Every line here describes something with a real endpoint behind it. The
  // capabilities the platform does not have are named in `notYet.*` as prose,
  // never as a control. There is no email channel and never will be, so the
  // alert copy names the two channels that exist.
  "accountSecurity.back": "Back to account settings",
  "accountSecurity.eyebrow": "Account security",
  "accountSecurity.h1": "Who can get <em>into your account.</em>",
  "accountSecurity.lead":
    "Everything about how you sign in and which devices are carrying your account right now, in one place. Each line links to the page that changes it.",
  "accountSecurity.counting": "Checking…",
  "accountSecurity.countUnavailable": "We couldn't load this just now.",

  "accountSecurity.section.signIn": "How you sign in",
  "accountSecurity.section.devices": "Devices carrying your account",
  "accountSecurity.section.data": "Your data",
  "accountSecurity.section.more": "Elsewhere",

  "accountSecurity.signIn.title": "Google",
  "accountSecurity.signIn.value":
    "You sign in with Google, as <strong>{email}</strong>.",
  "accountSecurity.signIn.noEmail": "your Google account",
  "accountSecurity.signIn.note":
    "This is the only way into your account, so there is no password to change here. Keep your Google account itself well protected.",

  "accountSecurity.alerts.title": "Tell me about new sign-ins",
  "accountSecurity.alerts.desc":
    "When your account is signed in to from a device you have not used before, we say so here and on the devices you have given push permission to. We send no email.",

  "accountSecurity.sessions.title": "Signed in right now",
  "accountSecurity.sessions.count_one": "{count} active session.",
  "accountSecurity.sessions.count_other": "{count} active sessions.",
  "accountSecurity.sessions.note":
    "One per browser or app you are signed in on. You can end any of them, including all the others at once.",
  "accountSecurity.sessions.cta": "Review sessions",

  "accountSecurity.push.title": "Devices getting push",
  "accountSecurity.push.count_one": "{count} device registered for push.",
  "accountSecurity.push.count_other": "{count} devices registered for push.",
  "accountSecurity.push.note":
    "Notifications, including new sign-in alerts, reach these devices. Removing one stops push there straight away.",
  "accountSecurity.push.cta": "Manage devices",

  "accountSecurity.export.title": "Download your data",
  "accountSecurity.export.value":
    "Take a copy of everything we hold on you, in JSON or CSV.",
  "accountSecurity.export.note":
    "You sign in with Google again before the archive is built, so a borrowed session cannot walk off with your data.",
  "accountSecurity.export.cta": "Start an export",

  "accountSecurity.erasure.title": "Deactivate or delete",
  "accountSecurity.erasure.value":
    "Hide your account and come back later, or ask us to erase it for good.",
  "accountSecurity.erasure.note":
    "Deletion opens a 30-day grace period you can cancel, and signs you out everywhere. It also asks you to sign in with Google again first.",
  "accountSecurity.erasure.cta": "Open the options",
  "accountSecurity.erasure.ctaPending": "Review the request",
  "accountSecurity.erasure.pending":
    "<strong>Your account is scheduled to be erased on {date}.</strong> You can still cancel it until then.",

  "accountSecurity.disclosure.title": "Found a vulnerability?",
  "accountSecurity.disclosure.value":
    "Our responsible-disclosure policy explains what is in scope, how to report it, and what happens next.",
  "accountSecurity.disclosure.cta": "Read the policy",

  "accountSecurity.notYet.title": "Not available yet",
  "accountSecurity.notYet.twoFactor":
    "A second factor. Your Google account's own two-step verification is what protects the sign-in today.",
  "accountSecurity.notYet.recovery":
    "A second way in that does not go through Google. Losing your Google account is no longer the end of it: write to us and we can re-link your QueerPulse account to a Google identity holding the same verified address.",

  "accountSecurity.compromised":
    "<strong>Think somebody else is in your account?</strong> <sessions>End every other session</sessions> first, which leaves only the browser you are reading this on signed in, then <contact>tell us</contact> so we can look at what happened.",

  // ── MyUploadsPane.tsx — signed-in member's own uploaded images ──────────
  "uploads.title": "My uploads",
  "uploads.intro":
    "Every picture you’ve uploaded. Delete any you don’t need, including accidental double-uploads.",
  "uploads.demoOnly":
    "Your uploads appear here when you’re signed in to the live app.",
  "uploads.loading": "Loading your uploads…",
  "uploads.error": "We couldn’t load your uploads. Try again in a moment.",
  "uploads.empty": "You haven’t uploaded any pictures yet.",
  "uploads.inUseCount": "In use ({count})",
  "uploads.notReferenced": "Not referenced",
  "uploads.unverified": "Unverified",
  "uploads.degradedBanner":
    "Some in-use checks couldn’t run, so “not referenced” may be incomplete. Try reloading before deleting.",
  "uploads.kind.avatar": "Profile photo",
  "uploads.kind.work-image": "Showcase image",
  "uploads.kind.story-cover": "Story cover",
  "uploads.kind.persona-cover": "Persona banner",
  "uploads.kind.gathering-photo": "Event photo",
  "uploads.kind.group-avatar": "Group photo",
  "uploads.kind.listing-photo": "Listing photo",
  "uploads.kind.listing-menu": "Listing menu",
  "uploads.kind.community-cover": "Community banner",
  "uploads.kind.community-avatar": "Community logo",
  "uploads.kind.event-cover": "Gathering cover",
  "uploads.kind.message-image": "Chat photo",
  "uploads.kind.message-document": "Chat file",
  "uploads.delete.button": "Delete",
  "uploads.delete.title": "Delete this picture?",
  "uploads.delete.confirm": "This can’t be undone.",
  "uploads.delete.warnInUse_one":
    "This picture is used in {count} place. Deleting it will remove it there too, and can’t be undone.",
  "uploads.delete.warnInUse_other":
    "This picture is used in {count} places. Deleting it will remove it there too, and can’t be undone.",
  "uploads.delete.usedInHeading": "Used in these places:",
  "uploads.delete.cta": "Delete picture",
  "uploads.delete.cancel": "Cancel",
  "uploads.delete.toast.success": "Picture deleted.",
  "uploads.delete.toast.error": "We couldn’t delete that picture. Try again.",

  // ── EditProfileSidebar.tsx / editProfileNav.data.tsx ─────────────────────
  "editProfile.nav.group.profile": "Profile",
  "editProfile.nav.identity.label": "Identity & photo",
  "editProfile.nav.bio.label": "Bio & occupation",
  "editProfile.nav.links.label": "Links & social",
  "editProfile.nav.skills.label": "Skills & interests",
  "editProfile.nav.communities.label": "Communities",
  "editProfile.nav.more": "More",
  "editProfile.nav.pronounsGuideLink": "Pronouns guide",

  // ── EditProfilePage.tsx (save bar + saved confirmation) ──────────────────
  "editProfile.savedBar.updated": "Saved. Updated <strong>{sections}</strong>.",
  "editProfile.savedBar.upToDate": "Saved. Your profile is up to date.",
  "editProfile.saveBar.unsavedLabel": "Unsaved changes in {sections}",
  "editProfile.saveBar.discard": "Discard",
  "editProfile.saveBar.saving": "Saving…",
  "editProfile.saveBar.save": "Save profile",
  "editProfile.leaveConfirm":
    "You have unsaved profile changes. Leave without saving them?",

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
  "editProfile.identity.firstNameLabel": "First name",
  "editProfile.identity.lastNameLabel": "Last name",
  "editProfile.identity.nameHint":
    "Your name is what people read; your username below is your handle.",
  "editProfile.identity.locationLabel": "Location in Lisbon",
  "editProfile.identity.locationOptional": "optional",
  "editProfile.identity.locationPlaceholder": "e.g. Mouraria, Intendente…",
  "editProfile.identity.locationHint":
    "Neighbourhood-level only. Never exact address.",

  // ── EditProfileSections.tsx — PronounsSection ────────────────────────────
  "editProfile.pronouns.title": "Pronouns <em>& name</em>",
  "editProfile.pronouns.sub":
    "Your chosen name and pronouns appear everywhere on the platform. See the <a>pronouns guide</a> if you're updating a legal name across the platform.",
  "editProfile.pronouns.label": "Pronouns",
  "editProfile.pronouns.writeOwnLabel": "Write your own",
  "editProfile.pronouns.writeOwnPlaceholder": "Or write your own…",
  "editProfile.pronouns.removeCustomAriaLabel": "Remove {pronoun}",

  // ── EditProfileSections.tsx — BioSection ─────────────────────────────────
  "editProfile.bio.title": "Bio <em>& occupation</em>",
  "editProfile.bio.sub":
    "Tell the community who you are. No CV language required. Type @ to mention a member, c/ a community, e/ an event or t/ a forum thread, and it becomes a link.",
  "editProfile.bio.label": "Bio",
  "editProfile.bio.placeholder": "A few sentences about you…",
  "editProfile.bio.occupationLabel": "Occupation",

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
  "editProfile.skills.removeAria": "Remove skill {name}",
  "editProfile.interests.removeAria": "Remove interest {name}",

  // ── EditProfileSections.tsx — CommunitiesSection ─────────────────────────
  "editProfile.communities.title": "Communities <em>you feature</em>",
  "editProfile.communities.sub":
    "Pick up to 6 communities to show on your profile. Private communities can't be featured.",
  "editProfile.communities.counter": "{count} / 6 featured",
  "editProfile.communities.capHint":
    "You can feature up to 6. Un-feature one to add another.",
  "editProfile.communities.emptyHint":
    "You're not in any communities you can feature yet.",
  "editProfile.communities.feature": "Feature",
  "editProfile.communities.featured": "Featured",
  "editProfile.communities.moveUp": "Move up",
  "editProfile.communities.moveDown": "Move down",

  // ── UsernameSection.tsx ────────────────────────────────────────────────────
  "editProfile.username.title": "Your <em>username</em>",
  "editProfile.username.sub":
    "This is your handle across QueerPulse: how people find your profile. Choose one that's yours; you can change it later, though old links won't point here anymore.",
  "editProfile.username.fieldLabel": "Username",
  "editProfile.username.fieldHint":
    "Lowercase letters, numbers and hyphens: 3 to 30 characters.",
  "editProfile.username.save": "Save username",
  "editProfile.username.saving": "Saving…",
  "editProfile.username.previewPrefix":
    "Your profile lives at <strong>/members/{handle}</strong>",
  "editProfile.username.toast.updated": "Username updated.",
  "editProfile.username.error.taken":
    "Someone already goes by that. Try another one.",
  "editProfile.username.error.reserved":
    "That word's kept for the platform. Try another.",
  "editProfile.username.error.invalid":
    "That username isn't allowed. Check the format and try again.",
  "editProfile.username.error.generic":
    "We couldn't update your username just now. Try again.",

  // ── UsernameField.tsx / usernameField.data.ts ────────────────────────────
  "usernameField.defaultLabel": "Username",
  "usernameField.placeholder": "yourname",
  "usernameField.checking": "Checking…",
  "usernameField.free": "Looks free. This one can be yours.",
  "usernameField.yours": "This is your handle.",
  "usernameField.reason.invalid":
    "Handles are 3–30 characters: lowercase letters, numbers and hyphens.",
  "usernameField.reason.reserved":
    "That word's kept for the platform. Try another.",
  "usernameField.reason.taken":
    "Someone already goes by that. Try another one.",

  // ── SessionsPage.tsx — chrome (mock session records stay English: demo
  // fallback for GET /account/sessions, live device/UA content) ────────────
  "sessions.ago.justNow": "just now",
  "sessions.ago.unknown": "unknown",
  "sessions.backToAccount": "Account",
  "sessions.eyebrow": "Security · Active sessions",
  "sessions.h1": "Where you're <em>signed in</em> right now.",
  "sessions.lead":
    "Every device with an active session. If something here looks unfamiliar, sign it out, and read <a>what to do next</a>.",
  "sessions.bulk.onlyDevice": "This is the only device you're signed in on.",
  "sessions.bulk.multi_one":
    "You're signed in on <strong>{count} device</strong>. Anything you don't recognise, sign it out.",
  "sessions.bulk.multi_other":
    "You're signed in on <strong>{count} devices</strong>. Anything you don't recognise, sign it out.",
  "sessions.bulk.signOutAll": "Sign out all other sessions",
  "sessions.sectionActiveNow": "Active now",
  "sessions.card.badgeThis": "This session",
  "sessions.card.currentDeviceNote": "You're using this device right now.",
  // Opens the collapsed raw User-Agent. Named for what it is, so nobody has to
  // read it to know they can skip it.
  "sessions.card.technicalDetail": "Technical detail",
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
    "Every device is signed out right now, this one included, which usually means your session is about to be refreshed.",
  "sessions.toast.signedOut":
    "Session ended. If that wasn't you, review your active sessions and sign out anything you don't recognise.",
  "sessions.toast.signedOutError":
    "We couldn't sign that session out. Try again.",
  "sessions.toast.signedOutAll": "All other sessions signed out",
  "sessions.toast.signedOutAllError":
    "We couldn't sign the others out. Try again.",
  "sessions.footNote":
    "<strong>Something looks wrong?</strong> Sign out anything you don't recognise, then <a>tell us what happened</a>. We'll help you lock things down.",

  // ── PushDevicesPage.tsx — chrome (mock device records stay English, same
  // demo-fallback convention as SessionsPage above) ────────────────────────
  "pushDevices.ago.justNow": "just now",
  "pushDevices.ago.unknown": "unknown",
  "pushDevices.backToNotifications": "Notifications",
  "pushDevices.eyebrow": "Notifications · Push devices",
  "pushDevices.h1": "Devices getting your <em>push notifications</em>.",
  "pushDevices.lead":
    "Every device registered to receive a push from QueerPulse. Remove any you don't recognise, including a lost or stolen phone.",
  "pushDevices.sectionRegistered": "Registered devices",
  "pushDevices.card.registered": "Registered <strong>{when}</strong>",
  "pushDevices.card.lastUsed": "Last notified <strong>{when}</strong>",
  "pushDevices.card.remove": "Remove",
  "pushDevices.empty.error.title": "We couldn't load your devices",
  "pushDevices.empty.error.desc":
    "Rather than show you a list we can't stand behind, we've shown you nothing. Try again in a moment.",
  "pushDevices.empty.none.title": "No devices yet",
  "pushDevices.empty.none.desc":
    "Turn on push notifications from a device and it'll show up here.",
  "pushDevices.toast.removed":
    "Device removed. It won't get any more push notifications from QueerPulse.",
  "pushDevices.toast.removedError":
    "We couldn't remove that device. Try again.",
  "pushDevices.footNote":
    "<strong>Lost a device?</strong> Removing it here stops its push notifications immediately, even if you can't sign out of it yourself.",

  // ── BlockedUsersPane.tsx — chrome (demo mock blocked members stay English,
  // matching the mock-session-record convention above) ─────────────────────
  "blockedUsers.title": "Members you've <em>silenced</em>.",
  "blockedUsers.sub":
    "Blocked members can't see your profile, message you, or find you in search. Muted members simply go quiet for you, and were never told. Both are listed here and both can be undone.",
  "blockedUsers.section.blocked": "Blocked",
  "blockedUsers.row.blockedOn": "Blocked {date}",
  "blockedUsers.row.deletedMember": "Deleted member",
  "blockedUsers.row.unblockCta": "Unblock",
  "blockedUsers.empty.error.title": "We couldn't load your blocked members",
  "blockedUsers.empty.error.desc":
    "Rather than show you a list we can't stand behind, we've shown you nothing. Try again in a moment.",
  "blockedUsers.empty.none.title": "You haven't blocked anyone",
  "blockedUsers.empty.none.desc":
    "When you block a member, they'll show up here so you can review or undo it any time.",
  "blockedUsers.toast.unblocked": "{name} is unblocked.",
  "blockedUsers.toast.unblockedError":
    "We couldn't unblock that member. Try again.",

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
    "Write to us and someone from our team will get back to you.",
  "dataExport.outro.cta": "Contact us",

  // ── DataExportSections.tsx — DataExportSteps ─────────────────────────────
  "dataExport.steps.aria": "Export progress",
  "dataExport.steps.step1.label": "Choose what to export",
  "dataExport.steps.step1.desc":
    "Select the data types you want included in your archive.",
  "dataExport.steps.step2.label": "Confirm your identity",
  "dataExport.steps.step2.desc":
    "We ask you to confirm it's you, right here. No email, no password.",
  "dataExport.steps.step3.label": "Download your archive",
  "dataExport.steps.step3.desc":
    "It's built straight away and downloads from this page.",

  // ── DataExportSections.tsx — DataExportForm ──────────────────────────────
  "dataExport.form.title": "Request your <em>data archive</em>",
  "dataExport.form.sub":
    "Select the categories you want included. You can take everything, or only the parts you're after. Your archive is built as soon as you ask for it.",
  "dataExport.form.includeLabel": "What to include",
  "dataExport.form.formatLabel": "File format",
  "dataExport.form.legalNote":
    "Under <strong>GDPR Article 20</strong> you can take your data with you, in a format other services can read. Your archive is built on request and downloads over an encrypted connection.",
  "dataExport.form.submitting": "Requesting…",
  "dataExport.form.submit": "Request my data archive",
  // "JSON"/"CSV" are technical format abbreviations, identical in both
  // locales; only "Both" is prose. The button's displayed text renders this
  // key — the underlying Format value ("Both") stays the stable stored id.
  "dataExport.format.both": "Both",

  // ── dataExport.data.ts — DATA_TYPES (form checklist) ─────────────────────
  "dataExport.type.profile.label": "Profile & identity",
  "dataExport.type.profile.sub":
    "Name, pronouns, bio, photo, sections, handles, board, verification and privacy settings",
  "dataExport.type.messages.label": "Messages",
  "dataExport.type.messages.subDetailed":
    "Your messages, reactions and stars, plus the threads you reported",
  "dataExport.type.forumPosts.label": "Forum posts",
  "dataExport.type.forumPosts.sub":
    "Threads you started, your replies and their earlier versions, plus votes and follows",
  "dataExport.type.events.label": "Events",
  "dataExport.type.events.sub":
    "Events you hosted, your RSVPs and what you told the host, plus bookmarks, invites, settings",
  "dataExport.type.connections.label": "Connections",
  "dataExport.type.connections.sub":
    "Your connections, vouches, blocks, mutes, hidden members, dismissed suggestions and invites",
  "dataExport.type.activityLog.label": "Activity log",
  "dataExport.type.activityLog.sub":
    "Your activity feed, sign-ins, badges, XP, watch history and account and data requests",
  "dataExport.type.subprofiles.label": "Personas",
  "dataExport.type.subprofiles.sub":
    "Every persona you have, plus endorsements, follows and invites",
  "dataExport.type.listings.label": "Local directory listings",
  "dataExport.type.listings.sub":
    "Listings you own or manage, safe-space nominations, barter posts and your jobs",
  "dataExport.type.housing.label": "Housing",
  "dataExport.type.housing.sub":
    "Housing and group listings, flatmate profile, viewings, saved searches and landlord intros",
  "dataExport.type.saved.label": "Saved items",
  "dataExport.type.saved.sub":
    "Everything you saved, with a link back to each, plus your lists, collections and drafts",
  "dataExport.type.notifications.label": "Notifications",
  "dataExport.type.notifications.sub":
    "Your notification history and settings, and the devices you get push notifications on",
  "dataExport.type.consent.label": "Consent records",
  "dataExport.type.consent.sub": "What you've agreed to, and when",
  "dataExport.type.magazine.label": "Magazine writing",
  "dataExport.type.magazine.sub":
    "Your articles and drafts, submissions, comments, pitches and translations",
  "dataExport.type.communities.label": "Communities",
  "dataExport.type.communities.sub":
    "Communities you run or belong to, your posts, reactions, requests and feed choices",
  "dataExport.type.volunteering.label": "Volunteering",
  "dataExport.type.volunteering.sub":
    "Roles you signed up for, roles you posted and commissions you're interested in",
  "dataExport.type.governance.label": "Governance",
  "dataExport.type.governance.sub":
    "Your votes, proposals, cosignatures, roadmap ideas, nominations and forms sent",
  "dataExport.type.reviews.label": "Reviews you wrote",
  "dataExport.type.reviews.sub":
    "Reviews of listings, employers, viewings and landlords, plus resource feedback",
  "dataExport.type.media.label": "Uploaded files",
  "dataExport.type.media.sub":
    "Your photos and images. The files themselves come with the CSV and Both formats, which arrive as a zip. JSON lists them without the files.",
  "dataExport.type.nowHistory.label": "Now history",
  "dataExport.type.nowHistory.sub":
    "Every Now status you had before your current one",
  "dataExport.type.membershipCards.label": "Membership cards",
  "dataExport.type.membershipCards.sub":
    "Cards you hold for the communities you belong to, and when each was checked at a door",
  "dataExport.type.reports.label": "Reports you filed",
  "dataExport.type.reports.sub":
    "What you reported, why, where each report stands, and the appeals you filed",

  // ── DataExportSections.tsx — DataExportStatus ────────────────────────────
  "dataExport.status.ready.title": "Your archive is ready",
  "dataExport.status.ready.body":
    "It's ready to download now. Nothing was emailed. This stays between you and this page.",
  "dataExport.status.ready.bodyWithExpiry":
    "It's ready to download now. Nothing was emailed. We'll keep it here until <strong>{date}</strong>, then clear it out.",
  "dataExport.status.expired.title": "That link has expired",
  "dataExport.status.expired.body":
    "We don't keep archives around indefinitely. Ask again and we'll build you a fresh one.",
  "dataExport.status.failed.title": "That didn't work",
  "dataExport.status.failed.body":
    "We couldn't build your archive just now. Nothing left your account. Try again in a moment.",
  "dataExport.status.retry": "Request again",
  "dataExport.status.building.title": "Building your archive",
  "dataExport.status.building.body":
    "We're gathering your data and packaging it up. This only takes a moment. Stay on this page and your archive will be ready to download right here.",
  "dataExport.status.download": "Download {filename}",

  // ── DataExportSections.tsx — DataExportIncluded ──────────────────────────
  "dataExport.included.title": "What's <em>included</em>",
  "dataExport.included.sub":
    "Everything your archive can contain, grouped by what it covers.",

  // ── dataExport.data.ts — ACCORDION_ITEMS ─────────────────────────────────
  "dataExport.accordion.profile.title": "Profile & identity",
  "dataExport.accordion.profile.body":
    "Your email, name, pronunciation, pronouns, tagline, bio in English and Portuguese, location, profile photo, identities and tags (including which are discoverable), what you're not here for, who can see your profile, when you onboarded, and who invited you (by id). Your current Now status and every one before it, every persona you have, including unlinked and shared ones, the endorsements, follows and invites tied to them, and the items, social links and affiliations on personas you own. Your profile sections (skills, links, work, what shaped you, featured communities, groups and image crops), your @handle history, the board posts and responses you left, your verification levels and requests with their history of changes, any staff roles you hold, the application you submitted to join if it predates your account, and your privacy and safety settings.",
  "dataExport.accordion.messages.title": "Messages",
  "dataExport.accordion.messages.bodyDetailed":
    'Every message you sent, with the conversation it belongs to, its type, any attachment, and whether it was a reply or a forward. For each conversation where you reported a message or a person, the archive also keeps that thread\'s messages from everyone in it, so you hold your own copy of what happened. Very long histories keep the newest messages and are marked as truncated. Members who deleted their account appear as "Former member". Your reactions and stars on messages, the messages you hid for yourself, the group chat invites you sent and received, and whether your name shows on replies you send from a business mailbox.',
  "dataExport.accordion.connections.title": "Connections",
  "dataExport.accordion.connections.body":
    "Every connection request you sent or received, with its status, any message sent with it, and when it was answered. Vouches you gave and received, with their notes. Other members appear by their id only, because their details are theirs to share. The private notes you keep on your connections, and the platform invites you sent, with your note and vouch.",

  // ── dataExport.data.ts — shared accordion tag dictionary ─────────────────
  "dataExport.accordion.posts.title": "Forum and community posts",
  "dataExport.accordion.posts.body":
    "Every forum thread you started and every reply you wrote. Every community you run, with the purpose, rules and welcome message you wrote for it. Every post and reply you wrote in any community, including ones that were later removed, with the date they came down. Your votes on forum replies and polls, the threads you follow, earlier versions of your own posts, threads you co-wrote, and the polls run on threads you started. Every community you belong to, with your role, notification level and join date. Your reactions to community posts, the invites you sent and received, resources you added, and earlier versions of your own community posts and replies. Requests you sent a community or the platform team (to join, to switch on a space, a new tag, or a reading-group proposal, among others), the communities and threads you turned down in your feed, and the topics you follow.",
  "dataExport.accordion.gatherings.title": "Events and Go together",
  "dataExport.accordion.gatherings.body":
    "Events you hosted, with their details, and every RSVP you made, with its status and any waitlist place. Your Go together questionnaire, the events you opted into, the answers you gave about the people and groups you met, and your private Not for me choices. What you told the host with each RSVP (guests, access and dietary needs, pronouns, and your custom answer), events you bookmarked, co-host or appear on the lineup of, event invites you sent and received, announcements you sent as a host, captions on photos you uploaded, the recurring series you run, and your event settings (reminder lead time, default visibility and event emails).",
  "dataExport.accordion.safety.title": "Safety: blocks, mutes and reports",
  "dataExport.accordion.safety.body":
    "The members, personas and businesses you blocked, and when. The members you muted, hid or asked to stop being suggested to you. Every report you filed: what it was about, the reason you picked, the words you wrote, where it stands, and its dates. The appeals you filed against a moderation decision, with your argument and the decision you received. Who blocked you stays private to them, and moderators' internal notes stay with the moderation team.",
  "dataExport.accordion.housing.title": "Housing, groups and landlords",
  "dataExport.accordion.housing.body":
    "Housing listings you posted, your flatmate profile in full, the flatmate profiles you liked or passed on, viewings you asked for and viewings on your own listings, your saved housing searches, and your requests to join housing groups and co-ops. On viewings of your listings, the person asking appears by id only. The listings you posted to a housing group, with where each stands. The landlord introductions you asked for, with the name, note and contact email you gave and the team's reply, and the landlords you submitted to the directory.",
  "dataExport.accordion.writing.title": "Magazine writing and reviews",
  "dataExport.accordion.writing.body":
    "Your magazine articles and drafts in full, the stories you submitted with the desk's decision on each, and the pieces you were assigned to write. Every review you wrote of a local listing, an employer or a housing viewing, with any reply the listing's owner posted. Comments you left under articles and in the editorial margin, messages you sent on a desk piece, the pitches and writer applications you sent with the desk's reply, and the articles you translated. The payments for pieces you wrote, and where each stands. The landlord recommendations you wrote, with any reply the landlord posted, and your resource guide ratings and the suggestions you sent, with the team's reply.",
  "dataExport.accordion.participation.title":
    "Volunteering, governance and membership cards",
  "dataExport.accordion.participation.body":
    "Volunteering roles you signed up for and what came of each. Your votes, each with the proposal it was on, and the proposals you put forward. The membership cards you hold, with their community and status. Proposals you co-signed, roadmap ideas you submitted, your roadmap comments and votes, the changemakers you nominated, and the forms you sent the team. Roles you posted for others to volunteer for, the opportunity teams you sit on, and the commissions you showed interest in. Each time one of your cards was checked at a door, with the event and the result.",
  "dataExport.accordion.activity.title":
    "Activity, saved items and notifications",
  "dataExport.accordion.activity.body":
    "The moments your activity feed recorded, like posts, events and readings. Everything you saved, with a link back to it. Your notification history, whether you read each one, and your notification settings. The lists you sorted your saved items into, the collections you made, and your unfinished drafts. The times you deactivated your account, the deletion requests you made, and the data-rights requests you filed. The badges you earned, whether you hid each from your profile, the perks you claimed, and every entry in your XP ledger. How far you got into each cinema title, and when a watch counted as a view.",
  "dataExport.accordion.consent.title": "Consent and policy acceptances",
  "dataExport.accordion.consent.body":
    "Every choice you made about analytics and error monitoring, with the policy version and when you made it. The Terms and Community Guidelines versions on your account, and every acceptance we recorded, with its date.",
  "dataExport.accordion.media.title": "Uploaded files",
  "dataExport.accordion.media.body":
    "A list of every file you uploaded, like photos and the images and documents you sent in messages, with each one's size and date. The files themselves come with the CSV and Both formats, which arrive as a zip. A very large collection is capped, and the archive lists anything left out.",
  "dataExport.tag.email": "email",
  "dataExport.tag.personas": "personas",
  "dataExport.tag.nowHistory": "past Now statuses",
  "dataExport.tag.threads": "threads",
  "dataExport.tag.communitiesYouRun": "communities you run",
  "dataExport.tag.communityPosts": "community posts",
  "dataExport.tag.hostedEvents": "events you hosted",
  "dataExport.tag.goTogether": "Go together",
  "dataExport.tag.vouches": "vouches",
  "dataExport.tag.reportsFiled": "reports you filed",
  "dataExport.tag.housingListings": "housing listings",
  "dataExport.tag.flatmateProfile": "flatmate profile",
  "dataExport.tag.viewings": "viewings",
  "dataExport.tag.joinRequests": "join requests",
  "dataExport.tag.directoryListings": "directory listings",
  "dataExport.tag.articles": "articles",
  "dataExport.tag.drafts": "drafts",
  "dataExport.tag.submissions": "submissions",
  "dataExport.tag.reviews": "reviews",
  "dataExport.tag.volunteering": "volunteering",
  "dataExport.tag.votes": "votes",
  "dataExport.tag.proposals": "proposals",
  "dataExport.tag.membershipCards": "membership cards",
  "dataExport.tag.activityFeed": "activity feed",
  "dataExport.tag.savedItems": "saved items",
  "dataExport.tag.privacyChoices": "privacy choices",
  "dataExport.tag.policyAcceptances": "policy acceptances",
  "dataExport.tag.photos": "photos",
  "dataExport.tag.fileList": "file list",
  "dataExport.accordion.devices.title": "Sign-ins and devices",
  "dataExport.accordion.devices.body":
    "Every sign-in session on your account: the device and browser it ran on, when it started, when it was last used, and when it expired or was signed out. The devices you get push notifications on, with the device name and dates. Sign-in tokens and push keys stay out of the archive, because they would let someone act as you.",
  "dataExport.tag.mutedMembers": "muted members",
  "dataExport.tag.hiddenMembers": "hidden members",
  "dataExport.tag.flatmateLikes": "flatmate likes and passes",
  "dataExport.tag.savedSearches": "saved searches",
  "dataExport.tag.notificationSettings": "notification settings",
  "dataExport.tag.signInSessions": "sign-in sessions",
  "dataExport.tag.pushDevices": "push devices",
  "dataExport.accordion.listings.title":
    "Directory listings, safe spaces and work",
  "dataExport.accordion.listings.body":
    "Directory listings you own or help manage, with your ownership claims, edit suggestions, co-manager seats, ownership offers with the team's note, enquiries and public questions you asked or answered, helpful votes you gave, and your unfinished listing drafts. Safe-space nominations you made, with the team's reply, flags you raised, and vouches you gave. Your barter listings and proposals, and the companies, jobs, job applications and partner ties you're part of.",
  "dataExport.tag.profileSections": "profile sections",
  "dataExport.tag.handles": "@handle history",
  "dataExport.tag.board": "board posts",
  "dataExport.tag.verification": "verification",
  "dataExport.tag.privacySettings": "privacy and safety settings",
  "dataExport.tag.joinApplication": "your original application",
  "dataExport.tag.staffRoles": "staff roles",
  "dataExport.tag.reactionsAndStars": "reactions and stars",
  "dataExport.tag.votesAndFollows": "votes and follows",
  "dataExport.tag.communityRoles": "community roles",
  "dataExport.tag.feedChoices": "feed choices",
  "dataExport.tag.rsvpDetails": "RSVP details",
  "dataExport.tag.eventSettings": "event settings",
  "dataExport.tag.connectionNotes": "notes on your connections",
  "dataExport.tag.invitesSent": "invites you sent",
  "dataExport.tag.dismissedSuggestions": "dismissed suggestions",
  "dataExport.tag.appeals": "appeals you filed",
  "dataExport.tag.groupListings": "group listings",
  "dataExport.tag.landlordIntros": "landlord introductions",
  "dataExport.tag.safeSpaces": "safe-space nominations",
  "dataExport.tag.barter": "barter posts",
  "dataExport.tag.work": "companies and jobs",
  "dataExport.tag.magazineContributions": "magazine contributions",
  "dataExport.tag.magazinePayments": "payments for your writing",
  "dataExport.tag.landlordRecommendations": "landlord recommendations",
  "dataExport.tag.resourceFeedback": "resource guide feedback",
  "dataExport.tag.roadmapAndNominations": "roadmap ideas and nominations",
  "dataExport.tag.cardScans": "card scans",
  "dataExport.tag.volunteerRoles": "roles you posted",
  "dataExport.tag.listsAndCollections": "lists and collections",
  "dataExport.tag.accountRequests": "account and data requests",
  "dataExport.tag.badgesAndXp": "badges and XP",
  "dataExport.tag.watchHistory": "watch history",
  "dataExport.tag.name": "name",
  "dataExport.tag.pronouns": "pronouns",
  "dataExport.tag.bio": "bio",
  "dataExport.tag.photo": "photo",
  "dataExport.tag.content": "content",
  "dataExport.tag.timestamps": "timestamps",
  "dataExport.tag.attachments": "attachments",
  "dataExport.tag.replies": "replies",
  "dataExport.tag.rsvps": "RSVPs",
  "dataExport.tag.connections": "connections",
  "dataExport.tag.blockedList": "blocked list",
  "dataExport.tag.notifications": "notifications",
  "dataExport.tag.dates": "dates",
  "dataExport.tag.reportedThreads": "reported threads",
  "dataExport.demoArchiveNote":
    "Demo export generated in-browser. No personal data left this device.",

  // ── SaveButton.tsx — reusable save control, shared across several panes ──

  // ── AccessibilityPrefSections.tsx — the accessibility pane's rows.
  // Every row here is applied. PRD-307 removed the seven that were badged
  // coming soon and rendered inert (high contrast, larger-text boolean,
  // dyslexia font, pause decorative, larger tap targets, sticky nav, colour
  // theme), along with their keys, and built the text-size slider. ─────────
  // Shown under each preference, so the absence of a save bar on this pane
  // reads as intent rather than a bug.
  "a11y.instantSaveHint": "Saved to this device the moment you change it.",
  "a11y.section.display.eyebrow": "Display",
  "a11y.section.display.desc":
    "Text size applies across the whole platform, scaling every heading, label and paragraph together.",
  "a11y.textSize.label": "Text size",
  // Single braces for interpolation. The percentage is also the slider's
  // aria-valuetext, so a screen reader announces "110%" rather than "110".
  "a11y.textSize.value": "{percent}%",
  "a11y.textSize.preview":
    "The quick brown fox crossed Príncipe Real and found a community waiting on the other side.",
  "a11y.section.motion.eyebrow": "Motion",
  "a11y.section.motion.desc":
    "Control animations and transitions across the platform.",
  "a11y.toggle.reduceMotion.title": "Reduce motion",
  "a11y.toggle.reduceMotion.desc":
    "Disables animations, transitions, and pulse effects across the platform.",
  "a11y.preview.liveLabel": "Live preview",
  "a11y.preview.cardText":
    "This card animates on load. Toggle motion settings to see the effect.",
  "a11y.section.reading.eyebrow": "Reading",
  "a11y.section.reading.desc":
    "Adjust how content is displayed for comfortable reading.",
  "a11y.toggle.wideSpacing.title": "Open out text spacing",
  "a11y.toggle.wideSpacing.desc":
    "Adds space between lines, letters, words and paragraphs, in body text, lists and quotes.",
  "a11y.toggle.focusRings.title": "Always show the focus ring",
  "a11y.toggle.focusRings.desc":
    "Marks the element you are on after every click, tap and key press. Normally the ring appears only when the platform reads your input as keyboard navigation.",
  "a11y.section.interaction.eyebrow": "Interaction",
  "a11y.section.interaction.desc": "Adjust how you interact with the platform.",
  "a11y.toggle.skipLink.title": "Skip to content link",
  "a11y.toggle.skipLink.desc":
    'On by default. Press Tab and a "Skip to main content" link appears at the top, so you can jump straight past the navigation. Turning it off removes that shortcut. The link stays hidden until it\'s focused, so leaving it on costs you nothing.',

  // ── DeleteAccountPage.tsx / DeleteAccountSection.tsx / DeleteAccountSections.tsx
  // — the off-ramp flow. Precision matters (danger zone) — matches the wording
  // already established in DataPane's deactivate/delete cards. `phrase` is a
  // client-only typed-confirmation string (never sent anywhere), so it's safe
  // to translate in full — display and match target resolve from the same key. ─
  "deleteAccount.sidebar.account": "Account",
  "deleteAccount.sidebar.editProfile": "Edit profile",
  "deleteAccount.sidebar.privacy": "Privacy",
  "deleteAccount.sidebar.dangerZone": "Danger zone",
  "deleteAccount.sidebar.deactivateAccount": "Deactivate account",
  "deleteAccount.page.title": "Leaving <em>QueerPulse?</em>",
  "deleteAccount.page.sub":
    "We're sorry to see you go. Before you decide, choose the option that fits your situation.",
  "deleteAccount.pending.title": "Deletion <em>scheduled.</em>",
  "deleteAccount.pending.sub":
    "You asked us to delete your account. Here's where that stands.",
  "deleteAccount.pauseStrip.text":
    "Not sure? You can <strong>turn the volume down</strong> instead. Choose which notifications reach you, and set quiet hours so your phone stays still overnight. You keep your place here, with less noise in it.",
  "deleteAccount.pauseStrip.cta": "Choose your notifications",
  "deleteAccount.whatHappens.title.deactivate":
    "What happens when you deactivate",
  "deleteAccount.whatHappens.title.delete": "What happens when you delete",
  "deleteAccount.confirm.typeLabel":
    'Type <strong>"{phrase}"</strong> to confirm',
  "deleteAccount.confirm.cancelBtn": "Cancel",
  "deleteAccount.pending.cancelling": "Cancelling…",
  "deleteAccount.pending.cancelBtn": "Cancel deletion",
  "deleteAccount.toast.cancelled": "Deletion cancelled. Welcome back.",
  "deleteAccount.toast.cancelError":
    "We couldn't cancel that just now. Try again.",

  // ── Step-up re-authentication (useReauthToken.ts) ────────────────────────
  // Deliberately says only what just happened, and leaves what comes next to
  // each surface. The data export resumes itself on landing (PRD-305), while
  // deactivation, deletion and the DSAR still want a second press, so a single
  // "press confirm again" was wrong on one of the four.
  "reauth.completion.success": "You're re-authenticated.",
  "reauth.completion.failed": "We couldn't confirm that was you. Try again.",
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
    "Your <strong>profile is hidden</strong> immediately. No other member can find or view it.",
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
    "Messages you sent <strong>are deleted from all conversations</strong>. Recipients lose them too.",
  "deleteAccount.wh.delete.postsRemoved":
    "Posts and replies you wrote in communities stay up with your name removed. Your forum posts are <strong>permanently removed</strong>. Threads you started stay open without your name wherever other members replied or you credited a co-author, so their words stay readable.",
  "deleteAccount.wh.delete.emailSuppressed":
    "Your email address is <strong>added to a suppression list</strong> so we don't accidentally re-create your account.",
  "deleteAccount.wh.delete.exportFirst":
    "You can request a <strong>data archive before deleting</strong>. Do that first.",
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
    "We couldn't complete this just now. Nothing was changed. Check your connection and try again, or come back in a moment.",
  "destructiveFlow.error.close": "Close",
  "destructiveFlow.error.tryAgain": "Try again",
  "destructiveFlow.confirm.notNow": "Not now",
  "destructiveFlow.deactivate.eyebrow": "Deactivate account",
  "destructiveFlow.deactivate.title": "Hide your profile <em>for now?</em>",
  "destructiveFlow.deactivate.body":
    "Your profile becomes invisible and notifications stop. <strong>Nothing is deleted</strong>. Sign back in any time and you pick up exactly where you left off.",
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
    "Your account is scheduled for deletion. You have <strong>30 days</strong> to change your mind. Just sign back in with Google and we'll stop the erasure. After that, your data is permanently erased. Take care of yourself.",

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
  "themeStudio.previewHintTop":
    "Updates live as you pick a theme. Saved to this browser as a preview. It isn't shown on your public profile yet.",
  "themeStudio.profileCardLabel": "Profile card",
  "themeStudio.directoryCardLabel": "Directory card",
  "themeStudio.directoryHint":
    "This is how your profile appears in search results and the member directory.",
  "themeStudio.memberSince": "Lisbon · Member since {year}",
  // Both halves come from code: the number from `PREVIEW_LEVEL`, the name
  // from `levelNameKeyFor(4)`. It used to be a fourth hand-written copy of a
  // ladder word, which meant a PT reader saw an English one.
  "themeStudio.levelPreview": "Lv.{level} · {name}",
  "themeStudio.cover.stripe": "Bold stripe",
  "themeStudio.pattern.none": "Solid",
  "themeStudio.pattern.stripe": "Diagonal stripes",
  "themeStudio.pattern.dots": "Dot grid",
  "themeStudio.pattern.grid": "Grid",

  // ── AccountDataSheet.tsx — the profile's "Your data" sheet, which now
  // signposts the one page that owns each account-lifecycle action instead of
  // building a second copy of all four. PRD-09. ───────────────────────────
  "accountData.download.title": "Download your data",
  "accountData.download.desc":
    "Pick what to include and get a machine-readable archive of it. GDPR Article 20.",
  "accountData.download.cta": "Open data export",
  "accountData.stepAway.title": "Pause or delete your account",
  "accountData.stepAway.desc":
    "Hide your profile for a while, or ask for everything to be erased. Both take a typed confirmation and a fresh sign-in with Google. GDPR Article 17.",
  "accountData.stepAway.cta": "Open pause and delete",
  "accountData.dsar.title": "Make a data request",
  "accountData.dsar.desc":
    "Ask what we hold about you, have something corrected, or object to how it is used. GDPR Articles 15, 16 and 21.",
  "accountData.dsar.cta": "Open the request form",
  "accountData.note":
    "Each of these opens as a full page, so you can read exactly what it does before you commit to anything.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-48-FE — PRD-48 - the member's own submissions index at /account/submissions (MySubmissionsPage), plus the Settings > Account card that leads to it. Three intakes on one page: partner applications, swap proposals sent, resource suggestions. Each keeps its own status vocabulary on purpose. `resource.status.archived` is queue tidying rather than a verdict, so its copy must never read as a refusal. Nothing here may promise an email: QueerPulse sends none.
  "account.submissions.title": "Things you sent in",
  "account.submissions.desc":
    "Partner applications, swap proposals and resource suggestions, each with where it stands and what was decided.",
  "account.submissions.cta": "Open your submissions",
  "mySubmissions.backToAccount": "Account",
  "mySubmissions.eyebrow": "Your account · Submissions",
  "mySubmissions.h1": "What you <em>sent in</em>, and what came of it.",
  "mySubmissions.lead":
    "Everything you have submitted for someone to look at, and where each one stands. Answers land here and in your notifications. QueerPulse sends no email, so this page is where a decision stays once you have cleared the bell.",
  "mySubmissions.footNote":
    "Only submissions that go to a review queue appear here. Posts, gatherings and listings you publish yourself go live straight away, so there is nothing to wait on.",
  "mySubmissions.emptyAll.title": "You have not sent anything in yet",
  "mySubmissions.emptyAll.description":
    "Apply to list an organisation as a partner, propose a swap on the skill exchange, or suggest an entry for the resources directory, and it will appear here with its answer.",
  "mySubmissions.row.sentOn": "Sent {date}",
  "mySubmissions.row.decidedOn": "Answered {date}",
  // PRD-263: route an approved partner to its own profile editor.
  "mySubmissions.partner.manageProfileCta": "Manage your partner profile",
  "mySubmissions.partner.heading": "Partner applications",
  "mySubmissions.partner.kind": "Partner application",
  "mySubmissions.partner.status.pending": "With the partnerships team",
  "mySubmissions.partner.status.approved": "Approved",
  "mySubmissions.partner.status.rejected": "Not approved",
  "mySubmissions.partner.noteLabel": "From the partnerships team",
  "mySubmissions.partner.noReason": "No reason was recorded for this one.",
  "mySubmissions.partner.empty.title": "No partner applications",
  "mySubmissions.partner.empty.description":
    "You have not applied to list an organisation as a QueerPulse partner.",
  "mySubmissions.partner.error.title":
    "We could not load your partner applications",
  "mySubmissions.partner.error.description":
    "The rest of this page still works. Try this section again.",
  "mySubmissions.barter.heading": "Swap proposals you sent",
  "mySubmissions.barter.kind": "Swap proposal",
  "mySubmissions.barter.status.pending": "With the poster",
  "mySubmissions.barter.status.accepted": "Accepted by the poster",
  "mySubmissions.barter.status.declined": "Turned down by the poster",
  "mySubmissions.barter.listingGone": "This swap is no longer on the board",
  "mySubmissions.barter.editedAfter":
    "The poster changed this swap after your offer went out, so it may not read the way it did when you proposed.",
  "mySubmissions.barter.link": "Open your swaps",
  "mySubmissions.barter.empty.title": "No swap proposals",
  "mySubmissions.barter.empty.description":
    "You have not offered a swap on anyone else's listing yet.",
  "mySubmissions.barter.error.title": "We could not load your swap proposals",
  "mySubmissions.barter.error.description":
    "The rest of this page still works. Try this section again.",
  "mySubmissions.resource.heading": "Resources you suggested",
  "mySubmissions.resource.kind": "Resource suggestion",
  "mySubmissions.resource.status.pending": "Waiting for review",
  "mySubmissions.resource.status.approved": "Added to the directory",
  "mySubmissions.resource.status.declined": "Not added",
  "mySubmissions.resource.status.archived": "Closed with no decision",
  "mySubmissions.resource.archivedNote":
    "Nobody turned this down. The queue closed it without a verdict either way, usually because the resource is already listed or the suggestion had gone out of date.",
  "mySubmissions.resource.noteLabel": "From the reviewer",
  "mySubmissions.resource.noReason": "No reason was recorded for this one.",
  "mySubmissions.resource.empty.title": "No resource suggestions",
  "mySubmissions.resource.empty.description":
    "You have not suggested an entry for the resources directory yet.",
  "mySubmissions.resource.error.title":
    "We could not load your resource suggestions",
  "mySubmissions.resource.error.description":
    "The rest of this page still works. Try this section again.",

  // ── Deep-scan section 6 (Gatherings), built 2026-09-06 ────────────────────
  // PRD-186 — how long before a gathering its reminder fires. The backend has
  // stored this per member since reminders were built and no frontend ever
  // read it, so everyone sat on the default day-before lead while the choice
  // the server already held was unreachable. Sits under the "Event reminders"
  // switch it qualifies.
  "notifications.reminderLead.title": "Remind me",
  "notifications.reminderLead.desc":
    "How long before a gathering starts. Only applies while event reminders are on.",
  "notifications.reminderLead.option.60": "An hour before",
  "notifications.reminderLead.option.1440": "A day before",
  "notifications.reminderLead.option.10080": "A week before",

  // ── Deep-scan section 12 (PRD-308), built 2026-09-06 ──────────────────────
  // SessionsPage.tsx — "sign out everywhere" as one act. The page already had
  // a control that ends the OTHER devices; a member who believes someone else
  // is in their account also had to find the sign-out item in the account
  // menu, and knowing to do both was left to them. The two controls now sit
  // side by side and the copy names the difference outright, since "all" and
  // "other" are one word apart and read the same when you are frightened.
  "sessions.bulk.signOutOthers": "Sign out the other devices",
  "sessions.bulk.signOutEverywhere": "Sign out everywhere",
  "sessions.everywhere.confirmTitle": "Sign out on every device?",
  "sessions.everywhere.confirmBody":
    "This ends every session on your account, this device included, so you will be signed out here as soon as you confirm. Sign back in with Google whenever you are ready. Nothing on your account is deleted.",
  "sessions.everywhere.confirmCta": "Sign out everywhere",
  "sessions.toast.signedOutEverywhere": "Signed out on every device",
  "sessions.toast.signedOutEverywhereError":
    "We could not sign you out everywhere just now. You are still signed in, so try again.",

  // Go together.
  "dataExport.type.goTogether.label": "Go together answers",
  "dataExport.type.goTogether.sub":
    "Your friendship questionnaire answers and host question replies",
};

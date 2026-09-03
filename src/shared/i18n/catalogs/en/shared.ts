import type { Catalog } from "../../types";

/**
 * Shared chrome for `src/shared/components/` + `src/app/`: the platform frame
 * that renders on every route (nav rails, mega-nav, footer, modals, toasts,
 * error/loading fallbacks, consent, quick exit, admin shell). `common`, `nav`,
 * and `footer` already hold some of this chrome — this namespace reuses those
 * keys (via their own `common:`/`nav:`/`footer:` prefix) wherever the exact
 * text already exists there, and only adds what those don't cover.
 */
export const shared: Catalog = {
  // Brand wordmark ("Queer" + italic "Pulse"), reused everywhere the mark
  // renders outside the main Navbar/Footer link text (Navbar/Footer/AppNav/
  // AdminSidebar/Sidebar/SystemStateShell/AuthLoader/RoomLoader all render this
  // exact mark). Never translated — the tag placeholder just carries the
  // italic styling.
  "appLaunch.ariaLabel": "Opening QueerPulse",
  "appLaunch.tagline": "A queer network, rooted in Lisbon",
  "appLaunch.greeting": "{greeting}, <em>{name}</em>",
  "appLaunch.stillConnecting": "Still connecting…",
  "appLaunch.offline": "You're offline. Showing your saved feed.",
  "brand.wordmark": "Queer<em>Pulse</em>",

  // Generic loading label shared by Suspense/auth fallbacks.
  "loading.label": "Loading…",

  // Consent banner (spec 07) — ConsentBanner.tsx
  "consent.banner.ariaLabel": "Cookie and privacy choices",
  "consent.banner.title": "A quiet word about <em>cookies.</em>",
  "consent.banner.body":
    "We only store what keeps you logged in and safe by default. Error reporting stays off unless you say yes: no ads, no analytics, no profiling, ever. Change your mind any time in settings. <a>Read the policy</a>.",

  // Consent actions, shared by the banner and the preference center
  "consent.actions.rejectNonEssential": "Reject non-essential",
  "consent.actions.choose": "Choose",
  "consent.actions.accept": "Accept",
  "consent.actions.saveChoices": "Save choices",

  // Consent preference center — ConsentPreferences.tsx
  "consent.preferences.eyebrow": "Privacy",
  "consent.preferences.title": "Your <em>choices.</em>",
  "consent.preferences.sub":
    "Necessary cookies keep you logged in and safe. They're always on. Everything else is up to you, and you can change it any time.",
  "consent.preferences.necessary.title": "Strictly necessary",
  "consent.preferences.necessary.desc":
    "Your session and CSRF cookies, plus theme and language stored on your device. Required to run the platform. Never used to track you.",
  "consent.preferences.necessary.alwaysOnAria": "Always on",
  "consent.preferences.rows.monitoring.title": "Error & crash reporting",
  "consent.preferences.rows.monitoring.desc":
    "Automatic diagnostics when something breaks, so we can fix it faster. Carries no advertising or profiling data.",

  // Feedback: AuthLoader / RouteFallback / ErrorFallback / RoomLoader
  "feedback.errorFallback.title": "Something broke on our <em>end</em>",
  "feedback.errorFallback.body":
    "Nothing you did caused this, and nothing's lost. Try again, or head back home. We're already looking into it.",
  "feedback.errorFallback.tryAgain": "Try again",
  "feedback.errorFallback.reference": "Reference: {referenceId}",

  // LoadErrorState — the shared "we couldn't load this" panel. Distinct from
  // errorFallback (a crashed boundary): the request failed and is worth
  // retrying, and it must never be rendered as an empty state.
  "loadError.title": "We couldn't load <em>this</em>",
  "loadError.body":
    "The request didn't come back. This one is on us. Try again in a moment.",
  "loadError.retryCta": "Try again",

  "feedback.roomLoader.ariaLabel": "Preparing the room",
  "feedback.roomLoader.title": "Setting up your <em>room</em>",
  "feedback.roomLoader.caption": "Pouring the coffee, dimming the lights…",
  "feedback.roomLoader.steps.signingIn": "Signing you in",
  "feedback.roomLoader.steps.gettingData": "Getting your data",
  "feedback.roomLoader.steps.preparingRoom": "Preparing the room",

  // Auth session-load failure (AuthProvider.tsx sets a code, AuthErrorToast.tsx
  // resolves it — AuthProvider itself sits above I18nProvider in the provider
  // tree, so it cannot call t() directly).
  "auth.error.server":
    "We couldn't load your account. QueerPulse's server hit an error ({status}). It's on us. Try again in a moment.",
  "auth.error.network":
    "We couldn't reach QueerPulse to load your account. Check your connection and try again in a moment.",
  "auth.error.expired":
    "Your session expired. Please sign in again to pick up where you left off.",

  // Provider-level fallback error toasts (ProfileProvider.tsx / SocialProvider.tsx)
  "profile.saveError": "We couldn't save your profile. Please try again.",
  "social.blockError": "We couldn't update that block. Please try again.",
  "social.genericError": "We couldn't update that. Please try again.",

  // AppNav (logged-in top bar) — links not already covered by nav:members/nav:communities

  // AccountMenu
  "accountMenu.items.profile": "Profile",
  "accountMenu.items.connections": "Connections",
  // ACQ-08 — the member-minted invite flow's home in the account menu, with a
  // live count of unspent invites attached by `useInviteQuotaBadge`.
  "accountMenu.items.invite": "Invite someone",
  "accountMenu.items.vouch": "Vouch for someone",
  "accountMenu.items.messages": "Messages",
  "accountMenu.items.work": "Work",
  // Personas discovery Phase 5, Moment 3 — the "Your personas" row (badge via
  // usePersonaBadge). Separate from `accountMenu.items.subprofiles` above,
  // which is a pre-existing, differently-worded entry.
  "accountMenu.items.personas": "Your personas",
  "accountMenu.items.events": "Events",
  "accountMenu.items.cards": "Cards",
  "accountMenu.items.drafts": "Drafts",
  "accountMenu.items.pitches": "Pitches",
  "accountMenu.items.saved": "Saved",
  "accountMenu.items.settings": "Settings",
  "accountMenu.items.gettingStarted": "Getting started",
  "accountMenu.items.installApp": "Install the app",
  "accountMenu.items.help": "Help",
  "installAppModal.title": "Install the app",
  "installAppModal.sub":
    "Add QueerPulse to your home screen in a few taps. Same app, no app store.",
  "accountMenu.ariaLabel": "Account menu",
  "accountMenu.header.subtitle": "Profile & account",
  "accountSheet.title": "Your account",
  // ProfileInviteCard — the quiet invite strip at the foot of a member's own
  // profile (ACQ-08). Lives in `shared:` beside `accountMenu.*` because the two
  // are one entry-point pair. Never rendered with nothing left to give, so
  // there is no zero case here.
  "inviteCard.ariaLabel": "Your invites",
  "inviteCard.title_one": "{count} invite left this month",
  "inviteCard.title_other": "{count} invites left this month",
  "inviteCard.body": "Bring in someone you'd want here.",
  "inviteCard.resets_one": "The allowance resets tomorrow.",
  "inviteCard.resets_other": "The allowance resets in {count} days.",
  "inviteCard.resets_zero": "The allowance resets today.",
  "inviteCard.cta": "Invite someone",
  "accountSheet.viewProfile": "View profile",
  "accountMenu.staff.magazineEditor": "Magazine editor",
  "accountMenu.staff.magazineWriter": "Writer workspace",
  "accountMenu.staff.admin": "Admin",
  "accountMenu.mod.modTools": "Mod tools",
  "accountMenu.controls.populatePlatform": "Populate platform",
  "accountMenu.controls.on": "On",
  "accountMenu.controls.off": "Off",
  "accountMenu.controls.noApi": "No API",
  "accountMenu.controls.actingAs": "Acting as",
  "accountMenu.controls.simulatedRoleAria": "Simulated team role",
  "accountMenu.controls.roleStaff": "Staff",
  "accountMenu.controls.roleMod": "Mod",
  "accountMenu.controls.roleMember": "Member",
  "accountMenu.controls.navigation": "Navigation",
  "accountMenu.controls.navigationLayoutAria": "Navigation layout",
  "accountMenu.controls.navTopBar": "Top bar",
  "accountMenu.controls.navSidebar": "Sidebar",

  // AdminRoleSwitcher
  "adminRoleSwitcher.avatarPlaceholderAria": "Account avatar",
  "adminRoleSwitcher.roleStaffAdmin": "Staff admin",
  "adminRoleSwitcher.roleCommunityMod": "Community mod",
  "adminRoleSwitcher.scopeAll": "All communities",
  "adminRoleSwitcher.scopeStewarded": "Stewarded spaces",
  "adminRoleSwitcher.yourRoles": "Your roles",
  "adminRoleSwitcher.staffOversight": "Platform-wide oversight",
  "adminRoleSwitcher.communitiesYouSteward": "Communities you steward",
  "adminRoleSwitcher.toastNowStaff": "Now acting as Staff admin",

  // AdminShell
  "adminShell.toggleTheme": "Toggle theme",
  "adminShell.alerts": "Alerts",
  "adminShell.searchPlaceholder": "Search reports, members, communities…",
  "adminShell.toastSearchIllustrative":
    "Search is illustrative in this prototype",
  "adminShell.toastNoAlerts": "No new alerts",

  // AdminSidebar
  "adminSidebar.badge": "Admin",
  "adminSidebar.navLabel": "Admin sections",
  "adminSidebar.backToPlatform": "Back to platform",

  // AdminAccountMenu — the staff account control at the foot of the rail.
  // "Your access" summarises the account tier plus any additive staff grants;
  // for an admin the grants are the whole catalogue, so it reads "Every admin
  // area" instead of listing them.
  "adminSidebar.account.accessHeading": "Your access",
  // Only the "member" tier needs its own key: the admin/moderator labels are
  // reused from `adminRoleSwitcher.role*` so the rail's two ends never drift.
  "adminSidebar.account.tierMember": "Member",
  "adminSidebar.account.allAreas": "Every admin area",
  "adminSidebar.account.profile": "My profile",
  "adminSidebar.account.settings": "Account settings",
  "adminSidebar.account.sessions": "Active sessions",

  // adminNav.data.ts — ADMIN_NAV item labels (STEWARDED + ADMIN_PROFILE stay
  // English: in live mode those are the moderator's real communities/role,
  // fetched data, not platform chrome).
  // Collapsible section headings. `pendingSuffix` is visually hidden: it only
  // gives the rolled-up count on a collapsed heading a meaning when read aloud.
  "adminNav.sections.trust": "Trust & safety",
  "adminNav.sections.people": "People & access",
  "adminNav.sections.communities": "Communities",
  "adminNav.sections.directory": "Directory",
  "adminNav.sections.editorial": "Editorial",
  "adminNav.sections.partners": "Partners & recognition",
  "adminNav.sections.site": "Site content",
  "adminNav.sections.platform": "Platform",
  "adminNav.pendingSuffix": "pending",

  "adminNav.items.overview": "Overview",
  "adminNav.items.landing": "Landing page",
  "adminNav.items.pressKit": "Press kit",
  "adminNav.items.moderation": "Moderation",
  "adminNav.items.staff": "Staff & roles",
  "adminNav.items.concerns": "Concerns",
  "adminNav.items.intakes": "Intakes & messages",
  "adminNav.items.safeSpaces": "Safe spaces",
  "adminNav.items.topics": "Topics",
  "adminNav.items.listings": "Listings",
  "adminNav.items.housingListings": "Housing review",
  "adminNav.items.media": "Uploaded images",
  "adminNav.items.invites": "Invites",
  "adminNav.items.changemakerNominations": "Nominations",
  "adminNav.items.commissionInterests": "Commissions",
  "adminNav.items.readingGroupProposals": "Reading groups",
  "adminNav.items.guideFeedback": "Guide feedback",
  "adminNav.items.magazineSubmissions": "Submissions",
  "adminNav.items.writerApplications": "Writer applications",
  "adminNav.items.partnerships": "Partnerships",
  "adminNav.items.verifications": "Verifications",
  "adminNav.items.orgTiers": "Partnership tiers",
  "adminNav.items.resourceGuides": "Resource guides",
  "adminNav.items.resourceListings": "Resource listings",
  "adminNav.items.resourceSuggestions": "Resource suggestions",
  "adminNav.items.communityTagRequests": "Community tag requests",
  "adminNav.items.housingGroups": "Housing groups",
  "adminNav.items.housingCoops": "Housing co-ops",
  // Reused by footer.data.ts BASE_LINKS and navMenus.ts About > Mission column.
  "adminNav.items.governance": "Governance",
  "adminNav.items.roadmap": "Roadmap",
  "adminNav.items.reports": "Reports",
  "adminNav.items.systemAccounts": "System accounts",

  // errorHandling.ts / errorMessage.ts — API failure copy, resolved through
  // setQueryErrorTranslator so non-React modules can stay i18n-aware.
  "apiError.server": "Something went wrong on our end. Please try again.",
  "apiError.forbidden": "You don't have access to that.",
  "apiError.accountRestricted":
    "You can't do that while a moderation restriction is in effect. You can appeal it from your account settings.",
  "apiError.generic": "Something went wrong.",
  "apiError.genericRetry": "Something went wrong. Please try again.",
  "apiError.tryAgainTail": " Please try again.",

  // PullToRefresh live region

  // deviceUserAgent.ts

  // BackToSettingsLink
  "backToSettingsLink.label": "Back to settings",

  // Sidebar (left-rail nav)
  "sidebar.ariaPrimary": "Primary",
  "sidebar.collapseAll": "Collapse all",
  "sidebar.ariaSections": "Sections",

  // SidebarFooter
  "sidebarFooter.collapse": "Collapse",
  "sidebarFooter.expandAria": "Expand sidebar",
  "sidebarFooter.collapseAria": "Collapse sidebar",

  // SkipToContentLink
  "skipToContent.label": "Skip to main content",

  // RouteAnnouncer (app/RouteAnnouncer.tsx) — the polite live region that
  // speaks each route change. Used only when the incoming page names itself
  // neither through <PageMeta> nor through an <h1>.
  "routeAnnouncer.pageLoaded": "Page loaded",

  // Avatar
  "avatar.verified": "Verified member",

  // HubBackLink
  "hubBackLink.backTo": "Back to {label}",

  // Modal / ModalSheet
  "modal.close": "Close",

  // Toast — dismiss (close) affordance on each toast
  "toast.dismiss": "Dismiss",

  // SearchInput
  "searchInput.placeholder": "Search…",
  "searchInput.clearAria": "Clear search",

  // Select — unified searchable dropdown
  // The "Refine" drawer and the active-filter chips under it, shared by
  // every filter bar that keeps its controls behind one toggle.
  "refine.label": "Refine",
  "filters.activeLabel": "Filtered by",
  "filters.clearAll": "Clear all",
  "filters.remove": "Remove filter",
  "select.placeholder": "Select…",
  "select.searchPlaceholder": "Type to filter…",
  "select.noResults": "No matches",
  "select.clear": "Clear selection",
  "select.loading": "Loading…",
  "select.multiSummary": "{count} selected",

  // ComingSoon
  "comingSoon.label": "Coming soon",

  // SuccessPanel
  "successPanel.done": "Done",

  // ConfirmDialog — default footer actions (callers usually pass their own)
  "confirmDialog.cancel": "Cancel",
  "confirmDialog.confirm": "Confirm",

  // SaveButton — visible/aria label for the bookmark toggle
  "saveButton.save": "Save",
  "saveButton.saved": "Saved",

  // Stars — read-only rating accessible label
  "stars.ariaLabel": "{value} out of {max} stars",

  // MemberSelectList — empty search result
  "memberSelect.noResults": "No matches",
  "memberSelect.searching": "Looking...",

  // VisibilityBadge
  "visibilityBadge.open": "Open to connect",
  "visibilityBadge.network": "Network only",
  "visibilityBadge.private": "Private",
  "visibilityBadge.titleTemplate": "Visibility: {label}",

  // StaffBadge
  "staffBadge.admin.long": "QueerPulse Staff",
  "staffBadge.admin.short": "Staff",
  "staffBadge.moderator.long": "QueerPulse Mod",
  "staffBadge.moderator.short": "Mod",
  // Badged staff grants: a member handed one domain of the platform to run.
  // One label each, at both badge sizes, saying plainly what the person
  // decides, because the reader is usually a member whose listing, piece or
  // community they just decided on.
  "staffBadge.grant.magazineEditor": "Magazine Editor",
  "staffBadge.grant.housingModerator": "Housing Moderator",
  "staffBadge.grant.directoryModerator": "Directory Moderator",
  "staffBadge.grant.resourceCurator": "Resource Curator",
  "staffBadge.grant.editorial": "Editorial Team",
  "staffBadge.grant.communities": "Communities Team",

  // ImageSlot
  "imageSlot.placeholder": "Image",

  // MegaNav / MegaNavDrawer / Sidebar — accessible name for the open flyout panel
  "megaNav.panelAria": "{menu} menu",
  "megaNav.footer.accessibility": "Accessibility",
  "megaNav.footer.emergency": "Emergency resources",

  // MegaNav — Community
  "megaNav.community.title": "Community",
  "megaNav.community.subtitle": "People & gathering",
  "megaNav.community.feature.eyebrow": "Community",
  "megaNav.community.feature.title": "Find your people.",
  "megaNav.community.feature.body":
    "A member directory, forums, and gatherings: the everyday connective tissue of the network.",
  "megaNav.community.feature.cta": "Browse members",
  "megaNav.community.featurePublic.eyebrow": "Community",
  "megaNav.community.featurePublic.title": "Organise together.",
  "megaNav.community.featurePublic.body":
    "Campaigns, mutual aid, and volunteer crews: work you can show up for, no invite needed.",
  "megaNav.community.featurePublic.cta": "Get involved",
  "megaNav.community.col.people.head": "People",
  "megaNav.community.col.people.membersDirectory": "Members directory",
  "megaNav.community.col.people.professionalDirectory":
    "Professional directory",
  "megaNav.community.col.people.topics": "Topics",
  "megaNav.community.col.people.dating": "Dating",
  "megaNav.community.col.gather.head": "Gather",
  "megaNav.community.col.gather.events": "Events",
  "megaNav.community.col.organise.activismVolunteering":
    "Activism & Volunteering",
  "megaNav.community.col.organise.changeMakers": "Change Makers",

  // MegaNav — Lisbon
  "megaNav.lisbon.title": "Lisbon",
  "megaNav.lisbon.subtitle": "Discover & living here",
  "megaNav.lisbon.feature.eyebrow": "Lisbon",
  // Reframed (Task 11): the directory is the single browse surface for local
  // spaces (verified badge + `?safe=verified` filter live there now), so this
  // promo is the primary "find a place" CTA — not a duplicate of the safe-spaces
  // copy below.
  "megaNav.lisbon.feature.title": "Find your local spaces.",
  "megaNav.lisbon.feature.body":
    "Bars, clinics, salons, and shops that welcome you: every listing reviewed, with verified spaces clearly badged.",
  "megaNav.lisbon.feature.cta": "Browse local spaces",
  "megaNav.lisbon.featurePublic.eyebrow": "Lisbon",
  // Reframed (Task 11): safe-spaces is the trust hub (how verification works +
  // the delisting wall), not a second directory — this stand-in promo (shown to
  // logged-out visitors when the directory is gated) now sells that explainer
  // instead of repeating "places that welcome you" from the feature above.
  "megaNav.lisbon.featurePublic.title": "How we verify local spaces.",
  "megaNav.lisbon.featurePublic.body":
    "Every listing is reviewed before it earns the verified badge. See how it works, and which spaces have been delisted.",
  "megaNav.lisbon.featurePublic.cta": "See how verification works",
  "megaNav.lisbon.col.discover.head": "Discover",
  // "Local Business directory" — keep this in sync with the global-search
  // entry (search.data.ts), the FeatureHelp title (help.ts), and the PWA
  // manifest shortcut (vite.config.ts), which all name the same page.
  "megaNav.lisbon.col.discover.businessDirectory": "Local Business directory",
  "megaNav.lisbon.col.discover.partners": "Partners",
  "megaNav.lisbon.col.livingHere.head": "Living here",
  "megaNav.lisbon.col.livingHere.housing": "Housing",
  "megaNav.lisbon.col.livingHere.visasResidency": "Visas & Residency",

  // MegaNav — Resources
  "megaNav.resources.title": "Resources",
  "megaNav.resources.subtitle": "Health, safety, library",
  "megaNav.resources.feature.eyebrow": "Support",
  "megaNav.resources.feature.title": "Help when you need it.",
  "megaNav.resources.feature.body":
    "Health, safety, and rights, plus a library to learn at your own pace.",
  "megaNav.resources.feature.cta": "Open the library",
  "megaNav.resources.col.health.head": "Health & safety",
  "megaNav.resources.col.health.mentalHealth": "Mental Health",
  "megaNav.resources.col.health.sexualHealth": "Sexual Health",
  "megaNav.resources.col.health.transHealthcare": "Trans Healthcare",
  "megaNav.resources.col.health.wellbeingHub": "Wellbeing Hub",
  "megaNav.resources.col.safety.safetyGuide": "Safety Guide",
  "megaNav.resources.col.learn.head": "Learn & belong",
  "megaNav.resources.col.learn.resourceLibrary": "Resource Library",
  "megaNav.resources.col.learn.guideIndex": "All guides A–Z",
  "megaNav.resources.col.learn.transNbHub": "Trans & NB Hub",
  "megaNav.resources.col.learn.comingOut": "Coming Out",
  "megaNav.resources.col.learn.familyParenting": "Family & parenting",
  "megaNav.resources.col.learn.forCaregivers": "For caregivers",

  // MegaNav — Culture
  "megaNav.culture.title": "Culture",
  "megaNav.culture.subtitle": "Read, watch, create",
  "megaNav.culture.feature.eyebrow": "The Magazine",
  "megaNav.culture.feature.title": "Read the new issue.",
  "megaNav.culture.feature.body":
    "Essays, interviews, reviews and reportage from the community, published the first of every month.",
  "megaNav.culture.feature.cta": "Open Issue 18",
  "megaNav.culture.col.magazine.head": "The Magazine",
  "megaNav.culture.col.magazine.currentIssue": "Current issue",
  "megaNav.culture.col.magazine.allIssues": "All issues",
  "megaNav.culture.col.magazine.stories": "Stories",
  "megaNav.culture.col.magazine.writeForUs": "Write for us",
  "megaNav.culture.col.screenSound.cinema": "Cinema · queer film",
  "megaNav.culture.col.makers.head": "Makers & Scene",
  "megaNav.culture.col.makers.studio": "Studio · queer music",
  "megaNav.culture.col.makers.platforms": "Platforms",
  "megaNav.culture.col.makers.readingGroups": "Reading Groups",
  "megaNav.culture.col.makers.lisbonScene": "Lisbon scene & radio",

  // MegaNav — Work
  "megaNav.work.title": "Work",
  "megaNav.work.subtitle": "Career & economy",
  "megaNav.work.feature.eyebrow": "Your workspace",
  "megaNav.work.feature.title": "Your Work, in one place.",
  "megaNav.work.feature.body":
    "Track applications, mentors, and grants, and show up to work exactly as yourself.",
  "megaNav.work.feature.cta": "Open your workspace",
  "megaNav.work.col.career.head": "Career",
  "megaNav.work.col.career.yourWork": "Your Work",
  "megaNav.work.col.career.jobBoard": "Job Board",
  "megaNav.work.col.career.mentorship": "Mentorship",
  "megaNav.work.col.career.employerReviews": "Employer Reviews",
  "megaNav.work.col.economy.head": "Economy",
  "megaNav.work.col.economy.skillsExchange": "Skills Exchange",
  "megaNav.work.col.economy.solidarityPricing": "Solidarity Pricing",
  "megaNav.work.col.economy.grants": "Grants",
  "megaNav.work.col.economy.howItWorks": "How our economy works",
  "megaNav.work.col.economy.offerSkill": "Offer a skill",

  // MegaNav — About
  "megaNav.about.title": "About",
  "megaNav.about.subtitle": "The platform & legal",
  "megaNav.about.feature.eyebrow": "About",
  "megaNav.about.feature.title": "What QueerPulse is.",
  "megaNav.about.feature.body":
    "Our mission, how we're governed, and the legal small print.",
  "megaNav.about.feature.cta": "About QueerPulse",
  "megaNav.about.col.mission.head": "Mission & governance",
  "megaNav.about.col.mission.aboutQueerPulse": "About QueerPulse",
  "megaNav.about.col.using.head": "Using QueerPulse",
  "megaNav.about.col.using.helpFaq": "Help & FAQ",
  "megaNav.about.col.using.roadmap": "Roadmap",
  "megaNav.about.col.using.forOrganisations": "For organisations",
  "megaNav.about.col.legal.head": "Legal & press",
  "megaNav.about.col.legal.privacyPolicy": "Privacy Policy",
  "megaNav.about.col.legal.termsOfUse": "Terms of Use",
  // Same route + phrasing as marketing:privacy.related.dataRequestLabel —
  // kept in "shared" (not "marketing") since MegaNav is part of the always-
  // mounted shell and can't wait on a lazy namespace chunk.
  "megaNav.about.col.legal.dataRequest": "Request your data",
  /** LG-01: the published accessibility statement at /policies/accessibility. */
  "megaNav.about.col.legal.accessibility": "Accessibility statement",
  "megaNav.about.col.legal.pressKit": "Press Kit",
  // Reused by footer.data.ts BASE_LINKS.
  "megaNav.about.col.legal.contact": "Contact",

  // footer.data.ts — COLUMNS/BASE_LINKS not already covered by nav:/megaNav:
  // reuse above (heading "Community" reuses megaNav.community.title; heading
  // "Members" + link "Members" reuse nav:members).
  "footerData.col.lisbonLife.head": "Lisbon Life",
  "footerData.col.lisbonLife.housingBoard": "Housing Board",
  "footerData.col.support.head": "Support",
  "footerData.col.support.therapistDirectory": "Therapist Directory",
  "footerData.col.support.legalAid": "Legal Aid",
  "footerData.col.support.hateCrimeGuide": "Hate Crime Resources",
  "footerData.col.support.reportSafety": "Report & Safety",
  "footerData.col.members.guideLibrary": "Guide Library",
  "footerData.base.privacy": "Privacy",
  "footerData.base.cookies": "Cookies",
  "footerData.base.guidelines": "Community guidelines",
  // LG-01. The short legal-row form. The meganav carries the longer
  // "Accessibility statement" under megaNav.about.col.legal.accessibility,
  // the same split as Privacy / Privacy Policy above.
  "footerData.base.accessibility": "Accessibility",
  "footerData.base.security": "Security",
  "footerData.base.imprint": "Legal notice",

  // Shown as an error toast when a live intake-form submission
  // (grant/suggest-edit/sober-host/panel/incubator) fails to reach the backend.
  "intake.errorToast":
    "We couldn't send that just now. Please try again in a moment.",

  // mediaRef.* — category labels for a `MediaReference.type`
  // (shared/media/mediaReferences.ts), read by both the My-uploads pane
  // and the admin media console to describe where an uploaded image is
  // in use.
  "mediaRef.profile-photo": "Profile photo",
  "mediaRef.showcase": "Showcase",
  "mediaRef.story-cover": "Story cover",
  "mediaRef.event-photo": "Event",
  "mediaRef.event-cover": "Event",
  "mediaRef.group-avatar": "Group chat",
  "mediaRef.listing": "Listing",
  "mediaRef.persona-avatar": "Persona",
  "mediaRef.persona-cover": "Persona",
  "mediaRef.persona-item": "Persona",
  "mediaRef.community-post": "Community post",
  "mediaRef.community-cover": "Community",
  "mediaRef.community-avatar": "Community",
  "mediaRef.card-crest": "Members card",
  "mediaRef.card-background": "Members card",
  "mediaRef.cinema-cover": "Cinema title",
  "mediaRef.landlord": "Landlord",
  "mediaRef.company-work": "Company",
  "mediaRef.housing": "Housing",
  "mediaRef.magazine-author": "Magazine author",
  "mediaRef.changemaker": "Changemaker",
  "mediaRef.collection": "Collection",
  "mediaRef.magazine-article": "Magazine article",
  "mediaRef.magazine-deck": "Magazine deck",
  "mediaRef.message-photo": "Conversation",
  "mediaRef.press-contact": "Press contact",

  // calendar.* keys, for the shared APG-compliant Calendar/DatePicker
  // primitive (Calendar.tsx, CalendarCell.tsx, CalendarHeader.tsx,
  // DatePicker.tsx, RangeCalendar.tsx).
  "calendar.chooseDate": "Choose date",
  "calendar.chooseTime": "Choose time",
  "calendar.chooseMonth": "Choose month",
  "calendar.chooseRange": "Choose date range",
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.prevYear": "Previous year",
  "calendar.nextYear": "Next year",
  "calendar.today": "Today",
  "calendar.clear": "Clear",
  "calendar.monthLabel": "Month",
  "calendar.yearLabel": "Year",
  "calendar.startDate": "Start date",
  "calendar.endDate": "End date",
  "calendar.segment.day": "Day",
  "calendar.segment.month": "Month",
  "calendar.segment.year": "Year",
  "calendar.segment.hour": "Hour",
  "calendar.segment.minute": "Minute",
  "calendar.segment.meridiem": "AM/PM",
  "calendar.state.today": "today",
  "calendar.state.selected": "selected",
  "calendar.state.unavailable": "unavailable",
  "calendar.preset.today": "Today",
  "calendar.preset.tomorrow": "Tomorrow",
  "calendar.preset.nextWeek": "Next week",

  // reframe.*: pan/zoom crop control (ImageReframer.tsx, PhotoReframeModal.tsx,
  // useImageReframerState.ts) shown when a member reframes a photo on upload.
  "reframe.title": "Reframe photo",
  "reframe.save": "Save",
  "reframe.cancel": "Cancel",
  "reframe.zoom": "Zoom",
  "reframe.reset": "Reset",
  "reframe.alt": "Photo to reframe",
  "reframe.frame": "Reframe area",
  "reframe.ratio.group": "Aspect ratio",
  "reframe.ratio.original": "Original",
  "reframe.ratio.square": "Square",
  "reframe.ratio.native": "Cover shape",

  // announcement.*: sitewide admin-authored banner (AnnouncementBanner.tsx),
  // mounted in both AppShell and PageShell — shown to every visitor, signed
  // in or not (ADM-25).
  "announcement.dismiss": "Dismiss this announcement",

  // en/shared.ts
  "adminNav.items.housingGroupListings": "Group listings",
  "adminNav.items.landlords": "Landlords",
  "adminNav.items.volunteerHours": "Volunteer hours",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-49 — PRD-49 - the quiet marker on a meganav / mobile drawer / sidebar link whose destination is not launched yet (Cinema, Studio in live mode). Rendered by NavBuildBadge INSIDE the link, so it also becomes the tail of the link's accessible name: 'Cinema Being built'. Keep it short, uppercase-safe and free of any timing promise: it says the thing is under construction, never that it arrives soon or on a date.
  "megaNav.beingBuilt": "Being built",
};

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
  "brand.wordmark": "Queer<em>Pulse</em>",

  // Generic loading label shared by Suspense/auth fallbacks.
  "loading.label": "Loading…",

  // Consent banner (spec 07) — ConsentBanner.tsx
  "consent.banner.ariaLabel": "Cookie and privacy choices",
  "consent.banner.title": "A quiet word about <em>cookies.</em>",
  "consent.banner.body":
    "We only store what keeps you logged in and safe by default. Analytics and error reporting stay off unless you say yes — no ads, no profiling, ever. Change your mind any time in settings. <a>Read the policy</a>.",

  // Consent actions, shared by the banner and the preference center
  "consent.actions.rejectNonEssential": "Reject non-essential",
  "consent.actions.choose": "Choose",
  "consent.actions.accept": "Accept",
  "consent.actions.saveChoices": "Save choices",

  // Consent preference center — ConsentPreferences.tsx
  "consent.preferences.eyebrow": "Privacy",
  "consent.preferences.title": "Your <em>choices.</em>",
  "consent.preferences.sub":
    "Necessary cookies keep you logged in and safe — they're always on. Everything else is up to you, and you can change it any time.",
  "consent.preferences.necessary.title": "Strictly necessary",
  "consent.preferences.necessary.desc":
    "Your session and CSRF cookies, plus theme and language stored on your device. Required to run the platform — never used to track you.",
  "consent.preferences.necessary.alwaysOnAria": "Always on",
  "consent.preferences.rows.analytics.title": "Analytics & usage",
  "consent.preferences.rows.analytics.desc":
    "Anonymous, aggregate patterns — which pages help, which fall flat. No individual tracking, no ad networks. Off unless you turn it on.",
  "consent.preferences.rows.monitoring.title": "Error & crash reporting",
  "consent.preferences.rows.monitoring.desc":
    "Automatic diagnostics when something breaks, so we can fix it faster. Carries no advertising or profiling data.",

  // Feedback: AuthLoader / RouteFallback / ErrorFallback / RoomLoader
  "feedback.errorFallback.title": "Something broke on our <em>end</em>",
  "feedback.errorFallback.body":
    "Nothing you did caused this, and nothing's lost. Try again, or head back home — we're already looking into it.",
  "feedback.errorFallback.tryAgain": "Try again",
  "feedback.errorFallback.reference": "Reference: {referenceId}",

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
    "We couldn't load your account — QueerPulse's server hit an error ({status}). It's on us, not you. Try again in a moment.",
  "auth.error.network":
    "We couldn't reach QueerPulse to load your account. Check your connection and try again in a moment.",
  "auth.error.expired":
    "Your session expired — please sign in again to pick up where you left off.",

  // Provider-level fallback error toasts (ProfileProvider.tsx / SocialProvider.tsx)
  "profile.saveError": "We couldn't save your profile. Please try again.",
  "social.blockError": "We couldn't update that block. Please try again.",
  "social.genericError": "We couldn't update that. Please try again.",

  // AppNav (logged-in top bar) — links not already covered by nav:members/nav:communities
  "appNav.links.home": "Home",
  "appNav.links.subprofiles": "Subprofiles",
  "appNav.links.messages": "Messages",

  // AccountMenu
  "accountMenu.items.profile": "Profile",
  "accountMenu.items.connections": "Connections",
  "accountMenu.items.messages": "Messages",
  "accountMenu.items.applications": "Applications",
  "accountMenu.items.work": "Work",
  "accountMenu.items.subprofiles": "Subprofiles",
  "accountMenu.items.events": "Events",
  "accountMenu.items.feed": "Feed",
  "accountMenu.items.drafts": "Drafts",
  "accountMenu.items.pitches": "Pitches",
  "accountMenu.items.saved": "Saved",
  "accountMenu.items.settings": "Settings",
  "accountMenu.items.help": "Help",
  "accountMenu.ariaLabel": "Account menu",
  "accountMenu.header.subtitle": "Profile & account",
  "accountSheet.title": "Your account",
  "accountSheet.viewProfile": "View profile",
  "accountMenu.staff.magazineEditor": "Magazine editor",
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
  "adminSidebar.oversight": "Oversight",
  "adminSidebar.backToPlatform": "Back to platform",
  "adminSidebar.toastProfile": "Your admin profile",

  // adminNav.data.ts — ADMIN_NAV item labels (STEWARDED + ADMIN_PROFILE stay
  // English: in live mode those are the moderator's real communities/role,
  // fetched data, not platform chrome).
  "adminNav.items.overview": "Overview",
  "adminNav.items.landing": "Landing page",
  "adminNav.items.moderation": "Moderation",
  "adminNav.items.safeSpaces": "Safe spaces",
  "adminNav.items.listings": "Listings",
  "adminNav.items.invites": "Invites",
  "adminNav.items.changemakerNominations": "Nominations",
  "adminNav.items.commissionInterests": "Commissions",
  "adminNav.items.readingGroupProposals": "Reading groups",
  "adminNav.items.magazineSubmissions": "Submissions",
  "adminNav.items.partnerships": "Partnerships",
  "adminNav.items.orgTiers": "Partnership tiers",
  // Reused by footer.data.ts BASE_LINKS and navMenus.ts About > Mission column.
  "adminNav.items.governance": "Governance",
  "adminNav.items.roadmap": "Roadmap",
  "adminNav.items.systemAccounts": "System accounts",

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

  // ImageSlot
  "imageSlot.placeholder": "Image",

  // MegaNav / MegaNavDrawer / Sidebar — accessible name for the open flyout panel
  "megaNav.panelAria": "{menu} menu",

  // MegaNav — Community
  "megaNav.community.title": "Community",
  "megaNav.community.feature.eyebrow": "Community",
  "megaNav.community.feature.title": "Find your people.",
  "megaNav.community.feature.body":
    "A member directory, forums, and gatherings — the everyday connective tissue of the network.",
  "megaNav.community.feature.cta": "Browse members",
  "megaNav.community.featurePublic.eyebrow": "Community",
  "megaNav.community.featurePublic.title": "Organise together.",
  "megaNav.community.featurePublic.body":
    "Campaigns, mutual aid, and volunteer crews — work you can show up for, no invite needed.",
  "megaNav.community.featurePublic.cta": "Get involved",
  "megaNav.community.col.people.head": "People",
  "megaNav.community.col.people.membersDirectory": "Members directory",
  "megaNav.community.col.people.dating": "Dating",
  "megaNav.community.col.gather.head": "Gather",
  "megaNav.community.col.gather.allGatherings": "Gatherings",
  "megaNav.community.col.gather.events": "Events",
  "megaNav.community.col.gather.hostGathering": "Host a gathering",
  "megaNav.community.col.organise.head": "Organise",
  "megaNav.community.col.organise.activismVolunteering":
    "Activism & Volunteering",
  "megaNav.community.col.organise.changeMakers": "Change Makers",

  // MegaNav — Lisbon
  "megaNav.lisbon.title": "Lisbon",
  "megaNav.lisbon.feature.eyebrow": "Lisbon",
  // Reframed (Task 11): the directory is the single browse surface for local
  // spaces (verified badge + `?safe=verified` filter live there now), so this
  // promo is the primary "find a place" CTA — not a duplicate of the safe-spaces
  // copy below.
  "megaNav.lisbon.feature.title": "Find your local spaces.",
  "megaNav.lisbon.feature.body":
    "Bars, clinics, salons, and shops that welcome you — every listing reviewed, with verified spaces clearly badged.",
  "megaNav.lisbon.feature.cta": "Browse local spaces",
  "megaNav.lisbon.featurePublic.eyebrow": "Lisbon",
  // Reframed (Task 11): safe-spaces is the trust hub (how verification works +
  // the delisting wall), not a second directory — this stand-in promo (shown to
  // logged-out visitors when the directory is gated) now sells that explainer
  // instead of repeating "places that welcome you" from the feature above.
  "megaNav.lisbon.featurePublic.title": "How we verify local spaces.",
  "megaNav.lisbon.featurePublic.body":
    "Every listing is reviewed before it earns the verified badge — see how it works, and which spaces have been delisted.",
  "megaNav.lisbon.featurePublic.cta": "See how verification works",
  "megaNav.lisbon.col.discover.head": "Discover",
  // Reframed (Task 11): "Local directory" (was "Business Directory") to match
  // the directory's new role as the single browse surface, and to read the same
  // as the "Local directory" global-search entry (search.data.ts).
  "megaNav.lisbon.col.discover.businessDirectory": "Local directory",
  "megaNav.lisbon.col.discover.partners": "Partners",
  "megaNav.lisbon.col.livingHere.head": "Living here",
  "megaNav.lisbon.col.livingHere.housing": "Housing",
  "megaNav.lisbon.col.livingHere.visasResidency": "Visas & Residency",

  // MegaNav — Resources
  "megaNav.resources.title": "Resources",
  "megaNav.resources.feature.eyebrow": "Support",
  "megaNav.resources.feature.title": "Help when you need it.",
  "megaNav.resources.feature.body":
    "Health, safety, and rights — plus a library to learn at your own pace.",
  "megaNav.resources.feature.cta": "Open the library",
  "megaNav.resources.col.health.head": "Health & safety",
  "megaNav.resources.col.health.mentalHealth": "Mental Health",
  "megaNav.resources.col.health.sexualHealth": "Sexual Health",
  "megaNav.resources.col.health.transHealthcare": "Trans Healthcare",
  "megaNav.resources.col.health.wellbeingHub": "Wellbeing Hub",
  "megaNav.resources.col.safety.safetyGuide": "Safety Guide",
  "megaNav.resources.col.learn.head": "Learn & belong",
  "megaNav.resources.col.learn.resourceLibrary": "Resource Library",
  "megaNav.resources.col.learn.transNbHub": "Trans & NB Hub",
  "megaNav.resources.col.learn.comingOut": "Coming Out",
  "megaNav.resources.col.learn.familyParenting": "Family & parenting",
  "megaNav.resources.col.learn.forCaregivers": "For caregivers",

  // MegaNav — Culture
  "megaNav.culture.title": "Culture",
  "megaNav.culture.feature.eyebrow": "The Magazine",
  "megaNav.culture.feature.title": "Read the new issue.",
  "megaNav.culture.feature.body":
    "Essays, interviews, reviews and reportage from the community — published the first of every month.",
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
  "megaNav.work.feature.eyebrow": "Your workspace",
  "megaNav.work.feature.title": "Your Work, in one place.",
  "megaNav.work.feature.body":
    "Track applications, mentors, and grants — and show up to work exactly as yourself.",
  "megaNav.work.feature.cta": "Open your workspace",
  "megaNav.work.col.career.head": "Career",
  "megaNav.work.col.career.yourWork": "Your Work",
  "megaNav.work.col.career.jobBoard": "Job Board",
  "megaNav.work.col.career.skillsLearning": "Skills & Learning",
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
  "footerData.col.support.reportSafety": "Report & Safety",
  "footerData.col.members.guideLibrary": "Guide Library",
  "footerData.base.privacy": "Privacy",
  "footerData.base.cookies": "Cookies",
  "footerData.base.guidelines": "Community guidelines",
  "footerData.base.accessibility": "Accessibility",
  "footerData.base.security": "Security",
  "footerData.base.imprint": "Legal notice",
};

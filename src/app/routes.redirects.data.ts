import { routes } from "./routeMap";

/**
 * Legacy paths → their new home. Keeps old bookmarks, hardcoded links, and
 * design-prototype hrefs working after the route-grouping restructure.
 * Static paths only — param paths use <ParamRedirect> route entries.
 *
 * Split out of routes.redirects.tsx (which now only exports redirect
 * components) so this table doesn't trip react-refresh/only-export-components.
 */
export const LEGACY_REDIRECTS: [string, string][] = [
  // Account (pre-existing)
  ["/profile", routes.accountProfile],
  ["/badges", routes.badges],
  ["/perks", routes.perks],
  ["/connections", routes.connections],
  ["/collections", routes.collections],
  ["/drafts", routes.drafts],
  ["/settings", routes.settings],
  ["/edit-profile", routes.editProfile],
  ["/security", routes.security],
  ["/sessions", routes.sessions],
  ["/data-export", routes.dataExport],
  ["/delete-account", routes.deleteAccount],
  ["/my-events", routes.myEvents],
  // Section moves appended by Tasks 2–10 below.
  // Magazine
  ["/article", routes.article],
  ["/author", routes.author],
  ["/issue", routes.issue],
  ["/issues", routes.issues],
  ["/story", routes.story],
  ["/story-tomas", routes.storyTomas],
  ["/story-safety", routes.storySafety],
  ["/submit-story", routes.submitStory],
  ["/pitches", routes.pitchTracker],
  // Creatives showcase retired → create a creative subprofile instead.
  ["/creatives", routes.subprofilesDashboard],
  ["/culture", routes.culture],
  // Resources
  ["/wellbeing", routes.wellbeing],
  ["/mental-health", routes.mentalHealth],
  ["/trans-healthcare", routes.transHealthcare],
  ["/harm-reduction", routes.harmReduction],
  ["/sexual-health", routes.sexualHealth],
  ["/sober", routes.sober],
  ["/101", routes.queer101],
  ["/glossary", routes.glossary],
  ["/pronouns-guide", routes.pronounsGuide],
  ["/micro-grants", routes.microGrants],
  ["/intersectionality", routes.intersectionality],
  ["/trans-hub", routes.transHub],
  ["/library", routes.library],
  ["/legal", routes.legal],
  // Safety
  ["/hate-crime", routes.hateCrime],
  ["/report", routes.report],
  ["/block-mute", routes.blockMute],
  ["/appeal-outcome", routes.appealOutcome],
  // Work
  ["/jobs", routes.jobs],
  ["/housing", routes.housing],
  ["/housing-coop", routes.housingCoop],
  ["/skills", routes.skills],
  ["/workshop", `${routes.skills}/risograph-zine`],
  ["/grants", routes.grants],
  ["/barter", routes.barter],
  ["/offer", routes.offer],
  ["/employer-reviews", routes.employerReviews],
  ["/application-status", routes.applicationStatus],
  ["/mentorship", routes.mentorship],
  ["/flatmates", `${routes.housing}?tab=flatmates`],
  // Hub re-parenting (2026-07-06): old full paths → new homes
  ["/work/housing", routes.housing],
  ["/work/housing-coop", routes.housingCoop],
  ["/work/flatmates", `${routes.housing}?tab=flatmates`],
  ["/resources/legal", routes.legal],
  ["/resources/micro-grants", routes.microGrants],
  ["/solidarity", routes.solidarity],
  // Auth
  ["/sign-in", routes.signIn],
  ["/create-account", routes.createAccount],
  ["/invite", routes.invite],
  ["/request-invite", routes.requestInvite],
  ["/onboarding", routes.onboarding],
  // `/welcome` is a legacy alias of the onboarding wizard — send it straight to
  // the canonical path (not the `/auth/welcome` alias, which only redirects here
  // again) so it lands in one hop and under the one-time gate.
  ["/welcome", routes.onboarding],
  ["/welcome-tour", routes.welcomeTour],
  // About
  ["/contact", routes.contact],
  ["/help", routes.help],
  ["/changelog", routes.changelog],
  ["/roadmap", routes.roadmap],
  ["/press-archive", routes.pressArchive],
  ["/press-kit", routes.pressKit],
  ["/for-organisations", routes.forOrganisations],
  ["/platforms", routes.platforms],
  ["/donate", routes.donate],
  ["/volunteer", routes.volunteer],
  // Activism merged into Volunteering: the standalone /activism page is now the
  // "organising guide" nested under Volunteer. Keep the old top-level URL alive.
  ["/activism", routes.activism],
  ["/governance", routes.governance],
  ["/partners", routes.partners],
  // Policies
  ["/privacy", routes.privacy],
  ["/terms", routes.terms],
  ["/dsar", routes.dsar],
  ["/cookies", routes.cookies],
  ["/constitution", routes.constitution],
  ["/code-of-conduct", routes.codeOfConduct],
  ["/transparency-report", routes.transparencyReport],
  ["/accessibility", routes.accessibility],
  ["/guidelines", routes.guidelines],
  // Hub re-parenting (2026-07-05): old paths → new hub-nested homes
  ["/policies/constitution", routes.constitution],
  ["/policies/code-of-conduct", routes.codeOfConduct],
  ["/policies/transparency-report", routes.transparencyReport],
  ["/about/changelog", routes.changelog],
  ["/policies/accessibility", routes.accessibility],
  ["/about/press-archive", routes.pressArchive],
  ["/policies/dsar", routes.dsar],
  // System
  ["/500", routes.serverError],
  ["/maintenance", routes.maintenance],
  ["/offline", routes.offline],
  ["/geo-restricted", routes.geoRestricted],
  ["/pwa-prompt", routes.pwaPrompt],
  ["/account-banned", routes.accountBanned],
  ["/account-locked", routes.accountLocked],
  ["/account-suspended", routes.accountSuspended],
  ["/invite-expired", routes.inviteExpired],
  ["/pending-review", routes.pendingReview],
  ["/verification-needed", routes.verificationNeeded],
  ["/status", routes.status],
  // Communities (2026-08-10): /communities/home merged into /communities.
  ["/communities/home", routes.communities],
  // Local / Lisbon
  ["/safe-spaces", routes.safeSpaces],
  ["/visas", routes.visas],
  ["/arriving", routes.arriving],
  ["/map", routes.map],
  ["/directory", routes.directory],
];

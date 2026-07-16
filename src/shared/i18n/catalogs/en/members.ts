import type { Catalog } from "../../types";

/**
 * Members — the member directory + profile pages: browsing/search/filters,
 * a member's own profile (view + edit), the public-profile opt-in, badges &
 * perks (recognition), collections/saved items, vouching, the QR scanner,
 * and the drafts dashboard.
 *
 * Scope: platform chrome only. Mock member names, bios, pronouns,
 * self-described skills/tags, and the self-declared directory-filter
 * vocabulary (professions, disciplines, identities, neighbourhoods,
 * languages) stay in English — in live mode all of that comes over the wire
 * as somebody's own words or their own structured profile data, never
 * translated. The recognition/gamification domain (badge names, level
 * names, perk copy) is likewise content: it's fetched wholesale via
 * `useRecognition()` in live mode. See `docs/i18n/extraction-brief.md` §1.
 */
export const members: Catalog = {
  // ── Directory card (MemberCardBody) ───────────────────────────────────────
  "card.you": "You",
  "card.vouchCount_one": "{count} vouch",
  "card.vouchCount_other": "{count} vouches",
  "card.mutualsCount_one": "{count} mutual",
  "card.mutualsCount_other": "{count} mutuals",

  // ── Upload pipeline error messages (api/uploadProcessing.ts, api/useUploadImage.ts) ──
  "upload.error.unsupportedType":
    "That image type isn't supported. Use a JPEG, PNG, WebP or GIF.",
  "upload.error.tooLarge":
    "That image is too large — keep it under {maxLabel}.",
  "upload.error.decodeFailed": "We couldn't read that image. Try a different file.",
  "upload.error.tooSmall":
    "This image is too small — it needs to be at least {minWidth} × {minHeight}px.",
  "upload.error.retry": "We couldn't upload that image. Please try again.",

  // ── AvatarEditor ───────────────────────────────────────────────────────────
  "avatar.error.generic": "We couldn't add that photo. Please try again.",
  "avatar.uploading": "Uploading… {percent}%",
  "avatar.change": "Change photo",
  "avatar.add": "Add photo",
  "avatar.remove": "Remove photo",

  // ── WorkItemEditor ─────────────────────────────────────────────────────────
  "workItem.error.generic": "We couldn't add that image. Please try again.",
  "workItem.imagePlaceholder": "Work",
  "workItem.uploading": "Uploading…",
  "workItem.change": "Change",
  "workItem.add": "Add image",
  "workItem.removeImage": "Remove image",
  "workItem.categoryPlaceholder": "Category (e.g. Identity)",
  "workItem.categoryLabel": "Work category",
  "workItem.titlePlaceholder": "Title",
  "workItem.titleLabel": "Work title",
  "workItem.yearPlaceholder": "Year",
  "workItem.yearLabel": "Work year",
  "workItem.remove": "Remove",

  // ── Profile page states (ProfilePage) ──────────────────────────────────────
  "profile.loading": "Loading profile…",
  "profile.blocked.title": "This profile isn't available",
  "profile.blocked.description":
    "You've blocked this member, so their profile is hidden. You can unblock them from your connections at any time.",
  "profile.blocked.manageAction": "Manage blocked members",
  "profile.goBack": "← Go back",
  "profile.notFound.title": "This profile isn't here",
  "profile.notFound.description":
    "It may have been set to private, the member might have left, or this link could be out of date. Nothing's wrong on your end.",
  "profile.notFound.backAction": "Back to Members",
  "profile.backToRoom": "← Back to the room",
  "profile.previewBanner":
    "You're previewing your profile as a <strong>visitor</strong>.",
  "profile.exitPreview": "Exit preview",

  // ── Profile hero (ProfileSections) ─────────────────────────────────────────
  "profile.hero.verifiedBadge": "Verified member",
  "profile.hero.curatorLink": "● Cinema curator — view programming profile →",
  "profile.hero.memberSince": "Member since {since}",
  "profile.hero.location": "{hood}, Lisbon",
  "profile.hero.editCta": "Edit profile",
  "profile.hero.previewCta": "View as visitor",
  "profile.hero.requestIntroCta": "Request an intro",
  "profile.hero.sayHelloCta": "Say hello",
  "profile.hero.vouchedFor": "Vouched for {first}",
  "profile.hero.withdrawVouchCta": "Withdraw vouch",
  "profile.hero.vouchForCta": "Vouch for {first}",
  "profile.hero.recognitionTitle": "Recognition",
  "profile.hero.recognitionSubtitle": "Your level, badges and member perks",
  "profile.hero.levelLabel": "Level {number}",
  "profile.hero.badgesTitle": "Badges & level",
  "profile.hero.badgesDesc": "{earned} earned · {discover} to discover",
  "profile.hero.badgesArrow": "See badges & level →",
  "profile.hero.perksAvailable": "{count} available",
  "profile.hero.perksTitle": "Member perks",
  "profile.hero.perksDesc":
    "Bonuses your level unlocks — early RSVP access, the Trusted Lounge and more.",
  "profile.hero.perksArrow": "Redeem your perks →",

  // ── Profile content sections (ProfileContentSections, WorkEditor) ─────────
  "content.now.title": "Now",
  "content.now.subtitle": "What {first} is in the middle of",
  "content.now.openLabel": "Open to",
  "content.work.title": "Selected work",
  "content.work.subtitle": "A few things, not a portfolio dump",
  "content.board.title": "On the board",
  "content.board.subtitle": "What {first} is asking for and offering right now",
  "content.board.looking": "Looking",
  "content.board.offering": "Offering",
  "content.skills.title": "Skills & offerings",
  "content.skills.subtitle":
    "What {first} can help with — and swap on the barter board",
  "content.skills.barterCta": "See the full barter board →",
  "content.groups.title": "Groups & circles",
  "content.groups.subtitle": "Where {first} shows up in the community",
  "content.shapings.title": "What shaped me",
  "content.shapings.subtitle": "Not interests. Formative texts, films, moments.",
  "content.activity.title": "Recent activity",
  "content.activity.subtitle": "Public moments from around the platform",
  "content.related.title": "Also in the room",
  "content.related.subtitle": "People nearby in craft or neighbourhood",

  // ── Shaping-meta labels + visibility labels (profileSections.data) ─────────
  "shaping.film": "A film",
  "shaping.book": "A book or text",
  "shaping.song": "A song or album",
  "shaping.moment": "A moment",
  "visibility.open": "Open to connect",
  "visibility.network": "Network only",
  "visibility.private": "Private",
  "visibility.hint.open": "Anyone on QueerPulse can say hello.",
  "visibility.hint.network": "Only people you're connected to.",
  "visibility.hint.private": "Members must request an intro first.",

  // ── Profile edit fields (EditableProfileHero, profileEditControls) ────────
  "profileEdit.field.statusVisibility": "Status & visibility",
  "profileEdit.field.name": "Name",
  "profileEdit.field.firstNameLabel": "First name",
  "profileEdit.field.firstPlaceholder": "First",
  "profileEdit.field.lastNameLabel": "Last name",
  "profileEdit.field.lastPlaceholder": "Last",
  "profileEdit.field.pronouns": "Pronouns",
  "profileEdit.field.neighbourhood": "Neighbourhood",
  "profileEdit.field.neighbourhoodPlaceholder": "e.g. Arroios",
  "profileEdit.field.bio": "Bio",
  "profileEdit.field.bioHelp":
    "The longer version, on your profile page. If you leave your short bio empty, your directory card borrows the opening of this.",
  "profileEdit.field.tags": "Tags",
  "profileEdit.field.addSkillPlaceholder": "Add a skill…",
  "profileEdit.field.links": "Links",
  "profileEdit.customPronounPlaceholder": "custom…",
  "profileEdit.customPronounsLabel": "Custom pronouns",
  "profileEdit.addTagPlaceholder": "Add a tag…",
  "profileEdit.addTagLabel": "Add a tag",
  "profileEdit.removeTagLabel": "Remove {tag}",
  "profileEdit.visibilityGroupLabel": "Profile visibility",

  // ── Short bio field (ProfileShortBioField) ─────────────────────────────────
  "profileEdit.shortBio.label": "Short bio",
  "profileEdit.shortBio.help":
    "The line people read in the members directory, before they open your profile.",
  "profileEdit.shortBio.placeholder":
    "A line or two on who you are and what you're around for.",
  "profileEdit.shortBio.counter": "{length} / {max}",
  "profileEdit.shortBio.overLimit": "— your card shows the first two lines",

  // ── Edit bar (ProfileEditBar) ───────────────────────────────────────────────
  "profileEdit.bar.unsaved": "You're editing your profile — unsaved changes",
  "profileEdit.bar.discard": "Discard",
  "profileEdit.bar.saving": "Saving…",
  "profileEdit.bar.tryAgain": "Try again",
  "profileEdit.bar.save": "Save profile",
  "profileEdit.bar.savedBanner": "Saved. <strong>Your profile is live.</strong>",

  // ── Social links (SocialLinksRow, SocialLinksEditor) ───────────────────────
  "social.addLinks": "Add links",
  "social.editLinksLabel": "Edit your links",
  "social.editLinks": "Edit",
  "social.platformLabel": "Link platform",
  "social.linkFor": "{platform} link",
  "social.removeLinkFor": "Remove {platform} link",
  "social.addLink": "Add a link",
  "social.other": "Other link",

  // ── Work editor (WorkEditor) ────────────────────────────────────────────────
  "profileEdit.work.add": "Add work",

  // ── Hero vouch row (HeroVouchRow) ───────────────────────────────────────────
  "hero.vouch.namesPlusYou": "{names}, plus you",
  "hero.vouch.youOnly": "you",
  "hero.vouch.by": "Vouched for by <b>{names}</b>.",
  "hero.vouch.onlyNumberMatters": "That's the only number that matters here.",
  "hero.vouch.emptySelf":
    "No vouches yet. They'll appear here as people who know you add their name — the only number that matters.",
  "hero.vouch.emptyOther":
    "No vouches for {first} yet. If you know them, yours could be the first.",

  // ── Public profile page (PublicProfilePage) ─────────────────────────────────
  "publicProfile.hereForTitle": "What I'm <em>here for</em>",
  "publicProfile.visiblePublicly": "Visible publicly",
  "publicProfile.writing.heading": "Public <em>writing</em>",
  "publicProfile.writing.meta_one": "{count} piece · QueerPulse Magazine",
  "publicProfile.writing.meta_other": "{count} pieces · QueerPulse Magazine",
  "publicProfile.hosting.heading": "Public <em>hosting</em>",
  "publicProfile.hosting.meta": "Open events anyone can RSVP to",
  "publicProfile.locked.postsHeading": "Posts & <em>messages</em>",
  "publicProfile.membersOnly": "Members only",
  "publicProfile.locked.postsTitle":
    "Posts, replies, and DMs are <em>members-only.</em>",
  "publicProfile.locked.postsBody":
    "QueerPulse keeps day-to-day community life behind a sign-in to protect members. Become one and {first}'s feed unlocks immediately — including the ability to message {first}.",
  "publicProfile.requestInviteArrow": "Request an invite →",
  "publicProfile.locked.connectionsHeading": "Connections",
  "publicProfile.locked.connectionsTitle":
    "Who {first} knows, <em>privately.</em>",
  "publicProfile.locked.connectionsBody":
    "To protect members' networks, we don't show connection lists publicly. Sign in to see your mutuals with {first}.",
  "publicProfile.bottomCta.title": "Want the <em>full picture?</em>",
  "publicProfile.bottomCta.body":
    "QueerPulse is invite-based — {firstName} can vouch for you if you've met in person. Or request an invite from us directly.",
  "publicProfile.bottomCta.vouchCta": "Ask {firstName} to vouch",

  // ── Public profile sections (PublicProfileSections) ─────────────────────────
  "publicProfile.preview.ownerLabel":
    "Preview of your public profile · this is how non-members see you",
  "publicProfile.pill.live": "Live",
  "publicProfile.pill.off": "Off",
  "publicProfile.preview.backToProfile": "← Back to your profile",
  "publicProfile.preview.guestLabel":
    "You're not signed in · viewing the <b>public version</b> of this profile",
  "publicProfile.head.eyebrow": "Public profile · @{slug}",
  "publicProfile.head.location": "<b>{hood}</b>, Lisbon",
  "publicProfile.head.memberSince": "Member since <b>{since}</b>",
  "publicProfile.head.vouchedFor": "<b>Vouched-for</b> by {count} members",
  "publicProfile.head.requestInviteCta": "Request an invite to connect",
  "publicProfile.head.ctaNote":
    "{firstName}'s full profile, posts, and direct-message access open up once you're a member.",

  // ── Public profile control (PublicProfileControl) ──────────────────────────
  "publicProfile.control.locked.eyebrow": "Public profile · locked",
  "publicProfile.control.locked.title":
    "A public profile is something you <em>grow into.</em>",
  "publicProfile.control.locked.lede":
    "Public profiles are for members who help carry the public side of QueerPulse — writers, hosts, organisers. Here's where you are:",
  "publicProfile.control.locked.progress":
    "{met} of {total} met — keep showing up and this unlocks on its own.",
  "publicProfile.control.unlocked.eyebrow": "Public profile · unlocked",
  "publicProfile.control.unlocked.title":
    "You can share a <em>public profile.</em>",
  "publicProfile.control.unlocked.lede":
    "A public profile lets people who aren't members yet find your writing, your events, and a way to reach you — without opening the rest of the community.",
  "publicProfile.control.switchLabel": "Show a public profile",
  "publicProfile.control.statusOn":
    "Live — anyone can view your public profile.",
  "publicProfile.control.statusOff": "Off — only members can find you.",
  "publicProfile.control.viewCta": "View public profile",
  "publicProfile.control.toast.hidden": "Your public profile is hidden",
  "publicProfile.control.toast.live": "Your public profile is live",

  // ── Public-eligibility criteria (publicFigure.ts) ───────────────────────────
  "publicProfile.eligibility.contributes.label": "Contributes publicly",
  "publicProfile.eligibility.contributes.hint":
    "Publish writing or host an open event the public can see.",
  "publicProfile.eligibility.verified.hint":
    "Confirm your identity so people know it's really you.",
  "publicProfile.eligibility.established.label": "A year on QueerPulse",
  "publicProfile.eligibility.established.hint":
    "Public profiles open up after your first year here.",
  "publicProfile.eligibility.trusted.label": "Vouched-for by 2+ members",
  "publicProfile.eligibility.trusted.hint":
    "A couple of members vouching for you unlocks this.",

  // ── Public-profile contribution stat labels (currentUserPublic.data) ──────
  "publicProfile.stat.poemsPublished": "Poems published",
  "publicProfile.stat.eventsHosted": "Events hosted",
  "publicProfile.stat.yearsOnPlatform": "Year on QueerPulse",
  "publicProfile.stat.membersReached": "Members reached",

  // ── Global search (SearchPage) ──────────────────────────────────────────────
  "search.type.member": "Members",
  "search.type.gathering": "Gatherings",
  "search.type.community": "Communities",
  "search.type.board": "Board",
  "search.type.topic": "Topics",
  "search.type.page": "Pages",
  "search.type.all": "All",
  "search.comingSoon.badge": "Coming soon",
  "search.comingSoon.title": "Search is <em>almost here.</em>",
  "search.comingSoon.body":
    "We're wiring live search to the community — members, gatherings, communities, and board posts, all in one place. For now it's resting. Turn on <b>{toggleName}</b> to explore the demo.",
  "search.recentSearches": "Recent searches",
  "search.browseTopics": "Browse topics",
  "search.upcomingGatherings": "Upcoming gatherings",
  "search.jumpTo": "Jump to <b>{name}</b>",
  "search.resultCount_one": `<b>{count}</b> result for "<b>{query}</b>"`,
  "search.resultCount_other": `<b>{count}</b> results for "<b>{query}</b>"`,
  "search.empty.title": "Nothing found",
  "search.empty.body":
    "Try a different word — member name, neighbourhood, skill, or type of gathering.",
  "search.hero.label": "Search",
  "search.hero.title": "Find anyone, anything <em>in the community.</em>",
  "search.hero.placeholder": "Members, gatherings, communities, board posts…",

  // ── Member directory filter (MemberDirectoryFilterPage) ────────────────────
  "directory.eyebrow": "Members · advanced filter",
  "directory.findPrefix": "Find",
  "directory.memberCountSuffix_one": "member,",
  "directory.memberCountSuffix_other": "members,",
  "directory.findSuffix": "exactly.",
  "directory.lead":
    "Filter by what they offer, where they're based, what they're <b>open to</b>. The same data goes both ways — members appear here because they opted in to be findable for these reasons.",
  "directory.toast.filtersCleared": "Filters cleared",
  "directory.showingPrefix": "Showing",
  "directory.showingOf": "of",
  "directory.memberCountLabel_one": "member",
  "directory.memberCountLabel_other": "members",
  "directory.sortLabel": "Sort",
  "directory.sort.recentlyActive": "Recently active",
  "directory.sort.recentlyJoined": "Recently joined",
  "directory.sort.closestMutuals": "Closest mutuals",
  "directory.sort.aToZ": "A to Z",
  "directory.sort.mostVouched": "Most vouched",
  "directory.removeChipLabel": "Remove {label}",
  "directory.emptyFiltered.title": "Nothing matches your filters",
  "directory.emptyFiltered.description":
    "No members fit all of these just now. Loosen a filter or two and more people will show up.",
  "directory.clearFiltersCta": "Clear filters",
  "directory.emptyAll.title": "No members here yet",
  "directory.emptyAll.description":
    "This directory is still filling up. As people join QueerPulse and opt in to being findable, they'll show up here — check back soon.",
  "directory.loadingMore": "Loading…",
  "directory.loadMoreCta": "Load more members",

  // ── Directory filter sidebar (MemberFilterCards) ────────────────────────────
  "directory.filter.openToTitle": "What they're open to",
  "directory.filter.hoodTitle": "Where they're based",
  "directory.filter.identityTitle": "Identity · self-declared",
  "directory.filter.ageTitle": "Member age",
  "directory.filter.fromPlaceholder": "From",
  "directory.filter.yearsPlaceholder": "Years",
  "directory.filter.ageNote":
    'Years on QueerPulse. <em>Newer members appear with a "first year" badge by default.</em>',
  "directory.filter.languagesTitle": "Languages",
  "directory.clearAllFiltersCta": "Clear all filters",
  "directory.appliedCount_one": "{count} applied",
  "directory.appliedCount_other": "{count} applied",

  // ── Profession filter (FilterProfessions) ───────────────────────────────────
  "directory.filter.whatTheyDoTitle": "What they do",
  "directory.filter.searchPlaceholder": "Search a field or profession…",
  "directory.filter.searchAriaLabel": "Search fields and professions",
  "directory.filter.noFieldMatch": 'No field matches "{query}".',
  "directory.filter.professionTitle": "Profession",
  "directory.filter.noProfessionMatch": 'No profession matches "{query}".',
  "directory.filter.matchingSearch": "Matching your search across every field.",
  "directory.filter.showingWithinField_one":
    "Showing professions within your selected field.",
  "directory.filter.showingWithinField_other":
    "Showing professions within your selected fields.",
  "directory.filter.pickField":
    "Pick a field above, or search to find any profession.",

  // ── Directory card preview (DirectoryCardPreview) ───────────────────────────
  "directory.preview.caption": "How your card reads in the directory",
  "directory.preview.borrowedNote":
    "Nothing here yet, so your card borrows the opening of your bio. Write a short bio and it'll use that instead.",

  // ── Command palette (CommandPalette) ────────────────────────────────────────
  "commandPalette.ariaLabel": "Search QueerPulse",
  "commandPalette.placeholder": "Search members, gatherings, communities…",
  "commandPalette.comingSoonBody":
    "Live search is being wired to the community. For now it's resting — turn on <em>{toggleName}</em> to explore the demo.",
  "commandPalette.noMatches": "No matches — try another word.",
  "commandPalette.seeAllResults": "See all results for “<b>{query}</b>”",
  "commandPalette.openFullSearch": "Open full search",

  // ── Vouch-for-an-invite page (VouchPage) ────────────────────────────────────
  "vouch.page.toast": "Your vouch for {name} is on its way to the council.",
  "vouch.page.success.title": "That's a <em>real welcome.</em>",
  "vouch.page.success.body":
    "Your vouch for {name} has gone to the membership council. They'll know someone already had their back before they even walked in.",
  "vouch.page.success.connectionsCta": "Back to connections",
  "vouch.page.success.browseCta": "Browse members",
  "vouch.page.eyebrow": "Vouch",
  "vouch.page.title": "Tell us you <em>know them.</em>",
  "vouch.page.noteLabel": "Add a short note (optional)",
  "vouch.page.notePlaceholder":
    "How do you know {name}, and what should the council know?",
  "vouch.page.submitCta": "Send my vouch →",
  "vouch.page.skipCta": "Not right now",

  // ── Why-vouch explainer (vouch.data.ts MEANS) ───────────────────────────────
  "vouch.means.know.title": "You know them, really",
  "vouch.means.know.body":
    "A vouch says you've met this person and you trust them in community spaces. It carries weight here.",
  "vouch.means.safe.title": "It keeps the space safe",
  "vouch.means.safe.body":
    "QueerPulse is invite-and-vouch for a reason. Members vouching for members is how we stay small and trusted.",
  "vouch.means.council.title": "It's seen by the council",
  "vouch.means.council.body":
    "Your note goes to the membership council alongside their application — not posted publicly.",

  // ── Vouch-for-a-member relationship options (vouchMember.data.ts) ──────────
  "vouch.relationship.collaborated": "We've collaborated",
  "vouch.relationship.friends": "We're friends",
  "vouch.relationship.group": "Same collective or group",
  "vouch.relationship.metThroughQueerPulse": "Met through QueerPulse",
  "vouch.relationship.neighbours": "We're neighbours",

  // ── Vouch-for-a-member modal (VouchMemberModal, VouchMemberModalParts) ─────
  "vouch.modal.ariaLabel": "Vouch for {first}",
  "vouch.modal.close": "Close",
  "vouch.modal.success.title": "That's <em>{first}</em>, backed.",
  "vouch.modal.success.body":
    "Your face just joined <b>{first}</b>'s circle of vouches — that's how trust travels here. Member by member, name by name.",
  "vouch.modal.success.doneCta": "Done",
  "vouch.modal.form.eyebrow": "Add your vouch",
  "vouch.modal.form.title": "Stand behind <em>{first}</em>",
  "vouch.modal.form.sub":
    "A vouch is you, publicly, saying you know {first} and trust them in community spaces. It carries weight here — QueerPulse is invite-and-vouch, and your name goes on their profile beside the others who've backed them.",
  "vouch.modal.form.relationshipLabel": "How do you know {first}?",
  "vouch.modal.form.endorseLabel": "What can you vouch they're great at?",
  "vouch.modal.form.optional": "optional",
  "vouch.modal.form.noteLabel": "Your note",
  "vouch.modal.form.notePlaceholder":
    "How do you know {first}, and what should other members know?",
  "vouch.modal.form.charsToSubmit_one": "{count} more character to submit",
  "vouch.modal.form.charsToSubmit_other": "{count} more characters to submit",
  "vouch.modal.form.charsCount_one": "{count} character",
  "vouch.modal.form.charsCount_other": "{count} characters",
  "vouch.modal.form.cancel": "Cancel",
  "vouch.modal.form.sending": "Sending your vouch…",

  // ── Drafts tabs/sort/status vocab (drafts.data.tsx) ─────────────────────────
  "drafts.tabs.all": "All",
  "drafts.tabs.posts": "Posts & replies",
  "drafts.tabs.articles": "Articles & pitches",
  "drafts.tabs.applications": "Applications",
  "drafts.tabs.grants": "Grant applications",
  "drafts.sort.edited": "Recently edited",
  "drafts.sort.deadline": "Closest deadline",
  "drafts.sort.progress": "Least complete",
  "drafts.sort.title": "Alphabetical",
  "drafts.status.draft": "Draft",
  "drafts.status.ready": "Ready",
  "drafts.status.stale": "Stale",
  "drafts.status.atrisk": "At risk",

  // ── Draft row action buttons (drafts.data.tsx / DraftRow) ───────────────────
  "drafts.action.resume": "Resume",
  "drafts.action.delete": "Delete",
  "drafts.action.send": "Send",
  "drafts.action.review": "Review",
  "drafts.action.keep30": "Keep 30 more days",
  "drafts.action.deleteNow": "Delete now",
  "drafts.action.sendReply": "Send reply",
  "drafts.action.edit": "Edit",

  // ── "Start something" create menu (drafts.data.tsx CREATE_ITEMS) ───────────
  "drafts.create.newPost.label": "New post",
  "drafts.create.newPost.sub": "Share to a community",
  "drafts.create.pitchStory.label": "Pitch a story",
  "drafts.create.pitchStory.sub": "To QueerPulse Magazine",
  "drafts.create.startApplication.label": "Start an application",
  "drafts.create.startApplication.sub": "From a saved job",

  // ── "Kept" override meta (drafts.data.tsx KEPT_META) ────────────────────────
  "drafts.keptMeta.resetNote": "Kept · resets 90-day timer",

  // ── Drafts header (DraftsHeader) ────────────────────────────────────────────
  "drafts.header.eyebrow": "Drafts · only visible to you",
  "drafts.header.title": "Things you <em>started.</em>",
  "drafts.header.lead":
    "Posts, articles, applications, and pitches you haven't sent yet. <em>Auto-saved every 8 seconds.</em> Drafts older than 90 days get a polite reminder, then a polite second one, then quietly delete.",
  "drafts.header.startCta": "Start something",

  // ── Search + sort controls (DraftsControls) ─────────────────────────────────
  "drafts.controls.searchPlaceholder": "Search your drafts…",
  "drafts.controls.searchAriaLabel": "Search drafts",
  "drafts.controls.clearSearchLabel": "Clear search",
  "drafts.controls.sortLabel": "Sort",
  "drafts.controls.sortAriaLabel": "Sort drafts",

  // ── Drafts page chrome (DraftsPage) ──────────────────────────────────────────
  "drafts.tabsAriaLabel": "Draft types",
  "drafts.selectAllAriaLabel": "Select all visible drafts",
  "drafts.selectAll": "Select all",
  "drafts.visibleCount_one": "{visible} of {count} draft",
  "drafts.visibleCount_other": "{visible} of {count} drafts",
  "drafts.empty.defaultTitle": "Nothing here yet.",
  "drafts.empty.defaultText":
    "No drafts in this category. Switch tabs, or start something new.",
  "drafts.empty.noMatchTitle": "No matches.",
  "drafts.empty.noMatchText":
    'Nothing in your drafts matches "{query}". Try a different word, or clear the search.',
  "drafts.empty.allCaughtUpTitle": "All caught up.",
  "drafts.empty.allCaughtUpText":
    "No drafts left — nothing half-written waiting on you. When you start something and step away, it'll be saved here.",
  "drafts.empty.startCta": "Start something new",
  "drafts.toast.deleted_one": "Draft deleted",
  "drafts.toast.deleted_other": "{count} drafts deleted",
  "drafts.toast.undo": "Undo",
  "drafts.toast.kept": "Draft kept — 30 more days",
  "drafts.dangerNote":
    "<b>About the 90-day rule:</b> drafts you haven't touched in 87+ days get an email reminder, then auto-delete on day 90. You can extend any draft 30 days at a time. <em>This is to keep your drafts list honest — not to lose work.</em>",

  // ── Draft row (DraftRow) ─────────────────────────────────────────────────────
  "drafts.row.selectAriaLabel": "Select draft",

  // ── Bulk-selection bar (DraftsBulkBar) ───────────────────────────────────────
  "drafts.bulkBar.ariaLabel": "Bulk actions",
  "drafts.bulkBar.selectedCount_one": "<b>{count}</b> selected",
  "drafts.bulkBar.selectedCount_other": "<b>{count}</b> selected",
  "drafts.bulkBar.deleteCta": "Delete selected",
  "drafts.bulkBar.cancel": "Cancel",

  // ── Collections privacy vocabulary (collections.data.tsx) ───────────────────
  "collections.privacy.private": "Private",
  "collections.privacy.shared": "Shared",
  "collections.privacy.public": "Public",
  "collections.privacy.sharedWithCount_one": "Shared with {count}",
  "collections.privacy.sharedWithCount_other": "Shared with {count}",

  // ── Collections page chrome (CollectionsPage) ───────────────────────────────
  "collections.header.eyebrow": "Collections · folders for saves",
  "collections.header.title": "Things you keep <em>coming back to.</em>",
  "collections.header.lead":
    "Saved items, grouped however makes sense to you. Folders can be private (default), shared with specific members, or public.",
  "collections.header.newCta": "+ New collection",
  "collections.newCard.title": "New collection",
  "collections.newCard.subtitle": "Group saves by why they matter",
  "collections.recentSaves.heading": "Recently saved · not yet in a collection",
  "collections.recentSaves.unfiledCount": "+ {count} unfiled",
  "collections.recentSaves.addCta": "+ Add to collection →",
  "collections.toast.created": "Collection created",
  "collections.newCollection.defaultMeta": "Just created — start adding saves",
  "collections.updatedJustNow": "Updated just now",

  // ── Collections modals (CollectionsModals) ──────────────────────────────────
  "collections.modal.defaultDialogLabel": "Dialog",
  "collections.modal.close": "Close",
  "collections.modal.newCollection.dialogLabel": "New collection",
  "collections.modal.newCollection.eyebrow": "New collection",
  "collections.modal.newCollection.title": "What are you <em>gathering?</em>",
  "collections.modal.newCollection.nameLabel": "Collection name",
  "collections.modal.newCollection.namePlaceholder":
    "e.g. Lisbon recs, Bring to therapy…",
  "collections.modal.newCollection.visibilityLabel": "Who can see it",
  "collections.modal.newCollection.cancel": "← Cancel",
  "collections.modal.newCollection.submit": "Create collection →",
  "collections.modal.privacyOption.private": "Private",
  "collections.modal.privacyOption.shared": "Shared with members",
  "collections.modal.privacyOption.public": "Public",
  "collections.modal.view.dialogLabel": "View collection",
  "collections.modal.view.emptyText":
    "Nothing in here yet. Add saves from the list below the grid.",
  "collections.modal.view.close": "Close",
  "collections.modal.add.dialogLabel": "Add to collection",
  "collections.modal.add.eyebrow": "Add to collection",
  "collections.modal.add.title": "Where should this live?",
  "collections.modal.add.cancel": "← Cancel",
  "collections.modal.add.success.dialogLabel": "Added to collection",
  "collections.modal.add.success.title": "Added to <em>your collection.</em>",
  "collections.modal.add.success.body":
    "Saved into <b>{name}</b>. You'll find it there whenever you come back.",
  "collections.modal.add.success.done": "Done",

  // ── Saved-by-you card kinds (savedByYou.data.ts) ────────────────────────────
  "savedByYou.kind.magazine.label": "Magazine",
  "savedByYou.kind.magazine.cta": "Read",
  "savedByYou.kind.film.label": "Cinema",
  "savedByYou.kind.film.cta": "Watch",
  "savedByYou.kind.job.label": "Work",
  "savedByYou.kind.job.cta": "View role",
  "savedByYou.kind.event.label": "Gathering",
  "savedByYou.kind.event.cta": "View",
  "savedByYou.kind.post.label": "Thread",
  "savedByYou.kind.post.cta": "Open thread",
  "savedByYou.kind.group.label": "Community",
  "savedByYou.kind.group.cta": "Open",

  // ── Saved-by-you chrome (SavedByYou) ─────────────────────────────────────────
  "savedByYou.removeAriaLabel": "Remove {title} from saved",
  "savedByYou.removeTitle": "Remove from saved",
  "savedByYou.heading": "Saved by you · live across QueerPulse",
  "savedByYou.empty.title": "Nothing saved yet",
  "savedByYou.empty.description":
    "Save articles, films, jobs and posts as you explore — they'll gather here so you can come back to them and sort them into collections.",
  "savedByYou.empty.browseMagazineCta": "Browse the magazine",
  "savedByYou.empty.exploreCinemaCta": "Explore cinema",
  "savedByYou.count_one": "{count} saved",
  "savedByYou.count_other": "{count} saved",
  "savedByYou.toast.removed": "Removed from saved",

  // ── My Places (MyPlacesSection) ──────────────────────────────────────────────
  "myPlaces.status.review": "In review",
  "myPlaces.status.question": "Quick question",
  "myPlaces.status.live": "Live",
  "myPlaces.title": "Places I <em>run</em>",
  "myPlaces.subtitle":
    "Listings you've added to the directory. Each is read by the community team before it goes live.",
  "myPlaces.refLabel": "Ref · {ref}",
  "myPlaces.viewListingCta": "View listing →",
  "myPlaces.awaitingReview": "Awaiting review",

  // ── QR scanner (QrScannerPage) ───────────────────────────────────────────────
  "qrScanner.mode.safe.label": "Safe space",
  "qrScanner.mode.safe.hint": "Point at a sticker",
  "qrScanner.mode.event.label": "Event ticket",
  "qrScanner.mode.event.hint": "Point at your ticket",
  "qrScanner.mode.profile.label": "Profile",
  "qrScanner.mode.profile.hint": "Point at a profile code",
  "qrScanner.closeAriaLabel": "Close",
  "qrScanner.title": "Scan a <em>QueerPulse</em> code",
  "qrScanner.flashAriaLabel": "Flash",
  "qrScanner.privacyNote": "Camera stays on this device · we never upload frames",
  "qrScanner.hintSuffix":
    "Safe-space window stickers · gathering tickets · profile sharing codes",
  "qrScanner.cantScan": "Can't scan?",
  "qrScanner.enterCodeCta": "Enter code manually",
  "qrScanner.helpCta": "Help with codes",
  "qrScanner.scanToast": "{name} · verified safe space",
  "qrScanner.manualToast": "Open code · paste flow",

  // ── Badges page chrome (BadgesPage, BadgesSections) ─────────────────────────
  // Badge names, categories, rarity and level names are recognition-domain
  // content (fetched wholesale via useRecognition() in live mode) — only the
  // surrounding chrome below is translated. See the header comment.
  "badges.backToProfile": "← Back to profile",
  "badges.pageTitle": "Badges & <em>level</em>",
  "badges.howToEarnXp": "How to earn XP →",
  "badges.earnedHeading": "Your <em>badges</em>",
  "badges.lockedHeading": "<em>Locked</em> badges",
  "badges.lockedSub": "Earn XP and attend gatherings to unlock these.",
  "badges.hideMore": "Hide ▴",
  "badges.showMore": "Show {count} more ▾",
  "badges.perksUnlockHeading": "What your level <em>unlocks</em>",
  "badges.perksUnlockSub": "Each level grants new access and member benefits.",
  "badges.xpToNextLevel": "{xp} / {xpMax} XP to Level {nextLevel} · {nextName}",

  // ── Perks page chrome (PerksPage, PerksSections) ────────────────────────────
  "perks.page.backToBadges": "← Badges & level",
  "perks.page.title": "Your <em>bonuses</em>",
  "perks.page.availableToRedeem_one": "{count} perk available to redeem",
  "perks.page.availableToRedeem_other": "{count} perks available to redeem",
  "perks.sidebar.yourLevelTitle": "Your level",
  "perks.sidebar.xpSummary": "{xp} / {xpMax} XP · {xpToNext} to Level {nextLevel}",
  "perks.sidebar.nextUnlockNote":
    "Next perks unlock at <strong>Level {nextLevel} · {nextName}</strong> — host without approval & an increased invite quota.",
  "perks.sidebar.seeAllBadgesCta": "See all badges & levels →",
  "perks.sidebar.explainedTitle": "Perks explained",
  "perks.sidebar.suggestTitle": "Suggest a perk",
  "perks.sidebar.suggestPlaceholder": "Share an idea…",
  "perks.sidebar.sendSuggestionCta": "Send suggestion",
  "perks.claim.alreadyActive": "Already active",
  "perks.claim.active": "Active",
  "perks.claim.claimed": "Claimed",
};

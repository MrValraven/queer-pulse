import type { Catalog } from "../../types";

/**
 * Subprofiles — the persona directory, the main-profile "Also as…" block, and
 * the nav/command entries. Headlines that carry a coral `<em>` stay as JSX
 * literals in their components; the plain supporting copy lives here.
 */
export const subprofiles: Catalog = {
  // Directory (SubprofileDirectoryPage)
  "directory.eyebrow": "Directory · personas",
  "directory.subtitle":
    "Pseudonymous professional personas from across the community. No ranking, no algorithm. Just the work.",
  // A linked persona is titled by its owner on the card ("Ana Silva | Poet"),
  // so the term reaches that name too — looking somebody up by the name you
  // know them under is the directory's most obvious question. Only LINKED
  // personas: an unlinked one's owner is unnamed on the card and stays unnamed
  // in the results.
  "directory.searchPlaceholder": "Search personas or owners",
  "directory.searchAria": "Search personas by name, headline or owner name",
  "directory.loading": "Loading personas…",
  "directory.empty.title": "No personas here yet",
  "directory.empty.description":
    "Nothing matches this just now. Try another profession, or clear your search and see everyone.",
  "directory.empty.clear": "Clear filters",
  "directory.error.title": "We couldn't load the directory",
  "directory.error.description":
    "Something went wrong reaching the server. This isn't an empty directory. Try again in a moment.",
  "directory.error.retry": "Try again",
  "directory.openToCollabsChip": "Open to collabs",

  // Refine drawer (SubprofileDirectoryToolbar / SubprofileDirectoryRefinePanel).
  // The Profession band is headed by page family, and those headings reuse the
  // create flow's own `family.*.label` keys.
  "directory.refine.professionLabel": "Profession",
  "directory.refine.availabilityLabel": "Availability",
  "directory.refine.tagsLabel": "Tags",
  // Whole accessible name for a counted chip: the badge itself is aria-hidden,
  // so "Poet 4" would be heard as a quantity of Poets.
  "directory.refine.optionWithCount_one": "{label}, {count} persona",
  "directory.refine.optionWithCount_other": "{label}, {count} personas",
  // Rides the active-filter chip row, so it only appears once something is
  // narrowing the grid.
  "directory.resultCount_one": "{count} persona",
  "directory.resultCount_other": "{count} personas",
  "directory.showMore": "Show more",
  "directory.shownOfTotal": "{shown} of {total}",
  "directory.showMoreLoading": "Loading…",
  // Shown only when a browser-side facet is active AND further pages exist.
  // The endpoint has no `tags` param and its `kind` takes one value, so those
  // three chips cut the pages already fetched rather than the whole
  // directory, and a partial count must never read as a total one. Retire
  // this the moment the endpoint grows tags, repeated kind and facets.

  // The "personas you follow" tab on the persona hub (PRD-208). Following used
  // to give the follower nothing: the only consumer of a follow was one
  // notification to the persona OWNER, so the follower got a "Following" pill
  // and never heard from that persona again. This is the list half.
  "directory.tabs.ariaLabel": "Personas",
  "directory.tabs.browse": "Everyone",
  "directory.tabs.following": "You follow",
  "following.loading": "Loading the personas you follow",
  "following.error.title": "We couldn't load the personas you follow",
  "following.error.description":
    "Something went wrong on our side. Try again in a moment.",
  "following.empty.title": "You're not following anyone yet",
  "following.empty.description":
    "Follow a persona and its new work turns up here, and in your notifications.",
  "following.empty.cta": "Browse personas",
  "following.countLine_one": "Following 1 persona",
  "following.countLine_other": "Following {count} personas",
  "following.previousPage": "Previous",
  "following.nextPage": "Next",
  "following.unfollow": "Unfollow",
  "following.unfollowing": "Unfollowing…",
  "following.unfollowLabel": "Unfollow {name}",
  "following.unfollowedToast": "You no longer follow {name}.",
  "following.unfollowError": "We couldn't unfollow that one. Try again.",
  "following.followerCount_one": "1 follower",
  "following.followerCount_other": "{count} followers",
  "following.since": "Since {date}",
  "following.noAddress": "No public page right now",

  // Forwarded-from-an-old-handle note on `/p/:handle` (PRD-204). Its own keys
  // rather than the `members:profile.moved.*` set, for two reasons: that
  // component names its destination from `useParams().slug` and this route has
  // no `slug`, and the member copy says "username", which a persona handle is
  // not. Both handles here belong to the SAME persona and neither is a member
  // username, so the note never links a persona to a person. The NESTED route
  // `/members/:slug/:subslug` forwards on an OWNER rename, which really is a
  // username change, and reuses the members keys unchanged.
  "page.moved.body":
    "You followed a link to @{oldHandle}. That handle has changed, and this is where it now leads: @{handle}.",
  "page.moved.announcement": "Forwarded from @{oldHandle} to @{handle}.",
  "page.moved.ariaLabel": "Forwarded from an old handle",
  "page.moved.dismiss": "Dismiss this note",
  "page.rehomed.body":
    "You followed an old link to this persona. It has a new address, so we brought you here.",
  "page.rehomed.announcement": "Forwarded to this persona's new address.",
  "page.rehomed.ariaLabel": "Forwarded to a new persona address",
  "page.rehomed.dismiss": "Dismiss this note",

  "directory.narrowedNote":
    "Profession, tags and availability narrow the personas loaded so far. Show more to search wider.",

  // Directory closing nudge (SubprofileDirectoryFooterPrompt — personas
  // discovery Phase 5, Moment 2). Dismissible; static copy, no live data.
  "directory.footerPrompt.message":
    "Every persona here was made by someone who joined for something else. <em>Yours could too.</em>",
  "directory.footerPrompt.cta": "Make yours",
  "directory.footerPrompt.notNow": "Not now",

  // Directory card affordances (SubprofileCard)
  "card.openToCollabs": "Open to collabs",
  "card.linkCount_one": "{count} link",
  "card.linkCount_other": "{count} links",
  "card.followerCount_one": "{count} follower",
  "card.followerCount_other": "{count} followers",
  "card.openPersona": "Open this persona",

  // Main-profile "Also as…" block (ProfileSubprofilesSection)
  "alsoAs.title": "Also working as",
  "alsoAs.subtitlePublic": "Professional personas linked to this profile.",
  "alsoAs.subtitleSelf": "The professional personas you've linked here.",
  "alsoAs.subtitleEmpty": "Another persona for your work can live here.",
  "alsoAs.viewPersona": "Visit",
  "alsoAs.switchLabel": "More personas",
  "alsoAs.previewLabel": "See another persona",
  "alsoAs.count_one": "{count} persona",
  "alsoAs.count_other": "{count} personas",
  "alsoAs.announce": "Now showing {name}",
  "alsoAs.featuredEyebrow": "Featured",
  "alsoAs.addAnother": "Add another persona",
  "alsoAs.manage": "Manage your personas",
  "alsoAs.edit": "Edit",
  "alsoAs.expandCard": "Show details",
  "alsoAs.filterLabel": "Filter by craft",
  "alsoAs.filterAll": "All",
  "alsoAs.showAll": "Show all ({count} more)",
  "alsoAs.showFewer": "Show fewer",
  "alsoAs.empty.title": "Show more of what you <em>make</em>",
  "alsoAs.empty.description":
    "Your music, your code, your writing, linked here or standing on its own.",
  "alsoAs.empty.cta": "Create a persona",

  // Stronger self+empty prompt (SidesPrompt, in ProfileSubprofilesSection —
  // personas discovery Phase 5, Moment 1). Shown before this nudge is
  // dismissed or the shared cap is hit; falls back to the plain `alsoAs.empty.*`
  // copy above once it is.
  "alsoAs.sidesPrompt.eyebrow": "A quiet suggestion",
  "alsoAs.sidesPrompt.heading": "You do more than <em>one thing</em>.",
  "alsoAs.sidesPrompt.description":
    "A persona gives that other craft its own page, linked here, or standing entirely on its own.",
  "alsoAs.sidesPrompt.cta": "Create a persona",
  "alsoAs.sidesPrompt.notNow": "Not now",

  // Nav + command palette

  // Directory headline (SubprofileDirectoryPage) — the coral <em> left raw
  // JSX before <Translation> existed; now routed through it.
  "directory.title": "The many ways we <em>make</em>",

  // Kind display labels — `kind` is a PERSISTED field (stored on the
  // subprofile), so these are label-key indirection: the canonical English id
  // (developer/writer/…) never changes, only the rendered label does.
  "kind.developer": "Developer",
  "kind.writer": "Writer",
  "kind.musician": "Musician",
  "kind.visual_artist": "Visual artist",
  "kind.filmmaker": "Filmmaker",
  "kind.designer": "Designer",
  "kind.maker": "Maker",
  "kind.drag": "Drag performer",
  "kind.dj": "DJ",
  "kind.dancer": "Dancer",
  "kind.performer": "Performer",
  "kind.photographer": "Photographer",
  "kind.videomaker": "Videomaker",
  "kind.chef": "Chef",
  "kind.mixologist": "Mixologist",
  "kind.therapist": "Therapist",
  "kind.astrologer": "Astrologer",
  "kind.generic": "Other",
  // Expanded kind labels (personas expansion — 75 new crafts)
  "kind.comedian": "Comedian",
  "kind.vocalist": "Vocalist",
  "kind.burlesque": "Burlesque performer",
  "kind.circus": "Circus & aerial",
  "kind.spoken_word": "Spoken word artist",
  "kind.host": "Host & emcee",
  "kind.voguer": "Ballroom & vogue",
  "kind.illustrator": "Illustrator",
  "kind.tattoo_artist": "Tattoo artist",
  "kind.animator": "Animator",
  "kind.comic_artist": "Comic artist",
  "kind.game_designer": "Game designer",
  "kind.artist_3d": "3D artist",
  "kind.printmaker": "Printmaker",
  "kind.journalist": "Journalist",
  "kind.poet": "Poet",
  "kind.editor": "Editor",
  "kind.screenwriter": "Screenwriter",
  "kind.translator": "Translator",
  "kind.zinester": "Zinester",
  "kind.academic": "Academic",
  "kind.ceramicist": "Ceramicist",
  "kind.jeweler": "Jeweller",
  "kind.textile_artist": "Textile artist",
  "kind.woodworker": "Woodworker",
  "kind.florist": "Florist",
  "kind.data_scientist": "Data scientist",
  "kind.coach": "Coach",
  "kind.bodyworker": "Bodyworker & massage",
  "kind.yoga_teacher": "Yoga & movement teacher",
  "kind.nutritionist": "Nutritionist",
  "kind.doula": "Doula & birth worker",
  "kind.personal_trainer": "Personal trainer",
  "kind.sex_educator": "Sexual health educator",
  "kind.peer_support": "Peer support & social work",
  "kind.baker": "Baker & pastry chef",
  "kind.barista": "Barista",
  "kind.brewer": "Brewer & distiller",
  "kind.sommelier": "Sommelier",
  "kind.caterer": "Caterer & supper club",
  "kind.hair_stylist": "Hair stylist",
  "kind.barber": "Barber",
  "kind.makeup_artist": "Makeup artist",
  "kind.nail_artist": "Nail artist",
  "kind.esthetician": "Esthetician",
  "kind.piercer": "Piercer",
  "kind.fashion_designer": "Fashion designer",
  "kind.stylist": "Stylist",
  "kind.model": "Model",
  "kind.costume_designer": "Costume designer",
  "kind.curator": "Curator",
  "kind.gallerist": "Gallerist",
  "kind.art_dealer": "Art dealer",
  "kind.archivist": "Archivist",
  "kind.conservator": "Conservator",
  "kind.registrar": "Registrar",
  "kind.exhibition_designer": "Exhibition designer",
  "kind.art_critic": "Art critic",
  "kind.docent": "Docent & gallery guide",
  "kind.preparator": "Preparator & art handler",
  "kind.historian": "Historian",
  "kind.art_historian": "Art historian",
  "kind.oral_historian": "Oral historian",
  "kind.genealogist": "Genealogist",
  "kind.heritage": "Heritage & preservation",
  "kind.archival_researcher": "Archival researcher",
  "kind.memory_keeper": "Cultural memory keeper",
  "kind.organizer": "Organiser",
  "kind.activist": "Activist",
  "kind.event_producer": "Event producer",
  "kind.promoter": "Promoter",
  "kind.teacher": "Teacher",
  "kind.facilitator": "Workshop facilitator",
  "kind.tutor": "Tutor",
  "kind.lecturer": "Lecturer",
  "kind.pole_dancer": "Pole dancer",

  // Section display labels — `section` is also persisted (SubprofileItemDTO.section).
  "section.projects": "Projects",
  "section.open_source": "Open source",
  "section.publications": "Publications",
  "section.readings": "Readings",
  "section.discography": "Discography",
  "section.gigs": "Gigs",
  "section.portfolio": "Portfolio",
  "section.exhibitions": "Exhibitions",
  "section.filmography": "Filmography",
  "section.screenings": "Screenings",
  "section.selected_work": "Selected work",
  "section.clients": "Clients",
  "section.collections": "Collections",
  "section.workshops": "Workshops",
  "section.shows": "Shows",
  "section.looks": "Looks",
  "section.mixes": "Mixes",
  "section.performances": "Performances",
  "section.reel": "Reel",
  "section.appearances": "Appearances",
  "section.series": "Series",
  "section.videos": "Videos",
  "section.menus": "Menus",
  "section.residencies": "Residencies",
  "section.cocktails": "Cocktails",
  "section.specialisms": "Specialisms",
  "section.credentials": "Credentials",
  "section.charts": "Chart work",
  "section.sky": "In the sky",
  "section.showcase": "Showcase",
  "section.links": "Links",
  "section.gallery": "Photo gallery",
  // Expanded section labels (personas expansion — 81 new sections)
  "section.sets": "Sets",
  "section.tour": "Tour dates",
  "section.recordings": "Recordings",
  "section.acts": "Acts",
  "section.pieces": "Pieces",
  "section.hosted": "Nights hosted",
  "section.balls": "Balls & categories",
  "section.flash": "Flash",
  "section.healed": "Healed work",
  "section.books": "Books",
  "section.strips": "Strips & zines",
  "section.games": "Games",
  "section.jams": "Jams & prototypes",
  "section.models": "Models & renders",
  "section.editions": "Editions",
  "section.reporting": "Reporting",
  "section.bylines": "Where I've published",
  "section.poems": "Poems",
  "section.edited": "Edited",
  "section.scripts": "Scripts",
  "section.productions": "Produced",
  "section.translations": "Translations",
  "section.languages": "Languages I work between",
  "section.zines": "Zines",
  "section.distros": "Where to find them",
  "section.papers": "Papers",
  "section.teaching": "Teaching",
  "section.wares": "Wares",
  "section.firings": "Firings & residencies",
  "section.commissions": "Commissions",
  "section.builds": "Builds",
  "section.arrangements": "Arrangements",
  "section.events": "Events",
  "section.analyses": "Analyses",
  "section.programmes": "Programmes",
  "section.treatments": "Treatments",
  "section.classes": "Classes",
  "section.trainings": "Trainings",
  "section.support": "How I support you",
  "section.training": "Training",
  "section.resources": "Resources",
  "section.groups": "Groups",
  "section.bakes": "Bakes",
  "section.markets": "Markets & stockists",
  "section.brews": "Brews",
  "section.releases": "Releases",
  "section.taprooms": "Where to drink it",
  "section.lists": "Wine lists",
  "section.pairings": "Pairings & dinners",
  "section.services": "Services",
  "section.cuts": "Cuts",
  "section.nail_sets": "Sets",
  "section.aftercare": "Aftercare",
  "section.piercings": "Piercings",
  "section.editorials": "Editorials",
  "section.book": "Book",
  "section.campaigns": "Campaigns",
  "section.sketches": "Sketches & builds",
  "section.texts": "Texts & catalogues",
  "section.programme": "Programme",
  "section.artists": "Artists represented",
  "section.available": "Available works",
  "section.advisory": "Advisory",
  "section.finding_aids": "Finding aids",
  "section.loans": "Loans & logistics",
  "section.installations": "Installations",
  "section.reviews": "Reviews",
  "section.tours": "Tours",
  "section.talks": "Talks",
  "section.installs": "Installs",
  "section.research": "Research",
  "section.lectures": "Lectures",
  "section.testimonies": "Testimonies",
  "section.findings": "Findings",
  "section.sites": "Sites",
  "section.actions": "Actions & dates",
  "section.writing": "Writing & talks",
  "section.nights": "Nights",
  "section.roster": "Who plays",
  "section.courses": "Courses",
  "section.subjects": "Subjects",

  // Status / link-visibility badges — also persisted fields.
  "status.draft": "Draft",
  "status.published": "Published",
  "link.linked": "Linked",
  "link.standalone": "Standalone",
  "link.help.linked":
    "Shown on your main profile as another persona of yours. People can see the two are the same person.",
  "link.help.unlinked":
    "Stands on its own. Nothing here points back to your main profile, so you can keep this work separate from the rest of your life. It earns a public handle once it passes the completeness check.",
  "link.creatorOnlyHint":
    "Only the creator can link this persona to their profile, because it would show their name.",

  // Gig-state / work-state chips (ItemRow, stage + studio/workshop skins) and
  // dietary-mark legend (Table skin) — persisted `gigState`/`workState`
  // fields and structured dish marks (`v`/`ve`/`gf`), so these are
  // label-key indirection like `kind.*`/`section.*` above.
  "gigState.sold_out": "Sold out",
  "gigState.cancelled": "Cancelled",
  "gigState.guest": "Guest set",
  "workState.shipped": "Shipped",
  "workState.archived": "Archived",
  "workState.in_progress": "In progress",
  "dietary.v": "vegetarian",
  "dietary.ve": "vegan",
  "dietary.gf": "no gluten",

  // Visibility options (useSubprofileMetaEditor, rendered by
  // SubprofileLinkFields) — persisted `visibility` field.
  "visibility.open.label": "Open to everyone",
  "visibility.open.help":
    "Anyone in the community can find and view this persona.",
  "visibility.network.label": "Your network",
  "visibility.network.help": "Only people you're connected with can see it.",
  "visibility.private.label": "Just you",
  "visibility.private.help": "Kept to yourself while you shape it.",

  // Presence — accent swatches (SubprofilePresenceFields) and availability
  // status (SubprofileAvailability, SubprofileCard, SubprofilePresenceFields)
  // — both persisted fields.
  "accent.plum": "Plum",
  "accent.coral": "Coral",
  "accent.jade": "Jade",
  "accent.amber": "Amber",
  "accent.violet": "Violet",
  "availability.openToCollabs": "Open to collabs",
  "availability.booking": "Taking bookings",
  "availability.notAvailable": "Not available right now",

  // Item-editor field labels/placeholders (SubprofileItemDrawerFields, in
  // the SubprofileItemDrawer)
  "field.title.label": "Title",
  "field.title.placeholder": "What's it called?",
  "field.subtitle.label": "Subtitle",
  "field.subtitle.placeholder": "A label, venue or publisher",
  "field.description.label": "Description",
  "field.description.placeholder": "A sentence or two",
  "field.url.label": "Link",
  "field.url.placeholder": "https://",
  "field.date.label": "Date",
  "field.date.placeholder": "e.g. 2025",
  "field.meta.label": "Detail",
  "field.meta.placeholder": "A short note",
  "field.tags.label": "Tags",
  "field.tags.placeholder": "e.g. React, TypeScript",

  // Publish checklist (PublishChecklist + publishChecklist.data.ts)
  "checklist.title": "Almost <em>there</em>",
  "checklist.ledeUnknown":
    "We couldn't publish this just yet. Run through these and try again.",
  "checklist.ledeDefault":
    "A few things to finish before this persona can stand on its own.",
  "checklist.jumpAction": "Take me there",
  "checklist.statePass": "Done",
  "checklist.stateFail": "Needs attention",
  "checklist.stateUnknown": "Still to check",
  "checklist.reqHandleTitle": "A handle that's yours",
  "checklist.reqHandleMet":
    "This is where people will find you: queerpulse.app/p/your-handle.",
  "checklist.reqHandleFailInvalid":
    "Handles are 3–30 characters: lowercase letters, numbers and hyphens.",
  "checklist.reqHandleFailTaken":
    "Someone already has that handle. Try another.",
  "checklist.reqHandleFailReserved":
    "That handle is reserved. Pick a different one.",
  "checklist.reqAvatarTitle": "A photo or image",
  "checklist.reqAvatarMet": "Your avatar helps people recognise this persona.",
  "checklist.reqAvatarFail":
    "Add an avatar so people can put a face, or a mark, to the name.",
  "checklist.reqBioTitle": "A bio of at least 80 characters",
  "checklist.reqBioMet": "Enough for someone to get who you are at a glance.",
  "checklist.reqBioFail":
    "Tell people a little more. Your bio needs at least 80 characters.",
  "checklist.reqLanguageTitle": "Language that keeps everyone welcome",
  "checklist.reqLanguageMet": "Nothing flagged.",
  "checklist.reqLanguageFail":
    "A word in your name, handle or bio might not sit right with everyone. Mind rewording it?",

  // Publish-checklist polish nudges (non-blocking, PublishChecklist.tsx)
  "checklist.polishTitle": "A little more polish",
  "checklist.polishItems": "A few things to show",
  "checklist.polishCover": "A cover image",
  "checklist.polishSocials": "A social link",
  "checklist.polishAvailability": "Your availability",
  "checklist.polishDone": "Looking polished",

  // Owner dashboard (MySubprofilesPage + SideCard)
  "mine.title": "Your other <em>personas</em>",
  "mine.sub":
    "A professional persona of yours for each thing you do, linked to your main profile, or standing on its own.",
  "mine.newCta": "New persona",
  "mine.newSideTile": "New persona",
  "mine.count": "{n} of {max}",
  "mine.atCap": "You've reached the most personas one account can hold.",
  "mine.untitled": "Untitled persona",
  "mine.toastDeleted": "{name} deleted",
  "mine.toastDeleteError": "We couldn't delete that just now. Try again.",
  "mine.deleteModalTitle": "Delete this persona?",
  "mine.deleteModalSub": "“{name}” and everything on it will be gone for good.",
  "mine.deleteModalDefaultName": "This persona",
  "mine.deleteModalKeep": "Keep it",
  "mine.deleteModalConfirm": "Delete",
  "mine.deleteModalDeleting": "Deleting…",
  "mine.deleteModalBody": "This can't be undone.",
  // Counts everyone ELSE. The reader is always the creator, the only member who
  // can reach this modal, so the superseded `mine.deleteModalBodyShared`
  // counted them among the co-owners they were taking the persona from.
  // PRD-207.
  "mine.deleteModalBodyCoOwned_one":
    "This removes {name} for you and 1 other co-owner. It can't be undone.",
  "mine.deleteModalBodyCoOwned_other":
    "This removes {name} for you and {count} other co-owners. It can't be undone.",
  "mine.rowEdit": "Edit",
  "mine.rowDelete": "Delete",
  "mine.endorsementCount_one": "{count} endorsement",
  "mine.endorsementCount_other": "{count} endorsements",
  "mine.followerCount_one": "{count} follower",
  "mine.followerCount_other": "{count} followers",

  // Persona order (MySubprofilesBoard + ReorderableSideCard). The grip is
  // `aria-hidden`, so the two move buttons carry the persona's own name: a
  // screen reader moving through the grid otherwise hears the same
  // "Move earlier" on every card with nothing to tell them apart.
  "mine.order.groupTitle": "On your profile",
  "mine.order.groupHint":
    "Drag a persona, or use the arrows, to set the order these appear on your profile.",
  "mine.order.dragToReorder": "Drag to reorder",
  "mine.order.position": "{position} of {total}",
  "mine.order.moveEarlier": "Move {name} earlier",
  "mine.order.moveLater": "Move {name} later",
  "mine.order.emptyGroup":
    "Nothing is on your profile yet. Publish a persona and tie it to your profile to list it here.",
  "mine.order.saveError": "We couldn't save that order. Try again.",

  // Cards / List switch on the dashboard (PersonaViewToggle), and the named
  // icon-only actions on a list row (SideCardFooter's row variant).
  "mine.view.label": "Show personas as",
  "mine.view.cards": "Cards",
  "mine.view.list": "List",
  "mine.rowEditNamed": "Edit {name}",
  "mine.rowViewNamed": "View {name}",
  "mine.rowShareNamed": "Share {name}",
  "mine.rowDeleteNamed": "Delete {name}",
  "mine.rowLeaveNamed": "Leave {name}",
  "mine.rowActions": "Actions",
  "mine.rowActionsFor": "Actions for {name}",
  "mine.stat.endorsements_one": "endorsement",
  "mine.stat.endorsements_other": "endorsements",
  "mine.stat.followers_one": "follower",
  "mine.stat.followers_other": "followers",

  // Personas the profile doesn't list (NotShownPersonas). One reason and one
  // link each, deep-linked to the editor pane where that work happens.
  "mine.notShown.title": "Not shown on your profile",
  "mine.notShown.sub":
    "These are yours too. Your profile just doesn't list them, so they have no place in the order above.",
  "mine.notShown.draftReason": "Still a draft, so only you can see it.",
  "mine.notShown.draftAction": "Get it live",
  "mine.notShown.standaloneReason": "Standalone, so it lives on its own page.",
  "mine.notShown.standaloneAction": "Change where it lives",

  // Dashboard loading / empty / error states (SubprofileDashboardStates,
  // Phase 2 Task 2) — built standalone, wired into MySubprofilesPage later.
  "mine.loadingAria": "Loading your personas…",
  "mine.empty.eyebrow": "Your personas",
  "mine.empty.title": "You have one profile. <em>You are not one thing.</em>",
  "mine.empty.sub":
    "Every craft you practice can have its own page, tied to your name, or standing entirely on its own. Start with the first.",
  "mine.empty.newCta": "Start your first persona",
  "mine.empty.browseCta": "See what other people made",
  "mine.emptySamples.stage.name": "Hot Mess Express",
  "mine.emptySamples.stage.line": "DJ duo · queer parties",
  "mine.emptySamples.practice.name": "Sofia Neves",
  "mine.emptySamples.practice.line":
    "Psychotherapy for LGBTQ+ adults · EN / PT",
  "mine.emptySamples.table.name": "Casa Corvo",
  "mine.emptySamples.table.line":
    "Supper club for people who arrive hungry and leave late",
  "mine.error.title": "We couldn't load your",
  "mine.error.em": "personas",
  "mine.error.description":
    "Something went wrong reaching the server. Nothing here is lost. Try again in a moment.",
  "mine.error.retry": "Try again",

  // Editor page (SubprofileEditorPage)
  "editor.loading": "Loading your persona…",
  "editor.notFoundTitle": "We couldn't find that persona",
  "editor.notFoundDescription":
    "It may have been removed, or the link isn't quite right.",
  "editor.notFoundAction": "Back to your personas",

  // Meta editor (useSubprofileMetaEditor, fed to the Identity/Presence/
  // Address rail panes)
  "metaForm.avatarLabel": "Avatar",
  "metaForm.avatarPlaceholder": "Avatar",
  "metaForm.displayNameLabel": "Display name",
  "metaForm.displayNameError": "This persona needs a name to go live.",
  "metaForm.displayNamePlaceholder": "How this persona is known",
  "metaForm.taglineLabel": "Tagline",
  "metaForm.taglineHelper": "One line on what you make.",
  "metaForm.taglinePlaceholder":
    "e.g. After-hours electronics for queer dancefloors",
  "metaForm.bioLabel": "Bio",
  "metaForm.bioHelper":
    "At least 80 characters to publish a standalone persona. Type @ to mention a member, c/ a community, e/ an event or t/ a forum thread, and it becomes a link.",
  "metaForm.bioPlaceholder": "A few sentences in your own words.",
  "metaForm.linkLabel": "Link to your main profile",
  "metaForm.addressLabel": "Profile address",
  "metaForm.addressPlaceholder": "e.g. engineering",
  "metaForm.handleLabel": "Handle",
  "metaForm.visibilityLabel": "Who can see it",

  // Presence fields (SubprofilePresenceFields): cover, accent, availability, CTA
  "metaForm.coverLabel": "Cover image",
  "metaForm.coverHelper":
    "A wide banner across the top of your persona page. Frame it at 3:1 (at least 1500 × 500px); the page keeps whatever you centre in the frame, and trims a little from the top and bottom on wide screens.",
  "metaForm.coverPlaceholder": "Cover image",
  "metaForm.accentLabel": "Accent colour",
  "metaForm.bannerEdgeLabel": "Banner edge",
  "metaForm.bannerEdgeHelper":
    "Choose how the cover meets the page. Add a cover image to enable this.",
  "metaForm.bannerEdgeContained": "Contained",
  "metaForm.bannerEdgeBleed": "Bleed into page",
  "metaForm.availabilityLabel": "Availability",
  "metaForm.availabilityUnset": "Not set",
  "metaForm.ctaLabelLabel": "Button label",
  "metaForm.ctaLabelPlaceholder": "e.g. Book a session",
  "metaForm.ctaUrlLabel": "Button link",
  "metaForm.ctaUrlPlaceholder": "https://",
  "metaForm.ctaHelper":
    "Add both a label and a link to show a button on your page.",
  "metaForm.ctaMismatch": "Add both a label and a link, or leave both blank.",

  "metaForm.leaveConfirm":
    "You have unsaved changes to this profile. Leave without saving them?",

  // Item drawer (SubprofileItemDrawerFields, opened by SubprofileItemDrawer)
  // Fallback label in a reorder row for an image-only item with no title
  // (e.g. a photo-gallery photo) — sits beside its thumbnail preview.
  "itemEditor.untitledPhoto": "Photo",
  "itemEditor.moveUp": "Move up",
  "itemEditor.moveDown": "Move down",
  "itemEditor.dragToReorder": "Drag to reorder",
  "itemEditor.remove": "Remove",
  "itemEditor.tagsHelper": "Separate with commas",
  "itemEditor.feature": "Make this the spotlight",
  "itemEditor.unfeature": "Remove from spotlight",

  // Collaborator member picker (CollaboratorSelect, inside SubprofileItemDrawerFields)
  "itemEditor.collaboratorsLabel": "Collaborators",
  "itemEditor.collaboratorsPlaceholder": "Search members to credit",
  "itemEditor.collaboratorsSearchPlaceholder": "Search by name or @handle",
  "itemEditor.collaboratorsEmpty": "No members match that search.",
  "itemEditor.collaboratorsHelper":
    "Search for members and pick them to credit their work here.",
  "itemEditor.collaboratorsCapHint":
    "That's the most collaborators you can add.",

  // Social links editor (SubprofileSocialLinksEditor)
  "socialEditor.title": "Social links",
  "socialEditor.add": "Add a link",
  "socialEditor.platformLabel": "Link platform",
  "socialEditor.linkFor": "{platform} link",
  "socialEditor.removeLinkFor": "Remove {platform} link",
  "socialEditor.other": "Other link",
  "socialEditor.capHint": "That's the most links you can add.",

  // Per-item links editor (projects / open-source items)
  "itemLinks.label": "Links",
  "itemLinks.helper": "Add a repo, live demo, or docs link.",
  "itemLinks.add": "Add link",

  // Section editor (SubprofileSectionEditor)
  "sectionEditor.empty": "Nothing here yet. Add your first when you're ready.",
  "sectionEditor.addTo": "Add to {section}",
  "sectionEditor.capHint": "That's the most you can add to one section.",

  // Publish panel (SubprofilePublishPanel)
  "publishPanel.successTitle": "You're",
  "publishPanel.successEm": "live",
  "publishPanel.closeLabel": "Keep editing",
  "publishPanel.viewLive": "See it live",
  "publishPanel.successLinked":
    "This persona now shows on your main profile as one of your personas.",
  "publishPanel.successUnlinked":
    "This persona stands on its own now. People can find it by its handle and in the directory.",
  "publishPanel.copyPublished":
    "This persona is live. Your edits save as you go.",
  "publishPanel.copyLinkedUnpublished":
    "Publish to show this persona on your main profile.",
  "publishPanel.copyUnlinkedUnpublished":
    "Publish to give this persona its own handle and a directory listing.",
  "publishPanel.moveToDraft": "Move to draft",
  "publishPanel.working": "Working…",
  "publishPanel.publish": "Publish",
  "publishPanel.publishing": "Publishing…",
  "publishPanel.recheck": "Re-check & publish",
  "publishPanel.toastLive": "Your persona is live",
  "publishPanel.toastPublishError":
    "We couldn't publish. Check the requirements below.",
  "publishPanel.toastUnpublished": "Back to draft. Only you can see it now.",
  "publishPanel.toastError": "We couldn't do that just now. Try again.",

  // New persona wizard, two steps (NewSideModal + NewSideStepCraft +
  // NewSideStepIdentity). Step 1 picks the craft; step 2 names it and
  // chooses linked-vs-unlinked.
  "newModal.stepCraftTitle": "Start a new <em>persona</em>",
  "newModal.sub":
    "Each one is a professional persona of yours. Pick what it's for.",
  "newModal.stepIdentityTitle": "Give it a <em>name</em>",
  "newModal.stepIdentitySub":
    "How it's known, and whether people can tell it's you.",
  "newModal.stepOf": "Step {step} of {total}",
  "newModal.cancel": "Cancel",
  "newModal.back": "Back",
  "newModal.continue": "Continue",
  "newModal.create": "Create draft",
  "newModal.creating": "Creating…",
  "newModal.craftSummary":
    "A {kind} persona gets a {skin} page with {sections}.",
  "newModal.displayNameLabel": "Display name",
  "newModal.displayNameHelper":
    "Optional. Leave it blank to be known by the profession.",
  "newModal.displayNamePlaceholderDefault": "How this persona is known",
  "newModal.displayNamePlaceholderExample": "e.g. {kind}",
  "newModal.linkChoiceLabel": "Linked to your profile, or its own address?",
  "newModal.linkedAddressNote": "Always yours. Nothing to claim.",
  "newModal.standaloneNote":
    "Its own address, with nothing pointing back to you. Yours to keep separate.",
  "newModal.handleStateClaim":
    "Yours if you publish first. Handles are first come, first served.",
  "newModal.toastError": "We couldn't start that one. Try again.",

  // Duplicate a persona — start-method picker (StartMethodPicker) and
  // copy-source/mode picker (CopySourcePicker, CopyModePreview), both used
  // from the create flow when the owner already has other personas.
  "start.label": "How do you want to start?",
  "start.helper": "Pick a starting point. You can change everything later.",
  "start.copyDisabledHelper":
    "Create a persona first, then you can copy it here.",
  "start.template": "By craft",
  "start.blank": "Blank",
  "start.copy": "Copy one",
  "copy.noSources": "You don't have any personas to copy yet.",
  "copy.sourceLabel": "Choose a persona to copy",
  "copy.modeLabel": "What to copy",
  "copy.modeFull": "Everything",
  "copy.modeContent": "Content only",
  "copy.summaryCounts": "{items} items · {links} links",
  "copy.summaryAffiliations": "{affiliations} affiliations",
  "copy.summaryIdentity": "· plus name, bio & style",
  "copy.summaryNoIdentity": "· identity left blank",

  // Craft families (kindFamilies.data.ts) — the create flow's "By craft"
  // step groups the 17 kinds under these six shared page families.
  "family.stage.label": "Stage",
  "family.stage.note": "For crafts that happen in front of a room.",
  "family.studio.label": "Studio",
  "family.studio.note": "Work first, captions second.",
  "family.page.label": "Page",
  "family.page.note": "A book column. Words carry it.",
  "family.workshop.label": "Workshop",
  "family.workshop.note": "Built things, listed plainly.",
  "family.practice.label": "Practice",
  "family.practice.note": "Calm, credible, no display type.",
  "family.table.label": "Table",
  "family.table.note": "A menu sheet for what you make and pour.",
  "family.chart.label": "Chart",
  "family.chart.note": "An ephemeris page, read by the sky.",
  // Expanded craft families (personas expansion — 6 new page families)
  "family.chair.label": "Chair",
  "family.chair.note":
    "A lit mirror and a price list that never asks your gender.",
  "family.runway.label": "Runway",
  "family.runway.note":
    "A lookbook spread: enormous name, tiny credits, tall images.",
  "family.gallery.label": "Gallery",
  "family.gallery.note": "Museum air. Every item is a wall label.",
  "family.history.label": "Record",
  "family.history.note":
    "Aged paper and a timeline: dates in the margin, sources named.",
  "family.collective.label": "Poster",
  "family.collective.note":
    "Riso ink on cheap paper: a demand at the top, dates you read across a room.",
  "family.classroom.label": "Classroom",
  "family.classroom.note":
    "A board and a handout: numbered weeks, fees stated before you ask.",

  // Starter templates (Phase 4a) — create-time picker (NewSideModal)
  // and the in-editor "Insert examples" affordance (SubprofileSectionEditor).
  // Section-item copy reads as friendly, editable placeholders — a creator
  // is meant to replace them with their own work, not keep them as-is.
  "template.insertExamples": "Insert examples",

  // Per-kind suggested taglines — applied alongside the section templates,
  // but left fully editable.
  "template.tagline.developer": "Building things, mostly for people I love.",
  "template.tagline.writer": "Words I couldn't keep to myself.",
  "template.tagline.musician": "Sound for queer nights and quiet mornings.",
  "template.tagline.visual_artist": "Images that hold what words can't.",
  "template.tagline.filmmaker": "Stories told frame by frame.",
  "template.tagline.designer":
    "Making things easier, and a little more beautiful.",
  "template.tagline.maker": "Made by hand, made with care.",
  "template.tagline.drag": "Glamour with a point to make.",
  "template.tagline.dj": "Sets built for the dancefloor.",
  "template.tagline.dancer": "Movement as another way of speaking.",
  "template.tagline.performer": "On stage, for whoever needs it.",
  "template.tagline.photographer": "Holding still what usually moves too fast.",
  "template.tagline.videomaker": "Moving pictures, made with intention.",
  "template.tagline.chef": "Cooking for queer tables, one plate at a time.",
  "template.tagline.mixologist": "Drinks mixed for the night ahead.",
  "template.tagline.therapist": "An affirming space to think things through.",
  "template.tagline.astrologer":
    "Charts read slowly, for the life you're living.",
  "template.tagline.pole_dancer":
    "On the pole and in the room: I perform, and I teach.",
  "template.tagline.generic": "A few things I've made, gathered here.",

  // Per-section example items (used by both the create-time template and
  // the "Insert examples" button) — one or two items per section, matching
  // that section's actual fields.
  "template.section.projects.item1.title": "My standout project",
  "template.section.projects.item1.desc":
    "A line or two on what you built and why it matters.",
  "template.section.projects.item2.title": "Another project worth showing",
  "template.section.projects.item2.desc":
    "What it does, who it's for, and what you learned building it.",
  "template.section.open_source.item1.title": "A project I contribute to",
  "template.section.open_source.item1.desc":
    "What it does, and how you're involved: maintainer, contributor, or just started.",
  "template.section.publications.item1.title": "Something I wrote",
  "template.section.publications.item1.subtitle": "Where it was published",
  "template.section.publications.item1.desc":
    "A line on what it's about and why you wrote it.",
  "template.section.readings.item1.title": "A reading or event",
  "template.section.readings.item1.subtitle": "Where it happened",
  "template.section.discography.item1.title": "A release",
  "template.section.discography.item1.subtitle": "Track, EP or album",
  "template.section.gigs.item1.title": "A gig",
  "template.section.gigs.item1.subtitle": "Where you played",
  "template.section.portfolio.item1.title": "A piece I made",
  "template.section.portfolio.item1.desc":
    "What it is and what went into making it.",
  "template.section.portfolio.item2.title": "Another piece",
  "template.section.portfolio.item2.desc":
    "A second example. Swap in whatever shows your range.",
  "template.section.exhibitions.item1.title": "An exhibition",
  "template.section.exhibitions.item1.subtitle": "Where it showed",
  "template.section.filmography.item1.title": "A film I made",
  "template.section.filmography.item1.subtitle": "Your role on it",
  "template.section.filmography.item1.desc":
    "What it's about, in a sentence or two.",
  "template.section.screenings.item1.title": "A screening",
  "template.section.screenings.item1.subtitle": "Where it played",
  "template.section.selected_work.item1.title": "A project I'm proud of",
  "template.section.selected_work.item1.subtitle": "The client or brief",
  "template.section.selected_work.item1.desc":
    "What you made and the problem it solved.",
  "template.section.clients.item1.title":
    "A client or brand you've worked with",
  "template.section.collections.item1.title": "A collection",
  "template.section.collections.item1.desc":
    "What it's made of and what inspired it.",
  "template.section.workshops.item1.title": "A workshop I ran",
  "template.section.workshops.item1.subtitle": "Where it happened",
  "template.section.shows.item1.title": "A show",
  "template.section.shows.item1.subtitle": "Where you performed",
  "template.section.looks.item1.title": "A look",
  "template.section.looks.item1.desc": "What inspired it and how you built it.",
  "template.section.mixes.item1.title": "A mix",
  "template.section.mixes.item1.subtitle": "Where you played it",
  "template.section.mixes.item2.title": "Another mix",
  "template.section.mixes.item2.subtitle": "A second example to swap in",
  "template.section.performances.item1.title": "A performance",
  "template.section.performances.item1.subtitle": "Where it happened",
  "template.section.classes.item1.title": "A class I teach",
  "template.section.classes.item1.subtitle": "Level · studio",
  "template.section.classes.item1.desc": "What it covers and who it's for.",
  "template.section.reel.item1.title": "My reel",
  "template.section.reel.item1.desc": "What it shows and where it's from.",
  "template.section.appearances.item1.title": "An appearance",
  "template.section.appearances.item1.subtitle": "The show, event or stage",
  "template.section.series.item1.title": "A series",
  "template.section.series.item1.desc":
    "What it's about and what ties it together.",
  "template.section.videos.item1.title": "A video",
  "template.section.videos.item1.subtitle": "Where it's from",
  "template.section.videos.item1.desc": "What it shows, in a line or two.",
  "template.section.showcase.item1.title": "Something I made",
  "template.section.showcase.item1.subtitle": "A short label for it",
  "template.section.showcase.item1.desc": "What it is and why it's here.",
  "template.section.menus.item1.title": "A menu or signature dish",
  "template.section.menus.item1.subtitle": "The event or venue",
  "template.section.menus.item1.desc":
    "What's on it and the story behind the plate.",
  "template.section.residencies.item1.title": "A residency or pop-up",
  "template.section.residencies.item1.subtitle": "Where it happened",
  "template.section.cocktails.item1.title": "A signature cocktail",
  "template.section.cocktails.item1.subtitle": "The base spirit",
  "template.section.cocktails.item1.desc": "What's in it and what inspired it.",
  "template.section.specialisms.item1.title": "An area I work with",
  "template.section.specialisms.item1.desc":
    "Who it's for and how you approach it.",
  "template.section.credentials.item1.title": "A qualification or training",
  "template.section.credentials.item1.subtitle": "The awarding body",
  "template.section.charts.item1.title": "A reading you offer",
  "template.section.charts.item1.subtitle": "Length · price",
  "template.section.charts.item1.desc": "What it covers, and who it's for.",
  "template.section.sky.item1.title": "A circle or workshop",
  "template.section.sky.item1.subtitle": "Where it happens",
  "template.section.sky.item1.desc":
    "What to expect. No prior knowledge assumed.",

  // Image upload field (ImageUploadField)
  "imageUpload.defaultPlaceholder": "Image",
  "imageUpload.change": "Change",
  "imageUpload.add": "Add image",
  "imageUpload.remove": "Remove image",
  "imageUpload.removeConfirm.title": "Remove this image?",
  "imageUpload.removeConfirm.body":
    "It'll be cleared from this field. You can add another one anytime.",
  "imageUpload.removeConfirm.confirm": "Remove",
  "imageUpload.removeConfirm.cancel": "Keep it",

  // Certificate photo on a credentials/trainings item: the editor field's
  // placeholder and privacy note (SubprofileItemDrawerFields), and the public
  // row thumbnail with its full-size viewer (CredentialProofThumb).
  "credentialPhoto.placeholder": "Photo of your certificate",
  "credentialPhoto.privacyNote":
    "Anyone who visits this page can see this photo. Before you upload it, cover any ID numbers and any name you don't want shown.",
  "credentialPhoto.alt": "Certificate for {title}",
  "credentialPhoto.openAria": "Open the certificate for {title} full-screen",

  // Banner reposition (PersonaCoverReposition) — the owner's in-page control
  // for where the cover image sits vertically inside the band.
  "cover.reposition.cta": "Reposition",
  "cover.reposition.hint": "Drag the banner up or down",
  "cover.reposition.save": "Save position",
  "cover.reposition.saving": "Saving…",
  "cover.reposition.cancel": "Cancel",
  "cover.reposition.saved": "Banner position saved",
  "cover.reposition.error":
    "We couldn't save the banner position. Try again in a moment.",
  "cover.reposition.noRoomAria":
    "Reposition banner. This image already fits the banner exactly, so there's nothing to move.",
  "cover.reposition.sliderAria":
    "Banner position. Drag, or use the arrow keys. Enter saves, Escape cancels.",
  "cover.reposition.valueText": "{percent}% down the image",

  // Persona hero (SubprofileHero)
  "hero.message": "Message",
  "hero.edit": "Edit persona",
  "hero.viewAsVisitor": "View as visitor",
  "hero.report.cta": "Report this persona",
  "hero.more.ariaLabel": "More actions for {name}",
  "hero.viewPhotoAria": "View photo of {name}",
  "hero.standalone": "Standalone · {address}",
  "hero.noAddressYet": "No address yet: set a handle to give it one",

  // Workshop-skin title block (SubprofileTitleBlock) — decorative dl shown
  // only on the workshop skin (CSS-gated); `state` reads "Draft" in preview
  // mode (the Phase-3 editor), "Published" everywhere else — a persona page
  // is only reachable once published.
  "hero.titleblock.craft": "Craft",
  "hero.titleblock.address": "Address",
  "hero.titleblock.sections": "Sections",
  "hero.titleblock.state": "State",

  // Endorse control (SubprofileEndorse)
  "hero.endorse.cta": "Endorse",
  "hero.endorse.endorsed": "Endorsed",
  "hero.endorse.count_one": "{count} endorsement",
  "hero.endorse.count_other": "{count} endorsements",
  "hero.endorse.error": "We couldn't save that just now. Try again.",
  "hero.endorse.endorsedByNames": "Endorsed by {names}",

  // Endorse-with-note modal (EndorseSubprofileModal, EndorseSubprofileModalParts)
  "hero.endorse.modal.ariaLabel": "Endorse {name}",
  "hero.endorse.modal.eyebrow": "Add your endorsement",
  "hero.endorse.modal.title": "Endorse <em>{name}</em>",
  "hero.endorse.modal.sub":
    "An endorsement is you, publicly, backing {name}'s work. Add a note if you like. A word on what they're great at means more than the number alone.",
  "hero.endorse.modal.noteLabel": "Your note",
  "hero.endorse.modal.optional": "optional",
  "hero.endorse.modal.notePlaceholder":
    "What makes {name} worth endorsing? What should other people know?",
  "hero.endorse.modal.noteOptional": "Optional, but a note means more",
  "hero.endorse.modal.charsCount_one": "{count} character",
  "hero.endorse.modal.charsCount_other": "{count} characters",
  "hero.endorse.modal.cancel": "Cancel",
  "hero.endorse.modal.save": "Save note",
  "hero.endorse.modal.withdraw": "Withdraw endorsement",
  "hero.endorse.modal.sending": "Saving…",
  "hero.endorse.modal.you": "You",
  "hero.endorse.modal.savedToast": "Your note is saved.",
  "hero.endorse.modal.withdrawnToast": "Your endorsement was withdrawn.",
  "hero.endorse.modal.success.title":
    "Thank you for your <em>endorsement</em>.",
  "hero.endorse.modal.success.body":
    "Your face just joined <b>{name}</b>'s endorsers. That's how good work travels here. Person by person, name by name.",
  "hero.endorse.modal.success.doneCta": "Done",

  // Follow control (SubprofileFollow)
  "hero.follow.cta": "Follow",
  "hero.follow.following": "Following",
  "hero.follow.count_one": "{count} follower",
  "hero.follow.count_other": "{count} followers",
  "hero.follow.error": "We couldn't save that just now. Try again.",

  // Share control (SubprofileShare, MySubprofilesPage)
  "share.cta": "Share",
  "share.ariaLabel": "Share this persona",
  // Toast of last resort when the share URL resolves to null, and the
  // accessible name of the DISABLED Share button on an addressless persona.
  // The aria one REPLACES the name, so it reads as a whole label. PRD-206.
  "share.noAddressYet":
    "This persona has no address yet, so there is nothing to share.",
  "share.noAddressAria":
    "Share this persona. Unavailable until it has an address.",
  "share.copied": "Link copied",
  "share.copyFailed":
    "Your browser wouldn't let us copy that. The link is right there, select it and copy it by hand.",
  "share.copyFailedWithUrl":
    "Your browser wouldn't let us copy that. Here is the link: {url}",
  "share.resolvingAddress":
    "One moment, we're looking up this persona's address.",

  // Share-card modal (SubprofileShareCard) + QR code (SubprofileQR) —
  // entry points in SubprofileHero (public) and MySubprofilesPage (owner).
  "shareCard.title": "Take it with you",
  "shareCard.subtitle":
    "Scan to open {name}'s page on another device, or save the details below.",
  "shareCard.download": "Download contact card",
  "shareCard.qrAria": "QR code linking to {name}'s persona page",
  "shareCard.copyLink": "Copy link",
  "qr.error": "Couldn't generate a QR code. Here's the link instead.",

  // Featured item spotlight (SubprofileSpotlight)
  "spotlight.eyebrow": "Start here",
  "spotlight.open": "Open",

  // Collaborator credits on a public item (ItemCollaborators, in
  // SubprofileSections; also SubprofileSpotlight's featured-item credits)
  "collab.with": "with",

  // Section item rows (SubprofileItemRow) — stage-skin gig details.
  "row.doors": "Doors {doors}",
  "row.ticketAria": "Buy tickets for {title}",
  "row.played": "Played",

  // Section item tiles (SubprofileItemTile) — visual-section grid; the
  // "plate" number is studio-skin decoration (CSS-hidden elsewhere).
  "tile.plate": "Pl. {number}",

  // Caption-less gallery section (SubprofileSections) — per-photo alt text,
  // since these tiles carry no title/subtitle of their own.
  galleryPhotoAlt: "{name}, gallery photo {number}",
  // Clickable gallery cell + the full-screen gallery lightbox (GalleryLightbox).
  galleryPhotoOpen: "Open {name}'s photo {number} full-screen",
  galleryLightboxLabel: "{name}'s photos",

  // Gallery-section editor cap (SubprofileSectionEditor) — shown in place of
  // the Add affordance once the universal gallery section hits its 6-photo max.
  galleryFull: "6 photos maximum",

  // Add-photos-to-gallery modal (multi-add) — device upload + past-uploads
  // picker, shown from the gallery section's Add affordance.
  "gallery.addTitle": "Add photos",
  "gallery.remaining": "Add up to {count} more",
  "gallery.fromDevice": "Upload from device",
  "gallery.uploading": "Uploading… {percent}%",
  "gallery.pastUploads": "Your past uploads",
  "gallery.empty": "Nothing uploaded yet. Add from your device above.",
  "gallery.loadError": "Couldn't load your uploads.",
  "gallery.retry": "Try again",
  "gallery.selectPhoto": "Add this photo",
  "gallery.deselectPhoto": "Remove this photo",
  "gallery.inUse": "In use",
  "gallery.addCta": "Add {count} to gallery",
  "gallery.someSkipped": "Only {count} could be added. The gallery holds 6.",

  // Public persona page (SubprofilePage.tsx)
  "page.loading": "Loading persona…",
  "page.ownerTie": "Another persona from <em>{name}</em>",
  "page.notFoundTitle": "This persona isn't here",
  "page.notFoundMetaTitle": "Persona not found · QueerPulse",
  "page.notFoundDescription":
    "It may have been unpublished, kept private, or this link could be out of date. Nothing's wrong on your end.",
  "page.notFoundAction": "Browse personas",
  "page.previewBanner":
    "You're seeing this persona as a <strong>visitor</strong> does.",
  "page.exitPreview": "Exit preview",

  // The other three "can't show you this" walls (SubprofilePageStates) —
  // built and ready, not yet reachable from the current data layer (see
  // subprofilePageStates.data.ts for why).
  "pageState.private.title": "This persona is private",
  "pageState.private.description":
    "Its owner keeps this one to themselves for now. Nothing's wrong on your end.",
  "pageState.private.action": "Browse the directory",
  "pageState.membersOnly.title": "Members only",
  "pageState.membersOnly.description":
    "This persona is visible to signed-in members of the community.",
  "pageState.membersOnly.action": "Sign in",
  "pageState.membersOnly.secondaryAction": "Request an invite",
  "pageState.removed.title": "This persona was taken down",
  "pageState.removed.description":
    "It no longer meets our community guidelines and isn't visible anymore.",
  "pageState.removed.action": "Read the guidelines",

  // Owner-viewing-own-draft banner (SubprofileDraftBanner) — built, not yet
  // wired (see the component's own doc comment for why).
  "draftBanner.message": "Draft. Nobody else can open this address yet.",
  "draftBanner.readiness": "{ready} of {total} ready to publish",
  "draftBanner.edit": "Edit",
  "draftBanner.publish": "Publish",

  // Dashboard card's draft-readiness ring (SideReadinessRing, Phase 2) —
  // accessible name for the `.ring`; the visible `<i>` shows the bare
  // number, this spells out what it means.
  "ring.ariaLabel": "{pct}% complete",

  // Dashboard card (SideCard, Phase 2 Task 5) — copy not already covered by
  // `mine.*` (name fallback, endorsement/follower counts, Edit/Delete),
  // `share.*` (Share), `status.*` (Draft), or `link.*`/`availability.*` (the
  // tie/avail pill labels).
  "side.noTagline": "No line yet",
  "side.statusLive": "Live",
  "side.viewCta": "View",
  // Above the dashboard card action row when View and Share are disabled,
  // and the `aria-describedby` target for both. "View" and "Share" here must
  // match `side.viewCta` and `share.cta` in each language. PRD-206.
  "side.noAddressNote":
    "No address yet. Give it a handle and publish it, and View and Share come alive.",
  "side.thingsLeft_one": "{count} thing left",
  "side.thingsLeft_other": "{count} things left",
  "side.readyToPublish": "Ready to publish",
  "side.coOwners": "{count} co-owners",

  // Affiliations ("Part of") — public section (SubprofileAffiliations) and
  // the owner editor (SubprofileAffiliationsEditor, SubprofileAffiliationRow).
  // `role` is a PRESET, PERSISTED field (AFFILIATION_ROLE_KEYS in
  // affiliations.data.ts) — label-key indirection, same pattern as `kind`.
  // Foot endorser-quote preview (SubprofileAffiliations) — "See all N" opens
  // SubprofilePeopleModal in its endorsements mode.
  "foot.seeAllEndorsements_one": "See all {count} endorsement",
  "foot.seeAllEndorsements_other": "See all {count} endorsements",

  "affiliation.heading": "Part of",
  "affiliation.type.event": "Event",
  "affiliation.type.community": "Community",
  "affiliation.role.performing": "Performing",
  "affiliation.role.attending": "Attending",
  "affiliation.role.hosting": "Hosting",
  "affiliation.role.member": "Member",
  "affiliation.role.mod": "Mod",
  "affiliation.role.founder": "Founder",

  "affiliationsEditor.title": "Part of",
  "affiliationsEditor.note":
    "Link this persona to communities you're in and events you're going to.",
  "affiliationsEditor.empty":
    "Nothing linked yet. Add an event or community below.",
  "affiliationsEditor.typeLabel": "Type",
  "affiliationsEditor.roleLabel": "Role",
  "affiliationsEditor.targetLabel.event": "Event",
  "affiliationsEditor.targetLabel.community": "Community",
  "affiliationsEditor.targetPlaceholder.event": "Choose an event",
  "affiliationsEditor.targetPlaceholder.community": "Choose a community",
  "affiliationsEditor.optionsLoading": "Loading your events and communities…",
  "affiliationsEditor.optionsError":
    "We couldn't load your events and communities.",
  "affiliationsEditor.optionsUnavailable": "Not available right now",
  "affiliationsEditor.retry": "Try again",
  "affiliationsEditor.noOptions.community":
    "You're not in any communities yet.",
  "affiliationsEditor.noOptions.event": "You're not going to any events yet.",
  "affiliationsEditor.allLinked.community":
    "You've linked every community you're in.",
  "affiliationsEditor.allLinked.event":
    "You've linked every event you're going to.",
  "affiliationsEditor.browse.community": "Browse communities",
  "affiliationsEditor.browse.event": "Browse gatherings",
  "affiliationsEditor.eventOptionLabel": "{name} ({date})",
  "affiliationsEditor.add": "Add a link",
  "affiliationsEditor.capHint": "That's the most links you can add.",

  // Co-owners panel (SubprofileOwnersPanel, in the editor)
  "owners.title": "Co-owners",
  "owners.note": "Everyone here can edit this persona together.",
  "owners.creatorTag": "Creator",
  "owners.youTag": "You",
  "owners.pendingHeading": "Pending invites",
  "owners.inviteCta": "Invite a co-owner",
  "owners.revokeAria": "Revoke the invite to {name}",
  "owners.toastRevoked": "Invite revoked",
  "owners.toastRevokeError": "We couldn't revoke that just now. Try again.",
  "owners.leaveCta": "Leave persona",
  "owners.leaveModalTitle": "Leave this persona?",
  "owners.leaveModalBody":
    "You'll lose the ability to edit it. The other co-owners keep everything as it is.",
  "owners.leaveModalBodyCreator":
    "You'll lose editing access. The co-owner who's been here longest becomes the creator and can change its address or visibility, or delete it.",
  "owners.leaveModalKeep": "Stay",
  "owners.leaveModalConfirm": "Leave",
  "owners.leaveModalLeaving": "Leaving…",
  "owners.toastLeft": "You've left this persona",
  "owners.toastLeaveError": "We couldn't do that just now. Try again.",
  "owners.removeAria": "Remove {name} as a co-owner",
  "owners.removeConfirmTitle": "Remove {name}?",
  "owners.removeConfirmBody":
    "{name} loses every bit of access to this persona: editing, publishing, invites. They keep nothing. You can invite them back later if you want to.",
  "owners.removeConfirmAction": "Remove co-owner",
  "owners.toastRemoved": "{name} no longer co-owns this persona",
  "owners.toastRemoveError": "We couldn't remove them just now. Try again.",

  // Invite-a-co-owner modal (InviteCoOwnerModal)
  "invite.title": "Invite a co-owner",
  "invite.sub": "They'll need to accept before they can manage this persona.",
  "invite.searchPlaceholder": "Search your connections",
  "invite.empty": "No connections left to invite.",
  "invite.inviting": "Inviting…",
  "invite.toastSent":
    "Invite sent. They'll need to accept before they can manage this persona.",
  "invite.toastError": "We couldn't send that invite. Try again.",

  // Invite-a-co-owner modal — disclosure/confirm step (IDN-2): shown before
  // the invite actually sends, so accepting a co-owner invite is never a
  // surprise about how much access it grants or, for an Unlinked persona,
  // what it reveals.
  "invite.confirmTitle": "Before you send this invite",
  "invite.confirmBack": "Back",
  "invite.confirmSend": "Send invite",
  "invite.disclosureAccessTitle": "Full management access",
  "invite.disclosureAccessBody":
    "Once {name} accepts, they'll be able to edit, publish and manage every part of this persona, the same as you can. This is the only access level co-owners get.",
  "invite.disclosureIdentityTitle": "This reveals your identity",
  "invite.disclosureIdentityBody":
    "This persona is Unlinked, so people who follow it can't tell it's yours. Accepting this invite is different: {name} will be able to see your real account the moment they accept.",
  "invite.acknowledgeLinked":
    "I understand {name} will get full management access to this persona.",
  "invite.acknowledgeUnlinked":
    "I understand {name} will get full management access to this persona, and will be able to see my real identity.",

  // Incoming co-owner invites banner (PersonaInvitesBanner, on MySubprofilesPage)
  "invites.regionLabel": "Invitations to co-own a persona",
  "invites.message": "{inviter} invited you to co-own <em>{persona}</em>",
  "invites.accept": "Accept",
  "invites.accepting": "Accepting…",
  "invites.decline": "Decline",
  "invites.declining": "Declining…",
  "invites.toastAccepted": "You now co-own {name}",
  "invites.toastAcceptError": "We couldn't accept that invite. Try again.",
  "invites.toastDeclined": "Invite declined",
  "invites.toastDeclineError": "We couldn't decline that invite. Try again.",

  // Accept-invite disclosure/confirm step (IDN-2): shown before an incoming
  // co-owner invite is actually accepted, the invitee-side twin of
  // InviteCoOwnerModal's send-side confirm step above. Accepting is never a
  // surprise about the access it grants or, for an Unlinked persona, what it
  // reveals about the person accepting.
  "invites.confirmTitle": "Before you accept",
  "invites.confirmSub": "About co-owning {name}",
  "invites.confirmCancel": "Not yet",
  "invites.confirmAccept": "Accept invite",
  "invites.disclosureAccessTitle": "Full management access",
  "invites.disclosureAccessBody":
    "Accepting gives you the same full access as {name}'s other co-owners: you'll be able to edit, publish and manage every part of it. This is the only access level co-owners get, there's no view-only tier.",
  "invites.disclosureIdentityTitle": "This reveals your identity",
  "invites.disclosureIdentityBody":
    "{name} is Unlinked, so people who follow it can't tell who runs it. Accepting this invite is different: your real account becomes visible to its other co-owners the moment you accept, and theirs becomes visible to you.",
  "invites.acknowledgeLinked":
    "I understand accepting gives me full management access to {name}.",
  "invites.acknowledgeUnlinked":
    "I understand accepting gives me full management access to {name}, and reveals my real identity to its other co-owners.",

  // Report modal (SubprofileReportModal) + persona-specific reasons
  // (subprofileReportModal.data.ts) — every reason still maps to a stable,
  // existing ReasonCode (see that file's own doc comment), so this is purely
  // display copy layered over the shared /reports taxonomy.
  "reportModal.title": "Report {name}?",
  "reportModal.lead":
    "Reports are reviewed by our moderation team. Your name is never shared with the person you're reporting.",
  "reportModal.reasonLabel": "What's the concern?",
  "reportModal.reasons.impersonating": "Impersonating",
  "reportModal.reasons.hateOrHarassment": "Hate or harassment",
  "reportModal.reasons.discrimination": "Discrimination or misgendering",
  "reportModal.reasons.notReal": "Not a real practice or service",
  "reportModal.reasons.sexualContent": "Sexual content without a warning",
  "reportModal.reasons.spam": "Spam",
  "reportModal.reasons.somethingElse": "Something else",
  "reportModal.noteLabel": "Anything else? (optional)",
  "reportModal.notePlaceholder":
    "Add any detail that might help a moderator review this.",
  "reportModal.cancelCta": "Cancel",
  "reportModal.submitCta": "Send report",
  "reportModal.submitting": "Sending…",
  "reportModal.error": "We couldn't send that report. Try again.",
  "reportModal.success.title": "Report sent",
  "reportModal.success.body":
    "Thank you. A moderator will review this persona. We may contact you for more detail, but we'll never share your report with them.",
  "reportModal.success.doneCta": "Done",

  // People modal (SubprofilePeopleModal) — followers / endorsers list,
  // opened from the hero's ".pp-meta" buttons and the foot's "See all N".
  "peopleModal.followersTitle_one": "{count} follower",
  "peopleModal.followersTitle_other": "{count} followers",
  "peopleModal.endorsementsTitle_one": "{count} endorsement",
  "peopleModal.endorsementsTitle_other": "{count} endorsements",
  "peopleModal.loading": "Loading…",
  "peopleModal.noEndorsements": "No endorsements yet",
  "peopleModal.noFollowers": "No followers yet",
  "peopleModal.noNote": "Endorsed without a note",
  "peopleModal.removeAriaLabel": "Remove your endorsement of {name}",
  "peopleModal.removeError": "We couldn't remove that just now. Try again.",
  "peopleModal.followersPrivateTitle": "Followers are private",
  "peopleModal.followersPrivateBody":
    "Only the owner of {name} can see who follows. For everyone else, following stays anonymous. Your name never shows up here.",

  // Skin-specific extras (SubprofileSkinExtras + skins/*.tsx) — the
  // per-family blocks the Phase-1 design tree calls SkinExtras.
  "skinExtras.stage.nextUpLabel": "Next up",
  "skinExtras.stage.bookerTitle": "For bookers",
  "skinExtras.stage.bookerFee": "Fee",
  "skinExtras.stage.bookerRider": "Rider",
  "skinExtras.stage.bookerPress": "Press",
  "skinExtras.stage.bookerContact": "Contact",

  "skinExtras.studio.checklistTitle": "Checklist",
  "skinExtras.studio.plateLabel": "Plate {n}",
  "skinExtras.studio.previous": "Previous work",
  "skinExtras.studio.next": "Next work",

  "skinExtras.page.excerptFrom": "From",

  "skinExtras.workshop.scaleLabel": "Not to scale",

  "skinExtras.practice.fee": "Fee",
  "skinExtras.practice.sliding": "Sliding scale",
  "skinExtras.practice.length": "Session length",
  "skinExtras.practice.languages": "Languages",
  "skinExtras.practice.mode": "Format",
  "skinExtras.practice.next": "Next availability",
  "skinExtras.practice.firstSessionTitle": "What a first session looks like",
  "skinExtras.practice.accessTitle": "The room itself",
  "skinExtras.practice.referralsNote":
    "No public testimonials. Client confidentiality comes first. These are simply people who've referred others here.",
  "skinExtras.practice.approachTitle": "How I work",
  "skinExtras.practice.trainingTitle": "Training & qualifications",
  "skinExtras.practice.feesTitle": "Fees",
  "skinExtras.practice.venueTitle": "Where I practise",
  "skinExtras.practice.availabilityTitle": "Availability",
  "skinExtras.practice.availabilitySlot": "Sessions usually start at {time}",
  "skinExtras.practice.availabilityOpen": "Open",
  "skinExtras.practice.availabilityFull": "Full",
  "skinExtras.practice.vouchesTitle": "Vouched for by the community",

  "skinExtras.chart.skyNowLabel": "The sky today",
  "skinExtras.chart.birthDataTitle": "What I need from you",
  "skinExtras.chart.birthDate": "Date",
  "skinExtras.chart.birthTime": "Time",
  "skinExtras.chart.birthPlace": "Place",
  "skinExtras.chart.ethicsTitle": "What a reading is not",
  // Expanded skin extras (personas expansion — chair/runway/gallery/history/collective/classroom render blocks)
  "skinExtras.chair.rate": "Price",
  "skinExtras.chair.walkins": "Walk-ins",
  "skinExtras.chair.where": "Where",
  "skinExtras.chair.quiet": "Quiet hours",
  "skinExtras.chair.beforeYouSitTitle": "Before you sit down",
  "skinExtras.runway.creditsTitle": "Credits",
  "skinExtras.runway.press": "Press",
  "skinExtras.runway.stockists": "Stocked at",
  "skinExtras.runway.made": "Made",
  "skinExtras.runway.contact": "Direct",
  "skinExtras.gallery.onViewLabel": "Now on view",
  "skinExtras.gallery.visitTitle": "Visiting",
  "skinExtras.gallery.hours": "Hours",
  "skinExtras.gallery.address": "Address",
  "skinExtras.gallery.access": "Access",
  "skinExtras.gallery.admission": "Admission",
  "skinExtras.history.recordTitle": "The record itself",
  "skinExtras.history.held": "Held at",
  "skinExtras.history.access": "Access",
  "skinExtras.history.consent": "Consent",
  "skinExtras.history.gapsLabel": "Where the record is thin",
  "skinExtras.collective.nextLabel": "Next",
  "skinExtras.collective.principlesTitle": "How we work",
  "skinExtras.classroom.cost": "Cost",
  "skinExtras.classroom.materials": "Materials",
  "skinExtras.classroom.where": "Where & when",
  "skinExtras.classroom.extras": "Also",
  "skinExtras.classroom.promisesTitle": "What you leave with",

  // Rich poem editor + reader (poet kind, page skin) — structured stanza/
  // break/note blocks with inline italic/bold formatting.
  "poem.editor.label": "Poem",
  "poem.editor.stanzaPlaceholder": "Write a stanza. Press Enter for a new line",
  "poem.editor.notePlaceholder": "An epigraph or dedication",
  "poem.editor.addStanza": "Stanza",
  "poem.editor.addBreak": "Section break",
  "poem.editor.addNote": "Note",
  "poem.editor.moveUp": "Move block up",
  "poem.editor.moveDown": "Move block down",
  "poem.editor.remove": "Remove block",
  "poem.editor.dragToReorder": "Drag to reorder",
  "poem.editor.blockLabel.stanza": "Stanza {index} of {total}",
  "poem.editor.blockLabel.note": "Note",
  "poem.editor.blockLabel.break": "Section break",
  "poem.editor.italic": "Italic",
  "poem.editor.bold": "Bold",
  "poem.editor.toolbarAria": "Text formatting",
  "poem.editor.tabEdit": "Edit",
  "poem.editor.tabPreview": "Preview",
  "poem.editor.paneToggleAria": "Editor view",
  "poem.editor.resplit.title": "This poem's line breaks may have been lost",
  "poem.editor.resplit.body":
    "This looks like an older poem saved as one long line. We can suggest new line breaks from its punctuation. You'll still be able to edit them afterwards.",
  "poem.editor.resplit.action": "Re-split into lines",
  "poem.row.openAria": "Read the poem “{title}”",
  "poem.reader.withLabel": "With {names}",
  "poem.reader.sectionBreak": "Section break",
  "poem.reader.copyLink": "Copy link",
  "poem.reader.copyLinkAria": "Copy link to the poem “{title}”",
  "poem.reader.copy": "Copy poem",
  "poem.reader.copied": "Poem copied",

  // Poem translations/versions — several versions of one poem (e.g. original +
  // translations), cycled through tabs in the editor and the reader.
  "poem.versions.add": "Add a translation",
  "poem.versions.untitled": "Version {index}",
  "poem.versions.namePlaceholder": "e.g. Português, English, Original",
  "poem.versions.nameAria": "Translation name",
  "poem.versions.makeDefault": "Make default",
  "poem.versions.remove": "Remove translation",
  "poem.versions.tablistAria": "Poem translations",
  "poem.versions.readerAria": "Choose a translation",

  // Public copyright + provenance footer (WorkRightsFooter, protect-your-work Task 3)
  "rights.copyright": "© {year}. All rights reserved.",
  "rights.firstPublished": "First published on QueerPulse · {date}",

  // Skin-blocks editor (personas expansion — page-block editor pane, rail entry & field labels)
  "editorRail.skinBlocks": "Page blocks",
  "editorPane.skinBlocks.title": "Page blocks",
  "editorPane.skinBlocks.lede":
    "The details unique to your page: booking terms, hours, what people should bring. These show on your public page.",
  "pending.area.skin": "Page blocks",
  "pending.skinEdited": "{field} updated",
  "skinBlock.addItem": "Add",
  "skinBlock.moveUp": "Move up",
  "skinBlock.moveDown": "Move down",
  "skinBlock.lineLabel": "{label} {index}",
  "skinBlock.stage.booker.title": "For bookers",
  "skinBlock.stage.booker.fee": "Fee",
  "skinBlock.stage.booker.rider": "Rider",
  "skinBlock.stage.booker.press": "Press",
  "skinBlock.stage.booker.contact": "Contact",
  "skinBlock.page.excerpt.title": "Excerpt",
  "skinBlock.page.excerpt.from": "Attribution",
  "skinBlock.page.excerpt.lines": "Excerpt lines",
  "skinBlock.page.colophon.title": "Colophon",
  "skinBlock.table.menuMeta.title": "Menu details",
  "skinBlock.table.menuMeta.no": "Heading",
  "skinBlock.table.menuMeta.when": "Hours",
  "skinBlock.table.menuMeta.practical": "Practical notes",
  "skinBlock.practice.practical.title": "Practical details",
  "skinBlock.practice.practical.fee": "Fee",
  "skinBlock.practice.practical.sliding": "Sliding scale",
  "skinBlock.practice.practical.length": "Session length",
  "skinBlock.practice.practical.languages": "Languages",
  "skinBlock.practice.practical.mode": "Format",
  "skinBlock.practice.practical.next": "Next availability",
  "skinBlock.practice.firstSession.title": "What a first session looks like",
  "skinBlock.practice.firstSession.stepTitle": "Step title",
  "skinBlock.practice.firstSession.body": "What happens",
  "skinBlock.practice.access.title": "The room itself",
  "skinBlock.practice.referrals.title": "Referrals",
  "skinBlock.practice.referrals.name": "Name",
  "skinBlock.practice.referrals.note": "Note",
  "skinBlock.practice.approach.title": "How I work",
  "skinBlock.practice.training.title": "Training & qualifications",
  "skinBlock.practice.feeSchedule.title": "Fees",
  "skinBlock.practice.feeSchedule.label": "Label",
  "skinBlock.practice.feeSchedule.value": "Amount",
  "skinBlock.practice.venue.title": "Where I practise",
  "skinBlock.practice.venue.name": "Place name",
  "skinBlock.practice.venue.lines": "Address lines",
  "skinBlock.practice.availability.title": "Availability",
  "skinBlock.practice.availability.startDate": "Calendar starts (a Monday)",
  "skinBlock.practice.availability.slotTime": "Session start time",
  "skinBlock.practice.availability.help":
    "Tap a day to cycle it: free, then full, then no sessions.",
  "skinBlock.practice.availability.cellLabel": "Slot {slot}: {state}",
  "skinBlock.practice.availability.state_open": "free",
  "skinBlock.practice.availability.state_full": "full",
  "skinBlock.practice.availability.state_off": "no sessions",
  "skinBlock.chart.sky.title": "The sky today",
  "skinBlock.chart.sky.moon": "Moon",
  "skinBlock.chart.sky.phase": "Phase",
  "skinBlock.chart.sky.note": "Note",
  "skinBlock.chart.birthData.title": "What I need from you",
  "skinBlock.chart.birthData.date": "Date",
  "skinBlock.chart.birthData.time": "Time",
  "skinBlock.chart.birthData.place": "Place",
  "skinBlock.chart.birthData.note": "Note",
  "skinBlock.chart.ethics.title": "What a reading is not",
  "skinBlock.chair.chair.title": "At the chair",
  "skinBlock.chair.chair.rate": "Rate",
  "skinBlock.chair.chair.walkins": "Walk-ins",
  "skinBlock.chair.chair.where": "Where",
  "skinBlock.chair.chair.quiet": "Quiet hours",
  "skinBlock.chair.beforeYouSit.title": "Before you sit down",
  "skinBlock.runway.credits.title": "Credits",
  "skinBlock.runway.credits.press": "Press",
  "skinBlock.runway.credits.stockists": "Stockists",
  "skinBlock.runway.credits.made": "Made with",
  "skinBlock.runway.credits.contact": "Direct",
  "skinBlock.gallery.onView.title": "Now on view",
  "skinBlock.gallery.onView.showTitle": "Title",
  "skinBlock.gallery.onView.artist": "Artist",
  "skinBlock.gallery.onView.dates": "Dates",
  "skinBlock.gallery.onView.room": "Room",
  "skinBlock.gallery.visit.title": "Visiting",
  "skinBlock.gallery.visit.hours": "Hours",
  "skinBlock.gallery.visit.address": "Address",
  "skinBlock.gallery.visit.access": "Access",
  "skinBlock.gallery.visit.admission": "Admission",
  "skinBlock.history.record.title": "The record itself",
  "skinBlock.history.record.held": "Held at",
  "skinBlock.history.record.access": "Access",
  "skinBlock.history.record.consent": "Consent",
  "skinBlock.history.record.gaps": "Gaps",
  "skinBlock.collective.nextAction.title": "Next",
  "skinBlock.collective.nextAction.what": "What",
  "skinBlock.collective.nextAction.when": "When",
  "skinBlock.collective.nextAction.where": "Where",
  "skinBlock.collective.principles.title": "How we work",
  "skinBlock.classroom.fees.title": "Fees",
  "skinBlock.classroom.fees.cost": "Cost",
  "skinBlock.classroom.fees.materials": "Materials",
  "skinBlock.classroom.fees.where": "Where",
  "skinBlock.classroom.fees.extras": "Extras",
  "skinBlock.classroom.fees.note": "Note",
  "skinBlock.classroom.promises.title": "What you leave with",

  // Editor rail (EditorRail, editorRail.data.ts) — Phase 3's grouped left
  // nav: This side / Content / People / Publish.
  "editorRail.navLabel": "Persona editor navigation",
  "editorRail.backLink": "Back to your personas",
  "editorRail.collapse": "Collapse sidebar",
  "editorRail.expand": "Expand sidebar",
  "editorRail.collapseShort": "Collapse",
  "editorRail.thisSide": "This persona",
  "editorRail.identity": "Identity",
  "editorRail.presence": "Presence & contact",
  "editorRail.address": "Address & reach",
  "editorRail.content": "Content",
  "editorRail.people": "People",
  "editorRail.publishGroup": "Publish",
  "editorRail.getItLive": "Get it live",

  // Mobile pane switcher (EditorPaneSwitcher, EditorPaneSheet) — the sticky bar
  // that replaces the rail on phones, and the sheet listing every pane.
  "editorSwitch.title": "Jump to a section",
  "editorSwitch.previous": "Previous section",
  "editorSwitch.next": "Next section",

  // Editor pane headers (EditorPaneRouter, editorPaneHeaders.data.ts) — the
  // h2 + lede shown above each rail pane, except the per-section Content
  // panes, which title themselves off the section's own `section.*` label.
  "editorPane.identity.title": "Identity",
  "editorPane.identity.lede":
    "The name, avatar, tagline and bio that introduce this persona.",
  "editorPane.presence.title": "Presence",
  "editorPane.presence.lede":
    "Cover image, accent colour, availability and social links.",
  "editorPane.address.title": "Address",
  "editorPane.address.lede":
    "Choose how people find this persona, and who can see it.",
  "editorPane.content.lede":
    "Add the pieces of work that make up this section.",
  "editorPane.publish.title": "Publish",
  "editorPane.publish.lede": "Check what's left, then take this persona live.",

  // Docked live preview (EditorPreview) — mirrors the persona's public page
  // inside the editor shell.
  "editorPreview.label": "Live preview",
  "editorPreview.openLive": "Open live",
  // Mobile / Desktop switch in the preview bar (PreviewDeviceToggle).
  "editorPreview.device.label": "Preview size",
  "editorPreview.device.mobile": "Mobile",
  "editorPreview.device.desktop": "Desktop",

  // Sticky savebar (EditorSavebar) — owns only the preview toggle; every
  // pane still saves with its own button (see the component's doc comment).
  "editorSavebar.status": "Each section saves on its own",
  "editorSavebar.hidePreview": "Hide preview",
  "editorSavebar.showPreview": "Show preview",

  // Global "Save all" pending-changes list (EditorSavebar) — replaces the
  // per-section save buttons with one running list of everything unsaved
  // across the editor, grouped by rail area, plus a single save/discard pair.
  "pending.area.meta": "This side",
  "pending.area.socials": "Social links",
  "pending.area.affiliations": "Part of",
  "pending.metaEdited": "{field} edited",
  "pending.metaImage": "{field} changed",
  "pending.metaImageRemoved": "{field} removed",
  "pending.rowSummary": "{area}: {summary}",
  "pending.count.added": "{count} added",
  "pending.count.removed": "{count} removed",
  "pending.count.edited": "{count} edited",
  "pending.count.reordered": "reordered",
  "pending.more": "+{count} more",
  "pending.savedToast": "Saved {count} changes",
  "pending.saveAll": "Save all changes ({count})",
  "pending.saving": "Saving…",
  "pending.discardAll": "Discard all",
  "pending.saveError": "Couldn't save {areas}",
  "pending.heading": "Unsaved changes",
  // Phone savebar: the collapsed one-line stand-in for the itemized list.
  "pending.summary_one": "{count} unsaved change",
  "pending.summary_other": "{count} unsaved changes",
  "pending.field.displayName": "Name",
  "pending.field.tagline": "Tagline",
  "pending.field.bio": "Bio",
  "pending.field.avatarUrl": "Avatar",
  "pending.field.coverUrl": "Cover image",
  "pending.field.slug": "Address",
  "pending.field.handle": "Handle",
  "pending.field.link": "Visibility (linked)",
  "pending.field.visibility": "Who can see it",
  "pending.field.accent": "Accent",
  "pending.field.availability": "Availability",
  "pending.field.ctaLabel": "Button label",
  "pending.field.ctaUrl": "Button link",
  "pending.field.coverBleed": "Banner edge",

  // Item drawer (SubprofileItemDrawer, EditorItemRow) — the collapsed row
  // list + right-anchored drawer that replaced the old always-open item
  // cards (formerly `SubprofileItemEditor`, now retired).
  "itemDrawer.addTitle": "Add to {section}",
  "itemDrawer.editTitle": "Edit this {section} item",
  "itemDrawer.cancel": "Cancel",
  "itemDrawer.discardTitle": "Throw this away?",
  "itemDrawer.discardBody":
    "You've written something here and it hasn't been saved yet. Close this and it's gone.",
  "itemDrawer.discardConfirm": "Throw it away",
  "itemDrawer.discardKeep": "Keep editing",
  "itemDrawer.saveItem": "Save item",
  "itemRow.edit": "Edit",

  // Protect this work (ProtectWorkSection): owner-only download/copy/email
  // of the item's authorship record, shown in the drawer once the item is
  // saved (see `authorshipRecord.ts` for the record content itself).
  "protect.heading": "Protect this work",
  "protect.blurb":
    "Download a dated record of your work and email it to yourself. It is independent proof you can keep.",
  "protect.download": "Download authorship record",
  "protect.copy": "Copy record",
  "protect.copied": "Copied to clipboard",
  "protect.email": "Email it to me",
  "protect.failed": "Could not generate the record. Please try again.",
  "protect.emailSubject": "Authorship record: {title}",
  // The downloadable/emailed record's own wording (rights/authorshipRecord.ts).
  // Only the labels translate; the values beside them (title, author,
  // timestamp, hash) are data, and the hash covers the work itself, so a
  // translated record verifies exactly like an English one.
  "protect.record.heading": "AUTHORSHIP RECORD: QueerPulse",
  "protect.record.work": "Work",
  "protect.record.author": "Author",
  "protect.record.firstPublished": "First published",
  "protect.record.contentHash": "Content SHA-256",
  "protect.record.canonicalForm":
    "Canonical form: title + plain-text body, LF-normalized, trimmed",

  // Version history (ItemRevisionHistoryModal): saved-revision list + view +
  // restore, opened from the "History" button in the item editor drawer once
  // an item is saved (Task 9's `useItemRevisions`/`useRestoreItemRevision`).
  "history.button": "History",
  "history.heading": "Version history",
  "history.view": "View",
  "history.restore": "Restore",
  "history.empty": "No earlier versions yet. Saved edits will appear here.",
  "history.restored": "Version restored",
  "history.restoreFailed": "Could not restore this version. Please try again.",

  // Rich per-section fields (richFields.data.ts, rendered by
  // SubprofileItemDrawerFields) — gig details, visual-work medium/edition,
  // and project status/snippet, layered on top of the base `field.*` set.
  "richField.gigState.label": "Status",
  "richField.gigState.option.none": "Standard",
  "richField.gigState.option.sold_out": "Sold out",
  "richField.gigState.option.cancelled": "Cancelled",
  "richField.gigState.option.guest": "Guest set",
  "richField.venue.label": "Venue",
  "richField.venue.placeholder": "e.g. The Yard",
  "richField.doors.label": "Doors",
  "richField.doors.placeholder": "e.g. 9pm",
  "richField.ticketUrl.label": "Ticket link",
  "richField.ticketUrl.placeholder": "https://",
  "richField.medium.label": "Medium",
  "richField.medium.placeholder": "e.g. Oil on canvas",
  "richField.dimensions.label": "Dimensions",
  "richField.dimensions.placeholder": "e.g. 40 × 60 cm",
  "richField.edition.label": "Edition",
  "richField.edition.placeholder": "e.g. 3 of 10",
  "richField.workState.label": "Status",
  "richField.workState.option.none": "Standard",
  "richField.workState.option.shipped": "Shipped",
  "richField.workState.option.archived": "Archived",
  "richField.workState.option.in_progress": "In progress",
  "richField.snippet.label": "Code snippet",
  "richField.snippet.placeholder": "One line per snippet",

  // Address-change warning (AddressChangeWarningModal) — shown before a
  // PUBLISHED persona's address actually changes: switching linked/standalone,
  // or editing an already-live slug/handle.
  "addressWarning.switchTitle": "Change how this persona is found?",
  "addressWarning.editTitle": "Change this persona's address?",
  "addressWarning.noticeTitle": "This address is live",
  "addressWarning.noticeBody":
    "People already have links to {from}. Once you confirm, this persona moves to {to}.",
  "addressWarning.oldLinksDie": "Old links to {path} stop working",
  "addressWarning.handleReleased":
    "Your handle goes back into the pool. Anyone could claim it",
  "addressWarning.followersKept":
    "Your followers and endorsements stay exactly as they are",
  "addressWarning.cancel": "Keep the current address",
  "addressWarning.confirm": "Change address",

  // Publish panel additions (SubprofilePublishPanel) — the danger-zone delete
  // row. The readiness estimate that used to sit here is gone: the pane now
  // shows the live `checklist.*` itself, which is also what gates the button.
  "publishPanel.deleteCopy":
    "Deleting this persona removes it, and everything on it, for good.",
  "publishPanel.deleteCta": "Delete this persona",
  // Danger zone copy. A co-owner gets leaveCopy; the creator gets deleteCopy, plus creatorLeaveCopy when others share the persona.
  // Offers the action that applies rather than explaining a permission, so
  // it does not read as a scolding. CTA beside it is `owners.leaveCta`.
  "publishPanel.leaveCopy":
    "You co-own this persona. Deleting it stays with the member who created it, and you can step away whenever you like: the others keep everything as it is.",
  "publishPanel.creatorLeaveCopy":
    "Prefer to keep it going? Leaving hands it to the co-owner who's been here longest, who can then change its address or visibility, or delete it.",

  // Publish-checklist meter (PublishChecklist) — the `.meter` progress bar
  // alongside the pass/fail rows above.
  "checklist.meterAria": "{passed} of {total} requirements met",
  "checklist.meterLabel": "{passed}/{total}",

  // Type-to-confirm delete (SubprofileDeleteModal, editor danger zone) — the
  // "what you'll lose" list plus the typed-name confirmation gate.
  "deleteConfirm.losingItems_one": "{count} item across your sections",
  "deleteConfirm.losingItems_other": "{count} items across your sections",
  "deleteConfirm.losingEndorsements_one": "{count} endorsement",
  "deleteConfirm.losingEndorsements_other": "{count} endorsements",
  "deleteConfirm.losingFollowers_one": "{count} follower",
  "deleteConfirm.losingFollowers_other": "{count} followers",
  "deleteConfirm.losingHandle":
    "Your handle, @{handle}, released back into the pool",
  "deleteConfirm.typeLabel": 'Type "{name}" to confirm',
  "deleteConfirm.typeHelper": "This makes sure you mean it.",

  // Persona audit remediation (2026-08-11)
  "section.countLabel_one": "{count} item",
  "section.countLabel_other": "{count} items",
  "page.ogImageAlt": "{name}, {craft} on QueerPulse",
  "peopleModal.followersCountOnlyTitle": "Followers stay private",
  "peopleModal.followersCountOnlyBody":
    "{name} has {count} followers, but following is anonymous. We show the count and keep every name private.",
  "publishPanel.saveFirstHint":
    "Save your changes first. Publish checks your saved profile.",
  // Why Publish is disabled when something above is still outstanding. Points
  // at the list rather than restating it: every row up there is clickable.
  "publishPanel.blockedHint_one":
    "One thing left above. Pick it to go straight to it.",
  "publishPanel.blockedHint_other":
    "{count} things left above. Pick one to go straight to it.",
  "editor.errorTitle": "Couldn't load this persona",
  "editor.errorDescription":
    "Something went wrong reaching the server. Nothing's lost. Check your connection and try again.",
  "editor.errorRetry": "Try again",
  "metaForm.ctaLabelError": "Add a label so people know what this button does.",
  "metaForm.ctaUrlError": "Add a link for this button to point to.",
  "metaForm.bioMinRemaining_one": "{count} character more to publish",
  "metaForm.bioMinRemaining_other": "{count} characters more to publish",
  "metaForm.bioMinMet": "Long enough to publish",
  "pending.blockedName":
    "This persona needs a name. Add it on the Identity tab.",
  "pending.blockedHandle":
    "That address is taken. Pick another on the Address tab.",
  "newModal.toastHandleClaimFailed":
    "That handle got taken just now. We've kept this linked to your profile for the moment. You can claim a new address from the editor.",
  "newModal.toastAffiliationsDropped_one":
    '1 "Part of" link didn\'t carry over. Only your own communities and events come with a copy.',
  "newModal.toastAffiliationsDropped_other":
    '{count} "Part of" links didn\'t carry over. Only your own communities and events come with a copy.',
  "newModal.toastAffiliationsSaveFailed":
    'We couldn\'t copy the "Part of" links. Add them from the editor.',
  "invite.loadMore": "Show more connections",
  "invite.loadingMore": "Loading…",

  "editorSavebar.mobilePreview": "Preview",
  "mobilePreview.ariaLabel": "Live preview of your persona page",

  // Therapist profile (t1)
  "therapist.completeness.portrait": "Portrait",
  "therapist.completeness.quote": "Pull quote",
  "therapist.completeness.approach": "Approach",
  "therapist.completeness.specialties": "Specialties",
  "therapist.completeness.fees": "Fees",
  "therapist.completeness.availability": "Availability",
  "therapist.completeness.faq": "Questions people ask",
  "therapist.completeness.firstSession": "First session",
  "therapist.completeness.access": "Accessibility",
  // Therapist profile (t3)
  "therapist.approach.label": "How {name} works",
  "therapist.approach.heading": "Approach",
  "therapist.approach.styleLabel": "Working style, in {name}'s words",
  "therapist.approach.notForLabel": "Probably not for you if",
  "therapist.approach.notForNote":
    "Written by {name}. Honest self-exclusion saves everyone a first session.",
  "therapist.approach.boundariesLabel": "What {name} doesn't do",
  "therapist.specialties.label": "What {name} can help with",
  "therapist.specialties.heading": "Specialties, and *who* the door is open to",
  "therapist.specialties.contextsLabel": "Also speaks the language of",
  "therapist.specialties.contextsNote":
    "Marked by {name}. Contexts {name} knows from the inside or has worked in for years.",
  "therapist.firstSession.labelFifty": "The first 50 minutes",
  "therapist.firstSession.label": "The first session",
  "therapist.firstSession.heading": "What *actually* happens",
  "therapist.vouches.label": "Community vouches",
  "therapist.vouches.heading": "People who have *actually* worked with {name}",
  "therapist.vouches.count_one": "Vouched for by {count} member",
  "therapist.vouches.count_other": "Vouched for by {count} members",
  "therapist.vouches.quiet_one": "{count} vouched without a note",
  "therapist.vouches.quiet_other": "{count} vouched without a note",
  "therapist.vouches.notes_one": "{count} left a note",
  "therapist.vouches.notes_other": "{count} left a note",
  "therapist.vouches.breakdown": "{quiet}, {notes}.",
  "therapist.vouches.empty":
    "No vouches yet. Members who have worked with {name} can add the first one.",
  "therapist.vouches.footer":
    "Seen {name} yourself? Your vouch shows your name, and adding a note is up to you. Vouches are never paid for.",
  "therapist.vouches.cta": "Vouch for {name}",
  "therapist.vouches.vouched": "You vouched",
  "therapist.faq.label": "Questions {name} gets asked",
  "therapist.faq.heading": "Answered *before* you have to ask",
  "therapist.referrals.label": "Care beyond one person",
  "therapist.referrals.heading": "Who else is *in the picture*",
  "therapist.referrals.recommendsLabel": "If {name} is full, {name} recommends",
  "therapist.referrals.note": "Chosen by {name}. Nobody pays to be here.",
  "therapist.referrals.alongsideLabel": "Works alongside",
  "therapist.referrals.kind.psychiatrist": "Psychiatrist",
  "therapist.referrals.kind.group": "Group",
  "therapist.referrals.kind.community": "Community",
  "therapist.referrals.kind.clinic": "Clinic",
  "therapist.referrals.kind.therapist": "Therapist",
  // Therapist profile (t4)
  "therapist.practical.label": "The practical bits",
  "therapist.practical.heading": "Money, time and *getting in the door*",
  "therapist.practical.amount": "{amount}€",
  "therapist.practical.range": "{low}–{high}€",
  "therapist.practical.sessions.title": "Sessions",
  "therapist.practical.sessions.modeBoth": "in person or online",
  "therapist.practical.sessions.modeOnline": "online only",
  "therapist.practical.sessions.modeInPerson": "in person",
  "therapist.practical.sessions.frequency": "How often",
  "therapist.practical.sessions.inPerson": "In person",
  "therapist.practical.sessions.online": "Online",
  "therapist.practical.sessions.onlineVideo": "Video",
  "therapist.practical.sessions.onlineNo": "Not offered",
  "therapist.practical.sessions.onlineUnknown": "Not said",
  "therapist.practical.fees.title": "Fees",
  "therapist.practical.fees.perSession": "per session",
  "therapist.practical.fees.sliding": "Sliding scale",
  "therapist.practical.fees.placesOpen_one":
    "{open} of {places} sliding-scale places open",
  "therapist.practical.fees.placesOpen_other":
    "{open} of {places} sliding-scale places open",
  "therapist.practical.fees.placesFull":
    "Sliding-scale places are full right now",
  "therapist.practical.fees.rulesLabel": "How the sliding scale works:",
  "therapist.practical.fees.missing": "Not shared yet.",
  "therapist.practical.smallPrint.title":
    "Insurance, receipts & the small print",
  "therapist.practical.smallPrint.receiptTime": "Receipts",
  "therapist.practical.smallPrint.payment": "Payment",
  "therapist.practical.smallPrint.cancellation": "Cancelling",
  "therapist.practical.smallPrint.unknown":
    "Unknown. Ask when you make contact.",
  "therapist.practical.availability.title": "Availability",
  "therapist.practical.availability.untilFirst": "to a first session",
  "therapist.practical.availability.slotsLabel": "Next open slots",
  "therapist.practical.availability.slotsNote":
    "{name} updates these by hand. Mention one in your message.",
  "therapist.practical.availability.waitlistLabel": "Waitlist right now",
  "therapist.practical.availability.waiting": "waiting",
  "therapist.practical.availability.position":
    "You'd be about number {position} in line",
  "therapist.practical.availability.positionMoves":
    "You'd be about number {position} in line · moves {moves}",
  "therapist.practical.availability.waitNote":
    "An estimate from {name}. You can stay on other waitlists.",
  "therapist.practical.availability.missing": "Not shared yet.",
  "therapist.practical.calculator.title": "What you'd actually pay",
  "therapist.practical.calculator.sessionsLabel": "Sessions a month",
  "therapist.practical.calculator.insurerLabel": "Reimbursed by",
  "therapist.practical.calculator.noInsurance": "No insurance",
  "therapist.practical.calculator.perMonth": "Per month",
  "therapist.practical.calculator.gross": "{sessions} × {fee}€ = {gross}€",
  "therapist.practical.calculator.reimbursed":
    "− {sessions} × ~{amount}€ back from {insurer}",
  "therapist.practical.calculator.noReimbursement": "No reimbursement",
  "therapist.practical.calculator.sliding":
    "Sliding scale would bring it to {low}–{net}€",
  "therapist.practical.calculator.hint":
    'Reimbursement amounts are typical and depend on your plan. Check your insurer\'s table for "psicologia clínica".',
  "therapist.practical.travel.title": "Getting there",
  "therapist.practical.travel.metro": "Metro:",
  "therapist.practical.travel.bus": "Bus:",
  "therapist.practical.travel.bike": "Bike:",
  "therapist.practical.travel.entrance": "Entrance:",
  "therapist.practical.access.title": "Accessibility",
  "therapist.practical.access.offered": "Offered:",
  "therapist.practical.access.missing": "Not offered:",
  // Therapist profile (t5)
  "therapist.side.contact.label": "Getting in touch",
  "therapist.side.contact.title.open": "Get in touch",
  "therapist.side.contact.title.wait": "Waitlist, {waitNote}",
  "therapist.side.contact.title.waitBare": "Waitlist",
  "therapist.side.contact.title.closed": "Not taking new clients right now",
  "therapist.side.contact.body.open":
    "A short call to see if it fits, with no commitment. Most people book a first session from there.",
  "therapist.side.contact.body.wait":
    "Message {name} to join the waitlist. You can stay on other waitlists meanwhile.",
  "therapist.side.contact.body.closed":
    "{name} can still answer a question, and the referrals on this page take new people.",
  "therapist.side.contact.body.closedBare":
    "{name} can still answer a question.",
  "therapist.side.contact.message": "Message {name}",
  "therapist.side.contact.introCall": "Book the free intro call",
  "therapist.side.contact.emailAria": "Email {name} at {email}",
  "therapist.side.contact.websiteAria":
    "{name}'s website, {website} (opens in a new tab)",
  "therapist.side.contact.crisis": "In a crisis, <a>go here instead</a>.",
  "therapist.side.goodToKnow.label": "Good to know",
  "therapist.side.similar.label": "Also worth a look",
  "therapist.side.similar.open": "Open",
  "therapist.side.similar.full": "Full",
  "therapist.side.similar.note":
    "Other therapists listed on QueerPulse. Nobody pays to appear here.",
  "therapist.side.links.report": "Report a concern",
  "therapist.side.links.reportHint": "Private",
  "therapist.side.links.share": "Share this page",
  // Therapist profile (t6)
  "skinBlock.therapist.therapist.title": "Core facts",
  "skinBlock.therapist.therapist.status": "Status",
  "skinBlock.therapist.therapist.status_open": "Taking new clients",
  "skinBlock.therapist.therapist.status_wait": "Waitlist",
  "skinBlock.therapist.therapist.status_closed": "Not taking new clients",
  "skinBlock.therapist.therapist.waitNote": "Waitlist note",
  "skinBlock.therapist.therapist.waitNotePlaceholder": "About 6 weeks",
  "skinBlock.therapist.therapist.waitNoteHelper":
    "Shown while your status is Waitlist.",
  "skinBlock.therapist.therapist.jobTitle": "Professional title",
  "skinBlock.therapist.therapist.jobTitlePlaceholder":
    "Clinical psychologist and psychotherapist",
  "skinBlock.therapist.therapist.registration": "Registration number",
  "skinBlock.therapist.therapist.registrationPlaceholder": "OPP 21044",
  "skinBlock.therapist.therapist.quote": "Quote",
  "skinBlock.therapist.therapist.quotePlaceholder":
    "I've been on the other side of the couch too, and I know what it takes to walk in.",
  "skinBlock.therapist.therapist.quoteHelper":
    "Wrap a word in *asterisks* to set it in coral italics.",
  "skinBlock.therapist.therapist.languages": "Languages",
  "skinBlock.therapist.therapist.languagesPlaceholder": "Choose languages",
  "skinBlock.therapist.therapist.where": "Where",
  "skinBlock.therapist.therapist.wherePlaceholder":
    "Arroios, Lisbon · and online",
  "skinBlock.therapist.therapist.online": "Online sessions",
  "skinBlock.therapist.therapist.online_yes": "Yes",
  "skinBlock.therapist.therapist.online_no": "No",
  "skinBlock.therapist.therapist.online_unsaid": "Not said",
  "skinBlock.therapist.therapist.timezone": "Time zone note",
  "skinBlock.therapist.therapist.timezonePlaceholder":
    "Portugal time (WET/WEST)",
  "skinBlock.therapist.therapist.email": "Email",
  "skinBlock.therapist.therapist.website": "Website",
  "skinBlock.therapist.therapist.goodToKnow": "Good to know",
  "skinBlock.therapist.therapist.goodToKnowHelper":
    "Anything a client should know before booking, such as a conflict of interest.",
  "skinBlock.therapist.lived.title": "Lived experience",
  "skinBlock.therapist.lived.helper":
    "Pick from the list or add your own words. Share only what you want on the page.",
  "skinBlock.therapist.contexts.title": "Also speaks the language of",
  "skinBlock.therapist.modalities.title": "Modalities",
  "skinBlock.therapist.workingStyle.title": "Working style",
  "skinBlock.therapist.notFor.title": "Probably not for you if",
  "skinBlock.therapist.boundaries.title": "Boundaries",
  "skinBlock.therapist.whoFor.title": "Who you work with",
  "skinBlock.therapist.therapyFees.title": "Fees",
  "skinBlock.therapist.therapyFees.standard": "Standard fee (euros)",
  "skinBlock.therapist.therapyFees.standardPlaceholder": "65",
  "skinBlock.therapist.therapyFees.slidingMin": "Sliding scale from (euros)",
  "skinBlock.therapist.therapyFees.slidingMinPlaceholder": "40",
  "skinBlock.therapist.therapyFees.slidingMax": "Sliding scale up to (euros)",
  "skinBlock.therapist.therapyFees.slidingMaxPlaceholder": "65",
  "skinBlock.therapist.therapyFees.slidingPlaces":
    "Sliding-scale places in total",
  "skinBlock.therapist.therapyFees.slidingPlacesPlaceholder": "4",
  "skinBlock.therapist.therapyFees.slidingOpen":
    "Sliding-scale places open now",
  "skinBlock.therapist.therapyFees.slidingOpenPlaceholder": "2",
  "skinBlock.therapist.therapyFees.slidingRules": "How the sliding scale works",
  "skinBlock.therapist.therapyFees.slidingRulesPlaceholder":
    "You ask, and I say yes if a place is free.",
  "skinBlock.therapist.therapyFees.firstContact": "First contact",
  "skinBlock.therapist.therapyFees.firstContactPlaceholder":
    "First 20-minute call is free",
  "skinBlock.therapist.therapyFees.frequency": "How often",
  "skinBlock.therapist.therapyFees.frequencyPlaceholder":
    "Weekly or fortnightly, your call",
  "skinBlock.therapist.therapyFees.receipts": "Receipts",
  "skinBlock.therapist.therapyFees.receiptsPlaceholder":
    "Receipts for ADSE, Médis and Multicare reimbursement",
  "skinBlock.therapist.therapyFees.receiptTime": "When receipts arrive",
  "skinBlock.therapist.therapyFees.receiptTimePlaceholder":
    "Receipt by email within 48 hours",
  "skinBlock.therapist.therapyFees.payment": "Payment",
  "skinBlock.therapist.therapyFees.paymentPlaceholder":
    "MB Way, transfer or card",
  "skinBlock.therapist.therapyFees.cancellation":
    "Anything else about cancelling",
  "skinBlock.therapist.therapyFees.cancellationPlaceholder":
    "Sessions missed through illness are never charged.",
  "skinBlock.therapist.therapyFees.legacyChoiceHelper":
    "The first option is your earlier answer, as you typed it. Pick another to replace it.",
  "skinBlock.therapist.therapyFees.legacyTextHelper":
    "Your earlier answer: “{text}”. Tick the methods you take to replace it.",
  "skinBlock.therapist.therapyFees.paymentMethods": "Payment methods",
  "skinBlock.therapist.therapyFees.paymentMethodsHelper":
    "Tick every method you take.",
  "skinBlock.therapist.therapyFees.cancellationNotice": "Cancellation notice",
  "skinBlock.therapist.therapyFees.frequency_weekly": "Weekly",
  "skinBlock.therapist.therapyFees.frequency_fortnightly": "Fortnightly",
  "skinBlock.therapist.therapyFees.frequency_weeklyOrFortnightly":
    "Weekly or fortnightly",
  "skinBlock.therapist.therapyFees.frequency_monthly": "Monthly",
  "skinBlock.therapist.therapyFees.frequency_flexible":
    "Flexible, we'll decide together",
  "skinBlock.therapist.therapyFees.paymentMethods_mbway": "MB WAY",
  "skinBlock.therapist.therapyFees.paymentMethods_transfer": "Bank transfer",
  "skinBlock.therapist.therapyFees.paymentMethods_multibanco":
    "Multibanco reference",
  "skinBlock.therapist.therapyFees.paymentMethods_card": "Card",
  "skinBlock.therapist.therapyFees.paymentMethods_cash": "Cash",
  "skinBlock.therapist.therapyFees.paymentMethods_paypal": "PayPal",
  "skinBlock.therapist.therapyFees.paymentMethods_wise": "Wise",
  "skinBlock.therapist.therapyFees.paymentMethods_revolut": "Revolut",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_mbway": "MB WAY",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_transfer":
    "bank transfer",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_multibanco":
    "Multibanco reference",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_card": "card",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_cash": "cash",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_paypal": "PayPal",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_wise": "Wise",
  "skinBlock.therapist.therapyFees.paymentMethodsInList_revolut": "Revolut",
  "skinBlock.therapist.therapyFees.receiptTime_atSession": "At the session",
  "skinBlock.therapist.therapyFees.receiptTime_sameDay": "The same day",
  "skinBlock.therapist.therapyFees.receiptTime_within48h": "Within 48 hours",
  "skinBlock.therapist.therapyFees.receiptTime_endOfMonth":
    "At the end of the month",
  "skinBlock.therapist.therapyFees.receiptTime_onRequest": "On request",
  "skinBlock.therapist.therapyFees.cancellationNotice_24h": "24 hours' notice",
  "skinBlock.therapist.therapyFees.cancellationNotice_48h": "48 hours' notice",
  "skinBlock.therapist.therapyFees.cancellationNotice_72h": "72 hours' notice",
  "skinBlock.therapist.therapyFees.cancellationNotice_none":
    "Any time, free of charge",
  "skinBlock.choiceClearHint": "Choose the selected option again to clear it.",
  "skinBlock.therapist.feeSchedule.title": "Session lengths",
  "skinBlock.therapist.feeSchedule.labelPlaceholder": "50 min",
  "skinBlock.therapist.feeSchedule.valuePlaceholder": "65€",
  "skinBlock.therapist.reimbursement.title": "Reimbursement",
  "skinBlock.therapist.reimbursement.helper":
    "Pick your insurer from the list or type your own, and roughly how many euros come back per session.",
  "skinBlock.therapist.reimbursement.label": "Insurer",
  "skinBlock.therapist.reimbursement.labelPlaceholder": "ADSE",
  "skinBlock.therapist.reimbursement.value": "Euros back per session",
  "skinBlock.therapist.reimbursement.valuePlaceholder": "25",
  "skinBlock.therapist.availabilitySummary.title": "Availability summary",
  "skinBlock.therapist.availabilitySummary.headline": "Time to a first session",
  "skinBlock.therapist.availabilitySummary.headlinePlaceholder":
    "Within 2 weeks",
  "skinBlock.therapist.availabilitySummary.waiting":
    "People on your waitlist (leave empty with no waitlist)",
  "skinBlock.therapist.availabilitySummary.waitingPlaceholder": "11",
  "skinBlock.therapist.availabilitySummary.waitMoves":
    "How fast the waitlist moves",
  "skinBlock.therapist.availabilitySummary.waitMovesPlaceholder":
    "About 2 people a fortnight",
  "skinBlock.therapist.hours.title": "Hours",
  "skinBlock.therapist.hours.label": "Days",
  "skinBlock.therapist.hours.labelPlaceholder": "Weekdays",
  "skinBlock.therapist.hours.value": "Hours",
  "skinBlock.therapist.hours.valuePlaceholder": "17:00-21:00",
  "skinBlock.therapist.openSlots.title": "Open slots",
  "skinBlock.therapist.openSlots.helper":
    "One slot per line, written the way you want it shown, e.g. Tue 30 Sep, 18:00.",
  "skinBlock.therapist.travel.title": "Getting there",
  "skinBlock.therapist.travel.metro": "Metro",
  "skinBlock.therapist.travel.metroPlaceholder":
    "Anjos (green line), 4 min, step-free",
  "skinBlock.therapist.travel.bus": "Bus",
  "skinBlock.therapist.travel.busPlaceholder":
    "708, 730 and 735 stop at Largo do Intendente",
  "skinBlock.therapist.travel.bike": "Bike",
  "skinBlock.therapist.travel.bikePlaceholder":
    "Racks outside the pharmacy next door",
  "skinBlock.therapist.travel.entrance": "Finding the door",
  "skinBlock.therapist.travel.entrancePlaceholder":
    "Blue door on a quiet side street",
  "skinBlock.therapist.access.title": "Accessibility offered",
  "skinBlock.therapist.accessMissing.title": "Accessibility not offered",
  "skinBlock.therapist.faq.title": "Questions people ask",
  "skinBlock.therapist.faq.question": "Question",
  "skinBlock.therapist.faq.answer": "Answer",
  "skinBlock.therapist.worksAlongside.title": "Works alongside",
  "skinBlock.therapist.worksAlongside.kind": "Kind",
  "skinBlock.therapist.worksAlongside.kindPlaceholder": "Choose a kind",
  "skinBlock.therapist.worksAlongside.kind_psychiatrist": "Psychiatrist",
  "skinBlock.therapist.worksAlongside.kind_group": "Group",
  "skinBlock.therapist.worksAlongside.kind_community": "Community",
  "skinBlock.therapist.worksAlongside.kind_clinic": "Clinic",
  "skinBlock.therapist.worksAlongside.kind_therapist": "Therapist",
  "skinBlock.therapist.worksAlongside.name": "Name",
  "skinBlock.therapist.worksAlongside.note": "Note",

  // Therapist profile (t2)
  "therapist.body.skipToContact": "Skip to contact options",
  "therapist.body.back": "All therapists",
  "therapist.body.sideLabel": "Contact and more about {name}",
  "therapist.hero.status.open": "Accepting new clients",
  "therapist.hero.status.wait": "Waitlist · {note}",
  "therapist.hero.status.waitPlain": "Waitlist",
  "therapist.hero.status.closed": "Not taking new clients",
  "therapist.hero.lived": "Lived experience, in {name}'s words",
  "therapist.hero.facts.languages": "Languages",
  "therapist.hero.facts.where": "Where",
  "therapist.hero.facts.fees": "Fees",
  "therapist.hero.facts.insurance": "Insurance",
  "therapist.hero.facts.feesSliding": "{standard}€ · sliding {min}–{max}€",
  "therapist.hero.facts.feesStandard": "{standard}€",
  "therapist.hero.facts.notShared": "Not shared yet",
  "therapist.hero.facts.unknown": "Unknown",
  "therapist.hero.message": "Message {name}",
  "therapist.hero.bookCall": "Book the free call",
  "therapist.hero.email": "Email",
  "therapist.hero.hint":
    "Messages go through QueerPulse first. {name} only sees your profile name until you say more.",
  "therapist.owner.label": "Your page, {name}",
  "therapist.owner.heading":
    "This is what members see. *Only you* see this bar.",
  "therapist.owner.capacityLabel": "Taking new clients",
  "therapist.owner.capacitySaved.open":
    "Members now see: Accepting new clients",
  "therapist.owner.capacitySaved.wait": "Members now see: Waitlist",
  "therapist.owner.capacitySaved.closed":
    "Members now see: Not taking new clients",
  "therapist.owner.capacityError": "That didn't save. Try again in a moment.",
  "therapist.owner.completeness": "Profile completeness",
  "therapist.owner.percent": "{percent}%",
  "therapist.owner.complete": "Everything is filled in.",
  "therapist.owner.edit": "Edit your page",
  "therapist.owner.draftLabel": "Draft",
  "therapist.owner.draftBody": "Nobody else can open this address yet.",
  "therapist.owner.visitorLabel": "See it as a visitor",
  "therapist.owner.visitorBody":
    "Read your page the way a member finds it, with this bar out of the way.",

  // Therapist profile (f2a)
  "therapist.mobile.message": "Message",
  "therapist.mobile.label": "Contact {name}",
  // Therapist profile (f3)
  "therapist.vouches.breakdownOne": "{clause}.",
  // Therapist profile (f4)
  "therapist.practical.availability.closed": "Not taking new clients right now",
  // Therapist profile (f5)
  "therapist.side.contact.body.openNoCall":
    "Send {name} a message with a question, or to find a time for a first session.",
  "therapist.side.similar.wait": "Waitlist",

  // Therapist profile (g2b)
  "therapist.hero.facts.feesFrom": "from {amount}€",
  // Therapist profile (g4)
  "therapist.practical.fees.from": "from {amount}€",
  "therapist.practical.fees.scheduleHint":
    "Each session length has its own price, listed under Sessions.",
  "therapist.practical.availability.waitOnly": "On a waitlist right now",

  // Therapist profile (h1)
  "therapist.hero.facts.feesFromSliding":
    "from {lowest}€ · sliding {min}–{max}€",
  "therapist.hero.facts.feesSlidingOnly": "Sliding {min}–{max}€",
  // Therapist editor chapters (pass 1)
  "skinBlock.therapist.chapter.basics.title": "The basics",
  "skinBlock.therapist.chapter.basics.lede":
    "What people see first, at the top of your page.",
  "skinBlock.therapist.chapter.approach.title": "How you work",
  "skinBlock.therapist.chapter.approach.lede":
    "Helps people tell whether you are the right fit for them.",
  "skinBlock.therapist.chapter.fees.title": "Fees and insurance",
  "skinBlock.therapist.chapter.fees.lede":
    "What a session costs and what insurance gives back.",
  "skinBlock.therapist.chapter.availability.title": "Availability",
  "skinBlock.therapist.chapter.availability.lede":
    "How soon someone can start with you.",
  "skinBlock.therapist.chapter.where.title": "Where and access",
  "skinBlock.therapist.chapter.where.lede":
    "How people find you and what the space offers.",
  "skinBlock.therapist.chapter.contact.title": "Contact and referrals",
  "skinBlock.therapist.chapter.contact.lede":
    "How to reach you, and who to try when you are full.",
  "skinBlock.therapist.group.introduce": "How you introduce yourself",
  "skinBlock.therapist.group.approach": "Approach",
  "skinBlock.therapist.group.methods": "Methods and style",
  "skinBlock.therapist.group.helpsWith": "What you help with",
  "skinBlock.therapist.group.helpsWithHelper":
    "Each topic becomes a small heading on your page, with its lines listed underneath. Short lines read best.",
  "skinBlock.therapist.group.whoFor": "Who it's for",
  "skinBlock.therapist.group.expectations": "Setting expectations",
  "skinBlock.therapist.group.fee": "Your fee",
  "skinBlock.therapist.group.sliding": "Sliding scale",
  "skinBlock.therapist.group.insurance": "Insurance and receipts",
  "skinBlock.therapist.group.policies": "Payment and policies",
  "skinBlock.therapist.group.rightNow": "Right now",
  "skinBlock.therapist.group.firstSession": "Your first session",
  "skinBlock.therapist.group.whereYouWork": "Where you work",
  "skinBlock.therapist.group.room": "The room",
  "skinBlock.therapist.group.accessibility": "Accessibility",
  "skinBlock.therapist.group.contact": "Contact",
  "skinBlock.therapist.joiner.of": "of",
  "skinBlock.therapist.joiner.to": "to",
  "skinBlock.therapist.check.ascending": "The lowest fee is above the highest",
  "skinBlock.therapist.check.partOfWhole": "More places open than you offer",
  "skinBlock.therapist.approach.placeholder":
    "I work relationally and at your pace. Our first sessions are about what brings you in and what you hope will change.",
  "skinBlock.therapist.feeSchedule.add": "Add a session length",
  "skinBlock.therapist.firstSession.add": "Add a step",
  "skinBlock.therapist.faq.add": "Add a question",
  "skinBlock.therapist.lived.placeholder": "Choose from the list",
  "skinBlock.therapist.modalities.placeholder": "Choose your modalities",
  "skinBlock.therapist.workingStyle.placeholder": "Choose how you work",
  "skinBlock.therapist.whoFor.placeholder": "Choose who you work with",
  "skinBlock.therapist.contexts.placeholder": "Choose what you know well",
  "skinBlock.therapist.modalities.customPlaceholder": "Another modality",
  "skinBlock.therapist.workingStyle.customPlaceholder": "Another way you work",
  "skinBlock.therapist.whoFor.customPlaceholder": "Someone else you work with",
  "skinBlock.therapist.contexts.customPlaceholder": "Another context",
  "skinBlock.therapist.notFor.placeholder": "You want a quick fix",
  "skinBlock.therapist.boundaries.placeholder": "No under-18s",
  "skinBlock.therapist.openSlots.placeholder": "Tue 30 Sep, 18:00",
  "skinBlock.therapist.access.placeholder": "Step-free entrance",
  "skinBlock.therapist.accessMissing.placeholder": "Sign language (LGP)",
  // Therapist lived experience and languages multi-selects
  "skinBlock.therapist.lived.customPlaceholder": "Something not on the list",
  "skinBlock.therapist.therapist.languagesCustomPlaceholder":
    "Another language",
  "skinControl.multiSelect.addOwn": "Add your own",
  "skinControl.multiSelect.add": "Add",
  "skinControl.multiSelect.added": "Added {label}",
  "skinControl.multiSelect.removed": "Removed {label}",
  "skinControl.multiSelect.alreadyChosen": "{label} is already chosen",
  "skinControl.multiSelect.done": "Done",
  "therapist.livedOption.trans": "Trans",
  "therapist.livedOption.nonBinary": "Non-binary",
  "therapist.livedOption.lesbian": "Lesbian",
  "therapist.livedOption.gay": "Gay",
  "therapist.livedOption.bisexual": "Bisexual",
  "therapist.livedOption.queer": "Queer",
  "therapist.livedOption.aceAro": "Asexual or aromantic",
  "therapist.livedOption.intersex": "Intersex",
  "therapist.livedOption.migrant": "Migrant or refugee",
  "therapist.livedOption.racialised": "Racialised",
  "therapist.livedOption.neurodivergent": "Neurodivergent",
  "therapist.livedOption.disabled": "Disabled",
  "therapist.livedOption.chronicIllness": "Chronic illness",
  "therapist.livedOption.sexWork": "Sex work",
  "therapist.livedOption.nonMonogamy": "Polyamory or non-monogamy",
  "therapist.livedOption.recovery": "Recovery from addiction",
  "therapist.livedOption.comingOutLater": "Coming out later in life",
  "therapist.livedOption.parenting": "Parenting as an LGBTQIA+ person",
  "therapist.languageOption.pt": "Portuguese",
  "therapist.languageOption.en": "English",
  "therapist.languageOption.es": "Spanish",
  "therapist.languageOption.fr": "French",
  "therapist.languageOption.de": "German",
  "therapist.languageOption.it": "Italian",
  "therapist.languageOption.nl": "Dutch",
  "therapist.languageOption.ca": "Catalan",
  "therapist.languageOption.ro": "Romanian",
  "therapist.languageOption.pl": "Polish",
  "therapist.languageOption.uk": "Ukrainian",
  "therapist.languageOption.ru": "Russian",
  "therapist.languageOption.ar": "Arabic",
  "therapist.languageOption.fa": "Persian",
  "therapist.languageOption.tr": "Turkish",
  "therapist.languageOption.el": "Greek",
  "therapist.languageOption.hi": "Hindi",
  "therapist.languageOption.ne": "Nepali",
  "therapist.languageOption.bn": "Bengali",
  "therapist.languageOption.zh": "Mandarin Chinese",
  "therapist.languageOption.ja": "Japanese",
  "therapist.languageOption.ko": "Korean",
  "therapist.languageOption.kea": "Cape Verdean Creole",
  "therapist.languageOption.sv": "Swedish",
  "therapist.languageOption.lgp": "Portuguese Sign Language (LGP)",
  // Therapist modality, working style, who-for and context multi-selects
  "therapist.modalityOption.personCentred": "Person-centred",
  "therapist.modalityOption.cbt": "CBT",
  "therapist.modalityOption.act": "ACT",
  "therapist.modalityOption.dbt": "DBT",
  "therapist.modalityOption.emdr": "EMDR",
  "therapist.modalityOption.psychodynamic": "Psychodynamic",
  "therapist.modalityOption.psychoanalytic": "Psychoanalytic",
  "therapist.modalityOption.systemic": "Systemic and family therapy",
  "therapist.modalityOption.gestalt": "Gestalt",
  "therapist.modalityOption.existential": "Existential",
  "therapist.modalityOption.narrative": "Narrative",
  "therapist.modalityOption.compassionFocused": "Compassion-focused",
  "therapist.modalityOption.schema": "Schema therapy",
  "therapist.modalityOption.emotionallyFocused": "Emotionally focused (EFT)",
  "therapist.modalityOption.ifs": "Internal Family Systems (IFS)",
  "therapist.modalityOption.somatic": "Somatic",
  "therapist.modalityOption.mindfulness": "Mindfulness-based",
  "therapist.modalityOption.integrative": "Integrative",
  "therapist.modalityOption.artTherapy": "Art therapy",
  "therapist.modalityOption.sexTherapy": "Sex therapy",
  "therapist.modalityOption.affirmative": "Affirmative practice",
  "therapist.modalityOption.traumaInformed": "Trauma-informed",
  "therapist.workingStyleOption.structured": "Leans structured",
  "therapist.workingStyleOption.exploratory": "Leans exploratory",
  "therapist.workingStyleOption.talkBased": "Mostly talk-based",
  "therapist.workingStyleOption.bodyBased": "Includes body-based work",
  "therapist.workingStyleOption.creative": "Uses creative tools",
  "therapist.workingStyleOption.gentleDirect":
    "Gentle and direct in equal measure",
  "therapist.workingStyleOption.collaborative": "You set the pace together",
  "therapist.workingStyleOption.betweenSessions": "Exercises between sessions",
  "therapist.workingStyleOption.shortTerm": "Leans short-term",
  "therapist.workingStyleOption.longTerm": "Leans long-term",
  "therapist.whoForOption.adults": "Adults 18+",
  "therapist.whoForOption.youngAdults": "Young adults",
  "therapist.whoForOption.teens": "Teenagers",
  "therapist.whoForOption.olderAdults": "Older adults",
  "therapist.whoForOption.individuals": "Individuals",
  "therapist.whoForOption.couples": "Couples",
  "therapist.whoForOption.relationships": "Relationships of any shape",
  "therapist.whoForOption.families": "Families",
  "therapist.whoForOption.parents": "Parents and carers",
  "therapist.whoForOption.groups": "Groups",
  "therapist.contextOption.kink": "Kink and BDSM",
  "therapist.contextOption.sexWork": "Sex work",
  "therapist.contextOption.nonMonogamy": "Consensual non-monogamy",
  "therapist.contextOption.polyFamilies": "Poly families",
  "therapist.contextOption.chemsex": "Chemsex",
  "therapist.contextOption.hiv": "Living with HIV",
  "therapist.contextOption.transition": "Gender transition",
  "therapist.contextOption.comingOut": "Coming out",
  "therapist.contextOption.aceAro": "Asexuality and aromanticism",
  "therapist.contextOption.intersex": "Intersex experience",
  "therapist.contextOption.exReligious": "Leaving religion",
  "therapist.contextOption.migration": "Migration and asylum",
  "therapist.contextOption.neurodivergence": "Neurodivergence",
  "therapist.contextOption.disability": "Disability",
  "therapist.contextOption.chronicIllness": "Chronic illness",
  "therapist.contextOption.recovery": "Addiction and recovery",
  "therapist.contextOption.bodyImage": "Body image and eating",
  "therapist.contextOption.queerParenthood": "Queer parenthood and fertility",
  "skinControl.money.ariaLabel": "{label} (euros)",
  "skinControl.money.currency": "Amount in euros",
  // Therapist editor controls (pass 2)
  "skinList.reorderHint":
    "Drag to reorder, or click for move options. Alt or Option + arrow also moves it.",
  "skinList.paragraphsHint":
    "Leave a blank line to start a new paragraph. **Bold**, *italic*, lists and links all work.",
  "skinChips.addAnother": "Add another",
  "skinChips.addHint":
    "Enter to add. Drag or press Alt or Option + arrow to reorder.",
  "skinChips.chipHint":
    "Enter to edit. Delete to remove. Alt or Option + arrow to move.",
  "skinChips.editHint": "Enter to save. Escape to cancel.",
  "skinChips.editLabel": "Edit {text}",
  "skinChips.remove": "Remove {text}",
  "skinChips.added": "Added {text}",
  "skinChips.addedMany_one": "Added {count} item",
  "skinChips.addedMany_other": "Added {count} items",
  "skinChips.removed": "Removed {text}",
  "skinChips.moved": "{text} moved to position {position} of {total}",
  "skinChips.duplicate": "{text} is already on the list",
  "editorPane.skinBlocks.ledeTherapist":
    "Everything on your therapist page, in the order visitors read it. Work through it a chapter at a time.",
  "skinChapter.navLabel": "Chapters",
  "skinChapter.position": "Chapter {index} of {total}",
  "skinChapter.chipLabel": "{title}, {status}",
  "skinChapter.fillComplete": "all filled",
  "skinChapter.back": "Back",
  "skinChapter.next": "Next: {title}",
  // Therapist editor labels and checks (pass 3)
  "skinControl.validate.email":
    "This doesn't look like an email address. Your page leaves it out until it does.",
  "skinControl.validate.url":
    "This doesn't look like a web address. Your page leaves it out until it does.",
  "skinBlock.therapist.feeSchedule.label": "Length",
  "skinBlock.therapist.feeSchedule.value": "Price",
  "skinBlock.therapist.therapyFees.standardPerSession":
    "Standard fee per session",
  "skinBlock.therapist.therapyFees.standardHelper":
    "Your page needs this for the cost calculator and reimbursement.",
  "skinBlock.therapist.therapyFees.insuranceNote": "Insurance note",
  "skinBlock.therapist.therapyFees.insuranceNoteHelper":
    "Shown as Insurance at the top of your page.",
  "skinBlock.therapist.therapyFees.firstContactHelper":
    "Also the title of your contact card while you're taking new clients.",
  "skinBlock.therapist.boundaries.label": "What you don't do",
  "skinBlock.therapist.group.referrals": "If you're full, who you recommend",
  "skinBlock.therapist.travel.entranceLabel": "Entrance",
  "skinBlock.therapist.venue.name": "In person",
  "skinBlock.therapist.venue.namePlaceholder": "Clínica do Intendente",
  "skinBlock.therapist.venue.linesPlaceholder": "Rua de Angola 12, 2nd floor",
  "skinBlock.therapist.therapist.timezoneHelper":
    "Shown when you have no in-person place.",
  "skinBlock.therapist.faq.questionPlaceholder": "Do you work with couples?",
  "skinBlock.therapist.referrals.namePlaceholder": "Dr. Ana Sousa",

  // Therapist profile (m1)
  "therapist.edit.link": "Edit",
  "therapist.edit.portrait": "Edit portrait",
  "therapist.edit.whoFor": "Edit who you work with",
  "therapist.edit.bookButton": "Edit booking button",
  "therapist.edit.contactLinks": "Edit email and website",
  "therapist.edit.aria.portrait": "Edit portrait",
  "therapist.edit.aria.name": "Edit name and tagline",
  "therapist.edit.aria.bio": "Edit bio",
  "therapist.edit.aria.bookButton": "Edit booking button",
  "therapist.edit.aria.status": "Edit status",
  "therapist.edit.aria.role": "Edit title and registration",
  "therapist.edit.aria.quote": "Edit quote",
  "therapist.edit.aria.lived": "Edit lived experience",
  "therapist.edit.aria.languages": "Edit languages",
  "therapist.edit.aria.where": "Edit where you work",
  "therapist.edit.aria.contactLinks": "Edit email and website",
  "therapist.edit.aria.goodToKnow": "Edit good to know",
  "therapist.edit.aria.fees": "Edit fees",
  "therapist.edit.aria.receipts": "Edit receipts and insurance",
  "therapist.edit.aria.firstContact": "Edit first contact",
  "therapist.edit.aria.approach": "Edit how you work",
  "therapist.edit.aria.whoFor": "Edit who you work with",
  "therapist.edit.aria.firstSession": "Edit first session",
  "therapist.edit.aria.sessions": "Edit session lengths and prices",
  "therapist.edit.aria.calculator": "Edit reimbursement",
  "therapist.edit.aria.travel": "Edit getting there",
  "therapist.edit.aria.access": "Edit accessibility",
  "therapist.edit.aria.faq": "Edit questions people ask",
  "therapist.edit.aria.referrals": "Edit who you recommend",
  "therapist.edit.aria.worksAlongside": "Edit who you work alongside",
  "therapist.edit.aria.basics": "Edit the basics",
  "therapist.edit.aria.availability": "Edit availability",
  "therapist.edit.aria.whereChapter": "Edit where and access",
  "therapist.edit.aria.contact": "Edit contact and referrals",
  "therapist.edit.aria.identity": "Edit name, photo and bio",
  "therapist.edit.aria.presence": "Edit button, links and accent",
  "therapist.edit.aria.specialties": "Edit specialties",
  "therapist.edit.aria.publish": "Edit publishing",
  "therapist.edit.aria.page": "Edit your page",
  "therapist.owner.missingLead": "Missing:",
  "therapist.owner.missingItem": "Fill in: {item}",
  "therapist.owner.capacityShort.open": "Accepting",
  "therapist.owner.capacityShort.closed": "Not taking",
  "therapist.owner.capacityShort.wait": "Waitlist",
  // Therapist profile (m2)
  "therapist.side.edit.waitNote": "Edit waitlist note",
  "therapist.side.edit.email": "Edit email address",
  "therapist.side.edit.website": "Edit website",
  "therapist.side.edit.socialLinks": "Edit social links",
  "therapist.side.add.booking": "Add a booking link",
  "therapist.side.add.email": "Add an email address",
  "therapist.side.add.website": "Add a website",
  "therapist.side.social.label": "Find {name} elsewhere",
  "therapist.side.social.add": "Add your links",
  "therapist.side.add.goodToKnow": "Add a note people should know",

  // Therapist profile (m3)
  "editorTherapist.taglineHelper":
    "One line on who you work with and where. It sits beside your name at the top of your page.",
  "editorTherapist.taglinePlaceholder":
    "e.g. Queer-affirming therapy in Lisbon and online",
  "editorTherapist.bioHelper":
    "Your first paragraph shows as the quote at the top of your page until you add a quote in Page blocks. At least 80 characters to publish a standalone persona. Type @ to mention a member, c/ a community, e/ an event or t/ a forum thread, and it becomes a link.",
  "editorTherapist.coverHelper":
    "Shows as a thin band across the top of your page, above your profile. Keep what matters in the middle of the frame, since the band trims the top and bottom.",
  "editorTherapist.availabilityHelper":
    "Follows your status in Page blocks: change the status there and this updates when you save.",
  "editorTherapist.ctaHelper":
    "This is the booking button at the top of your page and in the contact card, for example “Book the free call”. Add both a label and the link where clients book.",
  "editorTherapist.ctaLabelPlaceholder": "Book the free call",
  // Therapist "What you help with" topic editor (Page blocks, How you work)
  "therapistTopics.topicLabel": "Topic {index}",
  "therapistTopics.topicPlaceholder":
    "Name a topic, e.g. Identity and coming out",
  "therapistTopics.lineLabel": "Line {index} of {topic}",
  "therapistTopics.linePlaceholder":
    "Something you help with, e.g. Coming out at any age",
  "therapistTopics.addLine": "Add a line",
  "therapistTopics.addTopic": "Add a topic",
  "therapistTopics.removeTopic": "Remove {name}",
  "therapistTopics.removeTopicFallback": "this topic",
  "therapistTopics.removeLine": "Remove line {index} of {topic}",
  "therapistTopics.emptyLead": "Name the first thing you help with.",
  "therapistTopics.enterHint":
    "Enter adds a line. Drag a handle or click it to move a line, or press Alt or Option + arrow.",
  "therapistTopics.enterHintTouch":
    "Drag a handle, or tap it, to move a line or topic.",
  "therapistTopics.gripTopicRow": "Topic",
  "therapistTopics.gripLineRow": "{topic}, line",
  "therapistTopics.suggestion.identity": "Identity and coming out",
  "therapistTopics.suggestion.gender": "Gender and transition",
  "therapistTopics.suggestion.relationships": "Relationships and intimacy",
  "therapistTopics.suggestion.anxiety": "Anxiety and low mood",
  "therapistTopics.suggestion.trauma": "Trauma and recovery",
  "therapistTopics.suggestion.grief": "Grief and loss",
  "therapistTopics.suggestion.family": "Family and chosen family",
  "therapistTopics.suggestion.work": "Work and burnout",
  "therapistTopics.capHint": "That's the most topics you can add.",
  "therapistTopics.suggestionsLead": "Or start from one of these",
  "therapistTopics.moreSuggestionsLead": "More ideas",
  "therapistTopics.suggestionExample.identity": "e.g. Coming out at any age",
  "therapistTopics.suggestionExample.gender":
    "e.g. Social or medical transition",
  "therapistTopics.suggestionExample.relationships":
    "e.g. Non-monogamy and open relationships",
  "therapistTopics.suggestionExample.anxiety": "e.g. Social anxiety",
  "therapistTopics.suggestionExample.trauma":
    "e.g. Recovering from bullying or abuse",
  "therapistTopics.suggestionExample.grief":
    "e.g. Losing a partner or a friend",
  "therapistTopics.suggestionExample.family":
    "e.g. Family who don't accept you",
  "therapistTopics.suggestionExample.work": "e.g. Being out at work",
  // Therapist editor review fixes (pass 4)
  "skinBlock.therapist.venue.addLine": "Add a line",
  "skinBlock.therapist.notFor.addLine": "Add a reason",
  "skinBlock.therapist.boundaries.addLine": "Add a boundary",
  "skinBlock.therapist.openSlots.addLine": "Add a slot",
  "skinBlock.therapist.access.addLine": "Add something you offer",
  "skinBlock.therapist.accessMissing.addLine": "Add something missing",
  "skinList.linesHint":
    "Enter adds a line. Drag a handle or click it to move a line, or press Alt or Option + arrow.",
  "skinList.gripLabel": "Move {label} {index}",
  "skinList.gripLabelNamed": "Move {label}",
  "skinList.moveMenu.up": "Move up",
  "skinList.moveMenu.down": "Move down",
  "skinList.moveMenu.top": "Move to top",
  "skinList.moveMenu.bottom": "Move to bottom",
  "skinList.linesHintTouch":
    "Return adds a line. Drag a handle, or tap it, to move a line.",
  // Page editor lists as reorderable rows
  "skinBlock.page.excerpt.linesPlaceholder":
    "a border folded into every vowel.",
  "skinBlock.table.menuMeta.practicalPlaceholder": "14 seats",
  "skinBlock.table.menuMeta.addPractical": "Add a note",
  "skinBlock.practice.firstSession.add": "Add a step",
  "skinBlock.practice.firstSession.stepTitlePlaceholder": "The first call",
  "skinBlock.practice.firstSession.bodyPlaceholder":
    "A free 20-minute call. You ask, I answer, nobody commits.",
  "skinBlock.practice.access.placeholder": "Step-free entrance and lift",
  "skinBlock.practice.access.add": "Add something you offer",
  "skinBlock.practice.referrals.add": "Add a referral",
  "skinBlock.practice.referrals.namePlaceholder": "Marta Reis",
  "skinBlock.practice.referrals.notePlaceholder":
    "Same approach, in Graça. She takes my overflow.",
  "skinBlock.practice.approach.placeholder":
    "Person-centred at the core. We set the pace together.",
  "skinBlock.practice.training.placeholder":
    "Two-year practitioner training, Lisbon",
  "skinBlock.practice.training.add": "Add a qualification",
  "skinBlock.practice.training.helper": "Most recent first.",
  "skinBlock.practice.feeSchedule.add": "Add a fee",
  "skinBlock.practice.feeSchedule.labelPlaceholder": "50 min",
  "skinBlock.practice.feeSchedule.valuePlaceholder": "60€",
  "skinBlock.practice.venue.linesPlaceholder": "Rua de Álvaro Coutinho",
  "skinBlock.chart.ethics.placeholder":
    "Read as a mirror for where you are now. I leave what happens next to you.",
  "skinBlock.chart.ethics.add": "Add a boundary",
  "skinBlock.chair.beforeYouSit.placeholder":
    "You can bring a friend, or your own clippers, or nothing at all.",
  "skinBlock.chair.beforeYouSit.add": "Add a note",
  "skinBlock.collective.principles.placeholder":
    "Nobody is handed to the police. Ever.",
  "skinBlock.collective.principles.add": "Add a principle",
  "skinBlock.classroom.promises.placeholder":
    "You are never made to read out loud before you want to.",
  "skinBlock.classroom.promises.add": "Add a promise",
  "skinBlock.therapist.openSlots.chipHelper":
    "Write each slot the way it should read on your page, like Tue 30 Sep · 18:00.",
  "skinBlock.therapist.hours.valueTimes": "Times",
  "skinBlock.therapist.reimbursement.valueBack": "Back per session",
  "skinBlock.therapist.therapist.whereArea": "Area",
  "skinBlock.therapist.therapist.whereAreaPlaceholder": "Arroios, Lisbon",
  "skinBlock.therapist.therapyFees.placesHelperBoth":
    "Fill in both to show sliding-scale places on your page.",
  "skinBlock.therapist.therapyFees.placesOpen": "Places open",
  "skinBlock.therapist.therapyFees.placesTotal": "Total",
  "skinBlock.therapist.therapyFees.slidingLowest": "Lowest",
  "skinBlock.therapist.therapyFees.slidingHighest": "Highest",
  "skinBlock.therapist.hours.add": "Add hours",
  "skinBlock.therapist.reimbursement.add": "Add an insurer",
  "skinBlock.therapist.referrals.add": "Add a referral",
  "skinBlock.therapist.worksAlongside.add": "Add a connection",
  "skinChapter.toFill_one": "{count} to fill",
  "skinChapter.toFill_other": "{count} to fill",
  "skinChapter.empty": "(empty)",
  "skinChapter.cardCount": "{filled} of {total}",
  "skinChapter.cardDone": "Done",
  "skinChapter.cardCountSpoken": "{filled} of {total} filled",
  "skinControl.refined.example": "e.g. {example}",
  "skinControl.suggest.show": "Show the list",
  "skinControl.refined.multiSelect.more": "More",
  "skinControl.refined.multiSelect.choose": "Choose",
  "skinControl.refined.close": "Close",
  "skinControl.quote.helper":
    "Select words, then press Emphasise (Cmd+I) to set them in coral italics.",
  "skinControl.quote.emphasise": "Emphasise",
  "skinControl.quote.removeEmphasis": "Remove emphasis",
  "skinControl.quote.lengthGuide": "Short quotes land best: one or two lines.",
  "skinControl.quote.lengthOver":
    "That's over {limit} characters. Short quotes land best: one or two lines.",
  "skinList.removeRow": "Remove {label} {index}",
  "skinList.removeRowNamed": "Remove {label}",
  "skinList.addLine": "Add a line",
  "editorPane.presence.ledeTherapist":
    "Cover image, accent colour, whether you're taking new clients, and the button people use to book with you.",
  // Therapist page credentials and gallery
  "therapist.credentials.label": "Training and registration",
  "therapist.credentials.heading": "Where {name} *trained*",
  "therapist.credentials.headingNameless": "Where the *training* comes from",
  "therapist.gallery.label": "The practice",
  "therapist.gallery.heading": "A look *inside*",
  "therapist.gallery.alt": "Photo {number} of {name}'s practice",
  "therapist.gallery.openAria": "{photo}. Open full-screen",
  "therapist.edit.aria.credentials": "Edit training and registration",
  "therapist.edit.aria.gallery": "Edit practice photos",
};

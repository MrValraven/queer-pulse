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
  "directory.searchPlaceholder": "Search personas",
  "directory.searchAria": "Search personas",
  "directory.filterLabel": "Filter by craft",
  "directory.filterAll": "All",
  "directory.loading": "Loading personas…",
  "directory.empty.title": "No personas here yet",
  "directory.empty.description":
    "Nothing matches this just now. Try another craft, or clear your search and see everyone.",
  "directory.empty.clear": "Clear filters",
  "directory.error.title": "We couldn't load the directory",
  "directory.error.description":
    "Something went wrong reaching the server. This isn't an empty directory. Try again in a moment.",
  "directory.error.retry": "Try again",
  "directory.openToCollabsChip": "Open to collabs",
  "directory.tagFilterHeading": "Tags",
  "directory.tagFilterLabel": "Filter by tag",

  "directory.filtersNote_one": "{count} craft to browse.",
  "directory.filtersNote_other": "{count} crafts to browse.",
  "directory.showMore": "Show more",
  "directory.shownOfTotal": "{shown} of {total}",

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
  "card.view": "View",

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
  "alsoAs.edit": "Edit",
  "alsoAs.moveUp": "Move up",
  "alsoAs.moveDown": "Move down",
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
  "nav.browse": "Personas",
  "nav.mine": "Your personas",
  "command.mine.name": "My personas",
  "command.mine.sub": "Your professional personas",
  "command.browse.name": "Browse personas",
  "command.browse.sub": "The persona directory",

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
  "checklist.reqItemsTitle": "At least three things to show",
  "checklist.reqItemsMet": "Enough work for the page to feel alive.",
  "checklist.reqItemsFail":
    "Add a few more pieces. You need at least three across your sections.",
  "checklist.reqLanguageTitle": "Language that keeps everyone welcome",
  "checklist.reqLanguageMet": "Nothing flagged.",
  "checklist.reqLanguageFail":
    "A word in your name, handle or bio might not sit right with everyone. Mind rewording it?",

  // Publish-checklist polish nudges (non-blocking, PublishChecklist.tsx)
  "checklist.polishTitle": "A little more polish",
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
  "mine.defaultName": "That persona",
  "mine.toastDeleted": "{name} deleted",
  "mine.toastDeleteError": "We couldn't delete that just now. Try again.",
  "mine.deleteModalTitle": "Delete this persona?",
  "mine.deleteModalSub": "“{name}” and everything on it will be gone for good.",
  "mine.deleteModalDefaultName": "This persona",
  "mine.deleteModalKeep": "Keep it",
  "mine.deleteModalConfirm": "Delete",
  "mine.deleteModalDeleting": "Deleting…",
  "mine.deleteModalBody": "This can't be undone.",
  "mine.deleteModalBodyShared":
    "This removes {name} for all {n} co-owners. It can't be undone.",
  "mine.rowEdit": "Edit",
  "mine.rowDelete": "Delete",
  "mine.endorsementCount_one": "{count} endorsement",
  "mine.endorsementCount_other": "{count} endorsements",
  "mine.followerCount_one": "{count} follower",
  "mine.followerCount_other": "{count} followers",

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
  "mine.emptySamples.practice.line": "Psychotherapy for LGBTQ+ adults · EN / PT",
  "mine.emptySamples.table.name": "Casa Corvo",
  "mine.emptySamples.table.line": "Supper club for people who arrive hungry and leave late",
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
  "editor.backLink": "Your personas",

  // Meta editor (useSubprofileMetaEditor, fed to the Identity/Presence/
  // Address rail panes)
  "metaForm.sectionTitle": "The basics",
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
    "At least 80 characters to publish a standalone persona.",
  "metaForm.bioPlaceholder": "A few sentences in your own words.",
  "metaForm.linkLabel": "Link to your main profile",
  "metaForm.addressLabel": "Profile address",
  "metaForm.livesAt": "Lives at",
  "metaForm.addressPlaceholder": "e.g. engineering",
  "metaForm.handleLabel": "Handle",
  "metaForm.visibilityLabel": "Who can see it",

  // Presence fields (SubprofilePresenceFields): cover, accent, availability, CTA
  "metaForm.coverLabel": "Cover image",
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

  "metaForm.save": "Save details",
  "metaForm.saving": "Saving…",
  "metaForm.leaveConfirm":
    "You have unsaved changes to this profile. Leave without saving them?",
  "metaForm.toastSaved": "Details saved",
  "metaForm.toastError": "We couldn't save that just now. Try again.",

  // Item drawer (SubprofileItemDrawerFields, opened by SubprofileItemDrawer)
  "itemEditor.itemNumber": "Item {n}",
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
  "itemEditor.featuredBadge": "Featured",

  // Collaborator member picker (CollaboratorSelect, inside SubprofileItemDrawerFields)
  "itemEditor.collaboratorsLabel": "Collaborators",
  "itemEditor.collaboratorsPlaceholder": "Search members to credit",
  "itemEditor.collaboratorsSearchPlaceholder": "Search by name or @handle",
  "itemEditor.collaboratorsEmpty": "No members match that search.",
  "itemEditor.collaboratorsHelper":
    "Search for members and pick them to credit their work here.",
  "itemEditor.collaboratorsCapHint": "That's the most collaborators you can add.",

  // Social links editor (SubprofileSocialLinksEditor)
  "socialEditor.title": "Social links",
  "socialEditor.add": "Add a link",
  "socialEditor.platformLabel": "Link platform",
  "socialEditor.linkFor": "{platform} link",
  "socialEditor.removeLinkFor": "Remove {platform} link",
  "socialEditor.other": "Other link",
  "socialEditor.save": "Save links",
  "socialEditor.saving": "Saving…",
  "socialEditor.saved": "Links saved",
  "socialEditor.error": "We couldn't save that just now. Try again.",
  "socialEditor.capHint": "That's the most links you can add.",

  // Per-item links editor (projects / open-source items)
  "itemLinks.label": "Links",
  "itemLinks.helper": "Add a repo, live demo, or docs link.",
  "itemLinks.add": "Add link",

  // Section editor (SubprofileSectionEditor)
  "sectionEditor.empty": "Nothing here yet. Add your first when you're ready.",
  "sectionEditor.addTo": "Add to {section}",
  "sectionEditor.capHint": "That's the most you can add to one section.",
  "sectionEditor.save": "Save section",
  "sectionEditor.saving": "Saving…",
  "sectionEditor.toastSaved": "{section} saved",
  "sectionEditor.toastError": "We couldn't save that just now. Try again.",

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
  "newModal.craftSummary": "A {kind} persona gets a {skin} page with {sections}.",
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
  "family.chair.note": "A lit mirror and a price list that never asks your gender.",
  "family.runway.label": "Runway",
  "family.runway.note": "A lookbook spread: enormous name, tiny credits, tall images.",
  "family.gallery.label": "Gallery",
  "family.gallery.note": "Museum air. Every item is a wall label.",
  "family.history.label": "Record",
  "family.history.note": "Aged paper and a timeline: dates in the margin, sources named.",
  "family.collective.label": "Poster",
  "family.collective.note": "Riso ink on cheap paper: a demand at the top, dates you read across a room.",
  "family.classroom.label": "Classroom",
  "family.classroom.note": "A board and a handout: numbered weeks, fees stated before you ask.",

  // Starter templates (Phase 4a) — create-time picker (NewSideModal)
  // and the in-editor "Insert examples" affordance (SubprofileSectionEditor).
  // Section-item copy reads as friendly, editable placeholders — a creator
  // is meant to replace them with their own work, not keep them as-is.
  "template.helper":
    "Templates fill your sections with a couple of example items and a suggested tagline. Everything's yours to edit or clear.",
  "template.insertExamples": "Insert examples",

  // Per-kind suggested taglines — applied alongside the section templates,
  // but left fully editable.
  "template.tagline.developer": "Building things, mostly for people I love.",
  "template.tagline.writer": "Words I couldn't keep to myself.",
  "template.tagline.musician": "Sound for queer nights and quiet mornings.",
  "template.tagline.visual_artist":
    "Images that hold what words can't.",
  "template.tagline.filmmaker": "Stories told frame by frame.",
  "template.tagline.designer":
    "Making things easier, and a little more beautiful.",
  "template.tagline.maker": "Made by hand, made with care.",
  "template.tagline.drag": "Glamour with a point to make.",
  "template.tagline.dj": "Sets built for the dancefloor.",
  "template.tagline.dancer": "Movement as another way of speaking.",
  "template.tagline.performer": "On stage, for whoever needs it.",
  "template.tagline.photographer":
    "Holding still what usually moves too fast.",
  "template.tagline.videomaker": "Moving pictures, made with intention.",
  "template.tagline.chef": "Cooking for queer tables, one plate at a time.",
  "template.tagline.mixologist": "Drinks mixed for the night ahead.",
  "template.tagline.therapist": "An affirming space to think things through.",
  "template.tagline.astrologer": "Charts read slowly, for the life you're living.",
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
  "template.section.clients.item1.title": "A client or brand you've worked with",
  "template.section.collections.item1.title": "A collection",
  "template.section.collections.item1.desc":
    "What it's made of and what inspired it.",
  "template.section.workshops.item1.title": "A workshop I ran",
  "template.section.workshops.item1.subtitle": "Where it happened",
  "template.section.shows.item1.title": "A show",
  "template.section.shows.item1.subtitle": "Where you performed",
  "template.section.looks.item1.title": "A look",
  "template.section.looks.item1.desc":
    "What inspired it and how you built it.",
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
  "template.section.videos.item1.desc":
    "What it shows, in a line or two.",
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
  "template.section.cocktails.item1.desc":
    "What's in it and what inspired it.",
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

  // Persona hero (SubprofileHero)
  "hero.message": "Message",
  "hero.edit": "Edit persona",
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
  "hero.endorse.addNote": "Add a note",
  "hero.endorse.notePlaceholder": "Say a word about why (optional)",
  "hero.endorse.send": "Send",
  "hero.endorse.error": "We couldn't save that just now. Try again.",
  "hero.endorse.endorsedByNames": "Endorsed by {names}",

  // Endorse-with-note modal (EndorseSubprofileModal, EndorseSubprofileModalParts)
  "hero.endorse.modal.ariaLabel": "Endorse {name}",
  "hero.endorse.modal.close": "Close",
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
  "hero.endorse.modal.success.title": "Thank you for your <em>endorsement</em>.",
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
  "share.copied": "Link copied",
  "share.copyFailed":
    "Your browser wouldn't let us copy that. The link is right there, select it and copy it by hand.",
  "share.copyFailedWithUrl":
    "Your browser wouldn't let us copy that. Here is the link: {url}",
  "share.resolvingAddress":
    "One moment, we're looking up this persona's address.",

  // Share-card modal (SubprofileShareCard) + QR code (SubprofileQR) —
  // entry points in SubprofileHero (public) and MySubprofilesPage (owner).
  "shareCard.cta": "QR code",
  "shareCard.title": "Take it with you",
  "shareCard.subtitle":
    "Scan to open {name}'s page on another device, or save the details below.",
  "shareCard.download": "Download contact card",
  "shareCard.qrAria": "QR code linking to {name}'s persona page",
  "shareCard.copyLink": "Copy link",
  "qr.loading": "Generating QR code…",
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
  "galleryPhotoAlt": "{name}, gallery photo {number}",
  // Clickable gallery cell + the full-screen gallery lightbox (GalleryLightbox).
  "galleryPhotoOpen": "Open {name}'s photo {number} full-screen",
  "galleryLightboxLabel": "{name}'s photos",

  // Gallery-section editor cap (SubprofileSectionEditor) — shown in place of
  // the Add affordance once the universal gallery section hits its 6-photo max.
  "galleryFull": "6 photos maximum",

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
  "page.visit": "Visit",
  "page.notFoundTitle": "This persona isn't here",
  "page.notFoundMetaTitle": "Persona not found · QueerPulse",
  "page.notFoundDescription":
    "It may have been unpublished, kept private, or this link could be out of date. Nothing's wrong on your end.",
  "page.notFoundAction": "Browse personas",
  "page.notFoundBack": "Go back",

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
    "Link this persona to the events and communities you're part of.",
  "affiliationsEditor.empty":
    "Nothing linked yet. Add an event or community below.",
  "affiliationsEditor.itemNumber": "Item {n}",
  "affiliationsEditor.remove": "Remove",
  "affiliationsEditor.typeLabel": "Type",
  "affiliationsEditor.roleLabel": "Role",
  "affiliationsEditor.slugLabel": "Event or community address",
  "affiliationsEditor.slugPlaceholder": "e.g. queer-book-club",
  "affiliationsEditor.slugHelper":
    "We'll check it matches a real event or community when you save.",
  "affiliationsEditor.add": "Add a link",
  "affiliationsEditor.capHint": "That's the most links you can add.",
  "affiliationsEditor.save": "Save links",
  "affiliationsEditor.saving": "Saving…",
  "affiliationsEditor.saved": "Links saved",
  "affiliationsEditor.error": "We couldn't save that just now. Try again.",

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
  "invite.searchAria": "Search your connections",
  "invite.empty": "No connections left to invite.",
  "invite.cta": "Invite",
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
  "peopleModal.noEndorsementsBody":
    "When someone backs this persona's work, they'll show up here.",
  "peopleModal.noFollowers": "No followers yet",
  "peopleModal.noNote": "Endorsed without a note",
  "peopleModal.removeAriaLabel": "Remove your endorsement of {name}",
  "peopleModal.removeCta": "Remove",
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
  "poem.editor.resplit.body": "This looks like an older poem saved as one long line. We can suggest new line breaks from its punctuation. You'll still be able to edit them afterwards.",
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
  "rights.copyright": "© {year} {author}. All rights reserved.",
  "rights.firstPublished": "First published on QueerPulse · {date}",

  // Skin-blocks editor (personas expansion — page-block editor pane, rail entry & field labels)
  "editorRail.skinBlocks": "Page blocks",
  "editorPane.skinBlocks.title": "Page blocks",
  "editorPane.skinBlocks.lede": "The details unique to your page: booking terms, hours, what people should bring. These show on your public page.",
  "pending.area.skin": "Page blocks",
  "pending.skinEdited": "{field} updated",
  "skinBlock.addItem": "Add",
  "skinBlock.removeItem": "Remove",
  "skinBlock.moveUp": "Move up",
  "skinBlock.moveDown": "Move down",
  "skinBlock.dragToReorder": "Drag to reorder",
  "skinBlock.lineLabel": "{label} {index}",
  "skinBlock.entryLabel": "Entry {index}",
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
  "skinBlock.practice.availability.help": "Tap a day to cycle it: free, then full, then no sessions.",
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
  "editorRail.backLink": "Your personas",
  "editorRail.thisSide": "This persona",
  "editorRail.identity": "Identity",
  "editorRail.presence": "Presence & contact",
  "editorRail.address": "Address & reach",
  "editorRail.content": "Content",
  "editorRail.people": "People",
  "editorRail.publishGroup": "Publish",
  "editorRail.publish": "Publish",
  "editorRail.getItLive": "Get it live",

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
  "pending.metaSet": "{field} → {value}",
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

  // Publish panel additions (SubprofilePublishPanel) — a quick client-side
  // readiness estimate shown before a publish attempt (separate from the
  // authoritative `checklist.*` below), plus the danger-zone delete row.
  "publishPanel.estimateTitle": "Quick estimate",
  "publishPanel.estimateNote":
    "A rough read on where you stand. The checklist below is what actually decides if you can publish.",
  "publishPanel.deleteCopy":
    "Deleting this persona removes it, and everything on it, for good.",
  "publishPanel.deleteCta": "Delete this persona",

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
  "invite.loadMore": "Show more connections",
  "invite.loadingMore": "Loading…",

  "editorSavebar.mobilePreview": "Preview",
  "mobilePreview.ariaLabel": "Live preview of your persona page",
};

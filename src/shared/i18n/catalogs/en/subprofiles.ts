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
    "Pseudonymous professional personas from across the community. No ranking, no algorithm — just the work.",
  "directory.searchPlaceholder": "Search personas",
  "directory.searchAria": "Search personas",
  "directory.filterLabel": "Filter by craft",
  "directory.filterAll": "All",
  "directory.loading": "Loading personas…",
  "directory.empty.title": "No personas here yet",
  "directory.empty.description":
    "Nothing matches this just now. Try another craft, or clear your search and see everyone.",
  "directory.empty.clear": "Clear filters",
  "directory.openToCollabsChip": "Open to collabs",
  "directory.tagFilterHeading": "Tags",
  "directory.tagFilterLabel": "Filter by tag",

  // Directory card affordances (SubprofileCard)
  "card.openToCollabs": "Open to collabs",
  "card.socialCount_one": "{count} social link",
  "card.socialCount_other": "{count} social links",

  // Main-profile "Also as…" block (ProfileSubprofilesSection)
  "alsoAs.title": "Also working as",
  "alsoAs.subtitlePublic": "Professional personas linked to this profile.",
  "alsoAs.subtitleSelf": "The professional personas you've linked here.",
  "alsoAs.subtitleEmpty": "Another side of your work can live here.",
  "alsoAs.manage": "Manage subprofiles →",
  "alsoAs.empty.title": "Add a professional subprofile",
  "alsoAs.empty.description":
    "Show another side of your work — your music, your code, your writing — linked here or standing on its own.",
  "alsoAs.empty.cta": "Create a subprofile",

  // Nav + command palette
  "nav.browse": "Subprofiles",
  "nav.mine": "Subprofiles",
  "command.mine.name": "My subprofiles",
  "command.mine.sub": "Your professional personas",
  "command.browse.name": "Browse subprofiles",
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
  "kind.generic": "Other",

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
  "section.showcase": "Showcase",
  "section.links": "Links",

  // Status / link-visibility badges — also persisted fields.
  "status.draft": "Draft",
  "status.published": "Published",
  "link.linked": "Linked",
  "link.standalone": "Standalone",
  "link.help.linked":
    "Shown on your main profile as another side of you — people can see the two are the same person.",
  "link.help.unlinked":
    "Stands on its own, with no visible tie to your main profile. It earns a public handle once it passes the completeness check.",

  // Visibility options (SubprofileMetaForm) — persisted `visibility` field.
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

  // Item-editor field labels/placeholders (SubprofileItemEditor)
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
    "This is where people will find you — queerpulse.app/p/your-handle.",
  "checklist.reqHandleFailInvalid":
    "Handles are 3–30 characters: lowercase letters, numbers and hyphens.",
  "checklist.reqHandleFailTaken":
    "Someone already has that handle — try another.",
  "checklist.reqHandleFailReserved":
    "That handle is reserved. Pick a different one.",
  "checklist.reqAvatarTitle": "A photo or image",
  "checklist.reqAvatarMet": "Your avatar helps people recognise this persona.",
  "checklist.reqAvatarFail":
    "Add an avatar so people can put a face, or a mark, to the name.",
  "checklist.reqBioTitle": "A bio of at least 80 characters",
  "checklist.reqBioMet": "Enough for someone to get who you are at a glance.",
  "checklist.reqBioFail":
    "Tell people a little more — your bio needs at least 80 characters.",
  "checklist.reqItemsTitle": "At least three things to show",
  "checklist.reqItemsMet": "Enough work for the page to feel alive.",
  "checklist.reqItemsFail":
    "Add a few more pieces — you need at least three across your sections.",
  "checklist.reqLanguageTitle": "Language that keeps everyone welcome",
  "checklist.reqLanguageMet": "Nothing flagged.",
  "checklist.reqLanguageFail":
    "Something in your name, handle or bio was flagged — please reword it.",

  // Publish-checklist polish nudges (non-blocking, PublishChecklist.tsx)
  "checklist.polishTitle": "A little more polish",
  "checklist.polishCover": "A cover image",
  "checklist.polishSocials": "A social link",
  "checklist.polishAvailability": "Your availability",
  "checklist.polishDone": "Looking polished",

  // Owner dashboard (MySubprofilesPage + MySubprofileRow)
  "mine.title": "Your <em>subprofiles</em>",
  "mine.sub":
    "A professional side of you for each thing you do — linked to your main profile, or standing on its own.",
  "mine.newCta": "New subprofile",
  "mine.atCap": "You've reached the most personas one account can hold.",
  "mine.emptyTitle": "No subprofiles yet",
  "mine.emptyDescription":
    "Make one for each craft you want to share — your music, your code, your writing — and choose whether it's tied to your name.",
  "mine.emptyCta": "Create your first",
  "mine.untitled": "Untitled persona",
  "mine.defaultName": "That persona",
  "mine.toastDeleted": "{name} deleted",
  "mine.toastDeleteError": "We couldn't delete that just now — try again.",
  "mine.deleteModalTitle": "Delete this persona?",
  "mine.deleteModalSub": "“{name}” and everything on it will be gone for good.",
  "mine.deleteModalDefaultName": "This persona",
  "mine.deleteModalKeep": "Keep it",
  "mine.deleteModalConfirm": "Delete",
  "mine.deleteModalDeleting": "Deleting…",
  "mine.deleteModalBody": "This can't be undone.",
  "mine.rowEdit": "Edit",
  "mine.rowDelete": "Delete",
  "mine.endorsementCount_one": "{count} endorsement",
  "mine.endorsementCount_other": "{count} endorsements",
  "mine.followerCount_one": "{count} follower",
  "mine.followerCount_other": "{count} followers",

  // Editor page (SubprofileEditorPage)
  "editor.loading": "Loading your persona…",
  "editor.notFoundTitle": "We couldn't find that persona",
  "editor.notFoundDescription":
    "It may have been removed, or the link isn't quite right.",
  "editor.notFoundAction": "Back to your subprofiles",
  "editor.backLink": "Your subprofiles",

  // Meta form (SubprofileMetaForm)
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
  "metaForm.toastSaved": "Details saved",
  "metaForm.toastError": "We couldn't save that just now — try again.",

  // Item editor (SubprofileItemEditor)
  "itemEditor.itemNumber": "Item {n}",
  "itemEditor.moveUp": "Move up",
  "itemEditor.moveDown": "Move down",
  "itemEditor.remove": "Remove",
  "itemEditor.tagsHelper": "Separate with commas",
  "itemEditor.feature": "Make this the spotlight",
  "itemEditor.unfeature": "Remove from spotlight",
  "itemEditor.featuredBadge": "Featured",

  // Collaborator chip editor (HandleChipInput, inside SubprofileItemEditor)
  "itemEditor.collaboratorsLabel": "Collaborators",
  "itemEditor.collaboratorsPlaceholder": "@handle",
  "itemEditor.collaboratorsHelper":
    "Type an @handle and press enter or comma to credit them here.",
  "itemEditor.collaboratorsCapHint": "That's the most collaborators you can add.",
  "itemEditor.collaboratorRemove": "Remove @{handle}",

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
  "socialEditor.error": "We couldn't save that just now — try again.",
  "socialEditor.capHint": "That's the most links you can add.",

  // Section editor (SubprofileSectionEditor)
  "sectionEditor.empty": "Nothing here yet — add your first when you're ready.",
  "sectionEditor.addTo": "Add to {section}",
  "sectionEditor.capHint": "That's the most you can add to one section.",
  "sectionEditor.save": "Save section",
  "sectionEditor.saving": "Saving…",
  "sectionEditor.toastSaved": "{section} saved",
  "sectionEditor.toastError": "We couldn't save that just now — try again.",

  // Publish panel (SubprofilePublishPanel)
  "publishPanel.successTitle": "You're",
  "publishPanel.successEm": "live",
  "publishPanel.closeLabel": "Keep editing",
  "publishPanel.viewLive": "See it live",
  "publishPanel.successLinked":
    "This persona now shows on your main profile as another side of you.",
  "publishPanel.successUnlinked":
    "This persona stands on its own now — people can find it by its handle and in the directory.",
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
    "We couldn't publish — check the requirements below.",
  "publishPanel.toastUnpublished": "Back to draft — only you can see it now.",
  "publishPanel.toastError": "We couldn't do that just now — try again.",

  // New subprofile modal (NewSubprofileModal)
  "newModal.title": "Start a new <em>persona</em>",
  "newModal.sub":
    "Each one is a professional side of you — pick what it's for.",
  "newModal.cancel": "Cancel",
  "newModal.create": "Create draft",
  "newModal.creating": "Creating…",
  "newModal.displayNameLabel": "Display name",
  "newModal.displayNameHelper":
    "Optional — leave it blank to be known by the profession.",
  "newModal.displayNamePlaceholderDefault": "How this persona is known",
  "newModal.displayNamePlaceholderExample": "e.g. {kind}",
  "newModal.addressLabel": "Profile address",
  "newModal.addressPlaceholder": "e.g. poetry",
  "newModal.toastError": "We couldn't start that one — try again.",

  // Starter templates (Phase 4a) — create-time picker (NewSubprofileModal)
  // and the in-editor "Insert examples" affordance (SubprofileSectionEditor).
  // Section-item copy reads as friendly, editable placeholders — a creator
  // is meant to replace them with their own work, not keep them as-is.
  "template.startFromTemplate": "Start from a template",
  "template.startBlank": "Start from scratch",
  "template.helper":
    "Templates fill your sections with a couple of example items and a suggested tagline — everything's yours to edit or clear.",
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
    "What it does, and how you're involved — maintainer, contributor, or just started.",
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
    "A second example — swap in whatever shows your range.",
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

  // Image upload field (ImageUploadField)
  "imageUpload.defaultPlaceholder": "Image",
  "imageUpload.uploading": "Uploading…",
  "imageUpload.change": "Change",
  "imageUpload.add": "Add image",
  "imageUpload.remove": "Remove image",
  "imageUpload.error": "We couldn't add that image. Please try again.",

  // Persona hero (SubprofileHero)
  "hero.message": "Message",

  // Endorse control (SubprofileEndorse)
  "hero.endorse.cta": "Endorse",
  "hero.endorse.endorsed": "Endorsed",
  "hero.endorse.count_one": "{count} endorsement",
  "hero.endorse.count_other": "{count} endorsements",
  "hero.endorse.addNote": "Add a note",
  "hero.endorse.notePlaceholder": "Say a word about why (optional)",
  "hero.endorse.send": "Send",
  "hero.endorse.error": "We couldn't save that just now — try again.",
  "hero.endorse.endorsedByNames": "Endorsed by {names}",

  // Follow control (SubprofileFollow)
  "hero.follow.cta": "Follow",
  "hero.follow.following": "Following",
  "hero.follow.count_one": "{count} follower",
  "hero.follow.count_other": "{count} followers",
  "hero.follow.error": "We couldn't save that just now — try again.",

  // Share control (SubprofileShare, MySubprofileRow)
  "share.cta": "Share",
  "share.ariaLabel": "Share this persona",
  "share.copied": "Link copied",

  // Share-card modal (SubprofileShareCard) + QR code (SubprofileQR) —
  // entry points in SubprofileHero (public) and MySubprofileRow (owner).
  "shareCard.cta": "QR code",
  "shareCard.title": "Take it with you",
  "shareCard.subtitle":
    "Scan to open {name}'s page on another device, or save the details below.",
  "shareCard.download": "Download contact card",
  "shareCard.qrAria": "QR code linking to {name}'s persona page",
  "shareCard.copyLink": "Copy link",
  "qr.loading": "Generating QR code…",
  "qr.error": "Couldn't generate a QR code — here's the link instead.",

  // Featured item spotlight (SubprofileSpotlight)
  "spotlight.eyebrow": "Spotlight",
  "spotlight.visit": "Visit",

  // Collaborator credits on a public item (ItemCollaborators, in SubprofileSections)
  "collab.with": "with",

  // Public persona page (SubprofilePage + subprofilePage.data.ts)
  "page.loading": "Loading persona…",
  "page.ownerTie": "Part of <em>{name}</em>",
  "page.visit": "Visit",
  "page.notFoundTitle": "This persona isn't here",
  "page.notFoundMetaTitle": "Persona not found — QueerPulse",
  "page.notFoundDescription":
    "It may have been unpublished, kept private, or this link could be out of date. Nothing's wrong on your end.",
  "page.notFoundAction": "Browse personas",
  "page.notFoundBack": "Go back",

  // Affiliations ("Part of") — public section (SubprofileAffiliations) and
  // the owner editor (SubprofileAffiliationsEditor, SubprofileAffiliationRow).
  // `role` is a PRESET, PERSISTED field (AFFILIATION_ROLE_KEYS in
  // affiliations.data.ts) — label-key indirection, same pattern as `kind`.
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
    "Nothing linked yet — add an event or community below.",
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
  "affiliationsEditor.error": "We couldn't save that just now — try again.",
};

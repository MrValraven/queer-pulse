import type { Catalog } from "../../types";

/**
 * `culture` — the Lisbon queer-scene page (club picks, commission board, art
 * showcase, community radio). The club picks / commissions / showcase /
 * radio *listings* themselves are curated editorial content with no
 * server-backed listing (they ship identically in demo/live mode), but every
 * member-submission modal is real: the Commission Board's "Express interest"
 * hits its own mutation (`api/useCreateCommissionInterest.ts`), and the other
 * four forms (suggest a pick, post a project, submit work, submit a
 * playlist) record through the generic intake pipeline
 * (`shared/api/intakes.ts`, kinds `culture_suggest_pick` /
 * `culture_post_project` / `culture_submit_work` /
 * `culture_submit_playlist`) — see `CultureFormModals.tsx`. None of those
 * four kinds has a dedicated admin triage page yet, so their success copy
 * makes no reply-time promise. Per the extraction brief's scope rule, all
 * fictional-user content stays English: book/film/album titles, member
 * quotes/questions/bios, commission project pitches, gallery artist credits,
 * and radio track/curator content are all left untranslated — only the
 * platform-authored chrome (tabs, headings, buttons, form labels, success
 * copy) is translated here.
 */
export const culture: Catalog = {
  // ── Tabs (also reused as modal eyebrows where the text matches exactly) ─
  "tabs.club": "Book · Film · Music Club",
  "tabs.commission": "Commission Board",
  "tabs.showcase": "Art Showcase",
  "tabs.radio": "Radio",

  // ── Page metadata (FE-CNT-12) ──────────────────────────────────────────
  // Without these the tab title, canonical URL and share card all fell back
  // to the site homepage defaults hard-coded in index.html.
  "meta.title": "Culture: QueerPulse Magazine",
  "meta.description":
    "The clubs, commissions, showcases and radio that make up queer cultural life in Lisbon.",

  // ── Page hero + outro ──────────────────────────────────────────────────
  "hero.eyebrow": "Lisbon scene & radio",
  "hero.title": "Lisbon's queer <em>scene</em>.",
  "hero.lead":
    "The clubs, commissions, showcases, and radio that make up the city's queer cultural life: community-curated, ever-changing.",
  "outro.title": "Make something <em>with us.</em>",
  "outro.sub":
    "Culture is what we build between events, quietly, consistently, together.",
  "outro.submitWorkCta": "Submit your work",
  "outro.exploreCommunitiesCta": "Explore communities",

  // ── Club section ───────────────────────────────────────────────────────
  "club.picksHeading": "This month's <em>picks.</em>",
  "club.picksSub":
    "Community-curated. Vote for next month's selection every last Sunday.",
  "club.suggestPickCta": "+ Suggest a pick",
  "club.kind.book": "Book",
  "club.kind.film": "Film",
  "club.kind.music": "Music",
  "club.picks.eventKind.meets": "Meets {date}",
  "club.picks.eventKind.screening": "Screening {date}",
  "club.picks.eventKind.listeningParty": "Listening party {date}",
  "club.picks.discussing_one": "{count} discussing",
  "club.picks.discussing_other": "{count} discussing",
  "club.discussionsHeading": "Recent <em>discussions.</em>",
  "club.replies_one": "{count} reply",
  "club.replies_other": "{count} replies",
  "club.emptyLive.title": "Picks and discussions coming soon",
  "club.emptyLive.description":
    "Once the club gets going, this month's picks and the conversations around them will live here.",

  // ── Commission board ───────────────────────────────────────────────────
  "commissions.heading": "Creative <em>commissions.</em>",
  "commissions.sub":
    "I'm making something. Come help me make it better. More structured than the open board.",
  "commissions.postProjectCta": "+ Post a project",
  "commissions.cat.photo": "Photography",
  "commissions.cat.music": "Music",
  "commissions.cat.writing": "Writing",
  "commissions.cat.design": "Design",
  "commissions.cat.film": "Film",
  "commissions.expressInterestCta": "Express interest",
  "commissions.interestSent": "Interest sent",
  "commissions.emptyLive.title": "Open commissions coming soon",
  "commissions.emptyLive.description":
    "When members start posting projects and looking for collaborators, their calls will show up here.",

  // ── Art showcase ───────────────────────────────────────────────────────
  "showcase.heading": "Member <em>work.</em>",
  "showcase.sub":
    "Rotating exhibition: 8 works shown at a time. Submissions reviewed monthly.",
  "showcase.submitWorkCta": "+ Submit your work",
  "showcase.emptyLive.title": "Featured work coming soon",
  "showcase.emptyLive.description":
    "The rotating showcase of member work is still being set up. Be the first to submit yours.",

  // ── Radio ──────────────────────────────────────────────────────────────
  "radio.heading": "Community <em>radio.</em>",
  "radio.sub":
    "Ambient cultural presence, curated by rotating DJs. No algorithm. No ads.",
  "radio.submitPlaylistCta": "Submit a playlist",
  "radio.emptyLive.title": "Radio schedule coming soon",
  "radio.emptyLive.description":
    "Community radio isn't on air yet. When a curator takes the first slot, you'll hear it here.",
  "radio.curatorLabel": "This week's curator",
  "radio.curatedBy": "curated by {name}",
  "radio.becomeCurator": "Become a curator",
  "radio.nowPlaying": "Now playing",
  "radio.upNext": "Up next",
  "radio.previousTrack": "Previous track",
  "radio.nextTrack": "Next track",
  "radio.play": "Play",
  "radio.playbackNote":
    "Playback isn't live yet. This shows what's currently on air.",

  // ── Shared modal chrome ────────────────────────────────────────────────
  "modal.dialogAriaLabel": "Dialog",
  "modal.done": "Done",
  "common.cancel": "Cancel",
  "common.sending": "Sending…",

  // ── Suggest a pick modal ───────────────────────────────────────────────
  "suggestPick.title": "Suggest a <em>pick</em>",
  "suggestPick.sub":
    "Nominate something for the community to vote on this month.",
  "suggestPick.formatLabel": "Format",
  "suggestPick.titleLabel": "Title",
  "suggestPick.titlePlaceholder": "e.g. Detransition, Baby",
  "suggestPick.authorLabel": "Author / artist / director",
  "suggestPick.authorPlaceholder": "Who made it?",
  "suggestPick.whyLabel": "Why this one?",
  "suggestPick.whyPlaceholder": "A sentence on why the club should pick it…",
  "suggestPick.nominateCta": "Nominate pick",
  "suggestPick.success.title": "Pick",
  "suggestPick.success.em": "nominated.",
  "suggestPick.success.body":
    "We've received your nomination. The community decides what we read, watch and listen to next.",
  "suggestPick.success.step1": "It joins the ballot for the last-Sunday vote.",
  "suggestPick.success.step2":
    "The result is posted here on this page after the vote.",

  // ── Post a project modal ───────────────────────────────────────────────
  "postProject.title": "Post a <em>project</em>",
  "postProject.sub": "Tell the community what you're making and who you need.",
  "postProject.titleLabel": "Project title",
  "postProject.titlePlaceholder": "What are you making?",
  "postProject.descLabel": "Description",
  "postProject.descPlaceholder":
    "What it is, where you're at, and what collaboration looks like…",
  "postProject.lookingForLabel": "Looking for",
  "postProject.postCta": "Post project",
  "postProject.success.title": "Project",
  "postProject.success.em": "posted.",
  "postProject.success.body":
    "We've received your project. The board is still small, so posts aren't matched automatically yet.",
  "postProject.success.step1": "It's saved and visible to our team.",
  "postProject.success.step2":
    "A curator replies as a QueerPulse message if a collaborator wants to move forward.",

  // ── Submit your work modal ─────────────────────────────────────────────
  "submitWork.title": "Submit your <em>work</em>",
  "submitWork.sub": "Up to three pieces. Reviewed monthly by member curators.",
  "submitWork.titleLabel": "Title of the work",
  "submitWork.titlePlaceholder": "e.g. Corpo Estranho, 2024",
  "submitWork.mediumLabel": "Medium",
  "submitWork.mediumPlaceholder": "Choose a medium",
  "submitWork.linkLabel": "Link to the work",
  "submitWork.linkPlaceholder": "Portfolio, image or video URL",
  "submitWork.aboutLabel": "About the piece",
  "submitWork.aboutPlaceholder": "A short statement the curators can read…",
  "submitWork.submitCta": "Submit work",
  "submitWork.success.title": "Work",
  "submitWork.success.em": "submitted.",
  "submitWork.success.body":
    "We've received your work. The showcase rotates eight pieces at a time, chosen by the community.",
  "submitWork.success.step1": "It's saved for the showcase queue.",
  "submitWork.success.step2":
    "A curator replies as a QueerPulse message if it's selected.",

  // ── Submit a playlist modal ─────────────────────────────────────────────
  "submitPlaylist.eyebrow": "Community Radio",
  "submitPlaylist.title": "Submit a <em>playlist</em>",
  "submitPlaylist.sub":
    "Pitch a set for a guest DJ slot. No ads, no algorithm.",
  "submitPlaylist.nameLabel": "Playlist name",
  "submitPlaylist.namePlaceholder": "e.g. A noite que ficou em Lisboa",
  "submitPlaylist.linkLabel": "Link to the set",
  "submitPlaylist.linkPlaceholder": "Spotify, SoundCloud or a tracklist URL",
  "submitPlaylist.vibeLabel": "Vibe",
  "submitPlaylist.noteLabel": "Curator's note",
  "submitPlaylist.notePlaceholder": "When is this for? What's it about?…",
  "submitPlaylist.submitCta": "Submit playlist",
  "submitPlaylist.success.title": "Playlist",
  "submitPlaylist.success.em": "received.",
  "submitPlaylist.success.body":
    "We've received your playlist. We rotate guest DJs so the sound stays human.",
  "submitPlaylist.success.step1": "It's saved here for a curator to consider.",
  "submitPlaylist.success.step2":
    "A curator replies as a QueerPulse message if we can book you a slot.",

  // ── Commission interest modal ───────────────────────────────────────────
  "commissionInterest.errorToast":
    "Couldn't send your interest. Please try again.",
  "commissionInterest.eyebrow": "Express interest",
  "commissionInterest.title": "Reach out to <em>{name}</em>",
  "commissionInterest.sub":
    "Tell them a little about you and why this project speaks to you. They'll only see this if you send.",
  "commissionInterest.messageLabel": "Your message (optional)",
  "commissionInterest.messagePlaceholder":
    "What you'd bring, what you've made before, or just hello…",
  "commissionInterest.sendCta": "Send interest",
  "commissionInterest.success.title": "Interest",
  "commissionInterest.success.em": "sent.",
  "commissionInterest.success.body":
    "We'll connect you with {name} if they'd like to take it further.",
  "commissionInterest.success.step1": "{name} can see your note and profile.",
  "commissionInterest.success.step2":
    "If they want to move forward, the introduction happens as a QueerPulse message.",
  "commissionInterest.success.step3":
    "No pressure either way. Collaborations here are always a yes from both sides.",

  // ── Chip options (looking-for / mediums / vibes) ────────────────────────
  "options.lookingFor.writer": "Writer",
  "options.lookingFor.editor": "Editor",
  "options.lookingFor.photographer": "Photographer",
  "options.lookingFor.illustrator": "Illustrator",
  "options.lookingFor.designer": "Designer",
  "options.lookingFor.musician": "Musician",
  "options.lookingFor.translator": "Translator",
  "options.lookingFor.sensitivityReader": "Sensitivity reader",
  "options.lookingFor.studioSpace": "Studio space",
  "options.medium.photography": "Photography",
  "options.medium.painting": "Painting",
  "options.medium.illustration": "Illustration",
  "options.medium.mixedMedia": "Mixed media",
  "options.medium.ceramics": "Ceramics",
  "options.medium.digital": "Digital",
  "options.medium.performance": "Performance",
  "options.medium.installation": "Installation",
  "options.vibe.lateNight": "Late night",
  "options.vibe.tender": "Tender",
  "options.vibe.joyful": "Joyful",
  "options.vibe.political": "Political",
  "options.vibe.ambient": "Ambient",
  "options.vibe.dancefloor": "Dancefloor",
  "options.vibe.healing": "Healing",
  "options.vibe.nostalgic": "Nostalgic",

  // ── Live-mode not-launched page (CultureComingSoon, CON-14) ──────────────
  // Every tab's listing is demo-only curated content with no publishing
  // pipeline behind it, so live mode resolves /magazine/culture here and the
  // meganav entry is dropped.
  "comingSoon.metaTitle": "Culture: coming soon to QueerPulse",
  "comingSoon.title": "Culture is still being put together",
  "comingSoon.description":
    "The club picks, the commission board, the art showcase and community radio are still being built, and there is nothing published there yet. In the meantime the magazine is running, and our communities are where the scene is being organised.",
  "comingSoon.magazineCta": "Read the magazine",
  "comingSoon.communitiesCta": "Browse communities",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-46 — PRD-46 - the live commission-interest page carved out of the Culture coming-soon gate, plus the panel on CultureComingSoon that offers it. Success copy promises the admin queue and nothing else: QueerPulse sends no email and the backend has no commission_interest notification, so no reply of any kind reaches the member.
  "commissionInterestPage.metaTitle": "Register interest in a commission",
  "commissionInterestPage.metaDescription":
    "Tell the culture team what you would like commissioned while the commission board is being built.",
  "commissionInterestPage.hubLabel": "Culture",
  "commissionInterestPage.eyebrow": "Commission board",
  "commissionInterestPage.title": "Register interest in a <em>commission</em>",
  "commissionInterestPage.intro":
    "The commission board is still being built, so there is nothing to browse yet. What already works is this form: it records what you are looking for and who you would like to work with.",
  "commissionInterestPage.introReach":
    "Your submission goes to the culture team's queue, where an admin or an editorial staff member reads it. Nothing here is published, and nobody outside that team sees it.",
  "commissionInterestPage.titleLabel": "What you would like commissioned",
  "commissionInterestPage.titleHelper":
    "A short description of the piece or project. For example: portraits for a Pride zine cover.",
  "commissionInterestPage.categoryLabel": "Kind of work",
  "commissionInterestPage.categoryHelper":
    "The closest fit. The team reads the rest of your answers alongside it.",
  "commissionInterestPage.recipientLabel": "Who you would like to work with",
  "commissionInterestPage.recipientHelper":
    "Name a maker or a collective. If nobody specific comes to mind, describe the kind of maker you are hoping for.",
  "commissionInterestPage.messageLabel": "Anything else you want to add",
  "commissionInterestPage.messageHelper":
    "Optional. Budget, timing, references, or how you want to work.",
  "commissionInterestPage.submitCta": "Register interest",
  "commissionInterestPage.sending": "Sending",
  "commissionInterestPage.error.title": "That did not go through.",
  "commissionInterestPage.error.body":
    "Your answers are still here. Check your connection and send it again.",
  "commissionInterestPage.error.retryCta": "Try again",
  "commissionInterestPage.success.title": "Interest",
  "commissionInterestPage.success.em": "registered",
  "commissionInterestPage.success.body":
    "Your submission is saved, and it now sits in the queue the culture team reads.",
  "commissionInterestPage.success.step1":
    "The team sees what you wrote, along with your name on QueerPulse.",
  "commissionInterestPage.success.step2":
    "The commission board itself is still being built, so nothing you sent is published anywhere.",
  "commissionInterestPage.success.step3":
    "No reply is sent from here. QueerPulse sends no email and raises no notification for this, so there is nothing waiting in an inbox.",
  "commissionInterestPage.success.backCta": "Back to Culture",
  "commissionInterestPage.success.anotherCta": "Register another interest",
  "comingSoon.commissions.title": "The commission board is being built",
  "comingSoon.commissions.body":
    "Nothing is published on it yet. You can still tell the culture team what you would like commissioned, and it goes straight to the queue they read.",
  "comingSoon.commissions.cta": "Register interest",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-46 — PRD-46 - the live commission-interest page carved out of the Culture coming-soon gate, plus the panel on CultureComingSoon that offers it. Success copy promises the admin queue and nothing else: QueerPulse sends no email and the backend has no commission_interest notification, so no reply of any kind reaches the member.
};

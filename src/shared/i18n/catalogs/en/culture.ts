import type { Catalog } from "../../types";

/**
 * `culture` — the Lisbon queer-scene page (club picks, commission board, art
 * showcase, community radio). No feature-wide backend integration exists
 * except the Commission Board's "Express interest" mutation
 * (`api/useCreateCommissionInterest.ts`); everything else ships identically
 * in demo/live mode. Per the extraction brief's scope rule, all
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

  // ── Page hero + outro ──────────────────────────────────────────────────
  "hero.eyebrow": "Lisbon scene & radio",
  "hero.title": "Lisbon's queer <em>scene</em>.",
  "hero.lead":
    "The clubs, commissions, showcases, and radio that make up the city's queer cultural life — community-curated, ever-changing.",
  "outro.title": "Make something <em>with us.</em>",
  "outro.sub":
    "Culture isn't what happens at events. It's what we build between them — quietly, consistently, together.",
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

  // ── Commission board ───────────────────────────────────────────────────
  "commissions.heading": "Creative <em>commissions.</em>",
  "commissions.sub":
    "I'm making something — come help me make it better. More structured than the open board.",
  "commissions.postProjectCta": "+ Post a project",
  "commissions.cat.photo": "Photography",
  "commissions.cat.music": "Music",
  "commissions.cat.writing": "Writing",
  "commissions.cat.design": "Design",
  "commissions.cat.film": "Film",
  "commissions.expressInterestCta": "Express interest",
  "commissions.interestSent": "Interest sent",

  // ── Art showcase ───────────────────────────────────────────────────────
  "showcase.heading": "Member <em>work.</em>",
  "showcase.sub":
    "Rotating exhibition — 8 works shown at a time. Submissions reviewed monthly.",
  "showcase.submitWorkCta": "+ Submit your work",

  // ── Radio ──────────────────────────────────────────────────────────────
  "radio.heading": "Community <em>radio.</em>",
  "radio.sub":
    "Ambient cultural presence — curated by rotating DJs. No algorithm. No ads.",
  "radio.submitPlaylistCta": "Submit a playlist",
  "radio.curatorLabel": "This week's curator",
  "radio.curatedBy": "curated by {name}",
  "radio.pastPlaylists": "Past playlists",
  "radio.becomeCurator": "Become a curator",
  "radio.nowPlaying": "Now playing",
  "radio.upNext": "Up next",
  "radio.previousTrack": "Previous track",
  "radio.nextTrack": "Next track",
  "radio.play": "Play",
  "radio.pause": "Pause",

  // ── Shared modal chrome ────────────────────────────────────────────────
  "modal.dialogAriaLabel": "Dialog",
  "modal.close": "Close",
  "modal.done": "Done",
  "common.cancel": "Cancel",
  "common.sending": "Sending…",

  // ── Suggest a pick modal ───────────────────────────────────────────────
  "suggestPick.title": "Suggest a <em>pick</em>",
  "suggestPick.sub": "Nominate something for the community to vote on this month.",
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
    "Thank you for nominating something for the club. The community decides what we read, watch and listen to next.",
  "suggestPick.success.step1": "It joins the ballot for the last-Sunday vote.",
  "suggestPick.success.step2":
    "We'll email you the results by <strong>{date}</strong>.",

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
    "Your call for collaborators is in the queue. We keep the board small and intentional, so every post is read by a human first.",
  "postProject.success.step1": "A moderator reviews new posts within 48 hours.",
  "postProject.success.step2":
    "Once live, you'll get interest by email — first replies usually arrive within a week.",

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
    "Thank you for trusting us with your work. The showcase rotates eight pieces at a time, chosen by the community.",
  "submitWork.success.step1":
    "Submissions are reviewed once a month by rotating member curators.",
  "submitWork.success.step2":
    "You'll hear back by <strong>{date}</strong>, selected or not.",

  // ── Submit a playlist modal ─────────────────────────────────────────────
  "submitPlaylist.eyebrow": "Community Radio",
  "submitPlaylist.title": "Submit a <em>playlist</em>",
  "submitPlaylist.sub": "Pitch a set for a guest DJ slot. No ads, no algorithm.",
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
    "Thank you for offering to take a turn on community radio. We rotate guest DJs so the sound stays human.",
  "submitPlaylist.success.step1":
    "A curator listens to every submission — no algorithm, no skips.",
  "submitPlaylist.success.step2":
    "If it's a fit, we'll book you a slot and email you by <strong>{date}</strong>.",

  // ── Commission interest modal ───────────────────────────────────────────
  "commissionInterest.errorToast": "Couldn't send your interest — please try again.",
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
    "If they want to move forward, we'll introduce you by email.",
  "commissionInterest.success.step3":
    "No pressure either way — collaborations here are always a yes from both sides.",

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
};

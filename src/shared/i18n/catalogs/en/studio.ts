import type { Catalog } from "../../types";

/**
 * Studio — the co-op music platform: the logged-in "This week" room, the
 * marketing landing, artist/album/track/set pages, live broadcasts, sheet
 * music store, the creator dashboard (upload, payments, solidarity fund),
 * governance (programme, council, triage, flag review), and the trust/help
 * static pages.
 *
 * Scope: platform chrome only. Mock track/album/set titles, artist names,
 * bios, playlist names, and lyrics are content — in live mode they arrive
 * from the API as the artist's own authored material and are never
 * translated. See `docs/i18n/extraction-brief.md` §1.
 *
 * "Studio" and "Cinema" are brand/product nouns and are never translated
 * (see `docs/i18n/glossary-pt.md`).
 */
export const studio: Catalog = {
  // ── Shell topbar (StudioShell) ────────────────────────────────────────────
  "shell.back": "Back",
  "shell.historyLabel": "Page history",
  "shell.forward": "Forward",
  "shell.searchPlaceholder": "search artists, tracks, sheet music…",
  "shell.sustainCta": "Sustain · {price}/mo",

  // ── Brand lockup (repeated across shell/rail/error/sign-in pages) ────────
  "brand.lockup": "Queer<em>Pulse</em>",
  "brand.studioLabel": "Studio",

  // ── Left rail (StudioRail) ─────────────────────────────────────────────────
  "rail.section.contribute": "Contribute",
  "rail.section.coop": "The co-op",

  "rail.main.home": "Home",
  "rail.main.wednesdaySet": "The Wednesday set",
  "rail.main.browse": "Browse",
  "rail.main.sheetMusic": "Sheet music",
  "rail.main.liveBroadcasts": "Live broadcasts",
  "rail.main.notifications": "Notifications",

  "rail.contribute.submitSet": "Submit a set",
  "rail.contribute.goLive": "Go live",
  "rail.contribute.openCalls": "Open calls",
  "rail.contribute.rightsTakedown": "Rights & takedown",
  "rail.contribute.solidarityFund": "Solidarity fund",

  "rail.governance.programWeek": "Programme the week",
  "rail.governance.curationCouncil": "Curation council",
  "rail.governance.submissionInbox": "Submission inbox",

  "rail.utility.about": "About the co-op",
  "rail.utility.help": "Help & FAQ",
  "rail.utility.accessibility": "Accessibility",
  "rail.utility.trustTerms": "Trust & terms",

  "rail.foot.sustainedSince": "<em>Sustained</em> by you since {date}.",
  "rail.foot.paid_one":
    "You've bought <b>{amount}</b> of music from {count} artist this year.",
  "rail.foot.paid_other":
    "You've bought <b>{amount}</b> of music from {count} artists this year.",

  "railPlaylists.label": "Your library",
  "railPlaylists.autoPlaylist": "Auto playlist",
  "railPlaylists.savedFallback": "Saved playlist",
  "railPlaylists.empty":
    "Create a playlist or like an album and it shows up here",
  "railPlaylists.loadError": "We couldn't load your library",
  "railPlaylists.releaseMeta": "Album · {artist}",
  "railPlaylists.releaseFallback": "Album",
  "railPlaylists.menu.label": "{name} actions",
  "railPlaylists.menu.removeSaved": "Remove from your library",
  "railPlaylists.sortLabel": "Sort",
  "railPlaylists.filterLabel": "Filter your library",
  "railPlaylists.filterPlaceholder": "Filter your library",
  "railPlaylists.noMatches": 'Nothing in your library matches "{query}"',
  "railPlaylists.create.label": "Create",
  "railPlaylists.create.triggerLabel": "Create playlist or folder",
  "railPlaylists.create.menuLabel": "Create a playlist or a folder",

  "playlistFolders.create.menuItem": "Create folder",
  "playlistFolders.defaultName": "New folder",
  "playlistFolders.count_one": "{count} playlist",
  "playlistFolders.count_other": "{count} playlists",
  "playlistFolders.listLabel": "Playlists in {name}",
  "playlistFolders.emptyHint":
    "Pick Move to folder in a playlist's menu, or drag one here",
  "playlistFolders.moveOutDropHint": "Drop here to take it out of its folder",
  "playlistFolders.rename.fieldLabel": "Folder name",
  "playlistFolders.rename.title": "Rename folder",
  "playlistFolders.rename.saveCta": "Save name",
  "playlistFolders.create.title": "Create folder",
  "playlistFolders.create.createCta": "Create folder",
  "playlistFolders.create.withPlaylistSub": "{name} goes in it straight away",
  "playlistFolders.create.createdToast": "Created {name}",
  "playlistFolders.nameLabel": "Name",
  "playlistFolders.nameRequired": "Give your folder a name",
  "playlistFolders.namePlaceholder": "Late nights",
  "playlistFolders.move.title": "Move {name} to a folder",
  "playlistFolders.move.legend": "Folder",
  "playlistFolders.move.noFolder": "No folder",
  "playlistFolders.move.moveCta": "Move playlist",
  "playlistFolders.move.movedToast": "Moved {playlist} to {folder}",
  "playlistFolders.move.movedOutToast": "Took {playlist} out of its folder",
  "playlistFolders.menu.label": "{name} folder actions",
  "playlistFolders.menu.rename": "Rename folder",
  "playlistFolders.menu.delete": "Delete folder",
  "playlistFolders.menu.moveToFolder": "Move to folder",
  "playlistFolders.menu.moveToNewFolder": "Move to new folder",
  "playlistFolders.menu.removeFromFolder": "Remove from {name}",
  "playlistFolders.delete.title": "Delete {name}?",
  "playlistFolders.delete.body":
    "The folder goes for good. Its playlists move back to your list as they are",
  "playlistFolders.delete.confirmCta": "Delete folder",
  "playlistFolders.delete.deletedToast": "Deleted {name}",
  "playlistFolders.errors.notFound":
    "This folder is gone. It may have been deleted on another device",
  "playlistFolders.errors.limit": "You can keep up to 50 folders",
  "playlistFolders.errors.playlistUnavailable":
    "A folder holds playlists you made, edit or saved, and this one is no longer open to you",
  "playlistFolders.library.title": "Your <em>folders</em>",
  "playlistFolders.library.emptyHint":
    "Nothing here yet. Pick Move to folder in a playlist's menu, or drag one onto this folder in the side list",

  // ── Shared corner-pill tag labels (track/release cards across pages) ──────
  "tag.free": "Free",
  "tag.sustainer": "Sustainer",
  "tag.replay": "Replay",

  // ── Mini/full player controls (StudioPlayer + reused elsewhere) ──────────
  "player.prev": "Prev",
  "player.play": "Play",
  "player.next": "Next",
  "player.tipCta": "Tip {amount}",
  "player.buyLine": "<b>100%</b> of a buy goes to {artist}",

  // ── Logged-in "This week" room hero (StudioPageSections → StudioHero) ────
  "room.hero.listening_one": "{count} listening",
  "room.hero.listening_other": "{count} listening",
  "room.hero.addedToast": "Added to your library",
  "room.hero.removedToast": "Removed from your library",
  "room.hero.inLibrary": "In library",
  "room.hero.addLibrary": "Library",
  "room.hero.payNote": "Like it? <em>Buy it</em> from {artist} directly.",
  "room.hero.tipOnTop": "Tip on top? 100% to the artist.",

  // ── "This week" set section ───────────────────────────────────────────────
  "room.set.title": "The Wednesday <em>set</em>",
  "room.set.subtitle":
    "Programmed by {curator} · synchronous · {count} listening",
  "room.set.readPlanCta": "Read the plan",
  "room.set.sideHeading": "Listening with you",
  "room.set.sideSub":
    "{sustainers} sustainers · {casual} casual · {cities} cities",
  "room.set.fee.heading": "Your sustainer fee pays for",
  "room.set.fee.hosting": "Hosting",
  "room.set.fee.curators": "Curator stipends",
  "room.set.fee.fund": "The solidarity fund",
  "room.set.fee.artistShare": "A share for artists",
  "room.set.fee.artistShareStatus": "Planned",

  // ── Error pages (Studio404Page, Studio500Page) ────────────────────────────
  "error404.kind.release.eyebrow": "Release not found",
  "error404.kind.release.title": "This release <em>isn't here.</em>",
  "error404.kind.track.eyebrow": "Track not found",
  "error404.kind.track.title": "This track <em>isn't here.</em>",
  "error404.kind.artist.eyebrow": "Artist page not found",
  "error404.kind.artist.title": "This artist page <em>isn't here.</em>",
  "error404.kind.playlist.eyebrow": "Playlist not found",
  "error404.kind.playlist.title": "This playlist <em>isn't here.</em>",
  "error404.kind.scene.eyebrow": "Scene not found",
  "error404.kind.scene.title": "This scene <em>isn't here.</em>",
  "error404.kind.pressKit.eyebrow": "Press kit not found",
  "error404.kind.pressKit.title": "This press kit <em>isn't here.</em>",
  "error404.kind.page.eyebrow": "Page not found",
  "error404.kind.page.title": "This page <em>isn't here.</em>",
  "error404.body":
    "The link may have a typo, or what it pointed to was taken down or made private. Search or your library will get you back to the music.",
  "error404.backCta": "Go to Studio home",
  "error404.goBackCta": "Go back",
  "error404.tryInsteadTitle": "Try one of these instead",
  "error404.link.search.label": "<em>Search</em> the catalogue",
  "error404.link.search.sub": "Releases, tracks, artists and playlists",
  "error404.link.library.label": "Your <em>library</em>",
  "error404.link.library.sub": "Your playlists, Liked songs and saves",
  "error404.link.home.label": "Studio <em>home</em>",
  "error404.link.home.sub": "New releases and scenes near you",

  "error500.eyebrow": "Page error",
  "error500.title": "This page <em>stopped.</em>",
  "error500.body":
    "A fault in Studio's code stopped this page while it was showing. Try again, and if it stops again, go to Studio home and open it from there.",
  "error500.tryAgainCta": "Try again",
  "error500.backCta": "Go to Studio home",
  "error500.reloadCta": "Reload Studio",

  // ── Studio landing page (landing/StudioLandingPage and its sections) ─────
  // Every claim here is true in live today, except the "plan.*" strip, which
  // is labelled as the plan and carries no figures.
  "landing.metaTitle": "QueerPulse Studio: the queer music scene of Lisbon",
  "landing.description":
    "Hear the queer artists of Lisbon, release your own music for free under a stage name if you like, and find the events where it all plays live. Free for members, opened by our team in waves.",
  "landing.ogImageAlt":
    "Studio home on a laptop, showing this week's releases and scenes",
  "landing.hero.eyebrow": "QueerPulse Studio",
  "landing.hero.title":
    "The queer music scene of Lisbon, <em>in one player</em>.",
  "landing.hero.lede":
    "Hear the artists you'll see on Friday, picked by people who go to the same nights you do.",
  "landing.hero.status": "Free for members. Our team opens access in waves.",
  "landing.hero.seeInside": "See inside",
  "landing.cta.requestInvite": "Request an invite",
  "landing.cta.memberNote":
    "Our team opens Studio to members in waves, artists first. Ask now and you get a notification when it opens for you.",
  "landing.gallery.eyebrow": "How it works",
  "landing.gallery.title": "Studio, <em>screen by screen</em>",
  "landing.gallery.sampleNote":
    "These screens show sample artists and sample members.",
  "landing.gallery.home.tab": "Home",
  "landing.gallery.home.caption":
    "This week's releases, scenes and shelves, picked by hand by our team. Nobody pays for a spot.",
  "landing.gallery.home.alt":
    "Studio home, with format filters, the Staff picks shelf, the start of New this week and the player at the bottom",
  "landing.gallery.home.phoneAlt":
    "Studio home on a phone, opening on the featured release with its cover and a button to play it",
  "landing.gallery.artist.tab": "Artist page",
  "landing.gallery.artist.caption":
    "Every artist gets a page with their releases, their story, a press kit and their next events on QueerPulse.",
  "landing.gallery.artist.alt":
    "An artist page, with the artist's photo, releases, follower count and a button to follow them",
  "landing.gallery.artist.phoneAlt":
    "An artist page on a phone, with the artist's photo, release and follower counts and a button to follow them",
  "landing.gallery.release.tab": "Release",
  "landing.gallery.release.caption":
    "Tracklist, credits and content warnings before a track plays. Records made to run together play without gaps.",
  "landing.gallery.release.alt":
    "A release page, with the cover, a note on what changed in the new version, the tracklist and a link to buy the album from the artist",
  "landing.gallery.release.phoneAlt":
    "A release page on a phone, with the cover and a note on what changed in the new version",
  "landing.gallery.playlists.tab": "Playlists together",
  "landing.gallery.playlists.caption":
    "Build playlists with your connections and see who added each track.",
  "landing.gallery.playlists.alt":
    "A shared playlist, with its editors and who added each track",
  "landing.gallery.playlists.phoneAlt":
    "A shared playlist on a phone, marked collaborative, with who added each of its three tracks",
  "landing.gallery.player.tab": "Player",
  "landing.gallery.player.caption":
    "The player stays with you around QueerPulse, with a queue and crossfade.",
  "landing.gallery.player.alt":
    "The Now playing screen on a phone, with the cover and a track paused part way through",
  "landing.gallery.share.tab": "Share",
  "landing.gallery.share.caption":
    "Drop a track into a chat and it arrives as a card, with your note underneath.",
  "landing.gallery.share.alt":
    "A chat on a phone, with a shared Studio track shown as a card",
  "landing.compare.eyebrow": "Side by side",
  "landing.compare.title":
    "Keep Spotify for everything else. <em>Studio is for the music made around you</em>.",
  "landing.compare.topicHeading": "Topic",
  "landing.compare.studioHeading": "QueerPulse Studio",
  "landing.compare.studioShort": "Studio",
  "landing.compare.featured.topic": "What gets featured",
  "landing.compare.featured.studio":
    "Picked by hand by our team. Nobody pays for a spot",
  "landing.compare.ads.topic": "Ads",
  "landing.compare.ads.studio": "No ads, for every member",
  "landing.compare.listening.topic": "Your listening",
  "landing.compare.listening.studio":
    "A private history with Pause and Clear, and no profile built from it",
  "landing.compare.scene.topic": "The scene",
  "landing.compare.scene.studio":
    "Community events linked from the artist's page",
  "landing.compare.owner.topic": "Who runs it",
  "landing.compare.owner.studio": "Built in Lisbon, by and for the community",
  "landing.plan.eyebrow": "The plan",
  "landing.plan.chip": "Coming later",
  "landing.plan.title": "Where we want Studio <em>to go</em>",
  "landing.plan.intro":
    "Nothing here is live yet. It's the direction we're building towards, and this page will say so when it changes.",
  "landing.plan.coop.title": "A co-op",
  "landing.plan.coop.body":
    "Run by artists and listeners together, deciding what gets played and where the money goes.",
  "landing.plan.money.title": "Most of the money to artists",
  "landing.plan.money.body":
    "When money comes in, most of it goes to the people who made the music, with open books on where the rest goes.",
  "landing.plan.masters.title": "Your music stays yours",
  "landing.plan.masters.body":
    "Artists keep their masters and can release anywhere else too.",
  "landing.why.eyebrow": "Why it matters",
  "landing.why.quote":
    "A scene sounds like itself when <em>we press record</em>.",
  "landing.why.p1":
    "Queer music made by queer people carries what an outside ear misses: the club nights, the choirs, the bedroom demos, the songs that got a lot of us through. For many of us it was the first place we heard ourselves.",
  "landing.why.p2":
    "Most small artists play a handful of gigs, upload to a platform built for someone else and get lost in the algorithm. Very little of what they make comes back to them.",
  "landing.why.p3":
    "Listening to local artists, sharing their tracks and turning up to their shows is how they get to make the next record. That's what this Studio is for.",
  "landing.closing.title": "Hear the scene <em>you're part of</em>",
  "landing.closing.body":
    "Studio is part of QueerPulse, the community network. Join with an invite, and our team opens Studio to members in waves.",
  "landing.closing.magazineLink": "Read the magazine",
  // Studio landing v2 (2026-10-28)
  "landing.hero.audienceLabel": "What brings you to Studio",
  "landing.hero.audience.listener": "I listen",
  "landing.hero.audience.artist": "I make music",
  "landing.hero.artistTitle":
    "Release your music <em>where your community already is</em>.",
  "landing.hero.artistLede":
    "Upload for free, release under a stage name no other member can tie to you, and reach the people who already come to your shows.",
  "landing.hero.hearItFirst": "Hear it first",
  "landing.photoCredit": "Photo: {credit}",
  "landing.demoSampleNote":
    "Demo: the artists, tracks, quotes and photos here are samples",
  "landing.cta.applyAsArtist": "Apply as an artist",
  "landing.cta.requestAccess": "Request Studio access",
  "landing.cta.makesMusic": "I make music and want to release it on Studio",
  "landing.cta.checking": "Checking your Studio access",
  "landing.cta.onList.title": "You're on the list",
  "landing.cta.onList.body":
    "You get a notification when Studio opens for you.",
  "landing.cta.onList.artistBody":
    "You asked as an artist, so our team looks at your request first. You get a notification when Studio opens for you.",
  "landing.cta.cancelRequest": "Cancel request",
  "landing.cta.requestSent": "Request sent. You're on the list",
  "landing.cta.requestCancelled": "Request cancelled",
  "landing.cta.requestFailed": "We couldn't send your request",
  "landing.cta.cancelFailed": "We couldn't cancel your request",
  "landing.proof.label": "Studio in numbers",
  "landing.proof.artists_one": "{count} artist",
  "landing.proof.artists_other": "{count} artists",
  "landing.proof.releases_one": "{count} release",
  "landing.proof.releases_other": "{count} releases",
  "landing.proof.events_one": "{count} event with Studio artists this month",
  "landing.proof.events_other": "{count} events with Studio artists this month",
  "landing.nextEvent.eyebrow": "Next on stage",
  "landing.nextEvent.with": "With {artist}",
  "landing.nextEvent.online": "Online",
  "landing.nextEvent.visitorCta": "Request an invite to see this event",
  "landing.nextEvent.memberCta": "Open the event",
  "landing.listen.eyebrow": "Hear it first",
  "landing.listen.title": "Tracks from <em>Studio artists</em>",
  "landing.listen.note":
    "The artists shared these tracks for this page. What you play here stays anonymous and leaves no record.",
  "landing.listen.listLabel": "Tracks to play",
  "landing.listen.play": "Play {track} by {artist}",
  "landing.listen.pause": "Pause {track} by {artist}",
  "landing.listen.progress": "{elapsed} of {total}",
  "landing.listen.playing": "Playing {track} by {artist}",
  "landing.listen.paused": "{track} is paused",
  "landing.listen.retry": "Try {track} again",
  "landing.listen.reason.unavailable": "This track was taken off this page",
  "landing.listen.reason.offline": "You're offline, so this track can't load",
  "landing.listen.reason.rateLimited":
    "Too many plays in a short time. Try again in a minute",
  "landing.listen.reason.server":
    "Studio didn't answer, so this track can't load",
  "landing.listen.reason.playback": "Your browser couldn't play this track",
  "landing.artists.eyebrow": "Meet the artists",
  "landing.artists.title": "Some of the people <em>on Studio</em>",
  "landing.artists.listLabel": "Studio artists",
  "landing.forArtists.eyebrow": "For artists",
  "landing.forArtists.title": "Release <em>on Studio</em>",
  "landing.forArtists.intro":
    "Everything here works today for every artist our team brings in.",
  "landing.forArtists.upload.title": "Upload directly, for free",
  "landing.forArtists.upload.body":
    "WAV and AIFF included, straight from your computer, with no distributor in between.",
  "landing.forArtists.persona.title": "Release under a stage name",
  "landing.forArtists.persona.body":
    "Your persona lives inside your account, and no other member can see the two are linked.",
  "landing.forArtists.numbers.title": "See who listens",
  "landing.forArtists.numbers.body":
    "Play totals and trends, and the listeners who choose to show their name as supporters.",
  "landing.forArtists.tools.title": "Tools for every release",
  "landing.forArtists.tools.body":
    "Scheduled releases, version notes, private preview links, a press kit and albums that play without gaps.",
  "landing.forArtists.events.title": "Your events on your page",
  "landing.forArtists.events.body":
    "Your page links to your events on QueerPulse, so a listener can find your next show.",
  "landing.forArtists.spotify.label": "Worth knowing",
  "landing.forArtists.spotify.fact":
    "Since 2024, a track on Spotify earns no recorded royalties until it reaches 1,000 streams in the previous 12 months.",
  "landing.forArtists.spotify.source":
    "Source: Spotify's announcement, November 2023",
  "landing.forArtists.spotify.opensNewTab": "(opens in a new tab)",
  "landing.forArtists.spotify.studio":
    "On Studio a new track has its own page and its listeners from day one. Studio itself holds and moves no money, and the plan below says where we want to take it.",
  "landing.forArtists.founding.title": "Be a founding artist",
  "landing.forArtists.founding.body":
    "The first artists in are featured at launch on a shelf in Studio and keep a Founding artist badge on their page.",
  "landing.forArtists.founding.memberBody":
    "Ask as an artist and our team looks at your request first.",
  "landing.forArtists.founding.priority":
    "Apply as an artist and our team looks at your request first.",
  "landing.forArtists.shot.alt":
    "An artist's numbers in Studio, with plays per day and the listeners who show their name as supporters",
  "landing.forArtists.shot.phoneAlt":
    "An artist's numbers in Studio on a phone",
  "landing.compare.streamingHeading": "Streaming apps (Spotify, Apple Music)",
  "landing.compare.platformsHeading": "Artist platforms (Bandcamp, SoundCloud)",
  "landing.compare.streamingShort": "Streaming apps",
  "landing.compare.platformsShort": "Artist platforms",
  "landing.compare.featured.streaming":
    "Algorithms, and labels can pay for extra promotion",
  "landing.compare.featured.platforms": "Global charts and editors' picks",
  "landing.compare.releasing.topic": "Releasing your music",
  "landing.compare.releasing.streaming": "Through a distributor, often paid",
  "landing.compare.releasing.platforms": "Upload directly",
  "landing.compare.releasing.studio": "Upload directly, for free",
  "landing.compare.stageName.topic": "Your stage name",
  "landing.compare.stageName.streaming":
    "A public artist profile you manage from your own login",
  "landing.compare.stageName.platforms":
    "A public profile page you manage from your own login",
  "landing.compare.stageName.studio":
    "A persona inside your account, and no other member can see the link",
  "landing.compare.ads.streaming": "On the free plan",
  "landing.compare.ads.platforms": "On SoundCloud's free plan",
  "landing.compare.listening.streaming":
    "Builds a profile for recommendations and ads",
  "landing.compare.listening.platforms":
    "Recommendations from what you follow and buy",
  "landing.compare.fans.topic": "Who your fans are",
  "landing.compare.fans.streaming": "Anonymous numbers",
  "landing.compare.fans.platforms": "Buyers and followers",
  "landing.compare.fans.studio": "Supporters who choose to show their name",
  "landing.compare.safety.topic": "Safety",
  "landing.compare.safety.streaming": "An explicit tag",
  "landing.compare.safety.platforms": "An explicit tag at most",
  "landing.compare.safety.studio":
    "Content warnings before a track plays, reporting, and moderation by our team",
  "landing.compare.scene.streaming": "Concert listings from ticketing partners",
  "landing.compare.scene.platforms": "Your shows are listed somewhere else",
  "landing.compare.owner.streaming": "Large listed companies",
  "landing.compare.owner.platforms": "Large companies and investors",
  "landing.faq.eyebrow": "Questions",
  "landing.faq.title": "What people <em>ask us</em>",
  "landing.faq.free.question": "Is Studio free?",
  "landing.faq.free.answer":
    "Yes. Studio is free for every member, with no ads. Music you buy from an artist is paid for, and the money goes to that artist.",
  "landing.faq.later.question": "Will it cost money later?",
  "landing.faq.later.answer":
    "We want Studio to become a co-op run by artists and listeners. Joining and using Studio is free, and music you buy from an artist is paid for, with the money going to that artist. Anything else that ever costs money will be said on this page first.",
  "landing.faq.spotify.question": "Can I keep using Spotify?",
  "landing.faq.spotify.answer":
    "Of course. Keep it for everything else, and come to Studio for the music made around you.",
  "landing.faq.ownership.question": "Who owns my music?",
  "landing.faq.ownership.answer":
    "You do. You keep your masters and your rights, and you can take a release down whenever you like.",
  "landing.faq.elsewhere.question": "Can I release my music elsewhere too?",
  "landing.faq.elsewhere.answer":
    "Yes. Studio asks for no exclusivity, so your music can be on any other platform at the same time.",
  "landing.faq.stageName.question": "Can I use a stage name?",
  "landing.faq.stageName.answer":
    "Yes. Make a persona in your account and release under it. No other member can see that the persona is linked to you.",
  "landing.faq.listening.question": "What do you keep about my listening?",
  "landing.faq.listening.answer":
    "A private history only you can see, so Studio can show your top artists and tracks. Pause it or clear it whenever you like. Plays still count toward artists' totals without your name.",
  "landing.faq.cut.question": "Do you take a cut?",
  "landing.faq.cut.answer":
    "No. Studio itself holds and moves no money, so there is nothing to take a cut of.",
  "landing.faq.upload.question": "What can I upload?",
  "landing.faq.upload.answer":
    "Music, DJ mixes, podcasts, spoken word and recorded performance, as MP3, M4A, WAV or AIFF files.",
  "landing.faq.getIn.question": "How do I get in?",
  "landing.faq.getIn.answer":
    "Ask for an invite to QueerPulse. Once you're a member, our team opens Studio in waves, artists first, and you get a notification when it opens for you.",
  "landing.next.eyebrow": "What happens next",
  "landing.next.title": "Three steps <em>to Studio</em>",
  "landing.next.invite.title": "Request an invite",
  "landing.next.invite.body":
    "Tell us a little about yourself. It takes a few minutes.",
  "landing.next.review.title": "Our team reads it",
  "landing.next.review.body":
    "Someone from our team reads every request. Being new to our community is fine.",
  "landing.next.list.title": "You're on the Studio list",
  "landing.next.list.body":
    "Once you've joined, you're on the Studio list automatically, artists first, and you get a notification when Studio opens for you.",
  "landing.team.eyebrow": "Who runs it",
  "landing.team.title": "The people who <em>look after QueerPulse</em>",
  "landing.team.body":
    "Members of our community sit on the advisory council and help decide where QueerPulse goes, Studio included.",
  "landing.team.listLabel": "Advisory council",
  "landing.team.link": "Read how QueerPulse is run",

  // ── Sign in / Join (StudioSignInPage) ─────────────────────────────────────
  "signin.tabs.signIn": "Sign in",
  "signin.tabs.join": "Join",
  "signin.aside.onAirNow": "On the air now · {count} listening",
  "signin.aside.title":
    "A streaming co-op that <em>pays</em> the people who made the song.",
  "signin.aside.body":
    "Buy a release and you pay the artist directly. Tips pass through at <em>{tipPercent}</em>. Your sustainer fee pays for hosting, curation and the solidarity fund.",
  "signin.aside.noCut": "QueerPulse takes <em>nothing</em> from a buy.",

  "signin.in.title": "Welcome <em>back.</em>",
  "signin.in.lede":
    "Studio is a tab on your QueerPulse account. Sign in with the member account you already have.",
  "signin.emailLabel": "Email",
  "signin.emailPlaceholder": "you@example.com",
  "signin.in.submitCta": "Sign in",
  "signin.orDivider": "or",
  "signin.googleContinue": "Continue with Google",
  "signin.googleLoading": "Signing in…",
  "signin.in.newHere": "New here?",
  "signin.in.joinCta": "Join Studio",
  "signin.in.freePrompt": "Just want to listen?",
  "signin.in.freeCta": "Stream one set free, no account",
  "signin.in.signedInToast": "Signed in, welcome back",
  "signin.in.signedInGoogleToast": "Signed in with Google, welcome back",

  "signin.join.title": "Join <em>Studio.</em>",
  "signin.join.lede":
    "Pick how much of the co-op you want. You can change tiers or cancel any month: no lock-in, no winback emails.",
  "signin.join.chooseTier": "Choose your tier",
  "signin.join.tier.studio.title": "Studio <em>only</em>",
  "signin.join.tier.studio.body":
    "Everything in Studio: the council's weekly set, live rooms, the full catalogue, lossless audio, direct artist subscriptions.",
  "signin.join.tier.studio.incl":
    "Your fee pays for hosting, curation and the solidarity fund",
  "signin.join.tier.coop.badge": "Best value",
  "signin.join.tier.coop.title": "The whole <em>co-op</em>",
  "signin.join.tier.coop.body":
    "Studio <em>plus</em> Cinema, the Magazine, Events, reading groups, and a vote at the annual assembly. One membership, the entire QueerPulse.",
  "signin.join.tier.coop.incl": "One member account across every surface",
  "signin.join.submitCta": "Continue to payment",
  "signin.join.alreadyMember": "Already a member?",
  "signin.join.notReady": "Not ready?",
  "signin.join.freeCta": "Listen to one free set first",
  "signin.perMonth": "/mo",

  "firstRun.progress": "Step {current} of {total}",
  "firstRun.about.name": "What Studio is",
  "firstRun.taste.name": "Genres and moods you love",
  "firstRun.follow.name": "Artists to follow",
  "firstRun.about.title": "Welcome to <em>Studio</em>",
  "firstRun.about.dek":
    "Music, spoken word, DJ sets and podcasts from queer artists in our community. Three short steps and you're listening.",
  "firstRun.about.listen.title": "Listen",
  "firstRun.about.listen.body":
    "Albums, EPs, sets and episodes, ready whenever you are.",
  "firstRun.about.save.title": "Like",
  "firstRun.about.save.body":
    "Like a track and it goes into Liked songs. Like an album, a show or a playlist and it waits for you in your library.",
  "firstRun.about.follow.title": "Follow",
  "firstRun.about.follow.body":
    "Follow artists from local scenes. Your library keeps everyone you follow.",
  "firstRun.about.note":
    "Skip any step you like. You can open this again from Studio Help.",
  "firstRun.taste.title": "What do you love to <em>hear</em>?",
  "firstRun.taste.dek":
    "Pick as many as you like. They move to the front of your Studio home and stay saved to your account.",
  "firstRun.taste.noneYet": "Nothing picked yet. That's fine too.",
  "firstRun.taste.pickedCount_one": "{count} picked, saved to your account",
  "firstRun.taste.pickedCount_other": "{count} picked, saved to your account",
  "firstRun.follow.title": "Find your <em>scene</em>",
  "firstRun.follow.dek":
    "Follow a few artists from the scenes on Studio. The ones closest to your picks come first.",
  "firstRun.follow.followLabel": "Follow {artist}",
  "firstRun.follow.loadingLabel": "Loading artists to follow",
  "firstRun.follow.empty":
    "Artists show up here as they share releases. You can follow anyone from their page.",
  "firstRun.skipCta": "Skip",
  "firstRun.backCta": "Back",
  "firstRun.nextCta": "Next",
  "firstRun.finishCta": "Start listening",
  "firstRun.savedToast": "Your picks are saved to your account",
  "firstRun.saveError":
    "We couldn't save your welcome picks to your account. Open Help and choose Show the welcome again to retry",
  "firstRun.help.heading": "Pick your <em>sound</em> again",
  "firstRun.help.body":
    "The three-step welcome: what Studio is, the genres and moods you love, and artists to follow.",
  "firstRun.help.cta": "Show the welcome again",

  // ── About the co-op (StudioAboutPage + StudioAboutSections) ──────────────

  "about.sec.rate.num": "02: how artists get paid",
  "about.sec.rate.heading":
    "Fans buy the music and <em>pay the artist</em> directly.",
  "about.sec.rate.p1":
    "Artists put a price on albums, EPs, singles and their tracks, either a fixed price or name-your-price. You pay the artist <strong>straight from your own account</strong>, with their payment link, MB WAY or IBAN, and tap I've paid. Once the artist confirms, the download opens and your name joins the release's <em>Supported by</em> wall.",
  "about.sec.rate.footnote":
    "QueerPulse takes nothing from a buy and never holds the money. Your sustainer fee pays for hosting, curator stipends and the solidarity fund, and a share of it for artists is planned.",

  "about.rate.cell.floor.value": "€<em>0</em>",
  "about.rate.cell.floor.label": "taken by QueerPulse from any buy",
  "about.rate.cell.share.value": "<em>100</em>%",
  "about.rate.cell.share.label": "of every buy goes straight to the artist",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label": "of every tip, no platform cut, ever",

  "about.sec.ceiling.num": "03: what an artist can actually earn",
  "about.sec.ceiling.heading": "Honest about the <em>ceiling</em>.",
  "about.sec.ceiling.p1":
    "Most \"creator economy\" pages show you the top 0.1% and let you assume you're them. Here's what buys and tips actually add up to at four real levels of support, and where it stops.",

  "about.tier.casual.label": "Casual",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "About <em>fifteen fans</em> a month buying a €5 single. Coffee money, paid to you directly.",
  "about.tier.building.label": "Building",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "Around thirty album buys a month, some singles, two tips. A working sideline, <em>rent-adjacent</em> in Lisbon.",
  "about.tier.sustaining.label": "Sustaining",
  "about.tier.sustaining.value": "1,820",
  "about.tier.sustaining.body":
    "A crowd that buys every release, a regular tipping pool, one live listening room a month. Below the median Portuguese wage, and <em>every euro of it</em> paid straight to you by fans.",
  "about.tier.touring.label": "Touring artist",
  "about.tier.touring.body":
    "Studio will <em>not</em> replace a touring income, and we won't pretend it can. It can, plausibly, replace the rent while you make the next thing.",
  "about.tierFoot":
    "These add up real Studio prices and honest numbers of buyers, with nothing borrowed from a pitch deck. <em>Every euro here goes from fan to artist, and QueerPulse never holds it.</em>",

  "about.sec.governance.num": "04: who decides",
  "about.sec.governance.heading":
    "An elected <em>council</em>, term-limited, on the record.",
  "about.sec.governance.p1":
    "Six curators program the weekly set, run submission triage, and write a paragraph justifying every pick. They're elected by the whole co-op at the annual assembly, paid a flat €400/mo stipend that appears on the public ledger, and limited to two-year terms with mandatory rotation. <strong>A person decides who gets heard,</strong> and signs their name to it.",
  "about.sec.governance.p2":
    "The sustainer fee, and how it's shared between hosting, curator stipends and the solidarity fund, is set yearly by a joint vote of sustainers and artists, with a quorum of one member in five. If you think the fee is wrong, <em>you vote, or you stand.</em>",

  "about.sec.hardQuestions.num": "05: the hard questions",
  "about.sec.hardQuestions.heading":
    "The ones you're <em>actually</em> asking.",

  "about.skeptic.broke.q":
    "This sounds lovely and doomed. How does it not go broke?",
  "about.skeptic.broke.a":
    "Honestly, at low scale, hosting is the expensive part, and a breakout track can cost more in bandwidth than sustainer fees bring in. Our mitigation is boring and public: casual listeners default to AAC, we cache aggressively, and the subscription ledger is reconciled <em>daily</em> so we see red before it's a crisis.",
  "about.skeptic.clique.q": "Curated by six people sounds like a clique.",
  "about.skeptic.clique.a":
    "It can become one. That's the real risk. The guardrails are two-year term limits, forced rotation, and the fact that every pick is published with a name and a reason. <em>A clique that has to explain itself in writing every week is a weaker clique.</em>",
  "about.skeptic.clone.q": "Is this just a Spotify clone with nicer copy?",
  "about.skeptic.clone.a":
    "If the home page were rows of square cover art, yes. The product is editorial on purpose: a programmed weekly set, live listening rooms, a wall of supporters on every release. <em>If we ever look like a smaller Spotify, hold us to this paragraph.</em>",
  "about.skeptic.leave.q": "What happens to my music if I leave?",
  "about.skeptic.leave.a":
    "You keep your masters and every euro fans paid you, because it went straight to you. Takedown is a one-page, 14-day process with no retention loop. Leaving is as easy as arriving. We think that's the only honest way to ask you to stay.",

  "about.cta.join": "Join Studio",
  "about.cta.ledger": "Read how QueerPulse is run",

  // ── Accessibility (StudioAccessibilityPage) ───────────────────────────────
  "accessibility.statement.p1":
    "QueerPulse Studio commits to meeting <em>WCAG 2.2 AA</em> across every surface, and to treating accessibility as a core product requirement, built in from the start. Deaf and hard-of-hearing people should be able to use a music platform. So should blind and low-vision people and people who navigate by keyboard.",
  "accessibility.statement.p2":
    "If something here does not work for you, that is a bug, and we want the report.",

  "accessibility.group.deaf.heading":
    "For Deaf & <em>hard-of-hearing</em> listeners",
  "accessibility.group.deaf.dek":
    "A music platform can't pretend everyone hears it the same way. So Studio shows the words and the waveform.",
  "accessibility.item.lyrics.heading": "Time-synced <em>lyrics</em>",
  "accessibility.item.lyrics.body":
    "Where the artist supplied them, lyrics scroll in time with playback, with the current line highlighted. Readable as a static sheet too, for any track.",
  "accessibility.item.waveforms.heading": "Visual <em>waveforms</em>",
  "accessibility.item.waveforms.body":
    "Tracks show a waveform tied to the audio, so rhythm and dynamics are visible as well as audible.",

  "accessibility.group.language.heading":
    "For listeners in <em>any language</em>",
  "accessibility.group.language.dek":
    "The catalogue is mostly in Portuguese, with songs in a dozen other languages. Words shouldn't be a wall.",
  "accessibility.item.interfaceLang.heading":
    "Interface in <em>your language</em>",
  "accessibility.item.interfaceLang.body":
    "Studio's interface ships in Portuguese and English. Set it in Settings.",

  "accessibility.group.lowVision.heading":
    "For low-vision & <em>keyboard</em> navigation",
  "accessibility.group.lowVision.dek":
    "The whole player is operable without a mouse, and both the light and dark themes are built to clear contrast as well as mood.",
  "accessibility.item.reducedMotion.heading":
    "Respects <em>reduced motion</em>",
  "accessibility.item.reducedMotion.body":
    "Every decorative animation (the pulse dot, the waveforms, the equaliser bars) stills itself when your system asks for reduced motion. Nothing essential moves.",

  "accessibility.status.inProgress": "In progress",

  "accessibility.shortcuts.title": "Player <em>keyboard</em> shortcuts",
  "accessibility.shortcuts.dek":
    "They work on any Studio page while something is queued, unless you're typing in a field",

  "accessibility.contact.meta": "Target: WCAG 2.2 AA",

  // ── Help & FAQ (StudioHelpPage + StudioHelpFaq) ───────────────────────────

  "help.faq.moneyGo.q": "Where does my money actually go?",
  "help.faq.moneyGo.a":
    "When you buy a release, <strong>you pay the artist directly</strong> and QueerPulse takes nothing. <em>Every cent of every tip</em> goes to the artist with no platform cut. Your sustainer fee pays for hosting, curator stipends and the solidarity fund, and a share of it for artists is planned. Read <a>how QueerPulse is run</a>.",
  "help.faq.tipNoAccount.q": "Can I tip without an account?",
  "help.faq.tipNoAccount.a":
    "You can <em>listen</em> to one demo set free, but tipping needs an account so the money can route to the artist and mint you a receipt. Sign-up takes under a minute and the first month is on us.",
  "help.faq.tipNotesPrivate.q": "Are my tip notes private?",
  "help.faq.tipNotesPrivate.a":
    "<strong>Yes, by default.</strong> A note you write with a tip is seen only by you and the artist. You can choose to make notes semi-public or public in <a>Settings</a>, and flip any single note later.",

  "help.faq.priceDiff.q": "What's the difference between €7 and €11?",
  "help.faq.priceDiff.a":
    "<strong>€7/mo</strong> is Studio only. <strong>€11/mo</strong> is the whole QueerPulse co-op: Studio plus Cinema, the Magazine, Events, reading groups, and a vote at the annual assembly. One membership, every surface. Change tiers any month.",
  "help.faq.cancel.q": "How do I cancel?",
  "help.faq.cancel.a":
    'One click in <a>Settings, then Erase & exit</a>. No retention call, no "are you sure" loop, no winback emails. We think leaving should be as easy as arriving. That\'s the only honest way to ask you to stay.',

  "help.faq.getPaid.q": "When and how do I get paid?",
  "help.faq.getPaid.a":
    "Fans pay you directly, through the payment links, MB WAY number or IBAN you add in Studio settings. They tap I've paid, you check your account and confirm, and their download opens. QueerPulse <em>never holds</em> the money. Review what buyers say they paid in <a>Payments</a>.",
  "help.faq.realisticEarn.q": "What can I realistically earn?",
  "help.faq.realisticEarn.a":
    "We're honest about the ceiling: roughly €74/mo casual, €340/mo building, €1,820/mo sustaining. Studio won't replace a touring income, but it can replace the rent. The full breakdown is on <a>About Studio</a>.",

  "help.statusOperational": "All systems operational ·",

  // ── Artist press kit (StudioPressPage + StudioPressBar) ───────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "press.copiedToast": "Copied",
  "press.copyFailToast": "Could not copy",
  "press.downloadingPhotosToast": "Downloading press photos · hi-res",
  "press.downloadingPhotoToast": "Downloading photo · hi-res",
  "press.accessRequestedToast": "Press access requested. We'll verify you once",
  "press.fact.from": "From",
  "press.fact.pronouns": "Pronouns",
  "press.fact.since": "Since",
  "press.fact.followers": "Followers",
  "press.fact.forFansOf": "For fans of",
  "press.section.preview": "Streamable <em>preview</em>",
  "press.fullPromoRequestedToast": "Full promo requested",
  "press.requestFullPromoCta": "Request full promo",
  "press.playAria": "Play preview",
  "press.pauseAria": "Pause preview",
  "press.watermarkedBadge": "Watermarked",
  "press.previewNote":
    "This preview carries an <em>inaudible watermark</em> and a spoken QueerPulse tag at the tail. For a clean broadcast master, request the full promo. We verify press once, then you're cleared for everything.",
  "press.section.bio": "<em>Bio</em>",
  "press.section.photos": "Press <em>photos</em>",
  "press.downloadAllCta": "Download all · hi-res",
  "press.downloadOneHint": "Download hi-res",
  "press.section.press": "Selected <em>press</em>",
  "press.section.boilerplate": "Facts & <em>boilerplate</em>",
  "press.copyCta": "Copy",
  "press.boilerplate.fullName": "Full name",
  "press.boilerplate.genre": "Genre",
  "press.boilerplate.label": "Label",
  "press.boilerplate.booking": "Booking",
  "press.boilerplate.pronounce": "Pronounce",
  "press.requestAccessCta": "Request press access",
  "press.bar.crumb": "Press kit · <em>{name}</em>",
  "press.bar.copyLinkCta": "Copy press link",
  "press.bar.downloadAssetsCta": "Download assets",
  "press.bar.copyLinkFailToast": "Could not copy link",
  "press.bar.preparingToast": "Preparing your press assets",

  // ── Trust & terms (StudioTermsPage) ───────────────────────────────────────

  "terms.sec.deed.num": "01: the co-op deed",
  "terms.sec.deed.heading": "What it means that you <em>own</em> this.",
  "terms.sec.deed.p1":
    "QueerPulse Studio is a registered co-operative. Members, listeners and artists alike, own it. That makes it a legal structure, with a deed you can read, that binds the people running it.",
  "terms.sec.deed.p2":
    "The deed fixes one promise the people in charge <strong>cannot quietly change</strong>: artists are paid directly and QueerPulse never takes a cut. Changing that promise needs a two-thirds supermajority of the whole membership. The council is <em>elected, term-limited, and paid on the ledger</em>. There are no founder shares and no investor veto.",
  "terms.sec.deed.pull":
    "If we ever start acting like a company that happens to have nice values, the deed is what you hold us to.",
  "terms.sec.deed.footnote":
    "The full deed and the co-op's annual accounts are published every year alongside the <a>transparency report</a>.",

  "terms.sec.licences.num": "02: licences",
  "terms.sec.licences.heading": "What you can <em>do</em> with the music.",
  "terms.sec.licences.p1":
    "Every release names its licence, picked by the artist. Here's what each one means for you as a listener, and for anyone who wants to reuse the work in a set, a film, or a remix.",
  "terms.sec.licences.footnote":
    "DJ sets are special: a set can include tracks under different licences, and our matcher credits each track to its own artist. <em>Covers are allowed</em>; mechanical royalties are handled through a Portuguese collecting partner, and we don't pay synchronisation, so clearing a cover for film use is on you.",

  "terms.licence.arr.title": "All rights <em>reserved</em>",
  "terms.licence.arr.row1": "Stream & save it",
  "terms.licence.arr.row2": "Buy a copy to keep",
  "terms.licence.arr.row3": "No reuse without asking",
  "terms.licence.ccByNc.title": "Credit, <em>non-commercial</em>",
  "terms.licence.ccByNc.row1": "Reuse in <em>non-paid</em> work",
  "terms.licence.ccByNc.row2": "Remix, with credit",
  "terms.licence.ccByNc.row3": "Not for commercial use",
  "terms.licence.ccBySa.title": "Credit, <em>share-alike</em>",
  "terms.licence.ccBySa.row1": "Reuse anywhere, with credit",
  "terms.licence.ccBySa.row2": "Commercial use allowed",
  "terms.licence.ccBySa.row3": "Share remixes <em>same licence</em>",

  "terms.sec.privacy.num": "03: privacy, briefly",
  "terms.sec.privacy.heading": "What we <em>hold</em>, and what we don't.",
  "terms.sec.privacy.p1":
    "We hold your account, your saves, your receipts, and whatever you explicitly turn on. We do <strong>not</strong> hold a profile of your taste to sell, a history you didn't ask us to keep, or anything we'd hand to an advertiser, because we don't have advertisers.",
  "terms.sec.privacy.footnote":
    "Aggregate, de-identified play counts show artists how their music is heard, with no names attached. You can export everything we hold, or erase it, from <a>Settings, then Erase & exit</a>: instantly, no modal, no undo needed because we mean it.",

  "terms.longVersions.meta":
    "terms v3.2 · privacy v2.1 · co-op deed 2024 · last updated 2 Jun 2026",
  "terms.readDeedCta": "Read the deed",
  "terms.readDeedToast": "Opening the co-op deed…",

  // ── Rights & takedown (StudioRightsPage) ──────────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "rights.promise.window.title": "14-day removal",
  "rights.promise.window.body":
    "Confirm a takedown and the release stops being served within 14 days, usually the same night. Caches clear, links 404 to a tasteful page.",
  "rights.promise.paid.title": "What fans paid stays yours",
  "rights.promise.paid.body":
    "Fans paid you directly, so that money never passed through QueerPulse. Taking work down leaves every payment where it is.",
  "rights.promise.banking.title": "Getting paid untouched",
  "rights.promise.banking.body":
    "A takedown leaves your account open. Your ways to get paid, the prices on your other releases, your collaborator splits: all stay live.",

  "rights.releases.heading": "Your <em>releases</em>",
  "rights.releases.liveCount_one": "{count} live",
  "rights.releases.liveCount_other": "{count} live",
  "rights.releases.removingCount_one": "{count} in a removal window",
  "rights.releases.removingCount_other": "{count} in a removal window",

  "rights.removingStatus_one": "Removing · {count} day left",
  "rights.removingStatus_other": "Removing · {count} days left",
  "rights.cancelRemovalCta": "Cancel removal",
  "rights.takeDownCta": "Take down",

  "rights.leavingCoop.title": "Leaving the co-op <em>entirely</em>?",
  "rights.leavingCoop.body":
    "This page only removes individual releases. To close your artist account, end your sustainer membership, and request a full data export, that lives in <a>Settings, then Erase & exit</a>. <em>Even then, every euro fans paid you stays yours</em>, because it went straight to you.",

  "rights.takedownStartedToast": '"{title}" enters its 14-day removal window',
  "rights.removalCancelledToast": "Removal cancelled. Release stays up",

  // ── Takedown confirm modal (StudioTakedownModal) ──────────────────────────
  "rights.modal.confirmAria": "Confirm takedown of {title}",
  "rights.modal.eyebrow": "Confirm takedown",
  "rights.modal.title": "Take down <em>{title}</em>?",
  "rights.modal.body":
    'It\'ll stop being served within 14 days. Existing links will resolve to a short "this work has been withdrawn by the artist" page. <em>You can re-publish it any time</em>. Your masters never leave your hands.',
  "rights.modal.keepEarned":
    "<em>You keep everything fans already paid you.</em> That money went straight to you, so a takedown leaves it untouched.",
  "rights.modal.confirmCta": "Take it down",
  "rights.modal.cancelCta": "Keep it up",

  // ── Album "more from the artist" rail (StudioAlbumMore) ───────────────────
  "album.more.heading": "More from <em>{artist}</em>",
  "album.more.artistPageCta": "Artist page",

  // ── Shared detail-page hero chrome (Album/Set — masculine nouns in
  //    pt-PT; Track/Collection reuse the feminine room.hero.addedToast /
  //    removedToast above instead, per grammatical gender agreement) ────────
  "detail.shareCta": "Share",
  "detail.linkCopiedToast": "Link copied to clipboard",
  "detail.copyFailedToast": "Could not copy link",
  "detail.tipArtistCta": "Tip {artist}",
  "detail.tipCta": "Tip",
  "detail.addedToast": "Added to your library",
  "detail.removedToast": "Removed from your library",

  // ── Track detail page (StudioTrackPage + Hero + Sidebar + Lyrics) ─────────
  // Scope note: track title, artist name, curator quote, lyrics, and the
  // per-track split/credits breakdown are content — left English (§1).
  "track.hero.eyebrow": "Track {current} of {total}",
  "track.inSet.status":
    "You're listening with <b>{count}</b> people in the <em>Wednesday set</em>, programmed by {curator}. Track {next} starts in <b>{countdown}</b>.",
  "track.inSet.joinCta": "Join the set",
  "track.more.fullAlbumCta": "Full album",
  "track.sidebar.curatorNoteLabel": "Curator's note",
  "track.sidebar.creditsHeading": "Credits",
  "track.sidebar.leadSheetLabel": "Lead sheet",
  "track.sidebar.downloadCta": "Download",
  "track.sidebar.curatorRole": "programming lead · the Wednesday set",
  "track.sidebar.sheetSpec": "6 pages · piano + voice · {licence} · {artist}",
  "track.lyrics.heading": "Lyrics & <em>translation</em>",
  "track.lyrics.leadSheetChordsCta": "Lead sheet & chords",

  // ── Album detail page (StudioAlbumPage + Hero + Main + Sidebar) ───────────
  // Scope note: album title, artist name, liner notes and credits prose are
  // content — left English (§1).
  "album.tabs.tracklist": "Tracklist",
  "album.tabs.linerNotes": "Liner notes",

  // ── Artist profile page (StudioArtistPage + Hero + Main + Sidebar) ────────
  // Scope note: artist bio prose is content — left English (§1).
  "artist.tabs.music": "Music",
  "artist.tabs.about": "About",
  "artist.hero.followCta": "Follow",
  "artist.hero.followedToast": "Following {artist}",
  "artist.hero.unfollowedToast": "Unfollowed {artist}",
  "artist.main.releasesHeading": "Releases",
  "artist.main.singlesHeading": "Singles & <em>standalones</em>",
  "artist.sidebar.thisMonthHeading": "{artist} · this month",
  "artist.sidebar.tipsReceived": "Tips received",
  "artist.sidebar.directSubscribers": "Direct subscribers",

  // ── Live set detail page (StudioSetPage) ──────────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "set.page.playAria": "Play set",
  "set.page.joinLiveRoomCta": "Join the live room",
  "set.page.tracklistHeading": "The <em>tracklist</em>",
  "set.page.creditedNote": "Every track credited to its artist",
  "set.page.playingNowLabel": "playing now",

  // ── Off-air shelves (StudioOffAirShelves) ─────────────────────────────────
  "offAir.carryOn.heading": "Carry on where you <em>left off</em>",
  "offAir.carryOn.sub": "From your library · plays on, broadcast or not",
  "offAir.libraryCta": "Library",
  "offAir.quietHours.heading": "For the <em>small hours</em>",
  "offAir.quietHours.sub": "Council collections that don't need the lights on",
  "offAir.allCta": "All",

  // ── Withdrawn-release page (StudioWithdrawnPage) ──────────────────────────
  "withdrawn.hero.eyebrow": "Withdrawn by the artist",
  "withdrawn.hero.title": "This work has been <em>taken down</em>.",
  "withdrawn.hero.sub":
    "The artist removed it from Studio: their right, their call. <em>No reason is owed</em>, and we don't ask for one.",
  "withdrawn.card.title": "What this <em>means</em>",
  "withdrawn.card.body":
    "A takedown removes the release from Studio and leaves the work itself intact. The masters stay with the artist, who can re-publish any time. If you'd bought or saved it, it stays in your library as a record, marked withdrawn.",
  "withdrawn.card.jadeLine":
    "If you tipped or bought this, <em>every cent already reached the artist</em> and stays with them. Nothing is clawed back.",
  "withdrawn.visitArtistCta": "Visit the artist's page",
  "withdrawn.backToPlayerCta": "Back to the player",
  "withdrawn.still.heading": "Still <em>available</em> from this artist",
  "withdrawn.still.sub":
    "What's left up, and what the council programmed instead",

  // ── Social-share end card (StudioEndCardPage) ─────────────────────────────
  "endCard.eyebrow": "A streaming co-op",
  "endCard.tagline": "the music, <em>paid forward.</em>",
  "endCard.directLine": "fans pay artists directly",
  "endCard.perBuyLabel": "of every buy",
  "endCard.perTipLabel": "of every tip",
  "endCard.listenCta": "listen with pride",

  // ── Curation council (StudioCouncilPage) ──────────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "council.hero.eyebrow": "Governance · the council",
  "council.hero.title": "Six people choose what everyone <em>hears</em>.",
  "council.hero.dek":
    "Elected yearly by the assembly, paid a flat stipend on the public ledger, term-limited to two years. They program the weekly set, run triage, and write the notes. <em>Everything they pick has their name on it.</em>",
  "council.intro.lede":
    "The council works in the open. They listen publicly, <em>justify every pick in a paragraph</em>, and answer to the members. You can read their notebooks, see their slates, and vote them out.",

  "council.fact.seats.value": "<em>6</em> seats",
  "council.fact.seats.label": "2-year terms · staggered",
  "council.fact.stipend.value": "€<em>400</em>",
  "council.fact.stipend.label": "monthly stipend · on the ledger",
  "council.fact.slates.value": "<em>52</em>",
  "council.fact.slates.label": "slates programmed this year",
  "council.fact.election.value": "<em>9 Jun</em>",
  "council.fact.election.label": "next election · assembly",

  "council.notebookLabel": "From the notebook",
  "council.recentSlatesLabel": "Recent slates",
  "council.theirSlateCta": "Their slate",

  // ── Settings (StudioSettingsPage + Controls + Sections) ───────────────────

  "settings.audio.label": "Audio",
  "settings.audio.title": "Sound <em>quality</em>",
  "settings.audio.dek":
    "FLAC is lossless and bigger; AAC is lighter on data. Streaming and downloads can differ. Pick per context.",
  "settings.audio.streamQuality.heading": "Default streaming quality",
  "settings.audio.streamQuality.body":
    "On a good connection we'll go as high as you allow. We never auto-upgrade on cellular without asking.",
  "settings.audio.streamQuality.flac.label": "FLAC · 24/48",
  "settings.audio.streamQuality.flac.badge": "lossless",
  "settings.audio.streamQuality.flac.sub":
    "The master, untouched. ~25 MB / track.",
  "settings.audio.streamQuality.aac.label": "AAC · 256kbps",
  "settings.audio.streamQuality.aac.sub":
    "Transparent for most ears. ~7 MB / track.",
  "settings.audio.downloadQuality.heading": "Download quality",
  "settings.audio.downloadQuality.body":
    "What we cache when you save a track for offline (sustainers only).",
  "settings.audio.normalise.heading": "Normalise loudness",
  "settings.audio.normalise.body":
    "Even out volume across tracks and sets. <em>Off</em> if you want the artist's intended dynamics.",

  "settings.privacy.label": "Privacy",
  "settings.privacy.title": "What Studio <em>remembers</em>",
  "settings.privacy.dek":
    "The short version: a listening history only you can see, which you can pause or clear. We never sell, share, or train on what you play. Plays count anonymously toward artists' totals either way.",
  "settings.privacy.cloudSync.heading": "Cloud-sync my library",
  "settings.privacy.cloudSync.body":
    "Saves and follows move between devices. Without this they live on this device only.",
  "settings.privacy.tipNotes.heading": "Tip notes: who sees them",
  "settings.privacy.tipNotes.body":
    "The note you write when you tip. <em>Private is the default</em>: only you and the artist ever read it.",
  "settings.privacy.tipNotes.private.label": "Private",
  "settings.privacy.tipNotes.private.badge": "default",
  "settings.privacy.tipNotes.private.sub":
    "Just you and the artist. Never shown on their page or your public receipt.",
  "settings.privacy.tipNotes.semi.label": "Semi-public",
  "settings.privacy.tipNotes.semi.sub":
    "Visible to other sustainers of that artist, attributed to your handle.",
  "settings.privacy.tipNotes.public.label": "Public",
  "settings.privacy.tipNotes.public.sub":
    "Anyone can read it on the artist's page. You can still hide any single note later.",
  "settings.privacy.tipReceipts.heading": "Public tip receipts",
  "settings.privacy.tipReceipts.body":
    'Each tip mints a receipt showing the split, with no personal data. On, it can be shared as a "look what we paid this artist" card.',

  "settings.captions.label": "Captions & lyrics",
  "settings.captions.title": "Words on the <em>screen</em>",
  "settings.captions.dek":
    "Live rooms are captioned (auto, with a human pass on council broadcasts). Lyrics scroll in time with the track where the artist supplied them.",
  "settings.captions.showCaptions.heading": "Show captions in live rooms",
  "settings.captions.showCaptions.body":
    "The talk between songs, transcribed. <em>On</em> by default for every broadcast.",
  "settings.captions.captionSize.heading": "Caption size",
  "settings.captions.captionSize.body":
    "How large captions and the scrolling lyric line appear.",
  "settings.captions.lyricLanguage.heading": "Lyric language",
  "settings.captions.lyricLanguage.body":
    "Show lyrics in the original, or a community translation where one exists.",
  "settings.captions.lyricLanguage.opt.original": "Original (as recorded)",
  "settings.captions.lyricLanguage.opt.english": "English translation",
  "settings.captions.lyricLanguage.opt.portuguese": "Português",
  "settings.captions.lyricLanguage.opt.spanish": "Español",
  "settings.captions.lyricLanguage.opt.french": "Français",
  "settings.captions.showBoth.heading": "Show both original & translation",
  "settings.captions.showBoth.body":
    "Two lines at once, original above the translation.",

  "settings.tipping.label": "Tipping",
  "settings.tipping.title": "Your default <em>tip</em>",
  "settings.tipping.dek":
    "What the one-tap tip pill sends. 100% reaches the artist. There is no platform cut on tips, ever.",
  "settings.tipping.defaultAmount.heading": "Default amount",
  "settings.tipping.defaultAmount.body":
    "You can always pick a different figure at tip time.",
  "settings.tipping.roundUp.heading": "Round up album buys into a tip",
  "settings.tipping.roundUp.body":
    "A {albumPrice} album becomes {roundedPrice}, the {tipAmount} going to the artist as a tip.",

  "settings.erase.label": "Erase & exit",
  "settings.erase.title": "One tap, <em>no questions</em>",
  "settings.erase.dek":
    "These don't ask twice and don't show a modal. We mean it: leaving should be as easy as arriving.",
  "settings.erase.export.heading": "Download everything we hold on you",
  "settings.erase.export.note":
    "A JSON of your saves, tips, receipts and settings, emailed within the hour.",
  "settings.erase.export.cta": "Request export",
  "settings.erase.export.toast":
    "We'll email your data export within the hour.",
  "settings.erase.closeAccount.heading": "Close my Studio account",
  "settings.erase.closeAccount.note":
    "Stops your sustainer fee, removes your library. Past tips stay paid to artists. <em>Your ways to get paid, if you're also an artist, stay as they are.</em>",
  "settings.erase.closeAccount.cta": "Close account",
  "settings.erase.closeAccount.toast":
    "Account closure opens in a separate flow.",

  // ── Notifications (StudioNotificationsPage) ───────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "notifications.eyebrow": "Your Studio · what happened while you were out",
  "notifications.title": "It's been <em>busy</em> here.",
  "notifications.dek":
    "Tip replies from artists, new releases from people you follow, live rooms about to open. <em>Only the things you asked to hear about</em>. Tune it in Settings.",
  "notifications.filter.all": "All",
  "notifications.filter.reply": "Replies",
  "notifications.filter.release": "Releases",
  "notifications.filter.live": "Live",
  "notifications.markAllReadCta": "Mark all read",
  "notifications.markAllReadToast": "All caught up",
  "notifications.empty":
    "Nothing of <em>that kind</em> right now. When it happens, it'll land here. Quiet is allowed.",
  "notifications.day.today": "Today",
  "notifications.day.week": "This week",
  "notifications.action.joinRoom": "Join the set",
  "notifications.action.rsvp": "RSVP",
  "notifications.rsvpToast": "You're on the list for this premiere",

  // ── Tip modal (StudioTipModal — reused across Studio pages) ───────────────
  "tipModal.dialogAria": "Send a tip to {recipient}",
  "tipModal.closeAria": "Close",
  "tipModal.eyebrow": "Tip · 100% to the artist",
  "tipModal.title": "Send a tip to <em>{recipient}</em>",
  "tipModal.sub":
    "Tips pass through untouched: every cent lands with {recipient}.",
  "tipModal.customPlaceholder": "Custom amount",
  "tipModal.sendingCta": "Sending…",
  "tipModal.sendCta": "Tip {amount}",
  "tipModal.note":
    "Pays {recipient} on top of streaming · <em>nothing skimmed</em>",
  "tipModal.success.body":
    "100% of your tip reaches {recipient} directly. No platform cut, no processing skimmed off the top.",
  "tipModal.success.backCta": "Back to the music",
  "tipModal.amountsLabel": "Tip amount",
  "tipModal.failed":
    "The demo card issuer declined {amount} because tips above {limit} are not accepted. Pick a smaller amount and try again, nothing was charged",
  "tipModal.success.heading": "Tip sent",
  "tipModal.success.sentTo": "Sent to {recipient}",

  // ── Creator back-office nav (StudioCreatorShell) ───────────────────────────
  "creator.nav.dashboard": "Dashboard",
  "creator.nav.newRelease": "New release",
  "creator.product": "Creator",
  "creator.viewPublicPageCta": "View public page",

  // ── Your library (StudioLibraryPage) ───────────────────────────────────────
  // Chrome only — album/set/track/collection titles and artist names in the
  // mock library below are content and stay English in both modes (§1).
  "library.eyebrow": "Your library",
  "library.title": "Everything you've <em>kept.</em>",
  "library.dek":
    "Saved albums, sets, and tracks, plus the <em>{amount}</em> of music you've bought straight from {artistCount} artists this year.",
  "library.tabs.albums": "Albums",
  "library.tabs.sets": "Sets",
  "library.tabs.collections": "Collections",
  "library.tabs.tracks": "Tracks",
  "library.category.albums": "albums",
  "library.category.sets": "sets",
  "library.category.collections": "collections",
  "library.category.tracks": "tracks",
  "library.empty.title": "Your library's empty here",
  "library.empty.description":
    "Nothing in <em>{category}</em> yet. Wander the studio, and anything you save lands right here, yours to come back to.",
  "library.empty.browseCta": "Browse the studio",
  "library.empty.searchCta": "Search the catalogue",

  // ── Search (StudioSearchPage) ──────────────────────────────────────────────
  // Chrome only — result titles/artist names/recent-search terms below are
  // content (or, for recent searches, the listener's own history in live
  // mode) and stay English in both modes (§1).
  "search.eyebrow": "Search the catalogue",
  "search.title": "Find the <em>sound.</em>",
  "search.inputPlaceholder": "Artists, albums, sets, sheet music…",
  "search.filter.everything": "Everything",
  "search.filter.artists": "Artists",
  "search.filter.albums": "Albums",
  "search.filter.sets": "Sets",
  "search.filter.collections": "Collections",
  "search.filter.sheetMusic": "Sheet music",
  "search.results.forQuery": "Results for <em>{query}</em>",
  "search.results.featuredNow": "Featured <em>now</em>",
  "search.empty.title": "Nothing matched that",
  "search.empty.description":
    "We couldn't find anything for <em>{term}</em>. Try a different word, or loosen the filter. The catalogue is bigger than it looks.",
  "search.empty.clearCta": "Clear search",

  // ── Creator dashboard (StudioDashboardPage + Charts + Side) ────────────────
  // Chrome only — the artist's name, track titles, per-artist figures
  // (STATS/CURATORS/CITIES/BARS in studioDashboard.data), and the specific
  // live-room plans below are this artist's own data, API-sourced in
  // live mode, and stay English in both modes (§1).
  "dashboard.hero.eyebrow": "Studio · this month",
  "dashboard.hero.title": "Good week, <em>{name}</em>.",
  "dashboard.hero.sub":
    "<em>{trackTitle}</em> is two months old and still climbing. The curators kept it in rotation.",

  "dashboard.stats.streamingEarnings": "Release buys",
  "dashboard.stats.tipsReceived": "Tips received",

  "nextSteps.heading": "Next steps",
  "nextSteps.drafts_one": "You have {count} draft waiting to be finished",
  "nextSteps.drafts_other": "You have {count} drafts waiting to be finished",
  "nextSteps.draftsAction": "Finish drafts",
  "nextSteps.scheduled_one": "{count} release is scheduled",
  "nextSteps.scheduled_other": "{count} releases are scheduled",
  "nextSteps.scheduledAction": "Review scheduled releases",
  "nextSteps.support":
    "Add Bandcamp, Ko-fi or Patreon links so people can support you",
  "nextSteps.supportAction": "Add support links",
  "nextSteps.press": "Set up your press kit with a contact and quotes",
  "nextSteps.pressAction": "Edit press kit",

  "dashboard.charts.curators.heading":
    "Curators & <em>placements</em> · what landed your work this week",
  "dashboard.charts.geography.heading": "Where they're <em>listening</em> from",
  "dashboard.charts.geography.hint":
    "City-level only · we never see street or finer. <em>This is the most we'll ever tell you about a listener.</em>",

  "dashboard.side.quickActions.heading": "Things you can <em>do</em> from here",
  "dashboard.side.quickActions.upload.label": "Upload a new release",
  "dashboard.side.quickActions.upload.hint": "WAV / FLAC · 3 steps · 8 minutes",
  "dashboard.side.quickActions.goLive.label": "Go live: host a live room",
  "dashboard.side.quickActions.payments.label": "Review payments from buyers",
  "dashboard.side.quickActions.payments.hint":
    "Check what buyers say they paid, then confirm",
  "dashboard.side.deal.eyebrow": "The deal, always",
  "dashboard.side.deal.heading": "Every buy goes <em>to you.</em>",
  "dashboard.side.deal.body":
    "Fans pay you directly for your albums, EPs, singles and tracks, and QueerPulse never holds the money. The deal is the same for a first release as for a festival winner.",
  "dashboard.side.deal.buys.label": "Buys",
  "dashboard.side.deal.buys.value": "Paid to you directly",
  "dashboard.side.deal.platform.label": "Taken by QueerPulse",
  "dashboard.side.deal.platform.value": "Nothing",
  "dashboard.side.deal.tips.label": "Tips",
  "dashboard.side.deal.tips.value": "100% to you",

  // ── Upload wizard (StudioUploadPage + Sections) ────────────────────────────
  // Chrome only — uploaded file names, image validation detail, this
  // release's title/genre, and collaborator names/roles below are this
  // artist's own release data, API-sourced in live mode, and stay English
  // in both modes (§1).
  "upload.hero.eyebrow": "New release · upload",
  "upload.hero.title": "Bring it <em>home.</em>",
  "upload.hero.sub":
    "Drop the masters. We transcode, you keep the originals. Three steps, about eight minutes.",

  "upload.steps.files.nm": "Files",
  "upload.steps.files.sub": "· WAV / FLAC · cover art · lyrics",
  "upload.steps.metadata.nm": "Metadata & credits",
  "upload.steps.metadata.sub": "· title · year · per-track splits",
  "upload.steps.licence.nm": "Licence & release",
  "upload.steps.licence.sub": "· CC / ARR · pricing · publish date",

  "upload.dropzone.title":
    "Drop a folder of <em>WAVs</em>, or click to browse.",
  "upload.dropzone.body":
    "An EP, an album, a single: same flow. We'll figure out track order from filenames.",
  "upload.dropzone.accepts":
    "accepts · <em>WAV · FLAC · AIFF</em> · max 96 kHz / 24 bit · up to 24 tracks",

  "upload.files.heading":
    "Uploaded <em>{readyCount} of {totalCount} ready</em>",
  "upload.files.okReady": "OK · ready",

  "upload.coverArt.heading":
    "Cover art <em>{readyCount} of {totalCount} · linted</em>",

  "upload.splits.heading": "Per-track <em>splits</em> · default 100% to you",
  "upload.splits.sub":
    "Add collaborators and we route each cent directly to their bank.",
  "upload.splits.table.collaborator": "Collaborator",
  "upload.splits.table.roleTracks": "Role · tracks",
  "upload.splits.table.share": "Share",
  "upload.splits.footer":
    "Default split sums to {total} · per-track adjustments override",
  "upload.splits.addCollaboratorCta": "Add collaborator",
  "upload.splits.handlePlaceholder": "QP handle or email",
  "upload.splits.inviteCta": "Invite",
  "upload.splits.invitedToast": "Invited {handle} to the splits",
  "upload.splits.invitedSubLabel": "invited · IBAN pending",
  "upload.splits.invitedRole": "collaborator · all tracks",
  "upload.splits.demo.mariana.subtitle":
    "you · songwriter, voice, piano · all tracks",
  "upload.splits.demo.mariana.role": "writer and performer · tracks 1 to 11",
  "upload.splits.demo.joao.subtitle": "cellist · IBAN invite pending",
  "upload.splits.demo.joao.role": "cello · tracks 2, 7 and 11",
  "upload.splits.demo.ines.subtitle": "mix and master · QueerPulse member",
  "upload.splits.demo.ines.role": "production · all tracks",
  "upload.splits.demo.coro.subtitle": "choir · 15 voices sharing one split",
  "upload.splits.demo.coro.role": "choir · track 4",

  "upload.side.files.eyebrow": "What we do with your files",
  "upload.side.files.title": "Yours, <em>still</em>.",
  "upload.side.files.body":
    "You drop the masters; we transcode and stream. Your original WAV / FLAC stays your property. We hold a copy <em>only</em> for delivery. Takedown removes the listening copy in 14 days. Non-exclusive, always.",
  "upload.side.files.list.sourceKept.label": "Source kept",
  "upload.side.files.list.sourceKept.value": "your file, untouched",
  "upload.side.files.list.listenerDelivery.label": "Listener delivery",
  "upload.side.files.list.listenerDelivery.value": "FLAC + AAC 256",
  "upload.side.files.list.loudnessTarget.label": "Loudness target",
  "upload.side.files.list.loudnessTarget.value":
    "−14 LUFS, measured as you upload",
  "upload.side.files.list.isrc.label": "ISRC assignment",
  "upload.side.files.list.isrc.value": "automatic",

  "upload.side.lyrics.eyebrow": "Lyrics & translations",
  "upload.side.lyrics.title": "Lyrics <em>required</em>, translations paid.",
  "upload.side.lyrics.body":
    "Upload lyrics in any language. For a line-by-line translation, the solidarity fund pays a community translator <em>€40 per song</em>. They keep their byline; you approve before publish.",
  "upload.side.lyrics.list.autoTranscribe.label": "Auto-transcribe",
  "upload.side.lyrics.list.autoTranscribe.value": "free · ~94%",
  "upload.side.lyrics.list.communityTranslation.label": "Community translation",
  "upload.side.lyrics.list.communityTranslation.value": "€40 to the translator",
  "upload.side.lyrics.list.approval.label": "Your approval",
  "upload.side.lyrics.list.approval.value": "before publish",

  "upload.metadata.heading": "Metadata & <em>credits</em>",
  "upload.metadata.sub":
    "A few last details and your release goes to the council queue for review.",
  "upload.metadata.field.title": "Release title",
  "upload.metadata.field.year": "Release year",
  "upload.metadata.field.genre": "Genres",
  "upload.metadata.genre.fado": "Fado / contemporary",
  "upload.metadata.genre.electronic": "Electronic",
  "upload.metadata.genre.folk": "Folk",
  "upload.metadata.genre.experimental": "Experimental",
  "upload.metadata.backCta": "Back to files",
  "upload.metadata.submitCta": "Submit for review",

  "upload.submitted.title": "Submitted for <em>review.</em>",
  "upload.submitted.body":
    "Your release is in the council queue. A curator will check the files, splits and credits, usually within a day or two, and you'll get a note the moment it's live. Nothing publishes without your final yes.",
  "upload.submitted.toast": "Release submitted for review",

  "upload.continueToMetadataCta": "Continue to metadata",

  // ── Programme the week (StudioProgramPage + Inbox + Slate) ────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "program.header.eyebrow":
    "Programming the week · Monday morning · drag anything below",
  "program.header.title": "Week <em>{weekNumber}</em> · {dateRange}",
  "program.header.sub":
    "Build the slate of the week: <em>one cover, 12 to 16 tracks, 2 to 3 collections, broadcasts</em>. Press publish at noon and the homepage rotates.",
  "program.header.autosave": "Auto-saved · {time}, every keystroke",
  "program.header.previewRoomCta": "Preview the week's programme",

  "program.publishBar.status":
    "Slate is <em>{percent}% complete</em> · publishes {publishDate} · auto-rotates the homepage",
  "program.publishBar.previewHomepageCta": "Preview homepage",
  "program.publishBar.saveDraftCta": "Save draft",
  "program.publishBar.publishCta": "Publish at noon",

  "program.toast.addedToSlate": "Added to this week's slate",
  "program.toast.passed": "Passed. The writer can resubmit later",
  "program.toast.playingPreview": "Playing preview…",
  "program.toast.openingRoomPreview": "Opening the programme preview…",
  "program.toast.chooseNewCover": "Choose a new cover artist…",
  "program.toast.editingCoverNote": "Editing the cover note…",
  "program.toast.openingHomepagePreview": "Opening homepage preview…",
  "program.toast.draftSaved": "Draft saved",
  "program.toast.published": "Slate published. Homepage rotates at noon",
  "program.toast.movedSingle": "{title} is now number {position}",
  "program.toast.addSingleFromInbox":
    "Pick a submission in the inbox and choose + Slate to fill an open slot",
  "program.toast.addBroadcastDemo":
    "Scheduling a new broadcast is switched off in the demo",

  "program.inbox.heading": "Submissions · <em>{count} new</em>",
  "program.inbox.triageCta": "Triage",
  "program.inbox.tip":
    "Drag any submission left into a slot. <em>The pass-with-reason flow is in triage.</em>",
  "program.inbox.listenCta": "Listen",
  "program.inbox.slateLabel": "Slate",
  "program.inbox.passCta": "Pass",

  "program.slate.cover.heading": "Cover artist of the week",
  "program.slate.cover.count": "1 of 1 · the week's headline",
  "program.slate.cover.swapCta": "Swap",
  "program.slate.cover.editNoteCta": "Edit note",
  "program.slate.singles.heading": "This week's singles",
  "program.slate.singles.count":
    "{placed} of {total} placed · {open} slots open",
  "program.slate.singles.notePlaceholder":
    "Write a one-line note · why this, why now",
  "program.slate.singles.noteAria": "Note for {title}",
  "program.slate.singles.removeAria": "Remove {title}",
  "program.slate.singles.moveUpAria": "Move {title} up",
  "program.slate.singles.moveDownAria": "Move {title} down",
  "program.slate.singles.addSlotLabel":
    "Drag a track from submissions, or click to add from catalogue",
  "program.slate.collections.heading": "Collection rotation",
  "program.slate.collections.count": "{placed} of {total}",
  "program.slate.broadcasts.heading": "Live broadcasts this week",
  "program.slate.broadcasts.count":
    "{scheduled} scheduled · slot {slotNumber} open",
  "program.slate.broadcasts.addSlotLabel":
    "Schedule a third broadcast for Saturday late",

  // ── Submission triage (StudioTriagePage + List + Detail) ───────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  // The tab `id`s below are stable filter values, kept apart from the translated labels (§5.1).
  "triage.header.eyebrow":
    "Submission triage · the council answers every submission in 14 days",
  "triage.header.title": "Inbox · <em>{count}</em> new this week.",
  "triage.header.sub":
    "Every submission gets read or listened to. <em>Pass</em> takes a sentence: that sentence becomes the artist's answer. Median reply time this season: {days} days.",

  "triage.kpi.newThisWeek": "new this week",
  "triage.kpi.youClaimed": "you claimed",
  "triage.kpi.medianReply": "median reply",
  "triage.kpi.atDeadline": "at deadline",

  "triage.tabs.new.label": "New",
  "triage.tabs.new.queue": "new",
  "triage.tabs.yours.label": "Yours",
  "triage.tabs.yours.queue": "yours",
  "triage.tabs.atDeadline.label": "At deadline",
  "triage.tabs.atDeadline.queue": "at deadline",
  "triage.tabs.shortlisted.label": "Shortlisted",
  "triage.tabs.shortlisted.queue": "shortlisted",
  "triage.tabs.answered.label": "Answered",
  "triage.tabs.answered.queue": "answered",

  "triage.list.empty.title": "Nothing in this queue",
  "triage.list.empty.description":
    "No submissions sit in <em>{queue}</em> right now. When something lands, you'll find it waiting here.",
  "triage.list.backToNewCta": "Back to new",
  "triage.list.dayOfTotal": "of 14 to answer",

  "triage.detail.playAria": "Play",
  "triage.detail.fileHeading": "The file",
  "triage.detail.file.format": "Format",
  "triage.detail.file.loudness": "Loudness",
  "triage.detail.file.duration": "Duration",
  "triage.detail.file.lyrics": "Lyrics",
  "triage.detail.file.splits": "Splits",
  "triage.detail.flaggedHeading": "What other curators flagged ({count})",
  "triage.detail.answerHeading": "Your <em>answer</em>",
  "triage.detail.decision.heading":
    "If you pass, write one sentence. This goes to {artistName} as the answer.",
  "triage.detail.decision.placeholder":
    "A small sentence that explains the no. We never send a form letter, ever.",
  "triage.detail.decision.hint":
    "Required for pass. <em>Not required</em> for slate.",
  "triage.detail.holdCta": "Hold & second-read",
  "triage.detail.passCta": "Pass with your note",
  "triage.detail.addToSlateCta": "Add to next slate",
  "triage.detail.toast.held": "Held for a second read",
  "triage.detail.toast.passed":
    "Passed with your sentence, sent to {artistName}",
  "triage.detail.toast.addedToSlate": "Added to the next slate",
  "triage.documentTitle": "Curator triage",
  "triage.tabsLabel": "Submission queues",
  "triage.detail.regionLabel": "Selected submission",
  "triage.detail.pauseAria": "Pause",

  // ── Live room (StudioLivePage + LiveNow + LiveChat) ────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  // Chat-tab `id`s are stable values, kept apart from the translated labels (§5.1).
  "live.ribbon.onAirNow": "On the air now",

  "liveNow.saveTrackCta": "Save track",
  "liveNow.savedCta": "Saved",
  "liveNow.savedToast": "Track saved to your library",
  "liveNow.removedToast": "Removed from your library",
  "liveNow.lyricsNotesCta": "Lyrics & notes",
  "liveNow.listenersLabel":
    "listening with you · {sustainers} sustainers, {casual} casual",
  "liveNow.tippedLabel": "tipped during this set · 100% to artists",
  "liveNow.buyCutLabel": "taken by QueerPulse when you buy from {artist}",
  "liveNow.setBuilding.heading": "The set · <em>building live</em>",
  "liveNow.trackPosition": "Track {current} of {total} · jumped from queue",
  "liveNow.tipArtistCta": "Tip {artist} · {amount}",

  "liveChat.tabs.chat.label": "Chat",
  "liveChat.tabs.tips.label": "Tips",
  "liveChat.tabs.listeners.label": "Listeners",
  "liveChat.inputPlaceholder": "say something to everyone listening…",
  "liveChat.sendAria": "Send",
  "liveChat.tipPresetCta": "Tip {amount}",
  "liveChat.tipCustomCta": "Tip €__",
  "liveChat.tabsLabel": "Chat panels",
  "liveChat.tips.empty": "No tips yet. Tip lines appear here as they come in",
  "liveChat.logLabel": "Live chat messages",

  // ── Go live / broadcaster console (StudioBroadcastPage + Console) ─────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "broadcast.status.onAir": "You're <em>on the air</em>",
  "broadcast.status.livePill": "live",
  "broadcast.status.meta":
    "<em>{count}</em> listening · {sustainers} sustainers · {cities} cities",
  "broadcast.status.pauseMicCta": "Pause mic",
  "broadcast.status.endBroadcastCta": "End broadcast",
  "broadcast.status.toast.micPaused": "Mic paused. Your listeners hear silence",
  "broadcast.status.toast.ending": "Broadcast ends in 5… archiving to a replay",

  "broadcast.audioIn.panelLabel": "Audio in",
  "broadcast.audioIn.singleCamVideo": "Single-cam video",
  "broadcast.audioIn.cameraNote":
    "Audio-only is the default for live rooms. Camera ships in Phase 5, flagged off for now.",

  "broadcast.nowPlaying.onAirNow": "On the air now",
  "broadcast.nowPlaying.setListLabel":
    "Set list · <em>type as you play</em>: it becomes the cue sheet on archive",
  "broadcast.nowPlaying.inputPlaceholder":
    "What did you just play? Artist · title…",
  "broadcast.nowPlaying.inputAria": "Add a track to the set list",
  "broadcast.nowPlaying.addCta": "Add",
  "broadcast.nowPlaying.justAdded": "Just added",
  "broadcast.nowPlaying.liveYourOwn": "live, your own",
  "broadcast.nowPlaying.badge.onAir": "On air",
  "broadcast.nowPlaying.badge.matched": "Matched",
  "broadcast.nowPlaying.badge.hold": "Hold",
  "broadcast.nowPlaying.footer":
    "Matched tracks are credited to their artists automatically. <em>Held tracks wait</em> until the council's matcher clears them.",

  "broadcast.aside.tipsTab": "Live tips <em>{amount}</em>",
  "broadcast.aside.talkbackTab": "Talkback <em>{count}</em>",
  "broadcast.aside.tipsTotalLabel": "Tonight, so far · <em>100% to you</em>",
  "broadcast.aside.talkback.placeholder":
    "Talk back to your mods (listeners can't see this)…",
  "broadcast.aside.talkback.aria": "Talk back to your mods",
  "broadcast.aside.talkback.sendCta": "Send",
  "broadcast.aside.talkback.sentToast": "Sent to your mods",

  // ── Sheet music store (StudioSheetStorePage + Preview + Checkout + Also) ──
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  // Amounts route through useFormat().currency() at render (SHEET_PRICE and friends in studioSheetStore.data.tsx).
  "sheet.store.eyebrow": "Sheet music & lyrics archive",
  "sheet.store.title": "Buy the <em>score</em>, pay the people.",
  "sheet.store.dek":
    "A {amount} micropayment unlocks a clean, printable PDF, and splits <em>{splitRatio}</em> to the people who made and transcribed it. Reading is free; downloading pays.",

  "sheet.preview.eyebrow": "Lead sheet · transcription",
  "sheet.preview.byLine":
    "music & lyrics by <strong>{composer}</strong> · from <em>{album}</em>",
  "sheet.preview.freePreview": "Free preview · <em>page {page} of {total}</em>",
  "sheet.preview.watermark": "QUEERPULSE · PREVIEW",
  "sheet.preview.lockedPages": "Pages {from} to {to} unlock on purchase",
  "sheet.preview.transcribedBy": "Transcribed by <em>{name}</em>",
  "sheet.preview.transcriberRole": "Community transcriber",
  "sheet.preview.transcriberNote":
    "<em>your purchase pays the transcriber directly</em>",

  "sheet.checkout.title": "Your <em>download</em>",
  "sheet.checkout.subtitle": "One sheet · clean PDF · yours to keep & print",
  "sheet.checkout.processingLabel": "Processing",
  "sheet.checkout.processingSub": "co-op SEPA rate",
  "sheet.checkout.totalLabel": "Total",
  "sheet.checkout.splitHeading": "Where your {amount} goes · {splitRatio}",
  "sheet.checkout.role.transcriber": "transcriber",
  "sheet.checkout.role.composer": "composer",
  "sheet.checkout.role.coop": "The co-op · hosting & infra",
  "sheet.checkout.splitFoot":
    "Sheets pay <em>90%</em> to the makers, because the work is one-off and hosting a PDF costs near zero. <em>Voted in at the 9 June assembly.</em>",
  "sheet.checkout.payMethod.card.label": "Saved card",
  "sheet.checkout.payMethod.card.sub": "one-tap, no re-entry",
  "sheet.checkout.payMethod.sepa.label": "SEPA direct",
  "sheet.checkout.payMethod.sepa.sub": "lower fee, settles in 1 to 2 days",
  "sheet.checkout.paidLabel": "Paid",
  "sheet.checkout.downloadingLabel": "downloading PDF…",
  "sheet.checkout.payCta": "Pay {amount} & download",
  "sheet.checkout.note":
    "Instant download · re-download any time from your library · <em>the makers are paid tonight</em>.",
  "sheet.checkout.downloadedToast":
    "Downloaded: {amount} paid to {names} tonight",

  "sheet.also.heading": "From the same <em>transcriber</em>",
  "sheet.also.subtitle_one":
    "{name} · {count} sheet · {amount} reaches the transcriber per download",
  "sheet.also.subtitle_other":
    "{name} · {count} sheets · {amount} reaches the transcriber per download",
  "sheet.also.freeReadTag": "Free read",

  // ── Tip receipt (StudioReceiptPage) ────────────────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "receipt.tipEyebrow": "Tip · while listening",
  "receipt.byPrefix": "by",
  "receipt.fromAlbum": "from <em>{album}</em>",
  "receipt.thanksTitle": "{artist} got <em>{amount}</em>.",
  "receipt.thanksSub": "Every cent. No platform cut. <em>You did that.</em>",
  "receipt.detail.receiptNo": "Receipt no.",
  "receipt.detail.dateTime": "Date & time",
  "receipt.detail.from": "From",
  "receipt.detail.method": "Method",
  "receipt.detail.visibility": "Visibility",
  "receipt.detail.sustainerSince": "sustainer since {date}",
  "receipt.detail.chosenByDefault": "<em>chosen by default</em>",
  "receipt.detail.visibilityValue":
    "Public · with your name · <em>change to anonymous</em>",
  "receipt.detail.lisbonTime": "{date} · {time} Lisbon",
  "receipt.note.label": "Your note to {artist}",
  "receipt.note.repliedSuffix": "<em>replied</em>",
  "receipt.note.replyWhen": "{relativeTime} · still on air, two tracks later",
  "receipt.footer.keepNote": "Keep this receipt for your records",
  "receipt.footer.exportCta": "Export PDF",
  "receipt.actions.share": "Share paid card",
  "receipt.actions.tipAgain": "Tip again",
  "receipt.actions.openArtistPage": "Open {artist}'s page",
  "receipt.toast.shareCopied": "Paid card copied. Share it anywhere.",
  "receipt.toast.tipAgain": "Tip {artist} again, same track.",
  "receipt.privacyNote":
    "By default tips are <em>public, with your name</em>. You can make this one anonymous, or set every future tip to anonymous, in settings. <em>We don't share tip data with anyone.</em> <a>Privacy commitments</a>",

  // ── Sustain-membership checkout (StudioCheckoutPage) ──────────────────────
  "checkout.doneToast": "You're sustaining the studio. Welcome in.",
  "checkout.doneTitle": "You're <em>sustaining</em> it now.",
  "checkout.doneBody":
    "Welcome in. Every track you play from here pays the artist who made it. Your first payment of {amount} is done. The rest is just listening.",
  "checkout.startListeningCta": "Start listening",
  "checkout.goToLibraryCta": "Go to your library",
  "checkout.eyebrow": "Checkout",
  "checkout.title": "Sustain the <em>studio.</em>",
  "checkout.dek":
    "Seven euros a month keeps a fair-pay music platform alive: hosting, curator stipends and the solidarity fund. When you buy music, you pay the artist directly.",
  "checkout.nameLabel": "Name on card",
  "checkout.namePlaceholder": "Your name",
  "checkout.cardLabel": "Card number",
  "checkout.cardPlaceholder": "1234 5678 9012 3456",
  "checkout.expiryLabel": "Expiry",
  "checkout.expiryPlaceholder": "MM / YY",
  "checkout.cvcLabel": "CVC",
  "checkout.payCta": "Pay {amount}{cadence}",
  "checkout.cadenceMonthly": "/month",
  "checkout.prototypeNote":
    "This is a prototype. No card is charged and nothing is stored.",
  "checkout.planName": "Sustain",
  "checkout.membershipLabel": "{name} <em>membership</em>",
  "checkout.dueTodayLabel": "Due today",
  "checkout.lines.unlimitedListening": "Unlimited listening",
  "checkout.lines.losslessAudio": "Lossless audio · FLAC",
  "checkout.lines.liveRooms": "Live broadcast rooms",
  "checkout.lines.artistShare": "Goes to artists",
  "checkout.lines.platformShare": "Platform & hosting",
  "checkout.lines.included": "included",
  "checkout.reassure.cancel":
    "Cancel any time: one click, no email, no retention call.",
  "checkout.reassure.share":
    "{percent}% of every euro is paid straight to the artists you listen to.",
  "checkout.reassure.noAds": "No ads, ever. Your listening data is never sold.",
  "checkout.processingCta": "Processing payment…",
  "checkout.declined":
    "The demo bank declined the card ending {last4}. Check the card number or try another card, nothing was charged",
  "checkout.declineHint":
    "To see a declined payment, enter a card number ending in 0002.",

  // ── Solidarity fund (StudioSolidarityFundPage + Balance + Flows + Log) ────
  // Chrome only. Two paragraphs deliberately NOT swept — flagged in the sweep
  // report as eligibility/commitment copy (§6): the "apply" section's
  // no-means-test promise, and the fund-balance runway/rollover rule, and the
  // flows dek's guarantee about artists' money and tips. They
  // render in English via the fallback chain until reviewed. Disbursement
  // log recipient names/notes are content — API-sourced ledger rows in live
  // mode — and stay English in both modes (§1).
  "fund.hero.liveLabel": "Public · updated Mondays at noon",
  "fund.hero.title": "The <em>solidarity</em> fund.",
  "fund.hero.dek":
    "A small pooled reserve for the people that buys and tips can't reach: <em>transcribers, translators, first-timers, and artists in a hard month</em>. Where it comes from and where it goes, in full.",

  "fund.balance.label": "Fund balance · today",
  "fund.balance.paidThisQuarterLabel": "paid out this quarter",
  "fund.balance.peoplePaidLabel_one": "person paid from it this year",
  "fund.balance.peoplePaidLabel_other": "people paid from it this year",

  "fund.flows.heading": "Where it <em>comes from</em>, where it <em>goes</em>",
  "fund.flows.inHeading": "Money in · this quarter",
  "fund.flows.outHeading": "Money out · this quarter",

  "fund.flows.in.surplus.label": "Subscription <em>surplus</em>",
  "fund.flows.in.surplus.desc":
    "When sustainer fees cover more than hosting and curator stipends, the difference pools here.",
  "fund.flows.in.roundups.label": "Tip <em>round-ups</em>",
  "fund.flows.in.roundups.desc":
    "The optional 5% some listeners add on top of a tip.",
  "fund.flows.in.gifts.label": "Direct <em>gifts</em>",
  "fund.flows.in.gifts.desc":
    "One-off donations from members and a Lisbon foundation.",

  "fund.flows.out.transcribers.label": "Transcribers & <em>translators</em>",
  "fund.flows.out.transcribers.desc":
    "Sheet music, lyric translations, paid per accepted piece.",
  "fund.flows.out.grants.label": "First-release <em>grants</em>",
  "fund.flows.out.grants.desc":
    "€1,200 unrestricted to first-time members on the spring strand.",
  "fund.flows.out.emergency.label": "Emergency <em>artist support</em>",
  "fund.flows.out.emergency.desc":
    "No-questions help for a member in a hard month.",
  "fund.flows.out.access.label": "Access <em>work</em>",
  "fund.flows.out.access.desc":
    "LGP interpreters, captioning passes, the screen-reader audit.",

  "fund.log.heading": "Recent <em>disbursements</em>",
  "fund.log.dek":
    "Every payment from the fund is logged here with a name (where consent is given) and a reason. <em>No black box.</em>",
  "fund.log.showingOf": "Showing {shown} of {total} this year",
  "fund.log.showLess": "show less",
  "fund.log.fullLog": "full log",
  "fund.log.exportCsv": "export CSV",
  "fund.log.exportToast": "Disbursement log exported as CSV",
  "fund.log.tag.transcriber": "Transcriber",
  "fund.log.tag.emergency": "Emergency",
  "fund.log.tag.grant": "Grant",
  "fund.log.tag.access": "Access",
  "fund.log.tag.translator": "Translator",
  "fund.log.csv.date": "Date",
  "fund.log.csv.category": "Category",
  "fund.log.csv.recipient": "Recipient",
  "fund.log.csv.note": "Note",
  "fund.log.csv.amount": "Amount (EUR)",

  "fund.apply.heading": "Need it? <em>Ask.</em>",
  "fund.apply.requestCta": "Request emergency support",
  "fund.apply.requestToast": "Emergency support form opens in a private flow",
  "fund.apply.seeGrantsCta": "See open grants & calls",

  // ── Open calls & commissions (StudioOpenCallsPage + Card + Skeleton) ──────
  // Chrome only — each call's title/brief/tags/meta/deadline and the amount
  // context below are content, API-sourced listings in live mode, and stay
  // English in both modes (§1). Filter `id`s are stable values — never the
  // translated label (§5.1 trap).
  "calls.hero.eyebrow": "From the council",
  "calls.hero.title": "Open <em>calls</em> & commissions.",
  "calls.hero.dek":
    "Briefs the council and co-op have funded. Apply inline: attach a <em>single track or release</em> from your catalogue. No cover letters, no portfolios; the work speaks.",

  "calls.filter.all": "All open",
  "calls.filter.commissions": "Commissions",
  "calls.filter.grants": "Grants",
  "calls.filter.residencies": "Residencies",
  "calls.filter.closingSoon": "Closing soon",
  "calls.filter.openCount":
    "<em>{count}</em> open · you've applied to {applied}",

  "calls.card.saveCta": "Save",
  "calls.card.applyCta": "Apply",
  "calls.card.saveToast": "Brief saved to your dashboard",
  "calls.card.attachLabel": "Attach one track from your catalogue",
  "calls.card.submitCta": "Submit application",
  "calls.card.cancelCta": "Cancel",
  "calls.card.singleTrackNote":
    "<em>One track only</em>: the council wants your single sharpest track.",
  "calls.card.submittedToast":
    "Application submitted. The council reviews in Monday triage",

  "calls.applied.statusPrefix": "Status ·",
  "calls.applied.decisionBy": "decision by {date}",
  "calls.applied.withdrawCta": "Withdraw",
  "calls.applied.withdrawnToast": "Application withdrawn",
  "calls.applied.flatLabel": "flat",

  // ── Set submission (StudioSetSubmissionPage + Matcher + Sidebar) ──────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  // The set `type` <select> stores stable ids as option values (§5.1).
  "setSubmission.hero.eyebrow": "New submission · DJ set or mix",
  "setSubmission.hero.title": "Submit a <em>set</em>.",
  "setSubmission.hero.dek":
    "Upload the long-form file, paste your tracklist with timecodes, and our matcher finds the source artists so <em>every track in the set is credited to its maker</em>. Unmatched tracks stay on hold until a source is confirmed.",

  "setSubmission.steps.file": "File",
  "setSubmission.steps.tracklist": "Tracklist & matcher",
  "setSubmission.steps.notes": "Notes & publish",

  "setSubmission.matcher.uploadedBadge": "Uploaded",
  "setSubmission.matcher.tracklistLabel":
    "Paste your tracklist · timecode · artist · title",
  "setSubmission.matcher.pasteHint":
    "One line per track. We accept most formats. <em>Re-run the matcher</em> whenever you edit.",
  "setSubmission.matcher.runCta": "Run the matcher",
  "setSubmission.matcher.matchingCta": "Matching…",
  "setSubmission.matcher.resultsLabel":
    "Matcher results · <em>resolved against the catalogue + PRO database</em>",
  "setSubmission.matcher.creditLine":
    "{who} · <em>credited to {firstName}</em>",
  "setSubmission.matcher.noSourceFound": "no source found · credit held",
  "setSubmission.matcher.matchedBadge": "Matched",
  "setSubmission.matcher.identifyCta": "Identify",
  "setSubmission.matcher.identifyToast": "Search opened to identify this track",
  "setSubmission.matcher.matchedResultToast":
    "{matched} of {total} matched · {held} held for clearance",

  "setSubmission.sidebar.detailsHeading": "Set <em>details</em>",
  "setSubmission.sidebar.titleLabel": "Set title",
  "setSubmission.sidebar.typeLabel": "Type",
  "setSubmission.sidebar.type.liveDjSet": "Live DJ set",
  "setSubmission.sidebar.type.studioMix": "Studio mix",
  "setSubmission.sidebar.type.recordedBroadcast": "Recorded broadcast",
  "setSubmission.sidebar.creditsPreviewHeading": "Credits <em>preview</em>",
  "setSubmission.sidebar.tracksInSet": "Tracks in set",
  "setSubmission.sidebar.matchedCredited": "Matched & credited",
  "setSubmission.sidebar.tracksCount_one": "{count} track",
  "setSubmission.sidebar.tracksCount_other": "{count} tracks",
  "setSubmission.sidebar.onHold": "On hold (unmatched)",
  "setSubmission.sidebar.holdNote":
    "Unmatched tracks <em>stay on hold</em> until the council's matcher clears them. The set goes live now, and each held track is credited the moment a source is confirmed.",
  "setSubmission.sidebar.submitCta": "Submit set",
  "setSubmission.sidebar.submittedToast":
    "Set submitted. Live now, held tracks waiting for a source",

  // ── Off-air landing (StudioOffAirPage + Hero) ─────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "offAir.page.browseNote":
    "The doors are shut, but the shelves are open. <em>Browse anything below</em>. It all still plays.",
  "offAir.hero.statusLine": "Off air · {time} in Lisbon",
  "offAir.hero.roomDark": "quiet tonight",
  "offAir.hero.title": "Studio is <em>off air</em> for the night.",
  "offAir.hero.untilDoors": "until doors",
  "offAir.hero.nextBroadcastLabel": "Next broadcast · {time} Lisbon",
  "offAir.hero.nightcapEyebrow": "Last night's night-cap",
  "offAir.hero.replayAria": "Replay the night-cap",
  "offAir.hero.replayingToast": "Replaying {title}",
  "offAir.hero.replaySuffix": "replay any time",

  // ── no-literal-string sweep: reusable ImageSlot placeholder captions ─────
  // Short fixed descriptor words shown while a cover/score/set/portrait
  // image loads. Chrome — decided by the component, not fetched per item.
  "media.coverLabel": "cover",
  "media.scoreLabel": "score",
  "media.setArtLabel": "set art",
  "media.portraitLabel": "portrait",
  "media.trackLabel": "track",

  // ── no-literal-string sweep: "by <artist> · <facts>" byline chrome ───────
  // The connector words ("by", "from", "·") are chrome; artist/album/year/
  // location values are content, passed in via `values`.
  "albumHero.byLine": "by <strong>{artist}</strong> · {year} · {location}",
  "artist.sidebar.newFollowers": "New followers",
  "liveNow.onAirTag": "on air",
  "liveNow.byFromLine": "by <strong>{artist}</strong> · from <em>{album}</em>",
  "liveNow.setBuilding.activityLine":
    "{curator} typed the up-next track <em>{elapsed}</em>",
  "live.ribbon.showLine": '"{title}" · programmed & hosted by {host}',
  "track.hero.byFromLine":
    "by <strong>{artist}</strong> · from <em>{album}</em> · {year}",
  "track.page.crumbLabel": "track {number}",

  // ── no-literal-string sweep: misc chrome eyebrows/labels ──────────────────
  "album.sidebar.savesThisMonth": "Saves this month",
  "set.page.programmedByEyebrow": "Set · programmed by {curator}",
  "sheet.checkout.leadSheetLabel": "Lead sheet: {title}",
  // ── Studio v1 (2026-10-08) ─────────────────────────────────────────────────
  "gate.loadingLabel": "Loading Studio",
  "kind.musician": "Musician",
  "kind.dj": "DJ",
  "releaseType.album": "Album",
  "releaseType.ep": "EP",
  "releaseType.single": "Single",
  "releaseType.mix": "Mix",
  "releaseStatus.draft": "Draft",
  "releaseStatus.published": "Published",
  "releaseStatus.taken_down": "Taken down",
  // CreatorDraftNotice in the release and draft episode editors
  "creatorDraftNote.body":
    "Our team can see this release while it's a draft or scheduled, so we can help if you get stuck",
  "creatorDraftNote.episodeBody":
    "Our team can see this episode while it's a draft, so we can help if you get stuck",
  "genre.pop": "Pop",
  "genre.hipHop": "Hip-hop",
  "genre.rAndB": "R&B",
  "genre.rock": "Rock",
  "genre.jazz": "Jazz",
  "genre.classical": "Classical",
  "genre.ambient": "Ambient",
  "genre.other": "Other",
  "facts.trackCount_one": "{count} track",
  "facts.trackCount_other": "{count} tracks",
  "facts.minutes_one": "{count} min",
  "facts.minutes_other": "{count} min",
  "card.playRelease": "Play {title}",
  "card.pauseRelease": "Pause {title}",
  "states.notFoundTitle": "We can't find that in Studio",
  "states.notFoundBody":
    "It may have been removed, or the link may be out of date",
  "states.backHomeCta": "Back to Studio home",

  // ── Liked songs (StudioLikeButton, StudioLikedPage) ─────────────────────
  "like.cta": "Like",
  "like.trackAria": "Like {title}",
  "like.addedToast": "Added to Liked songs",
  "like.removedToast": "Removed from Liked songs",
  // A hero's heart on an album, a show or a playlist (StudioCollectionLikeButton)
  "like.collectionAria": "Like {title}",
  "like.collectionUnlike": "Remove from your library",
  "like.collectionAddedToast": "Added to your library",
  "like.collectionRemovedToast": "Removed from your library",
  "like.blockedWithdrawn":
    "This release was taken down, so its tracks can't be liked",
  "liked.title": "Liked songs",
  "liked.page.privateNote": "Only you can see the songs you like here",
  "liked.page.emptyTitle": "Songs you like will show up here",
  "liked.page.emptyBody":
    "Tap the heart on any track to keep it in Liked songs",
  "liked.page.showMore": "Show more songs",
  "liked.page.loadingMore": "Loading more songs",
  "liked.page.loadMoreError": "We couldn't load more of your liked songs",
  "liked.page.undoCta": "Undo",
  "liked.page.unlikedManyToast_one": "Removed {count} song from Liked songs",
  "liked.page.unlikedManyToast_other": "Removed {count} songs from Liked songs",
  "liked.page.loadingAll_one": "Loading {count} song",
  "liked.page.loadingAll_other": "Loading all {count} songs",
  "liked.page.loadAllError":
    "We couldn't load all your liked songs, so nothing started. {reason}",
  "liked.page.loadingLabel": "Loading Liked songs",
  "liked.page.nothingToPlayToast":
    "None of your liked songs can play right now",
  "liked.page.cancelLoadingAria": "Cancel loading your liked songs",
  "liked.page.genreFilterLabel": "Filter by genre",
  "liked.page.noMatchInGenre": 'Nothing in {genre} matches "{query}"',
  "liked.page.showAllGenres": "Show all genres",
  "errors.generic":
    "That didn't work. Check your connection and try again in a moment",
  "errors.accessRequired": "Your Studio access has ended",
  "errors.notPersonaOwner": "Only the persona's owners can change its releases",
  "errors.personaKindNotAllowed":
    "Only music, podcast, spoken word and performance personas can release in Studio",
  "errors.releaseNotDraft": "This release is no longer a draft",
  "errors.releaseTypeMismatch": "That release type doesn't fit this persona",
  "errors.trackOrderMismatch":
    "The track list changed. Reload the page and try again",
  "errors.trackLimit": "A release holds up to 50 tracks",
  "errors.audioUnreadable":
    "We couldn't read this file. Try another MP3, M4A, WAV or AIFF",
  "errors.audioWrongOwner": "That file belongs to another persona",
  "shell.searchLabel": "Search Studio",
  "shell.searchPlaceholderLive": "search artists, releases, tracks…",
  "shell.searchPlaceholderShort": "search Studio…",
  "shell.accountLabel": "Your account, {name}",
  "shell.menu.artistPages": "Your artist pages",
  "shell.menu.settings": "Settings",
  "shell.menu.viewProfile": "Open your Studio profile",
  "shell.menu.backToQueerPulse": "Back to QueerPulse",
  "shell.menu.group.creator": "Creator",
  "shell.menu.group.staff": "Staff",
  "shell.menu.myClaims": "My claims",
  "shell.menu.myClaimsBadge_one": "{count} claim waiting for your reply",
  "shell.menu.myClaimsBadge_other": "{count} claims waiting for your reply",
  "shell.menu.counterWindows": "Claims on your tracks",
  "shell.menu.counterWindowsBadge_one": "{count} claim you can still answer",
  "shell.menu.counterWindowsBadge_other": "{count} claims you can still answer",
  "shell.menu.disputesBadge_one":
    "{count} takedown dispute waiting for our team",
  "shell.menu.disputesBadge_other":
    "{count} takedown disputes waiting for our team",
  "shell.menu.showAll_one": "Show all ({count})",
  "shell.menu.showAll_other": "Show all ({count})",
  "shell.menu.showFewer": "Show fewer",
  "shell.menu.attentionLabel": "{label}, something needs your attention",
  "shell.tabs.label": "Studio sections",
  "shell.sheet.label": "Studio menu",
  "shell.sheet.close": "Close menu",
  "shell.sustainShort": "Sustain",
  "shell.uploadCta": "Upload a release",
  "creator.avatarLabel": "Uploading as {name}",
  "creator.navLabel": "Creator pages",
  "rail.collapseLabel": "Collapse sidebar",
  "rail.expandLabel": "Expand sidebar",
  "accessError.pageTitle": "Studio access",
  "accessError.title": "We couldn't check your Studio access",
  "rail.v1.navLabel": "Studio",
  "rail.v1.search": "Search",
  "rail.v1.upload": "Upload a release",
  "home.hero.eyebrow": "Newest release",
  "home.hero.byLine": "by <strong>{artist}</strong> · {facts}",
  "home.empty.title": "No releases yet",
  "home.empty.body": "When artists and DJs publish music, it shows up here",
  "home.empty.uploadCta": "Upload your first release",
  "home.newReleases.title": "New <em>releases</em>",
  "home.newReleases.showMore": "Show more releases",
  "home.newReleases.loadingMore": "Loading more releases",
  "home.newReleases.loadMoreError": "We couldn't load more releases",
  "home.artists.title": "<em>Artists</em>",
  "artistPage.tabsLabel": "{name} sections",
  "artistPage.releaseCount_one": "{count} release",
  "artistPage.releaseCount_other": "{count} releases",
  "artistPage.playAll": "Play all releases by {name}",
  "artistPage.viewProfile": "View profile",
  "artistPage.noBio": "No bio yet",
  "artistPage.noReleases": "No releases yet",
  "artistPage.section.playlists": "Public <em>playlists</em>",
  "owner.heading": "Your releases",
  "owner.edit": "Edit",
  "owner.editAria": "Edit {title}",
  "owner.publish": "Publish",
  "owner.publishAria": "Publish {title}",
  "owner.unpublish": "Unpublish",
  "owner.unpublishAria": "Unpublish {title}",
  "owner.delete": "Delete",
  "owner.deleteAria": "Delete {title}",
  "owner.deleteTitle": "Delete {title}?",
  "owner.deleteBody": "The draft and its uploaded audio are deleted for good",
  "owner.deleteConfirm": "Delete draft",
  "owner.unpublishTitle": "Unpublish {title}?",
  "owner.unpublishBody":
    "It goes back to draft and leaves Studio until you publish it again",
  "owner.unpublishConfirm": "Unpublish release",
  "owner.takedownReason": "Taken down by our team: {reason}",
  "release.by": "by",
  "release.tabsLabel": "{title} sections",
  "release.tracklistLabel": "Tracklist of {title}",
  "release.playTrack": "Play {title}",
  "release.pauseTrack": "Pause {title}",
  "release.nowPlaying": "Now playing",
  "release.processing": "Processing",
  "release.explicit": "Explicit",
  "release.explicitShort": "E",
  "release.moreActions": "More actions",
  "release.report": "Report release",
  "release.queueFailedToast": "This release can't join your queue right now",
  "release.queueEmptyReason": "No tracks in this release are ready to play yet",
  "release.queuePartialToast": "Added {count} of {total} tracks to your queue",
  "release.queuePartialReasonToast":
    "Added {count} of {total} tracks. {reason}",
  "trackPage.byLine": "by <strong>{artist}</strong> · from <em>{release}</em>",
  "trackPage.crumbLabel": "Breadcrumb",
  "trackPage.lyricsHeading": "Lyrics",
  "trackPage.noLyrics": "No lyrics for this track",
  "trackPage.noCredits": "No credits yet",
  "trackPage.fullReleaseCta": "Open the full release",
  "searchPage.filter.releases": "Releases",
  "searchPage.filter.tracks": "Tracks",
  "searchPage.filtersLabel": "Filter results",
  "searchPage.inputLabel": "Search releases, tracks and artists",
  "searchPage.resultCount_one": "{count} result",
  "searchPage.resultCount_other": "{count} results",
  "searchPage.section.releases": "<em>Releases</em>",
  "searchPage.section.tracks": "<em>Tracks</em>",
  "searchPage.section.artists": "<em>Artists</em>",
  "searchPage.clearCta": "Clear search",
  "playerBar.regionLabel": "Studio player",
  "playerBar.play": "Play",
  "playerBar.pause": "Pause",
  // The word on the hero Play pill. It opens every hero play aria-label in
  // both languages, so voice control can say the word it sees.
  "playButton.play": "Play",
  "playButton.pause": "Pause",
  "playButton.cancel": "Cancel",
  "playerBar.previous": "Previous track",
  "playerBar.next": "Next track",
  "playerBar.seekLabel": "Seek",
  "playerBar.seekValue": "{elapsed} of {total}",
  "playerBar.seekValueChapter": "{elapsed} of {total}, {chapter}",
  "playerBar.seekValueUnknown": "Length not known yet",
  "playerBar.remainingTime": "−{time}",
  "playerBar.timeToggleLabel": "{time}, show time left",
  "playerBar.retry": "Retry the track",
  "playerBar.close": "Close player",
  "playerBar.autoplayBlocked": "Press play to start",
  "playerBar.offlinePaused":
    "You're offline, so playback paused. It picks up again if you're back online within 3 minutes",
  "uploadFlow.hero.title": "Put your music <em>out.</em>",
  "uploadFlow.hero.sub":
    "Three steps: the release, its tracks, then publish. MP3, M4A, WAV or AIFF, up to 50 MB a track",
  "uploadFlow.steps.label": "Upload steps",
  "uploadFlow.steps.release.nm": "Release",
  "uploadFlow.steps.release.sub": "title · cover · details",
  "uploadFlow.steps.tracks.nm": "Tracks",
  "uploadFlow.steps.tracks.sub": "audio · credits · lyrics",
  "uploadFlow.steps.publish.nm": "Publish",
  "uploadFlow.steps.publish.sub": "checks · rights",
  "uploadFlow.release.heading": "The <em>release</em>",
  "uploadFlow.release.sub":
    "Saved as a draft as you go. Nothing is public until you publish",
  "uploadFlow.release.personaLabel": "Release as",
  "uploadFlow.release.typeLabel": "Type",
  "uploadFlow.release.genresNonePicked": "No genre picked",
  "uploadFlow.release.genresCounter": "{count} of {max}",
  "uploadFlow.release.genresMain": "Main",
  "uploadFlow.release.genresFullReason": "You can pick up to {max} genres",
  "uploadFlow.release.genresRemove": "Remove {genre}",
  "uploadFlow.release.dateLabel": "Release date",
  "uploadFlow.release.dateHint": "Leave it empty to use the day you publish",
  "uploadFlow.release.descriptionLabel": "Liner notes",
  "uploadFlow.release.descriptionCount": "{count} of {max}",
  "uploadFlow.release.titleRequired": "Give the release a title",
  "uploadFlow.release.titleTooLong": "Keep the title to 120 characters",
  "uploadFlow.release.descriptionTooLong":
    "Keep the liner notes to 2,000 characters",
  "uploadFlow.release.continueCta": "Save and continue to tracks",
  "uploadFlow.release.saveChangesCta": "Save changes",
  "uploadFlow.release.changesSaved": "Changes saved",
  "uploadFlow.release.gaplessLabel": "Play without gaps",
  "uploadFlow.release.gaplessHint":
    "Each track runs straight into the next, even for listeners with crossfade on. Good for live albums and mixes",
  "uploadFlow.saving": "Saving",
  "uploadFlow.saved": "Draft saved",
  "uploadFlow.cover.heading": "Cover <em>art</em>",
  "uploadFlow.cover.placeholder": "No cover yet",
  "uploadFlow.cover.hint":
    "A square image works best. You can crop it after choosing",
  "uploadFlow.backToRelease": "Back to the release",
  "uploadFlow.continueToPublish": "Continue to publish",
  "uploadFlow.backToTracks": "Back to tracks",
  "uploadFlow.files.dropTitle":
    "Drop <em>MP3, M4A, WAV or AIFF</em> files here",
  "uploadFlow.files.accepts":
    "accepts · <em>MP3 · M4A · WAV · AIFF</em> · up to 50 MB a track · up to 50 tracks",
  "uploadFlow.files.chooseCta": "Choose audio files",
  "uploadFlow.files.empty": "No tracks yet. Add audio files to start",
  "uploadFlow.files.listLabel": "Tracks in this release",
  "uploadFlow.files.rejectType":
    "{fileName} isn't a file Studio can read. Use MP3, M4A, WAV or AIFF",
  "uploadFlow.files.rejectSize": "{fileName} is over 50 MB",
  "uploadFlow.files.rejectLimit":
    "{fileName} wasn't added: a release holds up to 50 tracks",
  "uploadFlow.files.errorUpload": "The upload stopped. Retry when you're ready",
  "uploadFlow.files.errorTooLarge": "This file is over 50 MB",
  "uploadFlow.files.errorRemove": "We couldn't remove this track",
  "uploadFlow.files.stage.queued": "Waiting",
  "uploadFlow.files.stage.creating": "Preparing",
  "uploadFlow.files.stage.uploading": "Uploading",
  "uploadFlow.files.stage.confirming": "Checking the file",
  "uploadFlow.files.stage.ready": "Ready",
  "uploadFlow.files.stage.failed": "Didn't upload",
  "uploadFlow.files.stage.noAudio": "No audio yet",
  "uploadFlow.files.progressLabel":
    "Upload progress for track {position}, {title}",
  "uploadFlow.files.stage.checking": "Checking file",
  "uploadFlow.files.stage.converting": "Converting to MP3",
  "uploadFlow.files.convertingHint": "Keep this tab open while it converts",
  "uploadFlow.files.convertProgressLabel":
    "Converting track {position}, {title}, to MP3",
  "uploadFlow.files.errorTooLong":
    "This file is too long to convert. It can run up to {maxMinutes} minutes",
  "uploadFlow.files.errorUnsupported":
    "We can't read this file. Export it as WAV, AIFF, MP3 or M4A",
  "uploadFlow.files.errorConvert":
    "We couldn't convert this file. Try again, or export it as MP3",
  "uploadFlow.files.wavNote":
    "WAV and AIFF files are converted to MP3 in your browser before they upload",
  "uploadFlow.files.moveUp": "Move track {position}, {title}, up",
  "uploadFlow.files.moveDown": "Move track {position}, {title}, down",
  "uploadFlow.files.retry": "Retry track {position}, {title}",
  "uploadFlow.files.remove": "Remove track {position}, {title}",
  "uploadFlow.files.editDetails": "Edit details",
  "uploadFlow.files.editDetailsFor": "Edit details for {title}",
  "uploadFlow.files.loadingDetails": "Loading the track's details",
  "uploadFlow.files.titleLabel": "Track title",
  "uploadFlow.files.creditsLabel": "Credits",
  "uploadFlow.files.creditName": "Credit {number} name",
  "uploadFlow.files.creditRole": "Credit {number} role",
  "uploadFlow.files.removeCredit": "Remove credit {number}",
  "uploadFlow.files.addCredit": "Add a credit",
  "uploadFlow.files.lyricsLabel": "Lyrics",
  "uploadFlow.files.explicitLabel": "This track has explicit lyrics",
  "uploadFlow.files.cancelDetails": "Cancel",
  "uploadFlow.files.saveDetails": "Save track details",
  "uploadFlow.publish.heading": "Ready to <em>publish?</em>",
  "uploadFlow.publish.sub":
    "Your release goes live in Studio for every member with Studio access",
  "uploadFlow.publish.missingLead": "Before you can publish:",
  "uploadFlow.publish.gap.title": "Give the release a title",
  "uploadFlow.publish.gap.cover": "Add a cover image",
  "uploadFlow.publish.gap.tracks": "Add at least one track with audio",
  "uploadFlow.publish.gap.pending": "Wait for every track to finish uploading",
  "uploadFlow.publish.gap.rights": "Confirm you hold the rights",
  "uploadFlow.publish.ready": "Everything is in place",
  "uploadFlow.publish.rightsLabel":
    "I own or control the rights to this recording and the cover, and I'm happy for QueerPulse members to stream it.",
  "uploadFlow.publish.publishCta": "Publish release",
  "uploadFlow.publish.publishing": "Publishing",
  "uploadFlow.published.title": "<em>{title}</em> is live",
  "uploadFlow.published.body":
    "Members with Studio access can play it now. You can unpublish it from your artist page at any time",
  "uploadFlow.published.openCta": "Open the release",
  "uploadFlow.published.anotherCta": "Upload another release",
  "uploadFlow.pageTitle": "New release",
  "uploadFlow.leave.uploadsBody":
    "Your uploads are still running. If you leave now they stop, and you'll need to add those files again",
  "uploadFlow.leave.detailsBody":
    "You have details that aren't saved yet. If you leave now, they're lost",
  "uploadFlow.leave.heldFilesBody":
    "Some files stopped before they finished uploading. If you leave now, you'll need to add them again",
  "uploadFlow.autosave.saving": "Saving…",
  "uploadFlow.autosave.savedAt": "Saved {time}",
  "uploadFlow.autosave.notSaved": "Not saved: {reason}",
  "uploadFlow.autosave.waitingForTitle": "Waiting for a title",
  "uploadFlow.release.noChangesReason":
    "Change a detail first, then save it here",
  "uploadFlow.release.personaLockedReason":
    "A release stays with the persona it was started under",
  "uploadFlow.errorSummary.lead_one": "Fix this before you continue:",
  "uploadFlow.errorSummary.lead_other":
    "Fix these {count} things before you continue:",
  "uploadFlow.steps.doneLabel": "(done)",
  "uploadFlow.steps.blocked.needsDraft": "Save the release details first",
  "uploadFlow.steps.blocked.alreadyLive": "This release is already live",
  "uploadFlow.cover.tooSmall":
    "This cover is {width} by {height} px. Use at least {min} by {min} px so it stays sharp on large screens",
  "uploadFlow.cover.addCta": "Add cover",
  "uploadFlow.cover.changeCta": "Change cover",
  "uploadFlow.locked.takenDownBodyNoReason":
    "Taken down by our team. The takedown notice in your notifications says why. It can't be edited while it's down",
  "uploadFlow.publish.done.title": "The release has a title",
  "uploadFlow.publish.done.cover": "The cover is in place",
  "uploadFlow.publish.done.rights": "You confirmed you hold the rights",
  "uploadFlow.publish.done.tracks": "At least one track has audio",
  "uploadFlow.publish.done.sources": "Every track credits its sources",
  "uploadFlow.publish.done.pending": "Every track finished uploading",
  "uploadFlow.files.cancelled":
    "Upload cancelled. Retry starts the same file again",
  "uploadFlow.files.errorPresignExpired":
    "The upload link expired before the file finished. Retry to get a fresh link",
  "uploadFlow.files.cancelUpload": "Cancel upload of track {position}, {title}",
  "uploadFlow.files.attachAudio": "Attach audio",
  "uploadFlow.files.attachAudioFor":
    "Attach audio to track {position}, {title}",
  "uploadFlow.files.reorderWaits":
    "Tracks can move once every track has finished preparing",
  "uploadFlow.files.moveAtEnd": "This track can't move further that way",
  "uploadFlow.files.retryAll_one": "Retry {count} track",
  "uploadFlow.files.retryAll_other": "Retry {count} tracks",
  "uploadFlow.files.offline":
    "You're offline. Uploads stop until you're back, then Retry picks them up",
  "uploadFlow.files.discardTitle": "Discard your changes to {title}?",
  "uploadFlow.files.discardBody":
    "The edits to this track's details aren't saved. Persona credits you added are already saved and stay",
  "uploadFlow.files.discardConfirm": "Discard changes",
  "uploadFlow.files.discardKeep": "Keep editing",
  "uploadFlow.files.titleRequired": "Title is required",
  "uploadFlow.files.creditNameLabel": "Name",
  "uploadFlow.files.creditRoleLabel": "Role",
  "uploadFlow.files.creditNeedsName":
    "Add a name for this credit, or clear its role",
  "uploadFlow.files.creditNeedsRole":
    "Add a role for this credit, or clear its name",
  "uploadFlow.files.personaCreditsSaveOwn":
    "Persona credits save as soon as you add them",
  "uploadFlow.files.pasteCut":
    "Only the first {max} characters fit, so the end of what you pasted was left out",
  "uploadFlow.noPersona.title": "Create a persona that works with Studio",
  "uploadFlow.noPersona.body":
    "To upload, you need a published persona set to Open to everyone, of one of these kinds: musician, DJ, podcaster, podcast producer, poet, spoken word artist, drag performer, performer, dancer, ballroom and vogue, or burlesque performer. Create one here, publish it from its editor, then come back to upload",
  "uploadFlow.noPersona.cta": "Create a persona",
  // The create wizard's step 1 subtitle when Studio opens it (StudioNoPersonaState).
  "uploadFlow.noPersona.modalSub":
    "Studio uploads need one of these crafts. Once it's created, publish it with Open to everyone and you can upload",
  // An artist persona the member owns that Studio does not list yet.
  "uploadFlow.noPersona.unfinishedBody":
    "{name} works with Studio. Publish it and set it to Open to everyone, then you can upload here",
  "uploadFlow.noPersona.unfinishedCta": "Open {name} in the editor",
  // Every persona slot taken and none of them an artist kind.
  "uploadFlow.noPersona.atCapBody":
    "You have {max} personas, the most one account can hold, and none of them works with Studio. Delete one you no longer use, then create one for Studio",
  "uploadFlow.noPersona.dashboardCta": "Go to your personas",
  "uploadFlow.side.eyebrow": "What happens to your files",
  "uploadFlow.side.title": "Your files, <em>ready to play</em>",
  "uploadFlow.side.body":
    "We store MP3 and M4A files as you upload them, and WAV and AIFF as the MP3 your browser makes. Only members with Studio access can stream them, and nobody can download them",
  "uploadFlow.side.formats.label": "Formats",
  "uploadFlow.side.formats.value": "MP3 · M4A · WAV · AIFF",
  "uploadFlow.side.size.label": "Per track",
  "uploadFlow.side.size.value": "up to 50 MB",
  "uploadFlow.side.listeners.label": "Who can listen",
  "uploadFlow.side.listeners.value": "members with Studio access",
  "uploadFlow.locked.takenDownTitle": "This release was taken down",
  "uploadFlow.locked.takenDownBody":
    "Taken down by our team: {reason}. It can't be edited while it's down",
  "uploadFlow.locked.backCta": "Back to your releases",
  // ── Studio v2 (2026-10-13) ──────────────────────────────────────────────────
  "errors.playlistLimit":
    "You can keep up to 100 playlists. Delete one to make another",
  "errors.playlistTrackLimit": "A playlist holds up to 500 tracks",
  "errors.playlistOrderMismatch": "This playlist just changed. Try again",
  "errors.playlistCreditNotAllowed":
    "That persona can't be credited right now. Show it as you, or pick another persona",
  "errors.playlistTrackUnavailable": "That track can't be added right now",
  "playlist.visibility.public": "Public",
  "playlist.visibility.connections": "Connections only",
  "playlist.visibility.private": "Private",
  "playlist.visibility.publicHint": "Any member with Studio can find it",
  "playlist.visibility.connectionsHint":
    "Only your connections with Studio can open it",
  "playlist.visibility.privateHint": "Only you",
  "playlist.dialog.createTitle": "New playlist",
  "playlist.dialog.editTitle": "Edit details",
  "playlist.dialog.visibilityTitle": "Change visibility",
  "playlist.dialog.nameLabel": "Name",
  "playlist.dialog.namePlaceholder": "Songs for the walk home",
  "playlist.dialog.nameRequired": "Give your playlist a name",
  "playlist.dialog.descriptionLabel": "Description",
  "playlist.dialog.descriptionHelper": "Optional. Up to 500 characters",
  "playlist.dialog.visibilityLegend": "Who can open it",
  "playlist.dialog.creditLegend": "Show as",
  "playlist.dialog.creditYou": "You",
  "playlist.dialog.creditYouHint": "Shows your name and photo",
  "playlist.dialog.creditPersonaHint":
    "Shows on {name}'s Studio page while it's public",
  "playlist.dialog.linkOnlyNote":
    "Your connections can open it by link. It stays off {name}'s page, so nobody learns who runs {name}",
  "playlist.dialog.createCta": "Create playlist",
  "playlist.dialog.saveDetailsCta": "Save details",
  "playlist.dialog.saveVisibilityCta": "Save visibility",
  "playlist.dialog.cancelCta": "Cancel",
  "playlist.dialog.createdToast": "Playlist created",
  "playlist.dialog.savedToast": "Changes saved",
  "playlist.delete.title": "Delete {name}?",
  "playlist.delete.body":
    "The playlist and its order go for good. The music stays in Studio",
  "playlist.delete.confirmCta": "Delete playlist",
  "playlist.delete.deletedToast": "Playlist deleted",
  "playlist.add.trackCta": "Add to playlist",
  "playlist.add.trackAria": "Add {title} to a playlist",
  "playlist.add.releaseCta": "Add release to playlist",
  "playlist.add.pickerTitle": "Add to playlist",
  "playlist.add.newPlaylistCta": "Create playlist",
  "playlist.add.listLabel": "Your playlists",
  "playlist.add.addToAria": "Add to {name}",
  "playlist.shareCta": "Share playlist",
  "playlist.add.addedToast": "Added to {name}",
  "playlist.add.alreadyThereToast": "Already in {name}",
  "playlist.add.empty": "You have no playlists yet. Make one to start",
  "playlist.add.loadError": "We couldn't load your playlists",
  "playlist.add.showMore": "Show more playlists",
  "playlist.add.loadingMore": "Loading more playlists",
  "playlist.add.loadMoreError": "We couldn't load more playlists",
  "playlist.add.nothingToAdd": "Every track here is already in {name}",
  "playlist.page.eyebrow": "Playlist",
  "playlist.page.byline": "By <strong>{name}</strong>",
  "playlist.page.playAria": "Play {name}",
  "playlist.page.pauseAria": "Pause {name}",
  "playlist.page.shuffleCta": "Shuffle playlist",
  "playlist.page.actionsLabel": "Playlist actions",
  "playlist.page.editDetails": "Edit details",
  "playlist.page.changeVisibility": "Change visibility",
  "playlist.page.deletePlaylist": "Delete playlist",
  "playlist.page.tracklistLabel": "Tracks in {name}",
  "playlist.page.emptyOwnerTitle": "Nothing in this playlist yet",
  "playlist.page.emptyOwnerBody":
    "Add tracks from a release, a track page or the player",
  "playlist.page.emptyViewerTitle": "Nothing here you can play right now",
  "playlist.page.findMusicCta": "Find music",
  "playlist.row.unavailable": "No longer available",
  "playlist.row.remove": "Remove {title} from the playlist",
  "playlist.row.removeUnavailable": "Remove entry {position} from the playlist",
  "playlist.row.moveUp": "Move {title} up",
  "playlist.row.moveDown": "Move {title} down",
  "playlist.row.movedStatus": "{title} is now number {position}",
  "playlist.row.removedToast": "Removed from the playlist",
  "playlist.row.orderError": "We couldn't save the new order. Try again",
  "playlist.row.removeError": "We couldn't remove that. Try again",
  "playlist.card.coverLabel": "Playlist cover",
  "playlist.card.nothingToPlay": "This playlist has no tracks you can play yet",
  "playlist.inThese.heading": "In these <em>playlists</em>",
  "searchPage.filter.playlists": "Playlists",
  "searchPage.section.playlists": "<em>Playlists</em>",
  "searchPage.genreLabel": "Genre",
  "searchPage.genreAny": "Any genre",
  "home.genres.heading": "Browse by <em>genre</em>",
  "home.genres.listLabel": "Genres",
  "browse.eyebrow": "Browse",
  "browse.title": "Releases in <em>{genre}</em>",
  "browse.titleNone": "Browse by <em>genre</em> or <em>mood</em>",
  "browse.pickPrompt": "Pick a genre or a mood to see its releases",
  "browse.noGenres": "Genres show up here once releases are published",
  "browse.gridLabel": "Releases in {genre}",
  "browse.empty.title": "No releases in {genre} yet",
  "browse.empty.body": "New music shows up here as artists publish it",
  "libraryLive.dek":
    "Your playlists, Liked songs, saved releases and the artists you follow",
  "libraryLive.tablistLabel": "Your library",
  "libraryLive.tabs.playlists": "Playlists",
  "libraryLive.tabs.releases": "Releases",
  "libraryLive.tabs.artists": "Artists",
  "libraryLive.yourPlaylists": "Your <em>playlists</em>",
  "libraryLive.savedPlaylists": "Saved <em>playlists</em>",
  "libraryLive.newPlaylistCta": "Create playlist",
  "libraryLive.empty.ownPlaylistsTitle": "No playlists of your own yet",
  "libraryLive.empty.playlistsBody":
    "Make one for a mood, a night or a person, then add tracks from anywhere in Studio",
  "libraryLive.empty.releasesTitle": "No saved releases yet",
  "libraryLive.empty.releasesBody":
    "Tap the heart on a release's page and it waits for you here",
  "libraryLive.empty.artistsTitle": "You don't follow any artists yet",
  "libraryLive.empty.artistsBody":
    "Follow an artist from their Studio page to keep them close",
  "libraryLive.showMoreArtists": "Show more artists",
  "libraryLive.loadingMoreArtists": "Loading more artists",
  "libraryLive.loadMoreArtistsError": "We couldn't load more artists",
  "libraryLive.sort.recent": "Recent",
  "libraryLive.sort.title": "Title",
  "libraryLive.sort.creator": "Creator",
  "libraryLive.sort.name": "Name",
  "libraryLive.sort.triggerAria": "Sort by {sort}",
  "libraryLive.sort.menuLabel": "Sort by",
  "libraryLive.filterLabel": "Filter your library",
  "libraryLive.filterPlaceholder": "Filter by title or creator",
  "libraryLive.noMatches.title": 'Nothing here matches "{query}"',
  "libraryLive.noMatches.body":
    "Try another word or clear the filter to see everything you kept",
  "libraryLive.clearFilterCta": "Clear filter",
  "libraryLive.savedReleases": "Saved <em>releases</em>",
  "libraryLive.showMoreSaves": "Show more saves",
  "libraryLive.loadingMoreSaves": "Loading more saves",
  "libraryLive.loadMoreSavesError": "We couldn't load more of your saves",
  "libraryLive.removeSavedAria": "Remove {title} from your library",
  "libraryLive.removedToast": "Removed {title} from your library",
  "libraryLive.undoCta": "Undo",
  "libraryLive.playlistNothingToPlay": "This playlist has nothing to play yet",
  "libraryLive.olderSavesError": "We couldn't load your older saves.",
  "numbers.eyebrow": "Your numbers",
  "numbers.title": "How <em>{name}</em> is reaching people",
  "numbers.dek":
    "Totals as they stand today. A play counts after 30 seconds of listening, and any count from 1 to 4 shows as Fewer than 5 so nobody can be singled out",
  "numbers.personaLabel": "Persona",
  "numbers.followers": "Followers",
  "numbers.tableCaption":
    "Plays, saves and public playlist inclusions for each release by {name}",
  "numbers.column.release": "Release",
  "numbers.column.saves": "Saves",
  "numbers.column.inPublicPlaylists": "In public playlists",
  "numbers.column.releaseOrTrack": "Release or track",
  "numbers.fewerThanFive": "Fewer than 5",
  "numbers.showTracks": "Show tracks for {title}",
  "numbers.hideTracks": "Hide tracks for {title}",
  "numbers.empty.title": "No releases yet",
  "numbers.empty.body": "Publish a release and its numbers show up here",
  "callsLive.eyebrow": "From Funding & Grants",
  "callsLive.title": "Open calls for <em>music</em>",
  "callsLive.dek":
    "Funders and organisers post their calls in Funding & Grants. These are the open ones tagged music",
  "callsLive.postCta": "Post an open call",
  "callsLive.allCallsCta": "See all open calls",
  "callsLive.musicCallsCta": "See music calls in Funding & Grants",
  "callsLive.listLabel": "Open calls for music",
  "callsLive.empty.title": "No open calls for music right now",
  "callsLive.empty.body":
    "New calls tagged music show up here as soon as they're posted",
  "callsLive.loadErrorTitle": "We couldn't load the open calls",
  "callsLive.showMore": "Show more calls",
  "callsLive.loadingMore": "Loading more calls",
  "callsLive.loadMoreError": "We couldn't load more calls",
  "callsLive.card.amount": "Amount",
  "callsLive.card.deadline": "Deadline",
  "callsLive.card.eligibility": "Who can apply",
  "callsLive.card.scope": "Where",
  "callsLive.card.notStated": "Not stated",
  "fundLive.eyebrow": "Solidarity",
  "fundLive.title": "Members helping <em>members</em>",
  "fundLive.body":
    "QueerPulse never handles money. When a musician needs help, members raise it through fundraisers in Funding & Grants, and moderators check each one before it goes up",
  "fundLive.safety":
    "Give only through a fundraiser's own link. If someone asks you for money in a message, report it",
  "fundLive.fundraisersCta": "See music fundraisers",
  "fundLive.startCta": "Start a fundraiser",
  "fundLive.callsCta": "See open calls for music",
  "rail.v2.library": "Library",
  "rail.v2.openCalls": "Open calls",
  "rail.v2.yourNumbers": "Your numbers",
  "creator.nav.yourNumbers": "Your numbers",
  // Demo-only showcase copy moved out of P2's data files (spec 3.2). Names
  // of people, places, tracks and releases stay literal in the data files.
  "demo.dashboard.stats.followers": "Followers",
  "demo.dashboard.stats.saves": "Saves · this month",
  "demo.dashboard.trend.followers": "<up>{delta}</up> this month",
  "demo.dashboard.trend.saves":
    "<up>{delta}</up> vs. last month · {active} of {total} tracks saved",
  "demo.dashboard.trend.earnings": "<up>{delta}</up> vs. last month",
  "demo.dashboard.trend.tips":
    "{tippers} tippers, {notes} with notes · <up>{recent} since you opened this page</up>",
  "demo.dashboard.curator.what.wednesdaySet":
    "<em>{title}</em> placed at track 6 of the Wednesday set",
  "demo.dashboard.curator.what.collection":
    "<em>{title}</em> added to “Songs to play your mother”",
  "demo.dashboard.curator.what.mix":
    "<em>{title}</em> included in Trans composers vol. iv",
  "demo.dashboard.curator.what.warmup":
    "<em>{title}</em> picked for the Monday warm-up",
  "demo.dashboard.curator.who.wednesdaySet":
    "Sara Marques · Vespertina vol. iv · “stay through the second verse”",
  "demo.dashboard.curator.who.collection":
    "Sara Marques · collection · rotated in for this week",
  "demo.dashboard.curator.who.mix":
    "D. Okoye · mix · liner-note paragraph about the lyric",
  "demo.dashboard.curator.who.warmup":
    "João Ribeiro · one track · “for the kitchen, 8pm”",
  "demo.dashboard.curator.today": "today",
  "demo.dashboard.otherCities": "{count} other cities",
  "demo.dashboard.peakSummary":
    "Peak: <em>{day}</em> · {total} saves and playlist adds · Sara picked you on Monday",
  "demo.dashboard.activity.title": "Saves and playlist adds",
  "demo.dashboard.activity.sub_one": "Last day",
  "demo.dashboard.activity.sub_other": "Last {count} days",
  "demo.dashboard.activity.rangeLabel": "Time range",
  "demo.dashboard.activity.rangeAria_one": "Show the last day",
  "demo.dashboard.activity.rangeAria_other": "Show the last {count} days",
  "demo.dashboard.activity.ariaLabel_one":
    "Bar chart of saves and playlist adds for the last day",
  "demo.dashboard.activity.ariaLabel_other":
    "Bar chart of saves and playlist adds per day for the last {count} days",
  "demo.dashboard.activity.today": "Today",
  "demo.dashboard.activity.showTable": "Show data table",
  "demo.dashboard.activity.hideTable": "Hide data table",
  "demo.dashboard.activity.tableCaption_one":
    "Saves and playlist adds for the last day",
  "demo.dashboard.activity.tableCaption_other":
    "Saves and playlist adds per day, last {count} days",
  "demo.dashboard.activity.dayColumn": "Day",
  "demo.dashboard.activity.countColumn": "Saves and playlist adds",
  "demo.dashboard.topTrackShare": "<em>{title}</em> is {percent}% of this",
  "demo.dashboard.goLivePlan": "Plan: {date} · premiere of {title}",
  "demo.calls.seat": "Council · seat {seat}",
  "demo.calls.tag.commission": "Commission",
  "demo.calls.tag.grant": "Grant",
  "demo.calls.tag.residency": "Residency",
  "demo.calls.tag.closesInDays_one": "Closes in {count} day",
  "demo.calls.tag.closesInDays_other": "Closes in {count} days",
  "demo.calls.tag.applied": "Applied · {date}",
  "demo.calls.meta.deadline": "Deadline {date}",
  "demo.calls.meta.oneTrack": "1 track",
  "demo.calls.meta.slotsFilled": "{filled} of {total} slots filled",
  "demo.calls.meta.releaseAsEvidence": "1 release as evidence",
  "demo.calls.meta.grantCount": "{count} grants",
  "demo.calls.meta.trackAndNote": "1 track and a note",
  "demo.calls.meta.oneResidency": "1 residency",
  "demo.calls.track.unreleased": "unreleased",
  "demo.calls.marsha.title": "A song for the <em>Marsha P. Johnson</em> night",
  "demo.calls.marsha.brief":
    "We're scoring the 28 June broadcast, a 90-minute live room marking the anniversary. We want <em>one original track</em>, 3 to 6 minutes, to carry the broadcast between speakers. Yours to keep and re-release",
  "demo.calls.marsha.amountLabel": "flat · paid on accept",
  "demo.calls.marsha.placeholder":
    "A sentence on why this one (optional). The council reads the work first",
  "demo.calls.spring.title": "Spring grant: <em>trans composers</em> strand",
  "demo.calls.spring.brief":
    "Unrestricted €1,200 grants for trans and non-binary composers working in any form: score, ambient, choral, club. We fund the <em>practice</em> itself, with nothing to deliver. Twelve grants this round",
  "demo.calls.spring.amountLabel": "unrestricted",
  "demo.calls.spring.placeholder":
    "What would the grant let you make? (optional)",
  "demo.calls.residency.title": "Casa do Comum: <em>August</em> residency",
  "demo.calls.residency.brief":
    "Two weeks in the Lisbon venue with keys, a PA and a recording rig, ending with one live broadcast from there. Travel and a €600 stipend covered. We're looking for someone who'll <em>use the space loudly</em>",
  "demo.calls.residency.amountLabel": "plus space and travel",
  "demo.calls.residency.placeholder":
    "How would you use the two weeks? (optional)",
  "demo.calls.applied.title": "Closing theme for the <em>Pride assembly</em>",
  "demo.calls.applied.brief":
    "You attached <em>{track}</em> and a note. Sara claimed it on {claimedOn} and decides by {decisionBy}. You'll hear back here, with a sentence either way",
  "demo.calls.applied.statusNote": "in review with Sara",
  "demo.fund.balanceNote":
    "Healthy: roughly four months of current disbursement. Anything above six months' runway rolls into the next quarterly grant round by council vote",
  "demo.fund.flowsDek":
    "Surplus sustainer fees, tip round-ups and gifts fill it, and <em>what you pay artists for their music, and your tips,</em> stay with the artists",
  "demo.fund.applyBody":
    "If you're a member having a hard month, the emergency strand is a short form and a fast yes: <em>no portfolio, no means test, no shame</em>. Transcribers and translators are paid per accepted piece, and grants open each quarter",
  "demo.fund.name.withheld": "Withheld by <em>request</em>",
  "demo.fund.name.helenaAndOthers": "Helena <em>Pinto</em> and 6 others",
  "demo.fund.name.lgpInterpreter": "LGP <em>interpreter</em>",
  "demo.fund.name.communityPool": "Community <em>pool</em> · 9 people",
  "demo.fund.name.instrument": "Instrument <em>replacement</em>",
  "demo.fund.name.captioning": "Captioning <em>pass</em> · 6 broadcasts",
  "demo.fund.name.springStrand": "Spring strand · <em>4 artists</em>",
  "demo.fund.note.teresa":
    "14 lead sheets accepted into the archive this fortnight",
  "demo.fund.note.rent":
    "One month's rent for a member between tours, confidential",
  "demo.fund.note.springGrants":
    "Spring first-release strand · €1,200 unrestricted each",
  "demo.fund.note.marshaSigning":
    "Signed the Marsha P. Johnson broadcast · 90 minutes",
  "demo.fund.note.lyricTranslations":
    "Lyric translations from PT to EN, PT to ES and FR to PT across 22 tracks",
  "demo.fund.note.accordion":
    "A stolen accordion, replaced within a week, no application form",
  "demo.fund.note.mateus":
    "First-release grant · debut EP mastering and artwork",
  "demo.fund.note.captions": "Live captions across the May broadcast season",
  "demo.fund.note.pedro": "Lyric translation from PT to EN across 8 tracks",
  "demo.fund.note.medical": "Medical costs for a member, confidential",
  "demo.fund.note.sofia": "9 lead sheets accepted into the archive",
  "demo.fund.note.springArtists":
    "First-release grants · €1,200 unrestricted each",

  // ── Studio open pages (2026-10-13): live Help, About, Terms,
  // Accessibility, Rights, the withdrawn view, disputes, player settings,
  // flag review and the live rail's utility group. The showcase keys above
  // stay for the demo.
  "errors.releaseWithdrawn": "This release was withdrawn",
  "errors.releaseNotTakenDown": "This release isn't taken down anymore",
  "errors.disputeAlreadyOpen": "A dispute is already waiting for our team",
  "errors.disputeLimitReached": "This release has used all three disputes",
  "errors.disputeNotOpen": "This dispute already has a decision",
  "errors.releaseHasOpenDispute":
    "This release has a dispute waiting. Restore it from Disputes",
  "errors.takedownReportMismatch": "That report isn't about this release",
  "errors.takedownReportNotOpen": "That report was already handled",
  "errors.trackWithheld": "This track is unavailable",
  "errors.trackExplicitLocked":
    "Our team marked this track explicit, so it stays marked",
  "errors.useCopyrightClaim": "Copyright claims have their own form",
  "errors.claimOwnTrack":
    "You can't file a copyright claim about your own track",
  "errors.claimExists": "You already have an open claim about this track",
  "errors.claimLimit": "You can have up to 10 open claims at a time",
  "errors.claimNotCountered":
    "You can reply once the artist sends a counter-notice",
  "errors.claimAlreadyReplied": "You already replied to this counter-notice",
  "errors.claimNotLive": "This claim is already closed",
  "errors.claimNotAccepted":
    "A counter-notice goes in once, while the track is held",
  "errors.claimNotSubmitted": "Our team already checked this claim",
  "errors.claimNotDecidable":
    "Our team can uphold or reject a claim once it is accepted",
  "errors.trackReportMismatch":
    "That report isn't a Studio report about this track",
  "errors.trackReportNotOpen": "That report was already handled",

  "helpLive.hero.eyebrow": "Studio help",
  "helpLive.hero.title": "How can we <em>help</em>?",
  "helpLive.hero.dek":
    "Answers about listening, sharing your music and staying safe in Studio. If something's missing, our team reads every message.",
  "helpLive.search.label": "Search Studio help",
  "helpLive.search.placeholder": "Try saving or playlists",
  "helpLive.search.clearCta": "Clear search",
  "helpLive.search.resultCount_one": "{count} answer matches",
  "helpLive.search.resultCount_other": "{count} answers match",
  "helpLive.search.emptyTitle": 'Nothing matches "{query}"',
  "helpLive.search.emptyBody": "Try another word, or ask our team below.",
  "helpLive.cat.listening.heading": "<em>Listening</em>",
  "helpLive.cat.listening.blurb": "Playback, saves, playlists and following",
  "helpLive.cat.sharing.heading": "Sharing your <em>music</em>",
  "helpLive.cat.sharing.blurb":
    "Uploads, personas, the rights checkbox and your stats",
  "helpLive.cat.safety.heading": "Safety and <em>rights</em>",
  "helpLive.cat.safety.blurb": "Reports, takedowns and disputes",
  "helpLive.cat.money.heading": "Money and <em>tips</em>",
  "helpLive.faq.whatIsStudio.q": "What is Studio, and who can use it?",
  "helpLive.faq.whatIsStudio.a":
    "Studio is the place on QueerPulse where queer artists share their music with members. Listening is free, artists can sell their music directly, and it's open to members our team has given Studio access.",
  "helpLive.faq.tracking.q": "Does Studio keep track of what I listen to?",
  "helpLive.faq.tracking.a":
    "Yes, privately. Studio keeps a listening history only you can see, on <a>Your listening</a>, where you can pause or clear it. Artists see total plays, with any count from 1 to 4 shown as Fewer than 5, and your name only if you turn on Show me among their top listeners on their page.",
  "helpLive.faq.saving.q": "How do likes, playlists and following work?",
  "helpLive.faq.saving.a":
    "Tap the heart on an album, a show or a playlist and it waits for you in your <a>library</a> and in the list beside your playlists. Tap the heart on a track and it goes into Liked songs, which only you can see. A playlist can be Public, Connections only or Private, and you can change that any time. Follow an artist from their page to hear when they put out something new.",
  "helpLive.faq.playerSettings.q": "Can I change how the player behaves?",
  "helpLive.faq.playerSettings.a":
    "Yes. In <a>Settings</a> you can turn off Autoplay next, hide tracks marked explicit and, on most browsers, set a crossfade between tracks. Your choices follow you to every device.",
  "helpLive.faq.uploading.q": "How do I upload a release?",
  "helpLive.faq.uploading.a":
    "Start from <a>Upload a release</a>, choose one of your musician or DJ personas, add your tracks, cover and details, tick the rights checkbox and publish. Your release appears under the persona's name.",
  "helpLive.faq.rightsCheckbox.q": "What does the rights checkbox mean?",
  "helpLive.faq.rightsCheckbox.a":
    "Ticking it confirms that you own or control the rights to every recording and composition in the release, and that its credits are accurate. If that changes, unpublish the release from your artist page.",
  "helpLive.faq.stats.q": "What do my stats show?",
  "helpLive.faq.stats.a":
    "<a>Your numbers</a> shows plays, followers, saves, the public playlists that include your music and your top listeners. Any count from 1 to 4 reads Fewer than 5, so nobody can work out who did what.",
  "helpLive.faq.reporting.q": "How do I report a release?",
  "helpLive.faq.reporting.a":
    "Open the release, then More actions, then Report release. Our team reviews every report, and if a release breaks the rules, they take it down and the artist sees why.",
  "helpLive.faq.takedown.q": "What happens when a release is taken down?",
  "helpLive.faq.takedown.a":
    "It goes offline for listeners straight away. Anyone who saved it keeps it in their library, marked withdrawn. The artist reads our team's reason on the release page and can dispute it there.",
  "helpLive.faq.dispute.q": "How do I dispute a takedown?",
  "helpLive.faq.dispute.a":
    "Open your release. Under the takedown reason, write a note to our team and send it. Their reply appears in the same place, and if they agree, the release comes back. Each release can be disputed up to three times, one at a time. More on <a>Rights and takedowns</a>.",
  "helpLive.contact.heading": "Still <em>stuck</em>?",
  "helpLive.contact.team.title": "Contact <em>our team</em>",
  "helpLive.contact.team.body":
    "Send a message through the contact form and our team picks it up from there.",
  "helpLive.contact.team.action": "Contact our team",
  "helpLive.contact.email.title": "<em>Email</em> us",
  "helpLive.contact.email.body":
    "Write to hello@queerpulse.com from your own mail app.",
  "helpLive.contact.email.action": "Email our team",
  "helpLive.contact.platform.title": "QueerPulse <em>help</em>",
  "helpLive.contact.platform.body":
    "Questions about your account and staying safe across QueerPulse.",
  "helpLive.contact.platform.action": "Open QueerPulse help",
  "helpLive.pageTitle": "Help",

  "aboutLive.hero.eyebrow": "About Studio",
  "aboutLive.hero.title": "Music by queer artists, for <em>our members</em>.",
  "aboutLive.hero.lede":
    "Studio is a place on QueerPulse where queer artists share their music with members. Listening is free, artists can sell their music to you directly, and what you play stays private.",
  "aboutLive.sec.today.num": "01: what it is today",
  "aboutLive.sec.today.heading": "What Studio <em>does</em>",
  "aboutLive.sec.today.p1":
    "Artists upload releases under a musician or DJ persona and publish them for members with Studio access. Listeners play, save, make playlists and follow the artists they love.",
  "aboutLive.sec.today.p2":
    "Listening and uploading are free. Artists can put a price on albums, EPs, singles and tracks, and buyers pay them directly, so the money goes straight to the artist and QueerPulse takes no cut.",
  "aboutLive.sec.privacy.num": "02: what you control",
  "aboutLive.sec.privacy.heading": "Listening stays <em>yours</em>",
  "aboutLive.sec.privacy.p1":
    "Your listening history is yours: only you can see it, and you can pause or clear it any time. Artists see total plays, and your name only if you choose to show it.",
  "aboutLive.sec.privacy.p2":
    "Artists see plays, followers, saves and public playlist inclusions, and any count from 1 to 4 shows as Fewer than 5.",
  "aboutLive.sec.control.num": "03: how artists keep control",
  "aboutLive.sec.control.heading": "Your music, <em>your call</em>",
  "aboutLive.sec.control.p1":
    "Unpublish any release from your artist page whenever you like. Reports from members go to our team, and if they take a release down, you read their reason on the release and can dispute it there.",
  "aboutLive.sec.personas.num": "04: personas and privacy",
  "aboutLive.sec.personas.heading": "Release under your <em>artist name</em>",
  "aboutLive.sec.personas.p1":
    "Your releases, the playlists you credit to a persona and your stats all sit under the persona's name. Members with Studio access see your releases, your tracks, your artist name and your public playlists.",
  "aboutLive.sec.next.num": "05: where it's going",
  "aboutLive.sec.next.heading": "Growing with <em>the people who use it</em>",
  "aboutLive.sec.next.p1":
    "Members can now buy music straight from artists, and the money goes to the artist outside QueerPulse; next, we'd like to give members a say in how Studio runs. We'll build that in the open with our community, and we'll say so here when something is real.",
  "aboutLive.showcase.heading": "The <em>co-op vision</em>",
  "aboutLive.showcase.dek":
    "What a co-op Studio could look like, shown in this demo.",
  "aboutLive.cta.title": "Come and <em>listen</em>.",
  "aboutLive.cta.body":
    "Start on Studio home, or read the short Studio terms first.",
  "aboutLive.cta.open": "Open Studio",
  "aboutLive.cta.terms": "Read the Studio terms",
  "aboutLive.credits.heading": "Open source",
  "aboutLive.credits.lame":
    "Audio is encoded to MP3 with the <a>LAME MP3 encoder</a> (licensed under the GNU Lesser General Public License, LGPL), used through @mediabunny/mp3-encoder (Mozilla Public License 2.0).",

  "termsLive.eyebrow": "Studio terms",
  "termsLive.title": "The short <em>Studio addendum</em>",
  "termsLive.lede":
    "These add to the QueerPulse terms and privacy policy, which apply to Studio in full. They cover what's particular to Studio.",
  "termsLive.sec.rights.num": "01: the rights checkbox",
  "termsLive.sec.rights.heading": "When you <em>publish</em>",
  "termsLive.sec.rights.p1":
    "Before you publish, you confirm that you own or control the rights to every recording and composition in the release, and that its credits are accurate. You keep your rights. While the release is published, members with Studio access can stream it on QueerPulse.",
  "termsLive.sec.visible.num": "02: what members see",
  "termsLive.sec.visible.heading": "What's <em>visible</em>",
  "termsLive.sec.visible.p1":
    "Members with Studio access can see your releases and tracks, your artist name and your public playlists. A playlist set to Connections only or Private stays with the people that setting allows.",
  "termsLive.sec.stored.num": "03: what Studio stores",
  "termsLive.sec.stored.heading": "What we <em>keep</em>",
  "termsLive.sec.stored.p1":
    "Studio stores your releases with their audio and artwork, your saves, playlists and follows, your player settings, your listening history while it is on (kept for 13 months, and you can clear it), the artist pages where you chose to show yourself among the top listeners, your purchases (the item, the amount, the reference code, the name on the payment you gave, the status and your supporter wall choice), the ways to get paid an artist lists, any dispute you send along with our team's reply, and any copyright claim or counter-notice you send along with our team's decision. Play totals for each track carry no name.",
  "termsLive.sec.stored.p2":
    "Everything Studio stores about you is covered by the QueerPulse <a>privacy policy</a>.",
  "termsLive.sec.takedown.num": "04: takedowns and disputes",
  "termsLive.sec.takedown.heading": "If something <em>goes wrong</em>",
  "termsLive.sec.takedown.p1":
    "You can unpublish your own release at any time. If a member reports a release, our team reviews it and may take it down. You see their reason on the release page and can dispute it there, one dispute at a time and up to three for each release. Our team replies on the release, and if they agree, it comes back.",
  "termsLive.sec.takedown.claims":
    "A copyright claim about a single track has its own form, open to signed-in members. Filing it changes nothing until our team accepts it. Then that track alone goes offline, and its artist can send one counter-notice, which the claimant can answer once. The artist reads the claim without learning who filed it. Once a claim is accepted, our team can decide it at any point: upholding it keeps the track offline, and rejecting it brings the track back unless another claim holds it. Until that final decision, the claimant can withdraw the claim.",
  "termsLive.questions":
    "Questions about these terms? Write to <a>hello@queerpulse.com</a> or <link>contact our team</link>.",
  "termsLive.full.title": "The full terms",
  "termsLive.full.body":
    "The QueerPulse terms and privacy policy apply to Studio too.",
  "termsLive.full.termsCta": "Read full terms",
  "termsLive.full.privacyCta": "Read the privacy policy",

  "accessibilityLive.eyebrow": "Accessibility in Studio",
  "accessibilityLive.title": "What works <em>today</em>",
  "accessibilityLive.lede":
    "This list covers only what Studio does right now. When something isn't there yet, we say so.",
  "accessibilityLive.status.live": "Live",
  "accessibilityLive.status.notYet": "Not yet",
  "accessibilityLive.group.player.heading": "The <em>player</em>",
  "accessibilityLive.group.player.dek":
    "Made to work with a keyboard, a screen reader and your device's own media controls.",
  "accessibilityLive.item.mediaKeys.heading":
    "Media keys and the <em>lock screen</em>",
  "accessibilityLive.item.mediaKeys.body":
    "Play, pause, next and previous work from your keyboard's media keys, your headphones and your phone's lock screen.",
  "accessibilityLive.item.seek.heading": "A <em>keyboard</em> seek bar",
  "accessibilityLive.item.seek.body":
    "The progress bar is a slider. Arrow keys move through the track, and Home and End jump to its start and end.",
  "accessibilityLive.item.labels.heading": "Labelled <em>controls</em>",
  "accessibilityLive.item.labels.body":
    "Every player button has a name your screen reader reads out, and playback problems are announced in a live region.",
  "accessibilityLive.group.display.heading": "Display and <em>language</em>",
  "accessibilityLive.group.display.dek":
    "Studio follows the choices you've made for QueerPulse.",
  "accessibilityLive.item.motion.heading": "Respects <em>reduced motion</em>",
  "accessibilityLive.item.motion.body":
    "When your device or QueerPulse asks for reduced motion, panels and lists stop sliding and resizing. Now playing keeps a 0.2 second fade, so it still opens and closes smoothly.",
  "accessibilityLive.item.themes.heading": "Light and <em>dark</em> themes",
  "accessibilityLive.item.themes.body":
    "Studio follows your QueerPulse theme. Switch it from the account menu or from Studio settings.",
  "accessibilityLive.item.languages.heading": "English and <em>Portuguese</em>",
  "accessibilityLive.item.languages.body":
    "Studio's own words come in English and Portuguese. Titles and lyrics stay as the artist wrote them.",
  "accessibilityLive.group.words.heading": "Words and <em>captions</em>",
  "accessibilityLive.group.words.dek": "What you can read while you listen.",
  "accessibilityLive.item.lyrics.heading": "Lyrics as <em>text</em>",
  "accessibilityLive.item.lyrics.body":
    "When an artist adds lyrics, the track page shows them as text you can read at your own pace.",
  "accessibilityLive.item.captions.heading": "<em>Captions</em>",
  "accessibilityLive.item.captions.body":
    "Studio has no spoken content to caption yet, so there are no captions today.",
  "accessibilityLive.contact.title": "Found a <em>barrier</em>?",
  "accessibilityLive.contact.body":
    "Tell our team what got in your way and where. We treat it as a bug to fix.",
  "accessibilityLive.contact.cta": "Report an accessibility problem",
  "accessibilityLive.pageTitle": "Accessibility",
  "accessibilityLive.shortcutsNote":
    "The single-letter shortcuts can be turned off in Settings.",
  "accessibilityLive.shortcutsNoteCta": "Open Settings",

  "rightsLive.eyebrow": "Rights and takedowns",
  "rightsLive.title": "How rights <em>work</em> in Studio",
  "rightsLive.dek":
    "What you confirm when you publish, what happens after a report or a copyright claim, and how to dispute a takedown.",
  "rightsLive.sec.checkbox.heading": "The rights <em>checkbox</em>",
  "rightsLive.sec.checkbox.body":
    "Before publishing, you confirm that you own or control the rights to every recording and composition in the release, and that the credits are accurate.",
  "rightsLive.sec.report.heading": "After a <em>report</em>",
  "rightsLive.sec.report.body":
    "Our team reviews every report. If a release breaks the rules, they take it down and write a reason you can read on the release page. The release goes offline for listeners, and anyone who saved it keeps it in their library, marked withdrawn.",
  "rightsLive.sec.dispute.heading": "How to <em>dispute</em>",
  "rightsLive.sec.dispute.body":
    "Open your release. Under the takedown reason, write a note to our team and send it. Their reply appears on the release, and if they agree, it comes back. You can dispute each release up to three times, one at a time.",
  "rightsLive.sec.claims.heading": "Copyright <em>claims</em>",
  "rightsLive.sec.claims.body":
    "Signed-in members file a copyright claim from Report track on the track itself. Nothing changes while our team checks it. If our team accepts it, only that track goes offline, and its artist can send one counter-notice, which the claimant can answer once. The artist reads the claim without learning who filed it. Our team can uphold or reject an accepted claim at any point, and both sides read why. Until that final decision, the claimant can withdraw it.",
  "rightsLive.sec.unpublish.heading": "Unpublish <em>any time</em>",
  "rightsLive.sec.unpublish.body":
    "You can unpublish your own release from your artist page whenever you like. It goes back to a draft that only you and the persona's co-owners can see.",
  "rightsLive.cta": "Open your releases",

  "withdrawnLive.eyebrow": "Studio",
  "withdrawnLive.title": "This release was <em>withdrawn</em>",
  "withdrawnLive.body":
    "Our team took it down after a report. If you saved it, it stays in your library marked withdrawn.",
  "withdrawnLive.homeCta": "Back to Studio home",
  "withdrawnLive.rightsCta": "How takedowns work",
  "withdrawnLive.rowLabel": "Withdrawn",

  "dispute.heading": "Dispute this takedown",
  "dispute.yourDisputeHeading": "Your dispute",
  "dispute.intro":
    "If you think our team got this wrong, tell them why. They read every dispute and reply here.",
  "dispute.openFormCta": "Write a dispute",
  "dispute.againCta": "Write another dispute",
  "dispute.closeFormCta": "Close the dispute form",
  "dispute.noteLabel": "Your note to our team",
  "dispute.noteHint":
    "Up to 1,000 characters. Share anything that helps, like who holds the rights.",
  "dispute.noteRequired": "Write a note before you send it",
  "dispute.sendCta": "Send dispute",
  "dispute.sendingCta": "Sending dispute",
  "dispute.sentToast": "Dispute sent to our team",
  "dispute.openStatus": "Dispute sent, our team will reply here",
  "dispute.sentOn": "Sent {date}",
  "dispute.yourNoteLabel": "Your note",
  "dispute.upheldTitle": "Our team restored this release",
  "dispute.rejectedTitle": "Our team kept this release down",
  "dispute.replyLabel": "Their reply",
  "dispute.decidedOn": "Decided {date}",
  "dispute.limitReached": "This release has used all three disputes.",
  "dispute.limitNextStep":
    "Our team can still look at this release. Read your rights, or write to us with what changed.",

  "claimPanel.heading": "Copyright claim",
  "claimPanel.trackLabel": "About {title}",
  "claimPanel.withheldBanner":
    "This track is offline while our team reviews a copyright claim",
  "claimPanel.acceptedOn": "Held since {date}",
  "claimPanel.acceptedDate": "Accepted {date}",
  "claimPanel.withheldBannerRelease_one":
    "One track on this release is offline while our team reviews a copyright claim",
  "claimPanel.withheldBannerRelease_other":
    "{count} tracks on this release are offline while our team reviews copyright claims",
  "claimPanel.offlineTag": "Offline",
  "claims.ownerStatus.accepted": "Offline while our team reviews",
  "claims.ownerStatus.countered": "Counter-notice sent",
  "claims.ownerStatus.upheld": "Claim upheld",
  "claims.ownerStatus.rejected": "Claim rejected, back online",
  "claims.staffStatus.submitted": "New",
  "claims.staffStatus.accepted": "Waiting for the artist",
  "claims.staffStatus.countered": "Counter-notice in",
  "claims.staffStatus.declined": "Declined",
  "claims.staffStatus.upheld": "Upheld",
  "claims.staffStatus.rejected": "Rejected",
  "claims.staffStatus.withdrawn": "Withdrawn",
  "claimPanel.claimedWork": "Claimed original",
  "claimPanel.claimedDetails": "What the claim says",
  "claimPanel.originalLink": "Open the original",
  "claimPanel.filedByLabel": "Who filed it",
  "claimPanel.claimantRole.rights_holder": "The rights holder",
  "claimPanel.claimantRole.authorised": "Someone the rights holder authorised",
  "claimPanel.counterOpenCta": "Write a counter-notice",
  "claimPanel.counterCloseCta": "Close the counter-notice form",
  "claimPanel.counterLabel": "Your counter-notice",
  "claimPanel.counterHint":
    "Say why this track is yours to publish. You can send one, and our team reads it before deciding",
  "claimPanel.counterGoodFaith":
    "I believe in good faith that this track was taken offline by mistake",
  "claimPanel.counterRequired": "Write your counter-notice before you send it",
  "claimPanel.goodFaithRequired": "Tick the statement to send it",
  "claimPanel.counterCta": "Send counter-notice",
  "claimPanel.counterSending": "Sending counter-notice",
  "claimPanel.counterSentToast": "Counter-notice sent to our team",
  "claimPanel.claimantReplyHeading": "Reply from the claimant",
  "claimPanel.reviewing":
    "Our team is reviewing the claim and your counter-notice",
  "claimPanel.outcome.upheld":
    "Our team upheld the claim. The track stays offline",
  "claimPanel.outcome.rejected":
    "Our team rejected the claim. The track is back online",
  "claimPanel.decidedOn": "Decided {date}",
  "claimPanel.staffNoteHeading": "Note from our team",
  "claimPanel.upheldNextStep":
    "The track stays offline. If you think our team got this wrong, read your rights or write to us.",

  "claims.form.eyebrow": "Studio rights",
  "claims.form.title": "Copyright claim",
  "claims.form.dek":
    "Tell our team which work this track copies. Nothing changes for listeners until our team checks it",
  "claims.form.subject": "About {title} by {artist}",
  "claims.form.subjectUnknown": "About a Studio track",
  "claims.form.pickTrack": "Which track is the claim about?",
  "claims.form.pickTrackRow": "{number}. {title}",
  "claims.form.pickTrackLoading": "Loading the tracks",
  "claims.form.pickTrackError": "We couldn't load the tracks.",
  "claims.form.pickTrackEmpty":
    "No track on this release can take a claim right now",
  "claims.form.roleLegend": "Who are you to this work?",
  "claims.form.role.rightsHolder": "I am the rights holder",
  "claims.form.role.authorised": "I'm authorised by the rights holder",
  "claims.form.originalWork.label": "Original work (title and creator)",
  "claims.form.originalLink.label": "Link to the original (optional)",
  "claims.form.originalLink.hint": "A web address that starts with https://",
  "claims.form.details.label": "What the track copies and where",
  "claims.form.details.hint": "Timestamps help our team find it",
  "claims.form.goodFaith":
    "I believe in good faith that this use is not authorised, and the details I've given are accurate",
  "claims.form.submit": "Send claim",
  "claims.form.sending": "Sending claim",
  "claims.form.sent": "Claim sent. Our team will check it",
  "claims.form.throttled":
    "You've sent several claims in the last hour. Try again later",
  "claims.form.trackGone": "That track isn't on Studio anymore",
  "claims.form.error.roleRequired": "Pick who you are to this work",
  "claims.form.error.originalWorkRequired": "Name the original work",
  "claims.form.error.originalWorkTooLong":
    "Keep the original work under 200 characters",
  "claims.form.error.linkInvalid": "Use a link that starts with https://",
  "claims.form.error.linkTooLong": "Keep the link under 500 characters",
  "claims.form.error.detailsRequired": "Say what the track copies",
  "claims.form.error.detailsTooLong": "Keep the details under 2000 characters",
  "claims.form.error.goodFaithRequired": "Tick the statement to send the claim",
  "claims.form.error.pickTrack": "Pick the track first",
  "claims.form.pickTrackRetry": "Reload tracks",
  "claims.mine.title": "Your copyright claims",
  "claims.mine.dek":
    "What you filed, what the artist answered and what our team decided",
  "claims.mine.empty": "You haven't filed any claims",
  "claims.mine.emptyBody":
    "To file one, open the track and choose Report track",
  "claims.mine.emptyCta": "How claims work",
  "claims.mine.status.submitted": "Waiting for our team",
  "claims.mine.status.accepted": "Accepted",
  "claims.mine.status.declined": "Declined",
  "claims.mine.status.countered": "Counter-notice sent",
  "claims.mine.status.upheld": "Upheld",
  "claims.mine.status.rejected": "Rejected",
  "claims.mine.status.withdrawn": "Withdrawn",
  "claims.mine.filedOn": "Filed {date}",
  "claims.mine.counterHeading": "The artist's counter-notice",
  "claims.mine.yourReplyHeading": "Your reply",
  "claims.mine.staffNoteHeading": "Note from our team",
  "claims.mine.replyCta": "Write a reply",
  "claims.mine.replyCloseCta": "Close the reply form",
  "claims.mine.replyLabel": "Your reply to the counter-notice",
  "claims.mine.replyHint":
    "You can reply once. Our team reads it before deciding",
  "claims.mine.replyRequired": "Write your reply before you send it",
  "claims.mine.replySend": "Send reply",
  "claims.mine.replySending": "Sending reply",
  "claims.mine.replySentToast": "Reply sent to our team",
  "claims.mine.withdrawCta": "Withdraw claim",
  "claims.mine.withdrawConfirm": "Withdraw this claim?",
  "claims.mine.withdrawBody":
    "Our team stops reviewing it, and a track it holds offline comes back unless another claim holds it",
  "claims.mine.withdrawnToast": "Claim withdrawn",
  "claims.mine.loadMore": "Show more claims",
  "claims.mine.loadingMore": "Loading more claims",
  "claims.mine.loadError": "We couldn't load your claims",
  "claims.mine.decidedOn": "Decided {date}",
  "claims.mine.outcome.submitted":
    "Our team reads every claim. We'll tell you here once we decide.",
  "claims.mine.outcome.accepted":
    "We took the track offline. The artist can send a counter-notice, and you'll see it here.",
  "claims.mine.outcome.countered":
    "The artist sent a counter-notice. You can reply once, then our team reads both sides and decides.",
  "claims.mine.outcome.counteredReplied":
    "You replied to the counter-notice. Our team is reading both sides and decides next.",
  "claims.mine.outcome.upheld":
    "Our team upheld your claim, so the track stays offline.",
  "claims.mine.outcome.rejected":
    "Our team rejected the claim, so it no longer keeps the track offline",
  "claims.mine.outcome.declined":
    "Our team declined the claim, so it doesn't keep the track offline",
  "claims.mine.outcome.withdrawn":
    "You withdrew this claim, and it no longer affects the track.",
  "claims.mine.replyCheck": "Check reply",
  "claims.mine.replyReviewHeading": "Your reply, as our team will read it",
  "claims.mine.replyReviewNote":
    "You can send one reply to this counter-notice, and it can't be changed once sent.",
  "claims.mine.replyEdit": "Edit reply",

  "settingsLive.eyebrow": "Your Studio settings",
  "settingsLive.title": "How Studio <em>plays</em> for you",
  "settingsLive.dek":
    "Playback and content settings follow you to every device where you use Studio.",
  "settingsLive.playback.label": "Playback",
  "settingsLive.playback.title": "What plays <em>next</em>",
  "settingsLive.autoplay.heading": "Autoplay next",
  "settingsLive.autoplay.body":
    "When a track ends, the next one in your queue starts. Turn it off to stop after each track.",
  "settingsLive.crossfade.heading": "Crossfade",
  "settingsLive.crossfade.body":
    "Blend the end of one track into the start of the next while Autoplay next is on.",
  "settingsLive.crossfade.sliderLabel": "Crossfade length",
  "settingsLive.crossfade.off": "Off",
  "settingsLive.crossfade.seconds": "{count} s",
  "settingsLive.crossfade.valueText_one": "{count} second",
  "settingsLive.crossfade.valueText_other": "{count} seconds",
  "settingsLive.content.label": "Content",
  "settingsLive.content.title": "What you <em>hear</em>",
  "settingsLive.hideExplicit.heading": "Hide explicit tracks",
  "settingsLive.hideExplicit.body":
    "Tracks marked explicit leave your queue and show greyed out in lists. Turn it off to bring them back straight away.",
  "settingsLive.askBeforeWarnings.heading": "Ask before warned tracks",
  "settingsLive.askBeforeWarnings.body":
    "We'll pause before a track tagged with a content warning and ask first.",
  "settingsLive.claims.label": "Rights",
  "settingsLive.claims.title": "Your <em>claims</em>",
  "settingsLive.claims.heading": "Copyright claims",
  "settingsLive.claims.body":
    "The copyright claims you filed about Studio tracks, and what happened to each.",
  "settingsLive.claims.cta": "Open your claims",
  "settingsLive.theme.label": "Theme",
  "settingsLive.theme.title": "How Studio <em>looks</em>",
  "settingsLive.theme.dark.heading": "Dark mode",
  "settingsLive.theme.dark.body":
    "Studio follows your QueerPulse theme, so a change here applies across QueerPulse on this device.",
  "settingsLive.saveError": "We couldn't save that setting. Try again",
  "settingsLive.pageTitle": "Settings",
  "settingsLive.loadingReason":
    "Still loading your saved setting, so this switch cannot change yet",
  "settingsLive.device.label": "This device",
  "settingsLive.device.title": "What Studio <em>remembers</em> here",
  "settingsLive.singleKey.heading": "Single-key shortcuts",
  "settingsLive.singleKey.body":
    "Play, skip, seek and mute with single letters, plus arrows and Space when nothing else has focus. Turn them off if they clash with your screen reader or voice control. Saved on this device only.",
  "settingsLive.resume.heading": "Resume where you left off",
  "settingsLive.resume.body":
    "Next time you open Studio on this device, your queue and position are ready, paused. Stays on this device only, and clears on Quick Exit, sign-out or loss of access.",

  "hiddenTrack.label": "Hidden by your settings",
  "contentWarnings.pickerLabel": "Content warnings",
  "contentWarnings.pickerHint": "Listeners see these before a track plays",
  "contentWarnings.lockedChip": "Added by our team",
  "contentWarnings.lockedGroupLabel": "Warnings our team added",
  explicitLocked: "Marked explicit by our team",
  "track.withheld.title": "This track is unavailable",
  "track.withheld.body":
    "It can't be played right now. The rest of Studio is still here",
  "album.trackUnavailable": "Unavailable",
  "album.trackUnavailableAria": "Track {number} is unavailable",
  "report.trackCta": "Report track",
  "player.gate.waiting": "Waiting: {title}",
  "player.gate.warning": "Warning: {themes}",
  "player.gate.play": "Play it",
  "player.gate.skip": "Skip track",

  "flagReviewLive.eyebrow": "Staff · Studio review",
  "flagReviewLive.title": "Studio <em>reports</em> and disputes",
  "flagReviewLive.dek":
    "Reports from members, disputes from artists and every release that's down. The artist reads the reason or reply you write here.",
  "flagReviewLive.tablistLabel": "Studio review queues",
  "flagReviewLive.tabs.reports": "Reports",
  "flagReviewLive.tabs.disputes": "Disputes",
  "flagReviewLive.tabs.withdrawn": "Withdrawn",
  "flagReviewLive.card.byArtist": "by {artist}",
  "flagReviewLive.card.unknownRelease": "A Studio release",
  "flagReviewLive.card.filedOn": "Reported {date}",
  "flagReviewLive.card.takedownReason": "Takedown reason",
  "flagReviewLive.card.artistNote": "The artist's note",
  "flagReviewLive.card.disputedOn": "Disputed {date}",
  "flagReviewLive.card.takenDownOn": "Taken down {date}",
  "flagReviewLive.card.openDispute": "Dispute waiting",
  "flagReviewLive.card.lookupFailed":
    "We couldn't load {what}, so its actions wait until it loads.",
  "flagReviewLive.card.reloadRelease": "Reload release",
  "flagReviewLive.card.waitingForRelease":
    "Take down release waits until the release loads",
  "flagReviewLive.card.dueIn": "Due in {span}",
  "flagReviewLive.card.overdueBy": "Overdue by {span}",
  "flagReviewLive.action.takeDown": "Take down release",
  "flagReviewLive.action.dismiss": "Dismiss report",
  "flagReviewLive.action.openModeration": "Open in moderation",
  "flagReviewLive.action.restore": "Restore release",
  "flagReviewLive.action.keepDown": "Keep release down",
  "flagReviewLive.dialog.takeDownTitle": "Take down {title}?",
  "flagReviewLive.dialog.takeDownBody":
    "It goes offline for listeners straight away, and every open report about it closes.",
  "flagReviewLive.dialog.reasonLabel": "Reason the artist will see",
  "flagReviewLive.dialog.dismissTitle": "Dismiss this report about {title}?",
  "flagReviewLive.dialog.dismissBody":
    "The release stays online and the report closes.",
  "flagReviewLive.dialog.restoreTitle": "Restore {title}?",
  "flagReviewLive.dialog.restoreDisputeBody":
    "It comes back and the artist reads your reply on the release.",
  "flagReviewLive.dialog.restoreWithdrawnBody": "It comes back for listeners.",
  "flagReviewLive.dialog.keepDownTitle": "Keep {title} down?",
  "flagReviewLive.dialog.keepDownBody":
    "It stays offline and the artist reads your reply on the release.",
  "flagReviewLive.dialog.replyLabel": "Reply the artist will read",
  "flagReviewLive.dialog.discardQuestion":
    "Discard your note? It hasn't been sent",
  "flagReviewLive.dialog.keepWriting": "Keep writing",
  "flagReviewLive.dialog.discardNote": "Discard note",
  "flagReviewLive.toast.takenDown":
    "{title} is down and its reports are closed",
  "flagReviewLive.toast.dismissed": "Report dismissed",
  "flagReviewLive.toast.restored": "{title} is back online",
  "flagReviewLive.toast.keptDown":
    "{title} stays down and the artist has your reply",
  "flagReviewLive.toast.actionError": "That didn't go through. Try again",
  "flagReviewLive.toast.settledElsewhere":
    "This was already closed or is no longer there, so the queue now shows the latest",
  "flagReviewLive.empty.reportsTitle": "No open reports",
  "flagReviewLive.empty.reportsBody":
    "New reports about Studio releases show up here.",
  "flagReviewLive.empty.disputesTitle": "No open disputes",
  "flagReviewLive.empty.disputesBody": "Disputes from artists show up here.",
  "flagReviewLive.empty.withdrawnTitle": "Nothing is taken down",
  "flagReviewLive.empty.withdrawnBody":
    "Releases our team takes down are listed here.",
  "flagReviewLive.loadError": "We couldn't load this list",
  "flagReviewLive.loadMore": "Show more",
  "flagReviewLive.loadingMore": "Loading more reviews",
  "flagReviewLive.loadMoreError": "We couldn't load more. Try again",
  "flagReviewLive.tabs.claims": "Claims",
  "flagReviewLive.claims.badge_one": "{count} claim waiting",
  "flagReviewLive.claims.badge_other": "{count} claims waiting",
  "flagReviewLive.claims.emptyTitle": "No claims waiting",
  "flagReviewLive.claims.emptyBody":
    "New copyright claims and counter-notices show up here",
  "flagReviewLive.claims.claimantLabel": "Claimant",
  "flagReviewLive.claims.trackLabel": "Track",
  "flagReviewLive.claims.trackLine": "Track {number}: {title}",
  "flagReviewLive.claims.accept": "Accept claim",
  "flagReviewLive.claims.decline": "Decline claim",
  "flagReviewLive.claims.uphold": "Uphold claim",
  "flagReviewLive.claims.reject": "Reject claim",
  "flagReviewLive.claims.noteLabel": "Note to both sides",
  "flagReviewLive.claims.declineNoteLabel": "Note to the claimant",
  "flagReviewLive.claims.acceptedHeading": "Accepted, waiting for the artist",
  "flagReviewLive.claims.acceptedEmptyTitle": "No claims waiting for an artist",
  "flagReviewLive.claims.acceptedEmptyBody":
    "Claims you accept wait here for the artist's counter-notice, and you can uphold or reject them at any time",
  "flagReviewLive.claims.availabilityLabel": "Right now",
  "flagReviewLive.claims.withheldFact": "Offline for listeners",
  "flagReviewLive.claims.dialog.acceptTitle": "Accept the claim about {title}?",
  "flagReviewLive.claims.dialog.acceptBody":
    "The track goes offline for listeners and the artist can send a counter-notice",
  "flagReviewLive.claims.dialog.declineTitle":
    "Decline the claim about {title}?",
  "flagReviewLive.claims.dialog.declineBody":
    "The track stays online and the claimant reads your note",
  "flagReviewLive.claims.dialog.upholdTitle": "Uphold the claim about {title}?",
  "flagReviewLive.claims.dialog.upholdBody":
    "The track stays offline and both sides read your note",
  "flagReviewLive.claims.dialog.rejectTitle": "Reject the claim about {title}?",
  "flagReviewLive.claims.dialog.rejectBody":
    "The track comes back unless another claim holds it, and both sides read your note",
  "flagReviewLive.claims.toast.accepted":
    "{title} is offline while the claim is open",
  "flagReviewLive.claims.toast.declined": "Claim declined",
  "flagReviewLive.claims.toast.upheld": "Claim upheld",
  "flagReviewLive.claims.toast.rejected": "Claim rejected",
  "flagReviewLive.claims.offlineFor_one": "Offline for {count} day",
  "flagReviewLive.claims.offlineFor_other": "Offline for {count} days",
  "flagReviewLive.claims.offlineToday": "Offline since today",
  "flagReviewLive.claims.acceptedOn": "Accepted {date}",
  "flagReviewLive.claims.counteredOn": "Counter-notice {date}",
  "flagReviewLive.claims.repliedOn": "Claimant replied {date}",
  "flagReviewLive.trackReports.heading": "Track reports",
  "flagReviewLive.trackReports.emptyTitle": "No open track reports",
  "flagReviewLive.trackReports.emptyBody":
    "New reports about single tracks show up here",
  "flagReviewLive.trackReports.unknownTrack": "A Studio track",
  "flagReviewLive.trackReports.currentLabel": "Current marks",
  "flagReviewLive.trackReports.markExplicit": "Mark track explicit",
  "flagReviewLive.trackReports.addWarning": "Add content warning",
  "flagReviewLive.trackReports.dialog.markExplicitTitle":
    "Mark {title} explicit?",
  "flagReviewLive.trackReports.dialog.markExplicitBody":
    "The artist can't unmark it, the report closes and the owners hear from our team",
  "flagReviewLive.trackReports.dialog.warningTitle":
    "Add a content warning to {title}",
  "flagReviewLive.trackReports.dialog.warningBody":
    "Listeners see it before the track plays, and the artist can't remove it",
  "flagReviewLive.trackReports.dialog.warningConfirm": "Add warning",
  "flagReviewLive.trackReports.dialog.warningConfirmPending": "Adding…",
  "flagReviewLive.trackReports.dialog.dismissBody":
    "The track stays as it is and the report closes",
  "flagReviewLive.trackReports.toast.markedExplicit":
    "{title} is marked explicit",
  "flagReviewLive.trackReports.toast.warningAdded": "Warning added to {title}",
  "flagReviewLive.documentTitle": "{tab} · Flag review",
  "flagReviewLive.disputes.badge_one": "{count} dispute waiting",
  "flagReviewLive.disputes.badge_other": "{count} disputes waiting",
  "flagReviewLive.reports.badge_one": "{count} report open",
  "flagReviewLive.reports.badge_other": "{count} reports open",
  "flagReviewLive.reports.badgeMore_one": "{count} or more reports open",
  "flagReviewLive.reports.badgeMore_other": "{count} or more reports open",
  "flagReviewLive.reports.releaseHeading": "Release reports",
  "flagReviewLive.severity.emergency": "Emergency",
  "flagReviewLive.severity.high": "High severity",
  "flagReviewLive.severity.medium": "Medium severity",
  "flagReviewLive.severity.low": "Low severity",
  "flagReviewLive.trackReports.reloadTrack": "Reload track",
  "flagReviewLive.trackReports.waitingForTrack":
    "These actions wait until the track loads",
  "flagReviewLive.trackReports.explicitLockedReason":
    "Our team already marked this track explicit",
  "flagReviewLive.trackReports.everyWarningReason":
    "Every content warning is already on this track",
  "flagReviewLive.queue.sortLabel": "Sort",
  "flagReviewLive.queue.sortOldest": "Oldest first",
  "flagReviewLive.queue.sortNewest": "Newest first",
  "flagReviewLive.queue.sortSeverity": "Most severe first",
  "flagReviewLive.queue.filterLabel": "Filter the queue",
  "flagReviewLive.queue.filterReason": "Filter by reason",
  "flagReviewLive.queue.filterStatus": "Filter by status",
  "flagReviewLive.queue.filterAll": "All",
  "flagReviewLive.queue.showing": "Showing {shown} of {total}",
  "flagReviewLive.queue.keysHint":
    "Press <key>J</key> and <key>K</key> to move between cards",
  "flagReviewLive.queue.selectReport": "Select the report about {title}",
  "flagReviewLive.bulk.selectReports": "Select reports",
  "flagReviewLive.bulk.stopSelecting": "Stop selecting",
  "flagReviewLive.bulk.dismissAction": "Dismiss reports",
  "flagReviewLive.bulk.confirmTitle_one": "Dismiss {count} report?",
  "flagReviewLive.bulk.confirmTitle_other": "Dismiss {count} reports?",
  "flagReviewLive.bulk.confirmBody":
    "Each report closes, and its release or track stays as it is.",
  "flagReviewLive.bulk.confirmAction_one": "Dismiss {count} report",
  "flagReviewLive.bulk.confirmAction_other": "Dismiss {count} reports",
  "flagReviewLive.bulk.dismissed_one": "Dismissed {count} report",
  "flagReviewLive.bulk.dismissed_other": "Dismissed {count} reports",
  "flagReviewLive.bulk.partlyDismissed_one":
    "Dismissed {done} of {count} report. The rest stay ticked.",
  "flagReviewLive.bulk.partlyDismissed_other":
    "Dismissed {done} of {count} reports. The rest stay ticked.",
  "flagReviewLive.bulk.skipped_one":
    "{count} report had already left the queue: {titles}.",
  "flagReviewLive.bulk.skipped_other":
    "{count} reports had already left the queue: {titles}.",
  "flagReviewLive.bulk.reportGone":
    "This report was already closed or its release is gone",

  "rail.live.utilityLabel": "Help and info",
  "rail.live.help": "Help",
  "rail.live.about": "About Studio",
  "rail.live.rights": "Rights and takedowns",
  "rail.live.terms": "Studio terms",
  "rail.live.accessibility": "Accessibility",
  "rail.live.flagReview": "Flag review",
  // ── Studio discovery (QUEERPULSE-STUDIO-DISCOVERY-DESIGN-2026-10-13.md) ──
  "mood.lateNight": "Late night",
  "mood.euphoric": "Euphoric",
  "mood.tender": "Tender",
  "mood.melancholy": "Melancholy",
  "mood.defiant": "Defiant",
  "mood.dreamy": "Dreamy",
  "mood.slowBurn": "Slow burn",
  "mood.calm": "Calm",
  "home.moods.heading": "Browse by <em>mood</em>",
  "home.moods.listLabel": "Moods",
  "home.hero.featuredEyebrow": "Featured",
  "home.hero.loadingLabel": "Loading Studio home",
  "home.staffPicks.title": "Staff <em>picks</em>",
  "home.newThisWeek.title": "New this <em>week</em>",
  "home.artistOfTheMonth.title": "Artist of the <em>month</em>",
  "home.artistOfTheMonth.play": "Play {release}",
  "home.artistOfTheMonth.openArtist": "Open {artist}",
  "home.artistOfTheMonth.noteLabel": "From the Studio team",
  "home.newStars.title": "New <em>stars</em>",
  "home.scenes.title": "Local <em>scenes</em>",
  "curation.noteLabel": "Note from the Studio team:",
  "browse.titleMood": "<em>{mood}</em> releases",
  "browse.titleBoth": "<em>{mood}</em> releases in {genre}",
  "browse.gridLabelMood": "{mood} releases",
  "browse.gridLabelBoth": "{mood} releases in {genre}",
  "browse.empty.titleMood": "Nothing with the mood {mood} yet",
  "browse.empty.titleBoth": "Nothing in {genre} with the mood {mood} yet",
  "browse.anyGenre": "Any genre",
  "browse.anyMood": "Any mood",
  "radio.playCta": "Play {name} radio",
  "radio.error": "The radio couldn't start. Try again",
  "radio.empty": "This radio has nothing to play yet",
  "radio.playerLabel": "Radio · {name}",
  "scene.eyebrow": "Scene · {city}",
  "scene.playCta": "Play scene",
  "scene.releases.title": "<em>Releases</em>",
  "scene.releases.gridLabel": "Releases in {name}",
  "scene.empty.title": "No releases in this scene yet",
  "scene.empty.body": "Artists add a release to a scene when they upload it",
  "scene.artists.title": "<em>Artists</em> in this scene",
  "scene.events.title": "Upcoming <em>events</em>",
  "scene.events.online": "Online",
  "scene.notFound.title": "We can't find that scene",
  "scene.notFound.body":
    "It may have been archived, or the link may be out of date",
  "searchPage.moodLabel": "Mood",
  "searchPage.moodAny": "Any mood",
  "credits.nav": "Credits",
  "credits.badge_one": "{count} credit request waiting",
  "credits.badge_other": "{count} credit requests waiting",
  "credits.role.featured": "Featured",
  "credits.role.producer": "Producer",
  "credits.role.coWriter": "Co-writer",
  "credits.role.mixing": "Mixing",
  "credits.role.mastering": "Mastering",
  "credits.role.remix": "Remix",
  "credits.role.coverArt": "Cover art",
  "credits.role.other": "Other",
  "credits.status.pending": "Pending",
  "credits.status.accepted": "Accepted",
  "credits.status.declined": "Declined",
  "credits.removeCta": "Remove credit",
  "credits.editor.heading": "Credit a persona",
  "credits.editor.hint":
    "Type the exact handle of a public persona. Nothing shows on the track until they accept",
  "credits.editor.handleLabel": "Persona handle",
  "credits.editor.findCta": "Find persona",
  "credits.editor.finding": "Looking for that persona",
  "credits.editor.notFound": "No public persona has that handle",
  "credits.editor.roleLabel": "Role",
  "credits.editor.addCta": "Credit {name}",
  "credits.editor.clearCta": "Clear persona",
  "credits.editor.listLabel": "Persona credits on this track",
  "credits.editor.removeAria": "Remove credit for {name} as {role}",
  "credits.editor.notPublic":
    "This persona is no longer public, so the credit stays hidden",
  "credits.editor.limit": "A track holds up to {limit} persona credits",
  "credits.editor.added": "Credit sent to {name}",
  "credits.editor.removed": "Credit removed",
  "credits.editor.handleLine": "@{handle}",
  "credits.page.eyebrow": "Credits",
  "credits.page.title": "Your <em>credits</em>",
  "credits.page.sub":
    "Your personas, credited on other artists' tracks. A credit shows publicly once you accept it",
  "credits.inbox.requests.title": "<em>Requests</em>",
  "credits.inbox.accepted.title": "<em>Accepted</em>",
  "credits.inbox.requestLine":
    "{requester} credited {persona} as {role} on {track}",
  "credits.inbox.acceptedLine":
    "{requester} credits {persona} as {role} on {track}",
  "credits.inbox.releaseLine": "From {release}",
  "credits.inbox.acceptCta": "Accept credit",
  "credits.inbox.declineCta": "Decline credit",
  "credits.inbox.acceptAria": "Accept credit for {persona} on {track}",
  "credits.inbox.declineAria": "Decline credit for {persona} on {track}",
  "credits.inbox.removeAria": "Remove credit for {persona} on {track}",
  "credits.inbox.confirmRemove.title": "Remove this credit?",
  "credits.inbox.confirmRemove.body": "{persona} stops showing on {track}",
  "credits.inbox.empty.title": "No credit requests right now",
  "credits.inbox.empty.body":
    "When an artist credits one of your personas on a track, the request shows up here",
  "credits.inbox.toast.accepted": "Credit accepted",
  "credits.inbox.toast.declined": "Credit declined",
  "credits.inbox.toast.removed": "Credit removed",
  "credits.inbox.gone": "That credit request is no longer open",
  "credits.inbox.removeGone": "That credit was already removed",
  "credits.public.listLabel": "Credited personas",
  "credits.album.title": "<em>Credits</em>",
  "artist.appearsOn.title": "Appears <em>on</em>",
  "artist.related.title": "Related <em>artists</em>",
  "uploadFlow.release.moodLabel": "Mood",
  "uploadFlow.release.moodNone": "No mood",
  "uploadFlow.release.sceneLabel": "Scene",
  "uploadFlow.release.sceneNone": "No scene",
  "uploadFlow.release.sceneHint": "Adds this release to one scene page",
  "uploadFlow.release.sceneOption": "{name}, {city}",
  "uploadFlow.release.sceneArchived": "Current scene, now archived",
  "uploadFlow.release.sceneLoading": "Loading scenes",
  "uploadFlow.release.sceneUnavailable": "Scenes didn't load",
  "errors.radioFilterRequired": "Pick a genre or a mood for the radio",
  "errors.sceneNotFound": "That scene isn't on Studio",
  "errors.creditNotFound": "That credit is gone",
  "errors.curationShelfFull": "This shelf holds 12 picks. Remove one first",
  "errors.curationAlreadyOnShelf": "That release is already on this shelf",
  "errors.curationOrderMismatch":
    "The shelf changed while you were moving picks. Reload and try again",
  "errors.spotlightNotAnArtist": "Only a public Studio artist can go here",
  "errors.spotlightNoRelease": "This artist hasn't published a release yet",
  "errors.spotlightSlotFull": "New stars holds 12 artists. Remove one first",
  "errors.spotlightAlreadyInSlot": "That artist is already in New stars",
  "errors.spotlightOrderMismatch":
    "Someone else changed this list. Reload it and try again",
  "errors.spotlightNotFound":
    "That artist was already removed from the spotlight",
  "errors.sceneSlugTaken": "Another scene uses that address",
  "errors.sceneOrderMismatch":
    "The scenes changed while you were moving them. Reload and try again",
  "errors.creditAlreadyRequested":
    "This persona already has that credit on this track",
  "errors.creditNotAccepted": "Only an accepted credit can be removed here",
  "errors.sceneCoverChanged":
    "Someone else changed this scene cover first. Reload the scene and choose the cover again.",
  "errors.sceneNotAvailable": "That scene can't be picked right now",
  "errors.curationReleaseNotPublished":
    "Only a published release can go on a shelf",
  "errors.sceneEventNotPinnable":
    "Only an upcoming event open to members can be pinned",
  "errors.creditPersonaNotCreditable": "That persona can't be credited",
  "errors.creditSelfPersona": "That's this release's own persona",
  // ── Studio v3 artist tools (2026-10-13) ──────────────────────────────────────
  "releaseStatus.scheduled": "Scheduled",
  "errors.releaseNotSchedulable":
    "Only a draft or a scheduled release can be scheduled",
  "errors.releaseNeedsPlayableTrack":
    "A live release keeps at least one track with audio. Add another before removing this one",
  "errors.releaseNoChanges":
    "There's no track change to note since the last version",
  "errors.previewNotAvailable":
    "Preview links are for drafts and scheduled releases",
  "errors.previewNotFound":
    "We can't find that preview. The link may have been turned off",
  "errors.scheduleOutOfRange":
    "Pick a time between 15 minutes and 365 days from now",
  "errors.pressTrackNotAllowed":
    "One of those tracks isn't on this persona's releases",
  "schedule.choice.legend": "When should it go live?",
  "schedule.choice.now": "Publish now",
  "schedule.choice.nowHint":
    "It goes live as soon as you press Publish release",
  "schedule.choice.schedule": "Schedule release",
  "schedule.choice.scheduleHint": "Pick a date and time, and it goes live then",
  "schedule.form.dateLabel": "Date",
  "schedule.form.timeLabel": "Time",
  "schedule.form.zoneHint": "In your time zone ({zone})",
  "schedule.form.readback": "Goes live on {date} at {time}",
  "schedule.form.incomplete": "Pick a date and a time",
  "schedule.form.tooSoon": "Pick a time at least 15 minutes from now",
  "schedule.form.tooFar": "Pick a date within the next 365 days",
  "schedule.form.scheduleCta": "Schedule release",
  "schedule.form.saveDateCta": "Save new date",
  "schedule.form.keepDateCta": "Keep the current date",
  "schedule.form.scheduling": "Scheduling",
  "schedule.panel.heading": "Scheduled for <em>{date}</em> at {time}",
  "schedule.panel.body":
    "It goes live by itself on the day. Members who pressed Notify me get the alert then",
  "schedule.panel.changeDateCta": "Change date",
  "schedule.panel.cancelCta": "Cancel schedule",
  "schedule.panel.cancelling": "Cancelling",
  "schedule.panel.dateChanged": "New date saved",
  "upcoming.outOn": "Out {date} at {time}",
  "upcoming.tracksOut_one": "{count} track, out {date}",
  "upcoming.tracksOut_other": "{count} tracks, out {date}",
  "upcoming.notifyMe": "Notify me",
  "upcoming.notifyMeSet": "We'll tell you",
  "upcoming.notifyMeAria": "Notify me when {title} is out",
  "upcoming.notifyMeOffStatus": "Reminder for {title} turned off",
  "upcoming.notifyMeError": "We couldn't save that. Try again",
  "upcoming.cardHeading": "Upcoming",
  "upcoming.notifyMeGone": "This release is no longer available",
  "versions.line": "Version {version} · {date}",
  "versions.earlierCta": "Earlier versions",
  "versions.blockLabel": "What changed in this release",
  "versions.panel.heading": "You changed the tracks",
  "versions.panel.body":
    "Add a version note so listeners know what's new. It shows on the release page as version {version}",
  "versions.panel.noteLabel": "Version note",
  "versions.panel.notePlaceholder": "What changed, in a line or two",
  "versions.panel.noteCount": "{count} of {max}",
  "versions.panel.noteRequired": "Write what changed first",
  "versions.panel.saveCta": "Save version note",
  "versions.panel.saving": "Saving",
  "versions.panel.savedStatus":
    "Version note saved. Followers get no second alert",
  "previewLink.heading": "Private preview link",
  "previewLink.offBody":
    "Share this release before it's out. Only members with Studio access can open the link",
  "previewLink.onBody":
    "Anyone with Studio access who holds this link can listen until the release is out. Then it opens the release page",
  "previewLink.makeCta": "Make preview link",
  "previewLink.fieldLabel": "Preview link",
  "previewLink.copyCta": "Copy link",
  "previewLink.copied": "Copied",
  "previewLink.copiedToast": "Preview link copied",
  "previewLink.copyFailedToast":
    "We couldn't copy the link. Select it and copy it yourself",
  "previewLink.made": "Made {time}",
  "previewLink.newCta": "Make new link",
  "previewLink.newTitle": "Make a new preview link?",
  "previewLink.newBody": "The old link stops working",
  "previewLink.turnOffCta": "Turn off link",
  "previewLink.madeStatus": "Preview link made",
  "previewLink.replacedStatus": "New link made. The old one stopped working",
  "previewLink.turnedOffStatus": "Preview link turned off",
  "previewLink.dialogTitle": "Preview link for {title}",
  "previewPage.banner":
    "Private preview from {persona}. Please keep this link to yourself",
  "support.artistHeading": "Support {name}",
  "support.releaseHeading": "Buy and support {name}",
  "support.listLabel": "Where to support {name}",
  "support.note":
    "These open {name}'s own pages and QueerPulse never handles money",
  "support.ownerEmpty":
    "Add Bandcamp, Ko-fi or Patreon to your persona's links",
  "support.ownerEmptyCta": "Edit persona links",
  "support.buyOnBandcamp": "Buy on Bandcamp",
  "support.buyRelease": "Buy this release",
  "support.opensInNewTab": "(opens in a new tab)",
  "pressKit.eyebrow": "Press kit",
  "pressKit.section.bestTracks": "Best <em>tracks</em>",
  "pressKit.bestTracksLabel": "Best tracks by {name}",
  "pressKit.fallbackNote": "From the newest releases",
  "pressKit.copyBioCta": "Copy bio",
  "pressKit.bioCopiedToast": "Bio copied",
  "pressKit.noBio": "No bio yet",
  "pressKit.section.releases": "Latest <em>releases</em>",
  "pressKit.section.links": "Links and <em>support</em>",
  "pressKit.linksLabel": "{name} elsewhere",
  "pressKit.section.contact": "<em>Contact</em>",
  "pressKit.noContact": "No press contact yet",
  "pressKit.editCta": "Edit press kit",
  "pressKit.ownerEmptySection": "Publish a release to fill this section",
  "pressEdit.eyebrow": "Press kit",
  "pressEdit.title": "Your <em>press kit</em>",
  "pressEdit.dek":
    "What members with Studio access see on your press page, and what the one-sheet prints",
  "pressEdit.personaLabel": "Persona",
  "pressEdit.heading": "Press kit for <em>{name}</em>",
  "pressEdit.sub":
    "Everything here is optional. Empty parts come from the persona",
  "pressEdit.pitchLabel": "Pitch",
  "pressEdit.count": "{count} of {max}",
  "pressEdit.pitchTooLong": "Keep the pitch to 140 characters",
  "pressEdit.bioLabel": "Press bio",
  "pressEdit.bioHint":
    "Shows on the press kit when set. Empty uses the persona bio",
  "pressEdit.bioTooLong": "Keep the press bio to 1500 characters",
  "pressEdit.tracksLegend": "Best tracks",
  "pressEdit.tracksHint": "Up to {max}, in the order you set",
  "pressEdit.tracksFallbackHint":
    "With none chosen, the press kit shows up to 5 tracks from your newest releases",
  "pressEdit.trackUnavailable": "No longer available",
  "pressEdit.addTrackLabel": "Add a track",
  "pressEdit.addTrackPlaceholder": "Pick a track",
  "pressEdit.moveUp": "Move {title} up",
  "pressEdit.moveDown": "Move {title} down",
  "pressEdit.removeTrack": "Remove {title} from best tracks",
  "pressEdit.removeUnavailableTrack": "Remove unavailable track {number}",
  "pressEdit.tracksLoadErrorTitle": "Your tracks didn't load",
  "pressEdit.quotesLegend": "Quotes",
  "pressEdit.quoteLabel": "Quote",
  "pressEdit.sourceLabel": "Source",
  "pressEdit.addQuoteCta": "Add quote",
  "pressEdit.removeQuoteCta": "Remove quote {number}",
  "pressEdit.quoteRequired": "Write the quote, or remove this one",
  "pressEdit.quoteTooLong": "Keep a quote to 300 characters",
  "pressEdit.quoteSourceRequired": "Say where the quote is from",
  "pressEdit.quoteSourceTooLong": "Keep the source to 80 characters",
  "pressEdit.contactLabel": "Contact",
  "pressEdit.contactHint":
    "A web page starting with https:// or an address starting with mailto:",
  "pressEdit.contactInvalid":
    "Use a link starting with https:// or an address starting with mailto:",
  "pressEdit.saveCta": "Save press kit",
  "pressEdit.saving": "Saving",
  "pressEdit.savedStatus": "Press kit saved",
  "pressEdit.viewCta": "View press kit",
  "pressEdit.moveUpTooltip": "Move up",
  "pressEdit.moveDownTooltip": "Move down",
  "pressEdit.removeTooltip": "Remove",
  "oneSheet.downloadCta": "Download one-sheet",
  "oneSheet.backCta": "Back to the press kit",
  "oneSheet.saveHint": "In the print dialog, choose Save as PDF",
  "oneSheet.fileTitle": "{name} one-sheet",
  "oneSheet.label": "{name} one-sheet",
  "oneSheet.bio": "Bio",
  "oneSheet.bestTracks": "Best tracks",
  "oneSheet.releases": "Latest releases",
  "oneSheet.contact": "Contact",
  "oneSheet.links": "Links",
  "oneSheet.qrLabel": "QR code for the {name} persona page",
  "owner.v3.previewLink": "Preview link",
  "owner.v3.previewLinkAria": "Preview link for {title}",
  "owner.v3.toolsHeading": "Press kit and updates",
  "owner.v3.pressKit": "Press kit",
  "owner.v3.editPressKit": "Edit press kit",
  "owner.v3.postUpdateHeading": "Post an update",
  "uploadFlow.v3.buyUrlLabel": "Buy link",
  "uploadFlow.v3.buyUrlHint": "Bandcamp or your own shop. Optional",
  "uploadFlow.v3.buyUrlHttpsOnly": "Use a full link starting with https://",
  "uploadFlow.v3.buyUrlTooLong": "Keep the link to 1000 characters",
  "uploadFlow.v3.removePublishedTitle": "Remove {title} from {release}?",
  "uploadFlow.v3.removePublishedBody":
    "People who saved it will see it as no longer available, and it comes off every playlist it's on",
  "uploadFlow.v3.removePublishedConfirm": "Remove track",
  "numbers.reminders": "Waiting for it: {value}",
  // Dashboard Part 1 (2026-10-26)
  "numbers.growth.title": "New followers who still follow",
  "numbers.growth.sub": "Per week, last 12 weeks",
  "numbers.growth.ariaLabel":
    "New followers who still follow, per week over the last 12 weeks",
  "numbers.growth.thisWeek": "This week",
  "numbers.growth.weekOf": "Week of {date}",
  "numbers.growth.tableCaption": "New followers who still follow, per week",
  "numbers.growth.weekColumn": "Week",
  "numbers.growth.countColumn": "New followers",
  "numbers.growth.empty": "Nobody new followed in the last 12 weeks",
  "numbers.chart.showTable": "Show data table",
  "numbers.chart.hideTable": "Hide data table",
  "numbers.health.heading": "Release checklist",
  "numbers.health.progress": "{done} of {total} done",
  "numbers.health.showChecklist": "Show checklist for {title}",
  "numbers.health.hideChecklist": "Hide checklist for {title}",
  "numbers.health.optional": "Optional",
  "numbers.health.showMore_one": "Show {count} more release",
  "numbers.health.showMore_other": "Show {count} more releases",
  "numbers.health.showFewer": "Show fewer releases",
  "numbers.health.todo.cover": "Add a cover",
  "numbers.health.todo.description": "Write a description",
  "numbers.health.todo.genreAndMood": "Pick a genre and a mood",
  "numbers.health.todo.creditsOnEveryTrack": "Credit someone on every track",
  "numbers.health.todo.lyrics": "Add lyrics to every track",
  "numbers.health.todo.buyLink": "Add a buy link",
  "numbers.health.todo.versionNote":
    "Write a version note for your track changes",
  "numbers.health.done.cover": "Cover added",
  "numbers.health.done.description": "Description written",
  "numbers.health.done.genreAndMood": "Genre and mood picked",
  "numbers.health.done.creditsOnEveryTrack": "Every track has credits",
  "numbers.health.done.lyrics": "Every track has lyrics",
  "numbers.health.done.buyLink": "Buy link added",
  "numbers.health.done.versionNote": "Version note written",
  "numbers.nextRelease.heading": "Next release",
  "numbers.nextRelease.in": "{title} goes live in {time}",
  "numbers.nextRelease.daysAndHours": "{days} and {hours}",
  "numbers.nextRelease.underAnHour": "{title} goes live in less than an hour",
  "numbers.nextRelease.now": "{title} is going live now",
  "numbers.nextRelease.openCta": "Open release page",
  "numbers.placements.heading": "Where your music lives",
  "numbers.placements.dek":
    "Public playlists that hold your tracks, newest first",
  "numbers.placements.yourTracks": "Your tracks here: {titles}",
  "numbers.placements.moreTracks_one": "{count} more track",
  "numbers.placements.moreTracks_other": "{count} more tracks",
  "numbers.placements.lastAdded": "Last added {date}",
  "numbers.placements.empty":
    "When a member adds one of your tracks to a public playlist, it shows up here",
  "numbers.placements.showMore": "Show more playlists",
  "numbers.milestones.heading": "Milestones",
  "numbers.milestones.dek":
    "Moments worth sharing. A milestone stays once reached",
  "numbers.milestones.new": "New",
  "numbers.milestones.reachedOn": "Reached {date}",
  "numbers.milestones.shareCta": "Share milestone",
  "numbers.milestones.empty": "Your first milestone comes at 10 followers",
  "numbers.milestones.showAll": "Show all milestones",
  "numbers.milestones.showFewer": "Show fewer milestones",
  "share.milestone.followers": "{persona} passed {value} followers",
  "share.milestone.firstPlacement":
    "{persona} landed on a public playlist for the first time",
  "share.milestone.trackPlays": "{track} passed {value} plays",
  "share.milestone.artistPlays": "{persona} passed {value} plays",
  "share.milestone.dialogTitle": "Share milestone",
  "share.milestone.dialogSub":
    "The card shows this milestone to members with Studio access",
  "share.milestone.optionsLabel": "Ways to share this milestone",
  "errors.reason.studio_milestone_not_found":
    "This milestone is not available to you",
  "errors.what.placements": "where your music lives",
  "errors.what.milestones": "your milestones",
  // Dashboard Part 2: listening (2026-10-27)
  "shell.menu.yourListening": "Your listening",
  "listening.pageTitle": "Your listening",
  "listening.eyebrow": "Only you can see this page",
  "listening.title": "Your <em>listening</em>",
  "listening.dek":
    "Your top artists and tracks, what you played lately and the artists who see your name. Pause or clear it any time",
  "listening.controls.heading": "Your history settings",
  "listening.history.heading": "Listening history",
  "listening.history.body":
    "Keeps a private list of what you play, so you can see your top artists and tracks. While it is paused, plays still count toward artists' totals without your name",
  "listening.clearCta": "Clear listening history",
  "listening.clear.title": "Clear listening history",
  "listening.clear.body":
    "This removes every play from your history and the recently played list on this device. Artists' totals stay as they are",
  "listening.clear.confirm": "Clear listening history",
  "listening.clear.done": "Your listening history is cleared",
  "listening.clear.failed": "We couldn't clear your listening history",
  "listening.paused.body":
    "History is paused. New plays stay out of your history until you turn it back on",
  "listening.paused.resumeCta": "Turn history back on",
  "listening.range.label": "Time range",
  "listening.range.4w": "4 weeks",
  "listening.range.6m": "6 months",
  "listening.range.12m": "12 months",
  "listening.listens_one": "{count} listen",
  "listening.listens_other": "{count} listens",
  "listening.days_one": "{count} day with music",
  "listening.days_other": "{count} days with music",
  "listening.topArtists.heading": "Top artists",
  "listening.topTracks.heading": "Top tracks",
  "listening.top.empty":
    "Nothing in this range yet. Play something and it shows up here",
  "listening.top.pausedEmpty":
    "Your history is paused, so new plays stay out of this list",
  "listening.recent.heading": "Played lately",
  "listening.recent.playedOn": "Played {date}",
  "listening.recent.unavailable": "This track is no longer available",
  "listening.recent.showMore": "Show more of your history",
  "listening.recent.empty": "Play a track for 30 seconds and it lands here",
  "listening.recent.pausedEmpty":
    "Your history is paused, so new plays stay out of this list",
  "listening.empty.title": "Your listening starts here",
  "listening.empty.body":
    "Play a track for 30 seconds and your top artists and tracks start to fill in. Only you can see this page",
  "listening.empty.cta": "Open Studio home",
  "listening.empty.pausedBody":
    "Your listening history is paused. Turn it back on and your top artists and tracks start to fill in",
  "listening.supporting.heading": "Artists who see your name",
  "listening.supporting.dek":
    "They see you among their top listeners, under the name you chose",
  "listening.supporting.since": "Showing since {date}",
  "listening.supporting.shownAs": "Shown as {name}",
  "listening.supporting.linksLabel": "Ways to support {name}",
  "listening.supporting.empty":
    "Turn on Show me among the top listeners on an artist's page to add them here",
  "listening.supporting.stop": "Stop showing my name",
  "listening.supporting.stopAria": "Stop showing your name to {artist}",
  "listening.supporting.pausedNote":
    "While your history is paused, you don't appear among their top listeners",
  "listening.notice.body": "Your listening history is on. Only you can see it",
  "listening.notice.cta": "See your listening",
  "listening.notice.close": "Close notice",
  // Your Studio profile (/studio/me)
  "me.pageTitle": "Your profile",
  "me.eyebrow": "Your Studio",
  "me.title": "Your <em>profile</em>",
  "me.dek":
    "Only you can see this page. It gathers what you made and what you listen to.",
  "me.playlists.heading": "Your playlists",
  "me.playlists.seeAll": "Open your library",
  "me.playlists.empty.title": "You have no playlists yet",
  "me.playlists.empty.body":
    "Create a playlist from any track and it will show up here.",
  "me.playlists.empty.cta": "Find a track to add",
  "me.topArtists.heading": "Your top artists",
  "me.topArtists.seeAll": "Open your listening",
  "me.topArtists.range": "Over the last 4 weeks",
  "me.following.heading": "Artists you follow",
  "me.following.seeAll": "Open your followed artists",
  "me.following.empty":
    "You are not following any artists yet. Follow one from their page and they will appear here.",
  "me.recent.heading": "Recently played",
  "me.recent.seeAll": "Open your listening history",
  "me.recent.empty":
    "Nothing played yet. Start a track and it will show up here.",
  "settingsLive.history.label": "Your listening",
  "settingsLive.history.title": "What Studio <em>keeps</em> for you",
  "supporter.heading": "Show me among {persona}'s top listeners",
  "supporter.body":
    "{persona} sees the name and photo you pick among their top listeners, ranked by how much you played them in the last 28 days",
  "supporter.pausedNote":
    "While your history is paused, you don't appear among their top listeners",
  "supporter.pickerLegend": "How {persona} sees you",
  "supporter.account": "Your account",
  "supporter.saveCta": "Save how you appear",
  "supporter.closeCta": "Close without saving",
  "supporter.changeCta": "Change how you appear",
  "supporter.confirmation": "{persona} sees you as {name}",
  "supporter.confirmationLead": "This is how {persona} sees you",
  "supporter.removed": "{persona} no longer sees you among their top listeners",
  "supporter.saveFailed": "We couldn't save how you appear",
  "supporter.removeFailed":
    "We couldn't turn off Show me among the top listeners",
  "numbers.column.plays": "Plays",
  "numbers.plays.showsNotCounted": "Not counted for shows",
  "numbers.plays.title": "Plays",
  "numbers.plays.sub": "Per day, last 28 days",
  "numbers.plays.ariaLabel": "Plays per day over the last 28 days",
  "numbers.plays.today": "Today",
  "numbers.plays.tableCaption": "Plays per day",
  "numbers.plays.dayColumn": "Day",
  "numbers.plays.countColumn": "Plays",
  "numbers.plays.totals": "All time: {total} · Last 28 days: {recent}",
  "numbers.plays.note":
    "A play counts after 30 seconds of listening. Plays by you and your co-owners never count",
  "numbers.plays.empty": "No plays in the last 28 days yet",
  "numbers.supporters.heading": "Top listeners",
  "numbers.supporters.dek":
    "Listeners who chose to show themselves, ranked by their plays in the last 28 days",
  "numbers.supporters.optedIn": "Showing themselves as top listeners: {value}",
  "numbers.supporters.empty":
    "When a listener turns on Show me among the top listeners, they show up here",
  "numbers.supporters.listLabel": "Top listeners of {name}",
  "errors.reason.studio_supporter_artist_not_found":
    "This artist is not available to show your name to",
  "errors.reason.studio_supporter_own_persona":
    "You are a member of this artist, so you cannot be among its top listeners",
  "errors.reason.studio_supporter_identity_not_yours":
    "You can show yourself only as your account or a persona you are a member of",
  "errors.what.listening": "your listening",
  "errors.what.listeningHistory": "your listening history",
  "errors.what.supporting": "the artists who see your name",
  "errors.what.supporter": "your top listener setting",
  "errors.what.plays": "your plays",
  "errors.what.topSupporters": "your top listeners",
  "rail.v3.pressKit": "Press kit",
  "creator.nav.pressKit": "Press kit",
  "artistPage.v3.moreAria": "More about {name}",
  "artistPage.v3.pressKit": "Press kit",
  "artistPage.followerCountGrouped_one": "{number} follower",
  "artistPage.followerCountGrouped_other": "{number} followers",
  "artistPage.pauseAll": "Pause the music by {name}",
  "artistPage.editPage.button": "Edit Studio page",
  "artistPage.viewAsVisitor": "View as visitor",
  "artistPage.visitorPreview.banner":
    "You're seeing your Studio page as a <strong>visitor</strong> does.",
  "artistPage.visitorPreview.exit": "Exit preview",
  "artistPage.editPage.title": "Edit your Studio page",
  "artistPage.editPage.intro":
    "Choose what shows at the top of your page. The page behind this sheet shows each choice as you pick it",
  "artistPage.editPage.choicesLabel": "What shows at the top of your page",
  "artistPage.editPage.choice.banner.title": "Banner",
  "artistPage.editPage.choice.banner.effect":
    "Your cover photo fills the top with your name over it",
  "artistPage.editPage.choice.portrait.title": "Avatar",
  "artistPage.editPage.choice.portrait.effect":
    "Your round avatar sits at the top beside your name",
  "artistPage.editPage.choice.both.title": "Banner and avatar",
  "artistPage.editPage.choice.both.effect":
    "Your cover photo fills the top with your round avatar on it",
  "artistPage.editPage.needsCover": "Needs a cover photo",
  "artistPage.editPage.noCover":
    "A banner needs a cover photo. <a>Add one in the persona editor</a>",
  "artistPage.editPage.save": "Save",
  "artistPage.editPage.saving": "Saving",
  "artistPage.editPage.cancel": "Cancel",
  "artistPage.editPage.close": "Close",
  "artistPage.editPage.error.invalidChoice":
    "The server didn't accept this choice. Reload the page and pick again",
  "artistPage.editPage.error.signedOut":
    "Your session ended. Sign in again to save your choice",
  "artistPage.editPage.error.notAllowed":
    "You can't edit this persona. Only the people who own it can change its Studio page",
  "artistPage.editPage.error.personaMissing":
    "This persona was deleted or you no longer co-own it",
  "artistPage.editPage.error.editConflict":
    "Someone else saved this persona at the same time. Save again to apply your choice",
  "artistPage.editPage.error.tooMany":
    "Too many saves in a short time. Wait a minute and save again",
  "artistPage.editPage.error.serverDown":
    "Our server is having trouble right now and your choice wasn't saved. Try again in a moment",
  "artistPage.editPage.error.network":
    "Your connection dropped before the choice reached us. Check you're online and save again",
  "artistPage.editPage.error.unexpected":
    "The server refused the save with error {status}. Try again or reload the page",
  "artistPage.editPage.error.unexpectedNoStatus":
    "This page hit an error of its own before your choice reached us. Try again or reload the page",
  // ── Studio Listening (2026-10-13): player, Now playing, queue, track
  // menu, chapters, lyric timing and the upload loudness check. Plan 3
  // Task 0 writes every key; Plan 2's code reads only the shortcuts and
  // chapters.error.outOfRange keys (contract section D). ────────────────
  // Player shortcuts (contract D; st/player/studioShortcuts.data.ts, StudioShortcutsSheet)
  "shortcuts.title": "Keyboard shortcuts",
  "shortcuts.dek":
    "They work on any page while something is queued, unless you're typing in a field",
  "shortcuts.closeCta": "Close shortcuts",
  "shortcuts.playPause": "Play or pause",
  "shortcuts.seekBack": "Back 5 seconds",
  "shortcuts.seekForward": "Forward 5 seconds",
  "shortcuts.previousTrack": "Previous track",
  "shortcuts.nextTrack": "Next track",
  "shortcuts.volumeUp": "Volume up",
  "shortcuts.volumeDown": "Volume down",
  "shortcuts.mute": "Mute or unmute",
  "shortcuts.shuffle": "Shuffle on or off",
  "shortcuts.repeat": "Change repeat",
  "shortcuts.lyrics": "Open the lyrics",
  "shortcuts.queue": "Open the queue",
  "shortcuts.help": "Show these shortcuts",
  "shortcuts.key.space": "Space",
  "shortcuts.key.shift": "Shift",
  "shortcuts.key.left": "Left arrow",
  "shortcuts.key.right": "Right arrow",
  "shortcuts.key.up": "Up arrow",
  "shortcuts.key.down": "Down arrow",
  "shortcuts.focusSearch": "Focus search",
  "shortcuts.key.commandOrControl": "Cmd or Ctrl",
  // Player bar, controls and Now playing extras (player/ui)
  "player.playFrom": "Play from {time}",
  "player.playFromAria": "Play {title} from {time}",
  // The hero pill's name when it shows "Play from {time}": it opens with the
  // visible words, so voice control can say what it sees.
  "player.playFromNamedAria": "Play from {time}, {title}",
  "player.openNowPlaying": "Open Now playing, {title} by {artist}",
  "player.chapterAria": "Chapter {number}: {title}",
  "player.queueShow": "Show the queue",
  "player.queueHide": "Hide the queue",
  "player.nowPlayingShow": "Show Now playing",
  "player.nowPlayingHide": "Hide Now playing",
  "player.shuffle": "Shuffle",
  "player.repeat.off": "Repeat: off",
  "player.repeat.all": "Repeat: all",
  "player.repeat.one": "Repeat: this track",
  "player.shuffleEpisodeDisabled":
    "Shuffle is off for episodes, which play in order",
  "player.repeatEpisodeDisabled": "Repeat is off for episodes, which play once",
  "player.cast": "Play on another device",
  "player.castConnected": "Playing on another device",
  "player.volume": "Volume",
  "player.volumeValue": "{percent}%",
  "player.mute": "Mute",
  "player.unmute": "Unmute",
  "player.more": "More player options",
  "player.goToTrack": "Go to track",
  "player.goToTrackAria": "Go to the page for {title} by {artist}",
  "player.crossfade.label": "Crossfade",
  "player.crossfade.hint":
    "Fades each track into the next. Releases set to play without gaps run straight through",
  "player.crossfade.unavailable": "Crossfade isn't available in this session",
  "player.crossfade.castHint":
    "Your cast device plays one track at a time, so crossfade rests while you cast",
  "player.crossfade.gaplessHint":
    "{release} plays without gaps, so crossfade rests between its tracks and comes back after it",
  "player.gapless.label": "Plays without gaps",
  "player.gapless.body":
    "{artist} made {release} to play straight through, so its tracks run into each other with no crossfade",
  "player.loudness.label": "Even out loudness",
  "player.loudness.hint": "Brings every track close to the same level",
  "player.loudness.plainHint":
    "In this session it can only turn loud tracks down",
  "player.loudness.castHint":
    "Your cast device sets its own volume, so this switch rests while you cast",
  "player.audio.heading": "Audio",
  "player.equalizer.heading": "Equaliser",
  "player.equalizer.presets.flat": "Flat",
  "player.equalizer.presets.warm": "Warm",
  "player.equalizer.presets.voice": "Voice",
  "player.equalizer.presets.bass": "Bass",
  "player.equalizer.hint":
    "Kept on this device. Flat plays each track as it was mixed",
  "player.equalizer.customHint": "Your own curve, kept on this device",
  "player.equalizer.plainHint":
    "This session plays through the browser's basic audio, so the equaliser rests",
  "player.equalizer.castHint":
    "Your cast device plays the track as it was mixed, so the equaliser rests",
  "player.equalizer.adjustBands": "Adjust bands",
  "player.equalizer.hideBands": "Hide bands",
  "player.equalizer.reset": "Reset equaliser",
  "player.equalizer.bandLabel": "{frequency} band",
  "player.equalizer.gainValue": "{value} dB",
  "player.equalizer.frequencyHz": "{value} Hz",
  "player.equalizer.frequencyKhz": "{value} kHz",
  "player.format.label": "Audio format: {line}",
  "player.format.sampleRate": "{rate} kHz",
  "player.format.mono": "Mono",
  "player.format.stereo": "Stereo",
  "player.format.channels_one": "{count} channel",
  "player.format.channels_other": "{count} channels",
  "player.shortcutsCta": "Keyboard shortcuts",
  "player.sleep.heading": "Sleep timer",
  "player.sleep.minutes": "{count} minutes",
  "player.sleep.endOfTrack": "End of track",
  "player.sleep.turnOff": "Turn off the timer",
  "player.sleep.chip": "{remaining} left",
  "player.sleep.chipEndOfTrack": "Stops after this track",
  "player.sleep.chipEndOfEpisode": "Stops after this episode",
  "player.sleep.cancelAria": "Turn off the sleep timer, {remaining} left",
  "player.sleep.cancelAriaEndOfTrack":
    "Turn off the sleep timer set for the end of this track",
  "player.sleep.cancelAriaEndOfEpisode":
    "Turn off the sleep timer set for the end of this episode",
  "player.sleep.setStatus": "Sleep timer set for {minutes} minutes",
  "player.sleep.endOfTrackStatus": "Playback stops at the end of this track",
  "player.sleep.endOfEpisode": "End of episode",
  "player.sleep.endOfEpisodeStatus":
    "Playback stops at the end of this episode",
  "player.sleep.cancelledStatus": "Sleep timer off",
  "player.sleep.minutesShort": "{count} min",
  "player.lyrics.listLabel": "Lyrics, following the music",
  "player.lyrics.backToCurrent": "Back to current line",
  "player.lyrics.shareLine": "Share lyric",
  "player.lyrics.playFromLine": "Play from this line",
  "player.lyrics.lineMenuLabel": "Lyric line options",
  // Now playing (StudioNowPlaying)
  "nowPlaying.dialogLabel": "Now playing",
  "nowPlaying.close": "Close Now playing",
  "nowPlaying.playingFrom": "Playing from {source}",
  "nowPlaying.playingFromQueue": "Playing from your queue",
  "nowPlaying.tabsLabel": "Now playing details",
  "nowPlaying.tab.lyrics": "Lyrics",
  "nowPlaying.tab.queue": "Queue",
  "nowPlaying.tab.credits": "Credits",
  "nowPlaying.tab.chapters": "Chapters",
  "nowPlaying.tab.artist": "Artist",
  "nowPlaying.tab.show": "Show",
  "nowPlaying.noLyrics": "No lyrics for this track yet",
  "nowPlaying.noCredits": "No credits for this track yet",
  "nowPlaying.creditsLoading": "Loading the credits",
  "nowPlaying.markPlayed": "Mark {title} as played",
  "nowPlaying.markUnplayed": "Mark {title} as unplayed",
  // Now playing side panel (StudioSidePanel*, StudioNowPlayingAbout, StudioNowPlayingArtistExtras)
  "sidePanel.aboutArtist": "About the artist",
  "sidePanel.openArtistPage": "Open artist page",
  "sidePanel.openShowPage": "Open show page",
  "sidePanel.artistLoading": "Loading the artist",
  "sidePanel.showAllCredits": "Show all credits",
  "sidePanel.showFewerCredits": "Show fewer credits",
  "sidePanel.nextInQueue": "Next in queue",
  "sidePanel.playNextAria": "Play {title} by {artist}",
  "sidePanel.openQueue": "Open queue",
  "sidePanel.seeAllEventsAria": "See all events with {artist}",
  // Queue (StudioQueueList, StudioQueuePanel)
  "queue.heading": "Queue",
  "queue.close": "Close the queue",
  "queue.nowPlaying": "Now playing",
  "queue.yours": "Your queue",
  "queue.clear": "Clear queue",
  "queue.undo": "Undo",
  "queue.clearedToast_one": "Cleared 1 track from your queue",
  "queue.clearedToast_other": "Cleared {count} tracks from your queue",
  "queue.nextFrom": "Next from {source}",
  "queue.nextUp": "Next up",
  "queue.emptyHint":
    "Add tracks with Play next or Add to queue in any track's menu",
  "queue.upcomingEmpty": "Nothing more after this track",
  "queue.moveUp": "Move {title} up",
  "queue.moveDown": "Move {title} down",
  "queue.remove": "Remove {title} from the queue",
  "queue.movedStatus": "{title} is now number {position}",
  "queue.removedToast": "Removed {title} from the queue",
  "queue.undoHiddenExplicitToast":
    "{title} stays out of your queue while Hide explicit tracks is on",
  "queue.undoUnavailableToast":
    "{title} can't play anymore, so it couldn't go back into your queue",
  "queue.undoStoppedToast":
    "Playback stopped, so {title} couldn't go back into the queue",
  "queue.played": "Played",
  "queue.showPlayed_one": "Show 1 track",
  "queue.showPlayed_other": "Show {count} tracks",
  "queue.hidePlayed": "Hide played tracks",
  "queue.clearPlayed": "Clear played tracks",
  "queue.playedPlayNext": "Play {title} next",
  "queue.dragHint": "Drag to reorder",
  // Track menu (StudioTrackMenu)
  "trackMenu.trigger": "More actions for {title}",
  "trackMenu.triggerUnavailable": "More actions for {title}, track {number}",
  "trackMenu.playNext": "Play next",
  "trackMenu.addToQueue": "Add to queue",
  "trackMenu.copyLink": "Copy link",
  "trackMenu.copyLinkAt": "Copy link at {time}",
  "trackMenu.playingNextToast": "Playing next",
  "trackMenu.addedToast": "Added to your queue",
  "trackMenu.linkCopiedToast": "Link copied",
  "trackMenu.queueFailedToast": "This track can't join your queue right now",
  "trackMenu.sendInMessage": "Send in a message",
  "trackMenu.menuLabel": "Actions for {title}",
  "trackMenu.like": "Add to Liked songs",
  "trackMenu.unlike": "Remove from Liked songs",
  "trackMenu.goToArtist": "Go to artist",
  "trackMenu.goToRelease": "Go to release",
  // ── Studio rich cards: the card a shared link becomes (features/studio/share/) ──
  "share.card.teaser": "From QueerPulse Studio, open to members with access",
  "share.card.withdrawn": "This release was withdrawn",
  "share.card.unavailable": "Not available",
  "share.card.retryCta": "Retry",
  "share.card.error.offline": "You're offline",
  "share.card.error.timeout": "Studio took too long to answer",
  "share.card.error.rateLimited": "Too many requests, wait a minute",
  "share.card.error.server": "Our server didn't answer",
  "share.card.error.unreachable": "We couldn't reach Studio",
  "share.card.error.forbidden": "Your account can't open this",
  "share.card.error.restricted": "A moderation restriction blocks this",
  "share.card.error.unknown": "The request didn't go through",
  "share.card.error.notFound": "This isn't available anymore",
  "share.card.loading": "Loading from Studio",
  "share.card.byline": "By {name}",
  "share.card.openAria": "Open {title} in Studio",
  "share.card.removeCta": "Remove Studio link",
  "share.card.hiddenNote": "Hidden by your settings",
  "share.lyric.dialogTitle": "Share lyric",
  "share.lyric.dialogSub":
    "The card shows this line to people with Studio access",
  "share.lyric.optionsLabel": "Ways to share this lyric",
  "share.lyric.playFromLine": "Play {title} from this line",
  "share.lyric.warnedNote":
    "The words sit behind a content warning on the track page",
  "share.lyric.withheldNote":
    "The words are unavailable while this track is offline",
  "share.lyric.missingNote": "This line is no longer in the lyrics",
  // Chapters: listener lists, errors (contract A.7, D) and the editor
  "chapters.listHeading": "Tracklist",
  "chapters.listHeadingFor": "Tracklist for {title}",
  "chapters.listLabel": "Chapters in {title}",
  "chapters.error.outOfRange":
    "Every chapter has to start before the track ends",
  "chapters.error.time": "Write the time as m:ss or h:mm:ss",
  "chapters.error.firstAtZero": "The first chapter starts at 0:00",
  "chapters.error.order": "Start after the chapter above",
  "chapters.error.pastEnd": "Start before the track ends at {time}",
  "chapters.error.titleRequired": "Give this chapter a title",
  "chapters.error.titleTooLong": "Keep the title to 120 characters",
  "chapters.error.artistTooLong": "Keep the artist to 120 characters",
  "chapters.error.tooMany": "Keep it to 100 chapters",
  "chapters.error.summary": "Fix the chapters marked below to save",
  "chapters.editor.heading": "Chapters",
  "chapters.editor.count_one": "{count} chapter",
  "chapters.editor.count_other": "{count} chapters",
  "chapters.editor.hint":
    "Mark where each part of the track starts. Listeners can jump straight to it",
  "chapters.editor.needsAudio": "Add chapters once this track's audio is ready",
  "chapters.editor.timeLabel": "Start time for chapter {number}",
  "chapters.editor.titleLabel": "Title for chapter {number}",
  "chapters.editor.artistLabel": "Artist for chapter {number}, optional",
  "chapters.editor.add": "Add a chapter",
  "chapters.editor.remove": "Remove chapter {number}",
  "chapters.editor.moveUp": "Move chapter {number} up",
  "chapters.editor.moveDown": "Move chapter {number} down",
  "chapters.editor.pasteToggle": "Paste a tracklist",
  "chapters.editor.pasteLabel": "Tracklist, one line per chapter",
  "chapters.editor.pasteHint":
    "For example 00:00 Artist - Title or 1:02:30 Title",
  "chapters.editor.pasteHintEpisode":
    "For example 00:00 Intro or 1:02:30 Interview",
  "chapters.editor.columnTime": "Time",
  "chapters.editor.columnTitle": "Title",
  "chapters.editor.columnArtist": "Artist",
  "chapters.editor.pasteApply": "Use this tracklist",
  "chapters.editor.pasteReplaceNote": "This replaces the chapters above",
  "chapters.editor.pasteUnparsed": "We couldn't read these lines:",
  "chapters.editor.pasteLine": "Line {number}: {text}",
  "chapters.editor.pasteEmpty":
    "Paste at least one line that starts with a time",
  "chapters.editor.pastedStatus_one": "{count} chapter added",
  "chapters.editor.pastedStatus_other": "{count} chapters added",
  // Lyric timing tool (upload/lyrics)
  "lyricTiming.addCta": "Add timings",
  "lyricTiming.editCta": "Edit timings",
  "lyricTiming.summary_one": "{count} line timed",
  "lyricTiming.summary_other": "{count} lines timed",
  "lyricTiming.clearCta": "Clear timings",
  "lyricTiming.mismatch":
    "The lyrics changed since you timed them. Saving clears the timings",
  "lyricTiming.dialogTitle": "Time the lyrics",
  "lyricTiming.dialogSub": "Listeners see each line light up as it plays",
  "lyricTiming.modesLabel": "How to add timings",
  "lyricTiming.mode.tap": "Tap along",
  "lyricTiming.mode.paste": "Paste LRC",
  "lyricTiming.paste.label": "LRC lyrics",
  "lyricTiming.paste.hint":
    "One line per stamp, like [01:23.45] A line of the song. Tags such as [ar:] are skipped and [offset:] is applied",
  "lyricTiming.paste.parsed_one": "{count} line read",
  "lyricTiming.paste.parsed_other": "{count} lines read",
  "lyricTiming.paste.unparsedHeading":
    "These lines have no time we can read and stay out:",
  "lyricTiming.paste.noStamp": "Line {number}: {text}",
  "lyricTiming.paste.tooLong": "Line {number} is over 300 characters",
  "lyricTiming.paste.overLimit": "Keep it to 500 timed lines",
  "lyricTiming.tap.stamp": "Stamp line {number}",
  "lyricTiming.tap.stampVisible": "Stamp",
  "lyricTiming.tap.stampHint": "Press Space or Stamp as each line starts",
  "lyricTiming.tap.left_one": "{count} line left",
  "lyricTiming.tap.left_other": "{count} lines left",
  "lyricTiming.tap.allStamped": "Every line has a time",
  "lyricTiming.tap.earlier": "Line {number} 0.1 seconds earlier",
  "lyricTiming.tap.later": "Line {number} 0.1 seconds later",
  "lyricTiming.tap.playFromHere": "Play from line {number}",
  "lyricTiming.tap.restart": "Start over",
  "lyricTiming.tap.notTimed": "No time yet",
  "lyricTiming.tap.silentClock":
    "This track has no audio to play here, so the clock runs silently",
  "lyricTiming.tap.loading": "Loading the audio",
  "lyricTiming.tap.audioError":
    "We couldn't play the audio. Paste LRC still works",
  "lyricTiming.tap.needsLyrics":
    "Write the lyrics first to tap along, or paste LRC",
  "lyricTiming.preview": "Preview",
  "lyricTiming.saveCta": "Use these timings",
  "lyricTiming.cancelCta": "Cancel",
  "lyricTiming.needAllLines": "Time every line to use these timings",
  "lyricTiming.needLines": "Paste at least one timed line",
  // Upload loudness: measuring, backfill and the check (spec 8.1 to 8.3)
  "upload.loudness.measuring": "Measuring loudness",
  "upload.loudness.backfill_one": "Measuring {count} track",
  "upload.loudness.backfill_other": "Measuring {count} tracks",
  "upload.loudness.heading": "Loudness check",
  "upload.loudness.loudNote":
    "Track {number} measures {lufs} LUFS. Listeners who keep 'Even out loudness' on hear it a little quieter",
  "upload.loudness.peakNote":
    "Track {number} peaks at {peak} dB, at the top of the scale. Studio keeps a raised track's peaks at −1 dB or lower, so it may play a little quieter",
  "upload.loudness.explainerToggle": "How Studio evens out loudness",
  "upload.loudness.explainer":
    "We keep your file <em>exactly as you uploaded it</em>. As it uploads, your browser measures how loud it is. When a listener has 'Even out loudness' on, Studio turns each track up or down toward −14 LUFS, by at most 6 dB up and 12 dB down, and a track it turns up never peaks above −1 dB. Listeners who switch it off hear your master as it is. Nothing is re-encoded",
  "uploadFlow.side.loudness.label": "Loudness",
  "uploadFlow.side.loudness.value": "measured as you upload",
  // ── Studio artist kinds (2026-10-14) ──────────────────────────────────────────
  "format.all": "All",
  "format.music": "Music",
  "format.podcast": "Podcasts",
  "format.spoken_word": "Spoken word",
  "format.performance": "Performance",
  "format.listLabel": "Show one format",
  "releaseType.podcast": "Podcast",
  "releaseType.edit": "Performance edit",
  "releaseType.lip_sync": "Lip-sync mix",
  "genre.spokenWord": "Spoken word",
  "home.newEpisodes.title": "New <em>episodes</em>",
  "home.spokenWord.title": "Spoken <em>word</em>",
  "home.onStage.title": "On <em>stage</em>",
  "home.continue.title": "Continue <em>listening</em>",
  "home.continue.eyebrow": "Kept on this device only",
  "home.continue.minutesLeft_one": "{count} min left",
  "home.continue.minutesLeft_other": "{count} min left",
  "home.shelf.showLess": "Show less",
  "home.pageHeading": "Studio home",
  "home.tabTitle": "Home",
  "episodeCard.playAria": "Play {title}",
  "episodeCard.pauseAria": "Pause {title}",
  "browse.titleFormat": "<em>{format}</em> in Studio",
  "browse.gridLabelFormat": "Everything in {format}",
  "browse.emptyTitleFormat": "Nothing in {format} yet",
  "searchPage.formatLabel": "Format",
  "searchPage.formatAny": "Any format",
  "show.kindLine_one": "Podcast · {count} episode",
  "show.kindLine_other": "Podcast · {count} episodes",
  "show.playLatestCta": "Play latest episode",
  "show.pauseLatestCta": "Pause latest episode",
  "show.aboutHeading": "About the show",
  "show.episodesHeading": "Episodes",
  "show.sortLabel": "Order episodes",
  "show.sortNewest": "Newest",
  "show.sortOldest": "Oldest",
  "show.noEpisodes": "No episodes yet",
  "show.addEpisodeCta": "Add episode",
  "show.draftsHeading": "Drafts",
  "show.draftChip": "Draft",
  "show.editEpisodeCta": "Edit episode",
  "show.savedMeta": "Podcast · {artist}",
  "show.listLabel": "Episodes of {title}",
  "show.nothingToPlay": "No episodes are ready to play yet",
  "show.takenDownReason": "Our team took this show offline",
  "episode.number": "Episode {number}",
  "episode.minutesLeft_one": "{count} min left",
  "episode.minutesLeft_other": "{count} min left",
  "episode.played": "Played",
  "episode.markPlayed": "Mark as played",
  "episode.markUnplayed": "Mark as unplayed",
  "episode.markedPlayedStatus": "{title} marked as played",
  "episode.markedUnplayedStatus": "{title} marked as unplayed",
  "episode.playAria": "Play {title}",
  "episode.pauseAria": "Pause {title}",
  "episode.notesHeading": "Show notes",
  "episode.opensInNewTab": "(opens in a new tab)",
  "episode.playFromAria": "Play from {time}",
  "episode.crumbLabel": "Episode",
  "episode.fromLabel": "From",
  "episode.publishedOn": "Published {date}",
  "episode.draftReason": "This episode is a draft, so it can't play yet",
  "episode.noAudioReason": "This episode's audio isn't ready yet",
  "trackPage.transcriptHeading": "Transcript",
  "trackPage.noTranscript": "No transcript for this one",
  "sources.heading": "Sources",
  "sources.line": "{title} by {artist}",
  "sources.listLabel": "Songs used in {title}",
  "sources.editorHint": "Each song you used, with who made it",
  "sources.titleLabel": "Song title {number}",
  "sources.artistLabel": "Artist {number}",
  "sources.addCta": "Add source",
  "sources.removeCta": "Remove source",
  "sources.removeAria": "Remove source {number}",
  "sources.incomplete":
    "Fill in the song title and the artist on every row, or remove the row",
  "artist.main.showsHeading": "Shows",
  "artist.main.performanceHeading": "Performance audio",
  "owner.addEpisodeAria": "Add episode to {title}",
  "owner.publishTitle": "Publish {title}?",
  "owner.publishBody":
    "It becomes public and anyone with Studio access can play it. You can unpublish it later.",
  "owner.publishConfirm": "Publish release",
  "owner.publishedAnnouncement": "{title} is published",
  "player.skipBack": "Skip back 15 s",
  "player.skipForward": "Skip forward 30 s",
  "player.speed.heading": "Speed",
  "player.speed.value": "{rate}x",
  "player.speed.hint": "Speed applies to podcast episodes. Music plays at 1x",
  "player.announce.nowPlaying": "Now playing {title} by {artist}",
  "player.announce.playing": "Playing",
  "player.announce.paused": "Paused",
  "player.announce.position": "At {time}",
  "player.announce.volume": "Volume {percent}%",
  "player.announce.muted": "Sound muted",
  "player.announce.unmuted": "Sound on",
  "player.announce.shuffleOn": "Shuffle on",
  "player.announce.shuffleOff": "Shuffle off",
  "player.announce.noNextTrack": "Nothing is queued after this track",
  "player.documentTitlePrefix": "Playing:",
  "player.shortcutHint": "{label} ({keys})",
  "uploadFlow.release.showNameLabel": "Show name",
  "uploadFlow.release.showAboutLabel": "About the show",
  "uploadFlow.publish.gap.sources": "Credit every source: {titles}",
  "uploadFlow.publish.rightsLabelSourced":
    "I have permission to share this edit, every source is credited, and I'm happy for QueerPulse members to stream it.",
  "uploadFlow.files.transcriptLabel": "Transcript",
  "uploadFlow.files.lyricsHint":
    "The words as they're sung, one line per sung line",
  "uploadFlow.files.transcriptHint":
    "Everything that's said, so people can read along",
  "uploadFlow.files.notesLabel": "Show notes",
  "uploadFlow.files.notesHint":
    "Web addresses become links, and times like 12:30 become play buttons",
  "uploadFlow.files.countLabel": "{count} of {max}",
  "uploadFlow.files.rejectSizePodcast": "{fileName} is over 250 MB",
  "uploadFlow.files.acceptsPodcast":
    "accepts · <em>MP3 · M4A · WAV · AIFF</em> · up to 250 MB an episode",
  "episodeUpload.newTitle": "New <em>episode</em>",
  "episodeUpload.editTitle": "Edit <em>episode</em>",
  "episodeUpload.forShow": "For {show}",
  "episodeUpload.audioHeading": "Episode audio",
  "episodeUpload.titleLabel": "Episode title",
  "episodeUpload.explicitLabel": "This episode has explicit content",
  "episodeUpload.uploading": "Uploading {fileName}",
  "episodeUpload.converting": "Converting {fileName} to MP3, {percent}%",
  "episodeUpload.convertingLabel": "Converting {fileName} to MP3",
  "episodeUpload.processing": "Reading the audio",
  "episodeUpload.uploadFailed": "The upload stopped. Choose the file again",
  "episodeUpload.chaptersFromNotesCta": "Read chapters from the notes",
  "episodeUpload.chaptersReplaceTitle": "Replace the chapters?",
  "episodeUpload.chaptersReplaceBody_one":
    "The times in the notes replace the {count} chapter you have",
  "episodeUpload.chaptersReplaceBody_other":
    "The times in the notes replace the {count} chapters you have",
  "episodeUpload.chaptersReplaceConfirm": "Replace chapters",
  "episodeUpload.chaptersNoneFound":
    "No line in the notes starts with a time like 12:30",
  "episodeUpload.chaptersRead_one": "Read {count} chapter from the notes",
  "episodeUpload.chaptersRead_other": "Read {count} chapters from the notes",
  "episodeUpload.saveCta": "Save episode",
  "episodeUpload.publishCta": "Publish episode",
  "episodeUpload.savedStatus": "Episode saved",
  "episodeUpload.needsAudio": "Add the audio to publish this episode",
  "episodeUpload.publishedTitle": "<em>{title}</em> is live",
  "episodeUpload.openEpisodeCta": "Open the episode",
  "episodeUpload.anotherCta": "Add another episode",
  "episodeUpload.backToShowCta": "Back to the show",
  "episodeUpload.draftShowTitle": "This show is still a draft",
  "episodeUpload.draftShowBody":
    "Add its first episodes on the Tracks step, then publish the show",
  "episodeUpload.draftShowCta": "Open the show's tracks",
  "episodeUpload.oneFileOnly":
    "An episode takes one file, so we used {fileName}",
  "episodeUpload.scheduledShowTitle": "This show goes out on {date}",
  "episodeUpload.scheduledShowBody": "Episodes you add now go out with it",
  "errors.publishMissingSources":
    "Credit every source on the edit, lip-sync and mix tracks",
  "errors.episodeShowNotPublished": "Publish the show before its episodes",
  "errors.episodeAlreadyPublished": "This episode is already live",
  "errors.episodeOrderLocked":
    "A live show lists its episodes by date, so their order stays as it is",
  "errors.notAPodcast": "Episodes belong to podcast shows",
  "errors.episodeLimit": "A show holds at most 500 episodes",
  "uploadFlow.hero.subShow":
    "Three steps: the show, its episodes, then publish. MP3, M4A, WAV or AIFF, up to 250 MB an episode",
  "uploadFlow.side.size.valueShow": "up to 250 MB an episode",
  "uploadFlow.release.headingShow": "The <em>show</em>",
  "uploadFlow.release.continueCtaShow": "Save and continue to episodes",
  "facts.episodeCount_one": "{count} episode",
  "facts.episodeCount_other": "{count} episodes",
  "episodeUpload.eyebrow": "New episode · upload",
  "episodeUpload.dropTitle": "Drop an MP3, M4A, WAV or AIFF file here",
  "episodeUpload.chooseFile": "Choose an audio file",
  "episodeUpload.cancelCta": "Cancel upload",
  "episodeUpload.cancelFor": "Cancel the upload of {fileName}",
  "episodeUpload.retryCta": "Retry upload",
  "episodeUpload.retryFor": "Retry the upload of {fileName}",
  "episodeUpload.pageTitleNew": "New episode",
  "episodeUpload.pageTitleEdit": "Edit episode",
  "chapters.editor.hintEpisode": "Mark where each part of the episode starts",
  "chapters.editor.pasteEpisode": "Paste chapters",
  "searchPage.episodesHeading": "<em>Episodes</em>",
  "searchPage.documentTitle": "Search",
  "searchPage.seeAll": "See all {count}",
  "searchPage.seeAllMore": "See all {count}+",
  "searchPage.showMore.releases": "Show more releases",
  "searchPage.showMore.tracks": "Show more tracks",
  "searchPage.showMore.artists": "Show more artists",
  "searchPage.showMore.playlists": "Show more playlists",
  "searchPage.showMore.episodes": "Show more episodes",
  "searchPage.showMoreLoading": "Loading more results",
  "searchPage.showMoreError": "We couldn't load more results. {reason}",
  "searchPage.loadingResults": "Loading search results",
  "searchPage.emptyFiltered":
    "We couldn't find anything for <em>{term}</em> with these filters. Remove one to widen the search, and your term stays",
  "searchPage.dropFilterLead": "Try without a filter",
  "searchPage.dropFilter": "Remove the {filter} filter",
  "searchPage.recentHeading": "Recent searches",
  "searchPage.recentClear": "Clear recent searches",
  "searchPage.recentNote":
    "Kept on this device only, and cleared by Quick exit and signing out",
  "searchPage.suggestionsHeading": "Try a search",
  "searchPage.featuredLoading": "Loading featured releases",
  "searchPage.suggestion.fadoReworked": "fado reworked",
  "searchPage.suggestion.saraMarques": "sara marques",
  "searchPage.suggestion.transComposers": "trans composers",
  "searchPage.suggestion.sheetMusic": "sheet music",
  "searchPage.facetsToggle": "Filters",
  "searchPage.facetsToggleCount": "Filters ({count})",
  "artist.showCount_one": "{count} show",
  "artist.showCount_other": "{count} shows",
  "artist.tabs.podcast": "Shows",
  "artist.tabs.spokenWord": "Spoken word",
  "artist.tabs.performance": "Performance",
  // ── Studio collaborative playlists (2026-10-14) ─────────────────────────────
  "errors.playlistNotFound": "This playlist isn't available anymore",
  "errors.playlistOwnerOnly": "Only the playlist's owner can do that",
  "errors.playlistEditorSourceMismatch":
    "This playlist changed. Reload the page and try again",
  "errors.playlistEditorCap":
    "A playlist can have up to 10 editors and invites",
  "errors.playlistEditorIneligible":
    "Some of these people can't be invited right now",
  "errors.playlistInviteUnavailable": "This invite isn't available anymore",
  "errors.playlistInviteNotFound":
    "This invite was already answered or withdrawn",
  "errors.playlistCreditChangeRemovesEditors":
    "Changing who it shows as removes some editors",
  "errors.playlistEntryNotFound": "That track was already removed",
  "errors.playlistEditorNotFound": "That editor was already removed",
  "errors.load.title": "We couldn't load <em>{what}</em>",
  "errors.load.offline":
    "You're offline. Check your Wi-Fi or mobile data and try again",
  "errors.load.timeout":
    "Studio took too long to answer. Try again in a moment",
  "errors.load.rateLimited":
    "You've asked for a lot in a short time. Wait a minute, then try again",
  "errors.load.server":
    "Our server didn't answer. This one is on us, so try again in a moment",
  "errors.load.unreachable":
    "We couldn't reach Studio. Check your connection, or try again in a moment",
  "errors.load.forbidden":
    "Your account doesn't have access to this. Sign in again if you think it should",
  "errors.load.notFound":
    "This isn't available anymore. It may have moved or been taken down",
  "errors.load.restricted":
    "You can't open this while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision",
  "errors.load.unknown": "The request didn't go through. Try again in a moment",
  "errors.save.offline":
    "You're offline, so this wasn't saved. Check your connection and try again",
  "errors.save.timeout":
    "Saving took too long and may not have gone through. Try again",
  "errors.save.rateLimited":
    "You've made a lot of changes in a short time. Wait a minute, then try again",
  "errors.save.server":
    "Our server couldn't save this. This one is on us, so try again in a moment",
  "errors.save.unreachable":
    "We couldn't reach Studio, so this wasn't saved. Check your connection, or try again in a moment",
  "errors.save.forbidden":
    "Your account can't make this change. Sign in again, then try once more",
  "errors.save.notFound":
    "This isn't available anymore, so the change wasn't saved",
  "errors.save.restricted":
    "You can't make changes while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision",
  "errors.save.unknown": "This change didn't go through. Try again",
  "errors.play.offline":
    "You're offline, so this can't play. Check your connection and try again",
  "errors.play.timeout": "The audio took too long to load. Try again",
  "errors.play.rateLimited":
    "You've started a lot of tracks in a short time. Wait a minute, then press play again",
  "errors.play.server":
    "Our audio server didn't answer. This one is on us, so try again in a moment",
  "errors.play.unreachable":
    "We couldn't reach Studio, so this can't play. Check your connection, or try again in a moment",
  "errors.play.forbidden":
    "Your account can't play this. Sign in again, then press play once more",
  "errors.play.notFound":
    "This audio isn't available anymore. Pick another track to keep listening",
  "errors.play.restricted":
    "You can't play this while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision",
  "errors.play.unknown": "This track couldn't start. Try again",
  "errors.upload.offline":
    "You're offline, so the upload stopped. Check your connection and try again",
  "errors.upload.timeout": "The upload took too long to answer. Try again",
  "errors.upload.rateLimited":
    "You've uploaded a lot in a short time. Wait a minute, then try again",
  "errors.upload.server":
    "Our server couldn't take the upload. This one is on us, so try again in a moment",
  "errors.upload.unreachable":
    "We couldn't reach Studio, so the upload stopped. Check your connection, or try again in a moment",
  "errors.upload.forbidden":
    "Your account can't upload here. Check that you picked a persona you manage, then try again",
  "errors.upload.notFound":
    "The release you're uploading to isn't available anymore. Start a new one with Upload a release",
  "errors.upload.restricted":
    "You can't upload while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision",
  "errors.upload.unknown": "The upload didn't go through. Try again",
  "errors.queue.offline":
    "You're offline, so the queue didn't change. Check your connection and try again",
  "errors.queue.timeout": "The queue took too long to update. Try again",
  "errors.queue.rateLimited":
    "You've changed the queue a lot in a short time. Wait a minute, then try again",
  "errors.queue.server":
    "Our server couldn't fill the queue. This one is on us, so try again in a moment",
  "errors.queue.unreachable":
    "We couldn't reach Studio, so the queue didn't change. Check your connection, or try again in a moment",
  "errors.queue.forbidden":
    "Your account can't add this to the queue. Sign in again, then try once more",
  "errors.queue.notFound":
    "That track isn't available anymore, so it was left out of your queue",
  "errors.queue.restricted":
    "You can't change the queue while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision",
  "errors.queue.unknown": "The queue didn't update. Try again",
  "errors.what.release": "this release",
  "errors.what.track": "this track",
  "errors.what.artist": "this artist page",
  "errors.what.scene": "this scene",
  "errors.what.sceneReleases": "this scene's releases",
  "errors.what.playlist": "this playlist",
  "errors.what.liked": "Liked songs",
  "errors.what.show": "this show",
  "errors.what.episode": "this episode",
  "errors.what.pressKit": "this press kit",
  "errors.what.pressTracks": "these tracks",
  "errors.what.creditsInbox": "your credits",
  "errors.what.credits": "the credits",
  "errors.what.persona": "this persona",
  "errors.what.claims": "your claims",
  "errors.what.reviewList": "the review list",
  "errors.what.yourNumbers": "your numbers",
  "errors.what.playbackSettings": "your playback settings",
  "errors.what.preview": "this preview",
  "errors.what.previewLink": "this preview link",
  "errors.what.searchResults": "these results",
  "errors.what.releases": "these releases",
  "errors.what.genres": "the genres",
  "errors.what.newReleases": "the new releases",
  "errors.what.yourPlaylists": "your playlists",
  "errors.what.followedArtists": "the artists you follow",
  "errors.what.featured": "the featured releases",
  "errors.what.savedReleases": "your saved releases",
  "errors.what.access": "your Studio access",
  "errors.what.suggestedArtists": "the artists to follow",
  "playlist.page.manageEditors": "Manage editors",
  "playlist.page.leavePlaylist": "Leave playlist",
  "playlist.page.loadingLabel": "Loading this playlist",
  "playlist.page.nothingToPlay": "Nothing in this playlist can play yet",
  "playlist.collab.chip": "Collaborative",
  "playlist.collab.openAria_one":
    "Collaborative playlist with {count} editor. See who edits it",
  "playlist.collab.openAria_other":
    "Collaborative playlist with {count} editors. See who edits it",
  "playlist.collab.moreCount": "+{count}",
  "playlist.row.addedBy": "Added by {name}",
  "playlist.row.undoCta": "Undo",
  "playlist.row.removedManyToast_one":
    "Removed {count} track from the playlist",
  "playlist.row.removedManyToast_other":
    "Removed {count} tracks from the playlist",
  "playlist.row.restoredToast": "Back in the playlist, in its old place",
  "playlist.row.restoreError":
    "We couldn't put that back in the playlist. Try again",
  "playlist.row.restoredNoneToast":
    "The playlist already holds these tracks, so nothing came back",
  "playlist.row.restoredSomeToast_one":
    "Put {count} of {total} tracks back. The playlist already held the rest",
  "playlist.row.restoredSomeToast_other":
    "Put {count} of {total} tracks back. The playlist already held the rest",
  "playlist.row.removedTitledToast": "Removed “{title}” from the playlist",
  "playlist.invite.bannerTitle": "{name} invited you to edit this playlist",
  "playlist.invite.bannerBody":
    "Editors can add, remove and reorder tracks, and change the name and description",
  "playlist.invite.acceptCta": "Accept invite",
  "playlist.invite.declineCta": "Decline invite",
  "playlist.invite.acceptedToast": "You can now edit {name}",
  "playlist.invite.declinedToast": "Invite declined",
  "playlist.invite.cardChip": "Invited",
  "playlist.invite.acceptingCta": "Accepting invite",
  "playlist.invite.decliningCta": "Declining invite",
  "playlist.editors.title": "Editors",
  "playlist.editors.ownerSubMember":
    "Editors can add, remove and reorder tracks, and change the name and description. Who can open it, who it shows as and deleting it stay with you",
  "playlist.editors.ownerSubPersona":
    "Pick which co-owners of {persona} can edit this playlist",
  "playlist.editors.editorSub": "Everyone who can edit this playlist",
  "playlist.editors.listLabel": "Editors of {name}",
  "playlist.editors.loadingLabel": "Loading editors",
  "playlist.editors.pendingLabel": "Invite sent",
  "playlist.editors.ownerLabel": "Owner",
  "playlist.editors.removeCta": "Remove editor",
  "playlist.editors.removeAria": "Remove {name} as an editor",
  "playlist.editors.cancelInviteCta": "Cancel invite",
  "playlist.editors.cancelInviteAria": "Cancel the invite to {name}",
  "playlist.editors.removeConfirmTitle": "Remove {name} as an editor?",
  "playlist.editors.removeConfirmBody":
    "The tracks they added stay in the playlist",
  "playlist.editors.removedToast": "{name} can't edit this playlist anymore",
  "playlist.editors.inviteCancelledToast": "Invite cancelled",
  "playlist.editors.inviteCta": "Invite editors",
  "playlist.editors.emptyTitle": "Nobody else edits this playlist yet",
  "playlist.editors.emptyBody": "Invite connections to add tracks with you",
  "playlist.editors.loadError": "We couldn't load the editors",
  "playlist.editors.slotsUsed": "{count} of {max} places taken",
  "playlist.editors.slotsFull":
    "All {max} places are taken. Remove an editor or cancel an invite to invite someone new",
  "playlist.editors.invite.title": "Invite editors",
  "playlist.editors.invite.searchLabel": "Search your connections",
  "playlist.editors.invite.loadingPeople": "Loading your connections",
  "playlist.editors.invite.noConnections": "Your connections show up here",
  "playlist.editors.invite.loadError": "We couldn't load your connections",
  "playlist.editors.invite.allListed":
    "Everyone listed already edits this playlist or has an invite",
  "playlist.editors.invite.sendDefaultCta": "Send invites",
  "playlist.editors.invite.sendCta_one": "Send {count} invite",
  "playlist.editors.invite.sendCta_other": "Send {count} invites",
  "playlist.editors.invite.backCta": "Back to editors",
  "playlist.editors.invite.sentToast_one": "Invite sent",
  "playlist.editors.invite.sentToast_other": "{count} invites sent",
  "playlist.editors.invite.ineligible":
    "{names} can't be invited right now. Untick them and try again",
  // Why the server refused each person (2026-10-21): one sentence per reason.
  "playlist.editors.refused.noStudioAccess_one":
    "{names} doesn't have Studio access yet, so they can't edit playlists",
  "playlist.editors.refused.noStudioAccess_other":
    "{names} don't have Studio access yet, so they can't edit playlists",
  "playlist.editors.refused.notConnected_one":
    "{names} isn't one of your connections anymore",
  "playlist.editors.refused.notConnected_other":
    "{names} aren't your connections anymore",
  "playlist.editors.refused.notCoOwner_one":
    "{names} isn't a co-owner of {persona} anymore",
  "playlist.editors.refused.notCoOwner_other":
    "{names} aren't co-owners of {persona} anymore",
  "playlist.editors.refused.notCoOwnerUnnamed_one":
    "{names} isn't a co-owner of this profile anymore",
  "playlist.editors.refused.notCoOwnerUnnamed_other":
    "{names} aren't co-owners of this profile anymore",
  "playlist.editors.refused.blocked_one":
    "{names} can't be invited from your account",
  "playlist.editors.refused.blocked_other":
    "{names} can't be invited from your account",
  "playlist.editors.refused.notFound_one":
    "We couldn't find {names}. They may have left QueerPulse or changed their profile link",
  "playlist.editors.refused.notFound_other":
    "We couldn't find {names}. They may have left QueerPulse or changed their profile links",
  "playlist.editors.refused.isOwner_one": "{names} already owns this playlist",
  "playlist.editors.refused.isOwner_other": "{names} already own this playlist",
  "playlist.editors.refused.creditLapsed":
    "This playlist doesn't show as {persona} anymore, so co-owners of {persona} can't be added. Reload the page to see who it shows as now",
  "playlist.editors.refused.creditLapsedUnnamed":
    "This playlist doesn't show as a persona anymore, so co-owners can't be added. Reload the page to see who it shows as now",
  "playlist.editors.refused.unexplained_one":
    "{names} can't be invited right now",
  "playlist.editors.refused.unexplained_other":
    "{names} can't be invited right now",
  "playlist.editors.refused.untickAndRetry": "Untick them and try again",
  "playlist.editors.refused.untickToSendRest": "Untick them to send the rest",
  "playlist.editors.coOwners.listLabel": "Co-owners of {persona}",
  "playlist.editors.coOwners.searchLabel": "Search co-owners",
  "playlist.editors.coOwners.empty": "{persona} has no other co-owners",
  "playlist.editors.coOwners.noMatch": "No co-owner matches that search",
  "playlist.editors.coOwners.addedToast": "{name} can now edit this playlist",
  "playlist.editors.coOwners.loadError": "We couldn't load the co-owners",
  "playlist.leave.title": "Leave {name}?",
  "playlist.leave.body": "You'll stop editing it. The tracks you added stay",
  "playlist.leave.confirmCta": "Leave playlist",
  "playlist.leave.leftToast": "You left {name}",
  "playlist.creditChange.title": "Change who it shows as?",
  "playlist.creditChange.body_one":
    "{names} will stop editing this playlist. The tracks they added stay",
  "playlist.creditChange.body_other":
    "{names} will stop editing this playlist. The tracks they added stay",
  "playlist.creditChange.bodyUnnamed":
    "Some editors will stop editing this playlist. The tracks they added stay",
  "playlist.creditChange.confirmCta": "Change and remove editors",
  "playlist.add.addToCollaborativeAria":
    "Add to {name}, a collaborative playlist",
  "kit.shelf.seeAll": "See all",
  "kit.shelf.scrollLeft": "Scroll {title} left",
  "kit.shelf.scrollRight": "Scroll {title} right",
  "trackRow.selectAria": "Select {title}",
  "selection.regionLabel": "Selected tracks",
  "selection.prompt": "Choose tracks",
  "selection.count_one": "{count} track selected",
  "selection.count_other": "{count} tracks selected",
  "selection.selectAll": "Select all tracks",
  "selection.clear": "Clear selection",
  "selection.keyboardHint": "Press F6 to reach the actions.",
  "selection.addToPlaylist": "Add to playlist",
  "selection.addToQueue": "Add to queue",
  "selection.removeFromPlaylist": "Remove from this playlist",
  "selection.unlike": "Remove from Liked songs",
  "selection.queuedToast_one": "Added {count} track to your queue",
  "selection.queuedToast_other": "Added {count} tracks to your queue",
  "selection.queueFailedToast":
    "None of these tracks can join your queue right now",
  "selection.nothingPlayableToast":
    "None of the tracks you picked can play right now",
  "selection.pickerSubject_one": "{count} track",
  "selection.pickerSubject_other": "{count} tracks",
  "selection.queueFailedReasonToast":
    "None of these tracks joined your queue. {reason}",
  "selection.queuedSomeToast_one":
    "Added {count} of {total} tracks to your queue. {reason}",
  "selection.queuedSomeToast_other":
    "Added {count} of {total} tracks to your queue. {reason}",
  "selection.countCompact_one": "{count} selected",
  "selection.countCompact_other": "{count} selected",

  // ── Studio polish pass 2: hero/loading states, tracklist, safety help, preview ──
  "hero.shareAria": "Share {title}",
  "hero.blocked.noAudio": "No track here has audio yet",
  "hero.blocked.takenDown": "A taken-down release cannot play",
  "hero.blocked.trackNoAudio": "This track has no audio yet",
  "hero.blocked.artistNoReleases": "No release to play yet",
  "loading.release": "Loading this release",
  "loading.track": "Loading this track",
  "loading.artist": "Loading this artist",
  "loading.scene": "Loading this scene",
  "loading.moreFromArtist": "Loading more from {artist}",
  "loading.detail": "Loading this page",
  "loading.previewLink": "Loading the preview link settings",
  "loading.reviews": "Loading takedown reviews",
  "loading.playlists": "Loading your playlists",
  "loading.openCalls": "Loading open calls",
  "loading.pressTrack": "Loading the track",
  "pageTitle.withdrawn": "Release withdrawn",
  "tracklist.sortLabel": "Sort by",
  "tracklist.sortAria": "Sort by {order}",
  "tracklist.searchPlaceholder": "Search by title, artist or release",
  "tracklist.searchAria": "Search in {name}",
  "tracklist.selectCta": "Select tracks",
  "tracklist.sortCustom": "Playlist order",
  "tracklist.sortRecentlyAdded": "Recently added",
  "tracklist.sortRecentlyLiked": "Recently liked",
  "tracklist.sortTitle": "Title",
  "tracklist.sortArtist": "Artist",
  "tracklist.sortDuration": "Duration",
  "tracklist.noMatch": 'Nothing here matches "{query}"',
  "safety.help.readRights": "Read your rights in Studio",
  "safety.help.contactTeam": "Contact our team",
  "preview.goneTitle": "This preview link is turned off",
  "preview.goneBody":
    "The artist turned this link off or made a new one. Ask them for the current link.",
  "preview.documentTitle": "Preview of {title}",

  // Studio purchases and the supporter wall (2026-10-28)
  "libraryLive.tabs.purchases": "Purchases",
  "purchase.format.album": "Digital album",
  "purchase.format.ep": "Digital EP",
  "purchase.format.single": "Digital single",
  "purchase.format.track": "Digital track",
  "purchase.format.release": "Digital release",
  "purchase.price.nameYourPrice": "Name your price, {amount} or more",
  "purchase.panel.label": "Buy {title}",
  "purchase.panel.buy.album": "Buy album",
  "purchase.panel.buy.ep": "Buy EP",
  "purchase.panel.buy.single": "Buy single",
  "purchase.panel.buy.track": "Buy track",
  "purchase.panel.buy.release": "Buy release",
  "purchase.panel.buyAria": "{action}: {title} by {artist}",
  "purchase.panel.tracksOnly":
    "This release is sold track by track. Pick a track below to buy it",
  "purchase.panel.directNote": "You pay {artist} directly",
  "purchase.panel.ownPersonaLink": "Open payments to confirm",
  "purchase.panel.owned": "In your collection",
  "purchase.panel.downloadCta": "Download tracks",
  "purchase.panel.hideDownloadsCta": "Hide downloads",
  "purchase.panel.pending": "Waiting for {artist} to confirm your payment",
  "purchase.panel.pendingAmount": "You said you paid {amount}",
  "purchase.panel.showWaysToPay": "Show ways to pay {artist}",
  "purchase.panel.hideWaysToPay": "Hide ways to pay",
  "purchase.panel.cancelCta": "Cancel this purchase",
  "purchase.panel.openPurchases": "Open your purchases",
  "purchase.panel.loading": "Loading the price",
  "purchase.cancel.title": "Cancel this purchase?",
  "purchase.cancel.body":
    "{artist} stops seeing your claim. If you already paid, talk to {artist} about it directly",
  "purchase.cancel.confirm": "Cancel purchase",
  "purchase.cancel.keep": "Keep waiting",
  "purchase.cancel.done": "Purchase cancelled",
  "purchase.cancel.failed": "We couldn't cancel this purchase",
  "purchase.sheet.title": "Buy {title}",
  "purchase.sheet.sub": "From {artist}",
  "purchase.sheet.amountHeading": "Amount",
  "purchase.sheet.amountLabel": "Your amount in euros",
  "purchase.sheet.amountHint": "{minimum} or more, up to {cap}",
  "purchase.sheet.quickPicksLabel": "Suggested amounts",
  "purchase.sheet.amountRequired": "Enter an amount in euros, like 5 or 5.50",
  "purchase.sheet.payHeading": "Pay {artist}",
  "purchase.sheet.payIntro": "Pay {amount} with one of these",
  "purchase.sheet.methodsLabel": "Ways to pay {artist}",
  "purchase.sheet.payerLabel": "Name on the payment (optional)",
  "purchase.sheet.payerHint":
    "The name your bank or MB WAY shows to {artist}. Only you and {artist} see it",
  "purchase.sheet.wallLegend": "How you appear on the wall",
  "purchase.sheet.notice":
    "You pay {artist} directly. QueerPulse never handles this money, and any refund is between you and {artist}",
  "purchase.sheet.paidCta": "I've paid",
  "purchase.sheet.createFailed": "We couldn't record your payment",
  "purchase.sheet.doneStatus":
    "{artist} will confirm your payment. Follow it in your purchases",
  "purchase.sheet.loading": "Loading the ways to pay",
  "purchase.reference.label": "Reference code",
  "purchase.reference.line":
    "Add this code to your payment note so {artist} can find it",
  "purchase.reference.loading": "Getting your payment code",
  "purchase.reference.loadFailed": "We couldn't get your payment code",
  "purchase.reference.retryCta": "Get a new payment code",
  "purchase.reference.neededReason":
    "Your payment code is still loading, so I've paid waits for it",
  "purchase.reference.neededReasonFailed": "Get a new payment code first",
  "purchase.reference.copyCta": "Copy code",
  "purchase.reference.copyAria": "Copy code for the payment note",
  "purchase.reference.copied": "Reference code copied",
  "purchase.reference.copyFailed":
    "We couldn't copy the code. Select it and copy it by hand",
  "purchase.status.pending": "Waiting for the artist",
  "purchase.status.confirmed": "Confirmed",
  "purchase.status.declined": "Declined",
  "purchase.status.cancelled": "Cancelled",
  "purchase.status.expired": "Expired",
  "purchase.statusLine.pending": "Waiting for {artist} to confirm",
  "purchase.statusLine.expired":
    "{artist} did not answer within 30 days, so this claim expired. You can buy it again",
  "purchase.statusLine.cancelled": "You cancelled this purchase",
  "purchase.statusLine.declinedAgain":
    "You can start a new purchase from the release page",
  "purchase.declineReason.payment_not_found":
    "{artist} could not find your payment",
  "purchase.declineReason.amount_different":
    "{artist} received a different amount",
  "purchase.declineReason.other": "{artist} declined this purchase",
  "purchase.declineNoteLine": "{artist} added: {note}",
  "purchase.list.heading": "Your <em>purchases</em>",
  "purchase.list.dek":
    "Music you bought straight from artists. Downloads open once the artist confirms your payment",
  "purchase.list.label": "Your purchases",
  "purchase.list.empty":
    "Nothing bought yet. A release or track with a price has a Buy button on its page",
  "purchase.list.showMore": "Show more purchases",
  "purchase.row.amount": "Paid {amount}",
  "purchase.row.date": "Bought {date}",
  "purchase.row.byArtist": "by {artist}",
  "purchase.row.itemGone":
    "This music is no longer on Studio. Your downloads stay",
  "purchase.downloads.heading": "Downloads",
  "purchase.downloads.listLabel": "Tracks of {title} to download",
  "purchase.downloads.formatNote": "MP3 or M4A, as the artist uploaded it",
  "purchase.downloads.cta": "Download",
  "purchase.downloads.ctaAria": "Download {title}",
  "purchase.downloads.failed": "We couldn't start this download",
  "purchase.downloads.demoToast":
    "The demo holds no audio files. On Studio the track saves to your device",
  "purchase.downloads.none": "Nothing to download yet",
  "purchase.downloads.mp3": "MP3",
  "purchase.downloads.m4a": "M4A",
  "purchase.wall.toggle": "Show me on the supporter wall",
  "purchase.wall.body":
    "Members with Studio access see the name and photo you pick on the release page, without any amount",
  "purchase.wall.shownAs": "Shown as {name}",
  "purchase.wall.pickAgain":
    "The persona you picked is gone. Pick how you appear",
  "purchase.wall.pendingNote": "You appear once {artist} confirms your payment",
  "purchase.wall.saved": "You are on the supporter wall as {name}",
  "purchase.wall.removed": "You are off the supporter wall",
  "purchase.wall.saveFailed":
    "We couldn't change your spot on the supporter wall",
  "purchase.inbox.nav": "Payments to confirm",
  "purchase.inbox.badge_one": "{count} payment to confirm",
  "purchase.inbox.badge_other": "{count} payments to confirm",
  "purchase.inbox.pageTitle": "Payments to confirm",
  "purchase.inbox.eyebrow": "Payments",
  "purchase.inbox.title": "Payments to <em>confirm</em>",
  "purchase.inbox.dek":
    "Members tell you here when they paid you. Check your bank, MB WAY or payment page, then confirm or decline. QueerPulse never sees the money",
  "purchase.inbox.personaLabel": "Artist page",
  "purchase.inbox.tabsLabel": "Payments of {name}",
  "purchase.inbox.unknownPersona":
    "That artist page is not one of yours, so this shows {name}",
  "purchase.inbox.tab.confirm": "To confirm",
  "purchase.inbox.tab.sales": "Sales",
  "purchase.inbox.listLabel": "Payments of {name} to confirm",
  "purchase.inbox.empty":
    "No payments waiting. When a member says they paid you, it shows up here",
  "purchase.inbox.reference": "Reference {code}",
  "purchase.inbox.payerName": "Name on the payment: {name}",
  "purchase.inbox.deletedAccount": "Deleted account",
  "purchase.inbox.claimedOn": "Said they paid on {date}",
  "purchase.inbox.confirmCta": "Confirm payment",
  "purchase.inbox.confirmAria": "Confirm payment from {name} for {title}",
  "purchase.inbox.declineCta": "Decline payment",
  "purchase.inbox.declineAria": "Decline payment from {name} for {title}",
  "purchase.inbox.confirmed":
    "Payment confirmed. {name} can download {title} now",
  "purchase.inbox.declined": "Payment declined. {name} sees your reason",
  "purchase.inbox.confirmFailed": "We couldn't confirm this payment",
  "purchase.inbox.declineFailed": "We couldn't decline this payment",
  "purchase.inbox.showMore": "Show more payments",
  "purchase.inbox.loadingMore": "Loading more payments",
  "purchase.decline.title": "Decline this payment?",
  "purchase.decline.body":
    "{name} gets a notification with the reason you pick",
  "purchase.decline.reasonLegend": "Why are you declining?",
  "purchase.decline.reason.payment_not_found": "I can't find the payment",
  "purchase.decline.reason.amount_different": "The amount is different",
  "purchase.decline.reason.other": "Something else",
  "purchase.decline.noteLabel": "Note for {name} (optional)",
  "purchase.decline.notePlaceholder": "A short line, up to 200 characters",
  "purchase.decline.confirm": "Decline payment",
  "purchase.decline.keep": "Keep it waiting",
  "purchase.sales.totalsLabel": "Your sales totals",
  "purchase.sales.last28": "Last 28 days",
  "purchase.sales.allTime": "All time",
  "purchase.sales.count_one": "{count} sale",
  "purchase.sales.count_other": "{count} sales",
  "purchase.sales.note":
    "The payments you confirmed. QueerPulse keeps the record and the money stays between you and your buyers",
  "purchase.sales.listLabel": "Sales of {name}",
  "purchase.sales.empty": "No sales yet. Confirmed payments show up here",
  "purchase.sales.confirmedOn": "Confirmed {date}",
  "purchase.sales.showMore": "Show more sales",
  "purchase.sales.loadingMore": "Loading more sales",
  "purchase.account.pageTitle": "Your music purchases",
  "purchase.account.eyebrow": "Account",
  "purchase.account.title": "Your music <em>purchases</em>",
  "purchase.account.dek":
    "Everything you bought from Studio artists, with its downloads. You keep these with or without Studio access",
  "purchase.account.empty": "No confirmed purchases yet",
  "purchase.account.cardTitle": "Your music purchases",
  "purchase.account.cardDesc":
    "Download the music you bought from Studio artists",
  "purchase.account.cardCta": "Open your music purchases",
  "purchase.price.legend": "Price",
  "purchase.price.trackLegend": "Price of this track",
  "purchase.price.mode.not_for_sale": "Not for sale",
  "purchase.price.mode.fixed": "Fixed price",
  "purchase.price.mode.name_your_price": "Buyers name the price",
  "purchase.price.amountLabel.fixed": "Price in euros",
  "purchase.price.amountLabel.name_your_price": "Minimum in euros",
  "purchase.price.hint.fixed": "From {minimum} to {cap}",
  "purchase.price.hint.name_your_price":
    "From {minimum} to {cap}. Buyers can pay more, up to {cap}",
  "purchase.price.amountRequired": "Enter the price in euros, like 5 or 5.50",
  "purchase.price.directNote":
    "Buyers pay you directly with your ways to get paid, and you confirm each payment",
  "purchase.price.needsMethods": "Add a way to get paid before you set a price",
  "purchase.price.needsMethodsCta": "Add a way to get paid",
  "purchase.price.notOutNote": "Buying opens once the release is out",
  "paymentMethods.label": "Getting paid",
  "paymentMethods.title": "How buyers <em>pay you</em>",
  "paymentMethods.dek":
    "Buyers pay you directly through these. QueerPulse never holds the money",
  "paymentMethods.personaLabel": "Artist page",
  "paymentMethods.listLabel": "Ways to get paid for {name}",
  "paymentMethods.privacyNote":
    "Buyers see these only while they buy or wait for you to confirm",
  "paymentMethods.empty":
    "No ways to get paid yet. Add one before you put music up for sale",
  "paymentMethods.addCta": "Add a way to get paid",
  "paymentMethods.saveCta": "Save ways to get paid",
  "paymentMethods.saved": "Saved. Buyers see these ways to pay {name}",
  "paymentMethods.saveFailed": "We couldn't save your ways to get paid",
  "paymentMethods.rowError": "Way {number}: {reason}",
  "paymentMethods.rowLegend": "Way to get paid {count}",
  "paymentMethods.lastMethodWarning":
    "Music of {name} is for sale, so keep at least one way to get paid",
  "paymentMethods.noPersona": "Getting paid opens once you have an artist page",
  "wall.heading": "Supported by",
  "wall.listLabel": "Members who bought {title}",
  "wall.showAll": "Show all supporters",
  "wall.loadMoreFailed": "We couldn't load more supporters",
  "owner.v3.paymentsLink": "Payments to confirm",
  "owner.v3.gettingPaidLink": "Getting paid",
  "errors.what.purchases": "your purchases",
  "errors.what.paymentMethods": "your ways to get paid",
  "errors.what.sales": "your sales",
  "errors.what.wall": "the supporter wall",
  "errors.what.offer": "the price of this music",
  "errors.what.paymentsInbox": "your payments to confirm",
  "errors.reason.studio_persona_not_found":
    "This artist page is not one you run",
  "errors.reason.studio_release_type_not_for_sale":
    "Only albums, EPs and singles and their tracks can be sold",
  "errors.reason.studio_price_out_of_range":
    "A fixed price runs from €1 to €500, and a minimum from €0 to €500",
  "errors.reason.studio_payment_methods_needed_for_sale":
    "Add a way to get paid before putting music up for sale, and keep one while anything is for sale",
  "errors.reason.studio_payment_methods_limit":
    "An artist can list up to 8 ways to get paid",
  "errors.reason.studio_payment_link_invalid":
    "A payment link must be a full https:// address",
  "errors.reason.studio_payment_mbway_invalid":
    "MB WAY needs a Portuguese mobile number",
  "errors.reason.studio_payment_iban_invalid":
    "Check the IBAN: the country code, length or check digits do not match",
  "errors.reason.studio_purchase_item_required":
    "Choose one release or one track to buy",
  "errors.reason.studio_purchase_item_not_found":
    "This music is not available to you",
  "errors.reason.studio_purchase_own_persona":
    "You are a member of this artist, so you cannot buy its music",
  "errors.reason.studio_purchase_not_for_sale": "This is not for sale",
  "errors.reason.studio_purchase_release_not_published":
    "This release is not out yet, so it cannot be bought",
  "errors.reason.studio_purchase_track_unavailable":
    "This track cannot be bought right now",
  "errors.reason.studio_purchase_unavailable":
    "You cannot buy music from this artist",
  "errors.reason.studio_purchase_no_payment_methods":
    "This artist has not added a way to get paid",
  "errors.reason.studio_purchase_pending_exists":
    "You already told this artist you paid for this; it is waiting for them",
  "errors.reason.studio_purchase_already_owned":
    "This is already in your collection",
  "errors.reason.studio_purchase_amount_below_minimum":
    "The amount is below the artist's minimum",
  "errors.reason.studio_purchase_amount_above_cap":
    "A purchase can be up to €500",
  "errors.reason.studio_purchase_price_changed":
    "The price changed. Check the new price and try again",
  "errors.reason.studio_purchase_reference_invalid":
    "This payment code is too old. Get a new code below, and if you already paid with the old one, put the old code in the name field so the artist can match it",
  "errors.reason.studio_purchase_reference_taken":
    "This payment code was just taken by another purchase. Get a new code below",
  "errors.reason.studio_purchase_not_found":
    "This purchase is not available to you",
  "errors.reason.studio_purchase_not_pending":
    "This purchase was already answered",
  "errors.reason.studio_purchase_wall_not_available":
    "The supporter wall is open to pending and confirmed purchases of an artist still on Studio",
  "errors.reason.studio_purchase_not_confirmed":
    "Downloads open once the artist confirms your payment",
  "errors.reason.studio_download_item_deleted":
    "The artist deleted this music, so it can no longer be downloaded",
  "errors.reason.studio_download_track_removed":
    "This track is no longer on the release",
  "errors.reason.studio_download_release_taken_down":
    "Our team took this release down, so it cannot be downloaded",
  "errors.reason.studio_download_artist_unavailable":
    "This artist page was removed, so its music cannot be downloaded",
  "errors.reason.studio_download_track_withheld":
    "A copyright claim holds this track offline, so it cannot be downloaded",
  "errors.reason.studio_download_track_not_ready":
    "This track has no audio yet",
  "errors.reason.studio_download_track_preparing":
    "We are preparing this file for you. Try again in a few minutes",
  // Studio landing v2 (2026-10-28)
  "founding.badge": "Founding artist",
  "home.founding.title": "Founding <em>artists</em>",
  "landingPreviews.title": "Your music on the Studio page",
  "landingPreviews.sub":
    "Our team picks a few tracks to play to visitors on the Studio page. Visitors hear the whole track, and only with your yes",
  "landingPreviews.listLabel": "Studio page requests",
  "landingPreviews.status.pending": "Waiting for your answer",
  "landingPreviews.status.approved": "Approved for the Studio page",
  "landingPreviews.status.approvedOff":
    "Approved. Off the page while it can't play there",
  "landingPreviews.credited": "You're credited on this track by {artist}",
  "landingPreviews.requestedOn": "Asked on {date}",
  "landingPreviews.approveCta": "Approve preview",
  "landingPreviews.declineCta": "Decline preview",
  "landingPreviews.withdrawCta": "Withdraw preview",
  "landingPreviews.approveLabel": "Approve preview of {track}",
  "landingPreviews.declineLabel": "Decline preview of {track}",
  "landingPreviews.withdrawLabel": "Withdraw preview of {track}",
  "landingPreviews.approveConfirm.title": "Play {track} on the Studio page?",
  "landingPreviews.approveConfirm.body":
    "Anyone who opens the Studio page can play the whole track. You, or anyone credited on it, can withdraw it at any time.",
  "landingPreviews.withdrawConfirm.title": "Take {track} off the Studio page?",
  "landingPreviews.withdrawConfirm.body":
    "It stops playing to visitors within a minute. To bring it back, our team asks again.",
  "landingPreviews.approved": "{track} is approved for the Studio page",
  "landingPreviews.declined": "You declined the preview of {track}",
  "landingPreviews.withdrawn": "{track} leaves the Studio page within a minute",
  "landingPreviews.approveFailed": "We couldn't approve the preview",
  "landingPreviews.declineFailed": "We couldn't decline the preview",
  "landingPreviews.withdrawFailed": "We couldn't withdraw the preview",
  "errors.what.landingPreviews": "the Studio page requests",
  "errors.reason.studio_landing_preview_unavailable":
    "This track is no longer on the Studio page",
  "errors.reason.studio_landing_preview_not_found":
    "This preview is no longer there",
  "errors.reason.studio_landing_preview_track_not_eligible":
    "This track can't play on the Studio page",
  "errors.reason.studio_landing_preview_exists":
    "This track already has an open request or a live preview",
  "errors.reason.studio_landing_previews_full":
    "There are already 10 open previews. Remove one first",
  "errors.reason.studio_landing_preview_no_reachable_owner":
    "Nobody who runs this artist has Studio access, so nobody could answer",
  "errors.reason.studio_landing_preview_not_pending":
    "Someone already answered this request",
  "errors.reason.studio_landing_preview_not_approved":
    "This preview is no longer on the Studio page",
  "errors.reason.studio_landing_preview_main_persona_only":
    "Only the artist who released this track can answer",
  "errors.reason.studio_landing_consent_required":
    "Tick the consent box before you save",
  "errors.reason.studio_landing_persona_not_eligible":
    "This artist can't appear on the Studio page: their page must be published and public",
  "errors.reason.studio_landing_card_exists": "This artist already has a card",
  "errors.reason.studio_landing_cards_full":
    "There are already 6 artist cards. Remove one first",
  "errors.reason.studio_landing_card_not_found": "This card is no longer there",
  "errors.reason.studio_landing_photo_not_yours":
    "Use a photo you uploaded, or keep the one this slot holds",
  "errors.reason.studio_landing_order_mismatch":
    "The list changed while you were moving it. Reload it and try again",
  "errors.reason.studio_founding_persona_not_eligible":
    "This artist can't be a founding artist: their page must be published and public",
  "errors.reason.studio_founding_artist_exists":
    "This artist is already a founding artist",
  "errors.reason.studio_founding_artists_full":
    "There are already 50 founding artists",
  "errors.reason.studio_founding_artist_not_found":
    "This founding artist is no longer on the list",
  "errors.reason.studio_access_request_exists":
    "You already asked for Studio access",
  "errors.reason.studio_access_already_granted":
    "You already have Studio access",
  "errors.reason.studio_access_request_not_found":
    "This request is no longer waiting",
  // Studio purchases: Help and terms on buying and selling
  "helpLive.cat.buying.heading": "Buying and <em>selling</em>",
  "helpLive.cat.buying.blurb": "Prices, paying artists and downloads",
  "helpLive.faq.buying.q": "How do I buy music on Studio?",
  "helpLive.faq.buying.a":
    "Open a release or track with a price and tap Buy. You pay the artist directly with one of their payment links, MB WAY or IBAN, add the payment code the sheet shows to your payment note so the artist can match it, then tap I've paid. Once the artist confirms, download the files in <a>Your purchases</a>. QueerPulse never handles the money, so a refund is between you and the artist.",
  "helpLive.faq.selling.q": "How do I sell my music?",
  "helpLive.faq.selling.a":
    "In <a>Studio settings</a>, add a way to get paid under Getting paid: a payment link, an MB WAY number or an IBAN. Then set a fixed price or a minimum on an album, EP, single or track in the release editor. Buyers pay you directly, and you confirm each payment in Payments to confirm. Mixes, edits, lip-sync mixes and podcasts stay free to play.",
  "termsLive.sec.selling.num": "05: buying and selling music",
  "termsLive.sec.selling.heading": "Selling <em>music</em>",
  "termsLive.sec.selling.p1":
    "Artists can set a price on albums, EPs, singles and their tracks. Buyers pay the artist directly through the artist's own payment link, MB WAY number or IBAN. QueerPulse is not a party to the sale. It does not hold or move the money, and it cannot refund a payment.",
  "termsLive.sec.selling.p2":
    "A purchase unlocks its downloads and the supporter wall once the artist confirms the payment. A refund or a disagreement about money is between the buyer and the artist. If an artist took your payment and did not confirm it, report their artist page to our team.",
};

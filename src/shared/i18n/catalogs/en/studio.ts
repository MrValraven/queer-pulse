import type { Catalog } from "../../types";

/**
 * Studio — the co-op music platform: the logged-in "This week" room, the
 * marketing landing, artist/album/track/set pages, live broadcasts, sheet
 * music store, the creator dashboard (upload, payouts, solidarity fund),
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
  "shell.forward": "Forward",
  "shell.searchPlaceholder": "search artists, tracks, sheet music…",
  "shell.forArtistsCta": "For artists",
  "shell.sustainCta": "Sustain · {price}/mo",

  // ── Brand lockup (repeated across shell/rail/error/sign-in pages) ────────
  "brand.lockup": "Queer<em>Pulse</em>",
  "brand.studioLabel": "Studio",

  // ── Left rail (StudioRail) ─────────────────────────────────────────────────
  "rail.section.contribute": "Contribute",
  "rail.section.governance": "Governance",
  "rail.section.coop": "The co-op",
  "rail.section.library": "In your library",

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
  "rail.governance.flaggedTracks": "Flagged tracks",

  "rail.utility.about": "About the co-op",
  "rail.utility.help": "Help & FAQ",
  "rail.utility.accessibility": "Accessibility",
  "rail.utility.trustTerms": "Trust & terms",

  "rail.foot.sustainedSince": "<em>Sustained</em> by you since {date}.",
  "rail.foot.paid_one":
    "You've paid <b>{amount}</b> to {count} artist this year.",
  "rail.foot.paid_other":
    "You've paid <b>{amount}</b> to {count} artists this year.",

  // ── Mini/full player controls (StudioPlayer + reused elsewhere) ──────────
  "player.prev": "Prev",
  "player.play": "Play",
  "player.next": "Next",
  "player.tipCta": "Tip {amount}",
  "player.payingLine": "<b>paying</b> {amount} to {artist}",

  // ── Logged-in "This week" room hero (StudioPageSections → StudioHero) ────
  "room.hero.onAirEyebrow": "Track {track} · on the air now",
  "room.hero.trackPosition": "Track {current} of {total} · {duration}",
  "room.hero.listening_one": "{count} listening",
  "room.hero.listening_other": "{count} listening",
  "room.hero.addedToast": "Added to your library",
  "room.hero.removedToast": "Removed from your library",
  "room.hero.inLibrary": "In library",
  "room.hero.addLibrary": "Library",
  "room.hero.payNote": "This listen pays {artist} <em>{amount}</em>.",
  "room.hero.tipOnTop": "Tip on top? 100% to her.",

  // ── "This week" set section ───────────────────────────────────────────────
  "room.set.title": "The Wednesday <em>set</em>",
  "room.set.subtitle":
    "Programmed by {curator} · synchronous · {count} in the room",
  "room.set.readPlanCta": "Read the plan",
  "room.set.sideHeading": "In the room with you",
  "room.set.sideSub": "{sustainers} sustainers · {casual} casual · {cities} cities",
  "room.set.ledgerHead": "Ledger · this month",
  "room.set.ledgerPaidArtists": "Paid to artists",
  "room.set.ledgerPlays": "Plays",
  "room.set.ledgerArtistShare": "Artist share",
  "room.set.ledgerPerPlay": "Per play",

  // ── "This week, programmed" tracks section ────────────────────────────────
  "room.tracks.title": "This week, <em>programmed</em>",
  "room.tracks.subtitle":
    "Eight singles, each with a curator's name on it. Rotates Monday.",
  "room.tracks.allCta": "All",
  "room.tracks.perPlay": "per play",

  // ── Error pages (Studio404Page, Studio500Page) ────────────────────────────
  "error.brandAria": "QueerPulse Studio home",
  "error404.eyebrow": "Track not found",
  "error404.title": "This song <em>doesn't exist.</em>",
  "error404.body":
    "The track, set, or page you were after was never recorded, got taken down by the artist, or lives behind a sign-in. No drama — the catalogue is large and the room is warm.",
  "error404.backCta": "Back to the player",
  "error404.goBackCta": "Go back",
  "error404.tryInsteadTitle": "Try one of these instead",
  "error404.link.set.label": "This week's <em>set</em>",
  "error404.link.set.sub": "Live, programmed Mondays",
  "error404.link.search.label": "<em>Search</em> the catalogue",
  "error404.link.search.sub": "Tracks, artists, sheet music",
  "error404.link.library.label": "Your <em>room</em>",
  "error404.link.library.sub": "Saved, sustaining, tipped",

  "error500.eyebrow": "Something dropped out",
  "error500.title": "We lost the <em>recording.</em>",
  "error500.body":
    "A server on our side stumbled mid-take. Your account, your saves, and every artist's payout are safe — this is just the front of house. Give it a second and try again.",
  "error500.tryAgainCta": "Try again",
  "error500.backCta": "Back to the player",
  "error500.statusPrefix": "All payouts and banking unaffected ·",
  "error500.refLine": "ref: {ref} · {timestamp} · the council has been pinged",

  // ── Marketing landing shell (StudioLandingShell) ──────────────────────────
  "landing.nav.aboutCoop": "About the co-op",
  "landing.nav.publicLedger": "Public ledger",
  "landing.nav.howItWorks": "How it works",
  "landing.nav.forArtists": "For artists",
  "landing.footer.tagline":
    "A queer professional network rooted in Lisbon. Studio is one of its rooms — alongside Cinema, Magazine, and Gatherings.",
  "landing.footer.col.studio": "Studio",
  "landing.footer.col.studio.thisWeek": "This week",
  "landing.footer.col.studio.djSets": "DJ sets",
  "landing.footer.col.studio.liveBroadcast": "Live broadcast",
  "landing.footer.col.artists": "Artists",
  "landing.footer.col.artists.submitMusic": "Submit music",
  "landing.footer.col.artists.dashboard": "Artist dashboard",
  "landing.footer.col.artists.revenueSplit": "Revenue split",
  "landing.footer.col.council": "Council",
  "landing.footer.col.council.programming": "Programming",
  "landing.footer.col.council.submissions": "Submissions",
  "landing.footer.col.council.curatorCouncil": "Curator council",
  "landing.footer.col.coop.strategyPlan": "The strategy plan",
  "landing.footer.copyright": "© {year} QueerPulse Studio Co-op CRL — Lisbon",
  "landing.footer.languages": "EN · PT",

  // ── Marketing hero (StudioLandingHero) ────────────────────────────────────
  "landing.hero.onAirNow": "On the air now",
  "landing.hero.clock": "{weekday} · {time} Lisbon",
  "landing.hero.title": "Music, <em>programmed</em> by queer ears.",
  "landing.hero.dek":
    "A co-op streaming room. <em>{sharePercent}</em> of every listen to the artist. <em>{tipPercent}</em> of every tip. The ledger is public. The curators have names. <em>No algorithm has ever set foot in here.</em>",
  "landing.hero.sustainCta": "Sustain the room · {price}/mo",
  "landing.hero.demoCta": "Listen to a demo set · free",

  "landing.demo.eyebrow": "The Wednesday set · free preview",
  "landing.demo.meta":
    "programmed by {curator} · {duration} · {trackCount} tracks · {listening} listening",
  "landing.demo.pauseAria": "Pause preview",
  "landing.demo.playAria": "Play preview",
  "landing.demo.trackPrefix": "Track {n} ·",
  "landing.demo.byLine": "{artist} · from {album}",
  "landing.demo.payNote":
    "This listen pays {artist} <em>{amount}</em> when you're a sustainer. Right now, the room is open as a demo.",
  "landing.demo.quote":
    "“Stay through the second verse of track six. <em>The piano leaves you there on purpose.</em>” — {attribution}, programming lead",

  // ── Four promises (StudioLandingPromises) ─────────────────────────────────
  "landing.promises.eyebrow": "The contract · not the marketing",
  "landing.promises.title":
    "Four <em>promises</em> we make, to artists and listeners.",
  "landing.promises.share.title": "A fair, <em>visible</em> share.",
  "landing.promises.share.body":
    "80% of every listen to the artist. 100% of every tip. The other 20% covers payments, hosting, captions, sheet-music typesetting, and council stipends. The split is on every artist page, every receipt, every album.",
  "landing.promises.humans.title": "A room <em>programmed</em> by humans.",
  "landing.promises.humans.body":
    "Every track on the homepage has a curator's name and a one-paragraph note. No \"popular near you\", no \"made for you\", no infinite scroll. The week is small, hand-built, and dated.",
  "landing.promises.coOwned.title": "Co-owned by the <em>listeners</em>.",
  "landing.promises.coOwned.body":
    "Sustainers ({price}/mo) become voting co-op members after twelve months. They elect the council, approve the rate card, and see every euro on the ledger. The platform is structurally accountable to the room.",
  "landing.promises.privacy.title": "Privacy as a <em>default</em>.",
  "landing.promises.privacy.body":
    "No listening data sold, syndicated, or used to recommend. Personal play history is private and deletable in one click. Aggregate plays exist for the ledger; nothing else leaves the building.",

  // ── Public ledger counter (StudioLandingCounter) ──────────────────────────
  "landing.counter.liveEyebrow": "Live — updated as it happens",
  "landing.counter.title":
    "Since the open beta opened, <em>QueerPulse Studio</em> has paid out:",
  "landing.counter.sub": "to {count} artists, in {cycles} monthly cycles.",
  "landing.counter.seeLedgerCta": "See the ledger",
  "landing.counter.stat.perPlay": "per qualifying play · 15× Spotify",
  "landing.counter.stat.artistShare": "share to artists, aggregate",
  "landing.counter.stat.sustainers": "sustainers in the co-op",
  "landing.counter.stat.councilAnswerTime": "median council answer time",
  "landing.counter.unit.days": "days",

  // ── Per-listen comparison band (StudioLandingComparison) ──────────────────
  "landing.compare.title": "The <em>per-listen rate</em>, by comparison.",
  "landing.compare.spotify.label": "Spotify · avg",
  "landing.compare.spotify.ctx":
    "Pro-rata · ad-blended · about 3 cents per 10 plays",
  "landing.compare.apple.label": "Apple Music",
  "landing.compare.apple.ctx": "Slightly better, still mostly nominal",
  "landing.compare.tidal.label": "Tidal HiFi",
  "landing.compare.tidal.ctx": "User-centric · hi-fi tier only",
  "landing.compare.us.label": "QP Studio · committed floor",
  "landing.compare.us.ctx":
    "No ads · no shareholders · sustainer-pooled. Set annually by vote.",

  // ── Closing CTA band (StudioLandingCta) ───────────────────────────────────
  "landing.cta.title": "Take a <em>seat</em> in the room.",
  "landing.cta.body":
    "{price} a month. Cancel any time. <em>The first listen</em> tells you whether the room is for you.",
  "landing.cta.readPlanCta": "Read the plan first",
  "landing.cta.secondary":
    "Already a QueerPulse member? Studio is <em>{addOnPrice}/mo on top</em>.",
  "landing.cta.secondaryLink": "Sign in to add it",

  // ── Sign in / Join (StudioSignInPage) ─────────────────────────────────────
  "signin.tabs.signIn": "Sign in",
  "signin.tabs.join": "Join",
  "signin.aside.onAirNow": "On the air now · {count} in the room",
  "signin.aside.title": "A streaming co-op that <em>pays</em> the people who made the song.",
  "signin.aside.body":
    "Eighty cents of every euro reaches the artist. Tips pass through at <em>{tipPercent}</em>. The ledger is public, updated every Monday at noon.",
  "signin.aside.paidThisMonth": "Paid to artists this month: <em>{amount}</em> · and counting.",

  "signin.in.title": "Welcome <em>back.</em>",
  "signin.in.lede":
    "Studio is a tab on your QueerPulse account, not a new login. Sign in with the member account you already have.",
  "signin.emailLabel": "Email",
  "signin.emailPlaceholder": "you@example.com",
  "signin.in.submitCta": "Sign in",
  "signin.orDivider": "or",
  "signin.googleContinue": "Continue with Google",
  "signin.googleLoading": "Signing in…",
  "signin.in.newHere": "New here?",
  "signin.in.joinCta": "Join the room",
  "signin.in.freePrompt": "Just want to listen?",
  "signin.in.freeCta": "Stream one set free, no account",
  "signin.in.signedInToast": "Signed in — welcome back",
  "signin.in.signedInGoogleToast": "Signed in with Google — welcome back",

  "signin.join.title": "Join the <em>room.</em>",
  "signin.join.lede":
    "Pick how much of the co-op you want. You can change tiers or cancel any month — no lock-in, no winback emails.",
  "signin.join.chooseTier": "Choose your tier",
  "signin.join.tier.studio.title": "Studio <em>only</em>",
  "signin.join.tier.studio.body":
    "Everything in Studio — the council's weekly set, live rooms, the full catalogue, lossless audio, direct artist subscriptions.",
  "signin.join.tier.studio.incl": "{sharePercent} of your fee reaches artists by play",
  "signin.join.tier.coop.badge": "Best value",
  "signin.join.tier.coop.title": "The whole <em>co-op</em>",
  "signin.join.tier.coop.body":
    "Studio <em>plus</em> Cinema, the Magazine, Gatherings, reading groups, and a vote at the annual assembly. One membership, the entire QueerPulse.",
  "signin.join.tier.coop.incl": "One member account across every surface",
  "signin.join.submitCta": "Continue to payment",
  "signin.join.alreadyMember": "Already a member?",
  "signin.join.notReady": "Not ready?",
  "signin.join.freeCta": "Listen to one free set first",
  "signin.perMonth": "/mo",

  // ── Welcome onboarding wizard (StudioWelcomePage) ─────────────────────────
  "welcome.eyebrow": "You're in · let's set your room",
  "welcome.title": "Welcome to the <em>room</em>, {name}.",
  "welcome.sub":
    "Three quick things and the first set is yours. <em>Skip any of it</em> — none of this is locked in.",
  "welcome.step1.title": "Follow a few <em>artists</em>",
  "welcome.step1.dek":
    "We'll surface their new releases first. Pick three or more — <em>the council picks the rest</em>.",
  "welcome.step1.followedCount_one": "{count} followed",
  "welcome.step1.followedCount_other": "{count} followed",
  "welcome.nextCta": "Next",
  "welcome.step2.title": "Set your default <em>tip</em>",
  "welcome.step2.dek":
    "One tap from the player sends this straight to the artist — <em>100%, no cut</em>. Change it any time.",
  "welcome.skipCta": "Skip",
  "welcome.tip.nod": "a nod",
  "welcome.tip.coffee": "a coffee",
  "welcome.tip.round": "a round",
  "welcome.tip.record": "a record",
  "welcome.step3.title": "How private do you want the <em>room</em>?",
  "welcome.step3.dek":
    "Our defaults are the careful ones. <em>Nothing here is on unless you turn it on.</em>",
  "welcome.step3.history.title": "Keep my listening history",
  "welcome.step3.history.body":
    "A private, deletable record only you see. Off by default — nothing leaves your browser.",
  "welcome.step3.tipNotes.title": "Make my tip notes public",
  "welcome.step3.tipNotes.body":
    "Off keeps every note between you and the artist. You can flip any single note later.",
  "welcome.step3.librarySync.title": "Sync my library across devices",
  "welcome.step3.librarySync.body":
    "Saves and follows move with you. On by default — turn off to keep it on this device only.",
  "welcome.enterRoomCta": "Enter the room",
  "welcome.readyToast": "Your room is ready",
};

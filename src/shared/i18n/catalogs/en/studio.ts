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

  // ── Shared corner-pill tag labels (track/release cards across pages) ──────
  "tag.free": "Free",
  "tag.sustainer": "Sustainer",
  "tag.replay": "Replay",

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
  "room.hero.tipOnTop": "Tip on top? 100% to the artist.",

  // ── "This week" set section ───────────────────────────────────────────────
  "room.set.title": "The Wednesday <em>set</em>",
  "room.set.subtitle":
    "Programmed by {curator} · synchronous · {count} in the room",
  "room.set.readPlanCta": "Read the plan",
  "room.set.sideHeading": "In the room with you",
  "room.set.sideSub":
    "{sustainers} sustainers · {casual} casual · {cities} cities",
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
    'Every track on the homepage has a curator\'s name and a one-paragraph note. No "popular near you", no "made for you", no infinite scroll. The week is small, hand-built, and dated.',
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
  "signin.aside.title":
    "A streaming co-op that <em>pays</em> the people who made the song.",
  "signin.aside.body":
    "Eighty cents of every euro reaches the artist. Tips pass through at <em>{tipPercent}</em>. The ledger is public, updated every Monday at noon.",
  "signin.aside.paidThisMonth":
    "Paid to artists this month: <em>{amount}</em> · and counting.",

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
  "signin.join.tier.studio.incl":
    "{sharePercent} of your fee reaches artists by play",
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

  // ── About the co-op (StudioAboutPage + StudioAboutSections) ──────────────
  "about.hero.eyebrow": "About · written for sceptics",
  "about.hero.title":
    "A streaming co-op that <em>pays</em> the people who made the song.",
  "about.hero.lede":
    "You've heard \"fair pay for artists\" from every platform that underpays them. So here's the arithmetic, the governance, and the honest ceiling — <em>no slogans you can't audit.</em>",

  "about.sec.whatItIs.num": "01 — what it is",
  "about.sec.whatItIs.heading":
    "A listening platform, run as a <em>co-op</em>.",
  "about.sec.whatItIs.p1":
    "QueerPulse Studio is owned by the people who use it — listeners and artists together — not by shareholders or a label. <strong>Eighty cents of every euro a listen generates goes to the artist.</strong> Every cent of every tip. The split is public, the catalogue is curated by an elected council of six, and the masters never leave the artist's hands.",
  "about.sec.whatItIs.p2":
    "It is the third room of the QueerPulse co-op, after the Magazine and Cinema. One membership covers all of it. You can be a member for the writing and never open Studio; you can be here only for the music and never read a word.",
  "about.sec.whatItIs.pull":
    "We are not trying to be a smaller Spotify. We're trying to be a <em>different kind of room</em>.",

  "about.sec.rate.num": "02 — the rate",
  "about.sec.rate.heading":
    "€0.05 a play. A <em>floor</em>, not a marketing number.",
  "about.sec.rate.p1":
    "We commit to <strong>€0.05 per qualifying play</strong> — roughly fifteen times what Spotify pays. A qualifying play is at least 30 seconds, capped at one payout per listener per day so nobody can farm it. The floor can rise by simple majority at the assembly; it can only <em>fall</em> with a two-thirds supermajority. In practice, that means it doesn't fall.",
  "about.sec.rate.footnote":
    "For comparison: at €0.003 a stream, a song needs about 330,000 plays to earn what one here earns in 20,000. We are not pretending that's a small difference.",

  "about.rate.cell.floor.value": "€<em>0.05</em>",
  "about.rate.cell.floor.label": "per qualifying play · the floor",
  "about.rate.cell.share.value": "<em>80</em>%",
  "about.rate.cell.share.label": "of subscription revenue to artists, by play",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label": "of every tip — no platform cut, ever",

  "about.sec.ceiling.num": "03 — what an artist can actually earn",
  "about.sec.ceiling.heading": "Honest about the <em>ceiling</em>.",
  "about.sec.ceiling.p1":
    "Most \"creator economy\" pages show you the top 0.1% and let you assume you're them. Here's what the rate actually produces at four real levels of listening — and where it stops.",

  "about.tier.casual.label": "Casual",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "1,480 qualifying plays — about <em>75 listeners</em> playing one track three times a week. Coffee money, paid monthly.",
  "about.tier.building.label": "Building",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "6,800 plays, two tips, one album buy. A working sideline — <em>rent-adjacent</em> in Lisbon.",
  "about.tier.sustaining.label": "Sustaining",
  "about.tier.sustaining.value": "1,820",
  "about.tier.sustaining.body":
    "36,000 plays, a regular tipping pool, one live room a month. Below the median Portuguese wage — and <em>12× what Spotify pays</em> for the same listening.",
  "about.tier.touring.label": "Touring artist",
  "about.tier.touring.body":
    "Studio will <em>not</em> replace a touring income, and we won't pretend it can. It can, plausibly, replace the rent while you make the next thing.",
  "about.tierFoot":
    "These aren't projections from a pitch deck — they're the live ledger's actual per-stream rate times honest play counts. <em>The real numbers are public, every Monday at noon.</em>",

  "about.sec.governance.num": "04 — who decides",
  "about.sec.governance.heading":
    "An elected <em>council</em>, term-limited, on the record.",
  "about.sec.governance.p1":
    "Six curators program the weekly set, run submission triage, and write a paragraph justifying every pick. They're elected by the whole co-op at the annual assembly, paid a flat €400/mo stipend that appears on the public ledger, and limited to two-year terms with mandatory rotation. <strong>No algorithm decides who gets heard.</strong> A person does, and signs their name to it.",
  "about.sec.governance.p2":
    "The per-listen floor and the split percentages are set yearly by a joint vote of sustainers and artists, with a 20% quorum. If you think the rate is wrong, you don't email support — <em>you vote, or you stand.</em>",

  "about.sec.hardQuestions.num": "05 — the hard questions",
  "about.sec.hardQuestions.heading":
    "The ones you're <em>actually</em> asking.",

  "about.skeptic.broke.q":
    "This sounds lovely and doomed. How does it not go broke?",
  "about.skeptic.broke.a":
    "Honestly, at low scale, the per-listen floor is expensive and a breakout track can cost more in bandwidth than it earns. Our mitigation is boring and public: casual listeners default to AAC, we cache aggressively, and the ledger is reconciled <em>daily</em> so we see red before it's a crisis, not after.",
  "about.skeptic.clique.q": "Curated by six people sounds like a clique.",
  "about.skeptic.clique.a":
    "It can become one — that's the real risk. The guardrails are two-year term limits, forced rotation, and the fact that every pick is published with a name and a reason. <em>A clique that has to explain itself in writing every week is a weaker clique.</em>",
  "about.skeptic.clone.q": "Is this just a Spotify clone with nicer copy?",
  "about.skeptic.clone.a":
    "If the home page were rows of square cover art, yes. The product is editorial on purpose: a programmed weekly set, live listening rooms, payouts visible on every track. <em>If we ever look like a smaller Spotify, hold us to this paragraph.</em>",
  "about.skeptic.leave.q": "What happens to my music if I leave?",
  "about.skeptic.leave.a":
    "You keep your masters and everything you've earned. Takedown is a one-page, 14-day process with no retention loop. Past plays stay paid. Leaving is as easy as arriving — we think that's the only honest way to ask you to stay.",

  "about.cta.title": "The room is small, and it <em>pays</em>.",
  "about.cta.body":
    "Listen to one set free, no account. If it's for you, sustain it for the price of two coffees.",
  "about.cta.join": "Join the room",
  "about.cta.ledger": "Read the public ledger",

  // ── Accessibility (StudioAccessibilityPage) ───────────────────────────────
  "accessibility.hero.eyebrow": "Accessibility · the working list",
  "accessibility.hero.title":
    "Music is for everyone or it <em>isn't music</em>.",
  "accessibility.hero.lede":
    "This is both a statement of intent and a live checklist of what actually works today. Where something's <em>not</em> done yet, we say so — we'd rather be honest than aspirational.",
  "accessibility.statement.p1":
    "QueerPulse Studio commits to meeting <em>WCAG 2.2 AA</em> across every surface, and to treating accessibility as a product requirement, not a compliance afterthought. Deaf and hard-of-hearing people should be able to use a music platform. So should blind and low-vision people, people who navigate by keyboard, and people who need words in their own language.",
  "accessibility.statement.p2":
    "We test with real screen readers and real users — paid, from our own community — every release. <em>If something here doesn't work for you, that's a bug, and we want the report.</em>",

  "accessibility.group.deaf.heading":
    "For Deaf & <em>hard-of-hearing</em> listeners",
  "accessibility.group.deaf.dek":
    "A music platform can't pretend everyone hears it the same way. So we caption the talk and surface the words.",
  "accessibility.item.captions.heading": "Captioned <em>live rooms</em>",
  "accessibility.item.captions.body":
    "Every broadcast is auto-captioned in real time; council broadcasts get a <em>human pass</em>. The talk between songs, the dedications, the artist's asides — all transcribed and adjustable in size.",
  "accessibility.item.lyrics.heading": "Time-synced <em>lyrics</em>",
  "accessibility.item.lyrics.body":
    "Where the artist supplied them, lyrics scroll in time with playback, with the current line highlighted. Readable as a static sheet too, for any track.",
  "accessibility.item.waveforms.heading": "Visual <em>waveforms</em>",
  "accessibility.item.waveforms.body":
    "Live rooms and tracks show a real-time waveform tied to the actual audio, so rhythm and dynamics are visible, not only audible.",
  "accessibility.item.signed.heading": "Signed <em>broadcasts</em>",
  "accessibility.item.signed.body":
    "Flagship council broadcasts include a Portuguese Sign Language (LGP) interpreter window. Expanding to weekly rooms next quarter.",

  "accessibility.group.language.heading":
    "For listeners in <em>any language</em>",
  "accessibility.group.language.dek":
    "The catalogue is mostly in Portuguese, with songs in a dozen other languages. Words shouldn't be a wall.",
  "accessibility.item.translation.heading": "Lyric <em>translation</em>",
  "accessibility.item.translation.body":
    "Community translations sit beside the original. Show one or both at once. Translators are credited and <em>paid from the solidarity fund</em> — translation is labour.",
  "accessibility.item.interfaceLang.heading":
    "Interface in <em>your language</em>",
  "accessibility.item.interfaceLang.body":
    "Studio's chrome ships in Portuguese, English, Spanish and French, with more added as members translate them. Set it in Settings → Captions & lyrics.",

  "accessibility.group.lowVision.heading":
    "For low-vision & <em>keyboard</em> navigation",
  "accessibility.group.lowVision.dek":
    "The whole player is operable without a mouse, and the dark theme is built to clear contrast — not just to look moody.",
  "accessibility.item.contrast.heading": "Contrast that <em>passes</em>",
  "accessibility.item.contrast.body":
    "Body text sits at 4.5:1 or better against the plum; interactive elements at 3:1 minimum, with a high-contrast mode that lifts everything further. Focus rings are always visible.",
  "accessibility.item.screenReader.heading":
    "Screen-reader notes on the <em>player</em>",
  "accessibility.item.screenReader.body":
    "The persistent transport announces track, artist, elapsed time, and <em>what this play pays the artist</em>. Tip and save are labelled buttons; the live tip feed is a polite ARIA live region, never a barrage.",
  "accessibility.item.reducedMotion.heading":
    "Respects <em>reduced motion</em>",
  "accessibility.item.reducedMotion.body":
    "Every decorative animation — the pulse dot, the waveforms, the equaliser bars — stills itself when your system asks for reduced motion. Nothing essential moves.",

  "accessibility.status.live": "Live",
  "accessibility.status.inProgress": "In progress",

  "accessibility.shortcuts.title": "Player <em>keyboard</em> shortcuts",
  "accessibility.shortcuts.dek":
    "Focus anywhere outside a text field. These work the same on every Studio surface, since the transport is always mounted.",
  "accessibility.shortcut.playPause": "Play / <em>pause</em>",
  "accessibility.shortcut.prevNext": "Previous / next <em>track</em>",
  "accessibility.shortcut.volume": "Volume <em>up / down</em>",
  "accessibility.shortcut.tip": "Tip the current artist",
  "accessibility.shortcut.save": "Save to library",
  "accessibility.shortcut.captions": "Toggle <em>captions / lyrics</em>",
  "accessibility.shortcut.search": "Open search",
  "accessibility.key.space": "Space",

  "accessibility.contact.title": "Found a <em>barrier</em>?",
  "accessibility.contact.body":
    "Tell us and we'll treat it as a bug, not a feature request. Reports from assistive-tech users jump the queue — <em>access@queerpulse.org</em>, or flag it from any page's footer. We respond within two working days, with a fix or an honest timeline.",
  "accessibility.contact.reportCta": "Report an access barrier",
  "accessibility.contact.reportToast": "Thanks — we'll treat this as a bug",
  "accessibility.contact.meta":
    "Last audited 2 Jun 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack · next audit Sep 2026",

  // ── Help & FAQ (StudioHelpPage + StudioHelpFaq) ───────────────────────────
  "help.hero.eyebrow": "Help · real people, real answers",
  "help.hero.title": "How can we <em>help</em>?",
  "help.hero.dek":
    "Most answers are below. If they're not, a human reads every message — we don't run a bot maze, and there's no tier of support you have to pay for.",
  "help.searchPlaceholder": "Search help — tipping, payouts, audio quality…",
  "help.searchAria": "Search help",
  "help.searchCta": "Search",
  "help.searchingToast": "Searching the help centre…",

  "help.cat.listening.heading": "Listening & <em>tipping</em>",
  "help.cat.listening.blurb": "Playback, tips, sustaining, library",
  "help.cat.account.heading": "Account & <em>billing</em>",
  "help.cat.account.blurb": "Membership, tiers, privacy, cancelling",
  "help.cat.artists.heading": "For <em>artists</em>",
  "help.cat.artists.blurb": "Uploads, payouts, rights, the rate",

  "help.faq.moneyGo.q": "Where does my money actually go?",
  "help.faq.moneyGo.a":
    "Of your subscription, <strong>80% reaches artists</strong> by play, at a floor of €0.05 each. <em>Every cent of every tip</em> goes to the artist with no platform cut. The rest funds curation stipends, infrastructure, and the solidarity fund. You can see the exact split on the <a>public ledger</a>, updated Mondays at noon.",
  "help.faq.tipNoAccount.q": "Can I tip without an account?",
  "help.faq.tipNoAccount.a":
    "You can <em>listen</em> to one demo set free, but tipping needs an account so the money can route to the artist and mint you a receipt. Sign-up takes under a minute and the first month is on us.",
  "help.faq.tipNotesPrivate.q": "Are my tip notes private?",
  "help.faq.tipNotesPrivate.a":
    "<strong>Yes, by default.</strong> A note you write with a tip is seen only by you and the artist. You can choose to make notes semi-public or public in <a>Settings</a>, and flip any single note later.",
  "help.faq.listeningHistory.q": "Do you keep my listening history?",
  "help.faq.listeningHistory.a":
    "Not unless you turn it on. By default <em>nothing about what you play leaves your browser</em>. If you enable history, it's a private record only you see, erasable in one tap with no confirmation modal.",

  "help.faq.priceDiff.q": "What's the difference between €7 and €11?",
  "help.faq.priceDiff.a":
    "<strong>€7/mo</strong> is Studio only. <strong>€11/mo</strong> is the whole QueerPulse co-op — Studio plus Cinema, the Magazine, Gatherings, reading groups, and a vote at the annual assembly. One membership, every surface. Change tiers any month.",
  "help.faq.cancel.q": "How do I cancel?",
  "help.faq.cancel.a":
    'One click in <a>Settings → Erase & exit</a>. No retention call, no "are you sure" loop, no winback emails. We think leaving should be as easy as arriving — that\'s the only honest way to ask you to stay.',
  "help.faq.dataSold.q": "Is my data sold or used to train anything?",
  "help.faq.dataSold.a":
    "<strong>Never.</strong> We don't sell, share, or train on what you listen to. Aggregate play counts feed the public ledger, but nothing that identifies you. Full detail in the <a>trust & terms</a> page.",

  "help.faq.getPaid.q": "When and how do I get paid?",
  "help.faq.getPaid.a":
    'Monthly, on the 5th, with a €5 floor. SEPA or Stripe Connect. You see the per-stream rate that month, ledger entry numbers, and per-release breakdowns. Collaborators are paid <em>directly</em> — there\'s no "main artist" wallet. See <a>Payouts</a>.',
  "help.faq.keepMasters.q": "Do I keep my masters?",
  "help.faq.keepMasters.a":
    "<strong>Always.</strong> You keep your masters and your rights. You can take any release down in a one-page, 14-day process with no retention loop — and past plays stay paid. See <a>Rights & takedown</a>.",
  "help.faq.realisticEarn.q": "What can I realistically earn?",
  "help.faq.realisticEarn.a":
    "We're honest about the ceiling: roughly €74/mo casual, €340/mo building, €1,820/mo sustaining. Studio won't replace a touring income — but it can replace the rent. The full breakdown is on <a>About Studio</a>.",

  "help.stillStuck.title": "Still <em>stuck</em>?",
  "help.statusOperational": "All systems operational ·",

  "help.contact.email.title": "<em>Email</em> a human",
  "help.contact.email.replyLine": "replies within a day",
  "help.contact.email.action": "Send a message",
  "help.contact.email.toast": "Opening your mail client…",
  "help.contact.forum.title": "Community <em>forum</em>",
  "help.contact.forum.body": "Members helping members <em>· always open</em>",
  "help.contact.forum.action": "Visit the forum",
  "help.contact.forum.toast": "Opening the forum…",
  "help.contact.access.title": "Report an <em>access barrier</em>",
  "help.contact.access.body": "Assistive-tech reports <em>jump the queue</em>",
  "help.contact.access.action": "Accessibility",

  // ── Artist press kit (StudioPressPage + StudioPressBar) ───────────────────
  // Chrome only — the artist's bio, quotes, and boilerplate values are her own
  // authored press material and stay English in both modes (§1).
  "press.copiedToast": "Copied",
  "press.copyFailToast": "Could not copy",
  "press.downloadingPhotosToast": "Downloading press photos · hi-res",
  "press.downloadingPhotoToast": "Downloading photo · hi-res",
  "press.accessRequestedToast":
    "Press access requested — we'll verify you once",
  "press.eyebrow": "Auto-generated press kit · always current",
  "press.fact.from": "From",
  "press.fact.pronouns": "Pronouns",
  "press.fact.since": "Since",
  "press.fact.plays": "Plays",
  "press.fact.forFansOf": "For fans of",
  "press.section.preview": "Streamable <em>preview</em>",
  "press.fullPromoRequestedToast": "Full promo requested",
  "press.requestFullPromoCta": "Request full promo",
  "press.playAria": "Play preview",
  "press.pauseAria": "Pause preview",
  "press.watermarkedBadge": "Watermarked",
  "press.previewNote":
    "This preview carries an <em>inaudible watermark</em> and a spoken QueerPulse tag at the tail. For a clean broadcast master, request the full promo — we verify press once, then you're cleared for everything.",
  "press.section.bio": "<em>Bio</em>",
  "press.copyBothCta": "Copy both",
  "press.bio.shortLabel": "Short · 40 words",
  "press.bio.longLabel": "Long · 120 words",
  "press.section.photos": "Press <em>photos</em>",
  "press.downloadAllCta": "Download all · hi-res",
  "press.downloadOneHint": "Download hi-res",
  "press.section.release": "Latest <em>release</em>",
  "press.outNowBadge": "Out now",
  "press.section.press": "Selected <em>press</em>",
  "press.section.boilerplate": "Facts & <em>boilerplate</em>",
  "press.copyCta": "Copy",
  "press.boilerplate.fullName": "Full name",
  "press.boilerplate.genre": "Genre",
  "press.boilerplate.label": "Label",
  "press.boilerplate.booking": "Booking",
  "press.boilerplate.pronounce": "Pronounce",
  "press.section.contactHeading": "Press & <em>booking</em>",
  "press.viewArtistCta": "View artist page",
  "press.requestAccessCta": "Request press access",
  "press.generatedFooter":
    "Generated by QueerPulse Studio · last refreshed 10 Jun 2026 · this page updates itself as {name} releases",
  "press.bar.crumb": "Press kit · <em>{name}</em>",
  "press.bar.copyLinkCta": "Copy press link",
  "press.bar.downloadAssetsCta": "Download assets",
  "press.bar.copyLinkFailToast": "Could not copy link",
  "press.bar.preparingToast": "Preparing your press assets",

  // ── Trust & terms (StudioTermsPage) ───────────────────────────────────────
  "terms.eyebrow": "The fine print, in plain Portuguese-English",
  "terms.hero.eyebrow": "Trust & terms",
  "terms.hero.title": "The deal, written so you can <em>actually read it</em>.",
  "terms.hero.lede":
    "The full legal terms exist and a lawyer wrote them. But here's the whole thing in plain language first — <em>because a co-op you can't understand isn't really yours</em>.",

  "terms.deal.artists.title": "Artists keep <em>80%</em> & their masters",
  "terms.deal.artists.body":
    "The split is in the deed, not a settings page. <em>The floor can rise, never fall</em> without a two-thirds vote.",
  "terms.deal.tips.title": "Tips are <em>100%</em>, always",
  "terms.deal.tips.body":
    "No platform cut on tips, ever. This one isn't up for a vote — it's a founding term.",
  "terms.deal.data.title": "Your data is <em>never</em> sold",
  "terms.deal.data.body":
    "Not sold, not shared, not used to train anything. History is off by default and erasable in one tap.",
  "terms.deal.leaving.title": "Leaving is <em>one page</em>",
  "terms.deal.leaving.body":
    "Take down work in 14 days, close your account in one click. Past plays stay paid either way.",

  "terms.sec.deed.num": "01 — the co-op deed",
  "terms.sec.deed.heading": "What it means that you <em>own</em> this.",
  "terms.sec.deed.p1":
    "QueerPulse Studio is a registered co-operative. Members — listeners and artists — are the owners, not the customers. That isn't branding: it's a legal structure with a deed you can read, that binds the people running it.",
  "terms.sec.deed.p2":
    "The deed fixes three things the people in charge <strong>cannot quietly change</strong>: the 80% artist floor, the 100% tip pass-through, and the public ledger. Altering the floor downward needs a two-thirds supermajority of the whole membership. The council is <em>elected, term-limited, and paid on the ledger</em>. There are no founder shares and no investor veto.",
  "terms.sec.deed.pull":
    "If we ever start acting like a company that happens to have nice values, the deed is what you hold us to.",
  "terms.sec.deed.footnote":
    "The full deed and the co-op's annual accounts are published every year alongside the <a>transparency report</a>.",

  "terms.sec.licences.num": "02 — licences",
  "terms.sec.licences.heading": "What you can <em>do</em> with the music.",
  "terms.sec.licences.p1":
    "Every release names its licence, picked by the artist. Here's what each one means for you as a listener — and for anyone who wants to reuse the work in a set, a film, or a remix.",
  "terms.sec.licences.footnote":
    "DJ sets are special: a set can include tracks under different licences, and our matcher routes each track's payout to its own artist. <em>Covers are allowed</em>; mechanical royalties are handled through a Portuguese collecting partner, and we don't pay synchronisation — so clearing a cover for film use is on you.",

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

  "terms.sec.privacy.num": "03 — privacy, briefly",
  "terms.sec.privacy.heading": "What we <em>hold</em>, and what we don't.",
  "terms.sec.privacy.p1":
    "We hold your account, your saves, your receipts, and whatever you explicitly turn on. We do <strong>not</strong> hold a profile of your taste to sell, a history you didn't ask us to keep, or anything we'd hand to an advertiser — because we don't have advertisers.",
  "terms.sec.privacy.footnote":
    "Aggregate, de-identified play counts feed the public ledger so artists get paid and the numbers are auditable. You can export everything we hold, or erase it, from <a>Settings → Erase & exit</a> — instantly, no modal, no undo needed because we mean it.",

  "terms.longVersions.title": "The long versions",
  "terms.longVersions.meta":
    "terms v3.2 · privacy v2.1 · co-op deed 2024 · last updated 2 Jun 2026",
  "terms.readFullTermsCta": "Read full terms",
  "terms.readFullTermsToast": "Opening the full legal terms…",
  "terms.readDeedCta": "Read the deed",
  "terms.readDeedToast": "Opening the co-op deed…",

  // ── Rights & takedown (StudioRightsPage) ──────────────────────────────────
  // Chrome only — release titles/meta below are the artist's own releases and
  // stay English in both modes (§1).
  "rights.promise.window.title": "14-day removal",
  "rights.promise.window.body":
    "Confirm a takedown and the release stops being served within 14 days — usually the same night. Caches clear, links 404 to a tasteful page.",
  "rights.promise.paid.title": "Past plays stay paid",
  "rights.promise.paid.body":
    "Every listen up to removal is paid in the next cycle. Taking work down never claws back money already earned.",
  "rights.promise.banking.title": "Banking untouched",
  "rights.promise.banking.body":
    "A takedown is not an account closure. Your SEPA details, your payout schedule, your collaborator splits — all stay live.",

  "rights.hero.eyebrow": "Your work · your call",
  "rights.hero.title": "Rights & <em>takedown</em>.",
  "rights.hero.dek":
    'One page. Your masters are yours — you can take any release off Studio at any time, for any reason or none. No retention team, no exit survey, no "are you sure" loop designed to wear you down.',

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
    "This page only removes individual releases. To close your artist account, end your sustainer membership, and request a full data export, that lives in <a>Settings → Erase & exit</a>. <em>Even then, past payouts are yours to keep</em> and we'll keep paying out any plays that already happened.",

  "rights.takedownStartedToast": '"{title}" enters its 14-day removal window',
  "rights.removalCancelledToast": "Removal cancelled — release stays up",

  // ── Takedown confirm modal (StudioTakedownModal) ──────────────────────────
  "rights.modal.confirmAria": "Confirm takedown of {title}",
  "rights.modal.eyebrow": "Confirm takedown",
  "rights.modal.title": "Take down <em>{title}</em>?",
  "rights.modal.body":
    'It\'ll stop being served within 14 days. Existing links will resolve to a short "this work has been withdrawn by the artist" page. <em>You can re-publish it any time</em> — your masters never leave your hands.',
  "rights.modal.keepEarned":
    "<em>You keep everything already earned.</em> This release stays paid for every play up to removal, in the next cycle.",
  "rights.modal.confirmCta": "Take it down",
  "rights.modal.cancelCta": "Keep it up",

  // ── Album "more from the artist" rail (StudioAlbumMore) ───────────────────
  "album.more.heading": "More from <em>{artist}</em>",
  "album.more.artistPageCta": "Artist page",

  // ── Shared detail-page hero/ledger chrome (Album/Set — masculine nouns in
  //    pt-PT; Track/Collection reuse the feminine room.hero.addedToast /
  //    removedToast above instead, per grammatical gender agreement) ────────
  "detail.shareCta": "Share",
  "detail.linkCopiedToast": "Link copied to clipboard",
  "detail.copyFailedToast": "Could not copy link",
  "detail.tipArtistCta": "Tip {artist}",
  "detail.fullLedgerCta": "Full ledger",
  "detail.addedToast": "Added to your library",
  "detail.removedToast": "Removed from your library",

  // ── Track detail page (StudioTrackPage + Hero + Sidebar + Lyrics) ─────────
  // Scope note: track title, artist name, curator quote, lyrics, and the
  // per-track split/credits breakdown are content — left English (§1).
  "track.hero.eyebrow": "Track {current} of {total} · playing now in the set",
  "track.hero.payMonth": "<em>{amount}</em> to {artist} this month",
  "track.inSet.status":
    "You're listening with <b>{count}</b> people in the <em>Wednesday set</em>, programmed by {curator}. Track {next} starts in <b>{countdown}</b>.",
  "track.inSet.joinCta": "Join the room",
  "track.more.fullAlbumCta": "Full album",
  "track.sidebar.curatorNoteLabel": "Curator's note",
  "track.sidebar.splitHeading": "Where €1 goes when you play this",
  "track.sidebar.creditsHeading": "Credits · per-track splits",
  "track.sidebar.leadSheetLabel": "Lead sheet",
  "track.sidebar.downloadCta": "Download",
  "track.lyrics.heading": "Lyrics & <em>translation</em>",
  "track.lyrics.leadSheetChordsCta": "Lead sheet & chords",

  // ── Album detail page (StudioAlbumPage + Hero + Main + Sidebar) ───────────
  // Scope note: album title, artist name, liner notes and credits prose are
  // content — left English (§1).
  "album.tabs.tracklist": "Tracklist",
  "album.tabs.linerNotes": "Liner notes",
  "album.tabs.credits": "Credits",
  "album.main.perPlaySuffix": "{amount} / play",
  "album.sidebar.buyEyebrow": "The room is open to you",
  "album.sidebar.buySub": "Buy the album · keep it offline · FLAC + AAC.",
  "album.sidebar.buyCta": "Buy · {amount}",
  "album.sidebar.payWhatYouCanCta": "Pay what you can · {amount} min",
  "album.sidebar.streamingIncludedCta": "Streaming included with Sustain",
  "album.sidebar.ledgerHeading": "Public ledger for <em>this release</em>",
  "album.sidebar.paidToArtistLifetime": "Paid to {artist}, lifetime",
  "album.sidebar.paidToCollaborators": "Paid to collaborators",
  "album.sidebar.playsThisMonth": "Plays this month",

  // ── Artist profile page (StudioArtistPage + Hero + Main + Sidebar) ────────
  // Scope note: artist bio prose is content — left English (§1).
  "artist.tabs.music": "Music",
  "artist.tabs.featuredIn": "Featured in",
  "artist.tabs.sheetMusic": "Sheet music",
  "artist.tabs.about": "About",
  "artist.hero.followCta": "Follow",
  "artist.hero.followingCta": "Following",
  "artist.hero.followedToast": "Following {artist}",
  "artist.hero.unfollowedToast": "Unfollowed {artist}",
  "artist.hero.subscribeNote":
    "Subscribe at <em>{amount}/mo</em>, direct to {artist}, no platform cut.",
  "artist.hero.tipOnTopNote": "Or tip on top of streaming.",
  "artist.main.releasesHeading": "Releases",
  "artist.main.singlesHeading": "Singles & <em>standalones</em>",
  "artist.sidebar.sustainEyebrow": "Sustain {artist} directly",
  "artist.sidebar.sustainSub":
    "Direct to {artist}. No platform cut. Subscribers get early-access tracks, the weekly note, and seats at every live broadcast.",
  "artist.sidebar.subscribeCta": "Subscribe · {amount}/mo",
  "artist.sidebar.oneOffTipCta": "One-off tip",
  "artist.sidebar.thisMonthHeading": "{artist} · this month",
  "artist.sidebar.plays": "Plays",
  "artist.sidebar.earningsStreaming": "Earnings (streaming)",
  "artist.sidebar.tipsReceived": "Tips received",
  "artist.sidebar.directSubscribers": "Direct subscribers",
  "artist.sidebar.upcomingHeading": "Upcoming",
  "artist.sidebar.premiereLabel": "Premiere",
  "artist.sidebar.rsvpCta": "RSVP",

  // ── Live set detail page (StudioSetPage) ──────────────────────────────────
  // Scope note: set title, curator name and blurb are content — left English.
  "set.page.playAria": "Play set",
  "set.page.joinLiveRoomCta": "Join the live room",
  "set.page.tracklistHeading": "The <em>tracklist</em>",
  "set.page.everyPlayPaysNote": "Every play pays the artist",
  "set.page.payingNowLabel": "paying now",

  // ── Collection detail page (StudioCollectionPage) ─────────────────────────
  // Scope note: collection title, curator name and track titles are content.
  "collection.page.playAria": "Play collection",
  "collection.page.shuffleCta": "Shuffle",
  "collection.page.shufflingToast": "Shuffling the collection",
  "collection.page.allPlaysPaidNote": "paid to artists on every listen",
  "collection.page.inThisCollectionHeading": "In this <em>collection</em>",
  "collection.page.findMoreCta": "Find more",
  "collection.page.relatedHeading": "Related <em>collections</em>",

  // ── Off-air shelves (StudioOffAirShelves) ─────────────────────────────────
  "offAir.carryOn.heading": "Carry on where you <em>left off</em>",
  "offAir.carryOn.sub": "From your library · plays on, broadcast or not",
  "offAir.libraryCta": "Library",
  "offAir.perPlay": "per play",
  "offAir.quietHours.heading": "For the <em>small hours</em>",
  "offAir.quietHours.sub": "Council collections that don't need the lights on",
  "offAir.allCta": "All",

  // ── Withdrawn-release page (StudioWithdrawnPage) ──────────────────────────
  "withdrawn.hero.eyebrow": "Withdrawn by the artist",
  "withdrawn.hero.title": "This work has been <em>taken down</em>.",
  "withdrawn.hero.sub":
    "The artist removed it from Studio — their right, their call. <em>No reason is owed</em>, and we don't ask for one.",
  "withdrawn.card.title": "What this <em>means</em>",
  "withdrawn.card.body":
    "A takedown isn't a deletion of the work itself — the masters stay with the artist, who can re-publish any time. It just means it's no longer served here. If you'd bought or saved it, it stays in your library as a record, marked withdrawn.",
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
  "endCard.paidThisMonth": "€11,940 paid to artists this month",
  "endCard.perPlayLabel": "a play",
  "endCard.perTipLabel": "of every tip",
  "endCard.listenCta": "listen with pride",

  // ── Curation council (StudioCouncilPage) ──────────────────────────────────
  // Chrome only — curator seats/bios/notebooks/slates below are each
  // curator's own record and stay English in both modes (§1).
  "council.hero.eyebrow": "Governance · the council",
  "council.hero.title": "Six people decide what the room <em>hears</em>.",
  "council.hero.dek":
    "Elected yearly by the assembly, paid a flat stipend on the public ledger, term-limited to two years. They program the weekly set, run triage, and write the notes. <em>Everything they pick has their name on it.</em>",
  "council.intro.lede":
    "The council isn't a tastemaker board behind glass. They listen in the open, <em>justify every pick in a paragraph</em>, and answer for the rate. You can read their notebooks, see their slates, and vote them out.",

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
  "settings.eyebrow": "Your room · settings",
  "settings.title": "How the room <em>treats</em> you.",
  "settings.dek":
    "Audio, privacy, captions, tipping. Nothing here is on unless you turn it on — and anything you turn on, you can erase in <em>one tap, no confirmation modal</em>.",

  "settings.audio.label": "Audio",
  "settings.audio.title": "Sound <em>quality</em>",
  "settings.audio.dek":
    "FLAC is lossless and bigger; AAC is lighter on data. Streaming and downloads can differ — pick per context.",
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
  "settings.audio.crossfade.heading": "Crossfade between tracks in a set",
  "settings.audio.crossfade.body":
    "Only applies inside DJ sets and live rooms, never on album playback.",

  "settings.privacy.label": "Privacy",
  "settings.privacy.title": "What the room <em>remembers</em>",
  "settings.privacy.dek":
    "The short version: almost nothing, by default. We never sell, share, or train on what you play. Aggregate plays feed the public ledger — nothing that identifies you.",
  "settings.privacy.history.heading": "Listening history",
  "settings.privacy.history.body":
    "Off by default — nothing about what you played leaves your browser. Turn on for a private, deletable record only you can see.",
  "settings.privacy.cloudSync.heading": "Cloud-sync my library",
  "settings.privacy.cloudSync.body":
    "Saves and follows move between devices. Without this they live on this device only.",
  "settings.privacy.tipNotes.heading": "Tip notes — who sees them",
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
    'Each tip mints a receipt showing the split — no personal data. On, it can be shared as a "look what the room paid this artist" card.',

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
    "What the one-tap tip pill sends. 100% reaches the artist — there is no platform cut on tips, ever.",
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
  "settings.erase.history.heading": "Erase my listening history",
  "settings.erase.history.note":
    "Wipes the private record from this device and the cloud. <em>Done instantly. No undo.</em>",
  "settings.erase.history.cta": "Erase history",
  "settings.erase.history.toast":
    "History erased — gone from this device and the cloud.",
  "settings.erase.export.heading": "Download everything we hold on you",
  "settings.erase.export.note":
    "A JSON of your saves, tips, receipts and settings — emailed within the hour.",
  "settings.erase.export.cta": "Request export",
  "settings.erase.export.toast":
    "We'll email your data export within the hour.",
  "settings.erase.closeAccount.heading": "Close my Studio account",
  "settings.erase.closeAccount.note":
    "Stops your sustainer fee, removes your library. Past tips stay paid to artists. <em>Banking, if you're also an artist, is untouched.</em>",
  "settings.erase.closeAccount.cta": "Close account",
  "settings.erase.closeAccount.toast":
    "Account closure opens in a separate flow.",

  // ── Notifications (StudioNotificationsPage) ───────────────────────────────
  // Chrome only — each notification's names/tracks/quotes below are content,
  // API-sourced in live mode, and stay English in both modes (§1).
  "notifications.eyebrow": "Your room · what happened while you were out",
  "notifications.title": "The room's been <em>busy</em>.",
  "notifications.dek":
    "Tip replies from artists, new releases from people you follow, live rooms about to open. <em>Only the things you asked to hear about</em> — tune it in Settings.",
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
  "notifications.action.joinRoom": "Join the room",
  "notifications.action.rsvp": "RSVP",

  // ── Tip modal (StudioTipModal — reused across Studio pages) ───────────────
  "tipModal.dialogAria": "Send a tip to {recipient}",
  "tipModal.closeAria": "Close",
  "tipModal.eyebrow": "Tip · 100% to the artist",
  "tipModal.title": "Send a tip to <em>{recipient}</em>",
  "tipModal.sub":
    "Tips pass through untouched — every cent lands with {recipient}.",
  "tipModal.customPlaceholder": "Custom amount",
  "tipModal.sendingCta": "Sending…",
  "tipModal.sendCta": "Tip {amount}",
  "tipModal.note":
    "Pays {recipient} on top of streaming · <em>nothing skimmed</em>",
  "tipModal.success.title":
    "Thank you — that's <em>{amount}</em> to {recipient}.",
  "tipModal.success.body":
    "100% of your tip reaches {recipient} directly. No platform cut, no processing skimmed off the top.",
  "tipModal.success.backCta": "Back to the music",

  // ── Creator back-office nav (StudioCreatorShell) ───────────────────────────
  "creator.nav.dashboard": "Dashboard",
  "creator.nav.newRelease": "New release",
  "creator.nav.payouts": "Payouts",
  "creator.product": "Creator",
  "creator.viewPublicPageCta": "View public page",

  // ── Your library (StudioLibraryPage) ───────────────────────────────────────
  // Chrome only — album/set/track/collection titles and artist names in the
  // mock library below are content and stay English in both modes (§1).
  "library.eyebrow": "Your library",
  "library.title": "Everything you've <em>kept.</em>",
  "library.dek":
    "Saved albums, sets, and tracks — and the <em>{amount}</em> you've paid {artistCount} artists this year by listening here.",
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
    "Nothing in <em>{category}</em> yet. Wander the studio, and anything you save lands right here — yours to come back to.",
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
    "We couldn't find anything for <em>{term}</em>. Try a different word, or loosen the filter — the catalogue is bigger than it looks.",
  "search.empty.clearCta": "Clear search",

  // ── Creator dashboard (StudioDashboardPage + Charts + Side) ────────────────
  // Chrome only — the artist's name, track titles, per-artist figures
  // (STATS/CURATORS/CITIES/BARS in studioDashboard.data), and the specific
  // live-room/payout plans below are this artist's own data, API-sourced in
  // live mode, and stay English in both modes (§1).
  "dashboard.hero.eyebrow": "Studio · this month",
  "dashboard.hero.title": "Good week, <em>{name}</em>.",
  "dashboard.hero.sub":
    "<em>{trackTitle}</em> is two months old and still climbing — the curators kept it in rotation.",

  "dashboard.stats.playsThisMonth": "Plays · this month",
  "dashboard.stats.streamingEarnings": "Streaming earnings",
  "dashboard.stats.tipsReceived": "Tips received",
  "dashboard.stats.nextPayout": "Next payout · {date}",

  "dashboard.charts.dailyPlays.heading": "Daily plays · <em>last 14 days</em>",
  "dashboard.charts.curators.heading":
    "Curators & <em>placements</em> · what landed your work this week",
  "dashboard.charts.geography.heading": "Where they're <em>listening</em> from",
  "dashboard.charts.geography.hint":
    "City-level only · we never see street or finer. <em>This is the most we'll ever tell you about a listener.</em>",

  "dashboard.side.quickActions.heading": "Things you can <em>do</em> from here",
  "dashboard.side.quickActions.upload.label": "Upload a new release",
  "dashboard.side.quickActions.upload.hint": "WAV / FLAC · 3 steps · 8 minutes",
  "dashboard.side.quickActions.goLive.label": "Go live — host a listening room",
  "dashboard.side.quickActions.payouts.label": "Review payouts & banking",
  "dashboard.side.deal.eyebrow": "The deal, always",
  "dashboard.side.deal.heading": "80% to <em>you.</em>",
  "dashboard.side.deal.body":
    "Every play, every tip, every buy. The split is the same for a first release as for a festival winner — and it's printed on the public ledger.",
  "dashboard.side.deal.perPlay.label": "Per play",
  "dashboard.side.deal.yourShare.label": "Your share",
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
    "An EP, an album, a single — same flow. We'll figure out track order from filenames.",
  "upload.dropzone.accepts":
    "accepts · <em>WAV · FLAC · AIFF</em> · max 96 kHz / 24 bit · up to 24 tracks",

  "upload.files.heading":
    "Uploaded <em>{readyCount} of {totalCount} ready</em>",
  "upload.files.okReady": "OK · ready",
  "upload.files.loudnessCheck": "Loudness check",
  "upload.files.loudWarning.title": "Track {trackNumber} is loud.",
  "upload.files.loudWarning.body":
    "Master comes in at {measuredLoudness} — our floor is {targetLoudness} default. <em>This isn't fatal:</em> we can normalise on the fly per listener. If you intended this peak, leave it.",
  "upload.files.loudToggle.show": "What we do with loud masters",
  "upload.files.loudToggle.hide": "What we do with loud masters",
  "upload.files.loudExplainer":
    "We keep your master <em>exactly as delivered</em> and store it untouched. For playback we apply per-listener loudness normalisation to roughly −14 LUFS, so your track sits at a comfortable level next to everything else in a set — <em>without re-encoding or clipping your file</em>. Listeners who turn normalisation off in their settings hear your original peak. Nothing is baked in; you can change the target or opt out per release at any time.",

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

  "upload.side.files.eyebrow": "What we do with your files",
  "upload.side.files.title": "Yours, <em>still</em>.",
  "upload.side.files.body":
    "You drop the masters; we transcode and stream. Your original WAV / FLAC stays your property — we hold a copy <em>only</em> for delivery. Takedown removes the listening copy in 14 days. Non-exclusive, always.",
  "upload.side.files.list.sourceKept.label": "Source kept",
  "upload.side.files.list.sourceKept.value": "your file, untouched",
  "upload.side.files.list.listenerDelivery.label": "Listener delivery",
  "upload.side.files.list.listenerDelivery.value": "FLAC + AAC 256",
  "upload.side.files.list.loudnessTarget.label": "Loudness target",
  "upload.side.files.list.loudnessTarget.value": "−14 LUFS",
  "upload.side.files.list.isrc.label": "ISRC assignment",
  "upload.side.files.list.isrc.value": "automatic",

  "upload.side.lyrics.eyebrow": "Lyrics & translations",
  "upload.side.lyrics.title": "Lyrics <em>required</em>, translations paid.",
  "upload.side.lyrics.body":
    "Upload lyrics in any language. For a line-by-line translation, the solidarity fund pays a community translator <em>€40 per song</em>. They keep their byline; you approve before publish.",
  "upload.side.lyrics.list.autoTranscribe.label": "Auto-transcribe",
  "upload.side.lyrics.list.autoTranscribe.value": "free · ~94%",
  "upload.side.lyrics.list.communityTranslation.label": "Community translation",
  "upload.side.lyrics.list.communityTranslation.value": "€40 → translator",
  "upload.side.lyrics.list.approval.label": "Your approval",
  "upload.side.lyrics.list.approval.value": "before publish",

  "upload.metadata.heading": "Metadata & <em>credits</em>",
  "upload.metadata.sub":
    "A few last details and your release goes to the council queue for review.",
  "upload.metadata.field.title": "Release title",
  "upload.metadata.field.year": "Release year",
  "upload.metadata.field.genre": "Primary genre",
  "upload.metadata.genre.fado": "Fado / contemporary",
  "upload.metadata.genre.electronic": "Electronic",
  "upload.metadata.genre.folk": "Folk",
  "upload.metadata.genre.experimental": "Experimental",
  "upload.metadata.backCta": "Back to files",
  "upload.metadata.submitCta": "Submit for review",

  "upload.submitted.title": "Submitted for <em>review.</em>",
  "upload.submitted.body":
    "Your release is in the council queue. A curator will check the files, splits and credits — usually within a day or two — and you'll get a note the moment it's live. Nothing publishes without your final yes.",
  "upload.submitted.viewPayoutsCta": "View your payouts",
  "upload.submitted.toast": "Release submitted for review",

  "upload.continueToMetadataCta": "Continue to metadata",

  // ── Payouts (StudioPayoutsPage + Sections + Skeletons) ─────────────────────
  // Chrome only — this artist's actual payout figures, IBAN/tax/contact
  // details, and per-track breakdown below are her own financial data,
  // API-sourced in live mode, and stay English in both modes (§1).
  "payouts.hero.eyebrow": "Payouts & banking",
  "payouts.hero.title": "<em>{amount}</em> lands on day {day}.",
  "payouts.hero.sub":
    "Paid monthly by SEPA transfer, with your recibo verde issued automatically. No minimums you didn't choose.",
  "payouts.hero.breakdownEyebrow": "{month} payout · breakdown",

  "payouts.summary.fromStreaming": "From streaming",
  "payouts.summary.fromTips": "From tips",
  "payouts.summary.fromAlbumBuys": "From album buys",
  "payouts.summary.directSubs": "Direct €3/mo subs",
  "payouts.summary.splitsRouted": "Splits routed to others",
  "payouts.summary.toYourIban": "→ to your IBAN",

  "payouts.list.heading": "Recent <em>payouts</em>",
  "payouts.list.exportCsv": "Export CSV",
  "payouts.list.status.pending": "Pending",
  "payouts.list.status.paid": "Paid",

  "payouts.breakdown.heading": "This month, <em>track-by-track</em>",
  "payouts.breakdown.rateNote":
    "€0.05 per qualifying play (≥30s, capped 1/listener/track/day). Updates nightly at 02:00 Lisbon.",
  "payouts.breakdown.subtotalLabel":
    "Streaming subtotal · before splits + tips + buys",

  "payouts.sidebar.methodEyebrow": "Payout method · active",
  "payouts.sidebar.methodHeading": "Sending to <em>SEPA</em>",
  "payouts.sidebar.method.sepa.label": "SEPA — IBAN",
  "payouts.sidebar.method.sepa.badge": "Active",
  "payouts.sidebar.method.stripe.label": "Stripe Connect",
  "payouts.sidebar.method.stripe.hint": "connected · backup, not primary",
  "payouts.sidebar.method.stripe.switchCta": "Switch",
  "payouts.sidebar.method.coopCredit.label": "Co-op credit",
  "payouts.sidebar.method.coopCredit.hint":
    "spend at Casa do Comum, rehearsal rooms · €0 fees",
  "payouts.sidebar.method.coopCredit.addCta": "Add",

  "payouts.preferences.heading": "Payout <em>preferences</em>",
  "payouts.preferences.threshold.label": "Minimum threshold",
  "payouts.preferences.threshold.opt5": "€5 (default · ships every month)",
  "payouts.preferences.threshold.opt20": "€20 (quarterly · save on fees)",
  "payouts.preferences.threshold.opt100": "€100 (hold & release on request)",
  "payouts.preferences.threshold.hint":
    "Below threshold rolls over to next month.",
  "payouts.preferences.taxResidency.label": "Tax residency",
  "payouts.preferences.taxResidency.hint":
    "We auto-issue your IRS recibo verde for each payout.",
  "payouts.preferences.notificationEmail.label": "Notification email",

  "payouts.export.headers.period": "Period",
  "payouts.export.headers.date": "Date",
  "payouts.export.headers.detail": "Detail",
  "payouts.export.headers.amount": "Amount (EUR)",
  "payouts.export.headers.status": "Status",
  "payouts.export.toast": "Payout history exported as CSV",

  // ── Programme the week (StudioProgramPage + Inbox + Slate) ────────────────
  // Chrome only — submission/track/collection/broadcast titles, quotes, and
  // curator notes below are content (each writer/artist's own submission or
  // this curator's own note), API-sourced in live mode, and stay English
  // in both modes (§1).
  "program.header.eyebrow":
    "Programming the room · Monday morning · drag anything below",
  "program.header.title": "Week <em>{weekNumber}</em> · {dateRange}",
  "program.header.sub":
    "Build the slate of the week: <em>one cover, 12 — 16 tracks, 2 — 3 collections, broadcasts</em>. Press publish at noon and the homepage rotates.",
  "program.header.autosave": "Auto-saved · {time} — every keystroke",
  "program.header.previewRoomCta": "Preview the room",

  "program.publishBar.status":
    "Slate is <em>{percent}% complete</em> · publishes {publishDate} · auto-rotates the homepage",
  "program.publishBar.previewHomepageCta": "Preview homepage",
  "program.publishBar.saveDraftCta": "Save draft",
  "program.publishBar.publishCta": "Publish at noon",

  "program.toast.addedToSlate": "Added to this week's slate",
  "program.toast.passed": "Passed — the writer can resubmit later",
  "program.toast.playingPreview": "Playing preview…",
  "program.toast.openingRoomPreview": "Opening the room preview…",
  "program.toast.chooseNewCover": "Choose a new cover artist…",
  "program.toast.editingCoverNote": "Editing the cover note…",
  "program.toast.openingHomepagePreview": "Opening homepage preview…",
  "program.toast.draftSaved": "Draft saved",
  "program.toast.published": "Slate published — homepage rotates at noon",

  "program.inbox.heading": "Submissions · <em>{count} new</em>",
  "program.inbox.triageCta": "Triage",
  "program.inbox.tip":
    "Drag any submission left into a slot. <em>The pass-with-reason flow is in triage.</em>",
  "program.inbox.listenCta": "Listen",
  "program.inbox.slateCta": "+ Slate",
  "program.inbox.passCta": "Pass",

  "program.slate.cover.heading": "Cover artist of the week",
  "program.slate.cover.count": "1 of 1 · the room's headline",
  "program.slate.cover.swapCta": "Swap",
  "program.slate.cover.editNoteCta": "Edit note",
  "program.slate.singles.heading": "This week's singles",
  "program.slate.singles.count":
    "{placed} of {total} placed · {open} slots open",
  "program.slate.singles.notePlaceholder":
    "— write a one-line note · why this, why now —",
  "program.slate.singles.noteAria": "Note for {title}",
  "program.slate.singles.removeAria": "Remove {title}",
  "program.slate.singles.addSlotCta":
    "＋ drag a track from submissions, or click to add from catalogue",
  "program.slate.collections.heading": "Collection rotation",
  "program.slate.collections.count": "{placed} of {total}",
  "program.slate.broadcasts.heading": "Live broadcasts this week",
  "program.slate.broadcasts.count":
    "{scheduled} scheduled · slot {slotNumber} open",
  "program.slate.broadcasts.addSlotCta":
    "＋ schedule a third broadcast for Saturday late",

  // ── Submission triage (StudioTriagePage + List + Detail) ───────────────────
  // Chrome only — submitters' names/quotes/tracks/badges and this specific
  // submission's file/waveform/curator notes below are content, API-sourced
  // in live mode, and stay English in both modes (§1). The tab `id`s below
  // are stable filter values — never render the English label as a stored
  // key (§5.1 trap).
  "triage.header.eyebrow":
    "Submission triage · the council answers every submission in 14 days",
  "triage.header.title": "Inbox · <em>{count}</em> new this week.",
  "triage.header.sub":
    "Every submission gets read or listened to. <em>Pass</em> takes a sentence — that sentence becomes the artist's answer. Median reply time this season: {count} days.",

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
    "If you pass — write one sentence. This goes to {artistName} as the answer.",
  "triage.detail.decision.placeholder":
    "A small sentence that explains the no. We never send a form letter, ever.",
  "triage.detail.decision.hint":
    "Required for pass. <em>Not required</em> for slate.",
  "triage.detail.holdCta": "Hold & second-read",
  "triage.detail.passCta": "Pass · with the sentence",
  "triage.detail.addToSlateCta": "＋ Add to next slate",
  "triage.detail.toast.held": "Held for a second read",
  "triage.detail.toast.passed":
    "Passed with your sentence — sent to {artistName}",
  "triage.detail.toast.addedToSlate": "Added to the next slate",

  // ── Flag review (StudioFlagReviewPage + Card) ──────────────────────────────
  // Chrome only — flagged-release titles, reporter quotes, and claim/who
  // details below are content, API-sourced in live mode, and stay English
  // in both modes (§1). `verb` stored on resolve is a stable id, not the
  // English label — resolve via RESOLUTION_LABELS, never render it raw
  // (§5.1 trap).
  "flagReview.header.eyebrow": "Council · flag review",
  "flagReview.header.title": "When the room <em>flags</em> something.",
  "flagReview.header.dek":
    "Listeners can flag a release for uncleared samples, missing credits, or misattribution. A curator claims each one, the named artist gets to respond, and <em>every decision is logged with a reason</em>. Nothing is taken down silently.",

  "flagReview.resolvedTag": "Resolved · {verb}",
  "flagReview.dismissedClearedTag": "Dismissed · cleared",
  "flagReview.playAria": "Play",
  "flagReview.claimReviewCta": "Claim & review",
  "flagReview.dismissCta": "Dismiss",
  "flagReview.correctLineupCta": "Correct lineup",
  "flagReview.requestFixCta": "Request fix",
  "flagReview.holdUntilFixedCta": "Hold until fixed",

  "flagReview.resolution.dismissed": "dismissed",
  "flagReview.resolution.corrected": "corrected",
  "flagReview.resolution.held": "held",

  "flagReview.toast.claimed": "Claimed — it's yours to review",
  "flagReview.toast.lineupConfirmed": "Lineup confirmed accurate",
  "flagReview.toast.lineupCorrected": "Lineup corrected",
  "flagReview.toast.dismissedCreditsConfirmed":
    "Flag dismissed — credits confirmed correct",
  "flagReview.toast.correctionRequested":
    "Correction requested from the artist",
  "flagReview.toast.heldUntilCorrected": "Held until corrected",

  // ── Live room (StudioLivePage + LiveNow + LiveChat) ────────────────────────
  // Chrome only — the live show/track/artist names, the chat transcript, and
  // per-listen stats below are content (the room's actual live state and
  // chat log), API-sourced in live mode, and stay English in both modes
  // (§1). Chat-tab `id`s are stable values — never the translated label
  // (§5.1 trap).
  "live.ribbon.onAirNow": "On the air now",

  "liveNow.saveTrackCta": "Save track",
  "liveNow.savedCta": "Saved",
  "liveNow.savedToast": "Track saved to your library",
  "liveNow.removedToast": "Removed from your library",
  "liveNow.lyricsNotesCta": "Lyrics & notes",
  "liveNow.listenersLabel":
    "in the room with you · {sustainers} sustainers, {casual} casual",
  "liveNow.tippedLabel": "tipped during this set · 100% to artists",
  "liveNow.perPlayLabel": "per qualifying play · pays {artist} right now",
  "liveNow.setBuilding.heading": "The set · <em>building live</em>",
  "liveNow.trackPosition": "Track {current} of {total} · jumped from queue",
  "liveNow.tipArtistCta": "Tip {artist} · {amount}",

  "liveChat.tabs.chat.label": "Chat",
  "liveChat.tabs.tips.label": "Tips",
  "liveChat.tabs.listeners.label": "Listeners",
  "liveChat.inputPlaceholder": "say something to the room…",
  "liveChat.sendAria": "Send",
  "liveChat.sentToast": "Sent to the room",
  "liveChat.tipPresetCta": "Tip {amount}",
  "liveChat.tipCustomCta": "Tip €__",

  // ── Go live / broadcaster console (StudioBroadcastPage + Console) ─────────
  // Chrome only — device names, cue-sheet track titles, tip messages, and
  // talkback chat below are content, API-sourced in live mode, and stay
  // English in both modes (§1).
  "broadcast.status.onAir": "You're <em>on the air</em>",
  "broadcast.status.livePill": "live",
  "broadcast.status.meta":
    "<em>{count}</em> in the room · {sustainers} sustainers · {cities} cities",
  "broadcast.status.pauseMicCta": "Pause mic",
  "broadcast.status.endBroadcastCta": "End broadcast",
  "broadcast.status.toast.micPaused": "Mic paused — the room hears silence",
  "broadcast.status.toast.ending": "Broadcast ends in 5… archiving to a replay",

  "broadcast.audioIn.panelLabel": "Audio in",
  "broadcast.audioIn.singleCamVideo": "Single-cam video",
  "broadcast.audioIn.cameraNote":
    "Audio-only is the default for listening rooms. Camera ships in Phase 5 — flagged off for now.",

  "broadcast.nowPlaying.onAirNow": "On the air now",
  "broadcast.nowPlaying.setListLabel":
    "Set list · <em>type as you play</em> — it becomes the cue sheet on archive",
  "broadcast.nowPlaying.inputPlaceholder":
    "What did you just play? Artist — title…",
  "broadcast.nowPlaying.inputAria": "Add a track to the set list",
  "broadcast.nowPlaying.addCta": "Add",
  "broadcast.nowPlaying.justAdded": "Just added",
  "broadcast.nowPlaying.liveYourOwn": "live, your own",
  "broadcast.nowPlaying.badge.onAir": "On air",
  "broadcast.nowPlaying.badge.matched": "€ matched",
  "broadcast.nowPlaying.badge.hold": "Hold",
  "broadcast.nowPlaying.footer":
    "Matched tracks pay their artists automatically from this set's payout. <em>Held tracks wait</em> until the council's matcher clears them — nobody loses a cent in the meantime.",

  "broadcast.aside.tipsTab": "Live tips <em>{amount}</em>",
  "broadcast.aside.talkbackTab": "Talkback <em>{count}</em>",
  "broadcast.aside.tipsTotalLabel": "Tonight, so far · <em>100% to you</em>",
  "broadcast.aside.talkback.placeholder":
    "Talk back to your mods (listeners can't see this)…",
  "broadcast.aside.talkback.aria": "Talk back to your mods",
  "broadcast.aside.talkback.sendCta": "Send",
  "broadcast.aside.talkback.sentToast": "Sent to your mods",

  // ── Sheet music store (StudioSheetStorePage + Preview + Checkout + Also) ──
  // Chrome only — track/album/composer/transcriber names below are content,
  // API-sourced in live mode, and stay English in both modes (§1). Amounts
  // route through useFormat().currency() at render — see SHEET_PRICE etc. in
  // studioSheetStore.data.ts.
  "sheet.store.eyebrow": "Sheet music & lyrics archive",
  "sheet.store.title": "Buy the <em>score</em>, pay the people.",
  "sheet.store.dek":
    "A {amount} micropayment unlocks a clean, printable PDF — and splits <em>{splitRatio}</em> to the people who made and transcribed it. Reading is free; downloading pays.",

  "sheet.preview.eyebrow": "Lead sheet · transcription",
  "sheet.preview.byLine":
    "music & lyrics by <strong>{composer}</strong> · from <em>{album}</em>",
  "sheet.preview.freePreview": "Free preview · <em>page {page} of {total}</em>",
  "sheet.preview.watermark": "QUEERPULSE · PREVIEW",
  "sheet.preview.lockedPages": "Pages {from}–{to} unlock on purchase",
  "sheet.preview.transcribedBy": "Transcribed by <em>{name}</em>",
  "sheet.preview.transcriberRole": "Community transcriber",
  "sheet.preview.transcriberNote":
    "<em>paid from your purchase, not the fund, when you buy</em>",

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
    "Sheets pay <em>90%</em> to the makers — more generous than the 80% streaming split, because the work is one-off and hosting a PDF costs near zero. <em>Voted in at the 9 June assembly.</em>",
  "sheet.checkout.payMethod.card.label": "Saved card",
  "sheet.checkout.payMethod.card.sub": "one-tap, no re-entry",
  "sheet.checkout.payMethod.sepa.label": "SEPA direct",
  "sheet.checkout.payMethod.sepa.sub": "lower fee, 1–2 day settle",
  "sheet.checkout.paidLabel": "Paid",
  "sheet.checkout.downloadingLabel": "downloading PDF…",
  "sheet.checkout.payCta": "Pay {amount} & download",
  "sheet.checkout.note":
    "Instant download · re-download any time from your library · <em>the makers are paid tonight</em>.",
  "sheet.checkout.downloadedToast":
    "Downloaded — {amount} paid to {names} tonight",

  "sheet.also.heading": "From the same <em>transcriber</em>",
  "sheet.also.subtitle_one":
    "{name} · {count} sheet · {amount} reaches the transcriber per download",
  "sheet.also.subtitle_other":
    "{name} · {count} sheets · {amount} reaches the transcriber per download",
  "sheet.also.freeReadTag": "Free read",

  // ── Tip receipt (StudioReceiptPage) ────────────────────────────────────────
  // Chrome only — track/artist/album names and the tip note quote below are
  // content and stay English in both modes (§1).
  "receipt.tipEyebrow": "Tip · while listening",
  "receipt.byPrefix": "by",
  "receipt.fromAlbum": "from <em>{album}</em>",
  "receipt.thanksTitle": "{artist} got <em>{amount}</em>.",
  "receipt.thanksSub": "Every cent. No platform cut. <em>You did that.</em>",
  "receipt.splitHeading": "Where the <em>money</em> went",
  "receipt.splitNote": "100% pass-through on tips, no exceptions.",
  "receipt.split.artistSub_one": "Direct, SEPA · settles in {count} day",
  "receipt.split.artistSub_other": "Direct, SEPA · settles in {count} days",
  "receipt.split.platformName": "Platform · the room",
  "receipt.split.platformSub":
    "Stripe processing fee absorbed by the co-op on tips.",
  "receipt.split.artistPct": "100%",
  "receipt.split.platformPct": "0%",
  "receipt.detail.receiptNo": "Receipt no.",
  "receipt.detail.dateTime": "Date & time",
  "receipt.detail.from": "From",
  "receipt.detail.method": "Method",
  "receipt.detail.postedToLedger": "Posted to ledger",
  "receipt.detail.visibility": "Visibility",
  "receipt.detail.sustainerSince": "sustainer since {date}",
  "receipt.detail.chosenByDefault": "<em>chosen by default</em>",
  "receipt.detail.visibilityValue":
    "Public · with your name · <em>change to anonymous</em>",
  "receipt.note.label": "Your note to {artist}",
  "receipt.note.repliedSuffix": "<em>replied</em>",
  "receipt.note.replyWhen": "{relativeTime} · still on air, two tracks later",
  "receipt.footer.auditablePrefix": "Auditable on the",
  "receipt.footer.publicLedgerLink": "public ledger",
  "receipt.footer.rowLabel": "row {code}",
  "receipt.footer.exportCta": "Export PDF",
  "receipt.actions.share": "Share — paid card",
  "receipt.actions.tipAgain": "Tip again",
  "receipt.actions.openArtistPage": "Open {artist}'s page",
  "receipt.actions.emailCopy": "Email me a copy",
  "receipt.toast.shareCopied": "Paid card copied — share it anywhere.",
  "receipt.toast.tipAgain": "Tip {artist} again — same track.",
  "receipt.toast.emailCopy": "A copy is on its way to your inbox.",
  "receipt.privacyNote":
    "By default tips are <em>public, with your name</em>. You can make this one anonymous, or set every future tip to anonymous, in settings. <em>We don't share tip data with anyone.</em> <a>Privacy commitments</a>",

  // ── Sustain-membership checkout (StudioCheckoutPage) ──────────────────────
  "checkout.doneToast": "You're sustaining the studio — welcome in.",
  "checkout.doneTitle": "You're <em>sustaining</em> it now.",
  "checkout.doneBody":
    "Welcome in. Every track you play from here pays the artist who made it. Your first payment of {amount} is done — the rest is just listening.",
  "checkout.startListeningCta": "Start listening",
  "checkout.goToLibraryCta": "Go to your library",
  "checkout.eyebrow": "Checkout",
  "checkout.title": "Sustain the <em>studio.</em>",
  "checkout.dek":
    "Seven euros a month keeps a fair-pay music platform alive — and pays the artists you actually listen to, on every play.",
  "checkout.nameLabel": "Name on card",
  "checkout.namePlaceholder": "Your name",
  "checkout.cardLabel": "Card number",
  "checkout.cardPlaceholder": "1234 5678 9012 3456",
  "checkout.expiryLabel": "Expiry",
  "checkout.expiryPlaceholder": "MM / YY",
  "checkout.cvcLabel": "CVC",
  "checkout.payCta": "Pay {amount}{cadence}",
  "checkout.cadenceMonthly": "/ month",
  "checkout.prototypeNote":
    "This is a prototype — no card is charged and nothing is stored.",
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
    "Cancel any time — one click, no email, no retention call.",
  "checkout.reassure.share":
    "{percent}% of every euro is paid straight to the artists you listen to.",
  "checkout.reassure.noAds": "No ads, ever. Your listening data is never sold.",

  // ── Solidarity fund (StudioSolidarityFundPage + Balance + Flows + Log) ────
  // Chrome only. Two paragraphs deliberately NOT swept — flagged in the sweep
  // report as eligibility/commitment copy (§6): the "apply" section's
  // no-means-test promise, and the fund-balance runway/rollover rule, and the
  // flows dek's "never the artist's 80%, never your tips" guarantee. They
  // render in English via the fallback chain until reviewed. Disbursement
  // log recipient names/notes are content — API-sourced ledger rows in live
  // mode — and stay English in both modes (§1).
  "fund.hero.liveLabel": "Public · updated Mondays at noon",
  "fund.hero.title": "The <em>solidarity</em> fund.",
  "fund.hero.dek":
    "A small pooled reserve that pays the people the per-stream rate can't reach — <em>transcribers, translators, first-timers, and artists in a hard month</em>. Where it comes from and where it goes, in full.",

  "fund.balance.label": "Fund balance · today",
  "fund.balance.paidThisQuarterLabel": "paid out this quarter",
  "fund.balance.peoplePaidLabel_one": "person paid from it this year",
  "fund.balance.peoplePaidLabel_other": "people paid from it this year",

  "fund.flows.heading": "Where it <em>comes from</em>, where it <em>goes</em>",
  "fund.flows.inHeading": "Money in · this quarter",
  "fund.flows.outHeading": "Money out · this quarter",

  "fund.flows.in.surplus.label": "Subscription <em>surplus</em>",
  "fund.flows.in.surplus.desc":
    "When sustainer revenue beats the payout ledger, the difference pools here.",
  "fund.flows.in.roundups.label": "Tip <em>round-ups</em>",
  "fund.flows.in.roundups.desc":
    "The optional 5% some listeners add on top of a tip.",
  "fund.flows.in.holds.label": "Cleared <em>holds</em>",
  "fund.flows.in.holds.desc":
    "Unmatched DJ-set payouts that stay unclaimed after a year.",
  "fund.flows.in.gifts.label": "Direct <em>gifts</em>",
  "fund.flows.in.gifts.desc":
    "One-off donations from members and a Lisbon foundation.",

  "fund.flows.out.transcribers.label": "Transcribers & <em>translators</em>",
  "fund.flows.out.transcribers.desc":
    "Sheet music, lyric translations — paid per accepted piece.",
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
    "Briefs the council and co-op have funded. Apply inline — attach a <em>single track or release</em> from your catalogue. No cover letters, no portfolios; the work speaks.",

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
    "<em>One track only</em> — the council wants your sharpest, not your folder.",
  "calls.card.submittedToast":
    "Application submitted — the council reviews in Monday triage",

  "calls.applied.statusPrefix": "Status ·",
  "calls.applied.decisionBy": "decision by {date}",
  "calls.applied.withdrawCta": "Withdraw",
  "calls.applied.withdrawnToast": "Application withdrawn",
  "calls.applied.flatLabel": "flat",

  // ── Set submission (StudioSetSubmissionPage + Matcher + Sidebar) ──────────
  // Chrome only — the uploaded filename, track/artist names, and tracklist
  // paste below are content and stay English in both modes (§1). The set
  // `type` <select> below had no stable `value=` — the option label WAS the
  // stored value (§5.1 trap) — fixed with stable ids.
  "setSubmission.hero.eyebrow": "New submission · DJ set or mix",
  "setSubmission.hero.title": "Submit a <em>set</em>.",
  "setSubmission.hero.dek":
    "Upload the long-form file, paste your tracklist with timecodes, and our matcher finds the source artists so <em>every track in the set pays its maker</em>. Unmatched tracks hold their payout safely until cleared — nobody loses a cent.",

  "setSubmission.steps.file": "File",
  "setSubmission.steps.tracklist": "Tracklist & matcher",
  "setSubmission.steps.notes": "Notes & publish",

  "setSubmission.matcher.uploadedBadge": "Uploaded",
  "setSubmission.matcher.tracklistLabel":
    "Paste your tracklist · timecode — artist — title",
  "setSubmission.matcher.pasteHint":
    "One line per track. We accept most formats. <em>Re-run the matcher</em> whenever you edit.",
  "setSubmission.matcher.runCta": "▸ Run the matcher",
  "setSubmission.matcher.matchingCta": "Matching…",
  "setSubmission.matcher.resultsLabel":
    "Matcher results · <em>resolved against the catalogue + PRO database</em>",
  "setSubmission.matcher.payLine":
    "{who} · <em>{amount}/play to {firstName}</em>",
  "setSubmission.matcher.noSourceFound": "no source found · payout held",
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
  "setSubmission.sidebar.payoutPreviewHeading": "Payout <em>preview</em>",
  "setSubmission.sidebar.tracksInSet": "Tracks in set",
  "setSubmission.sidebar.matchedPaying": "Matched & paying",
  "setSubmission.sidebar.tracksCount_one": "{count} track",
  "setSubmission.sidebar.tracksCount_other": "{count} tracks",
  "setSubmission.sidebar.onHold": "On hold (unmatched)",
  "setSubmission.sidebar.payoutPool": "Set payout pool",
  "setSubmission.sidebar.holdNote":
    "Unmatched tracks <em>hold their share</em> until the council's matcher clears them. The set goes live now; held money releases the moment a source is confirmed.",
  "setSubmission.sidebar.submitCta": "Submit set",
  "setSubmission.sidebar.submittedToast":
    "Set submitted — live now, held shares pending clearance",

  // ── Off-air landing (StudioOffAirPage + Hero) ─────────────────────────────
  // Chrome only — the curator's signoff quote, next-broadcast title, and
  // night-cap set/curator names below are content and stay English in both
  // modes (§1). StudioOffAirShelves is already swept — match its pattern.
  "offAir.page.browseNote":
    "The doors are shut, but the shelves are open. <em>Browse anything below</em> — it all still plays.",
  "offAir.hero.statusLine": "Off air · {time} in Lisbon",
  "offAir.hero.roomDark": "the room is dark",
  "offAir.hero.title": "The room is <em>closed</em> for the night.",
  "offAir.hero.untilDoors": "until doors",
  "offAir.hero.nextBroadcastLabel": "Next broadcast · {time} Lisbon",
  "offAir.hero.nightcapEyebrow": "Last night's night-cap",
  "offAir.hero.replayAria": "Replay the night-cap",
  "offAir.hero.replayingToast": "Replaying {title}",
  "offAir.hero.paidOutSuffix": "{amount} paid out · replay any time",

  // ── Live-mode placeholder (StudioComingSoonPage) ──────────────────────────
  // Shown for every /studio/* route when demo mode is off, since Studio has no
  // backend yet and must not present invented payouts/figures as real.
  "comingSoon.title": "The Studio is <em>still tuning up</em>",
  "comingSoon.description":
    "Our co-op music platform — artist pages, live sets, payouts and the solidarity fund — isn't open to the public yet. We're building it in the open and it'll land here soon.",
  "comingSoon.exploreCulture": "Explore Culture",
  "comingSoon.backHome": "Back to home",
};

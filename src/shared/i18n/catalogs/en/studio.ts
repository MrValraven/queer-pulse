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

  // ── About the co-op (StudioAboutPage + StudioAboutSections) ──────────────
  "about.hero.eyebrow": "About · written for sceptics",
  "about.hero.title":
    "A streaming co-op that <em>pays</em> the people who made the song.",
  "about.hero.lede":
    "You've heard \"fair pay for artists\" from every platform that underpays them. So here's the arithmetic, the governance, and the honest ceiling — <em>no slogans you can't audit.</em>",

  "about.sec.whatItIs.num": "01 — what it is",
  "about.sec.whatItIs.heading": "A listening platform, run as a <em>co-op</em>.",
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
  "about.sec.hardQuestions.heading": "The ones you're <em>actually</em> asking.",

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
  "about.cta.ledger": "Read the public ledger →",

  // ── Accessibility (StudioAccessibilityPage) ───────────────────────────────
  "accessibility.hero.eyebrow": "Accessibility · the working list",
  "accessibility.hero.title": "Music is for everyone or it <em>isn't music</em>.",
  "accessibility.hero.lede":
    "This is both a statement of intent and a live checklist of what actually works today. Where something's <em>not</em> done yet, we say so — we'd rather be honest than aspirational.",
  "accessibility.statement.p1":
    "QueerPulse Studio commits to meeting <em>WCAG 2.2 AA</em> across every surface, and to treating accessibility as a product requirement, not a compliance afterthought. Deaf and hard-of-hearing people should be able to use a music platform. So should blind and low-vision people, people who navigate by keyboard, and people who need words in their own language.",
  "accessibility.statement.p2":
    "We test with real screen readers and real users — paid, from our own community — every release. <em>If something here doesn't work for you, that's a bug, and we want the report.</em>",

  "accessibility.group.deaf.heading": "For Deaf & <em>hard-of-hearing</em> listeners",
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

  "accessibility.group.language.heading": "For listeners in <em>any language</em>",
  "accessibility.group.language.dek":
    "The catalogue is mostly in Portuguese, with songs in a dozen other languages. Words shouldn't be a wall.",
  "accessibility.item.translation.heading": "Lyric <em>translation</em>",
  "accessibility.item.translation.body":
    "Community translations sit beside the original. Show one or both at once. Translators are credited and <em>paid from the solidarity fund</em> — translation is labour.",
  "accessibility.item.interfaceLang.heading": "Interface in <em>your language</em>",
  "accessibility.item.interfaceLang.body":
    "Studio's chrome ships in Portuguese, English, Spanish and French, with more added as members translate them. Set it in Settings → Captions & lyrics.",

  "accessibility.group.lowVision.heading": "For low-vision & <em>keyboard</em> navigation",
  "accessibility.group.lowVision.dek":
    "The whole player is operable without a mouse, and the dark theme is built to clear contrast — not just to look moody.",
  "accessibility.item.contrast.heading": "Contrast that <em>passes</em>",
  "accessibility.item.contrast.body":
    "Body text sits at 4.5:1 or better against the plum; interactive elements at 3:1 minimum, with a high-contrast mode that lifts everything further. Focus rings are always visible.",
  "accessibility.item.screenReader.heading": "Screen-reader notes on the <em>player</em>",
  "accessibility.item.screenReader.body":
    "The persistent transport announces track, artist, elapsed time, and <em>what this play pays the artist</em>. Tip and save are labelled buttons; the live tip feed is a polite ARIA live region, never a barrage.",
  "accessibility.item.reducedMotion.heading": "Respects <em>reduced motion</em>",
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
    "One click in <a>Settings → Erase & exit</a>. No retention call, no \"are you sure\" loop, no winback emails. We think leaving should be as easy as arriving — that's the only honest way to ask you to stay.",
  "help.faq.dataSold.q": "Is my data sold or used to train anything?",
  "help.faq.dataSold.a":
    "<strong>Never.</strong> We don't sell, share, or train on what you listen to. Aggregate play counts feed the public ledger, but nothing that identifies you. Full detail in the <a>trust & terms</a> page.",

  "help.faq.getPaid.q": "When and how do I get paid?",
  "help.faq.getPaid.a":
    "Monthly, on the 5th, with a €5 floor. SEPA or Stripe Connect. You see the per-stream rate that month, ledger entry numbers, and per-release breakdowns. Collaborators are paid <em>directly</em> — there's no \"main artist\" wallet. See <a>Payouts</a>.",
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
  "help.contact.access.action": "Accessibility →",

  // ── Artist press kit (StudioPressPage + StudioPressBar) ───────────────────
  // Chrome only — the artist's bio, quotes, and boilerplate values are her own
  // authored press material and stay English in both modes (§1).
  "press.copiedToast": "Copied",
  "press.copyFailToast": "Could not copy",
  "press.downloadingPhotosToast": "Downloading press photos · hi-res",
  "press.downloadingPhotoToast": "Downloading photo · hi-res",
  "press.accessRequestedToast": "Press access requested — we'll verify you once",
  "press.eyebrow": "Auto-generated press kit · always current",
  "press.fact.from": "From",
  "press.fact.pronouns": "Pronouns",
  "press.fact.since": "Since",
  "press.fact.plays": "Plays",
  "press.fact.forFansOf": "For fans of",
  "press.section.preview": "Streamable <em>preview</em>",
  "press.fullPromoRequestedToast": "Full promo requested",
  "press.requestFullPromoCta": "Request full promo →",
  "press.playAria": "Play preview",
  "press.pauseAria": "Pause preview",
  "press.watermarkedBadge": "Watermarked",
  "press.previewNote":
    "This preview carries an <em>inaudible watermark</em> and a spoken QueerPulse tag at the tail. For a clean broadcast master, request the full promo — we verify press once, then you're cleared for everything.",
  "press.section.bio": "<em>Bio</em>",
  "press.copyBothCta": "Copy both →",
  "press.bio.shortLabel": "Short · 40 words",
  "press.bio.longLabel": "Long · 120 words",
  "press.section.photos": "Press <em>photos</em>",
  "press.downloadAllCta": "Download all · hi-res →",
  "press.downloadOneHint": "Download hi-res →",
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
  "press.viewArtistCta": "View artist page →",
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
    "One page. Your masters are yours — you can take any release off Studio at any time, for any reason or none. No retention team, no exit survey, no \"are you sure\" loop designed to wear you down.",

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

  "rights.takedownStartedToast": "\"{title}\" enters its 14-day removal window",
  "rights.removalCancelledToast": "Removal cancelled — release stays up",

  // ── Takedown confirm modal (StudioTakedownModal) ──────────────────────────
  "rights.modal.confirmAria": "Confirm takedown of {title}",
  "rights.modal.eyebrow": "Confirm takedown",
  "rights.modal.title": "Take down <em>{title}</em>?",
  "rights.modal.body":
    "It'll stop being served within 14 days. Existing links will resolve to a short \"this work has been withdrawn by the artist\" page. <em>You can re-publish it any time</em> — your masters never leave your hands.",
  "rights.modal.keepEarned":
    "<em>You keep everything already earned.</em> This release stays paid for every play up to removal, in the next cycle.",
  "rights.modal.confirmCta": "Take it down →",
  "rights.modal.cancelCta": "Keep it up",

  // ── Album "more from the artist" rail (StudioAlbumMore) ───────────────────
  "album.more.heading": "More from <em>{artist}</em>",
  "album.more.artistPageCta": "Artist page",

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
  "withdrawn.still.sub": "What's left up, and what the council programmed instead",

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
};

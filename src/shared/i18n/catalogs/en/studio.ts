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
    "Programmed by {curator} · synchronous · {count} listening",
  "room.set.readPlanCta": "Read the plan",
  "room.set.sideHeading": "Listening with you",
  "room.set.sideSub":
    "{sustainers} sustainers · {casual} casual · {cities} cities",
  "room.set.ledgerHead": "Ledger · this month",
  "room.set.ledgerPaidArtists": "Paid to artists",
  "room.set.ledgerPlays": "Plays",
  "room.set.ledgerArtistShare": "Artist share",
  "room.set.ledgerPerPlay": "Per play",

  // ── Error pages (Studio404Page, Studio500Page) ────────────────────────────
  "error.brandAria": "QueerPulse Studio home",
  "error404.eyebrow": "Track not found",
  "error404.title": "This song <em>doesn't exist.</em>",
  "error404.body":
    "The track, set, or page you were after was never recorded, got taken down by the artist, or lives behind a sign-in. No drama. The catalogue is large and there's plenty more to hear.",
  "error404.backCta": "Back to the player",
  "error404.goBackCta": "Go back",
  "error404.tryInsteadTitle": "Try one of these instead",
  "error404.link.set.label": "This week's <em>set</em>",
  "error404.link.set.sub": "Live, programmed Mondays",
  "error404.link.search.label": "<em>Search</em> the catalogue",
  "error404.link.search.sub": "Tracks, artists, sheet music",
  "error404.link.library.label": "Your <em>library</em>",
  "error404.link.library.sub": "Saved, sustaining, tipped",

  "error500.eyebrow": "Something dropped out",
  "error500.title": "We lost the <em>recording.</em>",
  "error500.body":
    "A server on our side stumbled mid-take. Your account, your saves, and every artist's payout are safe. This is just the front of house. Give it a second and try again.",
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
    "A queer professional network rooted in Lisbon. Studio sits alongside Cinema, Magazine, and Events.",
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
  "landing.footer.copyright": "© {year} QueerPulse Studio Co-op CRL, Lisbon",
  "landing.footer.languages": "EN · PT",

  // ── Marketing hero (StudioLandingHero) ────────────────────────────────────
  "landing.hero.onAirNow": "On the air now",
  "landing.hero.clock": "{weekday} · {time} Lisbon",
  "landing.hero.title": "Music, <em>programmed</em> by queer ears.",
  "landing.hero.dek":
    "A co-op streaming platform. <em>{sharePercent}</em> of every listen to the artist. <em>{tipPercent}</em> of every tip. The ledger is public. The curators have names. <em>No algorithm has ever set foot in here.</em>",
  "landing.hero.demoCta": "Listen to a demo set · free",

  "landing.demo.eyebrow": "The Wednesday set · free preview",
  "landing.demo.meta":
    "programmed by {curator} · {duration} · {trackCount} tracks · {listening} listening",
  "landing.demo.pauseAria": "Pause preview",
  "landing.demo.playAria": "Play preview",
  "landing.demo.trackPrefix": "Track {n} ·",
  "landing.demo.byLine": "{artist} · from {album}",
  "landing.demo.payNote":
    "This listen pays {artist} <em>{amount}</em> when you're a sustainer. Right now, Studio is open as a demo.",
  "landing.demo.quote":
    "“Stay through the second verse of track six. <em>The piano leaves you there on purpose.</em>” {attribution}, programming lead",

  // ── Four promises (StudioLandingPromises) ─────────────────────────────────
  "landing.promises.eyebrow": "The contract · in writing",
  "landing.promises.title":
    "Four <em>promises</em> we make, to artists and listeners.",
  "landing.promises.share.title": "A fair, <em>visible</em> share.",
  "landing.promises.share.body":
    "80% of every listen to the artist. 100% of every tip. The other 20% covers payments, hosting, captions, sheet-music typesetting, and council stipends. The split is on every artist page, every receipt, every album.",
  "landing.promises.humans.title": "Music <em>programmed</em> by people.",
  "landing.promises.humans.body":
    'Every track on the homepage has a curator\'s name and a one-paragraph note. No "popular near you", no "made for you", no infinite scroll. The week is small, hand-built, and dated.',
  "landing.promises.coOwned.title": "Co-owned by the <em>listeners</em>.",
  "landing.promises.coOwned.body":
    "Sustainers ({price}/mo) become voting co-op members after twelve months. They elect the council, approve the rate card, and see every euro on the ledger. The platform answers to the people who sustain it.",
  "landing.promises.privacy.title": "Privacy as a <em>default</em>.",
  "landing.promises.privacy.body":
    "No listening data sold, syndicated, or used to recommend. Personal play history is private and deletable in one click. Aggregate plays exist for the ledger; nothing else leaves the building.",

  // ── Public ledger counter (StudioLandingCounter) ──────────────────────────
  "landing.counter.liveEyebrow": "Live, updated as it happens",
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
  "landing.cta.title": "Pull up a <em>chair</em>.",
  "landing.cta.body":
    "{price} a month. Cancel any time. <em>The first listen</em> tells you whether Studio is for you.",
  "landing.cta.readPlanCta": "Read the plan first",
  "landing.cta.secondary":
    "Already a QueerPulse member? Studio is <em>{addOnPrice}/mo on top</em>.",
  "landing.cta.secondaryLink": "Sign in to add it",

  // ── Sign in / Join (StudioSignInPage) ─────────────────────────────────────
  "signin.tabs.signIn": "Sign in",
  "signin.tabs.join": "Join",
  "signin.aside.onAirNow": "On the air now · {count} listening",
  "signin.aside.title":
    "A streaming co-op that <em>pays</em> the people who made the song.",
  "signin.aside.body":
    "Eighty cents of every euro reaches the artist. Tips pass through at <em>{tipPercent}</em>. The ledger is public, updated every Monday at noon.",
  "signin.aside.paidThisMonth":
    "Paid to artists this month: <em>{amount}</em> · and counting.",

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
    "{sharePercent} of your fee reaches artists by play",
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

  // ── Welcome onboarding wizard (StudioWelcomePage) ─────────────────────────
  "welcome.eyebrow": "You're in · let's set up Studio for you",
  "welcome.title": "Welcome to <em>Studio</em>, {name}.",
  "welcome.sub":
    "Three quick things and the first set is yours. <em>Skip any of it</em>. None of this is locked in.",
  "welcome.step1.title": "Follow a few <em>artists</em>",
  "welcome.step1.dek":
    "We'll surface their new releases first. Pick three or more: <em>the council picks the rest</em>.",
  "welcome.step1.followedCount_one": "{count} followed",
  "welcome.step1.followedCount_other": "{count} followed",
  "welcome.nextCta": "Next",
  "welcome.step2.title": "Set your default <em>tip</em>",
  "welcome.step2.dek":
    "One tap from the player sends this straight to the artist: <em>100%, no cut</em>. Change it any time.",
  "welcome.skipCta": "Skip",
  "welcome.tip.nod": "a nod",
  "welcome.tip.coffee": "a coffee",
  "welcome.tip.round": "a round",
  "welcome.tip.record": "a record",
  "welcome.step3.title": "How <em>private</em> do you want to be?",
  "welcome.step3.dek":
    "Our defaults are the careful ones. <em>Nothing here is on unless you turn it on.</em>",
  "welcome.step3.history.title": "Keep my listening history",
  "welcome.step3.history.body":
    "A private, deletable record only you see. Off by default: nothing leaves your browser.",
  "welcome.step3.tipNotes.title": "Make my tip notes public",
  "welcome.step3.tipNotes.body":
    "Off keeps every note between you and the artist. You can flip any single note later.",
  "welcome.step3.librarySync.title": "Sync my library across devices",
  "welcome.step3.librarySync.body":
    "Saves and follows move with you. On by default. Turn off to keep it on this device only.",
  "welcome.enterRoomCta": "Open Studio",
  "welcome.readyToast": "Studio is ready for you",

  // ── About the co-op (StudioAboutPage + StudioAboutSections) ──────────────

  "about.sec.rate.num": "02: the rate",
  "about.sec.rate.heading":
    "€0.05 a play. A <em>floor</em> we're actually held to.",
  "about.sec.rate.p1":
    "We commit to <strong>€0.05 per qualifying play</strong>: roughly fifteen times what Spotify pays. A qualifying play is at least 30 seconds, capped at one payout per listener per day so nobody can farm it. The floor can rise by simple majority at the assembly; it can only <em>fall</em> with a two-thirds supermajority. In practice, that means it doesn't fall.",
  "about.sec.rate.footnote":
    "For comparison: at €0.003 a stream, a song needs about 330,000 plays to earn what one here earns in 20,000. We are not pretending that's a small difference.",

  "about.rate.cell.floor.value": "€<em>0.05</em>",
  "about.rate.cell.floor.label": "per qualifying play · the floor",
  "about.rate.cell.share.value": "<em>80</em>%",
  "about.rate.cell.share.label": "of subscription revenue to artists, by play",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label": "of every tip, no platform cut, ever",

  "about.sec.ceiling.num": "03: what an artist can actually earn",
  "about.sec.ceiling.heading": "Honest about the <em>ceiling</em>.",
  "about.sec.ceiling.p1":
    "Most \"creator economy\" pages show you the top 0.1% and let you assume you're them. Here's what the rate actually produces at four real levels of listening, and where it stops.",

  "about.tier.casual.label": "Casual",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "1,480 qualifying plays: about <em>75 listeners</em> playing one track three times a week. Coffee money, paid monthly.",
  "about.tier.building.label": "Building",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "6,800 plays, two tips, one album buy. A working sideline, <em>rent-adjacent</em> in Lisbon.",
  "about.tier.sustaining.label": "Sustaining",
  "about.tier.sustaining.value": "1,820",
  "about.tier.sustaining.body":
    "36,000 plays, a regular tipping pool, one live room a month. Below the median Portuguese wage, and <em>12× what Spotify pays</em> for the same listening.",
  "about.tier.touring.label": "Touring artist",
  "about.tier.touring.body":
    "Studio will <em>not</em> replace a touring income, and we won't pretend it can. It can, plausibly, replace the rent while you make the next thing.",
  "about.tierFoot":
    "These aren't projections from a pitch deck. They're the live ledger's actual per-stream rate times honest play counts. <em>The real numbers are public, every Monday at noon.</em>",

  "about.sec.governance.num": "04: who decides",
  "about.sec.governance.heading":
    "An elected <em>council</em>, term-limited, on the record.",
  "about.sec.governance.p1":
    "Six curators program the weekly set, run submission triage, and write a paragraph justifying every pick. They're elected by the whole co-op at the annual assembly, paid a flat €400/mo stipend that appears on the public ledger, and limited to two-year terms with mandatory rotation. <strong>No algorithm decides who gets heard.</strong> A person does, and signs their name to it.",
  "about.sec.governance.p2":
    "The per-listen floor and the split percentages are set yearly by a joint vote of sustainers and artists, with a 20% quorum. If you think the rate is wrong, you don't email support. <em>You vote, or you stand.</em>",

  "about.sec.hardQuestions.num": "05: the hard questions",
  "about.sec.hardQuestions.heading":
    "The ones you're <em>actually</em> asking.",

  "about.skeptic.broke.q":
    "This sounds lovely and doomed. How does it not go broke?",
  "about.skeptic.broke.a":
    "Honestly, at low scale, the per-listen floor is expensive and a breakout track can cost more in bandwidth than it earns. Our mitigation is boring and public: casual listeners default to AAC, we cache aggressively, and the ledger is reconciled <em>daily</em> so we see red before it's a crisis.",
  "about.skeptic.clique.q": "Curated by six people sounds like a clique.",
  "about.skeptic.clique.a":
    "It can become one. That's the real risk. The guardrails are two-year term limits, forced rotation, and the fact that every pick is published with a name and a reason. <em>A clique that has to explain itself in writing every week is a weaker clique.</em>",
  "about.skeptic.clone.q": "Is this just a Spotify clone with nicer copy?",
  "about.skeptic.clone.a":
    "If the home page were rows of square cover art, yes. The product is editorial on purpose: a programmed weekly set, live listening rooms, payouts visible on every track. <em>If we ever look like a smaller Spotify, hold us to this paragraph.</em>",
  "about.skeptic.leave.q": "What happens to my music if I leave?",
  "about.skeptic.leave.a":
    "You keep your masters and everything you've earned. Takedown is a one-page, 14-day process with no retention loop. Past plays stay paid. Leaving is as easy as arriving. We think that's the only honest way to ask you to stay.",

  "about.cta.join": "Join Studio",
  "about.cta.ledger": "Read the public ledger",

  // ── Accessibility (StudioAccessibilityPage) ───────────────────────────────
  "accessibility.statement.p1":
    "QueerPulse Studio commits to meeting <em>WCAG 2.2 AA</em> across every surface, and to treating accessibility as a core product requirement, built in from the start. Deaf and hard-of-hearing people should be able to use a music platform. So should blind and low-vision people, people who navigate by keyboard, and people who need words in their own language.",
  "accessibility.statement.p2":
    "We test with real screen readers and real users (paid, from our own community) every release. <em>If something here doesn't work for you, that's a bug, and we want the report.</em>",

  "accessibility.group.deaf.heading":
    "For Deaf & <em>hard-of-hearing</em> listeners",
  "accessibility.group.deaf.dek":
    "A music platform can't pretend everyone hears it the same way. So we caption the talk and surface the words.",
  "accessibility.item.captions.heading": "Captioned <em>live rooms</em>",
  "accessibility.item.captions.body":
    "Every broadcast is auto-captioned in real time; council broadcasts get a <em>human pass</em>. The talk between songs, the dedications, the artist's asides: all transcribed and adjustable in size.",
  "accessibility.item.lyrics.heading": "Time-synced <em>lyrics</em>",
  "accessibility.item.lyrics.body":
    "Where the artist supplied them, lyrics scroll in time with playback, with the current line highlighted. Readable as a static sheet too, for any track.",
  "accessibility.item.waveforms.heading": "Visual <em>waveforms</em>",
  "accessibility.item.waveforms.body":
    "Live rooms and tracks show a real-time waveform tied to the actual audio, so rhythm and dynamics are visible as well as audible.",
  "accessibility.item.signed.heading": "Signed <em>broadcasts</em>",
  "accessibility.item.signed.body":
    "Flagship council broadcasts include a Portuguese Sign Language (LGP) interpreter window. Expanding to the weekly live rooms next quarter.",

  "accessibility.group.language.heading":
    "For listeners in <em>any language</em>",
  "accessibility.group.language.dek":
    "The catalogue is mostly in Portuguese, with songs in a dozen other languages. Words shouldn't be a wall.",
  "accessibility.item.translation.heading": "Lyric <em>translation</em>",
  "accessibility.item.translation.body":
    "Community translations sit beside the original. Show one or both at once. Translators are credited and <em>paid from the solidarity fund</em>. Translation is labour.",
  "accessibility.item.interfaceLang.heading":
    "Interface in <em>your language</em>",
  "accessibility.item.interfaceLang.body":
    "Studio's chrome ships in Portuguese, English, Spanish and French, with more added as members translate them. Set it in Settings, then Captions & lyrics.",

  "accessibility.group.lowVision.heading":
    "For low-vision & <em>keyboard</em> navigation",
  "accessibility.group.lowVision.dek":
    "The whole player is operable without a mouse, and both the light and dark themes are built to clear contrast as well as mood.",
  "accessibility.item.contrast.heading": "Contrast that <em>passes</em>",
  "accessibility.item.contrast.body":
    "Body text sits at 4.5:1 or better in both themes; interactive elements at 3:1 minimum, with a high-contrast mode that lifts everything further. Focus rings are always visible.",
  "accessibility.item.screenReader.heading":
    "Screen-reader notes on the <em>player</em>",
  "accessibility.item.screenReader.body":
    "The persistent transport announces track, artist, elapsed time, and <em>what this play pays the artist</em>. Tip and save are labelled buttons; the live tip feed is a polite ARIA live region, paced to stay gentle.",
  "accessibility.item.reducedMotion.heading":
    "Respects <em>reduced motion</em>",
  "accessibility.item.reducedMotion.body":
    "Every decorative animation (the pulse dot, the waveforms, the equaliser bars) stills itself when your system asks for reduced motion. Nothing essential moves.",

  "accessibility.status.inProgress": "In progress",

  "accessibility.shortcuts.title": "Player <em>keyboard</em> shortcuts",
  "accessibility.shortcuts.dek":
    "They work on any Studio page while something is queued, unless you're typing in a field",

  "accessibility.contact.meta":
    "Last audited 2 Jun 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack · next audit Sep 2026",

  // ── Help & FAQ (StudioHelpPage + StudioHelpFaq) ───────────────────────────

  "help.faq.moneyGo.q": "Where does my money actually go?",
  "help.faq.moneyGo.a":
    "Of your subscription, <strong>80% reaches artists</strong> by play, at a floor of €0.05 each. <em>Every cent of every tip</em> goes to the artist with no platform cut. The rest funds curation stipends, infrastructure, and the solidarity fund. You can see the exact split on the <a>public ledger</a>, updated Mondays at noon.",
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
    'Monthly, on the 5th, with a €5 floor. SEPA or Stripe Connect. You see the per-stream rate that month, ledger entry numbers, and per-release breakdowns. Collaborators are paid <em>directly</em>. There\'s no "main artist" wallet. See <a>Payouts</a>.',
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
  "press.fact.plays": "Plays",
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

  "terms.deal.artists.title": "Artists keep <em>80%</em> & their masters",
  "terms.deal.artists.body":
    "The split lives in the co-op's deed, binding by law. <em>The floor rises freely and can only fall by a two-thirds vote.</em>",
  "terms.deal.tips.title": "Tips are <em>100%</em>, always",
  "terms.deal.tips.body":
    "No platform cut on tips, ever. This one isn't up for a vote. It's a founding term.",
  "terms.deal.data.title": "Your data is <em>never</em> sold",
  "terms.deal.data.body":
    "It stays inside the co-op and does exactly one job: paying artists. History is off by default and erasable in one tap.",
  "terms.deal.leaving.title": "Leaving is <em>one page</em>",
  "terms.deal.leaving.body":
    "Take down work in 14 days, close your account in one click. Past plays stay paid either way.",

  "terms.sec.deed.num": "01: the co-op deed",
  "terms.sec.deed.heading": "What it means that you <em>own</em> this.",
  "terms.sec.deed.p1":
    "QueerPulse Studio is a registered co-operative. Members, listeners and artists alike, own it. That isn't branding: it's a legal structure with a deed you can read, that binds the people running it.",
  "terms.sec.deed.p2":
    "The deed fixes three things the people in charge <strong>cannot quietly change</strong>: the 80% artist floor, the 100% tip pass-through, and the public ledger. Altering the floor downward needs a two-thirds supermajority of the whole membership. The council is <em>elected, term-limited, and paid on the ledger</em>. There are no founder shares and no investor veto.",
  "terms.sec.deed.pull":
    "If we ever start acting like a company that happens to have nice values, the deed is what you hold us to.",
  "terms.sec.deed.footnote":
    "The full deed and the co-op's annual accounts are published every year alongside the <a>transparency report</a>.",

  "terms.sec.licences.num": "02: licences",
  "terms.sec.licences.heading": "What you can <em>do</em> with the music.",
  "terms.sec.licences.p1":
    "Every release names its licence, picked by the artist. Here's what each one means for you as a listener, and for anyone who wants to reuse the work in a set, a film, or a remix.",
  "terms.sec.licences.footnote":
    "DJ sets are special: a set can include tracks under different licences, and our matcher routes each track's payout to its own artist. <em>Covers are allowed</em>; mechanical royalties are handled through a Portuguese collecting partner, and we don't pay synchronisation, so clearing a cover for film use is on you.",

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
    "Aggregate, de-identified play counts feed the public ledger so artists get paid and the numbers are auditable. You can export everything we hold, or erase it, from <a>Settings, then Erase & exit</a>: instantly, no modal, no undo needed because we mean it.",

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
  "rights.promise.paid.title": "Past plays stay paid",
  "rights.promise.paid.body":
    "Every listen up to removal is paid in the next cycle. Taking work down never claws back money already earned.",
  "rights.promise.banking.title": "Banking untouched",
  "rights.promise.banking.body":
    "A takedown is not an account closure. Your SEPA details, your payout schedule, your collaborator splits: all stay live.",

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
    "This page only removes individual releases. To close your artist account, end your sustainer membership, and request a full data export, that lives in <a>Settings, then Erase & exit</a>. <em>Even then, past payouts are yours to keep</em> and we'll keep paying out any plays that already happened.",

  "rights.takedownStartedToast": '"{title}" enters its 14-day removal window',
  "rights.removalCancelledToast": "Removal cancelled. Release stays up",

  // ── Takedown confirm modal (StudioTakedownModal) ──────────────────────────
  "rights.modal.confirmAria": "Confirm takedown of {title}",
  "rights.modal.eyebrow": "Confirm takedown",
  "rights.modal.title": "Take down <em>{title}</em>?",
  "rights.modal.body":
    'It\'ll stop being served within 14 days. Existing links will resolve to a short "this work has been withdrawn by the artist" page. <em>You can re-publish it any time</em>. Your masters never leave your hands.',
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
  "track.hero.eyebrow": "Track {current} of {total}",
  "track.hero.payMonth": "<em>{amount}</em> to {artist} this month",
  "track.inSet.status":
    "You're listening with <b>{count}</b> people in the <em>Wednesday set</em>, programmed by {curator}. Track {next} starts in <b>{countdown}</b>.",
  "track.inSet.joinCta": "Join the set",
  "track.more.fullAlbumCta": "Full album",
  "track.sidebar.curatorNoteLabel": "Curator's note",
  "track.sidebar.splitHeading": "Where €1 goes when you play this",
  "track.sidebar.creditsHeading": "Credits",
  "track.sidebar.leadSheetLabel": "Lead sheet",
  "track.sidebar.downloadCta": "Download",
  "track.lyrics.heading": "Lyrics & <em>translation</em>",
  "track.lyrics.leadSheetChordsCta": "Lead sheet & chords",

  // ── Album detail page (StudioAlbumPage + Hero + Main + Sidebar) ───────────
  // Scope note: album title, artist name, liner notes and credits prose are
  // content — left English (§1).
  "album.tabs.tracklist": "Tracklist",
  "album.tabs.linerNotes": "Liner notes",
  "album.main.perPlaySuffix": "{amount} / play",
  "album.sidebar.buyEyebrow": "Studio is open to you",
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

  // ── Live set detail page (StudioSetPage) ──────────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "set.page.playAria": "Play set",
  "set.page.joinLiveRoomCta": "Join the live room",
  "set.page.tracklistHeading": "The <em>tracklist</em>",
  "set.page.everyPlayPaysNote": "Every play pays the artist",
  "set.page.payingNowLabel": "paying now",

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
    "The artist removed it from Studio: their right, their call. <em>No reason is owed</em>, and we don't ask for one.",
  "withdrawn.card.title": "What this <em>means</em>",
  "withdrawn.card.body":
    "A takedown isn't a deletion of the work itself. The masters stay with the artist, who can re-publish any time. It just means it's no longer served here. If you'd bought or saved it, it stays in your library as a record, marked withdrawn.",
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
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  "council.hero.eyebrow": "Governance · the council",
  "council.hero.title": "Six people choose what everyone <em>hears</em>.",
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
    "The short version: almost nothing, by default. We never sell, share, or train on what you play. Aggregate plays feed the public ledger, nothing that identifies you.",
  "settings.privacy.history.heading": "Listening history",
  "settings.privacy.history.body":
    "Off by default: nothing about what you played leaves your browser. Turn on for a private, deletable record only you can see.",
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
  "settings.erase.history.heading": "Erase my listening history",
  "settings.erase.history.note":
    "Wipes the private record from this device and the cloud. <em>Done instantly. No undo.</em>",
  "settings.erase.history.cta": "Erase history",
  "settings.erase.history.toast":
    "History erased. Gone from this device and the cloud.",
  "settings.erase.export.heading": "Download everything we hold on you",
  "settings.erase.export.note":
    "A JSON of your saves, tips, receipts and settings, emailed within the hour.",
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
  "tipModal.success.title":
    "Thank you. That's <em>{amount}</em> to {recipient}.",
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
    "Saved albums, sets, and tracks, plus the <em>{amount}</em> you've paid {artistCount} artists this year by listening here.",
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
  // live-room/payout plans below are this artist's own data, API-sourced in
  // live mode, and stay English in both modes (§1).
  "dashboard.hero.eyebrow": "Studio · this month",
  "dashboard.hero.title": "Good week, <em>{name}</em>.",
  "dashboard.hero.sub":
    "<em>{trackTitle}</em> is two months old and still climbing. The curators kept it in rotation.",

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
  "dashboard.side.quickActions.goLive.label": "Go live: host a live room",
  "dashboard.side.quickActions.payouts.label": "Review payouts & banking",
  "dashboard.side.deal.eyebrow": "The deal, always",
  "dashboard.side.deal.heading": "80% to <em>you.</em>",
  "dashboard.side.deal.body":
    "Every play, every tip, every buy. The split is the same for a first release as for a festival winner, and it's printed on the public ledger.",
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
  "upload.metadata.field.genre": "Primary genre",
  "upload.metadata.genre.fado": "Fado / contemporary",
  "upload.metadata.genre.electronic": "Electronic",
  "upload.metadata.genre.folk": "Folk",
  "upload.metadata.genre.experimental": "Experimental",
  "upload.metadata.backCta": "Back to files",
  "upload.metadata.submitCta": "Submit for review",

  "upload.submitted.title": "Submitted for <em>review.</em>",
  "upload.submitted.body":
    "Your release is in the council queue. A curator will check the files, splits and credits, usually within a day or two, and you'll get a note the moment it's live. Nothing publishes without your final yes.",
  "upload.submitted.viewPayoutsCta": "View your payouts",
  "upload.submitted.toast": "Release submitted for review",

  "upload.continueToMetadataCta": "Continue to metadata",

  // ── Payouts (StudioPayoutsPage + Sections + Skeletons) ─────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
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
  "payouts.summary.toYourIban": "To your IBAN",

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
  "payouts.sidebar.method.sepa.label": "SEPA: IBAN",
  "payouts.sidebar.method.sepa.badge": "Active",
  "payouts.sidebar.method.stripe.label": "Stripe Connect",
  "payouts.sidebar.method.stripe.hint": "connected · backup route",
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

  "program.inbox.heading": "Submissions · <em>{count} new</em>",
  "program.inbox.triageCta": "Triage",
  "program.inbox.tip":
    "Drag any submission left into a slot. <em>The pass-with-reason flow is in triage.</em>",
  "program.inbox.listenCta": "Listen",
  "program.inbox.slateCta": "+ Slate",
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
  "triage.detail.passCta": "Pass · with the sentence",
  "triage.detail.addToSlateCta": "＋ Add to next slate",
  "triage.detail.toast.held": "Held for a second read",
  "triage.detail.toast.passed":
    "Passed with your sentence, sent to {artistName}",
  "triage.detail.toast.addedToSlate": "Added to the next slate",

  // ── Flag review (StudioFlagReviewPage + Card) ──────────────────────────────
  // Chrome only. The demo's mock content for this page lives in studioShowcase
  // (translated); proper nouns and figures stay in the data files.
  // The `verb` stored on resolve is a stable id, shown through RESOLUTION_LABELS (§5.1).
  "flagReview.header.eyebrow": "Council · flag review",
  "flagReview.header.title": "When someone <em>flags</em> something.",
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

  "flagReview.toast.claimed": "Claimed. It's yours to review",
  "flagReview.toast.lineupConfirmed": "Lineup confirmed accurate",
  "flagReview.toast.lineupCorrected": "Lineup corrected",
  "flagReview.toast.dismissedCreditsConfirmed":
    "Flag dismissed. Credits confirmed correct",
  "flagReview.toast.correctionRequested":
    "Correction requested from the artist",
  "flagReview.toast.heldUntilCorrected": "Held until corrected",

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
  "liveNow.perPlayLabel": "per qualifying play · pays {artist} right now",
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
  "broadcast.nowPlaying.badge.matched": "€ matched",
  "broadcast.nowPlaying.badge.hold": "Hold",
  "broadcast.nowPlaying.footer":
    "Matched tracks pay their artists automatically from this set's payout. <em>Held tracks wait</em> until the council's matcher clears them. Nobody loses a cent in the meantime.",

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
    "Sheets pay <em>90%</em> to the makers, more generous than the 80% streaming split, because the work is one-off and hosting a PDF costs near zero. <em>Voted in at the 9 June assembly.</em>",
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
  "receipt.splitHeading": "Where the <em>money</em> went",
  "receipt.splitNote": "100% pass-through on tips, no exceptions.",
  "receipt.split.artistSub_one": "Direct, SEPA · settles in {count} day",
  "receipt.split.artistSub_other": "Direct, SEPA · settles in {count} days",
  "receipt.split.platformName": "Platform · Studio",
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
  "receipt.actions.share": "Share paid card",
  "receipt.actions.tipAgain": "Tip again",
  "receipt.actions.openArtistPage": "Open {artist}'s page",
  "receipt.actions.emailCopy": "Email me a copy",
  "receipt.toast.shareCopied": "Paid card copied. Share it anywhere.",
  "receipt.toast.tipAgain": "Tip {artist} again, same track.",
  "receipt.toast.emailCopy": "A copy is on its way to your inbox.",
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
    "Seven euros a month keeps a fair-pay music platform alive, and pays the artists you actually listen to, on every play.",
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
    "A small pooled reserve that pays the people the per-stream rate can't reach: <em>transcribers, translators, first-timers, and artists in a hard month</em>. Where it comes from and where it goes, in full.",

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
    "Upload the long-form file, paste your tracklist with timecodes, and our matcher finds the source artists so <em>every track in the set pays its maker</em>. Unmatched tracks hold their payout safely until cleared. Nobody loses a cent.",

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
    "Set submitted. Live now, held shares pending clearance",

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
  "offAir.hero.paidOutSuffix": "{amount} paid out · replay any time",

  // ── Live-mode teaser (StudioComingSoonPage and its four scenes) ───────────
  // Shown for every /studio/* route when demo mode is off, since Studio has no
  // backend yet and must not present invented payouts/figures as real. None of
  // these lines names a price, a split or a plan.
  "comingSoon.metaTitle": "QueerPulse Studio: opening soon",
  "comingSoon.description":
    "Our co-op music platform for queer artists close by is still being built. Nothing is playing and nothing is on sale yet. We'll announce it here when we go live.",
  "comingSoon.hero.eyebrow": "QueerPulse Studio",
  "comingSoon.hero.onAir": "On air",
  "comingSoon.hero.title": "The mics are <em>warming up</em>.",
  "comingSoon.hero.lede":
    "We're building a home for queer music made close by: artists with pages of their own, live sets from local stages, and a platform run together by the people who use it.",
  "comingSoon.hero.status":
    "Not open yet. Nothing is playing and nothing is on sale.",
  "comingSoon.preview.eyebrow": "A first listen",
  "comingSoon.preview.title": "What it will <em>sound like</em>",
  "comingSoon.preview.sideLabel": "Side A",
  "comingSoon.preview.trackLabel": "Track A{number}",
  "comingSoon.preview.artists.title": "Artists up front",
  "comingSoon.preview.artists.body":
    "Every artist gets a page of their own for their records, their story and their shows. The plan is for artists to keep their masters and release anywhere else too.",
  "comingSoon.preview.live.title": "Live from close by",
  "comingSoon.preview.live.body":
    "Sets recorded at local nights, open mics and small stages, so you can hear the scene around you, including the nights you missed.",
  "comingSoon.preview.together.title": "Run by who plays and who listens",
  "comingSoon.preview.together.body":
    "The plan is a co-op, with artists and listeners deciding together what gets played and where the money goes. Captions and transcripts for live sets are part of it from the start.",
  "comingSoon.why.eyebrow": "Why it matters",
  "comingSoon.why.quote":
    "A scene sounds like itself when <em>we press record</em>.",
  "comingSoon.why.p1":
    "Queer music made by queer people carries what an outside ear misses: the club nights, the choirs, the bedroom demos, the songs that got a lot of us through. For many of us it was the first place we heard ourselves.",
  "comingSoon.why.p2":
    "Most small artists play a handful of gigs, upload to a platform built for someone else and get lost in the algorithm. Very little of what they make comes back to them.",
  "comingSoon.why.p3":
    "Listening to local artists, sharing their tracks and turning up to their shows is how they get to make the next record. That's what this Studio is for.",
  "comingSoon.closing.title": "We go live <em>when it's ready</em>.",
  "comingSoon.closing.body":
    "We'll announce the first broadcast right here. Until then, the magazine is the best place to follow what we're making.",
  "comingSoon.magazineCta": "Read the magazine",
  "comingSoon.backHome": "Back to home",

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
  "artist.sidebar.perMonthSuffix": "/month",
  "liveNow.onAirTag": "on air",
  "liveNow.byFromLine": "by <strong>{artist}</strong> · from <em>{album}</em>",
  "liveNow.setBuilding.activityLine":
    "{curator} typed the up-next track <em>{elapsed}</em>",
  "live.ribbon.showLine": '"{title}" · programmed & hosted by {host}',
  "track.hero.byFromLine":
    "by <strong>{artist}</strong> · from <em>{album}</em> · {year}",
  "track.page.crumbLabel": "track {number}",

  // ── no-literal-string sweep: misc chrome eyebrows/labels ──────────────────
  "album.sidebar.splitHint":
    "If you buy at {price}: <em>{artistShare} to {artist}</em>, {solidarityShare} to the solidarity fund, {platformShare} to the platform, processing absorbed.",
  "flagReview.reviewedByLine": "Reviewed by <em>{reviewer}</em>",
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
  "states.loadingLabel": "Loading",
  "save.saveCta": "Save",
  "save.saveReleaseCta": "Save {title}",
  "save.removeSavedCta": "Remove {title} from saved",
  "save.savedLabel": "Saved",
  "save.savedToast": "Saved",
  "save.removedToast": "Removed from Saved",
  "errors.generic": "Something went wrong. Try again",
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
    "We couldn't read this file. Try another MP3 or M4A",
  "errors.audioWrongOwner": "That file belongs to another persona",
  "shell.searchLabel": "Search Studio",
  "shell.searchPlaceholderLive": "search artists, releases, tracks…",
  "shell.accountLabel": "Your account, {name}",
  "shell.menu.library": "Your library",
  "shell.menu.artistPages": "Your artist pages",
  "shell.menu.dashboard": "Artist dashboard",
  "shell.menu.settings": "Settings",
  "shell.menu.backToQueerPulse": "Back to QueerPulse",
  "shell.tabs.label": "Studio sections",
  "shell.sheet.label": "Studio menu",
  "shell.sheet.close": "Close menu",
  "shell.sheet.more": "More in Studio",
  "shell.uploadShort": "Upload",
  "shell.sustainShort": "Sustain",
  "shell.tabs.openCalls": "Open calls",
  "shell.uploadCta": "Upload a release",
  "creator.avatarLabel": "Uploading as {name}",
  "rail.v1.navLabel": "Studio",
  "rail.v1.search": "Search",
  "rail.v1.yourMusic": "Your music",
  "rail.v1.upload": "Upload a release",
  "rail.v1.yourReleases": "Your releases · {name}",
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
  "playerBar.previous": "Previous track",
  "playerBar.next": "Next track",
  "playerBar.seekLabel": "Seek",
  "playerBar.seekValue": "{elapsed} of {total}",
  "playerBar.cantPlay": "This track can't play right now",
  "playerBar.retry": "Retry the track",
  "uploadFlow.hero.title": "Put your music <em>out.</em>",
  "uploadFlow.hero.sub":
    "Three steps: the release, its tracks, then publish. MP3 or M4A, up to 50 MB a track",
  "uploadFlow.steps.label": "Upload steps",
  "uploadFlow.steps.release.nm": "Release",
  "uploadFlow.steps.release.sub": "· title · cover · details",
  "uploadFlow.steps.tracks.nm": "Tracks",
  "uploadFlow.steps.tracks.sub": "· audio · credits · lyrics",
  "uploadFlow.steps.publish.nm": "Publish",
  "uploadFlow.steps.publish.sub": "· checks · rights",
  "uploadFlow.release.heading": "The <em>release</em>",
  "uploadFlow.release.sub":
    "Saved as a draft as you go. Nothing is public until you publish",
  "uploadFlow.release.personaLabel": "Release as",
  "uploadFlow.release.typeLabel": "Type",
  "uploadFlow.release.genreNone": "No genre",
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
  "uploadFlow.saving": "Saving",
  "uploadFlow.saved": "Draft saved",
  "uploadFlow.cover.heading": "Cover <em>art</em>",
  "uploadFlow.cover.placeholder": "Add a cover",
  "uploadFlow.cover.hint":
    "A square image works best. You can crop it after choosing",
  "uploadFlow.backToRelease": "Back to the release",
  "uploadFlow.continueToPublish": "Continue to publish",
  "uploadFlow.backToTracks": "Back to tracks",
  "uploadFlow.files.dropTitle": "Drop <em>MP3 or M4A</em> files here",
  "uploadFlow.files.accepts":
    "accepts · <em>MP3 · M4A</em> · up to 50 MB a track · up to 50 tracks",
  "uploadFlow.files.chooseCta": "Choose audio files",
  "uploadFlow.files.empty": "No tracks yet. Add audio files to start",
  "uploadFlow.files.listLabel": "Tracks in this release",
  "uploadFlow.files.rejectType": "{fileName} isn't an MP3 or M4A file",
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
  "uploadFlow.noPersona.title": "You need a Studio artist persona",
  "uploadFlow.noPersona.body":
    "To upload, you need a published persona set to Open to everyone, of one of these kinds: musician, DJ, podcaster, podcast producer, poet, spoken word artist, drag performer, performer, dancer, ballroom and vogue, or burlesque performer. Set one up, then come back",
  "uploadFlow.noPersona.cta": "Go to your personas",
  "uploadFlow.side.eyebrow": "What happens to your files",
  "uploadFlow.side.title": "Your files, <em>kept as they are</em>",
  "uploadFlow.side.body":
    "We store your audio as you upload it and stream it only to members with Studio access. Nobody can download it",
  "uploadFlow.side.formats.label": "Formats",
  "uploadFlow.side.formats.value": "MP3 · M4A",
  "uploadFlow.side.size.label": "Per track",
  "uploadFlow.side.size.value": "up to 50 MB",
  "uploadFlow.side.listeners.label": "Who can listen",
  "uploadFlow.side.listeners.value": "members with Studio access",
  "uploadFlow.locked.takenDownTitle": "This release was taken down",
  "uploadFlow.locked.takenDownBody":
    "Taken down by our team: {reason}. It can't be edited while it's down",
  "uploadFlow.locked.backCta": "Back to your releases",
  // ── Studio v2 (2026-10-13) ──────────────────────────────────────────────────
  "artistPage.followerCount_one": "{count} follower",
  "artistPage.followerCount_other": "{count} followers",
  "errors.playlistLimit":
    "You can keep up to 100 playlists. Delete one to make another",
  "errors.playlistTrackLimit": "A playlist holds up to 500 tracks",
  "errors.playlistOrderMismatch":
    "The playlist changed. Reload the page and try again",
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
    "Your playlists, plus the releases, tracks and artists you keep close",
  "libraryLive.tablistLabel": "Your library",
  "libraryLive.tabs.playlists": "Playlists",
  "libraryLive.tabs.releases": "Releases",
  "libraryLive.tabs.tracks": "Tracks",
  "libraryLive.tabs.artists": "Artists",
  "libraryLive.yourPlaylists": "Your <em>playlists</em>",
  "libraryLive.savedPlaylists": "Saved <em>playlists</em>",
  "libraryLive.newPlaylistCta": "Create playlist",
  "libraryLive.empty.playlistsTitle": "No playlists yet",
  "libraryLive.empty.playlistsBody":
    "Make one for a mood, a night or a person, then add tracks from anywhere in Studio",
  "libraryLive.empty.releasesTitle": "No saved releases yet",
  "libraryLive.empty.releasesBody":
    "Save a release from its page and it waits for you here",
  "libraryLive.empty.tracksTitle": "No saved tracks yet",
  "libraryLive.empty.tracksBody":
    "Save a track from its page and it waits for you here",
  "libraryLive.empty.artistsTitle": "You don't follow any artists yet",
  "libraryLive.empty.artistsBody":
    "Follow an artist from their Studio page to keep them close",
  "libraryLive.showMoreArtists": "Show more artists",
  "libraryLive.loadingMoreArtists": "Loading more artists",
  "libraryLive.loadMoreArtistsError": "We couldn't load more artists",
  "numbers.eyebrow": "Your numbers",
  "numbers.title": "How <em>{name}</em> is reaching people",
  "numbers.dek":
    "Totals as they stand today. Studio never counts plays, and any count from 1 to 4 shows as Fewer than 5 so nobody can be singled out",
  "numbers.personaLabel": "Persona",
  "numbers.followers": "Followers",
  "numbers.tableCaption":
    "Saves and public playlist inclusions for each of {name}'s releases",
  "numbers.column.release": "Release",
  "numbers.column.saves": "Saves",
  "numbers.column.inPublicPlaylists": "In public playlists",
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
  "demo.dashboard.trend.plays":
    "<up>{delta}</up> vs. last month · {active} of {total} tracks active",
  "demo.dashboard.trend.earnings":
    "<up>{delta}</up> vs. last month · {rate} per qualifying play",
  "demo.dashboard.trend.tips":
    "{tippers} tippers, {notes} with notes · <up>{recent} since you opened this page</up>",
  "demo.dashboard.trend.payout":
    "SEPA · LU IBAN · settles the morning of the 5th",
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
    "Peak: <em>today</em> · {plays} plays · Sara picked you on Monday",
  "demo.dashboard.topTrackShare": "<em>{title}</em> is {percent}% of this",
  "demo.dashboard.goLivePlan": "Plan: {date} · premiere of {title}",
  "demo.dashboard.nextPayout": "Next: {amount} on {date} · SEPA",
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
    "No new fee funds this. It's the overflow of a system designed to overflow toward people, and it leaves <em>the artist's 80% and your tips</em> untouched",
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

  "helpLive.hero.eyebrow": "Studio help",
  "helpLive.hero.title": "How can we <em>help</em>?",
  "helpLive.hero.dek":
    "Answers about listening, sharing your music and staying safe in Studio. If something's missing, our team reads every message.",
  "helpLive.search.label": "Search Studio help",
  "helpLive.search.placeholder": "Try saving, playlists or disputes",
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
    "Studio is the place on QueerPulse where queer artists share their music with members. It's free and listen-only, and it's open to members our team has given Studio access.",
  "helpLive.faq.tracking.q": "Does Studio keep track of what I listen to?",
  "helpLive.faq.tracking.a":
    "No. Studio keeps no play counts, no listening history and no recommendations built from what you play. What's playing and your queue live in this browser tab only, and they're gone when you close it.",
  "helpLive.faq.saving.q": "How do saving, playlists and following work?",
  "helpLive.faq.saving.a":
    "Save any release or track and it waits for you in your <a>library</a>. A playlist can be Public, Connections only or Private, and you can change that any time. Follow an artist from their page to hear when they put out something new.",
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
    "<a>Your numbers</a> shows followers, saves and how many public playlists include your music. Any count from 1 to 4 reads Fewer than 5, so nobody can work out who saved what. Studio keeps no play counts.",
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

  "aboutLive.hero.eyebrow": "About Studio",
  "aboutLive.hero.title": "Music by queer artists, for <em>our members</em>.",
  "aboutLive.hero.lede":
    "Studio is a place on QueerPulse where queer artists share their music with members. It's free and listen-only, and what you play stays private.",
  "aboutLive.sec.today.num": "01: what it is today",
  "aboutLive.sec.today.heading": "What Studio <em>does</em>",
  "aboutLive.sec.today.p1":
    "Artists upload releases under a musician or DJ persona and publish them for members with Studio access. Listeners play, save, make playlists and follow the artists they love.",
  "aboutLive.sec.today.p2":
    "There's no money in Studio today: listening is free, and uploading is free too.",
  "aboutLive.sec.privacy.num": "02: what it doesn't record",
  "aboutLive.sec.privacy.heading": "Listening stays <em>yours</em>",
  "aboutLive.sec.privacy.p1":
    "Studio keeps no play counts, no listening history and no recommendations built from what you play. Your queue lives in your browser tab and leaves with it.",
  "aboutLive.sec.privacy.p2":
    "Artists see followers, saves and public playlist inclusions, and any count from 1 to 4 shows as Fewer than 5.",
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
    "We'd like Studio to pay artists one day and to give members a say in how it runs. We'll build that in the open with our community, and we'll say so here when something is real.",
  "aboutLive.showcase.heading": "The <em>co-op vision</em>",
  "aboutLive.showcase.dek":
    "What a co-op Studio could look like, shown in this demo.",
  "aboutLive.cta.title": "Come and <em>listen</em>.",
  "aboutLive.cta.body":
    "Start on Studio home, or read the short Studio terms first.",
  "aboutLive.cta.open": "Open Studio",
  "aboutLive.cta.terms": "Read the Studio terms",

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
    "Studio stores your releases with their audio and artwork, your saves, playlists and follows, your player settings, and any dispute you send along with our team's reply. It keeps no record of what you play: no play counts and no listening history.",
  "termsLive.sec.stored.p2":
    "Everything Studio stores about you is covered by the QueerPulse <a>privacy policy</a>.",
  "termsLive.sec.takedown.num": "04: takedowns and disputes",
  "termsLive.sec.takedown.heading": "If something <em>goes wrong</em>",
  "termsLive.sec.takedown.p1":
    "You can unpublish your own release at any time. If a member reports a release, our team reviews it and may take it down. You see their reason on the release page and can dispute it there, one dispute at a time and up to three for each release. Our team replies on the release, and if they agree, it comes back.",
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
    "When your device or QueerPulse asks for reduced motion, panels and lists appear without sliding or fading.",
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

  "rightsLive.eyebrow": "Rights and takedowns",
  "rightsLive.title": "How rights <em>work</em> in Studio",
  "rightsLive.dek":
    "What you confirm when you publish, what happens after a report, and how to dispute a takedown.",
  "rightsLive.sec.checkbox.heading": "The rights <em>checkbox</em>",
  "rightsLive.sec.checkbox.body":
    "Before publishing, you confirm that you own or control the rights to every recording and composition in the release, and that the credits are accurate.",
  "rightsLive.sec.report.heading": "After a <em>report</em>",
  "rightsLive.sec.report.body":
    "Our team reviews every report. If a release breaks the rules, they take it down and write a reason you can read on the release page. The release goes offline for listeners, and anyone who saved it keeps it in their library, marked withdrawn.",
  "rightsLive.sec.dispute.heading": "How to <em>dispute</em>",
  "rightsLive.sec.dispute.body":
    "Open your release. Under the takedown reason, write a note to our team and send it. Their reply appears on the release, and if they agree, it comes back. You can dispute each release up to three times, one at a time.",
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
  "settingsLive.theme.label": "Theme",
  "settingsLive.theme.title": "How Studio <em>looks</em>",
  "settingsLive.theme.dark.heading": "Dark mode",
  "settingsLive.theme.dark.body":
    "Studio follows your QueerPulse theme, so a change here applies across QueerPulse on this device.",
  "settingsLive.saveError": "We couldn't save that setting. Try again",

  "hiddenTrack.label": "Hidden by your settings",

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
  "flagReviewLive.toast.takenDown":
    "{title} is down and its reports are closed",
  "flagReviewLive.toast.dismissed": "Report dismissed",
  "flagReviewLive.toast.restored": "{title} is back online",
  "flagReviewLive.toast.keptDown":
    "{title} stays down and the artist has your reply",
  "flagReviewLive.toast.actionError": "That didn't go through. Try again",
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
  "flagReviewLive.loadingMore": "Loading more",
  "flagReviewLive.loadMoreError": "We couldn't load more. Try again",

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
  "mood.sweaty": "Sweaty",
  "mood.calm": "Calm",
  "mood.playful": "Playful",
  "home.moods.heading": "Browse by <em>mood</em>",
  "home.moods.listLabel": "Moods",
  "home.hero.featuredEyebrow": "Featured",
  "home.staffPicks.title": "Staff <em>picks</em>",
  "home.newThisWeek.title": "New this <em>week</em>",
  "home.scenes.title": "Local <em>scenes</em>",
  "home.scenes.listLabel": "Scenes",
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
  "errors.sceneSlugTaken": "Another scene uses that address",
  "errors.sceneOrderMismatch":
    "The scenes changed while you were moving them. Reload and try again",
  "errors.creditAlreadyRequested":
    "This persona already has that credit on this track",
  "errors.creditNotAccepted": "Only an accepted credit can be removed here",
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
  "rail.v3.pressKit": "Press kit",
  "creator.nav.pressKit": "Press kit",
  "artistPage.v3.moreAria": "More about {name}",
  "artistPage.v3.pressKit": "Press kit",
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
  // Player bar, controls and Now playing extras (player/ui)
  "player.playFrom": "Play from {time}",
  "player.playFromAria": "Play {title} from {time}",
  "player.openNowPlaying": "Open Now playing, {title} by {artist}",
  "player.chapterAria": "Chapter {number}: {title}",
  "player.queueShow": "Show the queue",
  "player.queueHide": "Hide the queue",
  "player.shuffle": "Shuffle",
  "player.repeat.off": "Repeat: off",
  "player.repeat.all": "Repeat: all",
  "player.repeat.one": "Repeat: this track",
  "player.cast": "Play on another device",
  "player.castConnected": "Playing on another device",
  "player.volume": "Volume",
  "player.volumeValue": "{percent}%",
  "player.mute": "Mute",
  "player.unmute": "Unmute",
  "player.more": "More player options",
  "player.crossfade.label": "Crossfade",
  "player.crossfade.value_one": "{count} second",
  "player.crossfade.value_other": "{count} seconds",
  "player.crossfade.off": "Off",
  "player.crossfade.hint":
    "Fades each track into the next. Tracks from the same release play straight through",
  "player.crossfade.unavailable": "Crossfade isn't available in this session",
  "player.loudness.label": "Even out loudness",
  "player.loudness.hint": "Brings every track close to the same level",
  "player.loudness.plainHint":
    "In this session it can only turn loud tracks down",
  "player.shortcutsCta": "Keyboard shortcuts",
  "player.sleep.heading": "Sleep timer",
  "player.sleep.minutes": "{count} minutes",
  "player.sleep.endOfTrack": "End of track",
  "player.sleep.turnOff": "Turn off the timer",
  "player.sleep.chip": "{remaining} left",
  "player.sleep.chipEndOfTrack": "Stops after this track",
  "player.sleep.cancelAria": "Turn off the sleep timer, {remaining} left",
  "player.sleep.cancelAriaEndOfTrack":
    "Turn off the sleep timer set for the end of this track",
  "player.sleep.setStatus": "Sleep timer set for {minutes} minutes",
  "player.sleep.endOfTrackStatus": "Playback stops at the end of this track",
  "player.sleep.cancelledStatus": "Sleep timer off",
  "player.lyrics.listLabel": "Lyrics, following the music",
  "player.lyrics.backToCurrent": "Back to current line",
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
  "nowPlaying.noLyrics": "No lyrics for this track yet",
  "nowPlaying.noCredits": "No credits for this track yet",
  "nowPlaying.creditsLoading": "Loading the credits",
  // Queue (StudioQueueList, StudioQueuePanel)
  "queue.heading": "Queue",
  "queue.close": "Close the queue",
  "queue.nowPlaying": "Now playing",
  "queue.yours": "Your queue",
  "queue.clear": "Clear queue",
  "queue.clearedStatus": "Your queue is empty",
  "queue.nextFrom": "Next from {source}",
  "queue.nextUp": "Next up",
  "queue.emptyHint":
    "Add tracks with Play next or Add to queue in any track's menu",
  "queue.upcomingEmpty": "Nothing more after this track",
  "queue.moveUp": "Move {title} up",
  "queue.moveDown": "Move {title} down",
  "queue.remove": "Remove {title} from the queue",
  "queue.movedStatus": "{title} is now number {position}",
  "queue.removedStatus": "Removed {title} from the queue",
  "queue.dragHint": "Drag to reorder",
  // Track menu (StudioTrackMenu)
  "trackMenu.trigger": "More actions for {title}",
  "trackMenu.playNext": "Play next",
  "trackMenu.addToQueue": "Add to queue",
  "trackMenu.copyLink": "Copy link",
  "trackMenu.copyLinkAt": "Copy link at {time}",
  "trackMenu.playingNextToast": "Playing next",
  "trackMenu.addedToast": "Added to your queue",
  "trackMenu.linkCopiedToast": "Link copied",
  "trackMenu.queueFailedToast": "This track can't join your queue right now",
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
  "player.skipBack": "Skip back 15 s",
  "player.skipForward": "Skip forward 30 s",
  "player.speed.heading": "Speed",
  "player.speed.value": "{rate}x",
  "player.speed.hint": "Speed applies to podcast episodes. Music plays at 1x",
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
    "accepts · <em>MP3 · M4A</em> · up to 250 MB an episode",
  "episodeUpload.newTitle": "New <em>episode</em>",
  "episodeUpload.editTitle": "Edit <em>episode</em>",
  "episodeUpload.forShow": "For {show}",
  "episodeUpload.audioHeading": "Episode audio",
  "episodeUpload.titleLabel": "Episode title",
  "episodeUpload.explicitLabel": "This episode has explicit content",
  "episodeUpload.uploading": "Uploading {fileName}",
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
    "Three steps: the show, its episodes, then publish. MP3 or M4A, up to 250 MB an episode",
  "uploadFlow.side.size.valueShow": "up to 250 MB an episode",
  "uploadFlow.release.headingShow": "The <em>show</em>",
  "uploadFlow.release.continueCtaShow": "Save and continue to episodes",
  "facts.episodeCount_one": "{count} episode",
  "facts.episodeCount_other": "{count} episodes",
  "episodeUpload.eyebrow": "New episode · upload",
  "episodeUpload.dropTitle": "Drop an MP3 or M4A file here",
  "episodeUpload.chooseFile": "Choose an audio file",
  "chapters.editor.hintEpisode": "Mark where each part of the episode starts",
  "chapters.editor.pasteEpisode": "Paste chapters",
  "searchPage.episodesHeading": "<em>Episodes</em>",
  "artist.showCount_one": "{count} show",
  "artist.showCount_other": "{count} shows",
  "artist.tabs.podcast": "Shows",
  "artist.tabs.spokenWord": "Spoken word",
  "artist.tabs.performance": "Performance",
};

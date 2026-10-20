import type { Catalog } from "../../types";

/**
 * Studio showcase: the mock content of Studio's demo-only pages (council,
 * live and broadcast, triage and flag review, programme and notifications,
 * press, payouts and receipt, off air, sheet store, sets, rights, withdrawn).
 * Studio has no live API for these pages, so their rosters, chat, notes and
 * labels ship in the bundle and are translated here. Proper nouns (artist,
 * people, venue, city, track, album and set names) and figures stay in the
 * data files as written and arrive through {tokens}.
 */
export const studioShowcase: Catalog = {
  // ── Council: member card chrome (StudioCouncilPage) ──
  "council.member.seat.plain": "Seat {seat}",
  "council.member.seat.chair": "Seat {seat} · chair this quarter",
  "council.member.seat.newest": "Seat {seat} · newest",
  "council.member.since": "since {year}",
  "council.member.slatesThisYear": "{total} this year",
  "council.member.slate.meta_one": "{date} · {count} track",
  "council.member.slate.meta_other": "{date} · {count} tracks",
  "council.member.slate.payout.out": "<em>{amount}</em> out",
  "council.member.slate.payout.paid_one": "<em>{count}</em> paid",
  "council.member.slate.payout.paid_other": "<em>{count}</em> paid",
  "council.member.slate.payout.grant": "<em>{amount}</em> grant",
  "council.member.stat":
    "<em>{tracks}</em> tracks programmed · <em>{artists}</em> artists paid",

  // ── Council: member roles (StudioCouncilPage) ──
  "council.member.role.djProgrammer": "DJ & programmer",
  "council.member.role.composerArchivist": "composer & archivist",
  "council.member.role.soundArchivist": "sound archivist",
  "council.member.role.producer": "producer",
  "council.member.role.artistCurator": "artist-curator",
  "council.member.role.choirDirector": "choir director",

  // ── Council: member bios and notebook lines (StudioCouncilPage) ──
  "council.member.saraMarques.bio":
    "Ran the Casa do Comum Wednesday nights for a decade before the co-op existed. Programs for <em>the hour between sunset and the second bottle</em>.",
  "council.member.saraMarques.note":
    "\"I keep coming back to Mariana's <em>Carta</em>. It's a hymn that refuses church. We led the week with it because everyone listening needs permission to be tender on a Wednesday\"",
  "council.member.dOkoye.bio":
    "Builds the long mixes nobody else has time for: <em>trans composers 1972 to now</em>. Believes a playlist is an argument and a citation is a kindness.",
  "council.member.dOkoye.note":
    "\"Half this week's grant strand went to people the algorithms had given up on. <em>That's the whole job.</em> Find the ones the metrics buried, pay them first\"",
  "council.member.yaraReis.bio":
    "Keeper of the <em>Lisbon dyke-bar standards</em> archive: field recordings, bootlegs, the songs that only existed in one room on one night.",
  "council.member.yaraReis.note":
    '"A recording held for clearance is a recording <em>waiting to pay the right person</em>, and it comes back to you the moment it does"',
  "council.member.joaoRibeiro.bio":
    "The one who programs the warm-ups and the come-downs. Runs the <em>made here</em> strand for first releases by members.",
  "council.member.joaoRibeiro.note":
    '"Gave the spring grant to seven first-timers this week. Not one has a manager. <em>Good.</em> The point was always to make people ready"',
  "council.member.akinDiallo.bio":
    "The only working touring artist on the council. Programs from the road. Recuses from any vote on his own releases.",
  "council.member.akinDiallo.note":
    '"Programmed from a dressing room in Marseille tonight. The council should always have one person who\'s <em>tired in the way the artists are tired</em>"',
  "council.member.helenaPinto.bio":
    "Came up through community choirs and brought all of them with her. Programs the choral and the congregational. Elected at the last assembly.",
  "council.member.helenaPinto.note":
    '"My first month on the council. I keep wanting to apologise for picking so much choir music. Then I remember: <em>nobody else will</em>, and the choirs need paying too"',

  // ── Live: ribbon (StudioLivePage) ──
  "live.ribbon.duration": "{length} show, {elapsed} in",

  // ── Live: now playing card (StudioLiveNow) ──
  "live.now.savedMeta": "{artist} · live set",
  "live.now.setBuilding.elapsed": "{seconds} sec ago",

  // ── Live: set list rows (StudioLiveNow) ──
  "live.set.who.played": "{artist} · played {start} → {end}",
  "live.set.who.playingNow": "{artist} · playing now · {elapsed} / {length}",
  "live.set.who.upNext": "{artist} · up next · starts in {countdown}",
  "live.set.who.planned": "{artist} · planned, may rotate",
  "live.set.pay.toArtist": "€0.05 to {artist}",
  "live.set.pay.perPlay": "€0.05 / play",
  "live.set.pay.payingNow": "paying now",
  "live.set.pay.queuedBy": "queued by {curator}",

  // ── Home: Wednesday set rows (StudioPageSections) ──
  "room.set.payNote.paid": "paid",
  "room.set.payNote.paying": "paying",
  "room.set.upNext": "up next",

  // ── Live: chat (StudioLiveChat) ──
  "live.chat.system.opened": "{time} · {host} opened the live room",
  "live.chat.system.listening":
    "{time} · {listeners} listening · {cities} cities",
  "live.chat.system.nowPlaying": "{time} · now playing: {title}, {artist}",
  "live.chat.role.curator": "Curator",
  "live.chat.role.sustainer": "Sustainer",
  "live.chat.role.artist": "Artist",
  "live.chat.pinnedAt": "{time} · pinned",
  "live.chat.anonymous": "Anonymous",
  "live.chat.you": "You",
  "live.chat.justNow": "now",
  "live.chat.msg.welcome":
    "welcome in. tonight: twelve tracks, mostly piano, some choir. don't shuffle. <em>i'll know</em>",
  "live.chat.msg.first": "first {icon}",
  "live.chat.msg.cascaisOpener": "cascais opener, classic move",
  "live.chat.msg.akinDouble":
    "the akin double is so good. how did you sequence that {icon}",
  "live.chat.msg.byAccident":
    "honestly? <em>by accident.</em> i had paris in slot 4 last week and it didn't land. moved it earlier, then salt water followed it home",
  "live.chat.msg.saltWaterTip":
    '<b>tipped {amount} to {artist}</b> · "salt water is the whole record"',
  "live.chat.msg.secondVerse": "second verse just broke me. <em>again</em>",
  "live.chat.msg.pinnedInNotes": "@yara it's pinned in track notes {icon}",
  "live.chat.msg.earnItTip":
    '<b>tipped {amount} to {artist}</b> · "earn it, mariana"',
  "live.chat.msg.pianoWait":
    "the piano leaves you here on purpose. <em>wait</em>",
  "live.chat.msg.tipNoNote": "<b>tipped {amount} to {artist}</b>",

  // ── Broadcast: audio devices (StudioBroadcastConsole) ──
  "broadcast.devices.interface.name": "{device} · inputs 1 and 2",
  "broadcast.devices.interface.sub": "USB interface · {spec}",
  "broadcast.devices.laptopMic.name": "{device} mic",
  "broadcast.devices.laptopMic.sub": "Built-in · mono",
  "broadcast.devices.loopback.name": "System audio (loopback)",
  "broadcast.devices.loopback.sub": "For decks & DJ software",

  // ── Broadcast: cue sheet (StudioBroadcastConsole) ──
  "broadcast.cues.unknownTitle": "A bootleg edit <em>(unknown)</em>",
  "broadcast.cues.unmatched": "Unmatched",
  "broadcast.cues.meta.matchedInCatalogue": "matched in catalogue",
  "broadcast.cues.meta.payoutHeld": "payout held until cleared",
  "broadcast.cues.meta.matched": "matched",

  // ── Broadcast: live tips (StudioBroadcastConsole) ──
  "broadcast.tips.note.privateNote": "Private note · just for you",
  "broadcast.tips.note.quietTip": "Quiet tip · no note",
  "broadcast.tips.note.earnItForMyMae":
    "earn it, mariana. this one's for my mãe",
  "broadcast.tips.note.liveVersion": "the live version destroys me every time",
  "broadcast.tips.note.thisIsTheOne": "this is the one",
  "broadcast.tips.note.withLove": "bicha, with love",

  // ── Broadcast: talkback (StudioBroadcastConsole) ──
  "broadcast.talkback.you": "You",
  "broadcast.talkback.role.mod": "mod",
  "broadcast.talkback.role.council": "council",
  "broadcast.talkback.msg.chatLovely":
    "chat's lovely tonight, no flags. when you're ready for the cover, give me a nod and I'll pin the lyric",
  "broadcast.talkback.msg.intoTheCover":
    "nod, going into the cover after this one. can you pin the translation too?",
  "broadcast.talkback.msg.bothPinned":
    "on it. PT + EN both pinned. 418 listening, holding steady",
  "broadcast.talkback.msg.featureReplay":
    "dropping by, this set is gorgeous. I'll feature the replay on Monday's slate",

  // ── Triage: submission rows (StudioTriageList) ──
  "triage.sub.day": "Day {day}",
  "triage.sub.badge.firstSubmission": "First submission",
  "triage.sub.badge.trackCount_one": "{count} track",
  "triage.sub.badge.trackCount_other": "{count} tracks",
  "triage.sub.badge.leadSheetAttached": "Lead sheet attached",
  "triage.sub.badge.lyricsInLanguage": "{language} lyrics",
  "triage.sub.badge.claimedByYou": "Claimed · you",
  "triage.sub.badge.satbScores": "SATB scores",
  "triage.sub.badge.mixLength": "Mix · {minutes}m",
  "triage.sub.badge.cueSheetAttached": "Cue sheet attached",
  "triage.sub.meta.submittedOn": "Submitted <em>{date}</em>",
  "triage.sub.meta.loudnessReady": "{loudness} · ready",
  "triage.sub.meta.lyricTranslationRequested":
    "Lyric translation requested · {language}",
  "triage.sub.meta.translationsAttached": "Translations attached: {languages}",
  "triage.sub.meta.clearedSourceArtists_one": "Cleared {count} source artist",
  "triage.sub.meta.clearedSourceArtists_other":
    "Cleared {count} source artists",
  "triage.sub.meta.cueSheetTrackCount_one": "Cue sheet: {count} track",
  "triage.sub.meta.cueSheetTrackCount_other": "Cue sheet: {count} tracks",
  "triage.sub.meta.noteFromVoucher": "Note from {name}: vouches",
  "triage.sub.piano.whoTag": "first submission",
  "triage.sub.piano.note":
    "i'm a 56-year-old former dock worker. i bought a piano at 49 and i'm writing the songs i should have written at 24. this is the first one i'd be proud to send out. four minutes and forty seconds. piano and one voice, plain",
  "triage.sub.coro.who":
    "Eight voices · {city} · cover artists from the choir collective",
  "triage.sub.coro.note":
    "we're the porto cousin of coro de outubro. four songs of our own, all in mirandês, with PT side-by-side. recorded in casa do povo de miranda do douro, one mic, two takes each",
  "triage.sub.tomboy.who": "DJ from {city} · second submission",
  "triage.sub.tomboy.note":
    "sapatão-sci-fi mix, 38 minutes, all heard from below the dancefloor. last submission got a thoughtful pass. this one starts differently",
  "triage.sub.ainda.whoTag": "first single, also our translator",
  "triage.sub.ainda.note":
    "two minutes and forty-six seconds. a piano and a small fire. you know me as the translator on Mariana's record; i'd like to try the other side, this once",

  // ── Triage: detail panel (StudioTriageDetail) ──
  "triage.detail.claim.headline": "Claimed by {name}",
  "triage.detail.claim.note": "You're answering this one.",
  "triage.detail.claim.secondReader": "{name} second-reading queued.",
  "triage.detail.flagged.bridge": "the bridge at 2:14 is the thing",
  "triage.detail.flagged.regional": "PT feels regional: very Porto",
  "triage.detail.flagged.standards":
    "i'd put this on the standards collection in a year, easily",
  "triage.detail.file.withinBounds": "within bounds",
  "triage.detail.file.translationRequested":
    "{original} · {target} translation requested",
  "triage.detail.file.soleSplit": "100% {name} · no collabs",

  // ── Program: header and publish bar (StudioProgramPage) ──
  "program.header.dateRange": "15 to 21 June",
  "program.publishBar.publishDate": "Mon 15 Jun, 12:00 Lisbon",

  // ── Program: cover artist (StudioProgramSlate) ──
  "program.cover.by_one":
    "{artist} · {city} · debut album · {count} track · premiere Wed 10 Jun",
  "program.cover.by_other":
    "{artist} · {city} · debut album · {count} tracks · premiere Wed 10 Jun",
  "program.cover.note":
    "<em>Stay through the second verse of track six.</em> A Beja-born songwriter on her own terms, finally. Eleven tracks of fado-pop, addressed plainly to a saint who isn't listening. The Wednesday set will end with the album closer.",

  // ── Program: singles credit line (StudioProgramSlate) ──
  "program.singles.who.lisbon": "{artist} · Lisbon",

  // ── Program: singles curator notes (StudioProgramSlate) ──
  "program.singles.note.kitchenInApril":
    "A patient piano ballad about coming home to a mother who left the radio on.",
  "program.singles.note.bichaWithLove":
    "Six speakers, one Brazilian word, now a 120-bpm dancefloor edit. The remix the original always wanted.",
  "program.singles.note.cantigaParaAVizinha":
    "Fifteen trans voices, recorded live in a kitchen. No reverb. No edits.",
  "program.singles.note.pedroOnThe25":
    "A tram, a saxophone, and the only honest song about cruising the Praça do Comércio I've heard this year.",
  "program.singles.note.saltWaterSlowly":
    "A Wolof-language elegy for a brother who didn't get on the boat. Sparse, tidal, breathtaking.",
  "program.singles.note.ifYouHaveToAsk":
    "Eighty seconds of unaccompanied vocal. A 1970s dyke-bar standard, sung from memory.",
  "program.singles.note.carnationStill":
    "Fifty years on, a new song for the revolution. A waltz, in 5/4.",

  // ── Program: collection rotation (StudioProgramSlate) ──
  "program.collections.meta.curatedBy_one":
    "curated by {curator} · {count} track",
  "program.collections.meta.curatedBy_other":
    "curated by {curator} · {count} tracks",
  "program.collections.meta.by_one": "by {curator} · {count} track",
  "program.collections.meta.by_other": "by {curator} · {count} tracks",
  "program.collections.meta.byWithNew_one":
    "by {curator} · {count} track · {newCount} new from {source}",
  "program.collections.meta.byWithNew_other":
    "by {curator} · {count} tracks · {newCount} new from {source}",
  "program.collections.badge.inOut": "{added} in / {removed} out",
  "program.collections.badge.noChange": "no change",
  "program.collections.badge.in": "{added} in",

  // ── Program: live broadcasts (StudioProgramSlate) ──
  "program.broadcasts.weekday.wed": "Wed",
  "program.broadcasts.weekday.thu": "Thu",
  "program.broadcasts.premiereLead": "Premiere",
  "program.broadcasts.meta.wednesdaySet":
    "{host} · {duration} · the Wednesday set · live waveform + chat",
  "program.broadcasts.meta.premiere_one":
    "{host} · live room · {count} track · captioned EN + PT",
  "program.broadcasts.meta.premiere_other":
    "{host} · live room · all {count} tracks · captioned EN + PT",

  // ── Program: submissions inbox (StudioProgramInbox) ──
  "program.inbox.who.firstSubmission": "{name} · {city} · first submission",
  "program.inbox.who.choir": "eight voices · {city}",
  "program.inbox.who.djSecondSubmission": "DJ from {city} · second submission",
  "program.inbox.who.firstSingle": "{name} · {city} · first single",
  "program.inbox.who.trackOfAlbum":
    "{name} · {city} · {position} of {total} tracks",
  "program.inbox.quote.pianoIWaitedFor":
    "i'm a 56-year-old former dock worker. i bought a piano at 49 and i'm writing the songs i should have written at 24",
  "program.inbox.quote.coroDePorto":
    "we're the porto cousin of coro de outubro. four songs of our own, all in mirandês",
  "program.inbox.quote.tomboyOutubro":
    "sapatão-sci-fi mix, 38 minutes, all heard from below the dancefloor",
  "program.inbox.quote.ainda":
    "two minutes and forty-six seconds. a piano and a small fire",
  "program.inbox.quote.houseForTheStill":
    "slow house for people who don't drink anymore. recorded in one take",
  "program.inbox.quote.tiaObrigada":
    "an album in mãe-tongue, mostly. one song per aunt in my life",

  // ── Notifications: timestamps (StudioNotificationsPage) ──
  "notifications.time.minutes": "{minutes} min",
  "notifications.time.hours": "{hours}h",
  "notifications.time.now": "now",
  "notifications.time.weekday.mon": "Mon",
  "notifications.time.weekday.tue": "Tue",
  "notifications.time.weekday.sun": "Sun",

  // ── Notifications: rows (StudioNotificationsPage) ──
  "notifications.items.tipReply.title":
    "<strong>{name}</strong> replied to your <em>{amount} tip</em>",
  "notifications.items.onTrack": "on “{track}”",
  "notifications.items.onTrackDaysAgo_one": "on “{track}” · {count} day ago",
  "notifications.items.onTrackDaysAgo_other": "on “{track}” · {count} days ago",
  "notifications.items.marianaReply.reply":
    '"rita ily, this one really was for the mães. see you Wednesday"',
  "notifications.items.pedroReply.reply":
    '"this song lives in your head rent-free? it lives in mine too. obrigado"',
  "notifications.items.wednesdaySetLive.title":
    "The <strong>Wednesday set</strong> is <em>live now</em>, {curator} programming",
  "notifications.items.wednesdaySetLive.meta_one":
    "{listeners} listening · contains {count} artist you follow",
  "notifications.items.wednesdaySetLive.meta_other":
    "{listeners} listening · contains {count} artists you follow",
  "notifications.items.newSingle.title":
    "<strong>{name}</strong> released a new single, <em>{track}</em>",
  "notifications.items.newSingle.meta":
    "From an artist you sustain at {amount}/mo · free for sustainers",
  "notifications.items.collectionAdd.title":
    "<strong>{name}</strong> added a track you tipped to a collection, <em>{collection}</em>",
  "notifications.items.collectionAdd.meta_one":
    "“{track}” now appears in {count} council collection",
  "notifications.items.collectionAdd.meta_other":
    "“{track}” now appears in {count} council collections",
  "notifications.items.monthlyRecap.title_one":
    "Your monthly recap is in: you paid <strong>{amount}</strong> to <em>{count} artist</em> in May",
  "notifications.items.monthlyRecap.title_other":
    "Your monthly recap is in: you paid <strong>{amount}</strong> to <em>{count} artists</em> in May",
  "notifications.items.monthlyRecap.meta":
    "{sustainer} sustainer · {direct} direct subscriptions · view the breakdown",
  "notifications.items.premiereSet.title_one":
    "<strong>{name}</strong> set a premiere: <em>{album}</em>, {count} track",
  "notifications.items.premiereSet.title_other":
    "<strong>{name}</strong> set a premiere: <em>{album}</em>, all {count} tracks",
  "notifications.items.premiereSet.meta":
    "10 Jun · 21:00 Lisbon · live room · you'll be reminded",
  "notifications.items.solidarityFund.title":
    "Your <em>tip round-ups</em> helped the solidarity fund replace a stolen accordion",
  "notifications.items.solidarityFund.meta":
    "{amount} of your round-ups went to emergency support this quarter",

  // ── Press: hero (StudioPressPage) ──
  "press.facts.pronounsValue": "she / her",
  "press.facts.playsValue": "<em>{plays}</em> on Studio",

  // ── Press: photos (StudioPressPage) ──
  "press.photos.liveGarage": "Live · converted garage",
  "press.photos.portraitSintra": "Portrait · Sintra hills",
  "press.photos.studioSession": "Studio · Cidade dos santos",
  "press.photos.portraitMono": "Portrait · black & white",

  // ── Press: facts and boilerplate (StudioPressPage) ──
  "press.boilerplate.fullNameValue": "Mariana Sol (b. 1996, Sintra)",
  "press.boilerplate.genreValue": "Fado · devotional · art song",
  "press.boilerplate.labelValue":
    "<em>Self-released</em> · masters retained · via QueerPulse Studio co-op",
  "press.boilerplate.bookingValue": "Direct · no agent · {email}",

  // ── Press: contact (StudioPressPage) ──
  "press.contact.body":
    "Mariana handles her own press. No gatekeepers. <em>{email}</em> · usually replies within a day.",

  // ── Payouts: hero (StudioPayoutsSections) ──
  "payouts.hero.breakdownMonth": "July",

  // ── Payouts: months and periods (StudioPayoutsSections, StudioPayoutsPage) ──
  "payouts.month.jul": "Jul",
  "payouts.month.jun": "Jun",
  "payouts.month.may": "May",
  "payouts.month.apr": "Apr",
  "payouts.month.mar": "Mar",
  "payouts.period.july2026": "July 2026",
  "payouts.period.june2026": "June 2026",
  "payouts.period.may2026": "May 2026",
  "payouts.period.april2026": "April 2026",
  "payouts.period.march2026": "March 2026",

  // ── Payouts: recent payout rows (StudioPayoutsSections, StudioPayoutsPage) ──
  "payouts.row.title": "{period} payout",
  "payouts.row.titleWithNote": "{period} payout · <em>{note}</em>",
  "payouts.row.note.pending": "pending",
  "payouts.row.note.firstMonthOfCds": "first month of CDS",
  "payouts.row.note.firstOnStudio": "first on Studio",
  "payouts.plays": "{plays} plays",
  "payouts.meta.tips_one": "{count} tip",
  "payouts.meta.tips_other": "{count} tips",
  "payouts.meta.albumBuys_one": "{count} album buy",
  "payouts.meta.albumBuys_other": "{count} album buys",
  "payouts.meta.directSubs_one": "{count} direct sub",
  "payouts.meta.directSubs_other": "{count} direct subs",
  "payouts.meta.splits_one": "splits to {count} collaborator",
  "payouts.meta.splits_other": "splits to {count} collaborators",

  // ── Payouts: track breakdown (StudioPayoutsSections) ──
  "payouts.breakdown.otherTracks": "Seven other tracks <em>· combined</em>",

  // ── Payouts: preferences (StudioPayoutsSections) ──
  "payouts.preferences.taxResidencyValue": "Portugal · NIF on file",

  // ── Receipt: card and note (StudioReceiptPage) ──
  "receipt.coverAlt": "{title} cover",
  "receipt.detail.cardSummary": "Saved card · ending {last4} ·",
  "receipt.note.quote": "earn it, mariana",
  "receipt.note.replyBody": "rita ily and i'm earning it, promise",

  // ── Off air: hero (StudioOffAirHero) ──
  "offAir.hero.signoff.quote":
    "\"We played fourteen songs and paid fourteen people so go to sleep, the catalogue stays open and we'll be back when the kettle's on\"",
  "offAir.hero.signoff.attribution":
    "{name}, closing the Wednesday set at {time}",
  "offAir.hero.nextShow.title": "{show} with <em>{host}</em>",
  "offAir.hero.nextShow.description":
    "Ambient & trans composers · 90 minutes · captioned live",

  // ── Off air: card meta line (StudioOffAirShelves, StudioOffAirHero) ──
  "offAir.meta.kind.album": "Album",
  "offAir.meta.kind.djSet": "DJ set",
  "offAir.meta.kind.collection": "Collection",
  "offAir.meta.kind.soundtrack": "OST",
  "offAir.meta.kind.mix": "Mix",
  "offAir.meta.kind.ep": "EP",
  "offAir.meta.kind.live": "Live",
  "offAir.meta.trackCount_one": "{count} track",
  "offAir.meta.trackCount_other": "{count} tracks",

  // ── Sheet store: preview (StudioSheetPreview) ──
  "sheetStore.spec.scoring": "Voice + piano",
  "sheetStore.spec.key": "Key · D minor",
  "sheetStore.spec.lyrics": "PT lyrics",
  "sheetStore.spec.pages_one": "{count} page",
  "sheetStore.spec.pages_other": "{count} pages",
  "sheetStore.spec.format": "PDF · A4",
  "sheetStore.preview.pdfSub": "{composer} · voice & piano · D minor",

  // ── Sheet store: checkout (StudioSheetCheckout) ──
  "sheetStore.checkout.spec_one": "voice + piano · {count} page",
  "sheetStore.checkout.spec_other": "voice + piano · {count} pages",

  // ── Sheet store: more from the transcriber (StudioSheetAlso) ──
  "sheetStore.also.format.piano": "piano",
  "sheetStore.also.format.satb": "SATB",
  "sheetStore.also.format.leadSheet": "lead sheet",
  "sheetStore.also.format.guitarTab": "guitar tab",

  // ── Set: hero (StudioSetPage) ──
  "set.hero.recorded": "Recorded live · {venue} · {date}",
  "set.hero.length_one": "{count} track · {minutes} min",
  "set.hero.length_other": "{count} tracks · {minutes} min",
  "set.hero.blurb":
    "The hour between sunset and the second bottle. {name}'s fourth Vespertina set, recorded in one take in front of forty people, and now paying every artist in it on each listen.",

  // ── Set: saved item (StudioSetPage) ──
  "set.saved.title": "Studio set",
  "set.saved.meta": "Set",
  "set.saved.description":
    "A late-night live set from the studio, captured in one continuous take.",

  // ── Set submission: uploaded file (StudioSetMatcher) ──
  "setSubmission.file.loudness": "loudness {value}",

  // ── Set submission: unidentified tracks (StudioSetMatcher) ──
  "setSubmission.tracks.unknownBootleg": "unknown bootleg edit",
  "setSubmission.tracks.whiteLabel": "white label: ID / ID",

  // ── Rights: release meta (StudioRightsPage) ──
  "rights.release.format.album": "Album",
  "rights.release.format.ep": "EP",
  "rights.release.format.single": "Single",
  "rights.release.format.liveRecording": "Live recording",
  "rights.release.trackCount_one": "{count} track",
  "rights.release.trackCount_other": "{count} tracks",
  "rights.release.plays": "{plays} plays",
  "rights.release.paid": "{amount} paid",
  "rights.release.clearanceDispute_one": "clearance dispute on {count} track",
  "rights.release.clearanceDispute_other":
    "clearance dispute on {count} tracks",

  // ── Rights: licence badge (StudioRightsPage) ──
  "rights.licence.sub": "licence",
  "rights.licence.allRights.top": "All rights",
  "rights.licence.allRights.sub": "reserved",

  // ── Withdrawn: still available cards (StudioWithdrawnPage) ──
  "withdrawn.still.allReleases": "All releases",
  "withdrawn.still.meta.artistTracks_one": "{artist} · {count} track",
  "withdrawn.still.meta.artistTracks_other": "{artist} · {count} tracks",
  "withdrawn.still.meta.artistEp": "{artist} · EP",
  "withdrawn.still.meta.artistSingle": "{artist} · single",
  "withdrawn.still.meta.collectionTracks_one": "Collection · {count} track",
  "withdrawn.still.meta.collectionTracks_other": "Collection · {count} tracks",
  "withdrawn.still.meta.artistCity": "Artist · {city}",

  // ── Rail: library shelf (StudioRail) ──
  "rail.library.meta.album": "Album · {artist}",
  "rail.library.meta.set": "Set · {artist}",
  "rail.library.meta.collectionTracks_one": "Collection · {count} track",
  "rail.library.meta.collectionTracks_other": "Collection · {count} tracks",
  "rail.library.meta.mix": "Mix · {artist}",
  "rail.library.meta.live": "Live · {venue}",
};

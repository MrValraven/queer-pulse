import type { Catalog } from "../../types";

/**
 * Cinema — QueerPulse's community-owned queer film co-op (`/cinema/*`).
 *
 * Scope rule applied throughout: platform-authored chrome (nav, CTAs, section
 * titles, empty/error states, form labels, aria-labels, and the About/deed/
 * rights/governance prose that ships in the bundle) is translated. Film
 * titles, synopses, mock filmmaker/curator names, bios, and curator essays
 * are left in English — they're the fictional author's own words, and in live
 * mode they arrive over the wire unchanged (see docs/i18n/extraction-brief.md
 * §1). "Cinema" and "Studio" are brand/product nouns and are never
 * translated (see docs/i18n/glossary-pt.md).
 */
export const cinema: Catalog = {
  // ── Shell (CinemaShell.tsx) — floating dark nav + cinema footer ──────────
  "nav.thisWeek": "This week",
  "nav.browse": "Browse",
  "nav.collections": "Collections",
  "nav.madeHere": "Made here",
  "nav.openCalls": "Open calls",
  "nav.about": "About",
  "nav.membership": "Membership",
  "nav.submitCta": "Submit a film",
  "nav.sustainCta": "Sustain · {price}/mo",
  "brand.tag": "Cinema",
  "footer.tagline":
    "A queer professional network rooted in Lisbon. Cinema is one of its rooms.",
  "footer.cinema.heading": "Cinema",
  "footer.cinema.thisWeek": "This week",
  "footer.cinema.browseAll": "Browse all",
  "footer.cinema.collections": "Collections",
  "footer.cinema.membership": "Membership",
  "footer.filmmakers.heading": "Filmmakers",
  "footer.filmmakers.submit": "Submit",
  "footer.filmmakers.revenueSplit": "Revenue split",
  "footer.filmmakers.rights": "Rights",
  "footer.about.heading": "About",
  "footer.about.publicLedger": "Public ledger",
  "footer.about.access": "Access",
  "footer.about.queerpulse": "QueerPulse",
  "footer.copyright": "© {year} QueerPulse Cinema Co-op CRL, Lisbon",
  "footer.split": "80% of every rent goes to the filmmaker.",

  // ── Landing (CinemaPage.tsx) ───────────────────────────────────────────────
  "meta.title": "QueerPulse Cinema: a community-owned queer film co-op",
  "meta.description":
    "Stream queer cinema, discover curated collections, and back films made here. QueerPulse Cinema, a community-owned film co-op in Lisbon.",

  // CinemaHero.tsx — CinemaMast / AskStrip / CinemaCover
  "mast.issueLabel": "Programme: Week {week} · {year}",
  "mast.dateRange": "{start} to {end}",
  "mast.tagline":
    "A theatre, an archive, a co-op. <em>Eighty percent of every rent</em> goes to the filmmaker.",
  "mast.sectionNav.thisWeek": "This week",
  "mast.sectionNav.browseAll": "Browse all",
  "mast.sectionNav.collections": "Collections",
  "mast.sectionNav.documentaries": "Documentaries",
  "mast.sectionNav.features": "Features",
  "mast.sectionNav.shorts": "Shorts",
  "mast.sectionNav.series": "Series",
  "mast.sectionNav.openCalls": "Open calls",
  "ask.text":
    "Not sure what to watch? Tell us your mood and we'll pick one film, chosen by curators rather than an algorithm.",
  "ask.cta": "Ask the room",
  "cover.nowShowing": "Now showing",
  "cover.freeForSustainers": "Free for sustainers",
  "cover.liveQna": "Live Q&A · Wed 21:00",
  "cover.watchNowCta": "Watch now",
  "cover.rentCta": "Rent · {price}",
  "cover.rsvpCta": "RSVP live Q&A",
  "cover.splitNote":
    "If you rent, <strong>{filmmakerShare} goes directly to Maria.</strong> {platformShare} covers payments & hosting.",

  // CinemaCatalog.tsx — ProgrammeSection / CollectionsSection / MadeHereSection
  "access.free": "Free",
  "access.sustainer": "Sustainer",
  "access.rent": "Rent · {price}",
  "format.feature": "Feature",
  "format.documentary": "Documentary",
  "format.short": "Short",
  "format.series": "Series",
  "format.experimental": "Experimental",
  "programme.title": "This week's <em>programme</em>",
  "programme.lead":
    "Six films, hand-picked. Available all week. Rotates Monday at noon Lisbon.",
  "programme.allCta": "All programmes",
  "programme.notebook.eyebrow": "Curator's <em>notebook</em>",
  "programme.notebook.week": "week {week}",
  "programme.notebook.readMoreCta": "Read the full note",
  "collectionsSection.title": "Wander a <em>collection</em>",
  "collectionsSection.lead":
    "Curators build these slowly, over months. Each one is an argument.",
  "collectionsSection.allCta": "All collections",
  "collectionsSection.totalSuffix": "total",
  "madeHere.title": "Made <em>here</em>",
  "madeHere.lead":
    "Shorts & mid-lengths from QueerPulse members. Free to watch, paid to make.",
  "madeHere.exploreCta": "Explore Made Here",

  // CinemaClosing.tsx — LiveSection / LedgerSection / OpenCallsStrip / AboutStrip / CinemaOutro
  "live.title": "Live <em>this week</em>",
  "live.lead":
    "Premieres, Q&As, watch parties. Hosted by members, open by default.",
  "live.fullCalendarCta": "Full calendar",
  "live.badge.premiere": "Premiere",
  "live.badge.watchParty": "Watch party",
  "live.badge.inTheRoom": "In the room",
  "live.rsvpCta": "RSVP",
  "ledger.eyebrow": "How this works",
  "ledger.title": "The room <em>pays</em> the filmmaker.",
  "ledger.body":
    "QueerPulse Cinema runs as a co-op. 80% of every rent or buy goes to the filmmaker. 100% of every tip. The rest covers payments, hosting, and captioning. The ledger is public. The split is non-negotiable.",
  "ledger.submitCta": "Submit your film",
  "ledger.sustainCta": "Become a sustainer · {price}/mo",
  "ledger.readDeedCta": "Read the co-op deed",
  "ledger.rightsCta": "Filmmaker rights",
  "ledger.card.heading": "Public ledger · this month",
  "ledger.card.paidToFilmmakers": "Paid to filmmakers",
  "ledger.card.filmsStreamed": "Films streamed",
  "ledger.card.averageShare": "Average filmmaker share",
  "ledger.card.openCommissions": "Open commissions",
  "ledger.card.footnote":
    "Updated every Monday at noon Lisbon. Audited quarterly.",
  "openCallsStrip.eyebrow_one": "{count} call open now",
  "openCallsStrip.eyebrow_other": "{count} calls open now",
  "openCallsStrip.title": "Make the <em>next</em> one.",
  "openCallsStrip.body":
    "Commissions, residencies, and mentorships: funded by sustainers, paid by the co-op. <em>{count} calls open · {amount} available this season.</em>",
  "openCallsStrip.cta": "See all open calls",
  "aboutStrip.eyebrow": "The co-op",
  "aboutStrip.title": "A theatre, an archive, <em>a room</em>.",
  "aboutStrip.body":
    "Programmed by queer people, paid to queer people, governed by the filmmakers and sustainers who make it possible. Read what QueerPulse Cinema actually is: the deed, the split, the curators' council.",
  "aboutStrip.cta": "Read the co-op story",
  "outro.title": "Watch <em>together</em>.",
  "outro.sub": "Cinema is a room with people in it. The room is open.",
  "outro.sustainCta": "Sustain the cinema",

  // ── Browse (CinemaBrowsePage.tsx, CinemaBrowseControls.tsx) ───────────────
  "browse.hero.eyebrow": "The full catalogue",
  "browse.hero.title": "Browse <em>everything</em>",
  "browse.hero.lead":
    "{count} films, programmed by queer people and paid to queer people. Filter by access, format, language, and mood, guided by curators rather than an algorithm.",
  "browse.filters.heading": "Filter <em>&</em> sort",
  "browse.filters.clearAll": "Clear all",
  "browse.filters.groupAccess": "Access",
  "browse.filters.groupFormat": "Format",
  "browse.filters.groupMadeBy": "Made by",
  "browse.filters.groupCountry": "Country of origin",
  "browse.filters.groupAccessibility": "Accessibility",
  "browse.filters.groupMood": "Mood",
  "browse.filters.accessRent": "Rent",
  "browse.madeBy.trans": "Trans filmmakers",
  "browse.madeBy.lesbian": "Lesbian filmmakers",
  "browse.madeBy.gay": "Gay filmmakers",
  "browse.madeBy.nonBinary": "Non-binary filmmakers",
  "browse.madeBy.qpMembers": "QP members",
  "browse.country.portugal": "Portugal",
  "browse.country.brazil": "Brazil",
  "browse.country.france": "France",
  "browse.country.japan": "Japan",
  "browse.country.uk": "UK",
  "browse.country.senegal": "Senegal",
  "browse.country.egypt": "Egypt",
  "browse.accessibility.ptSubtitles": "PT subtitles",
  "browse.accessibility.enSubtitles": "EN subtitles",
  "browse.accessibility.audioDescription": "Audio description",
  "browse.accessibility.signLanguage": "Sign language",
  "browse.mood.slow": "Slow",
  "browse.mood.tender": "Tender",
  "browse.mood.political": "Political",
  "browse.mood.funny": "Funny",
  "browse.mood.healing": "Healing",
  "browse.mood.joyful": "Joyful",
  "browse.sort.curated": "Curators' pick",
  "browse.sort.newest": "Newest first",
  "browse.sort.oldest": "Oldest first",
  "browse.sort.az": "Title A–Z",
  "browse.activeLabel": "Active:",
  "browse.removeChipAriaLabel": "Remove {chip}",
  "browse.results.showing_one": "Showing <strong>{count} film</strong>",
  "browse.results.showing_other": "Showing <strong>{count} films</strong>",
  "browse.results.matchingFilters": " matching your filters",
  "browse.results.inCatalogue": " in the catalogue",
  "browse.empty.title": "No films match these filters",
  "browse.empty.description":
    "Try loosening a filter or two. The catalogue is broad, but these picks are specific.",
  "browse.empty.clearCta": "Clear filters",

  // ── Shared film-relation chrome (data.ts filmRelationReason) ──────────────
  "film.relation.sameCountry": "Same country · {country}",
  "film.relation.sameForm": "Same form · {format}",
  "film.relation.curatorsPick": "Curator's pick",

  // ── Shared ImageSlot placeholder captions — platform-authored labels shown
  // in the empty/failed image frame (the slot's own src is a real cover in
  // both modes; this is the load-failure fallback caption). ─────────────────
  "slot.poster": "poster",
  "slot.coverFilm": "cover film · poster",
  "slot.programmeCover": "programme cover",
  "slot.spotlightPoster": "spotlight poster",
  "slot.curatorPortrait": "curator portrait · 3:4",
  "slot.filmPoster": "film poster · 3:4",
  "slot.filmmakerPortrait": "filmmaker portrait · 3:4",
  "slot.filmFrame": "film frame · cinematic still",

  // ── Film page (FilmPage.tsx, FilmHero*.tsx, FilmBody.tsx) — chrome only;
  // film title/synopsis/crew bios/curator quote/event date are this film's own
  // content and stay English ─────────────────────────────────────────────────
  "film.crumb.backCta": "Back to slate",
  "film.split.eyebrow": "The split",
  "film.split.title":
    "Eighty percent of every rent goes to <em>the filmmaker.</em>",
  "film.split.body":
    "No exceptions, no tiers, no negotiated rates. The same deal for the first-time maker as for the festival winner. The ledger is public; the deed is binding.",
  "film.split.breakdownHeading": "{price} rent · where it goes",
  "film.split.amountTo": "{amount} to {name}",
  "film.split.explainer":
    "When you rent at {rentPrice}, <strong>{filmmakerShare} goes to {name}.</strong> {paymentFee} covers payment processing. {hostingFee} covers hosting & captions. The split is the same for every filmmaker.",
  "film.split.readDeedCta": "Read the deed",
  "film.related.title": "More from the <em>programme</em>",
  "film.related.sub": "Films sharing a curator, a country, or a question.",

  "film.hero.coverWeek": "Cover film · week {week}",
  "film.hero.programmedBy": "Programmed by",
  "film.hero.rsvpCta": "RSVP",
  "film.facts.language": "Language",
  "film.facts.captions": "Captions",

  "film.poster.trailerCta": "Press play · trailer {duration}",
  "film.tipjar.heading": "↳ tip the filmmaker",
  "film.tipjar.note": "100% goes to {name}. No fees skimmed.",
  "film.tipjar.footnote_one":
    "<strong>{count} member</strong> has tipped this week.",
  "film.tipjar.footnote_other":
    "<strong>{count} members</strong> have tipped this week.",
  "film.tipjar.tippedToast": "Tipped {amount} to {name}",

  "film.watchTabs.watch.label": "Watch",
  "film.watchTabs.watch.sub": "included · sustainer",
  "film.watchTabs.rent.sub": "{hours} hrs",
  "film.watchTabs.buy.label": "Buy · {price}",
  "film.watchTabs.buy.sub": "forever",
  "film.watch.mainCta": "Watch full film · {duration}",
  "film.watchlist.add": "Add to watchlist",
  "film.watchlist.remove": "Remove from watchlist",
  "film.watchlist.addedToast": "Added to your watchlist",
  "film.watchlist.removedToast": "Removed from your watchlist",
  "film.share.title": "Share",
  "film.share.ariaLabel": "Copy link to this film",
  "film.share.copiedToast": "Link copied",
  "film.share.copyErrorToast": "Could not copy link",

  "film.body.filmWords.title": "The film's own <em>words</em>",
  "film.body.cast.title": "Cast & <em>crew</em>",
  "film.body.tag.member": "QueerPulse member",
  "film.body.filmmaker.stat.films_one": "<em>{count}</em> film on the cinema",
  "film.body.filmmaker.stat.films_other":
    "<em>{count}</em> films on the cinema",
  "film.body.filmmaker.stat.earned": "earned here",
  "film.body.filmmaker.viewProfileCta": "View profile",
  "film.body.filmmaker.followCta": "Follow filmmaker",
  "film.body.filmmaker.followingCta": "Following",
  "film.body.filmmaker.followedToast": "Following {name}",
  "film.body.filmmaker.unfollowedToast": "Unfollowed {name}",

  // ── Collection detail (CinemaCollectionPage.tsx + Header/Essay/Films/Aside)
  // — chrome shell only; each collection's essay/stats/film list/prices are
  // that collection's own curated content and stay English (fetched in live
  // mode from GET /cinema/collections/:slug) ────────────────────────────────
  "collection.notFound.eyebrow": "Collection not found",
  "collection.notFound.title": "We couldn't find <em>that collection</em>",
  "collection.notFound.body":
    "It may have been renamed or retired. Browse the full catalogue to find where the films went.",
  "collection.notFound.browseCta": "Browse all films",
  "collection.outro.title": "A cinema that <em>argues</em>.",
  "collection.outro.sub":
    "Collections are curators' arguments. Sustainers fund the next ones.",
  "collection.backCta": "Back to Cinema",
  "collection.details.heading": "Collection details",
  "collection.details.startWatchingCta": "Start watching",
  "collection.details.saveCta": "+ Save collection",
  "collection.films.watchCta": "Watch",
  "collection.films.watchNowCta": "Watch now",
  "collection.films.seeAllFallback": "See all films",
  "collection.aside.progressHeading": "Your progress",
  "collection.aside.progressHint": "Sign in to track where you are",
  "collection.aside.signInCta": "Sign in to track progress",
  "collection.aside.relatedHeading": "Related collections",

  // ── Collections index (CinemaCollectionsPage.tsx, CinemaCollectionsSections.tsx)
  // — filter chips + page chrome; collectionsHeader quote, per-collection
  // desc/stats/curator, and the propose-a-collection body copy are this
  // page's own editorial content and stay English ────────────────────────────
  "collectionsIndex.filter.all": "All",
  "collectionsIndex.filter.new": "New",
  "collectionsIndex.filter.shortCollections": "Short collections",
  "collectionsIndex.filterLabel": "Filter:",
  "collectionsIndex.summary_one":
    "{count} collection · {filmTotal} films total",
  "collectionsIndex.summary_other":
    "{count} collections · {filmTotal} films total",
  "collectionsIndex.empty.title":
    "<em>Still</em> no collections in this filter.",
  "collectionsIndex.empty.body":
    "The council is always building. Try another lens.",
  "collectionsIndex.empty.resetCta": "Show all collections",
  "collectionsIndex.outro.title": "Start <em>wandering</em>.",
  "collectionsIndex.outro.sub":
    "Collections are how we argue about film. Pick one and begin.",
  "collectionsIndex.outro.cta": "Open a collection",
  "collectionsIndex.card.curatedBy": "Curated by",
  "collectionsIndex.propose.toast":
    "Send your 200-word thesis to hello@queerpulse.com. The council responds within 3 weeks.",
  "collectionsIndex.propose.cta": "Propose a collection",
  "collectionsIndex.propose.meetCouncilCta": "Meet the council",

  // ── Curator profile (CinemaCuratorPage.tsx, CuratorHero/Main/Aside.tsx) —
  // chrome shell only; each curator's bio, pull-quote, programme notes and
  // notebook entries are that person's own profile content and stay English
  // (fetched in live mode from GET /cinema/curators/:slug) ──────────────────
  "curator.notFound.title": "Curator not found",
  "curator.notFound.description":
    "This curator page doesn't exist or has moved. Meet the council on the cinema's About page.",
  "curator.notFound.backCta": "Back to the cinema",
  "curator.crumb.council": "Council",
  "curator.crumb.backCta": "Back to the council",
  "curator.outro.openCollectionCta": "Open the collection",
  "curator.main.coverFilmsTitle": "Recent <em>cover films</em>",
  "curator.main.programmesTotal_one": "{count} programme total",
  "curator.main.programmesTotal_other": "{count} programmes total",
  "curator.main.collectionsByTitle": "Collections <em>by {name}</em>",
  "curator.main.notebookTitle": "From the <em>notebook</em>",
  "curator.main.notebookEntries_one": "{count} entry",
  "curator.main.notebookEntries_other": "{count} entries",
  "curator.aside.otherCuratorsHeading": "Other curators",
  "curator.aside.contactHeading": "Contact",
  "curator.aside.contactBody":
    "For press enquiries, screening proposals, or collection suggestions, reach {name} through the co-op.",
  "curator.aside.contactCta": "Contact {name}",
  "curator.aside.proposeHeading": "Propose a collection",
  "curator.aside.proposeBody":
    "Have a thesis? A set of films that argue something together? Write to the council.",
  "curator.aside.proposeCta": "Propose",

  // ── Filmmaker profile (CinemaFilmmakerPage.tsx, FilmmakerHero/Main/Aside.tsx)
  // — chrome shell only; each filmmaker's bio, statement, filmography,
  // festivals and events are that person's own profile content and stay
  // English (fetched in live mode from GET /cinema/filmmakers/:slug) ────────
  "filmmaker.notFound.title": "Filmmaker not found",
  "filmmaker.notFound.description":
    "This filmmaker page doesn't exist or has moved. Browse the cinema to find work by queer filmmakers across the co-op.",
  "filmmaker.crumb.backCta": "Back to the cinema",
  "filmmaker.outro.title": "Make something. <em>Get paid.</em>",
  "filmmaker.outro.sub":
    "Submit your film to the cinema. The split is the same for everyone.",
  "filmmaker.hero.tipCta": "↳ Tip {name} · 100% goes directly to them",
  "filmmaker.hero.requestScreeningCta": "Request a screening",
  "filmmaker.hero.connectCta": "Connect on QueerPulse",
  "filmmaker.main.filmographyTitle": "Filmography <em>on Cinema</em>",
  "filmmaker.main.filmsTotal_one": "{count} film total",
  "filmmaker.main.filmsTotal_other": "{count} films total",
  "filmmaker.main.festivalCircuitTitle": "Festival <em>circuit</em>",
  "filmmaker.main.upcomingEventsTitle": "{name}'s <em>upcoming</em> events",
  "filmmaker.aside.tipHeading": "Tip {name}",
  "filmmaker.aside.tipSub":
    "100% goes to {name}. The co-op takes nothing off a tip. Tipping keeps them making things.",
  "filmmaker.aside.sendCta": "Send {amount}",
  "filmmaker.aside.tippedToast": "{amount} on its way to {name}. Thank you",
  "filmmaker.aside.tippedNote_one":
    "<strong>{count} member</strong> has tipped {name} this month.",
  "filmmaker.aside.tippedNote_other":
    "<strong>{count} members</strong> have tipped {name} this month.",
  "filmmaker.aside.splitHeading": "The co-op split",
  "filmmaker.aside.splitBody":
    "When you rent any of {name}'s films, <strong>80%</strong> goes to them. When you buy, the same. Tips are 100%. The split is the same for every filmmaker on the cinema.",
  "filmmaker.aside.seeOpenCallsCta": "See open calls",

  // ── Made Here / Shorts (CinemaShortsPage.tsx + Header/Intro/Curated/
  // Shelves/Catalog/Parts/Community.tsx) — chrome shell + filter/sort/lang
  // vocabulary; the curator's weekly note, the spotlight film, watch-party
  // line-up, vote options and transparency figures are this page's own
  // editorial/community content and stay English ────────────────────────────
  "shorts.toast.savedToWatchlist": "Saved to your watchlist",
  "shorts.toast.linkCopiedShare": "Link copied. Share “{label}”",
  "shorts.outro.title": "Tip a <em>filmmaker</em>.",
  "shorts.outro.sub":
    "100% goes to them. No fees. No minimum. Watch first, then decide.",
  "shorts.outro.browseCta": "Browse all community films",
  "shorts.header.eyebrow": "Community films · all free to watch",
  "shorts.header.sub":
    "Shorts, mid-lengths, and documentary works made by QueerPulse members. <em>Free to watch, paid to make.</em> Tip the filmmaker. 100% goes to them.",
  "shorts.curatorNote.readPastNotesCta": "read past notes",
  "shorts.accessNote.body":
    "<strong>Every film is captioned.</strong> Content notes appear on each film, and audio-described works are marked <em>AD</em>. Filter by your access needs below.",
  "shorts.spotlight.mostWatchedBadge": "Most watched this week",
  "shorts.spotlight.communityPickKicker": "Community pick · week {week}",
  "shorts.spotlight.watchNowCta": "Watch now · free",
  "shorts.spotlight.tipCollectiveCta": "Tip the collective",
  "shorts.spotlight.becomeSustainerCta": "Become one",
  "shorts.shelf.newThisWeek.title": "New <em>this week</em>",
  "shorts.shelf.newThisWeek.sub":
    "Films submitted and approved in the last 7 days",
  "shorts.shelf.newThisWeek.cta": "All new",
  "shorts.shelf.becauseYouTipped.title":
    "Because you tipped <em>{filmTitle}</em>",
  "shorts.shelf.becauseYouTipped.sub":
    "More from {maker}, and films in the same key",
  "shorts.shelf.becauseYouTipped.cta": "{maker}'s page",
  "shorts.shelf.firstFilm.title": "Someone's <em>first film</em>",
  "shorts.shelf.firstFilm.sub": "Debuts deserve a first audience. Be theirs",
  "shorts.shelf.firstFilm.cta": "All debuts",
  "shorts.shelf.mostTipped.title": "Most <em>tipped</em>",
  "shorts.shelf.mostTipped.sub":
    "Films where members have been generous this month",
  "shorts.shelf.mostTipped.cta": "All films",
  "shorts.shelf.continueWatching.title": "Continue <em>watching</em>",
  "shorts.shelf.continueWatching.sub": "Pick up where you left off",
  "shorts.shelf.continueWatching.cta": "Your library",
  "shorts.shelf.continueWatching.minutesLeft": "{minutes} min left · {maker}",
  "shorts.shelf.programmes.title": "Watch by <em>programme</em>",
  "shorts.shelf.programmes.sub":
    "Short sets curated by members, a way in when you don't know where to start",
  "shorts.shelf.programmes.cta": "All programmes",
  "shorts.shelf.programmes.shareAriaLabel": "Share programme",
  "shorts.shelf.meetMakers.title": "Meet the <em>makers</em>",
  "shorts.shelf.meetMakers.sub":
    "Every film here has a person behind it. Say hello",
  "shorts.shelf.meetMakers.cta": "All filmmakers",
  "shorts.catalog.title": "Browse the <em>full catalogue</em>",
  "shorts.catalog.sub":
    "Every community film: filter, sort, and search your way in",
  "shorts.catalog.cta": "Open in Browse",
  "shorts.catalog.searchPlaceholder": "Search films, makers, or themes…",
  "shorts.catalog.searchAriaLabel": "Search films",
  "shorts.catalog.languageLabel": "Language",
  "shorts.catalog.languageAriaLabel": "Filter by language",
  "shorts.catalog.sortLabel": "Sort",
  "shorts.catalog.sortAriaLabel": "Sort films",
  "shorts.catalog.surpriseCta": "Surprise me",
  "shorts.catalog.surpriseToast": "Try this one → {title}",
  "shorts.catalog.allFilmsChip": "All films",
  "shorts.catalog.empty.title": "Nothing matches, yet",
  "shorts.catalog.empty.body":
    "No films fit that combination. Loosen a filter, or tell us what you wish existed. We commission from member requests.",
  "shorts.catalog.empty.clearCta": "Clear filters",
  "shorts.catalog.empty.suggestCta": "Suggest a film",
  "shorts.catalog.count_one": "<em>{count}</em> film · all free to watch",
  "shorts.catalog.count_other": "<em>{count}</em> films · all free to watch",
  "shorts.card.runtime": "{minutes} min",
  "shorts.card.ccBadge": "CC",
  "shorts.card.adBadge": "AD",
  "shorts.card.saveAriaLabel": "Save to watchlist",
  "shorts.card.watches_one": "{count} watch",
  "shorts.card.watches_other": "{count} watches",
  "shorts.card.contentNoteLabel": "content note",
  "shorts.card.contentNoteHeading": "Content note",
  "shorts.card.noContentNotes": "no content notes",
  "shorts.watchParties.title": "Watch <em>together</em>",
  "shorts.watchParties.sub":
    "Live rooms where the whole set plays at once, makers in the chat",
  "shorts.watchParties.hostCta": "Host one",
  "shorts.watchParties.nextBadge": "Next up",
  "shorts.watchParties.goingCount_one": "{count} going",
  "shorts.watchParties.goingCount_other": "{count} going",
  "shorts.watchParties.goingCta": "Going",
  "shorts.watchParties.rsvpFreeCta": "RSVP · free",
  "shorts.watchParties.rsvpToast": "You're going · {title}",
  "shorts.vote.title": "Programme the <em>next set</em>",
  "shorts.vote.window": "Members choose August's theme · voting closes 20 Jul",
  "shorts.vote.yourPickLabel": "Your pick",
  "shorts.vote.voteCta": "Vote",
  "shorts.vote.countedToast": "Vote counted. Thank you",
  "shorts.transparency.heading": "Where the money went · June",
  "shorts.transparency.ledgerCta": "See the open ledger",
  "shorts.submitCta.eyebrow": "Your film could be here",
  "shorts.submitCta.title": "Made something? <em>Submit it.</em>",
  "shorts.submitCta.body":
    "Any QueerPulse member can submit to the Made Here track. Free to list, free to watch. You keep your rights. Tips go 100% to you. There's also a {amount} commission closing 21 June.",
  "shorts.submitCta.cta": "Submit your film",
  "shorts.submitCta.seeGrantsCta": "See open grants",
  "shorts.curatorNote.eyebrow": "From the programmer · week {week}",
  "shorts.filterCat.runtime": "Runtime",
  "shorts.filterCat.type": "Type",
  "shorts.filterCat.access": "Access",
  "shorts.filterCat.more": "More",
  "shorts.filter.rtU10": "Under 10 min",
  "shorts.filter.rt1030": "10–30 min",
  "shorts.filter.rt30": "30 min+",
  "shorts.filter.kDoc": "Documentary",
  "shorts.filter.kNar": "Narrative",
  "shorts.filter.kEss": "Essay / experimental",
  "shorts.filter.aAd": "Audio-described",
  "shorts.filter.aCnf": "No content notes",
  "shorts.filter.mGrant": "Grant-funded",
  "shorts.filter.mLisbon": "Lisbon",
  "shorts.filter.mSaved": "Saved",
  "shorts.lang.any": "Any language",
  "shorts.lang.pt": "Portuguese",
  "shorts.lang.es": "Spanish",
  "shorts.lang.ptbr": "Português-BR",
  "shorts.lang.en": "English subtitles",
  "shorts.sort.newest": "Newest first",
  "shorts.sort.mostWatched": "Most watched",
  "shorts.sort.mostTipped": "Most tipped",
  "shorts.sort.shortest": "Shortest first",
  "shorts.sort.staffPicks": "Staff picks",

  // ── About (CinemaAboutPage.tsx, CinemaAboutSections.tsx, cinemaAbout.data.tsx) ─
  "about.hero.eyebrow": "QueerPulse Cinema · the co-op",
  "about.hero.title": "A theatre, an archive, <em>a co-op</em>.",
  "about.hero.sub":
    "QueerPulse Cinema is a room: programmed by queer people, <em>paid to queer people</em>, governed by the filmmakers and sustainers who make it possible.",
  "about.deed.label": "The <em>deed</em> · in plain language",
  "about.deed.p1":
    "QueerPulse Cinema exists because streaming platforms were not built for us. They take 70%. They show our films between things we'd never choose. They bury our communities in single-identity tags and algorithmic traps.",
  "about.deed.p2":
    "So we built something different. <strong>80% of every rent or buy</strong> goes to the filmmaker, paid the following Monday. 100% of every tip goes to them directly. The split is the same for every filmmaker, with no exceptions, ever.",
  "about.deed.p3":
    "The contract is non-exclusive. <em>You keep your film.</em> You can show it anywhere else. We hold no lock-in, no territory exclusivity, no right of first refusal. We're only showing it.",
  "about.deed.p4":
    "The curators' council (six people, rotating yearly) programmes the catalogue. They're paid a stipend voted on by patron-level sustainers. The ledger is public. The commissioning fund is public. The split calculation is public.",
  "about.deed.p5": "<em>That's the whole deal.</em>",
  "about.principles.title": "Six <em>principles</em>",
  "about.principles.p1.title": "The filmmaker <em>comes first</em>",
  "about.principles.p1.body":
    "80% of every transaction, paid weekly. 100% of tips. The split is the same for everyone. No exceptions. No renegotiation. <em>It's in the deed.</em>",
  "about.principles.p2.title": "Programming is <em>authorship</em>",
  "about.principles.p2.body":
    "Curators are authors: they write introductions, build arguments, programme sequences. Their names are on everything they choose.",
  "about.principles.p3.title": "Access is <em>first-class</em>",
  "about.principles.p3.body":
    "Every film has captions. Audio description grows weekly. Content notes with timecodes on every title. Sign language tracks where we can. This is not a nice-to-have.",
  "about.principles.p4.title": "Non-exclusive, <em>always</em>",
  "about.principles.p4.body":
    "We never own the film. Filmmakers can show it anywhere, any time, in any format. No territory exclusivity. No lock-in. The contract terminates with 30 days' notice from either party.",
  "about.principles.p5.title": "The ledger is <em>public</em>",
  "about.principles.p5.body":
    "Every month we publish: total paid to filmmakers, total streams, average filmmaker share, commissioning pool balance. Audited quarterly. No asterisks.",
  "about.principles.p6.title": "The door <em>stays open</em>",
  "about.principles.p6.body":
    "Community films are always free. Open events are always free. A sustainer's fee is never a condition of watching something that was made here, for the community.",
  "about.split.title": "The split, <em>explained</em>",
  "about.split.body1":
    "When you rent a film for {rentPrice}, {filmmakerShare} goes to the filmmaker. That's 80%. The remaining 20% covers payment processing (Stripe/IBAN, roughly 12%) and video hosting and captioning costs (roughly 8%).",
  "about.split.body2":
    "For a direct buy at {buyPrice}, the same 80/20 applies: <em>{buyFilmmakerShare} to the filmmaker.</em> For tips, 100% goes to them. We don't take anything off a tip.",
  "about.split.body3":
    "The sustainer library pool is distributed monthly based on per-minute-watched, with 80% going to filmmakers from the subscriber revenue after platform costs.",
  "about.split.viewAccountsCta": "View the full public accounts",
  "about.split.exampleHeading": "Example: {price} rental",
  "about.split.divideLabel": "How {price} divides",
  "about.split.legend.filmmaker": "Filmmaker (80%)",
  "about.split.legend.paymentFees": "Payment fees (12%)",
  "about.split.legend.hosting": "Hosting (8%)",
  "about.split.tipsNote": "Tips are 100% to the filmmaker. No deduction.",
  "about.council.title": "The curators' <em>council</em>",
  "about.council.sub":
    "Six people who programme the cinema. They rotate every year, nominated by the community, confirmed by sustainers' vote. Each brings a different geography, focus, and way of looking.",
  "about.gov.ledgerTitle": "Public <em>ledger</em> · {month}",
  "about.gov.ledger.sustainers": "Sustainers",
  "about.gov.ledger.paidToFilmmakers": "Paid to filmmakers this month",
  "about.gov.ledger.filmsStreamed": "Films streamed this month",
  "about.gov.ledger.averageShare": "Average filmmaker share",
  "about.gov.ledger.commissioningPool": "Commissioning pool (season {season})",
  "about.gov.ledger.filmsInCatalogue": "Films in catalogue",
  "about.gov.fullAccountsCta": "Full accounts",
  "about.gov.decisionsTitle": "How decisions <em>get made</em>",
  "about.gov.decision.programme": "Programme decisions",
  "about.gov.decision.programmeValue": "Curators' <em>council</em>",
  "about.gov.decision.stipend": "Curator stipend",
  "about.gov.decision.stipendValue": "Patron <em>vote</em>",
  "about.gov.decision.revenueSplit": "Revenue split",
  "about.gov.decision.revenueSplitValue": "Non-<em>negotiable</em>",
  "about.gov.decision.openCallBriefs": "Open call briefs",
  "about.gov.decision.openCallBriefsValue": "Council + <em>community</em>",
  "about.gov.decision.annualAssembly": "Annual assembly",
  "about.gov.decision.annualAssemblyValue": "All <em>patrons</em>",
  "about.gov.decision.audit": "Audit",
  "about.gov.decision.auditValue": "<em>Quarterly</em>",
  "about.gov.rightsCta": "Filmmaker rights",
  "about.outro.title": "Sustain <em>the room</em>.",
  "about.outro.sub":
    "{price}/mo. Cancel any time. Every sustainer keeps the door open.",
  "about.outro.cta": "Become a sustainer",

  // ── Rights (CinemaRightsPage.tsx, RightsHero/SideNav/ContractCard.tsx) —
  // hero, short-version summary table, side-nav + section labels, and the
  // contract-card chrome are platform-authored and translated. The FAQ
  // question/answer pairs (RightsFaqParts.tsx) and the contact block's own
  // title/body quote precise contract clauses and are deliberately left
  // English — see the i18n sweep report for why (flagged, not translated). ─
  "rights.hero.eyebrow": "For filmmakers · your rights",
  "rights.hero.title": "Your film <em>stays yours</em>.",
  "rights.hero.sub":
    "Everything about how the co-op treats your work: the split, the contract, what we can and can't do, how you leave if you want to. <em>Plain language, no asterisks.</em>",
  "rights.hero.shortVersionHeading": "The short version",
  "rights.shortVersion.revenueSplit.label": "Revenue split",
  "rights.shortVersion.revenueSplit.value": "<em>80</em>% to you",
  "rights.shortVersion.tips.label": "Tips",
  "rights.shortVersion.tips.value": "<em>100</em>% to you",
  "rights.shortVersion.contractType.label": "Contract type",
  "rights.shortVersion.contractType.value": "Non-<em>exclusive</em>",
  "rights.shortVersion.territory.label": "Territory",
  "rights.shortVersion.territory.value": "You <em>choose</em>",
  "rights.shortVersion.exitNotice.label": "Exit notice",
  "rights.shortVersion.exitNotice.value": "<em>30</em> days",
  "rights.shortVersion.rightsRetained.label": "Your rights retained",
  "rights.shortVersion.rightsRetained.value": "<em>All</em>",
  "rights.sideNav.ariaLabel": "On this page",
  "rights.section.contract.label": "The contract",
  "rights.section.contract.title": "The <em>contract</em>",
  "rights.section.revenue.label": "Revenue & payment",
  "rights.section.revenue.title": "Revenue <em>& payment</em>",
  "rights.section.territory.label": "Territory & exclusivity",
  "rights.section.territory.title": "Territory <em>& exclusivity</em>",
  "rights.section.content.label": "Your content",
  "rights.section.content.title": "Your <em>content</em>",
  "rights.section.exit.label": "Termination & exit",
  "rights.section.exit.title": "Termination <em>& exit</em>",
  "rights.section.access.label": "Accessibility",
  "rights.section.access.title": "<em>Accessibility</em>",
  "rights.contractCard.eyebrow": "The contract, in plain language",
  "rights.contractCard.title":
    "What you agree to, and what <em>we</em> agree to.",
  "rights.contractCard.point.pay": "We pay 80% of every transaction to you",
  "rights.contractCard.point.tips": "100% of tips goes to you, no fees skimmed",
  "rights.contractCard.point.nonExclusive":
    "Non-exclusive: show it anywhere else too",
  "rights.contractCard.point.territory":
    "You choose which territories we serve",
  "rights.contractCard.point.consent":
    "We never alter your film without written consent",
  "rights.contractCard.point.withdraw":
    "You can withdraw with 30 days' written notice",
  "rights.contractCard.downloadToast": "The full contract PDF is coming soon.",
  "rights.contractCard.downloadCta": "Download the full contract (PDF)",
  "rights.contact.contactTeamCta": "Contact the rights team",
  "rights.contact.submitCta": "Submit a film",

  // ── Open calls (CinemaOpenCallsPage.tsx + Hero/HowItWorks/Body.tsx) — page
  // chrome only. Each commission/residency's own body, details, amounts,
  // deadlines and applicant counts are that call's own instance content and
  // stay English, matching the mock-data precedent elsewhere in this file. ──
  "openCalls.hero.sub":
    "Commissions, residencies, and mentorships: funded by sustainers, paid by the co-op, distributed through the cinema. <em>Queer filmmakers only. Anyone can apply.</em>",
  "openCalls.hero.seasonLabel": "Season 3 · spring/summer 2026",
  "openCalls.hero.sidebarNote":
    "Funded by sustainers' subscriptions. Pool grows each month. Every new sustainer adds ~{amount} to the next season's fund.",
  "openCalls.hero.stat.totalAvailable": "Total available",
  "openCalls.hero.stat.activeCalls": "Active calls",
  "openCalls.hero.stat.applicationsSoFar": "Applications so far",
  "openCalls.hero.stat.filmsFunded": "Films funded to date",
  "openCalls.how.title": "How the <em>fund</em> works",
  "openCalls.how.step1.title": "Sustainers <em>fund it</em>",
  "openCalls.how.step1.body":
    "Every sustainer's {price}/mo contributes ~{poolShare} per month to the commissioning pool. The pool total is public.",
  "openCalls.how.step2.title": "Curators <em>define calls</em>",
  "openCalls.how.step2.body":
    "Each season, the curators' council writes the briefs: open, specific, grounded in the films they want to see exist.",
  "openCalls.how.step3.title": "Filmmakers <em>apply</em>",
  "openCalls.how.step3.body":
    "Applications reviewed by the curators' council. Decisions within 14 days. Written feedback whether you're accepted or not.",
  "openCalls.how.step4.title": "Films <em>premiere here</em>",
  "openCalls.how.step4.body":
    "Commissioned work premieres on QueerPulse Cinema first, then is distributed freely or with a revenue split the filmmaker chooses.",
  "openCalls.body.commissionsTitle": "Commissions <em>& grants</em>",
  "openCalls.body.openCount": "{count} open",
  "openCalls.body.residenciesTitle": "Residencies <em>& mentorships</em>",
  "openCalls.body.gotMadeTitle": "What <em>got made</em>",
  "openCalls.body.allFundedCta": "All funded films",
  "openCalls.card.deadlineLabel": "Deadline",
  "openCalls.card.applyNowCta": "Apply now",
  "openCalls.card.downloadBriefCta": "Download brief PDF",
  "openCalls.card.downloadToast": "Brief PDF is downloading. Check your files.",
  "openCalls.card.applyCta": "Apply",
  "openCalls.outro.title": "Fund the <em>next</em> call.",
  "openCalls.outro.sub":
    "Sustainers fund the commissions. Every new sustainer grows the next season's pool.",
  "openCalls.outro.cta": "Become a sustainer → {price}/mo",

  // ── Membership (CinemaMembershipPage.tsx + Pays.tsx) — pricing/plans page
  // chrome. Tier names/descriptions/feature bullets are platform-authored
  // marketing copy (never fetched), so unlike most of this file every string
  // here is translated, not left as content. ───────────────────────────────
  "membership.hero.eyebrow": "QueerPulse Cinema · sustainer membership",
  "membership.hero.title": "The room <em>stays open</em> because you're in it.",
  "membership.hero.sub":
    "Sustainers fund the films, the commissions, the captions, and the curators. In return: everything. No algorithm, no lock-in, no dark patterns. Cancel any time.",
  "membership.tier.free.tag": "Free · always",
  "membership.tier.free.name": "The <em>door</em>",
  "membership.tier.free.desc":
    "The door is open. Community films, made-here shorts, and selected free-tier films. No account needed. No time limit.",
  "membership.tier.free.feature1": "All free-tier films (40+ in catalogue)",
  "membership.tier.free.feature2": "All made-here community shorts",
  "membership.tier.free.feature3": "Free live events & Q&As",
  "membership.tier.free.feature4": "Captions & audio description",
  "membership.tier.free.feature5": "Sustainer library (100+ films)",
  "membership.tier.free.feature6": "Offline downloads",
  "membership.tier.free.feature7": "Votes on open calls",
  "membership.tier.free.cta": "Browse free films",
  "membership.tier.sustainer.tag": "Sustainer · monthly",
  "membership.tier.sustainer.name": "The <em>room</em>",
  "membership.tier.sustainer.desc":
    "Everything in the cinema, plus your {price} directly funds the commissioning pool, the captioning fund, and the curators' stipend. The number is transparent.",
  "membership.tier.sustainer.feature1": "Everything in Free",
  "membership.tier.sustainer.feature2": "Full sustainer library, 142 films",
  "membership.tier.sustainer.feature3": "Offline downloads (sustainer titles)",
  "membership.tier.sustainer.feature4": "Watch parties with other sustainers",
  "membership.tier.sustainer.feature5": "Vote on open calls & commissions",
  "membership.tier.sustainer.feature6": "Curator's notebook, full essays",
  "membership.tier.sustainer.feature7": "Screener access (festival films)",
  "membership.tier.sustainer.cta": "Become a sustainer · {price}/mo",
  "membership.tier.sustainer.note":
    "Cancel any time. No lock-in. No dark patterns.",
  "membership.tier.sustainer.badge": "Most sustainers choose this",
  "membership.tier.patron.tag": "Patron · monthly",
  "membership.tier.patron.name": "The <em>patron</em>",
  "membership.tier.patron.desc":
    "Everything in Sustainer, plus your name on the public patron wall and a larger contribution to the commissioning pool (~{poolShare}/mo after costs).",
  "membership.tier.patron.feature1": "Everything in Sustainer",
  "membership.tier.patron.feature2": "Name on the patron wall (opt-in)",
  "membership.tier.patron.feature3": "Direct input on future open calls",
  "membership.tier.patron.feature4": "Invite to annual co-op assembly",
  "membership.tier.patron.feature5": "~{poolShare}/mo → commissioning pool",
  "membership.tier.patron.feature6": "Advance screeners before public",
  "membership.tier.patron.feature7": "Two guest passes per year",
  "membership.tier.patron.cta": "Become a patron · {price}/mo",
  "membership.tier.patron.note": "Cancel any time.",
  "membership.pays.title": "Where the money <em>actually</em> goes",
  "membership.pays.sub":
    "We publish the full breakdown quarterly. Here's the headline version, honest numbers, updated monthly.",
  "membership.pays.filmmakers.title": "Paid to <em>filmmakers</em>",
  "membership.pays.filmmakers.body":
    "80% of every rent or buy goes directly to the filmmaker. Tips are 100% theirs. The sustainer pool is distributed monthly by per-minute-watched.",
  "membership.pays.filmmakers.numSub": "This month · to filmmakers",
  "membership.pays.commissioning.title": "Commissioning <em>fund</em>",
  "membership.pays.commissioning.body":
    "~20% of sustainer subscriptions goes into the commissioning pool: open calls, residencies, and captioning support for community filmmakers.",
  "membership.pays.commissioning.numSub": "Available this season",
  "membership.pays.curators.title": "Curators & <em>captions</em>",
  "membership.pays.curators.body":
    "The curators' council receives a quarterly stipend voted on by patrons. A separate captioning fund supports filmmakers who can't afford captioning.",
  "membership.pays.curators.numSub": "Curators on the council",
  "membership.ledger.label": "Public ledger · {month} · updated Monday",
  "membership.ledger.sustainers.label": "Sustainers",
  "membership.ledger.sustainers.note": "Up 38 this month",
  "membership.ledger.paidToFilmmakers.note": "This month, all transactions",
  "membership.ledger.filmsInCatalogue.note": "9 new this month",
  "membership.ledger.commissionPool.label": "Commission pool",
  "membership.ledger.commissionPool.note": "Season 3 · 4 calls open",
  "membership.ledger.fullAccountsCta": "Full public accounts",

  // ── Submit wizard shell (CinemaSubmitPage.tsx, CinemaSubmitStepper.tsx,
  // CinemaSubmitAside.tsx) — header, stepper, nav, validation, success panel
  // and reassurance sidebar — plus (below, "submit.form.*"/"submit.option.*"/
  // "submit.widgets.*"/"submit.review.*") the step-by-step form fields
  // (Step1/Steps234/Review — labels, placeholders, option lists), now swept.
  // The two legal-consent checkboxes ("I hold the rights…" in Step 3, "I
  // agree to the co-op distribution terms…" in Review) are deliberately left
  // hardcoded English, NOT routed through the catalog at all — a subtly-off
  // pt-PT rendering would change what a filmmaker is representing/agreeing
  // to; see the sweep report. The aside's live open-call block is that
  // call's own instance content and stays English. ─────────────────────────
  "submit.header.eyebrow": "For filmmakers · open submission",
  "submit.header.title": "Submit <em>your</em> film.",
  "submit.header.sub":
    "The cinema is open to any queer filmmaker, community member or not. Five steps, 20 minutes. You choose your revenue model. The split is the same for everyone: 80% of every rent or buy comes to you.",
  "submit.promise.heading": "The promise, in numbers",
  "submit.promise.note":
    "Non-exclusive means you can still show elsewhere: festivals, your own site, other platforms. We hold no lock-in.",
  "submit.promise.row.yourShareRent": "Your share of every rent",
  "submit.promise.row.yourShareBuy": "Your share of every buy",
  "submit.promise.row.yourShareTip": "Your share of every tip",
  "submit.promise.row.paidToYou": "Paid to you",
  "submit.promise.row.contractType": "Contract type",
  "submit.promise.value.weekly": "<em>Weekly</em>",
  "submit.promise.value.nonExclusive": "Non-<em>exclusive</em>",
  "submit.stepper.ariaLabel": "Submission steps",
  "submit.step.theFilm.label": "The film",
  "submit.step.theFilm.sub": "Basic info",
  "submit.step.accessibility.label": "Accessibility",
  "submit.step.accessibility.sub": "Captions & AD",
  "submit.step.rights.label": "Rights",
  "submit.step.rights.sub": "Territory & term",
  "submit.step.revenue.label": "Revenue",
  "submit.step.revenue.sub": "How you want to sell",
  "submit.step.review.label": "Review",
  "submit.step.review.sub": "& submit",
  "submit.nav.next.accessibility": "Next: Accessibility",
  "submit.nav.next.rights": "Next: Rights",
  "submit.nav.next.revenue": "Next: Revenue",
  "submit.nav.next.review": "Review your film",
  "submit.nav.next.submit": "Submit your film",
  "submit.nav.saveDraft": "Save draft",
  "submit.nav.back": "Back",
  "submit.nav.hint": "Step {step} of {total} · Progress saves automatically",
  "submit.blocker.title": "Add your film's title first.",
  "submit.blocker.synopsis": "A short synopsis, in your own words.",
  "submit.blocker.screener": "Paste a screener link so we can watch it.",
  "submit.blocker.rights": "Please confirm you hold the rights.",
  "submit.blocker.agree": "Agree to the co-op terms to submit.",
  "submit.toast.draftSaved": "Draft saved to this device",
  "submit.sending.text": "Sending your film to the programming team…",
  "submit.toast.submitted": "Your film is with the programming team",
  "submit.success.title": "Your film is",
  "submit.success.em": "in the queue.",
  "submit.success.closeLabel": "Back to the cinema",
  "submit.success.step1":
    "A human watches it within 10–14 days, every submission, no exceptions.",
  "submit.success.step2":
    "We write back either way, with specific notes if it's a no.",
  "submit.success.step3":
    "If it's a yes, you're paid within 7 days of every rent, buy, and tip.",
  "submit.success.body":
    "Thank you for trusting us with it. Non-exclusive means nothing changes for you elsewhere. Keep showing it wherever you like while we take a look.",
  "submit.success.anotherCta": "Submit another film",
  "submit.comingSoon.title": "Submissions aren't",
  "submit.comingSoon.em": "open yet.",
  "submit.comingSoon.body":
    "Made Here isn't taking films over the wire yet, so nothing you enter here is sent or stored. We're building the submission pipeline now. Check back soon, and browse what the co-op is already screening in the meantime.",
  "submit.comingSoon.closeLabel": "Browse the cinema",
  "submit.aside.nextHeading": "What happens next",
  "submit.aside.openCallHeading": "Open call active",
  "submit.aside.applyCta": "Apply for the commission",
  "submit.aside.next.point1.strong": "We watch it.",
  "submit.aside.next.point1.rest":
    "Every submission is screened by a human, within 10–14 days.",
  "submit.aside.next.point2.strong": "We write back either way.",
  "submit.aside.next.point2.rest":
    "If we don't accept it, we say why specifically, in our own words.",
  "submit.aside.next.point3.strong": "Non-exclusive contract.",
  "submit.aside.next.point3.rest":
    "You keep all your other rights. You can still show the film anywhere.",
  "submit.aside.next.point4.strong": "Paid within 7 days",
  "submit.aside.next.point4.rest":
    "of each transaction, to your IBAN or Stripe account.",

  // ── Submit wizard form (CinemaSubmitStep1.tsx, CinemaSubmitSteps234.tsx,
  // CinemaSubmitReview.tsx, CinemaSubmitParts.tsx, CinemaSubmitWidgets.tsx).
  // "submit.form.*" — per-step headings/labels/placeholders/help text.
  "submit.form.step1.heading": "Tell us about <em>your film</em>",
  "submit.form.step1.sub":
    "Basic information, visible on the film's public page",
  "submit.form.step1.title.label": "Film title",
  "submit.form.step1.title.placeholder": "e.g. The light between rooms",
  "submit.form.step1.originalTitle.label": "Original title",
  "submit.form.step1.originalTitle.opt": "(if different)",
  "submit.form.step1.originalTitle.placeholder": "Title in original language",
  "submit.form.step1.year.label": "Year of production",
  "submit.form.step1.runtime.label": "Runtime (minutes)",
  "submit.form.step1.country.label": "Country of origin",
  "submit.form.step1.language.label": "Original language",
  "submit.form.step1.format.label": "Format",
  "submit.form.step1.format.ariaLabel": "Format",
  "submit.form.step1.synopsis.label": "Synopsis",
  "submit.form.step1.synopsis.why":
    "Written by you, in your own voice. 80–200 words. Not a pitch. Describe the film as if you're writing to a friend who hasn't seen it.",
  "submit.form.step1.synopsis.placeholder":
    "A patient, generous film about Lisbon's working-class queer elders, made over three years in the kitchens that raised them…",
  "submit.form.step1.statement.label": "Director's statement",
  "submit.form.step1.statement.opt": "(optional, but shown on the film page)",
  "submit.form.step1.statement.why":
    "Why you made it, and what you want people to bring to it. 60–120 words.",
  "submit.form.step1.statement.placeholder":
    "I make films about people who were never asked whether they wanted to be documented…",
  "submit.form.step1.identityTags.label":
    "Identity tags for yourself as filmmaker",
  "submit.form.step1.identityTags.why":
    "Self-disclosed only. These let viewers find more work by their communities. Never required. Tick what you want shown.",
  "submit.form.step1.contentNotes.label": "Content notes",
  "submit.form.step1.contentNotes.why":
    "We surface these prominently, with timecodes if you can provide them. Think of them as information: they help viewers decide whether tonight's the night for your film.",
  "submit.form.step1.poster.label": "Upload poster / key art",
  "submit.form.step1.poster.why":
    "3:4 ratio preferred. Min 1800px tall. Used on your film's page and in the catalogue grid.",
  "submit.form.step1.screener.label": "Screener link",
  "submit.form.step1.screener.why":
    "Password-protected Vimeo, Frame.io, or WeTransfer links work. We view every film before accepting it. Turnaround: 10–14 days.",
  "submit.form.step1.screener.placeholder":
    "https://vimeo.com/… or paste a WeTransfer link",

  "submit.form.step2.heading": "Accessibility <em>assets</em>",
  "submit.form.step2.sub":
    "Captions, audio description, sign-language tracks. We help if you're stuck. Nobody's turned away over cost.",
  "submit.form.step2.captions.label": "Do you have captions?",
  "submit.form.step2.captions.why":
    "We caption every film before it goes live. If you don't have captions, our access fund can make them for you.",
  "submit.form.step2.captions.ariaLabel": "Captions",
  "submit.form.step2.captionLangs.label": "Caption languages you can provide",
  "submit.form.step2.ad.label": "Audio description",
  "submit.form.step2.ad.why":
    "A described track or a script we can voice. Optional, but it opens your film to blind and low-vision viewers.",
  "submit.form.step2.ad.ariaLabel": "Audio description",
  "submit.form.step2.signTracks.label": "Sign-language tracks available",
  "submit.form.step2.notes.label": "Anything else we should know",
  "submit.form.step2.notes.opt": "(optional)",
  "submit.form.step2.notes.placeholder":
    "Flashing imagery timecodes, sensory notes, or access needs of your own we should plan around…",

  "submit.form.step3.heading": "Rights you're granting",
  "submit.form.step3.sub":
    "Non-exclusive, always. You keep every other right and can show the film anywhere else, anytime.",
  "submit.form.step3.territory.label": "Territory",
  "submit.form.step3.territory.why":
    "Where we can stream it. Worldwide reaches the most people, but a local-only première is completely fine.",
  "submit.form.step3.territory.ariaLabel": "Territory",
  "submit.form.step3.term.label": "Term",
  "submit.form.step3.term.why":
    "How long the film stays in the catalogue. You can pull it earlier at any time, no penalty.",
  "submit.form.step3.term.ariaLabel": "Term",

  "submit.form.step4.heading": "How you want <em>to sell</em>",
  "submit.form.step4.sub":
    "You choose. You can change this after submission, once per year.",
  "submit.form.step4.rentPrice.label": "Rental price (€2–8)",
  "submit.form.step4.buyPrice.label": "Buy price (min 2× rental)",

  "submit.form.review.heading": "Review & submit",
  "submit.form.review.sub":
    "One last look. You can edit any answer, or send it to the team now.",

  // "submit.option.*" — the option lists themselves (Pattern A: canonical
  // `value` in cinemaSubmit.data.ts, `labelKey`/`subKey` resolved here).
  "submit.option.format.documentary.label": "Documentary",
  "submit.option.format.documentary.sub": "Non-fiction",
  "submit.option.format.narrative.label": "Narrative feature",
  "submit.option.format.narrative.sub": "Fiction",
  "submit.option.format.short.label": "Short",
  "submit.option.format.short.sub": "Under 40 min",
  "submit.option.format.series.label": "Series",
  "submit.option.format.series.sub": "Episodic",
  "submit.option.format.experimental.label": "Experimental",
  "submit.option.format.experimental.sub": "Essay / hybrid",
  "submit.option.format.animation.label": "Animation",

  "submit.option.country.pt": "Portugal",
  "submit.option.country.br": "Brazil",
  "submit.option.country.fr": "France",
  "submit.option.country.es": "Spain",
  "submit.option.country.other": "Other",

  "submit.option.language.pt": "Portuguese",
  "submit.option.language.en": "English",
  "submit.option.language.fr": "French",
  "submit.option.language.es": "Spanish",
  "submit.option.language.other": "Other",

  // Self-identification terms (filmmaker's own tags) — see
  // docs/i18n/glossary-pt.md's queer-terminology table for the pt-PT side;
  // flagged for extra native-reviewer attention in the sweep report.
  "submit.option.identity.lesbian": "Lesbian",
  "submit.option.identity.gay": "Gay",
  "submit.option.identity.bi": "Bi",
  "submit.option.identity.transWoman": "Trans woman",
  "submit.option.identity.transMan": "Trans man",
  "submit.option.identity.nonBinary": "Non-binary",
  "submit.option.identity.queer": "Queer",
  "submit.option.identity.intersex": "Intersex",
  "submit.option.identity.asexual": "Asexual",

  "submit.option.captions.have.label": "I have them",
  "submit.option.captions.have.sub": "SRT / VTT ready",
  "submit.option.captions.help.label": "I need help",
  "submit.option.captions.help.sub": "Use the fund",
  "submit.option.captions.none.label": "None yet",
  "submit.option.captions.none.sub": "We'll talk",

  // Caption *track* languages the filmmaker can supply, incl. "Brazilian
  // PT" for an existing pt-BR caption file — distinct from the platform's
  // own pt-PT-only chrome; see cinemaSubmit.data.ts's CAPTION_LANGS comment.
  "submit.option.captionLang.pt": "Portuguese",
  "submit.option.captionLang.en": "English",
  "submit.option.captionLang.es": "Spanish",
  "submit.option.captionLang.fr": "French",
  "submit.option.captionLang.ptBr": "Brazilian PT",

  "submit.option.ad.have.label": "Audio description ready",
  "submit.option.ad.have.sub": "Track or script",
  "submit.option.ad.help.label": "I'd like help making one",
  "submit.option.ad.help.sub": "Access fund",
  "submit.option.ad.none.label": "Not this time",

  "submit.option.signTrack.lgp": "LGP",
  "submit.option.signTrack.asl": "ASL",
  "submit.option.signTrack.bsl": "BSL",
  "submit.option.signTrack.none": "None yet",

  "submit.option.territory.worldwide.label": "Worldwide",
  "submit.option.territory.worldwide.sub": "Reaches the most people",
  "submit.option.territory.europe.label": "Europe only",
  "submit.option.territory.europe.sub": "EU + UK",
  "submit.option.territory.portugal.label": "Portugal only",
  "submit.option.territory.portugal.sub": "Local première",

  "submit.option.term.oneYear.label": "One year",
  "submit.option.term.oneYear.sub": "Auto-renews, cancel anytime",
  "submit.option.term.twoYear.label": "Two years",
  "submit.option.term.twoYear.sub": "A little more stability",
  "submit.option.term.rolling.label": "Rolling",
  "submit.option.term.rolling.sub": "Until you pull it",

  "submit.option.revenue.free.label": "Free to watch",
  "submit.option.revenue.free.tag": "Free",
  "submit.option.revenue.free.desc":
    "Anyone can watch. You earn a per-watch share of the community pool, funded by sustainers. Good for shorts and activist work.",
  "submit.option.revenue.free.split": "~€0.03–0.12 per watch",
  "submit.option.revenue.sustainer.label": "Sustainer library",
  "submit.option.revenue.sustainer.tag": "Member",
  "submit.option.revenue.sustainer.desc":
    "Included in sustainer access. You earn a per-minute-watched share. Predictable, slower to grow.",
  "submit.option.revenue.sustainer.split": "~€0.008/min watched · 80% to you",
  "submit.option.revenue.rent.label": "Rent · you set the price",
  "submit.option.revenue.rent.tag": "€",
  "submit.option.revenue.rent.desc":
    "You set the rental price (min €2, max €8). 80% comes to you. 48-hour rental window.",
  "submit.option.revenue.rent.split": "80% to you · paid weekly",
  "submit.option.revenue.rentbuy.label": "Rent + Buy",
  "submit.option.revenue.rentbuy.tag": "€€",
  "submit.option.revenue.rentbuy.desc":
    "Set a rental price and a buy price (min 2× rental). 80% of both comes to you. Tips always 100%.",
  "submit.option.revenue.rentbuy.split": "80% rent + buy · 100% tip",

  // "submit.widgets.*" — ContentNotesBuilder + PosterUpload (CinemaSubmitWidgets.tsx).
  "submit.widgets.contentNotes.head": "Add one row per topic. Be specific",
  "submit.widgets.contentNotes.topicPlaceholder": "e.g. Grief",
  "submit.widgets.contentNotes.detailPlaceholder":
    "e.g. Discussion of bereavement and a partner's death",
  "submit.widgets.contentNotes.timecodePlaceholder": "Timecode (opt.)",
  "submit.widgets.contentNotes.topicAriaLabel": "Content note {index} topic",
  "submit.widgets.contentNotes.detailAriaLabel": "Content note {index} detail",
  "submit.widgets.contentNotes.timecodeAriaLabel":
    "Content note {index} timecode",
  "submit.widgets.contentNotes.removeAriaLabel": "Remove content note {index}",
  "submit.widgets.contentNotes.addCta": "Add another content note",
  "submit.widgets.poster.attached": "{filename} attached",
  "submit.widgets.poster.dropTitle": "Drop your poster here",
  "submit.widgets.poster.replaceHint": "Click to replace",
  "submit.widgets.poster.browseHint":
    "Or click to browse · JPG, PNG, TIFF · Max 50 MB",
  "submit.widgets.poster.note":
    "We will not crop or filter your poster without asking.",

  // "submit.review.*" — CinemaSubmitReview.tsx's read-back rows.
  "submit.review.editCta": "Edit",
  "submit.review.value.notAddedYet": "Not added yet",
  "submit.review.value.runtimeMinutes": "{minutes} min",
  "submit.review.value.notesAdded_one": "{count} added",
  "submit.review.value.notesAdded_other": "{count} added",
  "submit.review.value.yes": "Yes",
  "submit.review.field.title": "Title",
  "submit.review.field.yearRuntime": "Year · runtime",
  "submit.review.field.format": "Format",
  "submit.review.field.origin": "Origin",
  "submit.review.field.contentNotes": "Content notes",
  "submit.review.field.poster": "Poster",
  "submit.review.field.screener": "Screener",
  "submit.review.field.captions": "Captions",
  "submit.review.field.rightsConfirmed": "Rights confirmed",
  "submit.review.field.revenueModel": "Revenue model",

  // ── Watch player (WatchPage.tsx, WatchPageSections.tsx) — player chrome
  // only. The film's own title/meta/curator quote, its content notes, and
  // the Lobby/Live Q&A chat feed are that film's own instance content and
  // stay English. The `WatchTab` stored-value trap is now fixed — the tab
  // strip's state/comparison uses the canonical ids in watchPage.data.ts
  // (`"film-info" | "lobby" | "live-qna"`); "watch.tab.*" below are only the
  // display labels. ──────────────────────────────────────────────────────
  "watch.nav.backToFilm": "Film info",
  "watch.nav.cinemaHome": "Cinema home",
  "watch.nav.watchingAs": "Watching as <strong>{name}</strong>",
  "watch.nav.signInCta": "Sign in to save progress",
  "watch.overlay.ariaLabel": "Content notes before watching",
  "watch.overlay.heading": "Before you <em>watch</em>",
  "watch.overlay.sub_one":
    "This film has {count} content note. Take a moment, then decide when you're ready.",
  "watch.overlay.sub_other":
    "This film has {count} content notes. Take a moment, then decide when you're ready.",
  "watch.overlay.readyCta": "I'm ready · play the film",
  "watch.overlay.backCta": "Go back to film page",
  "watch.tab.filmInfo": "Film info",
  "watch.tab.lobby": "Lobby",
  "watch.tab.liveQna": "Live Q&A",
  "watch.facts.director": "Director",
  "watch.facts.runtime": "Runtime",
  "watch.facts.year": "Year",
  "watch.controls.subtitleLang.pt": "PT subs",
  "watch.controls.subtitleLang.en": "EN subs",
  "watch.controls.subtitleLang.es": "ES subs",
  "watch.controls.subtitleLang.none": "No subs",
  "watch.controls.ccAria": "English closed captions",
  "watch.controls.adAria": "Audio description",
  "watch.controls.ccToggleLabel": "CC EN",
  "watch.controls.adToggleLabel": "AD",
  "watch.controls.pausedStatus": "Paused at {time} · {remaining} min remaining",
  "watch.sidePanel.lobbyPlaceholder": "Say something to the lobby…",
  "watch.sidePanel.qnaPlaceholder": "Ask {name} a question…",
  "watch.sidePanel.sendCta": "Send",
  "watch.below.nextUpTitle": "Next <em>up</em>",
  "watch.below.splitHeading": "Your watch · where the money goes",
  "watch.below.splitLegend.filmmaker": "Filmmaker",
  "watch.below.splitLegend.payments": "Payments",
  "watch.below.splitLegend.hosting": "Hosting",

  // ── Live mode (real catalog + player) ──────────────────────────────────────
  "live.catalog.title": "The programme, streaming now",
  "live.catalog.lead":
    "Every film below is playable right now for signed-in members.",
  "live.viewCount": "{count} views",
  "live.finished": "Watched",
  "live.resumeAt": "{percent}% watched",
  "live.signIn.title": "Sign in to watch",
  "live.signIn.description":
    "The cinema is open to signed-in members. Sign in to stream the programme.",
  "live.signIn.cta": "Sign in",
  "live.empty.title": "The programme is quiet right now",
  "live.empty.description":
    "No films are streaming yet. Check back soon. New titles land every week.",
  "live.error.title": "The programme didn't load",
  "live.error.description":
    "Something went wrong loading the catalogue. Please try again in a moment.",
  "live.error.retry": "Try again",
  "live.pick.title": "Pick a film to watch",
  "live.pick.description":
    "Choose a title from the programme to start watching.",
  "live.pick.cta": "Browse the programme",
  "live.notFound.title": "This film isn't available",
  "live.notFound.description":
    "It may have been unpublished, or the link is out of date.",
  "live.notFound.cta": "Browse the programme",
  "live.playCta": "Play film",
  "live.resumeCta": "Resume watching",
  "live.playbackError": "This film couldn't start. Please try again.",
  "live.unsupported.title": "This browser can't play our films yet",
  "live.unsupported.description":
    "Our streaming format needs Safari on a Mac, iPhone or iPad today. Open this page there and the film will play. Support for Chrome and Firefox is being built.",
  "live.unsupported.cta": "Browse the programme",

  // ── Live-mode not-launched page (CinemaComingSoon, CON-03) ────────────────
  // Shown for EVERY /cinema/* route when demo mode is off. Cinema ships with
  // `launchedFeatures.cinema.launched = false`, so nothing streams and no
  // membership can be bought — this page must never re-state the offer.
  "comingSoon.metaTitle": "QueerPulse Cinema: opening soon",
  "comingSoon.title": "The cinema hasn't opened yet",
  "comingSoon.description":
    "Our co-op cinema is still being built: the programme, the memberships and the filmmaker revenue split all land together. Nothing is on sale and no film is streaming yet. We'll announce it here when the doors open.",
  "comingSoon.magazineCta": "Read the magazine",
  "comingSoon.backHome": "Back to home",
};

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
  "footer.copyright": "© {year} QueerPulse Cinema Co-op CRL — Lisbon",
  "footer.split": "80% of every rent goes to the filmmaker.",

  // ── Landing (CinemaPage.tsx) ───────────────────────────────────────────────
  "meta.title": "QueerPulse Cinema — a community-owned queer film co-op",
  "meta.description":
    "Stream queer cinema, discover curated collections, and back films made here — QueerPulse Cinema, a community-owned film co-op in Lisbon.",

  // CinemaHero.tsx — CinemaMast / AskStrip / CinemaCover
  "mast.issueLabel": "Programme — Week {week} · {year}",
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
    "Not sure what to watch? Tell us your mood and we'll pick one film — no algorithm, just curators.",
  "ask.cta": "Ask the room →",
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
  "programme.allCta": "All programmes →",
  "programme.notebook.eyebrow": "Curator's <em>notebook</em>",
  "programme.notebook.week": "week {week}",
  "programme.notebook.readMoreCta": "Read the full note →",
  "collectionsSection.title": "Wander a <em>collection</em>",
  "collectionsSection.lead":
    "Curators build these slowly, over months. They're not playlists — they're arguments.",
  "collectionsSection.allCta": "All collections →",
  "collectionsSection.totalSuffix": "total",
  "madeHere.title": "Made <em>here</em>",
  "madeHere.lead":
    "Shorts & mid-lengths from QueerPulse members. Free to watch, paid to make.",
  "madeHere.exploreCta": "Explore Made Here →",

  // CinemaClosing.tsx — LiveSection / LedgerSection / OpenCallsStrip / AboutStrip / CinemaOutro
  "live.title": "Live <em>this week</em>",
  "live.lead":
    "Premieres, Q&As, watch parties. Hosted by members, open by default.",
  "live.fullCalendarCta": "Full calendar →",
  "live.badge.premiere": "Premiere",
  "live.badge.watchParty": "Watch party",
  "live.badge.inTheRoom": "In the room",
  "live.rsvpCta": "RSVP",
  "ledger.eyebrow": "How this works",
  "ledger.title": "The room <em>pays</em> the filmmaker.",
  "ledger.body":
    "QueerPulse Cinema runs as a co-op. 80% of every rent or buy goes to the filmmaker. 100% of every tip. The rest covers payments, hosting, and captioning. The ledger is public. The split is non-negotiable.",
  "ledger.submitCta": "Submit your film →",
  "ledger.sustainCta": "Become a sustainer · {price}/mo",
  "ledger.readDeedCta": "Read the co-op deed",
  "ledger.rightsCta": "Filmmaker rights →",
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
    "Commissions, residencies, and mentorships — funded by sustainers, paid by the co-op. <em>{count} calls open · {amount} available this season.</em>",
  "openCallsStrip.cta": "See all open calls →",
  "aboutStrip.eyebrow": "The co-op",
  "aboutStrip.title": "A theatre, an archive, <em>a room</em>.",
  "aboutStrip.body":
    "Programmed by queer people, paid to queer people, governed by the filmmakers and sustainers who make it possible. Read what QueerPulse Cinema actually is — the deed, the split, the curators' council.",
  "aboutStrip.cta": "Read the co-op story →",
  "outro.title": "Watch <em>together</em>.",
  "outro.sub": "Cinema is a room with people in it. The room is open.",
  "outro.sustainCta": "Sustain the cinema",

  // ── Browse (CinemaBrowsePage.tsx, CinemaBrowseControls.tsx) ───────────────
  "browse.hero.eyebrow": "The full catalogue",
  "browse.hero.title": "Browse <em>everything</em>",
  "browse.hero.lead":
    "{count} films, programmed by queer people and paid to queer people. Filter by access, format, language, and mood — never by an algorithm.",
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
    "Try loosening a filter or two — the catalogue is broad, but these picks are specific.",
  "browse.empty.clearCta": "Clear filters",

  // ── Shared film-relation chrome (data.ts filmRelationReason) ──────────────
  "film.relation.sameCountry": "Same country · {country}",
  "film.relation.sameForm": "Same form · {format}",
  "film.relation.curatorsPick": "Curator's pick",

  // ── Film page (FilmPage.tsx, FilmHero*.tsx, FilmBody.tsx) — chrome only;
  // film title/synopsis/crew bios/curator quote/event date are this film's own
  // content and stay English ─────────────────────────────────────────────────
  "film.crumb.backCta": "← Back to slate",
  "film.split.eyebrow": "The split",
  "film.split.title":
    "Eighty percent of every rent goes to <em>the filmmaker.</em>",
  "film.split.body":
    "No exceptions, no tiers, no negotiated rates. The same deal for the first-time maker as for the festival winner. The ledger is public; the deed is binding.",
  "film.split.breakdownHeading": "{price} rent · where it goes",
  "film.split.amountTo": "{amount} to {name}",
  "film.split.explainer":
    "When you rent at {rentPrice}, <strong>{filmmakerShare} goes to {name}.</strong> {paymentFee} covers payment processing. {hostingFee} covers hosting &amp; captions. The split is the same for every filmmaker.",
  "film.split.readDeedCta": "Read the deed →",
  "film.related.title": "More from the <em>programme</em>",
  "film.related.sub": "Films sharing a curator, a country, or a question.",

  "film.hero.coverWeek": "Cover film · week {week}",
  "film.hero.programmedBy": "Programmed by",
  "film.hero.rsvpCta": "RSVP →",
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
  "film.watch.mainCta": "▶  Watch full film · {duration}",
  "film.watchlist.add": "Add to watchlist",
  "film.watchlist.remove": "Remove from watchlist",
  "film.watchlist.addedToast": "Added to your watchlist",
  "film.watchlist.removedToast": "Removed from your watchlist",
  "film.share.title": "Share",
  "film.share.ariaLabel": "Copy link to this film",
  "film.share.copiedToast": "Link copied",
  "film.share.copyErrorToast": "Could not copy link",

  "film.body.filmWords.title": "The film's own <em>words</em>",
  "film.body.cast.title": "Cast &amp; <em>crew</em>",
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
  "collection.backCta": "← Back to Cinema",
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
  "collectionsIndex.outro.cta": "Open a collection →",
  "collectionsIndex.card.curatedBy": "Curated by",
  "collectionsIndex.propose.toast":
    "Send your 200-word thesis to curators@queerpulse.co — the council responds within 3 weeks.",
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
  "curator.crumb.backCta": "← Back to the council",
  "curator.outro.openCollectionCta": "Open the collection →",
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
    "For press enquiries, screening proposals, or collection suggestions — reach {name} through the co-op.",
  "curator.aside.contactCta": "Contact {name}",
  "curator.aside.proposeHeading": "Propose a collection",
  "curator.aside.proposeBody":
    "Have a thesis? A set of films that argue something together? Write to the council.",
  "curator.aside.proposeCta": "Propose →",

  // ── Filmmaker profile (CinemaFilmmakerPage.tsx, FilmmakerHero/Main/Aside.tsx)
  // — chrome shell only; each filmmaker's bio, statement, filmography,
  // festivals and events are that person's own profile content and stay
  // English (fetched in live mode from GET /cinema/filmmakers/:slug) ────────
  "filmmaker.notFound.title": "Filmmaker not found",
  "filmmaker.notFound.description":
    "This filmmaker page doesn't exist or has moved. Browse the cinema to find work by queer filmmakers across the co-op.",
  "filmmaker.crumb.backCta": "← Back to the cinema",
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
    "100% goes to {name} — the co-op takes nothing off a tip. Tipping keeps them making things.",
  "filmmaker.aside.sendCta": "Send {amount}",
  "filmmaker.aside.tippedToast": "{amount} on its way to {name} — thank you",
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
  "shorts.toast.linkCopiedShare": "Link copied — share “{label}”",
  "shorts.outro.title": "Tip a <em>filmmaker</em>.",
  "shorts.outro.sub":
    "100% goes to them. No fees. No minimum. Watch first, then decide.",
  "shorts.outro.browseCta": "Browse all community films",
  "shorts.header.eyebrow": "Community films · all free to watch",
  "shorts.header.sub":
    "Shorts, mid-lengths, and documentary works made by QueerPulse members. <em>Free to watch, paid to make.</em> Tip the filmmaker — 100% goes to them.",
  "shorts.curatorNote.readPastNotesCta": "read past notes",
  "shorts.accessNote.body":
    "<strong>Every film is captioned.</strong> Content notes appear on each film, and audio-described works are marked <em>AD</em>. Filter by your access needs below.",
  "shorts.spotlight.mostWatchedBadge": "Most watched this week",
  "shorts.spotlight.communityPickKicker": "Community pick · week {week}",
  "shorts.spotlight.watchNowCta": "Watch now · free",
  "shorts.spotlight.becomeSustainerCta": "Become one →",
  "shorts.shelf.newThisWeek.title": "New <em>this week</em>",
  "shorts.shelf.newThisWeek.sub":
    "Films submitted and approved in the last 7 days",
  "shorts.shelf.newThisWeek.cta": "All new →",
  "shorts.shelf.becauseYouTipped.title":
    "Because you tipped <em>{filmTitle}</em>",
  "shorts.shelf.becauseYouTipped.sub":
    "More from {maker}, and films in the same key",
  "shorts.shelf.becauseYouTipped.cta": "{maker}'s page →",
  "shorts.shelf.firstFilm.title": "Someone's <em>first film</em>",
  "shorts.shelf.firstFilm.sub": "Debuts deserve a first audience — be theirs",
  "shorts.shelf.firstFilm.cta": "All debuts →",
  "shorts.shelf.mostTipped.title": "Most <em>tipped</em>",
  "shorts.shelf.mostTipped.sub":
    "Films where members have been generous this month",
  "shorts.shelf.mostTipped.cta": "All films →",
  "shorts.shelf.continueWatching.title": "Continue <em>watching</em>",
  "shorts.shelf.continueWatching.sub": "Pick up where you left off",
  "shorts.shelf.continueWatching.cta": "Your library →",
  "shorts.shelf.continueWatching.minutesLeft": "{minutes} min left · {maker}",
  "shorts.shelf.programmes.title": "Watch by <em>programme</em>",
  "shorts.shelf.programmes.sub":
    "Short sets curated by members — a way in when you don't know where to start",
  "shorts.shelf.programmes.cta": "All programmes →",
  "shorts.shelf.programmes.shareAriaLabel": "Share programme",
  "shorts.shelf.meetMakers.title": "Meet the <em>makers</em>",
  "shorts.shelf.meetMakers.sub":
    "Every film here has a person behind it — say hello",
  "shorts.shelf.meetMakers.cta": "All filmmakers →",
  "shorts.catalog.title": "Browse the <em>full catalogue</em>",
  "shorts.catalog.sub":
    "Every community film — filter, sort, and search your way in",
  "shorts.catalog.cta": "Open in Browse →",
  "shorts.catalog.searchPlaceholder": "Search films, makers, or themes…",
  "shorts.catalog.searchAriaLabel": "Search films",
  "shorts.catalog.languageLabel": "Language",
  "shorts.catalog.languageAriaLabel": "Filter by language",
  "shorts.catalog.sortLabel": "Sort",
  "shorts.catalog.sortAriaLabel": "Sort films",
  "shorts.catalog.surpriseCta": "Surprise me",
  "shorts.catalog.surpriseToast": "Try this one → {title}",
  "shorts.catalog.allFilmsChip": "All films",
  "shorts.catalog.empty.title": "Nothing matches — yet",
  "shorts.catalog.empty.body":
    "No films fit that combination. Loosen a filter, or tell us what you wish existed — we commission from member requests.",
  "shorts.catalog.empty.clearCta": "Clear filters",
  "shorts.catalog.empty.suggestCta": "Suggest a film",
  "shorts.catalog.count_one": "<em>{count}</em> film · all free to watch",
  "shorts.catalog.count_other": "<em>{count}</em> films · all free to watch",
  "shorts.card.saveAriaLabel": "Save to watchlist",
  "shorts.card.watches_one": "{count} watch",
  "shorts.card.watches_other": "{count} watches",
  "shorts.card.contentNoteLabel": "content note",
  "shorts.card.contentNoteHeading": "Content note",
  "shorts.card.noContentNotes": "no content notes",
  "shorts.watchParties.title": "Watch <em>together</em>",
  "shorts.watchParties.sub":
    "Live rooms where the whole set plays at once — makers in the chat",
  "shorts.watchParties.hostCta": "Host one →",
  "shorts.watchParties.nextBadge": "Next up",
  "shorts.watchParties.goingCount_one": "{count} going",
  "shorts.watchParties.goingCount_other": "{count} going",
  "shorts.watchParties.goingCta": "Going",
  "shorts.watchParties.rsvpFreeCta": "RSVP · free",
  "shorts.watchParties.rsvpToast": "You're going · {title}",
  "shorts.vote.title": "Programme the <em>next set</em>",
  "shorts.vote.yourPickLabel": "Your pick",
  "shorts.vote.voteCta": "Vote",
  "shorts.vote.countedToast": "Vote counted — thank you",
  "shorts.transparency.ledgerCta": "See the open ledger",
  "shorts.submitCta.seeGrantsCta": "See open grants",
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
    "QueerPulse Cinema is not a streaming platform. It's a room — programmed by queer people, <em>paid to queer people</em>, governed by the filmmakers and sustainers who make it possible.",
  "about.deed.label": "The <em>deed</em> · in plain language",
  "about.deed.p1":
    "QueerPulse Cinema exists because streaming platforms were not built for us. They take 70%. They show our films between things we'd never choose. They bury our communities in single-identity tags and algorithmic traps.",
  "about.deed.p2":
    "So we built something different. <strong>80% of every rent or buy</strong> goes to the filmmaker, paid the following Monday. 100% of every tip goes to them directly. The split is the same for every filmmaker, with no exceptions, ever.",
  "about.deed.p3":
    "The contract is non-exclusive. <em>You keep your film.</em> You can show it anywhere else. We hold no lock-in, no territory exclusivity, no right of first refusal. We're not owning it — we're showing it.",
  "about.deed.p4":
    "The curators' council — six people, rotating yearly — programmes the catalogue. They're paid a stipend voted on by patron-level sustainers. The ledger is public. The commissioning fund is public. The split calculation is public.",
  "about.deed.p5": "<em>That's the whole deal.</em>",
  "about.principles.title": "Six <em>principles</em>",
  "about.principles.p1.title": "The filmmaker <em>comes first</em>",
  "about.principles.p1.body":
    "80% of every transaction, paid weekly. 100% of tips. The split is the same for everyone. No exceptions. No renegotiation. <em>It's in the deed.</em>",
  "about.principles.p2.title": "Programming is <em>authorship</em>",
  "about.principles.p2.body":
    "Curators aren't moderators. They're authors — they write introductions, build arguments, programme sequences. Their names are on everything they choose.",
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
    "For a direct buy at {buyPrice}, the same 80/20 applies: <em>{buyFilmmakerShare} to the filmmaker.</em> For tips, 100% goes to them — we don't take anything off a tip.",
  "about.split.body3":
    "The sustainer library pool is distributed monthly based on per-minute-watched, with 80% going to filmmakers from the subscriber revenue after platform costs.",
  "about.split.viewAccountsCta": "View the full public accounts →",
  "about.split.exampleHeading": "Example: {price} rental",
  "about.split.divideLabel": "How {price} divides",
  "about.split.legend.filmmaker": "Filmmaker (80%)",
  "about.split.legend.paymentFees": "Payment fees (12%)",
  "about.split.legend.hosting": "Hosting (8%)",
  "about.split.tipsNote": "Tips are 100% to the filmmaker. No deduction.",
  "about.council.title": "The curators' <em>council</em>",
  "about.council.sub":
    "Six people who programme the cinema. They rotate every year — nominated by the community, confirmed by sustainers' vote. Each brings a different geography, focus, and way of looking.",
  "about.gov.ledgerTitle": "Public <em>ledger</em> · {month}",
  "about.gov.ledger.sustainers": "Sustainers",
  "about.gov.ledger.paidToFilmmakers": "Paid to filmmakers this month",
  "about.gov.ledger.filmsStreamed": "Films streamed this month",
  "about.gov.ledger.averageShare": "Average filmmaker share",
  "about.gov.ledger.commissioningPool": "Commissioning pool (season {season})",
  "about.gov.ledger.filmsInCatalogue": "Films in catalogue",
  "about.gov.fullAccountsCta": "Full accounts →",
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
  "about.gov.rightsCta": "Filmmaker rights →",
  "about.outro.title": "Sustain <em>the room</em>.",
  "about.outro.sub":
    "{price}/mo. Cancel any time. Every sustainer keeps the door open.",
  "about.outro.cta": "Become a sustainer",
};

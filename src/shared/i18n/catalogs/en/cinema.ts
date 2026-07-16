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
  "about.outro.sub": "{price}/mo. Cancel any time. Every sustainer keeps the door open.",
  "about.outro.cta": "Become a sustainer",
};

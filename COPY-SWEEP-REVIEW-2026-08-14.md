# Copy sweep review — em dashes & "X, not Y" antithesis

**Date:** 2026-08-14
**Scope:** `queerpulse` frontend (user-facing copy only; code comments excluded). `queerpulse-backend` not yet touched.
**Method:** two-wave parallel agent sweep — (1) 13 disjoint feature-directory slices, (2) per-namespace i18n catalog fan-out over `src/shared/i18n/catalogs/en` + `pt`. Each em dash judged in context; each rhetorical antithesis rewritten to a plain positive. Verification static (grep + re-read); no build/tests run.

---

## 1. Status

| Area                                                                                                                                                                                                                     | State                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `public/og-default.svg` (the original SVG)                                                                                                                                                                               | ✅ done                                           |
| `index.html` + `public/` (SEO, llms.txt, robots.txt)                                                                                                                                                                     | ✅ done                                           |
| All 13 feature-directory slices                                                                                                                                                                                          | ✅ done                                           |
| Catalogs: auth, cinema, common, communities, community, footer, forum, gatherings, help, magazine, members, messages, myevents, nav, notifications, safety, settings, shared, studio, subprofiles, system, topics, admin | ✅ done                                           |
| Catalog: marketing **PT**                                                                                                                                                                                                | ✅ done (~646 em-dash, ~57 antithesis)            |
| Catalogs: economy (EN+PT), culture, governance                                                                                                                                                                           | ✅ done (~354 em-dash, 5 antithesis pairs)        |
| Catalogs: marketing **EN**, resources (EN+PT)                                                                                                                                                                            | ⏳ still running                                  |
| Catalogs: culture, connect, feed, governance, homepage                                                                                                                                                                   | ⚠️ tiny residual counts — confirm at verification |

---

## 2. Numbers (live-measured on catalogs)

|                      | Before | Now   | Removed |
| -------------------- | ------ | ----- | ------- |
| EN catalog em dashes | 2,916  | 1,775 | 1,141   |
| PT catalog em dashes | 2,825  | 1,710 | 1,115   |

Of the 1,775 EN remaining, **1,222 are in the 3 still-running files** (marketing 582, economy 347, resources 293). The rest (~550) is expected _residue_ in finished files: code comments, en-dash number ranges (`6–8`), attribution dashes, and `"—"` placeholders — all deliberately left.

**Feature-dir + inline mock copy:** ~1,300 em-dash fixes (admin, members 177, communities/gatherings 296, economy/culture 203, forum/resources/cinema/studio 291, messages 29, magazine 113, marketing pages ~250, homepage 20, subprofiles 21, others).

**Antithesis rewrites captured so far: ~267** (grows as marketing/economy/resources finish).

---

## 3. Decisions needed from you

### D1 — Attribution dashes (inconsistent across agents; needs one ruling)

- **Magazine catalog & components KEPT** `— {cite}` bylines and reader-letter signatures (`"— Member, 28, Intendente"`), treating the em dash as a typographic attribution convention.
- **forum / cinema / community / admin agents REMOVED** leading attribution dashes (`"— Sara Marques · programming lead"` → `"Sara Marques · programming lead"`).
- **Your call:** keep attribution dashes everywhere, or strip them everywhere? I'll normalize whichever you pick.

### D2 — `"—"` empty-value placeholder glyph

Used as a UI "no value" marker (there's even `export const dash = "—"` in `contract.helpers.ts`). Left in ~40 spots; one spot (`useAllCommunities.ts:83`) was changed to `"-"`. **Convert all to `"-"` / en dash, or leave all as em dash?**

### D3 — Antithesis rewrites soften tone in places

The members/economy/topics batches leaned on `"rather than" / "over"` (e.g. `"organise like a garden rather than a machine"`), which is softer than a crisp positive. Review §5; mark any you want re-sharpened or reverted.

### D4 — One proper-name edit flagged for revert

`resources/qtipocOrganisations.data.ts` org name `"Djass — Afrodescendentes"` → `"Djass: Afrodescendentes"`. Changing a brand/proper name's styling is borderline — revert if the original is preferred.

---

## 4. Verification still owed (after marketing/economy/resources land)

- [ ] `roadmap.data.ts` and `directoryPlaces.ts` — flagged as concurrently edited by overlapping sub-agents; confirm both still parse cleanly.
- [ ] **Gatherings render-parser coupled edit** — `indexOf("—")` → `indexOf(":")` in `ManageGatheringPage.tsx`, `GatheringDashboardPage.tsx`, `GatheringRecapPage.tsx` (needed because `GATHERING_TITLE = "Pride Brunch — June Edition"` is split on the dash). Confirm parser + constant stay in sync.
- [ ] Gatherings catalog was edited via a `fix.py` script — spot-check for blanket-swap artifacts (agent self-verified to comment-only residue).
- [ ] Boundary-fragment em dashes left in `members`/`myevents` catalogs (leading/trailing dashes that concatenate inline with JSX links) — resolve with the render component.
- [ ] Full re-grep to prove no _new_ em dashes/antitheses were introduced.
- [ ] Typecheck (`npx tsc -b --noEmit`) — maintainer runs; sweep touched only string values (plus the one coupled parser edit above).

---

## 5. Antithesis rewrites — full before → after (for approval)

### og-default.svg

- `A world, not a feature list.` → **`A world to belong to.`**

### Homepage (landing copy — high visibility)

- `Often overlooked in queer spaces — not here.` → `Often overlooked in queer spaces. Here, you're at the centre.`
- `…and community — a dedicated space, not an afterthought in a broader network.` → `…a dedicated space of its own.`
- `Race and queerness aren't separate conversations — not here.` → `…where race and queerness are held as one conversation.`
- `Both identities belong here — fully, not partially.` → `Both identities belong here, in full.`
- `I found my collaborators here, not just an audience.` → `I found real collaborators here, people who make things with me.`
- `Neighbours helping neighbours, never charity.` → `Neighbours helping neighbours, as equals.`
- `…so we're not a sidebar but part of the main story of this city.` → `…making it part of the main story of this city.`
- `safety as a feature, not a gate` → `safety as a built-in feature`

### Marketing — org tiers / roadmap / arriving

- `…back the community materially, not with a logo.` → `…beyond a logo.`
- `A year-long build, not a launch` → `A sustained, year-long build`
- `Proposed, not purchased. We say no often.` → `Proposed and mutually agreed. We say no often.`
- `The best leads come through the network, not portals.` → `…through the network.`
- `…community-sourced translations…, not just the marketing pages.` → `…every screen beyond the marketing pages.`
- `General dating features are out of scope — …community and connection, not matchmaking.` → `…QueerPulse focuses on community and connection.`

### Marketing — partner details

- `…was unusual: not money, not co-branding — a commitment to specific operational changes…` → `…Instead of money or co-branding, they wanted a commitment to specific operational changes…`
- `The partnership shown here is operational, not ceremonial.` → `…is genuinely operational.`
- `Referrals, not records` (heading) → `Referrals without records`
- `the programme asks for a school year, not a season.` → `…asks for a whole school year.`
- `We send people and money, not oversight.` → `We send people and money, and leave the oversight to them.`
- `…never a clinical recommendation — it's a signal that someone vouched, not a promise.` → `…It's a signal that someone vouched, and no more than that.`
- `funds land within days, not months.` → `funds land within days.`
- `We share a welcome, not a database — guest access is opt-in and time-limited.` → `We share a welcome, and member data stays separate. Guest access is opt-in and time-limited.`
- `Guest, not merge` (heading) → `Guest access, separate networks`
- `This is a solidarity partnership, not a pipeline.` → `This is a solidarity partnership.`

### Marketing — volunteer opportunities

- `This is held work, not heroics.` → `This is held, supported work.`
- `your own wellbeing is part of the plan, not an afterthought.` → `your own wellbeing is built into the plan from the start.`
- `struggle is welcome, not required.` → `struggle is welcome and optional.`
- `…asks for a school year, not a season.` → `…asks for a full school year.`
- `You co-facilitate, never solo, alongside someone…` → `You always co-facilitate alongside someone…`
- `Your job is care and accuracy, not legal advice.` → `Your job is care and accuracy; the legal advice is theirs to give.`
- `Facts, not conclusions.` → `Just the facts.`
- `Paired, not solo` (label) → `Always paired`
- `a boundary — you're documenting, not rescuing.` → `a boundary. You're there to document.`

### Marketing — local directory (directoryPlaces)

- `…keeps the section you came for at the front, not the back.` → `…right at the front.`
- `…titles aren't a shamefaced shelf in the corner — they're the front table…` → `…titles hold the front table, curated by people who've read them.`
- `…verified for how it treats the people who walk in, not just what's on the shelves.` → `…beyond what's on the shelves.`
- `Not a shamefaced shelf in the corner — the front table…` → `The front table, curated by booksellers who've actually read the books.`
- `Openings feel like a community, not a market.` → `Openings here feel like a community coming together.`
- `Pricing is by service, never by gender or hair length…` → `Pricing is by service, the same whatever your gender or hair length…`
- `Not a destination so much as a reliable, kind local — which is sometimes exactly the thing.` → `Just a reliable, kind local, which is sometimes exactly the thing.`
- `Gender-neutral pricing on every service — never more based on hair length or gender.` → `Gender-neutral pricing on every service, the same whatever your hair length or gender.`
- `Movement for how it feels, not how it looks.` → `Movement for how it feels in your body.`

### Admin (seed/mock)

- `a sign of deeply-held trust — not a metric to game.` → `a sign of deeply-held trust that no one should try to game.`
- `a sign of trust — not a metric to optimise.` → `a sign of trust that no one should try to optimise.`
- `Safety as infrastructure, not a policy page.` → `Safety built into the infrastructure.`
- `…actually seen them — vetted before listing, not just self-submitted.` → `…actually seen them, then vetted before listing.`
- `…our members have actually sat with — not a Google list.` → `…our members have actually sat with.`
- `A resource, not a script — options and considerations…` → `An open-ended resource: options and considerations…`

### Subprofiles (feature inline)

- `…the life you are actually living — not a forecast, not a verdict.` → `…the life you are actually living, a way of reflecting on the present.`
- `Astrology sits beside therapy and medicine, never in front of them.` → `…as a companion to them.`
- `Decisions are made by the people in the room, not by the loudest account online.` → `…by the people who show up in the room.`

### Members / connect / topics (feature inline — all rewritten with "rather than"; see D3)

- `food as hospitality, not spectacle.` → `food as hospitality rather than spectacle.`
- `Not as therapy gospel — as a starting point…` → `A starting point for asking better questions rather than therapy gospel.`
- `Not a film — a slideshow.` → `A slideshow rather than a film.`
- `build ethically — not as a marketing position but as a daily practice.` → `build ethically as a daily practice rather than a marketing position.`
- `building a product as drama, not engineering.` → `…as drama rather than engineering.`
- `how I see cities — as something breathing, not something built.` → `how I see cities as something breathing rather than something built.`
- `organise like a garden, not a machine.` → `organise like a garden rather than a machine.`
- `the body is never just an obstacle — it's a whole inner world.` → `the body is a whole inner world, far more than an obstacle.`
- `care as something we build together, not buy.` → `…we build together rather than buy.`
- `cried at the union scenes, not the romance.` → `…union scenes rather than the romance.`
- `funny, horny and dangerous — not brave.` → `…dangerous rather than brave.`
- `access as love, not logistics,` → `access as love rather than logistics,`
- `like a case study, not a patient.` → `like a case study rather than a patient.`

### Magazine (feature — metadata only; literary body/quotes left intact)

- `…queer Lisbon history — the kind held in boxes under beds, not institutions.` → `…rather than institutions.`
- `burnout is a policy failure, not a character flaw` → `…rather than a character flaw`
- `an intentional gathering, not a crowd` (alt text) → `…rather than a crowd`

### Economy + housing/culture (feature inline)

- `We don't have a separate "digital team" and "print team"…` → `We're one studio of people who care equally about print and digital.`
- `show their reasoning, not just their output.` → `show their reasoning as well as their output.`
- `We answer to the community we serve, not to funders or a board…` → `…above funders or a board…`
- `Applications are read by the programmes team, not a recruiter.` → `…by the programmes team directly.`
- `steady in a hard moment, not for a clinical CV.` → `…above a clinical CV.`
- `Steady, not heroic` → `Steady and sustainable`
- `Community, not footfall` → `Community over footfall`
- `we hire people, not résumés.` → `we hire people over résumés.`
- `Remote, not scattered` → `Remote and connected`
- `hire for judgement, not pedigree.` → `hire for judgement over pedigree.`
- `First review is by the team you'd join, never a recruiter.` → `First review is by the team you'd join.`
- `…a small studio, not a junior-on-production setup.` → `…a small studio where you take on real design work from the start.`
- `care about craft — not just decoration, but structure, hierarchy, and intention` → `care about the craft beneath the surface: structure, hierarchy, and intention`
- `A real mentorship — not task assignment.` → `A real mentorship focused on your growth.`
- `No fintech background required — payments knowledge is a bonus, not a gate` → `No fintech background required. Payments knowledge is a welcome bonus`
- `First review is by an engineer, not a recruiter.` → `First review is by an engineer who'd work with you.`
- `the ability to hold a room, not for a clinical CV.` → `…above a clinical CV.`
- `Retail experience is a bonus, not a requirement` → `Retail experience is a welcome bonus`
- `I'll look at your actual work, not a tidied-up portfolio.` → `…the real in-progress thing.`
- `…want to make them better, not to people still waiting to start.` → `…the ones who are past waiting to start.`
- `is welcome, never expected.` → `is genuinely optional.`
- `coffee on you welcome, never expected` → `coffee on you, no obligation`
- `You get a real answer, not a vibe.` → `You get a real, concrete answer.`
- `want a map, not just encouragement.` → `want a real map to follow.`
- `Understanding, not dependence` → `Understanding that lasts`
- `read the situation yourself, not needing me to read it for you.` → `…handling it without me.`
- `coefficient of your gross income — not the whole thing.` → `…a slice of the whole.`
- `Clean, not corporate.` → `Clean and understated.`
- `actual photographs of the food, not phone photos.` → `proper photographs of the food, taken with a real camera.`
- `It's a real home, not a let — full of books…` → `It's a real home to live in, full of books…`
- `Someone who wants a real home, not a holiday let` → `Someone who wants a real home to settle into`
- `He treats the community as a feature, not a risk.` → `He treats the community as an asset.`
- `Decisions made by a rotating community panel, not a board.` → `…a rotating community panel of members.`
- `Frame your work in terms of cultural value, not identity.` → `…in terms of its cultural value.`
- `a real say in the editorial direction, not just a commission.` → `…with genuine ownership.`

### Communities / gatherings / community (feature inline)

- `People who want honest crits, not polite ones` → `…honest crits over polite ones`
- `the ledger is trust, not money` → `the ledger runs on trust`
- `who wants peers, not professionals` → `who wants peers rather than professionals`
- `while being active, not just at bars` → `while being active, beyond the bars`
- `…an afterthought in queer spaces, and isn't here.` → `…and here it comes first.`
- `a dedicated space…, not an afterthought tucked into a broader network.` → `…that stands on its own rather than being tucked into a broader network.`
- `Anyone who wants a dedicated space, not a sub-folder` → `…a dedicated space of their own`
- `Elders who want peers, not to be a panel about 'the old days'` → `Elders who want peers rather than a panel slot about 'the old days'`
- `It's run with the under-25s, not at them.` → `…on their terms.`
- `Race and queerness aren't separate conversations…not here.` → `Race and queerness belong in the same conversation here, held in the same room.`
- `Both identities belong here fully, not partially…the starting point, not the afterthought.` → `Both identities belong here in full. 'Access' is the starting point, built in from the beginning.`
- `People who need access designed in, not bolted on` → `…designed in from the start`
- `We look at the work in front of us, not the CV behind it.` → `…whatever the CV behind it.`
- `We critique the work, never the person.` → `We aim our critique at the work and leave the person out of it.`
- `We look after the grown-ups too, not just the children.` → `…alongside the children.`
- `Older members contribute when asked, not by default.` → `…only when asked.`
- `We look out for each other's mental health, not just their CVs.` → `…well beyond the CVs.`
- `Leaving it here for discussion, not as a verdict.` → `Leaving it here to open up a discussion.`
- `Making queer art central, not marginal.` → `Making queer art central to Lisbon's cultural life.`
- `…the doctor's job to remove, not the patient's to endure.` → `…so the patient no longer has to endure it.`
- `…abolished for everyone, not just the people lucky enough to find a good doctor.` → `…whether or not they were lucky enough to find a good doctor.`
- `Consistency…is not a virtue — it's the entire intervention. …a school year, not a season.` → `Consistency…is the entire intervention. …to commit for a full school year.`
- `Not paranoia — hygiene.` → `It's hygiene, plain and simple.`
- `…a studio visit where I can't talk is a tour, not a visit.` → `…is just a tour.`

### Auth / settings / safety / governance (feature inline — safe-spaces directory)

- `Genuinely inclusive — not a scene where one type of person dominates.` → `Genuinely inclusive, with no single type of person dominating the scene.`
- `Welcoming to lesbians, bi, and non-binary people — not just gay men.` → `…as much as gay men.`
- `Security will act…and bar a repeat offender, not shrug it off.` → `…and bar a repeat offender.`
- `…queer nights are part of the programming, not a token.` → `…are a core part of the programming.`
- `You are asked what is relevant, never interrogated.` → `You are asked only what is relevant.`
- `…they connect you to vetted, affirming services — not a leaflet.` → `…they personally connect you to vetted, affirming services.`
- `Price is by service, never by gender or hair length.` → `Price is by service, the same whatever your gender or hair length.`
- `You are a client, not a lesson.` → `You are simply a client here.`
- `By service, not gender` (label) → `By service, gender-neutral`
- `Queer events are core, not after-hours.` → `Queer events are core to the calendar.`
- `…staff shut it down, not the artist.` → `…staff shut down the hostility and stood by the artist.`
- `This is a soft removal, not a verdict on individuals — it can be reversed.` → `This is a soft removal that can be reversed, and it passes no verdict on individuals.`

### Forum / resources / cinema / studio (feature inline)

- `made from inside the houses, not from the balcony.` → `…by the people who live there.`
- `treat their subjects as collaborators, not subjects.` → `treat their subjects as collaborators.`
- `a given condition of the frame, not a risk or a statement.` → `simply a given condition of the frame.`
- `as <em>teachers</em>, not subjects.` → `as <em>teachers</em>.`
- `fund the <em>practice</em>, not a product.` → `fund the <em>practice</em> itself.`

---

## 6. Antithesis rewrites — i18n catalogs (EN + PT kept parallel)

> PT counterpart was rewritten equivalently for every line below. Only EN shown for brevity; PT wording noted where distinctive.

### safety / community / communities / auth catalogs

- `earned, not purchased` → `earned by meeting the standard`
- `recorded openly, never quietly` → `recorded openly, in public view`
- `welcome, not just tolerated` → `welcome and at home`
- `answer to the members, not to abstract policies` → `answer to the members themselves`
- `take reports seriously…, not to demand the reporter prove themselves` → positive restatement
- `one path — but not the only one` → `one path among several`
- `Screenshot the profile too, not just the message` → `…as well as the message`
- `Not a politics piece — a practice one` → `A practical piece…`
- `a long conversation, not a single one` → `…one that continues`
- `honest takes, not marketing copy` → `honest takes from the community`
- `a feature, not a bug` → `part of the appeal`
- `a preference, not a hierarchy` → `simply a preference`
- `not a matching algorithm — it's a notice board` → `It's a notice board`
- `Real conversations, not lectures` → `…among a small group`
- `Community information, not legal advice` → `Community information to start from`
- `a welcome, not a test` → `a warm welcome`
- `This is on us, not you` → `We'll sort it on our end`
- `by invitation, never advertising` → `by invitation, one member vouching for the next`
- `through trust, not advertising` → `through trust, member by member`
- `not just new to Lisbon` → `whether or not you're also new to Lisbon`
- `earned, not self-declared` → `earned by meeting the standard`

### settings catalog

- `…relevant communities and content — not to categorise you.` → `…They are never used to categorise you.`
- `A product preference — this stays on your account, not tracking.` → `This is a product preference that stays on your account, kept separate from tracking.`
- `Not a value judgement — simply a neutral descriptor.` → `It is a neutral descriptor, carrying no judgement.`
- `…permanently removed — not anonymised, deleted.` → `…The content is deleted outright.`

### studio / subprofiles / topics / footer catalogs

- `A <em>floor</em>, not a marketing number.` → `A <em>floor</em> we're actually held to.`
- `…before it's a crisis, not after.` → `…before it's a crisis.`
- `…as a product requirement, not a compliance afterthought.` → `…as a core product requirement, built in from the start.`
- `…visible, not only audible.` → `…visible as well as audible.`
- `…built to clear contrast — not just to look moody.` → `…built to clear contrast as well as mood.`
- `…a polite ARIA live region, never a barrage.` → `…paced to stay gentle.`
- `…treat it as a bug, not a feature request…` → `…treat it as a bug to fix…`
- `The split is in the deed, not a settings page. The floor can rise, never fall…` → `The split lives in the co-op's deed, binding by law. The floor rises freely and can only fall by a two-thirds vote.`
- `Members…are the owners, not the customers.` → `Members, listeners and artists alike, own it.`
- `One track only — the council wants your sharpest, not your folder.` → `One track only: the council wants your single sharpest track.`
- `…following is anonymous — we show the count, never who's behind it.` → `…We show the count and keep every name private.`
- `Built by and for the community — not designed at it.` (footer, site-wide) → `Built by and for the community, from within.`

### members / help / shared / system catalogs

- `A few things, not a portfolio dump` → `A few things, handpicked`
- `This is to keep your drafts list honest — not to lose work.` → `This keeps your drafts list honest while protecting your work.`
- `It's peer teaching, not a marketplace…` → `It's peer teaching, kept free and shared within the community.`
- `…a vouched-in network, not another feed.` → `…a vouched-in network of people you actually know.`
- `…to find the people, not just the rooms.` → `…to find the people behind the rooms.`
- `It's on us, not you.` → `It's on us.`
- `A platform that works for you, not for advertisers.` → `A platform that works for you, funded by the community.`
- `This is our fault, not yours.` → `This is our fault.`

### gatherings catalog

- 10 EN + 10 PT prescribed rewrites applied (waitlist/RSVP/recap copy). Detail in the working-tree diff of `en/gatherings.ts` / `pt/gatherings.ts`.

### admin / magazine / forum catalogs

- `come from members, not admins` → `Spaces here are built by members.`
- `a call for support, not a mark against the mods` → `a call for support for the moderators`
- `a thermometer, not a grade` → `a thermometer, a reading of how the space feels`
- `the shape of the maths, not the precise formula` → `the shape of the maths, a rough picture of how it works`
- `comes from members, not advertisers… not just our promises` → `comes from members alone… so it holds us to it`
- `ordered by who's most at risk — not by what arrived first` → `ordered by who's most at risk, so the greatest danger comes first regardless of when it arrived`
- `as a goal, not a fixed price` → `as a goal to aim for, instead of a fixed price`
- `a promise, not an exploration` → `a firm promise`
- `that is arithmetic, not blame` → `which is just arithmetic`
- `a real risk, not a process step` → `a genuine risk, so treat it as one`
- `not a moral failing, it is arithmetic` → `That is simply how the arithmetic works`
- `not just publish status` → `track both review status and publish status here`
- `with a reason attached — never silence` → `with a reason attached`
- `counts, never follower numbers or vanity graphs` → `counts and leave out follower numbers and vanity graphs`
- `labelled as official — never disguised as a peer` → `labelled as official and never disguised as a peer`
- `a sign of trust — not a metric to optimise` → `a sign of trust. Honour it, and let the numbers be.`
- `the writer hears from you, not a form` → `the writer hears from a real person`
- `a human nudge — not a deadline threat` → `a human nudge to keep things moving gently`
- `Consent is per person, not per piece` → `Consent is collected per person, row by row`
- `We license it, we don't own it` → `We only license it`
- `copied from the image, never left empty` → `copied from the image, so it's always filled in`
- `as blocks, not as a wall of formatting` → `as clean blocks, ready to edit`
- `live here now, not in email` → `live here now, instead of email`

### cinema catalog

- 10 EN + 10 PT prescribed rewrites applied (curation/about/submit copy). Detail in the working-tree diff of `en/cinema.ts` / `pt/cinema.ts`.

### marketing catalog — PT (done; ~57 rewrites, EN pending)

- `feito para acolher esta comunidade, não para a explorar.` → `feito para acolher e cuidar desta comunidade.`
- `Isso é o desenho, não um defeito.` → `É de propósito.`
- `...fazem parte do produto, não são acrescentados depois.` → `...fazem parte do produto desde o início.`
- `...respondemos em linguagem simples, não em juridiquês.` → `...Respondemos em linguagem simples e clara.`
- `Não celebramos números grandes — só os certos.` → `O que nos importa são os números certos.`
- `...mostra agora a tua cara, não um marcador de posição` → `...mostra agora a tua cara real`
- `...ainda não está pronto — nunca um substituto a fingir ser uma pessoa.` → `...ainda não está pronto. Cada pessoa que vês é real.`
- `Transparência aqui não é um extra — é o acordo.` → `Aqui, a transparência é o próprio acordo.`
- `Lemos todas as candidaturas, não só as mais arrumadas` → `Lemos todas as candidaturas, mesmo as menos arrumadas`
- _(Full ~57 in the working-tree diff of `pt/marketing.ts`. Kept: brand slogans where contrast is the message, e.g. `Trabalha connosco, não sobre nós.`, `O acesso é uma prática, não uma política.`, and load-bearing factual/privacy negatives.)_

### economy / culture / governance catalogs (done; EN+PT parallel)

- `...is a non-event here, not a risk.` → `...is a non-event here.`
- `...community embedded, not as beneficiaries but as participants and decision-makers.` → `...community embedded as participants and decision-makers.`
- `Post what you're looking for, not just what you can give.` → `Post what you're looking for, as much as what you can give.`
- `This is a relationship, not a transaction.` → `This is a relationship.`
- `Culture isn't what happens at events. It's what we build between them — quietly, consistently, together.` → `Culture is what we build between events, quietly, consistently, together.`
- _(Kept per house rules: housing affirming-baseline `not an extra` lines, `No algorithm. No ads.`, and load-bearing factual/policy negatives such as `verified during vetting, not self-reported`.)_

### marketing (EN) / resources catalogs

- ⏳ **pending** — will be appended if/when those agents finish.

---

## 7. Em dashes — approach & deliberately-left categories

Each em dash was replaced by context, not blanket-swapped:

- Parenthetical aside → comma, or matched commas, or parentheses
- Lead-in to explanation / list → colon
- Two independent clauses → period + capitalize
- Misused time range (`21:00 — 03:00`) → `to`

**Left untouched everywhere:**

- Code comments / JSDoc / JSX comments
- En-dash number ranges (`6–8`, `€3,000–7,000`, `Tue–Sat`) — these are en dashes, correct usage
- `"—"` empty-value placeholder glyphs (see D2)
- Attribution dashes in some areas (see D1)
- Song-lyric line-break dashes, cue-sheet `Artist — Title` format, decorative chat wrappers
- Regex character classes containing `—`
- Boundary fragments that concatenate inline with adjacent JSX/links (members/myevents catalogs)
- Poetry enjambment (subprofiles poem line)
- Fictional/literary antitheses in magazine article bodies, pull quotes, interview quotes (intentional craft)
- Standalone factual negatives / legal disclaimers (`"No ads. No algorithm."`, `"General information, not legal advice"`, kanban `"Committed, not started"`) — plain negatives, not the rhetorical device

---

## 8. Not done / follow-ups

- **marketing / economy / resources catalogs** — finishing (largest files).
- **`queerpulse-backend`** — untouched. Seed content, notification/email templates, and some client-facing error strings can be user-facing; optional same-method follow-up.
- **Changelog** — not added yet; can record this as a copy-consistency pass on request.

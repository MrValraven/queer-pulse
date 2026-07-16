import type { Catalog } from "../../types";

/**
 * Resources — chrome for the safety/health/legal/community resource hub
 * (~34 pages). Mock therapist/lawyer/organiser bios and any record standing
 * in for API data stay in English per the scope rule; platform-authored
 * guidance prose is translated. Real-world proper nouns (org names, statute
 * names, helpline names) are never translated.
 */
export const resources: Catalog = {
  // ── Shared: ResourceModal ──────────────────────────────────────────────
  "modal.closeAriaLabel": "Close",
  "modal.doneCta": "Done",

  // ── Shared: CrisisStrip ─────────────────────────────────────────────────
  "crisis.ariaLabel": "Crisis and emergency help",
  "crisis.title": "In crisis <em>right now?</em>",
  "crisis.body":
    "If you are in immediate danger, call <strong>112</strong>. These lines are free and confidential — tap to call, or copy the number.",
  "crisis.emergencyCta": "QueerPulse emergency support",
  "crisis.jumpCta": "All crisis resources ↓",
  // crisisStrip.data.ts — real-world helpline names kept in English/as-is;
  // only the descriptive portions and hours are translated. Flag for native
  // review: crisis-line accuracy matters.
  "crisis.line.emergency.name": "Emergency (police · ambulance)",
  "crisis.line.emergency.hours": "Always · free",
  "crisis.line.sosVozAmiga.name": "SOS Voz Amiga",
  "crisis.line.sosVozAmiga.hours": "Daily 16h–24h",
  "crisis.line.ilga.name": "ILGA Portugal — LGBTQ+ line",
  "crisis.line.ilga.hours": "Weekdays 10h–18h",

  // ── Shared: SuggestEditModal ────────────────────────────────────────────
  "suggestEdit.modalTitle": "Suggest an edit",
  "suggestEdit.success.title": "Suggestion <em>received.</em>",
  "suggestEdit.success.sub":
    "The editors look at suggestions weekly and discuss bigger changes at the monthly assembly. This is a living document precisely because of edits like yours.",
  "suggestEdit.body.intro":
    "Community-edited. If a definition feels incomplete or wrong, tell us which term and what you'd change.",
  "suggestEdit.form.termLabel": "Which term",
  "suggestEdit.form.selectPlaceholder": "Select a term…",
  "suggestEdit.form.newTermOption": "A term that's missing",
  "suggestEdit.form.changeLabel": "Suggested change",
  "suggestEdit.form.changePlaceholder":
    "What's off, and how you'd put it instead. Sources welcome but not required.",
  "suggestEdit.cancelCta": "Cancel",
  "suggestEdit.sendingLabel": "Sending…",
  "suggestEdit.sendCta": "Send suggestion",

  // ── LegalPage ───────────────────────────────────────────────────────────
  // Legal/safety information — flag for native review.
  "legal.hero.eyebrow": "Legal Aid",
  "legal.hero.title": "Know your rights. <em>Have your receipts.</em>",
  "legal.hero.lead":
    "Legal guides, queer-friendly lawyers, and discrimination resources for LGBTQ+ people in Portugal — because knowing your rights is the first step to defending them.",
  "legal.hero.anchor.workplace": "Workplace rights",
  "legal.hero.anchor.housing": "Housing rights",
  "legal.hero.anchor.healthcare": "Healthcare rights",
  "legal.hero.anchor.lawyers": "Lawyer directory",
  "legal.hero.backLink": "Safety Guide",

  "legal.badge.protected": "Protected right",
  "legal.badge.know": "Know this",
  "legal.badge.practical": "Practical",

  "legal.workplace.title": "Workplace <em>rights</em>",
  "legal.workplace.lead":
    "Portugal's Labour Code prohibits discrimination on grounds of sexual orientation and gender identity. Here's what that means in practice.",
  "legal.workplace.dismissal.title": "Protection from dismissal",
  "legal.workplace.dismissal.body":
    "You cannot be legally dismissed because of your sexual orientation or gender identity. Constructive dismissal — making conditions intolerable — is also prohibited. Keep records of everything.",
  "legal.workplace.harassment.title": "Harassment at work",
  "legal.workplace.harassment.body":
    "Harassment on grounds of sexual orientation or gender identity is unlawful. Your employer has a legal duty to investigate complaints. Failure to act makes them liable. Document every incident with dates.",
  "legal.workplace.pronouns.title": "Pronouns & name at work",
  "legal.workplace.pronouns.body":
    "Persistent misgendering after being corrected can constitute harassment. Trans employees have the right to use their preferred name before any legal name change.",
  "legal.workplace.complaint.title": "Making a complaint",
  "legal.workplace.complaint.body":
    "The ACT (Autoridade para as Condições do Trabalho) handles workplace discrimination complaints. You can report anonymously. We have a step-by-step guide and template complaint letter.",

  "legal.link.readGuide": "Read the full guide →",
  "legal.link.getTemplate": "Get the template →",
  "legal.link.findSupport": "Find support →",
  "legal.link.transHubGuide": "Trans Hub guide →",
  "legal.link.reportRefusal": "Report a refusal →",
  "legal.link.prepGuide": "PrEP access guide →",

  "legal.housing.title": "Housing <em>rights</em>",
  "legal.housing.lead":
    "Discrimination in housing rental is illegal in Portugal. In practice it still happens — here's how to respond when it does.",
  "legal.housing.rental.title": "Rental discrimination",
  "legal.housing.rental.body":
    "A landlord refusing to rent to you due to sexual orientation or gender identity is acting illegally. Document any evidence — screenshots, recordings with consent, written refusals.",
  "legal.housing.samesex.title": "Same-sex couples & rentals",
  "legal.housing.samesex.body":
    "Same-sex couples have equal rights in tenancy agreements. Both partners can be named on a lease. There are protections against removal if one partner leaves or dies.",
  "legal.housing.eviction.title": "Eviction protections",
  "legal.housing.eviction.body":
    "Eviction on discriminatory grounds has additional protections. If you're facing displacement in a gentrifying area, community organisers can help — contact Catarina Vaz via QueerPulse.",

  "legal.healthcare.title": "Healthcare <em>rights</em>",
  "legal.healthcare.lead":
    "LGBTQ+ people in Portugal have full rights to access public healthcare. Trans-specific access has improved significantly since 2018.",
  "legal.healthcare.sns.title": "Trans healthcare via SNS",
  "legal.healthcare.sns.body":
    "Since 2018, trans healthcare including hormone therapy and surgical procedures is available through the SNS. Waiting lists exist — we have a guide to navigating them.",
  "legal.healthcare.refusal.title": "Refusal of treatment",
  "legal.healthcare.refusal.body":
    "Healthcare providers cannot legally refuse treatment on grounds of sexual orientation or gender identity. If this happens, document it and contact ILGA Portugal immediately.",
  "legal.healthcare.prep.title": "PrEP access",
  "legal.healthcare.prep.body":
    "PrEP is available via the SNS at no cost if you meet eligibility criteria. Our guide walks through the process, including which clinics are most welcoming in Lisbon.",

  "legal.lawyers.title": "Queer-friendly <em>lawyers</em>",
  "legal.lawyers.lead":
    "Vetted by community members, with specific experience in LGBTQ+ cases in Portugal. Initial consultations are free for QueerPulse members.",
  "legal.lawyers.requestConsultationCta": "Request consultation →",
  "legal.lawyers.emergency.title": "Facing something <em>urgent?</em>",
  "legal.lawyers.emergency.body":
    "If you're dealing with an immediate legal situation — arrest, eviction notice, or workplace suspension — use the QueerPulse emergency network. Someone who can help is usually reachable within hours.",
  "legal.lawyers.emergencyCta": "Emergency network →",

  "legal.outro.title": "You have <em>rights.</em>",
  "legal.outro.sub":
    "Knowledge is the first line of defence. Share these resources with anyone who needs them.",
  "legal.outro.requestInviteCta": "Request an invite",

  // ── CommunityPrivacyPage ────────────────────────────────────────────────
  "communityPrivacy.hero.eyebrow": "Coming Out · Privacy",
  "communityPrivacy.hero.title": "You control <em>what's visible.</em>",
  "communityPrivacy.hero.lead":
    "This space runs on reduced visibility by default. Here's exactly what shows where — on your public profile, inside the community, and to the mod team — so you can be here on your own terms.",
  "communityPrivacy.hero.anchor.tiers": "What shows where",
  "communityPrivacy.hero.anchor.controls": "Your controls",

  "communityPrivacy.tiers.title": "What shows <em>where</em>",
  "communityPrivacy.tiers.lead":
    "Three layers, from fully public to mod-only. Most of this space lives in the bottom two.",
  "communityPrivacy.tier.public.title": "On your public profile",
  "communityPrivacy.tier.public.body":
    "Almost nothing from a low-visibility space appears here. Your membership of the coming-out space is never shown publicly, and nothing you post inside it is attached to your profile.",
  "communityPrivacy.tier.community.title": "Inside the community",
  "communityPrivacy.tier.community.body":
    "The member list is not shown to other members unless you choose to connect. You can read, react, and post without anyone being able to browse who else is here.",
  "communityPrivacy.tier.modTeam.title": "Only the mod team",
  "communityPrivacy.tier.modTeam.body":
    "Mods see what they need to keep the space safe — reports, join requests — and nothing more. They never see your wider QueerPulse activity, and confidentiality is the first rule they hold to.",

  "communityPrivacy.controls.title": "Your <em>controls</em>",
  "communityPrivacy.howTo.default":
    "Reduced visibility is the default in this space — you do not have to switch anything on to be protected.",
  "communityPrivacy.howTo.settings":
    "You control what is visible from your settings at any time: profile visibility, who can find you, and whether your communities are listed.",
  "communityPrivacy.howTo.leaving":
    "Leaving a space removes you cleanly. Nothing lingers on your profile, and no notification announces it.",

  "communityPrivacy.outro.title": "Nothing here is <em>on your profile.</em>",
  "communityPrivacy.outro.sub":
    "Adjust your visibility any time — it's all in your settings.",
  "communityPrivacy.outro.cta": "Open privacy settings",

  // ── SafetyPage ──────────────────────────────────────────────────────────
  "safety.hero.cat": "Safety & privacy",
  "safety.hero.title": "Your visibility. <em>Your choice.</em>",
  "safety.hero.intro":
    "QueerPulse is a space where being out — or not, or somewhere in between — is nobody's business but yours. Here's how we protect that.",

  "safety.visibility.title": "How <em>visibility</em> works",
  "safety.visibility.body":
    "Every member chooses their own visibility level. It's not a setting buried in a profile — it's a first-class part of how you exist in the network. Think of it as a dimmer, not a switch.",
  "safety.visibility.open.title": "Open to connect",
  "safety.visibility.open.body":
    "Your profile is visible to all members. Anyone in the network can reach out directly. You can change this at any time — there's no penalty for stepping back.",
  "safety.visibility.network.title": "Network only",
  "safety.visibility.network.body":
    "Your profile is visible to members, but direct contact requires a shared connection. You're reachable, but with a layer of warmth built in.",
  "safety.visibility.private.title": "Private",
  "safety.visibility.private.body":
    "Your profile is visible only to the team and your voucher. You appear in the network count but not in browsing. The right setting if you're newly out, in a sensitive situation, or just not ready. No explanation required.",

  "safety.vouching.title": "The <em>vouching</em> model",
  "safety.vouching.body1":
    "Every member is vouched for by at least one person already in the network. This isn't gatekeeping — it's the mechanism that makes the room feel trustworthy. When someone vouches for you, they're saying: <b>I know this person, and I think they belong here.</b>",
  "safety.vouching.body2":
    "Vouchers aren't responsible for the people they vouch for, but they are accountable in a real way. If a vouched member behaves harmfully, their voucher is part of the conversation about what happens next.",
  "safety.vouching.calloutHead": "On being newly out",
  "safety.vouching.calloutBody":
    "If you're not yet out in your professional life, you can be Private within QueerPulse while still benefiting from the community. We will never share your membership externally without explicit consent.",

  "safety.dataUse.title": "What we <em>don't do</em> with your data",
  "safety.dataUse.body1":
    "We don't sell it. We don't train models on it. We don't share it with third parties. We don't run advertising. We're a small, member-supported network — your data is not the product.",
  "safety.dataUse.body2":
    "What we store: your name, email, profile content, and visibility setting. What we don't store: your location beyond the neighbourhood you choose to share, your browsing behaviour, or anything you tell us in private messages.",
  "safety.dataUse.body3":
    "You can request everything we hold about you, or ask us to delete your account, at any time. Send an email to <b>hello@queerpulse.pt</b>.",

  "safety.report.title": "If something <em>feels wrong</em>",
  "safety.report.body1":
    "We take safety concerns seriously, and we respond to them ourselves — not an automated system. If someone has made you feel unsafe, if a message crossed a line, if something doesn't sit right, tell us.",
  "safety.report.body2":
    "We handle every report with discretion. You will not be identified to the person you're reporting unless you choose to be. We will follow up.",
  "safety.report.boxTitle": "Get in touch with the team",
  "safety.report.boxBody":
    "If you need to report a concern, reach out directly. We read everything sent to this address and aim to respond within 24 hours.",
  "safety.report.emailCta": "safe@queerpulse.pt",

  "safety.leaving.title": "Leaving the <em>network</em>",
  "safety.leaving.body1":
    "You can leave at any time. When you do, your profile is removed from the directory immediately. Any messages you've sent remain with their recipients — we can't unsend them. Board posts are removed. Your data is deleted within 30 days unless you ask us to keep it for a specific reason.",
  "safety.leaving.body2":
    'There is no dark pattern here. No "are you sure?" loop. No 30-day cooling-off period before deletion. You leave, you\'re gone, and we wish you well.',

  "safety.outro.title": "Safety is a feature, <em>not a footnote.</em>",
  "safety.outro.sub": "Any questions about how the network works? Write to us.",
  "safety.outro.cta": "hello@queerpulse.pt",

  "safety.subpageIndex.eyebrow": "Safety",
  "safety.subpageIndex.title": "Reporting & rights",
  "safety.subpage.report.label": "Report & Safety",
  "safety.subpage.report.blurb":
    "Report harassment or an unsafe space, and see what happens next.",
  "safety.subpage.hateCrime.label": "Hate Crime Guide",
  "safety.subpage.hateCrime.blurb":
    "What counts as a hate crime in Portugal, and how to report one.",
  "safety.subpage.legal.label": "Legal Aid",
  "safety.subpage.legal.blurb":
    "Know your rights and find legal support when you need it.",

  // ── Queer101Page (Queer101Sections.tsx + queer101.data.ts) ─────────────
  "queer101.hero.backLink": "Resource Library",
  "queer101.hero.label": "Queer 101",
  "queer101.hero.title": "Start here, wherever <em>here</em> is.",
  "queer101.hero.lead":
    "For people newly exploring their identity — or just looking for language that fits. You don't need to have anything figured out. This is not a test.",
  "queer101.hero.reassure.noAccount": "No account required to read any of this",
  "queer101.hero.reassure.private": "Nothing you read here is shared with anyone",
  "queer101.hero.reassure.leaveReturn":
    "You can leave and come back whenever you want",

  "queer101.faq.title": "Common <em>questions.</em>",
  "queer101.faq.sub": "Honest answers, without assumptions about where you are right now.",
  "queer101.faq.q1": "How do I know if I'm queer?",
  "queer101.faq.a1":
    'There\'s no test and no threshold. Some people feel certain early; others figure it out over years, or never settle on a label at all — and all of that is fine. A useful question isn\'t "am I queer?" but "what feels true to me right now?" You don\'t owe anyone an answer, including yourself.',
  "queer101.faq.q2": "Do I need a label?",
  "queer101.faq.a2":
    'No. Labels can be useful — they give you language, community, and a way to explain yourself when you want to. But they can also feel like a cage if they don\'t quite fit. Many people use "queer" as a broad, flexible umbrella. Others prefer specificity. Others use nothing. All of it is valid, and it can change.',
  "queer101.faq.q3": "What's the difference between gender identity and sexual orientation?",
  "queer101.faq.a3":
    "Gender identity is about who you are — your internal sense of yourself as a man, woman, non-binary person, or something else. Sexual orientation is about who you're attracted to — romantically, sexually, or both. They're independent: a trans woman can be straight, lesbian, bisexual, or anything else. One doesn't determine the other.",
  "queer101.faq.q4": "I've only ever had relationships with one gender. Does that make me straight?",
  "queer101.faq.a4":
    "Not necessarily. Identity and experience aren't the same thing. Many bisexual and queer people have only dated one gender for long stretches of their lives — circumstances, preference, or chance all play a role. What matters is how you feel, not a list of your past relationships.",
  "queer101.faq.q5": "Is it okay to be questioning? What if I'm never sure?",
  "queer101.faq.a5":
    '"Questioning" is a valid identity in its own right — not just a waiting room. Some people find clarity; others find that the question itself stops mattering over time. There\'s no deadline. You are not broken for not knowing.',
  "queer101.faq.q6": "I came to Lisbon as an adult and I'm only exploring this now. Is that unusual?",
  "queer101.faq.a6":
    "Not at all. Many people find that moving somewhere new — a city with visible queer life, or away from the environment they grew up in — creates the space to explore things that felt impossible before. There's no correct age. Some of the most vibrant people in this community found themselves in their 40s, 50s, or later.",
  "queer101.faq.q7": "What if I explore and decide I'm not queer after all?",
  "queer101.faq.a7":
    "That's okay too. Exploring isn't a commitment. Self-knowledge is worth having, whatever the conclusion. You're welcome here at any stage of the process — including if you leave and come back, or stay as an ally, or never quite figure it out.",

  "queer101.glossary.title": "Language & <em>terminology.</em>",
  "queer101.glossary.sub":
    "A living document. Community-edited — if a definition feels incomplete or wrong, flag it.",
  "queer101.glossary.suggestEditCta": "Suggest an edit",
  "queer101.glossary.searchPlaceholder": "Search terms…",
  "queer101.glossary.notice":
    "This glossary is a starting point, not an authority. Language evolves, people disagree, and definitions that feel right for one person may not for another.",

  // Glossary terms — chrome (platform-authored queer terminology definitions).
  // "Queer"/"LGBTQ+" are kept identical across languages (universal terms).
  "queer101.glossary.term.queer": "Queer",
  "queer101.glossary.def.queer":
    "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; some older people may still find it painful — context matters.",
  "queer101.glossary.term.lgbtq": "LGBTQ+",
  "queer101.glossary.def.lgbtq":
    "Lesbian, Gay, Bisexual, Trans, Queer/Questioning, plus many other identities. The acronym keeps expanding — the + is intentional shorthand for everyone not explicitly listed.",
  "queer101.glossary.term.genderIdentity": "Gender identity",
  "queer101.glossary.def.genderIdentity":
    "A person's internal sense of their own gender — man, woman, non-binary, genderfluid, or something else. Distinct from biological sex, which refers to physical characteristics.",
  "queer101.glossary.term.sexualOrientation": "Sexual orientation",
  "queer101.glossary.def.sexualOrientation":
    "The pattern of who someone is attracted to — romantically, sexually, or both. Includes straight, gay, lesbian, bisexual, pansexual, asexual, and more.",
  "queer101.glossary.term.nonBinary": "Non-binary",
  "queer101.glossary.def.nonBinary":
    'A gender identity that doesn\'t fit exclusively into "man" or "woman." Non-binary is an umbrella that includes genderqueer, genderfluid, agender, and other identities. Many non-binary people use they/them pronouns.',
  "queer101.glossary.term.trans": "Trans / Transgender",
  "queer101.glossary.def.trans":
    "A person whose gender identity differs from the sex they were assigned at birth. Being trans is independent of sexual orientation — trans people can be straight, gay, bisexual, or anything else.",
  "queer101.glossary.term.bisexual": "Bisexual",
  "queer101.glossary.def.bisexual":
    'Attracted to more than one gender. The "bi" doesn\'t mean "only two" — most definitions include attraction to people of similar and different genders. Often shortened to "bi."',
  "queer101.glossary.term.pansexual": "Pansexual",
  "queer101.glossary.def.pansexual":
    "Attracted to people regardless of their gender. Sometimes used interchangeably with bisexual; some people prefer pansexual to emphasise that gender isn't a factor in their attraction.",
  "queer101.glossary.term.asexualAromantic": "Asexual / Aromantic",
  "queer101.glossary.def.asexualAromantic":
    "Asexual (ace): experiences little or no sexual attraction. Aromantic (aro): experiences little or no romantic attraction. The two are distinct and can exist in any combination. Asexual and aromantic people are part of the queer community.",
  "queer101.glossary.term.intersex": "Intersex",
  "queer101.glossary.def.intersex":
    "Born with physical sex characteristics — chromosomes, hormones, anatomy — that don't fit typical definitions of male or female. About 1.7% of people are intersex. Being intersex is a biological reality, not an identity.",
  "queer101.glossary.term.pronouns": "Pronouns",
  "queer101.glossary.def.pronouns":
    "The words used to refer to someone when not using their name. She/her, he/him, they/them, ze/zir, and others. Using someone's correct pronouns is basic respect; it's worth asking when in doubt.",
  "queer101.glossary.term.comingOut": "Coming out",
  "queer101.glossary.def.comingOut":
    "The process of disclosing your identity to others. It's not a single event — most queer people come out repeatedly throughout their lives, to different people and in different contexts. There's no obligation to come out to anyone.",

  "queer101.resources.title": "Curated <em>resources.</em>",
  "queer101.resources.sub":
    "Books, films, and guides chosen by the community — not an algorithm. Updated regularly.",
  "queer101.resType.book": "Book",
  "queer101.resType.film": "Film",
  "queer101.resType.podcast": "Podcast",
  "queer101.resType.guide": "Guide",
  // RESOURCES — real book/film/podcast titles + author/director credits are
  // real-world proper nouns and stay untranslated; only the curatorial `desc`
  // (platform-authored) is translated.
  "queer101.resource.genderQueer.desc":
    "A graphic memoir about gender identity and sexuality — one of the most accessible entry points for people questioning their own identity.",
  "queer101.resource.stoneButchBlues.desc":
    "A foundational novel about working-class gender nonconformity. Available as a free PDF from the author's estate.",
  "queer101.resource.moonlight.desc":
    "A quietly devastating portrait of a Black queer man growing up in Miami. About identity, tenderness, and the weight of other people's expectations.",
  "queer101.resource.kidsAreAllRight.desc":
    "A warm, funny portrait of a lesbian family navigating change. Normalising in the best sense of the word.",
  "queer101.resource.queery.desc":
    "Long-form interviews with queer people across all walks of life. Particularly good for hearing how others have navigated exploration and identity.",
  "queer101.resource.comingOutHandbook.desc":
    "A practical, compassionate guide to coming out — including when not to, how to prepare, and how to care for yourself through the process.",

  "queer101.talk.title": "Want to talk to <em>someone?</em>",
  "queer101.talk.body":
    "Exploring your identity can be joyful, confusing, or both at once. Sometimes it helps to talk with someone who's been through something similar — without advice, without pressure.",
  "queer101.talk.peerSupport.title": "Peer support group",
  "queer101.talk.peerSupport.desc":
    "A moderated, confidential space within QueerPulse. Shared experience, no advice unless asked. Meets weekly.",
  "queer101.talk.peerSupport.cta": "Join the group →",
  "queer101.talk.oneToOne.title": "One-to-one conversation",
  "queer101.talk.oneToOne.desc":
    "Request a conversation with a community member who's offered to talk to people newly exploring their identity.",
  "queer101.talk.oneToOne.cta": "Find a conversation partner →",
  "queer101.talk.therapy.title": "Queer-affirming therapy",
  "queer101.talk.therapy.desc":
    "A directory of therapists in Lisbon who specialise in LGBTQ+ clients, compiled and reviewed by the community.",
  "queer101.talk.therapy.cta": "Find a therapist →",
  "queer101.talk.askAnon.title": "Ask anonymously",
  "queer101.talk.askAnon.desc":
    "Submit a question anonymously to the community forum. Answered by real people, not bots.",
  "queer101.talk.askAnon.cta": "Ask the forum →",

  "queer101.outro.title": "You're welcome <em>here.</em>",
  "queer101.outro.sub":
    "Wherever you are in the process. However long it takes. This community isn't going anywhere.",
  "queer101.outro.joinCta": "Join QueerPulse",
  "queer101.outro.exploreCta": "Explore communities",

  // ── GlossaryPage ────────────────────────────────────────────────────────
  // Note: GlossaryPage has its OWN self-contained EN/PT term-language toggle
  // (`GLOSSARY_COPY`, `BLOCKS` in glossary.data.tsx) independent of the site
  // locale — deliberately left untouched (see sweep report). Only the
  // language-invariant page chrome below is routed through the catalog.
  "glossary.backLink": "Resource Library",
  "glossary.hero.title": "A working <em>glossary.</em>",
  "glossary.hero.dek":
    "Words used here — across the platform, in the magazine, at gatherings. <b>Definitions are working drafts.</b> Where a term is contested, we say so. Where it's Lisbon-specific, we mark it. <em>Suggest edits at the bottom; the editors look at them weekly.</em>",
  "glossary.foot.body":
    "This is a working document. Suggestions are read by the editorial team weekly and discussed at the monthly assembly. <em>We will get things wrong; we'd rather get them wrong publicly and fix them.</em>",

  // ── PronounsGuidePage (+ PronounsGuideSections.tsx + pronounsGuide.data.tsx) ──
  // Trans-specific guidance — flag for native review.
  "pronounsGuide.hero.eyebrow": "For trans & nonbinary members",
  "pronounsGuide.hero.title": "Names, pronouns, <em>done right.</em>",
  "pronounsGuide.hero.sub":
    "How QueerPulse handles chosen names and pronouns — and what to do when your name or gender changes across the platform.",

  "pronounsGuide.basics.eyebrow": "The basics",
  "pronounsGuide.basics.title": "Chosen name vs. <em>legal name.</em>",
  "pronounsGuide.basics.body1":
    "QueerPulse uses your <strong>chosen name</strong> everywhere. Your legal name is only stored if you've provided it separately — for example, if you applied for event ticketing that required it. In all other contexts, we use whatever you've entered as your display name or chosen name in settings.",
  "pronounsGuide.basics.body2":
    "If you're in the process of changing your legal name and want QueerPulse to reflect your new name before the paperwork is done, you can update your display name at any time — no documentation required.",

  "pronounsGuide.whenUpdate.eyebrow": "When you update your name",
  "pronounsGuide.whenUpdate.title": "What changes, <em>and when.</em>",
  "pronounsGuide.whenUpdate.body":
    "Updating your display name is immediate across most of the platform. A few things propagate slightly later — here's what to expect.",

  "pronounsGuide.pronouns.eyebrow": "Pronouns",
  "pronounsGuide.pronouns.title": "Setting and <em>changing pronouns.</em>",
  "pronounsGuide.pronouns.body1":
    "Your pronouns appear on your profile page, next to your name in message threads, and in the member directory if you've made that section visible. They do not appear in URLs, notification emails, or search result snippets.",
  "pronounsGuide.pronouns.body2":
    "You can set multiple pronoun sets (e.g. she/they) and add a custom string if none of the presets fit. Changes take effect immediately and there's no limit to how often you can update them.",
  "pronounsGuide.pronouns.body3":
    "If another member uses the wrong pronouns for you in the forum or messages, you can report it using the report function on any post or message. Our moderation team treats repeated misgendering as a code of conduct issue.",

  "pronounsGuide.faq.eyebrow": "Common questions",
  "pronounsGuide.faq.title": "Things people <em>ask us.</em>",

  "pronounsGuide.sidebar.updateName.title": "Update your <em>name now</em>",
  "pronounsGuide.sidebar.updateName.body":
    "Make changes to your display name, chosen name, and pronouns in your profile settings.",
  "pronounsGuide.sidebar.updateName.cta": "Edit profile",
  "pronounsGuide.sidebar.commitment.title": "Our commitment",
  "pronounsGuide.sidebar.commitment.body":
    "QueerPulse will never require documentation to change your name or pronouns. No legal name verification. No deadnaming by staff. If something on the platform misgenders you, <a>tell us</a> and we'll fix it.",
  "pronounsGuide.sidebar.wrong.title": "Something <em>wrong?</em>",
  "pronounsGuide.sidebar.wrong.body":
    "If you've found your deadname somewhere on the platform, or something isn't updating correctly, contact us directly.",
  "pronounsGuide.sidebar.wrong.cta": "Contact us",

  "pronounsGuide.outro.title": "Questions about <em>your identity settings?</em>",
  "pronounsGuide.outro.sub": "Write to us. We'll respond within two working days.",
  "pronounsGuide.outro.cta": "Contact us",

  "pronounsGuide.table.head.field": "Field",
  "pronounsGuide.table.head.use": "What it's used for",
  "pronounsGuide.table.head.who": "Who sees it",
  "pronounsGuide.table.displayName.field": "Display name",
  "pronounsGuide.table.displayName.use": "Your name on posts, profile, messages",
  "pronounsGuide.table.displayName.who": "All members",
  "pronounsGuide.table.chosenName.field": "Chosen name",
  "pronounsGuide.table.chosenName.use": "Emails from QueerPulse, internal comms",
  "pronounsGuide.table.chosenName.who": "Only you",
  "pronounsGuide.table.username.field": "Username",
  "pronounsGuide.table.username.use": "URL handle (queerpulse.pt/@username)",
  "pronounsGuide.table.username.who": "Changeable once/year",
  "pronounsGuide.table.legalName.field": "Legal name",
  "pronounsGuide.table.legalName.use": "Only if you've provided it for ticketing",
  "pronounsGuide.table.legalName.who": "Only admins + you",

  "pronounsGuide.where.profile.title": "Your profile",
  "pronounsGuide.where.profile.text":
    "Updates instantly. Your new name appears on your profile page as soon as you save.",
  "pronounsGuide.where.profile.timing": "Immediate",
  "pronounsGuide.where.messages.title": "Messages",
  "pronounsGuide.where.messages.text":
    "New messages use your new name. Existing message headers update within a few minutes.",
  "pronounsGuide.where.messages.timing": "Minutes",
  "pronounsGuide.where.forum.title": "Forum posts",
  "pronounsGuide.where.forum.text":
    "All your past and future posts show your new display name. Search indexes update overnight.",
  "pronounsGuide.where.forum.timing": "Up to 24h for search",
  "pronounsGuide.where.magazine.title": "Magazine bylines",
  "pronounsGuide.where.magazine.text":
    "If you've written for the magazine, email us and we'll update your byline across all published issues.",
  "pronounsGuide.where.magazine.timing": "Manual · email us",

  "pronounsGuide.faq.q1": "Can I change my username?",
  "pronounsGuide.faq.a1":
    "Yes, once per year. Username changes update your profile URL — any old links will redirect for 90 days. Go to Edit Profile → Identity to change it.",
  "pronounsGuide.faq.q2": "What if my deadname appears somewhere?",
  "pronounsGuide.faq.a2":
    "Contact us immediately at <a>help@queerpulse.pt</a> and we'll remove or update it as a priority. This includes magazine bylines, old forum posts attributed to your previous name, and any email archives we hold.",
  "pronounsGuide.faq.q3": "Does changing my name affect my invite history?",
  "pronounsGuide.faq.a3":
    "No. Your invite relationships (who invited you, who you've invited) are maintained internally by account ID, not name, so name changes have no effect on them.",
  "pronounsGuide.faq.q4": "Can I make my pronouns private?",
  "pronounsGuide.faq.a4":
    "Yes — go to Edit Profile → Field Visibility and set Pronouns to 'Hidden'. They won't appear on your profile or in member search. They'll still be used by the team in any direct communications.",
  "pronounsGuide.faq.q5": "What if I don't want to specify pronouns?",
  "pronounsGuide.faq.a5":
    "Just leave the pronouns field blank or unselected. No field is mandatory. You won't be prompted to fill it in.",
  "pronounsGuide.faq.q6": "How does the platform handle legal name data?",
  "pronounsGuide.faq.a6":
    "Legal name data is only stored if you've explicitly provided it for a purpose that required it (e.g. certain grant applications run through the platform). It's never used as your display name and is stored separately with stricter access controls. You can request its deletion at any time via <a>Data Export</a>.",

  // ── MentalHealthPage (+ MentalHealthSections.tsx + mentalHealth.data.ts) ──
  "mentalHealth.hero.cat": "Mental Health",
  "mentalHealth.hero.title": "You don't have to be <em>okay.</em>",
  "mentalHealth.hero.sub":
    "Queer-affirming therapists, honest information about accessing mental health support in Lisbon, crisis resources, and a community that understands what you're carrying — because we're carrying it too.",

  "mentalHealth.crisis.label": "If you need support now",
  "mentalHealth.crisis.heading": "Crisis & immediate support lines",
  "mentalHealth.crisis.sub":
    "These lines are available now. You don't have to be in immediate danger to call — if you're struggling, reaching out is enough.",
  // Real-world helpline names untouched; only descriptive notes translated.
  "mentalHealth.crisisLine.sosVozAmiga.note": "24h · Portuguese & English",
  "mentalHealth.crisisLine.sns24.note": "Health line · 24h",
  "mentalHealth.crisisLine.ilga.note": "LGBTQ+ support line",
  "mentalHealth.crisisLine.samaritans.note": "Email · English · 24h response",

  "mentalHealth.outro.title": "Asking for help is <em>not small.</em>",
  "mentalHealth.outro.sub": "It's one of the harder things. The community is here.",
  "mentalHealth.outro.cta": "Talk to someone",

  "mentalHealth.therapists.title": "Queer-affirming <em>therapists in Lisbon</em>",
  "mentalHealth.therapists.lead":
    'Reviewed and recommended by community members. Every therapist here has been verified as genuinely queer-affirming — not just "welcoming" but experienced with queer lives, identities, and the specific pressures of being queer and an expat in Lisbon.',
  "mentalHealth.therapists.filterLabel": "Filter",
  "mentalHealth.therapists.allLanguages": "All languages",
  "mentalHealth.therapists.accepting": "Accepting",
  "mentalHealth.therapists.waitlist": "Waitlist",
  "mentalHealth.therapists.viewProfileAriaLabel": "View {name}'s profile",
  "mentalHealth.therapists.viewProfileCta": "View profile →",

  "mentalHealth.experiences.title": "Things the community <em>has felt</em>",
  "mentalHealth.experiences.lead":
    "Being a queer expat in Lisbon comes with specific pressures. Naming them isn't complaining — it's the start of dealing with them.",
  "mentalHealth.experience.newCommunity.title": "Starting over in a new community",
  "mentalHealth.experience.newCommunity.text":
    "Losing your queer social network when you move is a genuine grief. Building a new one takes time and feels unnatural at first. The people who've been here longest remember it — it does get easier, but the early months are hard and it's okay to say so.",
  "mentalHealth.experience.visibility.title": "Navigating visibility in a new culture",
  "mentalHealth.experience.visibility.text":
    "Lisbon is broadly safe but queer visibility works differently here. Some members feel more visible than at home; others feel less. Reading social situations in a second language or culture is exhausting and disorienting in ways that are hard to explain to people who haven't experienced it.",
  "mentalHealth.experience.admin.title": "The administrative grind",
  "mentalHealth.experience.admin.text":
    "Visas, NIF, AIMA, healthcare registration, bank accounts that won't open. The bureaucratic weight of building a life in a new country is a documented source of chronic stress. It's not weakness — it's a lot. Naming it as a mental health factor is valid.",
  "mentalHealth.experience.transNonbinary.title":
    "Trans and non-binary experiences in a new system",
  "mentalHealth.experience.transNonbinary.text":
    "Navigating healthcare, legal documents, and social situations as a trans or non-binary person in Portugal adds a specific layer of stress and labour. Portugal's legal framework is progressive but administrative reality varies. The Trans Hub has specific resources.",
  "mentalHealth.experience.distance.title": "Distance from family of origin",
  "mentalHealth.experience.distance.text":
    "Moving to another country often means physical distance from family — chosen or biological. For queer people whose family relationships are complicated or conditional, this distance can be both a relief and its own kind of grief. Both are real at the same time.",
  "mentalHealth.experience.financial.title": "Financial anxiety",
  "mentalHealth.experience.financial.text":
    "Lisbon's rising cost of living affects queer expats acutely. Housing insecurity, visa costs, and the pressure to perform a certain kind of queer expat life are all real stressors. The community talks about money honestly — the forum's economics thread is a good start.",

  "mentalHealth.sns.title": "Accessing mental health <em>through the SNS</em>",
  "mentalHealth.sns.lead":
    "Portugal's public health system covers mental health, including therapy and psychiatry — but access is uneven. Here's what to realistically expect.",
  "mentalHealth.sns.step1.title": "Register with a GP first",
  "mentalHealth.sns.step1.text":
    "You need to be registered with a Centro de Saúde before accessing SNS mental health services. Register with your AR card or EU registration certificate and NISS number. Waiting lists for GP registration exist in some areas.",
  "mentalHealth.sns.step2.title": "GP referral for psychology",
  "mentalHealth.sns.step2.text":
    "Your GP can refer you to a psychologist or psychiatrist through the SNS. Waiting times for the first appointment are typically 3–6 months. For urgent needs, explain severity clearly — this can speed up the referral.",
  "mentalHealth.sns.step3.title": "Language matters",
  "mentalHealth.sns.step3.text":
    "SNS therapists and psychiatrists typically work in Portuguese. If your Portuguese is limited, private therapy in English is more practical for most expats. Online platforms (BetterHelp, Zenklub) offer English-speaking therapists at lower cost than Lisbon private rates.",
  "mentalHealth.sns.step4.title": "Private rates in Lisbon",
  "mentalHealth.sns.step4.text":
    "Private therapy ranges from €50–120 per session. Some therapists offer sliding scale fees — it's always worth asking. Several therapists in our directory offer community member rates for QueerPulse members.",
  "mentalHealth.sns.peer.title": "Peer support within <em>the community</em>",
  "mentalHealth.sns.peer.body":
    "The mental health peer support group meets monthly. Members share experiences, recommend resources, and support each other — no professional facilitation, just honest conversation.",
  "mentalHealth.sns.peer.joinCta": "Join the group",
  "mentalHealth.sns.peer.mentorCta": "Find a peer mentor →",

  // ── TherapistProfileModal + TherapistProfileBody ────────────────────────
  // therapist.bio/approach/training/firstSession stay English (mock content,
  // fetched from the API in live mode); everything below is platform chrome.
  "mentalHealth.therapistModal.profileAriaLabel": "{name} — profile",
  "mentalHealth.therapistModal.sayHelloCta": "Say hello →",
  "mentalHealth.therapistModal.sentTitle": "Message sent to {name}.",
  "mentalHealth.therapistModal.sentText":
    "They'll reply directly to your email if it feels like a fit. No notifications, no pressure.",
  "mentalHealth.therapistModal.footNote":
    "Messages go straight to {name} — held briefly and reviewed before delivery to keep the room safe.",

  "mentalHealth.therapistProfile.meta.slidingScale": "Sliding scale available",
  "mentalHealth.therapistProfile.meta.fixedRate": "Fixed session rate",
  "mentalHealth.therapistProfile.meta.years_one": "{count} year in practice",
  "mentalHealth.therapistProfile.meta.years_other": "{count} years in practice",
  "mentalHealth.therapistProfile.status.acceptingNew": "Accepting new clients",
  "mentalHealth.therapistProfile.status.waitlistOnly":
    "Waitlist only right now",
  "mentalHealth.therapistProfile.section.about": "About",
  "mentalHealth.therapistProfile.section.howIWork": "How I work",
  "mentalHealth.therapistProfile.section.training": "Training & qualifications",
  "mentalHealth.therapistProfile.section.firstSession": "Your first session",
  "mentalHealth.therapistProfile.seeFullProfileCta": "See full profile →",

  // ── WellbeingPage (+ WellbeingSections.tsx + wellbeing.data.ts) ──────────
  "wellbeing.hero.eyebrow": "Wellbeing",
  "wellbeing.hero.title": "A room that <em>looks after you.</em>",
  "wellbeing.hero.lead":
    "Resources built by and for the community — therapists, peer support, crisis help, and harm reduction. This is what a professional network looks like when it takes care seriously.",
  "wellbeing.hero.anchor.therapists": "Therapist directory",
  "wellbeing.hero.anchor.peerSupport": "Peer support",
  "wellbeing.hero.anchor.crisis": "Crisis resources",
  "wellbeing.hero.anchor.harmReduction": "Harm reduction",

  "wellbeing.outro.title": "You belong <em>here.</em>",
  "wellbeing.outro.sub":
    "If you're not yet a member, request an invite. If you are, everything above is in the member area — no separate login needed.",
  "wellbeing.outro.cta": "Request an invite",
  "wellbeing.subpageIndex.title": "More wellbeing support",
  "wellbeing.subpage.harmReduction.label": "Harm Reduction",
  "wellbeing.subpage.harmReduction.blurb":
    "Using more safely — practical, non-judgemental guidance.",
  "wellbeing.subpage.sober.label": "Sober",
  "wellbeing.subpage.sober.blurb":
    "Sober and social — meetups and support that don't revolve around drinking.",

  "wellbeing.therapists.title": "Queer-affirming <em>therapists in Lisbon</em>",
  "wellbeing.therapists.lead":
    "Vetted by community members. Each therapist listed has been recommended by at least two QueerPulse members. We do not charge listing fees. Want to add someone? <a>Get in touch.</a>",
  "wellbeing.therapists.requestIntroCta": "Request intro →",
  "wellbeing.therapists.applyPrompt": "Are you a queer-affirming therapist?",
  "wellbeing.therapists.applyCta": "Apply to be listed →",

  "wellbeing.peer.title": "You don't have to <em>hold it alone.</em>",
  "wellbeing.peer.body":
    "A moderated peer support space inside the Forum — for members going through difficult times. No advice unless asked. No fixing. Just people who understand, listening.",
  "wellbeing.peer.joinCta": "Join the group",
  "wellbeing.peer.crisisCta": "In crisis right now?",
  "wellbeing.peer.stat.members.label": "members in the support space",
  "wellbeing.peer.stat.moderation.label": "guaranteed moderation response",
  "wellbeing.peer.stat.confidential.label": "confidential within the group",

  "wellbeing.crisisSection.title": "Crisis & <em>emergency resources</em>",
  "wellbeing.crisisSection.lead":
    "If you are in immediate danger, call <strong>112</strong>. These resources are specific to LGBTQ+ situations in Portugal.",
  // Real-world helpline names kept untranslated; desc/hours are chrome.
  "wellbeing.crisis.sosVozAmiga.desc":
    "Anonymous emotional support and crisis counselling. No judgement. Available in Portuguese and English.",
  "wellbeing.crisis.sosVozAmiga.hours": "Daily 16h–24h",
  "wellbeing.crisis.ilga.desc":
    "LGBTQ+ specific support, legal guidance, and referrals to affirming services across Portugal.",
  "wellbeing.crisis.ilga.hours": "Weekdays 10h–18h",
  "wellbeing.crisis.redeExAequo.desc":
    "Support for LGBTQ+ people under 30. Online chat and phone — safe, confidential, peer-led.",
  "wellbeing.crisis.redeExAequo.hours": "Online · Weekdays 18h–22h",
  "wellbeing.crisis.qpEmergency.title": "QueerPulse Emergency",
  "wellbeing.crisis.qpEmergency.desc":
    "Safe housing contacts, community members who can help, and emergency escalation paths — available always.",
  "wellbeing.crisis.qpEmergency.cta": "Open emergency page →",
  "wellbeing.crisis.qpEmergency.hours": "Always available",

  "wellbeing.harm.title": "Harm <em>reduction</em>",
  "wellbeing.harm.lead":
    "Non-judgmental information for a community that lives in the real world. This is not moral instruction — it's practical care. No one here will tell you how to live.",
  "wellbeing.harm.nightlife.title": "Nightlife safety basics",
  "wellbeing.harm.nightlife.desc":
    "What to know before you go out, what to do if something feels wrong, and how to look out for your friends and your own body.",
  "wellbeing.harm.drugsAlcohol.title": "Drugs & alcohol",
  "wellbeing.harm.drugsAlcohol.desc":
    "Honest information about substances common in the queer nightlife scene — interactions, risks, and how to ask for help without shame.",
  "wellbeing.harm.sexualHealth.title": "Sexual health in Lisbon",
  "wellbeing.harm.sexualHealth.desc":
    "PrEP access, STI testing, and affirming sexual health services that don't make you feel judged for being yourself.",
  "wellbeing.harm.chemsex.title": "Chemsex support",
  "wellbeing.harm.chemsex.desc":
    "Confidential, non-judgmental resources for members navigating chemsex — connected to real services and real people who've been there.",

  // ── TherapistProfilePage (therapist/ subfolder) ─────────────────────────
  // Per-therapist facts in therapistProfiles.data.tsx (bio, quote, credsLine,
  // specialisms, approach paragraphs, vouches, notes, fees, venue, bookCta)
  // are fetched profile content in live mode and stay English. Everything
  // below is platform chrome around that content.
  "therapistProfilePage.backLink": "Therapist directory",
  "therapistProfilePage.verified.body_one":
    "<b>Vetted clinician.</b> Credentials checked by QueerPulse Wellbeing on {vettedOn}. {count} independent community vouch in the last 12 months. <a>How we vet →</a>",
  "therapistProfilePage.verified.body_other":
    "<b>Vetted clinician.</b> Credentials checked by QueerPulse Wellbeing on {vettedOn}. {count} independent community vouches in the last 12 months. <a>How we vet →</a>",
  "therapistProfilePage.sendMessageCta": "Send a message",

  "therapistProfilePage.worksWith.title": "What {name} <em>works with</em>",
  "therapistProfilePage.worksWith.sub":
    "Self-declared and consistent with the vouching community.",
  "therapistProfilePage.approachTitle.he": "His approach",
  "therapistProfilePage.approachTitle.she": "Her approach",
  "therapistProfilePage.approachTitle.neutral": "Their approach",
  "therapistProfilePage.vouches.title_one": "{count} member <em>vouched</em>",
  "therapistProfilePage.vouches.title_other":
    "{count} members <em>vouched</em>",
  "therapistProfilePage.vouches.sub":
    "Anonymised by the vouching member. The clinic doesn't see who said what.",
  "therapistProfilePage.vouches.addPrompt": "Have you seen {name}?",
  "therapistProfilePage.vouches.addHelp": "Help the next member decide",
  "therapistProfilePage.vouches.addCta": "Add an anonymised vouch →",
  "therapistProfilePage.beforeBook.title":
    "Before you book — <em>good to know</em>",

  "therapistProfilePage.sidebar.bookHeadingAccepting": "Book — next 4 weeks",
  "therapistProfilePage.sidebar.bookHeadingWaitlist":
    "Availability — waitlist",
  "therapistProfilePage.sidebar.legendAvailable": "Available",
  "therapistProfilePage.sidebar.legendBooked": "Booked",
  "therapistProfilePage.sidebar.heldAccepting":
    "Held {slot}. {name} will confirm by email — nothing is charged for holding.",
  "therapistProfilePage.sidebar.heldWaitlist":
    "You're on the list. {name} will write when a slot opens — usually 6–10 weeks.",
  "therapistProfilePage.sidebar.holdingLabel": "Holding…",
  "therapistProfilePage.sidebar.joiningLabel": "Joining…",
  "therapistProfilePage.sidebar.holdSlotCta": "Hold {slot} →",
  "therapistProfilePage.sidebar.pickSlotCta": "Pick an open slot",
  "therapistProfilePage.sidebar.feesHeading": "Fees",
  "therapistProfilePage.sidebar.whereHeading": "Where",
  "therapistProfilePage.sidebar.crisisHeading": "In crisis right now",
  "therapistProfilePage.sidebar.crisisText":
    "Therapy isn't the right path when you're in immediate danger. Use these instead — they're staffed for this.",
  "therapistProfilePage.sidebar.crisisChatCta": "Open crisis chat",
  "therapistProfilePage.sidebar.sosVozAmigaCta": "SOS Voz Amiga · 213 544 545",

  "therapistProfilePage.vouch.successAriaLabel": "Vouch received",
  "therapistProfilePage.vouch.successTitle": "Vouch received,",
  "therapistProfilePage.vouch.successEm": "thank you.",
  "therapistProfilePage.vouch.successBody":
    "A moderator reads every vouch before it's published — yours will appear within a couple of days, anonymised exactly as you wrote it. {name} won't see who sent it, and neither will the clinic.",
  "therapistProfilePage.vouch.modalAriaLabel": "Vouch for {name}",
  "therapistProfilePage.vouch.eyebrow": "Community vouch",
  "therapistProfilePage.vouch.title": "Have you seen {name}? <em>Say so.</em>",
  "therapistProfilePage.vouch.sub":
    "Vouches are anonymised — {name} won't see who wrote what, and neither will the clinic. One honest paragraph helps the next member decide.",
  "therapistProfilePage.vouch.form.textLabel": "Your vouch",
  "therapistProfilePage.vouch.form.textPlaceholder":
    "What was it like to work with them? What should the next member know?",
  "therapistProfilePage.vouch.form.bylineLabel":
    "How should we describe you? (optional)",
  "therapistProfilePage.vouch.form.bylineHelper":
    "Shown instead of your name — keep it as vague as you like.",
  "therapistProfilePage.vouch.form.bylinePlaceholder": "e.g. Member · couple work",
  "therapistProfilePage.vouch.submitCta": "Add my vouch",

  // ── TransHubPage ─────────────────────────────────────────────────────────
  // Trans healthcare/legal navigation guidance for Portugal — flag for native
  // review. Real-world proper nouns (SNS, Hospital de Santa Maria, Hospital
  // Curry Cabral, ILGA Portugal, Rede ex aequo, Cartão de Cidadão, NIF, Law
  // 38/2018) stay untranslated inside the catalog values themselves.
  "transHub.hero.eyebrow": "Trans & Non-Binary Hub",
  "transHub.hero.title": "A dedicated space, <em>not an afterthought.</em>",
  "transHub.hero.lead":
    "Healthcare navigation, legal guides, peer support, and community — built specifically for trans and non-binary members. You don't have to figure this out alone.",
  "transHub.hero.anchor.healthcare": "Healthcare",
  "transHub.hero.anchor.legal": "Legal & admin",
  "transHub.hero.anchor.resources": "Resources",
  "transHub.hero.anchor.community": "Community",

  "transHub.healthcare.title": "Healthcare <em>navigation</em>",
  "transHub.healthcare.lead":
    "Trans healthcare in Portugal has improved significantly since 2018. The SNS now covers hormone therapy and gender-affirming surgeries. Navigating it is still complex — here's how it works.",
  "transHub.healthcare.step1.title": "Start with your GP (Médico de Família)",
  "transHub.healthcare.step1.body":
    "Request a referral to an endocrinologist or the nearest gender clinic. Your GP may not be familiar with the process — bring our GP referral guide to help. SNS referrals typically take 6–18 months.",
  "transHub.healthcare.step2.title": "Gender clinics in Lisbon",
  "transHub.healthcare.step2.body":
    "Hospital de Santa Maria and Hospital Curry Cabral both have gender medicine units. Private options include the Clínica de Identidade de Género for faster access. We have member reviews of all three.",
  "transHub.healthcare.step3.title": "HRT access",
  "transHub.healthcare.step3.body":
    "Hormone therapy is available via the SNS once you have an endocrinology referral. Many members use the informed consent model at private clinics as a faster first step, then transition to SNS for ongoing care.",
  "transHub.healthcare.step4.title": "Surgical procedures",
  "transHub.healthcare.step4.body":
    "Gender-affirming surgeries covered by the SNS include vaginoplasty, phalloplasty, mastectomy, and others. Waiting lists are long (1–3+ years). <a>Jonas Ferreira</a> has helped many members navigate this.",
  "transHub.healthcare.step5.title": "If you're facing barriers",
  "transHub.healthcare.step5.body":
    "If a provider refuses treatment or makes the process hostile, document everything. Contact <a>our legal resources</a> or ILGA Portugal. You have rights — and this community can help you enforce them.",

  "transHub.legal.title": "Legal & <em>administrative</em>",
  "transHub.legal.lead":
    "Navigating legal name and gender marker changes in Portugal. The 2018 Gender Identity Law (Law 38/2018) significantly simplified the process.",
  "transHub.legal.step1.title": "Legal name & gender change",
  "transHub.legal.step1.body":
    "Since 2018, you can change your legal name and gender marker at any civil registry office without medical documentation. You need only a declaration — no psychiatric evaluation required. The fee is approximately €200.",
  "transHub.legal.step2.title": "Updating your documents",
  "transHub.legal.step2.body":
    "Once your Cartão de Cidadão is updated, other documents follow. Your employer, bank, and health records can all be updated with the new ID. We have a checklist of everything that needs updating and in which order.",
  "transHub.legal.step3.title": "Non-binary legal recognition",
  "transHub.legal.step3.body":
    "Portugal does not currently have a third gender option on official documents. This is an area of ongoing advocacy — ILGA Portugal and Rede ex aequo are working on it. We have resources if this affects you.",

  "transHub.resources.title": "Resources & <em>guides</em>",
  "transHub.resources.lead":
    "Maintained by trans and non-binary members. Practical, current, and free.",
  "transHub.resources.openCta": "Open →",
  "transHub.resources.cat.guide": "Guide",
  "transHub.resources.cat.checklist": "Checklist",
  "transHub.resources.cat.directory": "Directory",
  "transHub.resources.cat.peerSupport": "Peer support",
  "transHub.resource.snsGuide.title": "The SNS trans healthcare guide",
  "transHub.resource.snsGuide.desc":
    "A members-maintained walkthrough of the public system — referrals, clinics, what to bring, and how long each step really takes.",
  "transHub.resource.docChecklist.title": "Document-change checklist",
  "transHub.resource.docChecklist.desc":
    "Every document to update after a legal name change, in the right order — CC, NIF, bank, employer, health records.",
  "transHub.resource.clinicians.title": "Affirming clinicians",
  "transHub.resource.clinicians.desc":
    "Endocrinologists, surgeons, and GPs reviewed by trans members. No listing fees, no algorithm — just lived experience.",
  "transHub.resource.peerCircle.title": "Trans & NB peer circle",
  "transHub.resource.peerCircle.desc":
    "A moderated space to share what worked, vent what didn't, and find someone a few steps ahead of you on the same path.",

  "transHub.community.title": "A community that <em>has your back.</em>",
  "transHub.community.body":
    "The Trans & Non-Binary Hub is more than resources — it's people. Members share clinic reviews, celebrate milestones, and turn up for each other when the system doesn't.",
  "transHub.community.joinCta": "Join the hub",
  "transHub.community.stat.members.label": "members in the hub",
  "transHub.community.stat.reviews.label": "clinician reviews",
  "transHub.community.stat.lawYear.label": "self-ID law in effect",

  "transHub.outro.title": "You're seen <em>here.</em>",
  "transHub.outro.sub":
    "QueerPulse is a vouched-for, invite-only network. If someone you trust is already here, ask them to vouch for you.",
  "transHub.outro.cta": "Request an invite",

  // ── TransHealthcarePage ──────────────────────────────────────────────────
  // FLAGGED, partially swept — see sweep report. The ~26 detailed procedural
  // steps in transHealthcare.data.ts (exact wait times, costs, legal
  // citations, clinic names) and the CONTACTS list are deliberately left
  // untranslated pending dedicated native review: this is the densest,
  // highest-precision medical/legal content in the namespace and a rushed
  // translation risks a subtly wrong wait-time or legal detail. Only the
  // surrounding page chrome below (hero, tab labels, section headers,
  // sidebar, outro) is translated.
  "transHealthcare.hero.eyebrow": "Trans Healthcare · Portugal",
  "transHealthcare.hero.titleLine1": "Your journey,",
  "transHealthcare.hero.titleLine2": "step by step.",
  "transHealthcare.hero.sub":
    "How to access gender-affirming healthcare in Portugal — through the SNS or privately. Legal name change. What to bring, who to call, what to expect.",
  "transHealthcare.hero.disclaimer":
    "This guide reflects the system as of June 2026. Always verify current waiting times and procedures with ILGA Portugal or your GP. This is community knowledge, not legal or medical advice.",

  "transHealthcare.path.hrtSns.label": "HRT via SNS",
  "transHealthcare.path.hrtPrivate.label": "HRT privately",
  "transHealthcare.path.legalName.label": "Legal name change",
  "transHealthcare.path.genderMarker.label": "Gender marker",
  "transHealthcare.path.surgery.label": "Surgery access",

  "transHealthcare.section.gettingIntoSystem": "Getting into the system",
  "transHealthcare.section.genderClinic": "Gender clinic",
  "transHealthcare.section.ongoingCare": "Ongoing care",
  "transHealthcare.section.findingPrivateProvider":
    "Finding a private provider",
  "transHealthcare.section.ongoing": "Ongoing",
  "transHealthcare.section.legalProcess": "The process (Lei n.º 38/2018)",
  "transHealthcare.section.genderMarkerChange": "Changing your gender marker",
  "transHealthcare.section.surgeryInPortugal":
    "Gender-affirming surgery in Portugal",

  "transHealthcare.sidebar.keyContacts": "Key contacts",
  "transHealthcare.sidebar.communityTip": "Community tip",
  "transHealthcare.sidebar.communityTipBody":
    "ILGA Portugal offers free legal accompaniment for trans people navigating the SNS system. You do not have to do this alone — call them before your first appointment.",
  "transHealthcare.sidebar.relatedTitle": "Related on QueerPulse",
  "transHealthcare.sidebar.solidarityCta": "Solidarity Pricing Registry →",
  "transHealthcare.sidebar.solidarityRole": "Trans-affirming GPs, psychiatrists",
  "transHealthcare.sidebar.legalCta": "Legal Resources →",
  "transHealthcare.sidebar.legalRole": "Name change documents",
  "transHealthcare.sidebar.mentalHealthCta": "Mental Health →",
  "transHealthcare.sidebar.mentalHealthRole": "Support through the process",

  "transHealthcare.outro.title": "You deserve <em>good care.</em>",
  "transHealthcare.outro.sub":
    "The QueerPulse community includes trans-affirming GPs, therapists, and legal professionals. You do not have to navigate this alone.",
  "transHealthcare.outro.cta": "Find solidarity pricing",

  // ── HarmReductionPage (+ HarmReductionSections.tsx + harmReduction.data.tsx) ──
  // Overdose response / substance-safety guidance — the highest-stakes copy
  // in this namespace. Kept literal and unambiguous; every number, timing,
  // drug name, phone number and org name is preserved exactly between EN and
  // PT. Flag for the closest native review before shipping.
  "harmReduction.emergency.emergencyLabel": "Emergency:",
  "harmReduction.emergency.snsLabel": "SNS 24 (non-emergency):",
  "harmReduction.emergency.mentalHealthLabel":
    "Linha de Apoio (mental health):",

  "harmReduction.hero.backLink": "Wellbeing Hub",
  "harmReduction.hero.eyebrow": "Harm Reduction · Community guide",
  "harmReduction.hero.titleLine1": "No judgment.",
  "harmReduction.hero.titleLine2": "Just information.",
  "harmReduction.hero.sub":
    "If you are going to use substances — at a club, at a party, at home — this guide is for you. Not to stop you. To help you stay safe.",
  "harmReduction.hero.sos":
    "<strong>If someone stops breathing:</strong> call 112 immediately. Portugal has a good samaritan law — you will not be prosecuted for calling for help.",

  "harmReduction.naloxone.title": "Naloxone <em>saves lives.</em>",
  "harmReduction.naloxone.body1":
    "Naloxone (Narcan) reverses an opioid overdose in minutes. It is available free of charge in Portugal through harm reduction services and some pharmacies. It is safe, easy to use, and non-prescription. Carry it if you or anyone around you uses opioids — including fentanyl, heroin, or strong prescription painkillers.",
  "harmReduction.naloxone.body2":
    "In Lisbon: GAT Lisboa, APDES, and the Ares do Pinhal harm reduction team distribute naloxone free of charge. Ask at your nearest harm reduction service or contact GAT directly.",
  "harmReduction.naloxone.stepsLabel": "If someone overdoses",
  "harmReduction.naloxone.step1":
    '<strong>Call 112</strong> — say "a person is unresponsive and not breathing normally"',
  "harmReduction.naloxone.step2":
    "<strong>Administer naloxone</strong> — nasal spray: one spray in one nostril. Injection: follow kit instructions.",
  "harmReduction.naloxone.step3":
    "<strong>Recovery position</strong> — roll onto their side, tilt head back to open airway",
  "harmReduction.naloxone.step4":
    "<strong>If no response in 2–3 minutes</strong> — give a second dose if you have one. Continue until help arrives.",
  "harmReduction.naloxone.step5":
    "<strong>Stay with them</strong> — naloxone wears off before many opioids do. They need monitoring.",

  "harmReduction.section.beforeNight.label": "Before the night",
  "harmReduction.section.beforeNight.title": "Know before you go",
  "harmReduction.section.beforeNight.item.eat.title": "Eat beforehand",
  "harmReduction.section.beforeNight.item.eat.body":
    "Alcohol and MDMA both hit harder on an empty stomach. Eat a proper meal 2–3 hours before, not immediately before.",
  "harmReduction.section.beforeNight.item.test.title": "Test your substances",
  "harmReduction.section.beforeNight.item.test.body":
    "Drug checking services operate in Lisbon — KOSMICARE at festivals, and the DICAD-supported service. Reagent test kits are legal in Portugal and available online. Never assume a pill is what you were told.",
  "harmReduction.section.beforeNight.item.meds.title": "Know your medications",
  "harmReduction.section.beforeNight.item.meds.body":
    "SSRIs, MAOIs, antiretrovirals, and many other medications interact dangerously with MDMA, stimulants, and some psychedelics. Check interactions at TripSit or DrugsData before you go.",
  "harmReduction.section.beforeNight.item.tellSomeone.title":
    "Tell someone where you are",
  "harmReduction.section.beforeNight.item.tellSomeone.body":
    "Share your location with a trusted person who is not going out. Agree on a check-in time. This is not paranoia — it is standard care for yourself.",
  "harmReduction.section.beforeNight.item.budget.title": "Budget your doses",
  "harmReduction.section.beforeNight.item.budget.body":
    "Decide what you are taking before you go. It is much harder to make good decisions at 3am in a loud room. Write it down if it helps.",

  "harmReduction.section.duringNight.label": "At the party",
  "harmReduction.section.duringNight.title": "During the night",
  "harmReduction.section.duringNight.alert.head":
    "Water: not too little, not too much",
  "harmReduction.section.duringNight.alert.body":
    "MDMA can cause both dehydration and hyponatraemia (too much water). If dancing heavily: ~500ml per hour. If not dancing: ~250ml per hour. Sports drinks help with salt.",
  "harmReduction.section.duringNight.item.startLow.title":
    "Start low, wait longer than you think",
  "harmReduction.section.duringNight.item.startLow.body":
    "MDMA takes 45–90 minutes to peak. Cocaine's effect is shorter. Many hospitalisations happen because someone redosed before the first dose peaked. Wait at least 90 minutes.",
  "harmReduction.section.duringNight.item.breaks.title":
    "Take breaks from dancing",
  "harmReduction.section.duringNight.item.breaks.body":
    "Overheating is a genuine risk. Go outside, sit down, cool off regularly. If you feel very hot and stop sweating, get help immediately.",
  "harmReduction.section.duringNight.item.mixing.title": "Mixing substances",
  "harmReduction.section.duringNight.item.mixing.body":
    "Alcohol + MDMA: harder on your body, increases dehydration. MDMA + cocaine: significant cardiac stress. MDMA + ketamine: unpredictable. Never mix with opioids unless you have naloxone present.",
  "harmReduction.section.duringNight.item.lookAfter.title":
    "Look after each other",
  "harmReduction.section.duringNight.item.lookAfter.body":
    "If your friend seems confused, overly hot, or unresponsive to your voice — get them out of the crowd, give water, and if no improvement in 5 minutes, call 112.",

  "harmReduction.section.after.label": "The next day",
  "harmReduction.section.after.title": "Recovery",
  "harmReduction.section.after.item.comedown.title": "MDMA comedown is real",
  "harmReduction.section.after.item.comedown.body":
    "MDMA temporarily depletes serotonin. Days 2–4 after use can involve low mood, anxiety, and fatigue. This is neurological, not a reflection of your life. It passes. Eating, sleeping, and light activity help.",
  "harmReduction.section.after.item.sleepFood.title": "Sleep and food first",
  "harmReduction.section.after.item.sleepFood.body":
    "Before anything else. Your body has worked hard. The urge to redose to chase the good feeling almost always makes the comedown worse.",
  "harmReduction.section.after.item.worried.title":
    "If you feel worried about your use",
  "harmReduction.section.after.item.worried.body":
    "CAT (Centro de Atendimento a Toxicodependentes) offers free, confidential support — no judgment, no obligation. You do not have to be dependent to ask for support. Call 800 20 40 60.",
  "harmReduction.section.after.item.chemsex.title":
    "Chemsex and follow-up testing",
  "harmReduction.section.after.item.chemsex.body":
    "If you have had sex while using substances, consider an STI test within 72 hours if you want PEP (HIV post-exposure prophylaxis). Checkpoint and GAT both offer rapid testing. No appointment needed.",

  "harmReduction.section.sober.label": "Not using",
  "harmReduction.section.sober.title": "Sober at the party",
  "harmReduction.section.sober.item.belong.title": "You belong there",
  "harmReduction.section.sober.item.belong.body":
    "Queer nightlife can feel substance-centric. You are allowed to be there without drinking or using — and you do not owe anyone an explanation.",
  "harmReduction.section.sober.item.nonAlcoholic.title":
    "Non-alcoholic options",
  "harmReduction.section.sober.item.nonAlcoholic.body":
    "Most Lisbon venues serve water and soft drinks. Ask for sparkling water with lime if you do not want it to look like you are not drinking — it is no one else's business.",
  "harmReduction.section.sober.item.qpCommunity.title":
    "QueerPulse Sober community",
  "harmReduction.section.sober.item.qpCommunity.body":
    "The Sober page connects community members who are sober or sober-curious. You are not alone in wanting to be part of the night without the substances.",
  "harmReduction.section.sober.linkCta": "Visit the Sober page →",

  "harmReduction.section.services.label": "Support & services",
  "harmReduction.section.services.title": "Where to go",
  "harmReduction.section.services.item.gat.title": "GAT Lisboa",
  "harmReduction.section.services.item.gat.body":
    "Free HIV/STI testing, naloxone, condoms, harm reduction support. Rua de São Lázaro 58 · gat.org.pt",
  "harmReduction.section.services.item.checkpoint.title": "Checkpoint Lisboa",
  "harmReduction.section.services.item.checkpoint.body":
    "Rapid HIV and STI testing, PrEP support, walk-ins welcome. Rua do Crucifixo 100 · checkpointlx.com",
  "harmReduction.section.services.item.cat.title": "CAT (drug support)",
  "harmReduction.section.services.item.cat.body":
    "Free and confidential support for anyone concerned about their substance use. 800 20 40 60 · no appointment needed.",
  "harmReduction.section.services.item.kosmicare.title": "KOSMICARE",
  "harmReduction.section.services.item.kosmicare.body":
    "Psychedelic crisis support and integration. Active at Boom Festival and available for consultations year-round. kosmicare.org",
  "harmReduction.section.services.item.tripsit.title": "TripSit & DrugsData",
  "harmReduction.section.services.item.tripsit.body":
    "Drug interaction checker, dosage guides, and substance information. tripsit.me · drugsdata.org",

  "harmReduction.outro.title": "Take care of <em>each other.</em>",
  "harmReduction.outro.sub":
    "Harm reduction is a community practice. The more people who know this, the safer our nights are.",
  "harmReduction.outro.cta": "Sexual health resources",

  // ── SoberPage (+ SoberSections.tsx + soberPage.data.ts) ─────────────────
  // Mock VENUES (directory listing), VOICES (member testimonial quotes) and
  // EVENTS' organizer-authored fields (name/meta) stay English — content per
  // the scope rule, matching the LAWYERS/THERAPISTS directory precedent.
  // typeLabel is lifted to a shared per-EventType map since it's a repeated
  // chrome phrase, not organizer-specific.
  "sober.hero.backLink": "Wellbeing Hub",
  "sober.hero.eyebrow": "Sober & social",
  "sober.hero.title": "A full social life, without <em>alcohol.</em>",
  "sober.hero.lead":
    "Whether you're in recovery, sober-curious, on medication, or just don't drink — you shouldn't have to justify it. There's a vibrant queer social world that doesn't centre the bar.",
  "sober.reason.recovery": "In recovery",
  "sober.reason.soberCurious": "Sober-curious",
  "sober.reason.medication": "Medication",
  "sober.reason.health": "Health reasons",
  "sober.reason.religious": "Religious practice",
  "sober.reason.preference": "Personal preference",
  "sober.reason.justDont": "Just don't feel like it",

  "sober.honest.title": "The queer scene and <em>alcohol.</em>",
  "sober.honest.p1":
    "Queer social life has long been organised around bars — partly for historical reasons (bars were where it was safe to be visible), partly because nightlife is genuinely important to queer culture. That's real and worth holding.",
  "sober.honest.p2":
    "But queer people also have significantly higher rates of harmful substance use than the general population — and that's not incidental. It's connected to minority stress, limited safe social spaces, and a culture that sometimes makes sobriety feel like opting out.",
  "sober.honest.p3":
    "This space is for people who want community and joy without alcohol at the centre — for any reason, no explanation required.",
  "sober.stat.rate.n": "2–3×",
  "sober.stat.fewSpaces.n": "Very few",
  "sober.stat.changes.n": "This changes",
  "sober.stat.rate.label":
    "LGBTQ+ people are 2–3x more likely to experience alcohol dependency than the general population (Public Health England, 2017)",
  "sober.stat.fewSpaces.label":
    "queer social spaces are alcohol-free or actively sober-welcoming — despite the need",
  "sober.stat.changes.label":
    "when community spaces deliberately include sober options — and when sober people don't have to be invisible",

  "sober.gatherings.title": "Sober <em>gatherings.</em>",
  "sober.gatherings.lead":
    "Alcohol-free events, or events where alcohol is present but not the point. All QueerPulse gatherings are marked if they're alcohol-free.",
  "sober.gatherings.hostCta": "+ Host or attend a meeting",
  "sober.type.alcoholFree": "Alcohol-free",
  "sober.type.supportGroup": "Support group",
  "sober.rsvp.going": "Going",
  "sober.rsvp.cta": "RSVP",

  "sober.venues.title": "Sober-friendly <em>spaces.</em>",
  "sober.venues.lead":
    "Places where you can have a genuinely good time without alcohol — and where the staff won't make it weird. All are also on the Safe Spaces verified list.",
  "sober.venues.seeAllCta": "See all verified safe spaces →",

  "sober.voices.title": "In their <em>words.</em>",
  "sober.voices.lead":
    "Community members on what sober queer social life actually looks like.",

  "sober.recovery.title": "If you're navigating <em>recovery.</em>",
  "sober.recovery.body":
    "This isn't only about lifestyle preference. If you're in recovery — from alcohol, substances, or anything else — there are people here who understand. No advice unless you ask for it.",
  "sober.recovery.peerGroup.title": "Sober & Queer peer group",
  "sober.recovery.peerGroup.desc":
    "A private, moderated space within QueerPulse for people in recovery. Weekly online meeting, text channel, and occasional in-person gatherings. No particular programme — all approaches welcome.",
  "sober.recovery.peerGroup.linkLabel": "Join the group →",
  "sober.recovery.oneToOne.title": "One-to-one — talk to a peer",
  "sober.recovery.oneToOne.desc":
    "Request a conversation with a community member who has offered to talk to people navigating sobriety. No counsellors — just someone who's been through something similar.",
  "sober.recovery.oneToOne.linkLabel": "Find a peer →",
  "sober.recovery.therapists.title": "Queer-affirming therapists",
  "sober.recovery.therapists.desc":
    "The wellbeing directory includes therapists who specialise in addiction and queer identity — because those two things aren't separate.",
  "sober.recovery.therapists.linkLabel": "Find a therapist →",
  "sober.recovery.external.title": "External resources",
  "sober.recovery.external.desc":
    "APDES (harm reduction), AAPT (AA Portugal), SMART Recovery Portugal — for when community support isn't enough on its own.",
  "sober.recovery.external.linkLabel": "See resources →",

  "sober.outro.title": "You belong <em>here.</em>",
  "sober.outro.sub":
    "Sober, curious, or somewhere in between. The community is big enough for all of it.",
  "sober.outro.findSpacesCta": "Find safe spaces",
  "sober.outro.browseCommunitiesCta": "Browse communities",

  "sober.host.modalTitle": "Sober gatherings",
  "sober.host.success.hostTitle": "Gathering <em>submitted.</em>",
  "sober.host.success.attendTitle": "You're <em>in.</em>",
  "sober.host.success.hostSub":
    "A coordinator will confirm the alcohol-free listing and add it to the calendar within a day. You'll get the host checklist by email.",
  "sober.host.success.attendSub":
    "We've saved your spot. The private location and a gentle reminder will reach you the day before — nothing is shared publicly.",
  "sober.host.intro":
    "Start an alcohol-free meet-up, or join an existing peer meeting. Either way, you decide how visible you are.",
  "sober.host.modeLabel": "What would you like to do?",
  "sober.host.mode.host.name": "Host a meeting",
  "sober.host.mode.host.desc": "Propose a new alcohol-free gathering.",
  "sober.host.mode.attend.name": "Attend a meeting",
  "sober.host.mode.attend.desc": "Ask to join a peer support meeting.",
  "sober.host.nameLabel.host": "Your name",
  "sober.host.nameLabel.attend": "Name we should greet you by",
  "sober.host.namePlaceholder.host": "e.g. Mariana L.",
  "sober.host.namePlaceholder.attend": "First name or chosen name",
  "sober.host.detailLabel.host": "What and where",
  "sober.host.detailLabel.attend": "Which meeting (and anything to flag)",
  "sober.host.detailPlaceholder.host":
    "A morning walk, a quiet book club, a peer support circle… venue, day, rough time.",
  "sober.host.detailPlaceholder.attend":
    "e.g. the weekly Sober & Queer peer support — and whether you'd like a buddy to meet you there.",
  "sober.host.cancelCta": "Cancel",
  "sober.host.submitCta.host": "Submit gathering",
  "sober.host.submitCta.attend": "Request to attend",
};

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
  "crisis.jumpCta": "All crisis resources ↓",
  // crisisStrip.data.ts — real-world helpline names kept in English/as-is;
  // only the descriptive portions and hours are translated. Flag for native
  // review: crisis-line accuracy matters.
  "crisis.line.emergency.name": "Emergency (police · ambulance)",
  "crisis.line.emergency.hours": "Always · free",
  "crisis.line.sosVozAmiga.name": "SOS Voz Amiga",
  "crisis.line.sosVozAmiga.hours": "Daily 16h–24h",
  "crisis.line.ilga.name": "ILGA Portugal · LGBTQ+ support line",
  "crisis.line.ilga.hours": "Thu–Fri 20h–23h",

  // ── Shared: SuggestEditModal + SuggestEditTrigger (CNT-12: extended beyond
  // the Glossary to Legal, Trans Healthcare, Harm Reduction, Mental Health
  // and the Library grid — same generic `POST /intakes/suggest_edit`). ─────
  "suggestEdit.modalTitle": "Suggest an edit",
  "suggestEdit.pageTriggerCta": "Suggest an edit",
  "suggestEdit.success.title": "Suggestion <em>received.</em>",
  "suggestEdit.success.sub":
    "The editors look at suggestions weekly and discuss bigger changes at the monthly assembly. This is a living document precisely because of edits like yours.",
  "suggestEdit.comingSoon.title": "Edits aren't open <em>yet.</em>",
  "suggestEdit.comingSoon.sub":
    "Glossary suggestions aren't wired to the editors on the live site yet, so this wouldn't reach anyone. We'd rather be honest than fake a receipt. Check back soon.",
  "suggestEdit.body.intro":
    "Community-edited. If a definition feels incomplete or wrong, tell us which term and what you'd change.",
  // Shown when the modal is scoped to a fixed subject (a whole page).
  "suggestEdit.body.introSubject":
    "Something on this page out of date or wrong? Tell us what to fix.",
  // Shown when the modal offers a picker over a list (e.g. the guide library).
  "suggestEdit.body.introPicker":
    "Tell us which guide needs an update, and what you'd change.",
  "suggestEdit.form.termLabel": "Which term",
  "suggestEdit.form.subjectLabel": "What's this about?",
  "suggestEdit.form.subjectFixedLabel": "Suggesting an edit for",
  "suggestEdit.form.selectPlaceholder": "Select a term…",
  "suggestEdit.form.selectPlaceholderGeneric": "Choose what this is about…",
  "suggestEdit.form.newTermOption": "A term that's missing",
  "suggestEdit.form.otherOption": "Something else",
  "suggestEdit.form.changeLabel": "Suggested change",
  "suggestEdit.form.changePlaceholder":
    "What's off, and how you'd put it instead. Sources welcome but not required.",
  "suggestEdit.cancelCta": "Cancel",
  "suggestEdit.sendingLabel": "Sending…",
  "suggestEdit.sendCta": "Send suggestion",

  // ── LegalPage ───────────────────────────────────────────────────────────
  // Legal/safety information — flag for native review.
  "legal.meta.title":
    "LGBTQ+ legal rights in Portugal: work, housing and health",
  "legal.meta.description":
    "Know your rights at work, in housing, and in healthcare as an LGBTQ+ person in Portugal, plus a directory of vetted queer-friendly lawyers in Lisbon.",
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

  "legal.link.readGuide": "Read the full guide",
  "legal.link.getTemplate": "Get the template",
  "legal.link.findSupport": "Find support",
  "legal.link.transHubGuide": "Trans Hub guide",
  "legal.link.reportRefusal": "Report a refusal",
  "legal.link.prepGuide": "PrEP access guide",

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
  "legal.lawyers.requestConsultationCta": "Request consultation",

  "legal.outro.title": "You have <em>rights.</em>",
  "legal.outro.sub":
    "Knowledge is the first line of defence. Share these resources with anyone who needs them.",
  "legal.outro.requestInviteCta": "Request an invite",

  // ── CommunityPrivacyPage ────────────────────────────────────────────────
  "communityPrivacy.meta.title":
    "QueerPulse privacy: what's visible, and to whom",
  "communityPrivacy.meta.description":
    "How visibility works on QueerPulse by default — what shows on your public profile, inside the community, and to the moderation team, and how to change it.",
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
  "safety.meta.title": "How QueerPulse protects your privacy and safety",
  "safety.meta.description":
    "How visibility levels, vouching, and data protection work on QueerPulse — plus how to report a concern and what happens if you decide to leave.",
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
    "Your profile is visible only to the team and whoever vouched you in. You appear in the network count but not in browsing. The right setting if you're newly out, in a sensitive situation, or just not ready — no explanation required. We never share your membership outside QueerPulse without your explicit consent.",

  "safety.vouching.title": "The <em>vouching</em> model",
  "safety.vouching.body1":
    "Most people arrive vouched for by someone already in the network; a few are approved directly by our team. Either way, no one walks in as a stranger. This isn't gatekeeping — it's the mechanism that makes the room feel trustworthy. When someone vouches for you, they're saying: <b>I know this person, and I think they belong here.</b>",
  "safety.vouching.body2":
    "Vouchers aren't responsible for the people they vouch for, but they are accountable in a real way. If a vouched member behaves harmfully, their voucher is part of the conversation about what happens next.",

  "safety.dataUse.title": "What we <em>don't do</em> with your data",
  "safety.dataUse.body1":
    "We don't sell it. We don't train models on it. We don't share it with third parties. We don't run advertising. We're a small, member-supported network — your data is not the product.",
  "safety.dataUse.body2":
    "What we store: your name, email, profile content, and visibility setting. What we don't store: your location beyond the neighbourhood you choose to share, your browsing behaviour, or anything you tell us in private messages.",
  "safety.dataUse.body3":
    "You can request everything we hold about you, or ask us to delete your account, at any time. Send an email to <b>hello@queerpulse.com</b>.",

  "safety.report.title": "If something <em>feels wrong</em>",
  "safety.report.body1":
    "We take safety concerns seriously, and we respond to them ourselves — not an automated system. If someone has made you feel unsafe, if a message crossed a line, if something doesn't sit right, tell us.",
  "safety.report.body2":
    "We handle every report with discretion. You will not be identified to the person you're reporting unless you choose to be. We will follow up.",
  "safety.report.boxTitle": "Report a concern",
  "safety.report.boxBody":
    "Use the report form — it reaches the team directly, and we aim to respond within 24 hours.",
  "safety.report.formCta": "Open the report form",

  "safety.leaving.title": "Leaving the <em>network</em>",
  "safety.leaving.body1":
    "You can leave at any time. When you do, your profile is removed from the directory immediately. Any messages you've sent remain with their recipients — we can't unsend them. Board posts are removed. Your data is deleted within 30 days unless you ask us to keep it for a specific reason.",
  "safety.leaving.body2":
    'There is no dark pattern here. No "are you sure?" loop. No 30-day cooling-off period before deletion. You leave, you\'re gone, and we wish you well.',

  "safety.outro.title": "Safety is a feature, <em>not a footnote.</em>",
  "safety.outro.sub": "Any questions about how the network works? Write to us.",
  "safety.outro.cta": "hello@queerpulse.com",

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
  "queer101.meta.title": "Queer 101: a no-pressure LGBTQ+ starter guide",
  "queer101.meta.description":
    "For anyone newly exploring their identity — common questions answered, key terms explained, and low-pressure ways to talk to someone, no account required.",
  "queer101.hero.backLink": "Resource Library",
  "queer101.hero.label": "Queer 101",
  "queer101.hero.title": "Start here, wherever <em>here</em> is.",
  "queer101.hero.lead":
    "For people newly exploring their identity — or just looking for language that fits. You don't need to have anything figured out. This is not a test.",
  "queer101.hero.reassure.noAccount": "No account required to read any of this",
  "queer101.hero.reassure.private":
    "Nothing you read here is shared with anyone",
  "queer101.hero.reassure.leaveReturn":
    "You can leave and come back whenever you want",

  "queer101.faq.title": "Common <em>questions.</em>",
  "queer101.faq.sub":
    "Honest answers, without assumptions about where you are right now.",
  "queer101.faq.q1": "How do I know if I'm queer?",
  "queer101.faq.a1":
    'There\'s no test and no threshold. Some people feel certain early; others figure it out over years, or never settle on a label at all — and all of that is fine. A useful question isn\'t "am I queer?" but "what feels true to me right now?" You don\'t owe anyone an answer, including yourself.',
  "queer101.faq.q2": "Do I need a label?",
  "queer101.faq.a2":
    'No. Labels can be useful — they give you language, community, and a way to explain yourself when you want to. But they can also feel like a cage if they don\'t quite fit. Many people use "queer" as a broad, flexible umbrella. Others prefer specificity. Others use nothing. All of it is valid, and it can change.',
  "queer101.faq.q3":
    "What's the difference between gender identity and sexual orientation?",
  "queer101.faq.a3":
    "Gender identity is about who you are — your internal sense of yourself as a man, woman, non-binary person, or something else. Sexual orientation is about who you're attracted to — romantically, sexually, or both. They're independent: a trans woman can be straight, lesbian, bisexual, or anything else. One doesn't determine the other.",
  "queer101.faq.q4":
    "I've only ever had relationships with one gender. Does that make me straight?",
  "queer101.faq.a4":
    "Not necessarily. Identity and experience aren't the same thing. Many bisexual and queer people have only dated one gender for long stretches of their lives — circumstances, preference, or chance all play a role. What matters is how you feel, not a list of your past relationships.",
  "queer101.faq.q5": "Is it okay to be questioning? What if I'm never sure?",
  "queer101.faq.a5":
    '"Questioning" is a valid identity in its own right — not just a waiting room. Some people find clarity; others find that the question itself stops mattering over time. There\'s no deadline. You are not broken for not knowing.',
  "queer101.faq.q6":
    "I came to Lisbon as an adult and I'm only exploring this now. Is that unusual?",
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
  "queer101.talk.peerSupport.cta": "Join the group",
  "queer101.talk.oneToOne.title": "One-to-one conversation",
  "queer101.talk.oneToOne.desc":
    "Request a conversation with a community member who's offered to talk to people newly exploring their identity.",
  "queer101.talk.oneToOne.cta": "Find a conversation partner",
  "queer101.talk.therapy.title": "Queer-affirming therapy",
  "queer101.talk.therapy.desc":
    "A directory of therapists in Lisbon who specialise in LGBTQ+ clients, compiled and reviewed by the community.",
  "queer101.talk.therapy.cta": "Find a therapist",
  "queer101.talk.askAnon.title": "Ask anonymously",
  "queer101.talk.askAnon.desc":
    "Submit a question anonymously to the community forum. Answered by real people, not bots.",
  "queer101.talk.askAnon.cta": "Ask the forum",

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
  "glossary.meta.title": "LGBTQ+ glossary: queer terms explained (EN/PT)",
  "glossary.meta.description":
    "A living glossary of LGBTQ+ terms — identity, healthcare, and Lisbon-specific words — in English and Portuguese, kept current and open to community edits.",
  "glossary.backLink": "Resource Library",
  "glossary.hero.title": "A working <em>glossary.</em>",
  "glossary.hero.dek":
    "Words used here — across the platform, in the magazine, at gatherings. <b>Definitions are working drafts.</b> Where a term is contested, we say so. Where it's Lisbon-specific, we mark it. <em>Suggest edits at the bottom; the editors look at them weekly.</em>",
  "glossary.foot.body":
    "This is a working document. Suggestions are read by the editorial team weekly and discussed at the monthly assembly. <em>We will get things wrong; we'd rather get them wrong publicly and fix them.</em>",

  // ── PronounsGuidePage (+ PronounsGuideSections.tsx + pronounsGuide.data.tsx) ──
  // Trans-specific guidance — flag for native review.
  "pronounsGuide.meta.title":
    "Pronouns and chosen name on QueerPulse: a practical guide",
  "pronounsGuide.meta.description":
    "How QueerPulse handles chosen names and pronouns across the platform, plus answers on deadnames, name changes, privacy, and legal name data.",

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

  "pronounsGuide.outro.title":
    "Questions about <em>your identity settings?</em>",
  "pronounsGuide.outro.sub":
    "Write to us. We'll respond within two working days.",
  "pronounsGuide.outro.cta": "Contact us",

  "pronounsGuide.table.head.field": "Field",
  "pronounsGuide.table.head.use": "What it's used for",
  "pronounsGuide.table.head.who": "Who sees it",
  "pronounsGuide.table.displayName.field": "Display name",
  "pronounsGuide.table.displayName.use":
    "Your name on posts, profile, messages",
  "pronounsGuide.table.displayName.who": "All members",
  "pronounsGuide.table.chosenName.field": "Chosen name",
  "pronounsGuide.table.chosenName.use":
    "Emails from QueerPulse, internal comms",
  "pronounsGuide.table.chosenName.who": "Only you",
  "pronounsGuide.table.username.field": "Username",
  "pronounsGuide.table.username.use": "URL handle (queerpulse.com/@username)",
  "pronounsGuide.table.username.who": "Changeable once/year",
  "pronounsGuide.table.legalName.field": "Legal name",
  "pronounsGuide.table.legalName.use":
    "Only if you've provided it for ticketing",
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
    "Contact us immediately at <a>hello@queerpulse.com</a> and we'll remove or update it as a priority. This includes magazine bylines, old forum posts attributed to your previous name, and any email archives we hold.",
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
  "mentalHealth.meta.title": "Queer-affirming mental health support in Lisbon",
  "mentalHealth.meta.description":
    "Queer-affirming therapists in Lisbon, crisis lines for immediate support, and a practical guide to accessing mental health care through the SNS.",
  "mentalHealth.hero.cat": "Mental Health",
  "mentalHealth.hero.title": "You don't have to be <em>okay.</em>",
  "mentalHealth.hero.sub":
    "Queer-affirming therapists, honest information about accessing mental health support in Lisbon, crisis resources, and a community that understands what you're carrying — because we're carrying it too.",

  "mentalHealth.outro.title": "Asking for help is <em>not small.</em>",
  "mentalHealth.outro.sub":
    "It's one of the harder things. The community is here.",
  "mentalHealth.outro.cta": "Talk to someone",

  "mentalHealth.therapists.title":
    "Queer-affirming <em>therapists in Lisbon</em>",
  "mentalHealth.therapists.lead":
    'Reviewed and recommended by community members. Every therapist here has been verified as genuinely queer-affirming — not just "welcoming" but experienced with queer lives, identities, and the specific pressures of being queer and an expat in Lisbon.',
  "mentalHealth.therapists.filterLabel": "Filter",
  "mentalHealth.therapists.allLanguages": "All languages",
  "mentalHealth.therapists.accepting": "Accepting",
  "mentalHealth.therapists.waitlist": "Waitlist",
  "mentalHealth.therapists.viewProfileAriaLabel": "View {name}'s profile",
  "mentalHealth.therapists.viewProfileCta": "View profile",
  "mentalHealth.therapists.comingSoon.badge": "Coming soon",
  "mentalHealth.therapists.comingSoon.title":
    "The directory is <em>almost here.</em>",
  "mentalHealth.therapists.comingSoon.body":
    "We're verifying queer-affirming therapists in Lisbon before they go live here, so every profile is one you can trust. For now it's resting. Turn on <b>{toggleName}</b> to explore the demo.",

  "mentalHealth.experiences.title": "Things the community <em>has felt</em>",
  "mentalHealth.experiences.lead":
    "Being a queer expat in Lisbon comes with specific pressures. Naming them isn't complaining — it's the start of dealing with them.",
  "mentalHealth.experience.newCommunity.title":
    "Starting over in a new community",
  "mentalHealth.experience.newCommunity.text":
    "Losing your queer social network when you move is a genuine grief. Building a new one takes time and feels unnatural at first. The people who've been here longest remember it — it does get easier, but the early months are hard and it's okay to say so.",
  "mentalHealth.experience.visibility.title":
    "Navigating visibility in a new culture",
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
    "Sometimes what helps is someone who's been where you are. There's a quiet peer support space in the Forum for members going through a hard time. No professional facilitation, no fixing, just people who understand, listening. Prefer one to one? Ask to talk with a peer mentor.",
  "mentalHealth.sns.peer.joinCta": "Open the space",
  "mentalHealth.sns.peer.mentorCta": "Find a peer mentor",

  // ── WellbeingPage (+ WellbeingSections.tsx + wellbeing.data.ts) ──────────
  "wellbeing.meta.title":
    "LGBTQ+ wellbeing in Lisbon: therapists, peers, crisis help",
  "wellbeing.meta.description":
    "Wellbeing resources built by and for the community — a vetted therapist directory, peer support, crisis contacts, and harm reduction, all in one place.",

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
  "wellbeing.therapists.applyPrompt": "Are you a queer-affirming therapist?",
  "wellbeing.therapists.applyCta": "Apply to be listed",

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

  // ── TransHubPage ─────────────────────────────────────────────────────────
  // Trans healthcare/legal navigation guidance for Portugal — flag for native
  // review. Real-world proper nouns (SNS, Hospital de Santa Maria, Hospital
  // Curry Cabral, ILGA Portugal, Rede ex aequo, Cartão de Cidadão, NIF, Law
  // 38/2018) stay untranslated inside the catalog values themselves.
  "transHub.meta.title":
    "Trans & non-binary hub: healthcare, legal, and community",
  "transHub.meta.description":
    "A dedicated hub for trans and non-binary members — healthcare navigation, legal and admin guides, peer support, and community, built specifically for you.",

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
  "transHub.resources.openCta": "Open",
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
  // surrounding page chrome below (meta, hero, tab labels, section headers,
  // sidebar, outro) is translated.
  "transHealthcare.meta.title":
    "Trans healthcare in Lisbon: clinics, name changes and where to start",
  "transHealthcare.meta.description":
    "A practical guide to trans healthcare in Portugal — SNS and private HRT pathways, legal name and gender marker changes, and affirming clinicians in Lisbon.",

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
  "transHealthcare.sidebar.solidarityCta": "Solidarity Pricing Registry",
  "transHealthcare.sidebar.solidarityRole":
    "Trans-affirming GPs, psychiatrists",
  "transHealthcare.sidebar.legalCta": "Legal Resources",
  "transHealthcare.sidebar.legalRole": "Name change documents",
  "transHealthcare.sidebar.mentalHealthCta": "Mental Health",
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
  "harmReduction.meta.title":
    "Harm reduction in Lisbon: safer partying, no judgment",
  "harmReduction.meta.description":
    "Non-judgmental harm-reduction guidance for nightlife in Lisbon — naloxone and overdose response, safer use, comedowns, chemsex, and where to get tested.",
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
  "harmReduction.section.sober.linkCta": "Visit the Sober page",

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
  "sober.meta.title":
    "Sober and queer in Lisbon: alcohol-free events and venues",
  "sober.meta.description":
    "A full queer social life without alcohol — sober and alcohol-free events in Lisbon, venues that don't centre the bar, and peer support for recovery or sober-curious members.",

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
  "sober.venues.seeAllCta": "See all verified safe spaces",

  "sober.voices.title": "In their <em>words.</em>",
  "sober.voices.lead":
    "Community members on what sober queer social life actually looks like.",

  "sober.recovery.title": "If you're navigating <em>recovery.</em>",
  "sober.recovery.body":
    "This isn't only about lifestyle preference. If you're in recovery — from alcohol, substances, or anything else — there are people here who understand. No advice unless you ask for it.",
  "sober.recovery.peerGroup.title": "Sober & Queer peer group",
  "sober.recovery.peerGroup.desc":
    "A private, moderated space within QueerPulse for people in recovery. Weekly online meeting, text channel, and occasional in-person gatherings. No particular programme — all approaches welcome.",
  "sober.recovery.peerGroup.linkLabel": "Join the group",
  "sober.recovery.oneToOne.title": "One-to-one — talk to a peer",
  "sober.recovery.oneToOne.desc":
    "Request a conversation with a community member who has offered to talk to people navigating sobriety. No counsellors — just someone who's been through something similar.",
  "sober.recovery.oneToOne.linkLabel": "Find a peer",
  "sober.recovery.therapists.title": "Queer-affirming therapists",
  "sober.recovery.therapists.desc":
    "The wellbeing directory includes therapists who specialise in addiction and queer identity — because those two things aren't separate.",
  "sober.recovery.therapists.linkLabel": "Find a therapist",
  "sober.recovery.external.title": "External resources",
  "sober.recovery.external.desc":
    "APDES (harm reduction), AAPT (AA Portugal), SMART Recovery Portugal — for when community support isn't enough on its own.",
  "sober.recovery.external.linkLabel": "See resources",

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
  "sober.host.comingSoon.title": "Sober meet-ups are <em>coming.</em>",
  "sober.host.comingSoon.sub":
    "Hosting and RSVP aren't connected on the live site yet, so nothing you enter here would reach a coordinator. Rather than fake it, we'll say it plainly — this opens soon.",
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

  // ── Guide library grid — shared by marketing/ResourceLibraryPage (the
  // canonical, nav-linked "/resources", CNT-11's consolidated real,
  // backend-driven surface) and its card/search/filter chrome. ──────────────
  // GUIDES entries (title/desc/catLabel/meta) are demo content mirroring the
  // live GET /resources feed — stay English, see resources.adapters.ts.
  // POPULAR search shortcuts double as the literal query string matched
  // against that English guide content, so they stay English in both
  // languages too (translating them would silently break the search).
  "library.search.placeholder": "Search guides — pronouns, PrEP, tenancy…",
  "library.filterAria": "Filter guides by topic",
  "library.category.all": "All guides",
  "library.category.housing": "Housing",
  "library.category.health": "Health",
  "library.category.legal": "Legal",
  "library.category.finance": "Finance",
  "library.category.trans": "Trans life",
  "library.empty": "No guides match that yet — try a different search.",
  "library.readGuideCta": "Read the guide",
  "library.loadingMore": "Loading more guides…",
  "library.loadMoreCta": "Load more guides",
  "library.popularLabel": "Most read:",
  // CNT-13 freshness signal, shown on every guide card.
  "library.card.verifiedOn": "Verified {date}",
  "library.card.notYetVerified": "Not yet verified",

  // ── SexualHealthPage (+ SexualHealthTabs.tsx + sexualHealth.data.ts) ────
  // Flagged for native review — sexual-health/HIV/PrEP information. CLINICS
  // entries (desc/details/hours/meta), PREP_STEPS, PREP_FAQ, HIV_INFO, and
  // GUIDES bodies are dense clinical/procedural content (dosing protocols,
  // drug names, epidemiological stats, crisis contact numbers) — left
  // English rather than risk an imprecise medical translation. Only the
  // structural chrome around them (headings, tab/filter labels, buttons,
  // empty states, generic CTAs) is translated here; see the sweep report.
  "sexualHealth.meta.title":
    "Sexual health in Lisbon: testing, PrEP and HIV resources",
  "sexualHealth.meta.description":
    "A practical guide to sexual health in Lisbon — where to get tested, how to access free PrEP through the SNS, HIV resources and U=U, and a community-reviewed clinic directory.",

  "sexualHealth.hero.cat": "Sexual health",
  "sexualHealth.hero.title": "Your health, on your <em>own terms.</em>",
  "sexualHealth.hero.lead":
    "Direct, queer-specific, non-judgmental. Testing, PrEP, HIV resources, and a community-reviewed provider directory — all in one place.",
  "sexualHealth.outro.title": "Your health <em>matters.</em>",
  "sexualHealth.outro.sub":
    "Questions, concerns, or just not sure where to start — the community is here.",
  "sexualHealth.outro.wellbeingCta": "Wellbeing resources",
  "sexualHealth.outro.peerSupportCta": "Find peer support",

  "sexualHealth.tab.testing": "Testing & screening",
  "sexualHealth.tab.prep": "PrEP in Portugal",
  "sexualHealth.tab.hiv": "HIV resources",
  "sexualHealth.tab.guides": "Guides & Q&A",

  "sexualHealth.testing.title": "Where to get <em>tested</em> in Lisbon.",
  "sexualHealth.testing.lead":
    "Community-reviewed clinics and services. Last updated by members June 2025.",
  "sexualHealth.testing.filter.all": "All",
  "sexualHealth.testing.filter.public": "Free / SNS",
  "sexualHealth.testing.filter.ngo": "NGO",
  "sexualHealth.testing.filter.pharmacy": "Pharmacy",
  "sexualHealth.testing.filter.private": "Private",
  "sexualHealth.testing.filterAria": "Filter clinics by type",
  "sexualHealth.testing.empty.title": "No clinics of that type listed yet",
  "sexualHealth.testing.empty.description":
    "There are still plenty of welcoming places to get tested. Clear the filter to see every community-reviewed option.",
  "sexualHealth.testing.empty.clearCta": "Clear filters",
  "sexualHealth.testing.clinicCard.verifiedBadge": "Community verified",
  "sexualHealth.testing.clinicCard.viewDetailsCta": "View details",
  "sexualHealth.testing.clinicCard.hideDetailsCta": "Hide details",
  "sexualHealth.testing.clinicCard.testsLabel": "What they test",
  "sexualHealth.testing.clinicCard.bringLabel": "What to bring",
  "sexualHealth.testing.clinicCard.accessLabel": "Access",
  "sexualHealth.testing.clinicCard.noteLabel": "Good to know",
  "sexualHealth.testing.nominate.doneTitle": "Thank you — <em>noted.</em>",
  "sexualHealth.testing.nominate.doneBody":
    "We'll check it out and review it with the community before it goes live. The board stays trustworthy because members like you keep it current.",
  "sexualHealth.testing.nominate.anotherCta": "Nominate another",
  "sexualHealth.testing.nominate.title": "Know a service we should add?",
  "sexualHealth.testing.nominate.body":
    "Nominate a clinic or service for community review. We verify every listing before it goes live.",
  "sexualHealth.testing.nominate.placeholder":
    "Clinic name, location, and why you'd recommend it…",
  "sexualHealth.testing.nominate.submitCta": "Submit nomination",

  "sexualHealth.prep.title": "PrEP in <em>Portugal.</em>",
  "sexualHealth.prep.lead":
    "PrEP (pre-exposure prophylaxis) is available free through the SNS for eligible people. When taken correctly it is over 99% effective at preventing HIV. Here's how to access it.",
  "sexualHealth.prep.tip":
    "<strong>Portugal was one of the first European countries to make PrEP free.</strong> You don't need private insurance. The process involves a simple eligibility check, blood tests, and a prescription — the whole pathway takes about 4–6 weeks the first time.",
  "sexualHealth.prep.faqTitle": "Common <em>questions.</em>",

  "sexualHealth.hiv.title": "HIV — what you need to <em>know.</em>",
  "sexualHealth.hiv.lead":
    "Honest, current information. HIV is a manageable condition. With treatment, people with HIV live full, long lives and can't pass the virus on.",
  "sexualHealth.hiv.uu.title": "Undetectable = <em>Untransmittable.</em>",
  "sexualHealth.hiv.uu.body":
    "U=U is one of the most important facts in sexual health. People living with HIV who are on effective treatment and have an undetectable viral load cannot sexually transmit HIV to their partners. This is scientifically established and endorsed by every major health authority.",
  "sexualHealth.hiv.uu.stat.uu.label":
    "Undetectable = Untransmittable. Confirmed by the CDC, WHO, and 400+ health organisations globally.",
  "sexualHealth.hiv.uu.stat.rate.label":
    "of people on treatment in Portugal achieve an undetectable viral load within 6 months.",
  "sexualHealth.hiv.uu.stat.free.value": "Free",
  "sexualHealth.hiv.uu.stat.free.label":
    "HIV treatment (antiretrovirals) is free for all residents through the SNS.",
  "sexualHealth.hiv.findServicesCta": "Find HIV support services",

  "sexualHealth.guides.title": "Guides & <em>questions.</em>",
  "sexualHealth.guides.lead":
    "Short guides and a place to ask anything anonymously. Answered by community members with relevant experience — not bots.",
  "sexualHealth.guides.ask.doneTitle": "Your question is <em>in.</em>",
  "sexualHealth.guides.ask.doneBody":
    "A member with relevant experience will answer it — no name, no account, nothing linked back to you. Check back here in a day or two.",
  "sexualHealth.guides.ask.anotherCta": "Ask another",
  "sexualHealth.guides.ask.title": "Ask anything — anonymously.",
  "sexualHealth.guides.ask.body":
    "Submit a question to the community. Answered by members with relevant knowledge. Nothing is shared or linked to your account.",
  "sexualHealth.guides.ask.placeholder":
    "Your question — no detail is too small or too embarrassing…",
  "sexualHealth.guides.ask.anonymousNote":
    "Completely anonymous. No account required.",
  "sexualHealth.guides.ask.submitCta": "Submit question",

  // ── MicroGrantsPage (+ MicroGrantsSections.tsx + microGrants.data.ts) ───
  // CURRENT/PAST grant recipient names/descriptions and PANEL reviewers'
  // names/bios are curated listings (parallel to the wellbeing THERAPISTS
  // precedent) — left English as content. Everything describing the
  // platform's own grant *process* (how it works, criteria, rules, the
  // application-wizard copy) is chrome and translated below.
  "microGrants.hero.backLink": "Grants",
  "microGrants.hero.eyebrow": "Community fund",
  "microGrants.hero.title.line1": "Small money.",
  "microGrants.hero.title.line2": "<em>Real impact.</em>",
  "microGrants.hero.lead":
    "Micro-grants of €200–2000 for queer community projects in Lisbon. Funded by members, allocated by members, reported back to members. No gatekeepers.",
  "microGrants.hero.stat.awarded.label": "awarded to date",
  "microGrants.hero.stat.projects.label": "projects funded",
  "microGrants.hero.stat.pot.label": "in this quarter's pot",
  "microGrants.hero.fundBar.roundLabel": "Q2 2026 funding round",
  "microGrants.hero.fundBar.goalLabel": "goal",

  "microGrants.how.01.title": "Members contribute",
  "microGrants.how.01.body":
    "Members who can afford to contribute add to the quarterly pot — any amount, from €5 upwards. No pressure, no minimum.",
  "microGrants.how.02.title": "Projects apply",
  "microGrants.how.02.body":
    "Any QueerPulse member can apply for a grant. One page: what the project is, how much you need, what it will do.",
  "microGrants.how.03.title": "Community decides",
  "microGrants.how.03.body":
    "A rotating panel of 5 members reviews applications. Decisions published in full with reasoning. No appeals — but the next round is always open.",
  "microGrants.how.04.title": "Projects report back",
  "microGrants.how.04.body":
    "Recipients share a short update at 3 months. What happened, what changed, what they spent. Everything published in the magazine.",

  "microGrants.round.statusLabel": "Applications open · Q2 2026",
  "microGrants.round.title": "This round: <em>Making things together.</em>",
  "microGrants.round.desc":
    "This quarter we are prioritising projects that create something — events, publications, spaces, tools — that the wider queer community in Lisbon can access and benefit from. Solo projects and collaborations both welcome.",
  "microGrants.round.meta.amountLabel": "per project",
  "microGrants.round.meta.deadlineLabel": "application deadline",
  "microGrants.round.meta.decisionLabel": "to decision",
  "microGrants.round.meta.deadlineValue": "30 June 2026",
  "microGrants.round.meta.decisionValue": "3 – 4 weeks",
  "microGrants.round.criteriaTitle": "Criteria",
  "microGrants.criteria.member": "You are a QueerPulse member in good standing",
  "microGrants.criteria.benefit":
    "The project benefits the queer community in Lisbon — not just you personally",
  "microGrants.criteria.timeline":
    "You can deliver it within 3 months of receiving the grant",
  "microGrants.criteria.update":
    "You are willing to share a brief public update on what happened",
  "microGrants.criteria.impact":
    "The money will genuinely change what is possible — not just make it faster",
  "microGrants.round.applyCta": "Apply for this round",

  "microGrants.section.currentTitle": "Current <em>recipients</em>",
  "microGrants.section.pastTitle": "Past <em>projects</em>",

  "microGrants.sidebar.rulesTitle": "Grant rules",
  "microGrants.rule.oneGrant.title": "One grant per member",
  "microGrants.rule.oneGrant.body":
    "Per calendar year. Collaborative projects can apply as a group.",
  "microGrants.rule.maximum.title": "Maximum €2,000",
  "microGrants.rule.maximum.body":
    "For larger projects, we encourage applying across multiple rounds or pairing with the Barter exchange.",
  "microGrants.rule.benefit.title": "Community benefit required",
  "microGrants.rule.benefit.body":
    "Must benefit queer people in Lisbon beyond the applicant. Personal projects are not eligible.",
  "microGrants.rule.reporting.title": "Public reporting",
  "microGrants.rule.reporting.body":
    "A brief update at 3 months — published here and in the magazine. No repayment, but accountability matters.",
  "microGrants.rule.noPolitics.title": "No political campaigns",
  "microGrants.rule.noPolitics.body":
    "We fund community projects, not election or party-political activity.",
  "microGrants.sidebar.panelTitle": "Review panel — Q2 2026",
  "microGrants.sidebar.joinPanelCta": "Join the review panel",

  "microGrants.contribute.title": "Add to the <em>pot.</em>",
  "microGrants.contribute.body":
    "The fund is sustained by members who contribute what they can. There is no minimum. Every amount makes the next round possible.",
  "microGrants.contribute.otherAmount": "Other",
  "microGrants.contribute.cta": "Contribute to the fund",
  "microGrants.contribute.note":
    "Contributions are voluntary. Members only. Not tax-deductible under current Portuguese law.",

  "microGrants.outro.title": "The community <em>funds itself.</em>",
  "microGrants.outro.sub":
    "Every project here was made possible by members contributing what they could spare. The fund grows with the network.",
  "microGrants.outro.joinCta": "Join the network",

  // ── Grant application wizard (GrantApplicationModal + step components) ──
  "microGrants.apply.category.creative.name": "Creative & art",
  "microGrants.apply.category.creative.sub":
    "Exhibitions, prints, performances",
  "microGrants.apply.category.education.name": "Education & knowledge",
  "microGrants.apply.category.education.sub": "Workshops, guides, resources",
  "microGrants.apply.category.health.name": "Health & wellbeing",
  "microGrants.apply.category.health.sub": "Mental health, harm reduction",
  "microGrants.apply.category.legal.name": "Legal & advocacy",
  "microGrants.apply.category.legal.sub": "Rights, accompaniment",
  "microGrants.apply.category.community.name": "Community & space",
  "microGrants.apply.category.community.sub": "Gatherings, mutual aid",
  "microGrants.apply.category.other.name": "Other",
  "microGrants.apply.category.other.sub": "Something that doesn't fit neatly",

  "microGrants.apply.commitment.update":
    "I will share a brief public update at 3 months — what happened, what was spent, what changed.",
  "microGrants.apply.commitment.benefit":
    "This project genuinely benefits the queer community in Lisbon, not just me personally.",
  "microGrants.apply.commitment.timeline":
    "I can deliver this within 3 months of receiving the grant.",

  "microGrants.apply.stepLabel.category": "Choose a category",
  "microGrants.apply.stepLabel.project": "Project details",
  "microGrants.apply.stepLabel.budget": "Budget breakdown",
  "microGrants.apply.stepLabel.about": "About you",
  "microGrants.apply.stepLabel.review": "Review & submit",

  "microGrants.apply.modalAriaLabel": "Apply — Q2 2026 round",
  "microGrants.apply.modalTitle": "Apply — Q2 2026 round",
  "microGrants.apply.stepIndicator": "Step {step} of {total} — {stepLabel}",
  "microGrants.apply.cancelCta": "Cancel",
  "microGrants.apply.backCta": "Back",
  "microGrants.apply.continueCta": "Continue",
  "microGrants.apply.submitCta": "Submit application",
  "microGrants.apply.success.title": "Application <em>submitted.</em>",
  "microGrants.apply.success.sub":
    "We'll confirm receipt by email within 24 hours. The review panel meets in mid-July. You'll hear back before 31 July regardless of outcome.",
  "microGrants.apply.success.closeCta": "Close",
  "microGrants.apply.comingSoon.title": "Applications open <em>soon.</em>",
  "microGrants.apply.comingSoon.sub":
    "Grant intake isn't wired up on the live site yet, so nothing you'd enter here would reach the review panel. We'd rather say that plainly than fake a receipt. The Q2 round opens soon — check back, or reach the collective if it's urgent.",

  "microGrants.apply.category.stepTitle": "What kind of <em>project?</em>",
  "microGrants.apply.category.stepSub":
    "Choose the category that best describes your project. This helps the review panel read applications together.",

  "microGrants.apply.project.stepTitle": "Tell us about <em>the project.</em>",
  "microGrants.apply.project.stepSub":
    "Be specific and honest. The review panel reads everything. Plain language beats formal language every time.",
  "microGrants.apply.project.nameLabel": "Project name",
  "microGrants.apply.project.namePlaceholder": "A short, clear title",
  "microGrants.apply.project.whatLabel": "What will you make or do?",
  "microGrants.apply.project.charCounter": "{current} / {max}",
  "microGrants.apply.project.whatPlaceholder":
    "Describe the project in plain terms. What will exist or happen that doesn't exist now?",
  "microGrants.apply.project.beneficiaryLabel": "Who benefits, and how?",
  "microGrants.apply.project.beneficiaryPlaceholder":
    "Who in the queer community will this reach? How will it make a difference to them?",
  "microGrants.apply.project.timelineLabel": "Timeline",
  "microGrants.apply.project.timelinePlaceholder": "e.g. August–October 2026",
  "microGrants.apply.project.stageLabel": "Project stage",
  "microGrants.apply.project.stage.select": "Select…",
  "microGrants.apply.project.stage.idea": "Idea — not yet started",
  "microGrants.apply.project.stage.development": "In development",
  "microGrants.apply.project.stage.ready": "Ready to go — just needs funding",
  "microGrants.apply.project.stage.ongoing": "Ongoing — this would expand it",

  "microGrants.apply.budget.stepTitle": "How will you <em>spend it?</em>",
  "microGrants.apply.budget.stepSub":
    "Break your budget into line items. Be realistic — the panel prefers honest estimates to optimistic ones. Maximum €2,000 this round.",
  "microGrants.apply.budget.itemPlaceholder": "Line item (e.g. Print costs)",
  "microGrants.apply.budget.amountLabel": "Amount in euros",
  "microGrants.apply.budget.addItemCta": "+ Add line item",
  "microGrants.apply.budget.totalLabel": "Total requested",
  "microGrants.apply.budget.hint":
    "If you're also contributing your own time or money, mention it below — it strengthens the application.",
  "microGrants.apply.budget.otherContributionsLabel":
    "Other contributions (optional)",
  "microGrants.apply.budget.otherContributionsPlaceholder":
    "e.g. 20 hours of my own time, use of a friend's studio",

  "microGrants.apply.about.stepTitle": "About <em>you.</em>",
  "microGrants.apply.about.stepSub":
    "We know who you are as a member, but tell us a little about your relationship to this project and the community it serves.",
  "microGrants.apply.about.nameLabel":
    "Your name (as you'd like it on the grant record)",
  "microGrants.apply.about.namePlaceholder":
    "Chosen name or full name — your call",
  "microGrants.apply.about.connectionLabel": "Your connection to this project",
  "microGrants.apply.about.connectionPlaceholder":
    "Why are you the right person to do this? What is your relationship to the community it serves?",
  "microGrants.apply.about.priorGrantLabel":
    "Have you received a QueerPulse grant before?",
  "microGrants.apply.about.priorGrant.select": "Select…",
  "microGrants.apply.about.priorGrant.first":
    "No, this is my first application",
  "microGrants.apply.about.priorGrant.reported":
    "Yes — and I submitted a report",
  "microGrants.apply.about.priorGrant.pending":
    "Yes — report is pending (within 3 months)",
  "microGrants.apply.about.commitmentsLabel": "Commitments",

  "microGrants.apply.review.stepTitle": "Review your <em>application.</em>",
  "microGrants.apply.review.stepSub":
    "Check everything looks right. You can go back to edit any section.",
  "microGrants.apply.review.categoryLabel": "Category",
  "microGrants.apply.review.projectLabel": "Project",
  "microGrants.apply.review.whatLabel": "What you'll make / do",
  "microGrants.apply.review.budgetLabel": "Budget requested",
  "microGrants.apply.review.applicantLabel": "Applicant",
  "microGrants.apply.review.deadlineLabel": "Deadline",
  "microGrants.apply.review.deadlineValue":
    "<strong>30 June 2026</strong> — decisions in 3–4 weeks",

  // ── PanelSignupModal ─────────────────────────────────────────────────────
  "microGrants.panel.modalTitle": "Join the review panel",
  "microGrants.panel.success.title": "You're on the <em>list.</em>",
  "microGrants.panel.success.sub":
    "Thank you. The panel coordinator reviews new volunteers ahead of each quarter and will be in touch before the Q3 round opens. Panels rotate so the work stays shared.",
  "microGrants.panel.comingSoon.title": "Not taking sign-ups <em>yet.</em>",
  "microGrants.panel.comingSoon.sub":
    "Panel sign-up isn't connected on the live site yet, so this form wouldn't reach anyone. We didn't want to pretend otherwise. The panel opens to new volunteers before each quarter — check back soon.",
  "microGrants.panel.intro":
    "The panel reads applications and decides grants together. We keep it small, rotating, and deliberately mixed — no professional gatekeepers.",
  "microGrants.panel.nameLabel": "Name",
  "microGrants.panel.namePlaceholder": "Your name",
  "microGrants.panel.emailLabel": "Email",
  "microGrants.panel.emailPlaceholder": "you@example.com",
  "microGrants.panel.whyLabel": "Why you'd like to help review",
  "microGrants.panel.whyPlaceholder":
    "A sentence or two — lived experience, the kind of projects you care about, time you can give.",
  "microGrants.panel.cancelCta": "Cancel",
  "microGrants.panel.submitCta": "Add me to the panel",

  // ── PeerSupportPage (+ peerSupport.data.ts) ─────────────────────────────
  "peerSupport.meta.title":
    "Peer support for trans people in Lisbon: how it works",
  "peerSupport.meta.description":
    "Peer support in QueerPulse's Trans Hub — not therapy, not advice, just someone who's been where you are. How to ask for support or become a peer yourself.",

  "peerSupport.hero.eyebrow": "Trans Hub · Peer Support",
  "peerSupport.hero.title": "Someone who <em>gets it.</em>",
  "peerSupport.hero.lead":
    "Peer support in the Hub, in plain terms: what it is, what it isn't, how to ask for it, and how to become a peer yourself when you're ready.",
  "peerSupport.hero.anchor.what": "What it is",
  "peerSupport.hero.anchor.how": "How it works",
  "peerSupport.what.title": "What peer support <em>is</em>",
  "peerSupport.what.p1":
    "Peer support is not therapy and it is not advice. It is sitting with someone who has been where you are and does not need it explained. No clinical notes, no diagnosis, no goal you have to reach by the end.",
  "peerSupport.what.p2":
    "In the Hub, peer support runs two ways: the open circle where the group shows up together, and one-to-one pairing when you want a single person to talk to over time. You choose which, and you can switch whenever.",
  "peerSupport.how.title": "How it <em>works</em>",
  "peerSupport.how.lead":
    "Four steps, none of them binding. You stay in control of every one.",
  "peerSupport.step.01.title": "Tell us what you need",
  "peerSupport.step.01.body":
    "Post in the Hub or message a mod. You can be as specific or as vague as you like — 'I just started HRT and want someone who gets it' is plenty to go on.",
  "peerSupport.step.02.title": "We pair you, gently",
  "peerSupport.step.02.body":
    "A mod suggests one or two peers whose experience overlaps with yours. Nothing is automatic and nobody sees your request but the mod team. You say yes or not-yet.",
  "peerSupport.step.03.title": "You set the shape",
  "peerSupport.step.03.body":
    "Coffee, a walk, a voice note once a week, or the circle on Thursdays — whatever is sustainable for both of you. There is no minimum commitment and no awkwardness in stopping.",
  "peerSupport.step.04.title": "You can become a peer too",
  "peerSupport.step.04.body":
    "Most people who are supported end up supporting someone else later. When you are ready, tell a mod. We run a short, no-pressure orientation on holding space and keeping confidentiality.",
  "peerSupport.outro.title": "You don't have to carry it <em>alone.</em>",
  "peerSupport.outro.sub":
    "The Hub is here, and so is the wider community forum.",
  "peerSupport.outro.hubCta": "Go to the Trans Hub",
  "peerSupport.outro.forumCta": "Open the forum",

  // ── AccessibleLisbonPage (+ accessibleLisbon.data.ts) ───────────────────
  "accessibleLisbon.meta.title":
    "Accessible Lisbon: step-free routes and low-sensory spots",
  "accessibleLisbon.meta.description":
    "Peer-verified accessible Lisbon — step-free walking routes, low-sensory bars and cafés, and family-friendly parks, each checked by someone who's been there.",
  "accessibleLisbon.hero.eyebrow": "Accessible Lisbon",
  "accessibleLisbon.hero.title": "Lisbon, <em>actually reachable.</em>",
  "accessibleLisbon.hero.lead":
    "Step-free routes, low-sensory venues, and family-friendly spaces — every entry peer-verified by someone who went there. If it's on the list, somebody checked it themselves.",
  "accessibleLisbon.verifiedTag": "Peer-verified",

  "accessibleLisbon.group.routes.label": "Step-free running routes",
  "accessibleLisbon.group.routes.intro":
    "Loops the running group has checked on foot — flat, even surfaces, no stairs or kerbs you have to lift over.",
  "accessibleLisbon.group.venues.label": "Social venues",
  "accessibleLisbon.group.venues.intro":
    "Cafés and restaurants members have been to themselves. Only places someone has actually checked make the list.",
  "accessibleLisbon.group.family.label": "Family-friendly spots",
  "accessibleLisbon.group.family.intro":
    "Parks and venues that work with buggies, small kids, and the occasional meltdown — picked by the parents group.",

  "accessibleLisbon.place.parqueNacoes.detail":
    "7 km, completely flat, wide tarmac the whole way. The easiest first loop and step-free from the east lift.",
  "accessibleLisbon.place.belemAlges.detail":
    "5 km out-and-back along the river. Smooth, open, and you can turn back at any point.",
  "accessibleLisbon.place.alamedaGulbenkian.detail":
    "4 km through gardens and wide pavements. One gentle slope, otherwise level.",
  "accessibleLisbon.place.arquivo.detail":
    "Library-café, genuinely quiet, level entrance from the square. Good for low-noise meets.",
  "accessibleLisbon.place.mariaCaxuxa.detail":
    "Step-free entrance, hearing loop, accessible toilet, and staff who know what they are doing.",
  "accessibleLisbon.place.heim.detail":
    "Seated, low music, good coffee. One small step at the door — staff bring a ramp if you ask.",
  "accessibleLisbon.place.trindade.detail":
    "Accessible via the Chiado entrance; the quieter back room has excellent acoustics for a group.",
  "accessibleLisbon.place.jardimEstrela.detail":
    "Fenced playground, step-free paths, café and toilets on site. The picnic patch near the fountain is reserved-able.",
  "accessibleLisbon.place.eduardoVii.detail":
    "Wide flat lawns at the bottom, easy buggy access from Marquês. Avoid the steep top in summer.",
  "accessibleLisbon.place.gulbenkianGardens.detail":
    "Shade, ponds, ducks, and smooth paths throughout. Calm and rarely crowded on weekday mornings.",

  "accessibleLisbon.flag.7km": "7 km",
  "accessibleLisbon.flag.tarmac": "Tarmac",
  "accessibleLisbon.flag.stepFree": "Step-free",
  "accessibleLisbon.flag.5km": "5 km",
  "accessibleLisbon.flag.flat": "Flat",
  "accessibleLisbon.flag.turnBackAnywhere": "Turn back anywhere",
  "accessibleLisbon.flag.4km": "4 km",
  "accessibleLisbon.flag.mostlyLevel": "Mostly level",
  "accessibleLisbon.flag.lowNoise": "Low noise",
  "accessibleLisbon.flag.seated": "Seated",
  "accessibleLisbon.flag.hearingLoop": "Hearing loop",
  "accessibleLisbon.flag.accessibleWc": "Accessible WC",
  "accessibleLisbon.flag.rampOnRequest": "Ramp on request",
  "accessibleLisbon.flag.lowMusic": "Low music",
  "accessibleLisbon.flag.stepFreeEntrance": "Step-free entrance",
  "accessibleLisbon.flag.quietBackRoom": "Quiet back room",
  "accessibleLisbon.flag.playground": "Playground",
  "accessibleLisbon.flag.toilets": "Toilets",
  "accessibleLisbon.flag.buggyFriendly": "Buggy-friendly",
  "accessibleLisbon.flag.openSpace": "Open space",
  "accessibleLisbon.flag.shaded": "Shaded",
  "accessibleLisbon.flag.smoothPaths": "Smooth paths",
  "accessibleLisbon.flag.calm": "Calm",

  "accessibleLisbon.outro.title": "Been somewhere <em>that works?</em>",
  "accessibleLisbon.outro.sub":
    "The list only stays honest because we keep adding to it. Bring a verified spot to your community's resource board.",
  "accessibleLisbon.outro.cta": "Find a gathering",

  // ── ArtCritGuidePage (+ artCritGuide.data.ts) ───────────────────────────
  "artCritGuide.meta.title": "How Rainbow Arts crit sessions work",
  "artCritGuide.meta.description":
    "How Rainbow Arts group critiques work — the honest, kind, specific method, the four-step flow, and examples of useful versus unhelpful feedback.",
  "artCritGuide.hero.eyebrow": "Rainbow Arts",
  "artCritGuide.hero.title": "How our crits <em>work.</em>",
  "artCritGuide.hero.lead":
    "Honest, kind, specific — in that order. Here's the whole method, so your first open crit feels less like a test and more like the room being on your side.",
  "artCritGuide.hero.anchor.principle": "The principle",
  "artCritGuide.hero.anchor.flow": "How a session runs",
  "artCritGuide.hero.anchor.examples": "What to say",

  "artCritGuide.principle.title": "The <em>principle</em>",
  "artCritGuide.principle.body":
    "Honest, kind, specific — in that order. Vague praise helps no one and cruelty dressed as honesty is just cruelty. We critique the work in front of us, never the CV behind it and never the person who made it.",

  "artCritGuide.flow.title": "How a session <em>runs</em>",
  "artCritGuide.flow.lead": "Arrival to coffee, in four moves.",
  "artCritGuide.flow.step1.title": "Arrive and settle",
  "artCritGuide.flow.step1.body":
    "Coffee first. We start late on purpose so nobody is crit-ing before they have taken their coat off. Bring one work, finished or not.",
  "artCritGuide.flow.step2.title": "The maker frames it",
  "artCritGuide.flow.step2.body":
    "You get two minutes to say what it is and — if you want — what you are stuck on. You can also say nothing and let the work speak. Both are allowed.",
  "artCritGuide.flow.step3.title": "The room responds",
  "artCritGuide.flow.step3.body":
    "We go round. Specific observations, then questions, then suggestions if invited. We talk about what is on the wall, not what we would have made instead.",
  "artCritGuide.flow.step4.title": "The maker keeps what fits",
  "artCritGuide.flow.step4.body":
    "You are never obliged to agree. Take what is useful, leave the rest, and we move to the next work. Long table and food after.",

  "artCritGuide.examples.title": "What to <em>say</em>",
  "artCritGuide.examples.lead":
    "Specific beats nice. Here's the difference, in the room's own words.",
  "artCritGuide.examples.tryThis": "Try this",
  "artCritGuide.examples.avoid": "Avoid",
  "artCritGuide.example1.good":
    '"The coral reads as the focal point but the eye keeps getting pulled to the bottom-left corner — is that intended?"',
  "artCritGuide.example1.avoid":
    '"I love it!" (kind, but not specific — gives the maker nothing to work with.)',
  "artCritGuide.example2.good":
    '"The half-finished edge feels alive; finishing it might kill the tension you have got here."',
  "artCritGuide.example2.avoid":
    '"I would have used a different palette." (about the work you would have made, not theirs.)',
  "artCritGuide.example3.good":
    '"What were you trying to do with the negative space? It might be doing more than you think."',
  "artCritGuide.example3.avoid":
    '"This isn\'t really working." (a verdict with no door out of it.)',

  "artCritGuide.outro.title": "Bring <em>one work.</em>",
  "artCritGuide.outro.sub":
    "Finished or not — half-finished is exactly what a crit is for. Find the next open crit on the board.",
  "artCritGuide.outro.cta": "Find the next crit",

  // ── ComingOutAtWorkPage (+ comingOutAtWork.data.ts) ─────────────────────
  // VOICES stay English — attributed peer quotes (a member's own words).
  "comingOutAtWork.meta.title":
    "Coming out at work: timing, scripts and your rights",
  "comingOutAtWork.meta.description":
    "A practical guide to coming out at work in Portugal — reading the room, sample scripts for telling colleagues, and what to do if it goes badly.",
  "comingOutAtWork.hero.eyebrow": "Coming Out · At Work",
  "comingOutAtWork.hero.title": "Coming out <em>at work.</em>",
  "comingOutAtWork.hero.lead":
    "There's no single right way and no deadline. This is a practical guide to reading your workplace, having the conversation on your terms, and knowing your rights if it goes badly.",
  "comingOutAtWork.hero.anchor.timing": "Is there a right time?",
  "comingOutAtWork.hero.anchor.signals": "Reading your workplace",
  "comingOutAtWork.hero.anchor.scripts": "The conversation",
  "comingOutAtWork.hero.anchor.bad": "If it goes badly",

  "comingOutAtWork.timing.title": "Is there a <em>right time?</em>",
  "comingOutAtWork.timing.lead": "Short answer: only yours.",
  "comingOutAtWork.timing1.title": "There is no universal right time",
  "comingOutAtWork.timing1.body":
    "Anyone who tells you there's a correct moment is selling something. The right time is the one that's right for your safety, your finances, and your peace — in that order.",
  "comingOutAtWork.timing2.title": "Safety and security first",
  "comingOutAtWork.timing2.body":
    "If coming out could put your job, visa, or housing at risk, that calculation is allowed to come first. Protecting yourself is not the same as hiding.",
  "comingOutAtWork.timing3.title": "You can do it in degrees",
  "comingOutAtWork.timing3.body":
    "Out to one trusted colleague is a complete and valid choice. You don't owe the whole office an announcement, ever.",

  "comingOutAtWork.signals.title": "Reading your <em>workplace</em>",
  "comingOutAtWork.signals.lead":
    "None of these is decisive on its own — but together they tell you a lot.",
  "comingOutAtWork.signals.goodBadge": "Green flag",
  "comingOutAtWork.signals.cautionBadge": "Caution",
  "comingOutAtWork.signal1.text":
    "Visible LGBTQ+ colleagues who are out and seem fine",
  "comingOutAtWork.signal2.text":
    "A written non-discrimination policy that names sexual orientation and gender identity",
  "comingOutAtWork.signal3.text":
    "Inclusive language in everyday talk — partners, not assumptions",
  "comingOutAtWork.signal4.text":
    "Jokes that go unchallenged, including by managers",
  "comingOutAtWork.signal5.text":
    "A culture where personal life is policed or gossiped about",
  "comingOutAtWork.signal6.text":
    "No HR, or an HR that reports straight to the person you'd be disclosing to",

  "comingOutAtWork.scripts.title": "Having the <em>conversation</em>",
  "comingOutAtWork.scripts.lead":
    "Words you can borrow. Adjust until they sound like you.",
  "comingOutAtWork.script1.context": "Low-key, to one colleague",
  "comingOutAtWork.script1.line":
    '"My partner — her name\'s Ana — and I went to Sintra at the weekend." Said in passing, it does the whole job without a sit-down.',
  "comingOutAtWork.script2.context": "If you want to be deliberate",
  "comingOutAtWork.script2.line":
    "\"I wanted to mention, since we work closely — I'm gay. It's not a big deal to me day-to-day, I just didn't want to keep editing myself around you.\"",
  "comingOutAtWork.script3.context": "Setting a boundary at the same time",
  "comingOutAtWork.script3.line":
    "\"I'm happy to answer questions, but I'd rather it not become the topic. Thanks for keeping it normal.\"",

  "comingOutAtWork.bad.title": "If it goes <em>badly</em>",
  "comingOutAtWork.bad1.title": "Document everything",
  "comingOutAtWork.bad1.body":
    "Dates, words, witnesses. Discrimination on grounds of sexual orientation or gender identity is unlawful in Portugal, and a record is what turns an experience into a case.",
  "comingOutAtWork.bad2.title": "You have rights",
  "comingOutAtWork.bad2.body":
    "You cannot be lawfully dismissed or harassed for being queer. The ACT handles workplace discrimination complaints, and you can report anonymously. Our legal aid page has the templates.",
  "comingOutAtWork.bad3.title": "You are not alone in it",
  "comingOutAtWork.bad3.body":
    "The coming-out space and the wider community have walked people through exactly this. Bring it to the forum — you'll find people who've survived the same manager.",

  "comingOutAtWork.outro.title": "Your timeline is <em>yours.</em>",
  "comingOutAtWork.outro.sub":
    "Know your rights before you need them, and lean on the people who've done it.",
  "comingOutAtWork.outro.rightsCta": "Know your workplace rights",
  "comingOutAtWork.outro.talkCta": "Talk it through",

  // ── DisabilityHealthcarePage (+ disabilityHealthcare.data.ts) ───────────
  // STEPS are administrative/navigational guidance (registering
  // accommodations, referrals, choosing GPs, insurance paperwork) — same
  // register as the already-swept legal.healthcare.* guidance, translated.
  // TIPS stay English — attributed peer quotes (a member's own words).
  "disabilityHealthcare.meta.title":
    "Disability and chronic illness care in Portugal",
  "disabilityHealthcare.meta.description":
    "A practical guide to navigating Portuguese healthcare with a disability or chronic condition — accommodations, referrals, accessible GPs, and insurance.",
  "disabilityHealthcare.hero.eyebrow": "Disabled Queers",
  "disabilityHealthcare.hero.title": "The system, <em>navigated.</em>",
  "disabilityHealthcare.hero.lead":
    "Getting through Portuguese healthcare with a disability or chronic condition — accommodations, referrals, accessibility-aware GPs, and the insurance maze — without it becoming an appointment about your identity.",
  "disabilityHealthcare.hero.anchor.steps": "Step by step",
  "disabilityHealthcare.hero.anchor.tips": "Peer tips",

  "disabilityHealthcare.steps.title": "Step by <em>step</em>",
  "disabilityHealthcare.steps.lead":
    "Never ask anyone here what their diagnosis is — and expect the same care from the system.",
  "disabilityHealthcare.step1.title": "Register your accommodations",
  "disabilityHealthcare.step1.body":
    "Ask your Centro de Saúde to record your access needs on file — mobility, sensory, communication. Once it is in the system you stop re-explaining it at every visit, and appointments can be booked accordingly.",
  "disabilityHealthcare.step2.title": "Ask for referrals plainly",
  "disabilityHealthcare.step2.body":
    "You are entitled to a specialist referral without it becoming an appointment about your identity. A short written summary of your history, handed over at the start, keeps the visit on the actual reason you came.",
  "disabilityHealthcare.step3.title": "Choose accessibility-aware GPs",
  "disabilityHealthcare.step3.body":
    "Some Lisbon practices are noticeably better — step-free, unhurried, willing to write things down. The group keeps a peer-maintained list; ask in the space for current names.",
  "disabilityHealthcare.step4.title": "Navigate the insurance paperwork",
  "disabilityHealthcare.step4.body":
    "Reimbursement and atestado de incapacidade paperwork is its own maze. Keep copies of everything, ask for decisions in writing, and lean on the group — someone has filled in the same form.",

  "disabilityHealthcare.tips.title": "Peer <em>tips</em>",

  "disabilityHealthcare.outro.title": "You set the <em>terms.</em>",
  "disabilityHealthcare.outro.sub":
    "Know your rights, and never navigate it alone. The legal page and the group are both here.",
  "disabilityHealthcare.outro.rightsCta": "Know your rights",
  "disabilityHealthcare.outro.askCta": "Ask the group",

  // ── FirstMeetupGuidePage (+ firstMeetupGuide.data.ts) ───────────────────
  "firstMeetupGuide.meta.title": "Your first QueerPulse meetup: what to expect",
  "firstMeetupGuide.meta.description":
    "What actually happens at a first in-person meetup, what 'no agenda' really means, and honest answers to the questions newcomers are too nervous to ask.",
  "firstMeetupGuide.hero.eyebrow": "Queer Social",
  "firstMeetupGuide.hero.title": "Your first meetup, <em>no pressure.</em>",
  "firstMeetupGuide.hero.lead":
    "What to expect, what 'no agenda' actually means, and answers to the things you're too nervous to ask. Come alone, come anxious — you'll be looked after.",
  "firstMeetupGuide.hero.anchor.expect": "What to expect",
  "firstMeetupGuide.hero.anchor.values": "Our values",
  "firstMeetupGuide.hero.anchor.faq": "Nervous questions",

  "firstMeetupGuide.expect.title": "What to <em>expect</em>",
  "firstMeetupGuide.expect.lead":
    "The whole format, so none of it is a surprise.",
  "firstMeetupGuide.expect1.title": "No agenda, no pitch",
  "firstMeetupGuide.expect1.body":
    "Nobody is going to ask what you do for work or try to recruit you for anything. The whole format is: show up, talk to whoever you end up next to, leave when you like.",
  "firstMeetupGuide.expect2.title": "The book-swap table",
  "firstMeetupGuide.expect2.body":
    "There's usually a small pile of books on the table. Bring one, take one, or just use it as something to do with your hands for the first ten minutes. It works.",
  "firstMeetupGuide.expect3.title": "Come alone or bring someone",
  "firstMeetupGuide.expect3.body":
    "Most people come alone the first time. You'll be looked after. If it helps to bring a friend, bring a friend — both are completely normal.",

  "firstMeetupGuide.values.title": 'What "no agenda" <em>means</em>',
  "firstMeetupGuide.values.lead":
    "Four things we hold to, so the room stays easy for everyone in it.",
  "firstMeetupGuide.value1":
    "You don't need to be out, or out in any particular way, to be here.",
  "firstMeetupGuide.value2": "Ask before taking photos — always, of everyone.",
  "firstMeetupGuide.value3":
    "We look after first-timers; we were all one once.",
  "firstMeetupGuide.value4": "What's shared in person stays in person.",

  "firstMeetupGuide.faq.title": "The nervous <em>questions</em>",
  "firstMeetupGuide.faq1.q": "What if I don't know anyone?",
  "firstMeetupGuide.faq1.a":
    "Nobody does, the first time. The host is there early specifically to catch people at the door and introduce you. Say you're new — it's the easiest sentence to say here.",
  "firstMeetupGuide.faq2.q": "What if I'm really nervous?",
  "firstMeetupGuide.faq2.a":
    "Almost everyone is, and almost everyone almost turns around at the door. The people setting up tables this month did exactly that at their first one. It gets easy fast.",
  "firstMeetupGuide.faq3.q": "How will I find the group?",
  "firstMeetupGuide.faq3.a":
    "The host posts where they'll be and what they're wearing — usually at a specific entrance or lift at a set time, then everyone moves together. Check the gathering's pinned post.",
  "firstMeetupGuide.faq4.q": "Do I have to stay the whole time?",
  "firstMeetupGuide.faq4.a":
    "No. Leave whenever you like, no explanation needed. Staying twenty minutes still counts as coming.",

  "firstMeetupGuide.outro.title": "Just <em>show up.</em>",
  "firstMeetupGuide.outro.sub":
    "That's the whole entry requirement. The next meetup is on the board.",
  "firstMeetupGuide.outro.cta": "Find the next meetup",

  // ── GroupShowArchivePage (+ groupShowArchive.data.ts) ───────────────────
  // SHOWS (title/when/venue/blurb) are an archival record of real community
  // shows — kept English per the scope rule, same treatment as QTIPOC
  // Archive and Organisations. Only the surrounding chrome is translated.
  "groupShowArchive.meta.title": "Rainbow Arts: an archive of every group show",
  "groupShowArchive.meta.description":
    "An archive of every Rainbow Arts group show — dates, venues, and what was made — from the first pop-up to the most recent weekend residency.",
  "groupShowArchive.hero.eyebrow": "Rainbow Arts · Archive",
  "groupShowArchive.hero.title": "Everything we've <em>hung.</em>",
  "groupShowArchive.hero.lead":
    "The collective documents every show before we strike it. Here's the archive — tag yourself, grab anything with your work in it, and see what the room has made together.",
  "groupShowArchive.hero.anchor.shows": "The shows",

  "groupShowArchive.shows.title": "The <em>shows</em>",
  "groupShowArchive.shows.lead":
    "Most recent first. Full photo sets live in each album.",

  "groupShowArchive.outro.title":
    "Documented <em>generously,</em> credited always.",
  "groupShowArchive.outro.sub":
    "Shot the last show? Add your set to the archive so nobody's work disappears when the walls come down.",
  "groupShowArchive.outro.cta": "See upcoming shows",

  // ── IngredientsMapPage (+ ingredientsMap.data.ts) ───────────────────────
  // Spot names are shop names (proper nouns, untranslated); finds/origin/
  // hours are chrome, translated.
  "ingredientsMap.meta.title": "Where to find ingredients from home in Lisbon",
  "ingredientsMap.meta.description":
    "A community-mapped guide to Lisbon grocers, markets, and stalls carrying ingredients from home — organised by neighbourhood, from Mouraria to Marvila.",
  "ingredientsMap.hero.eyebrow": "Queer POC",
  "ingredientsMap.hero.title": "Ingredients from <em>home.</em>",
  "ingredientsMap.hero.lead":
    "A living map of where to find the tastes of home in Lisbon — crowd-sourced by the group, organised by neighbourhood. Home is partly a flavour, and this is where to find it.",

  "ingredientsMap.intro":
    "Thirty-four spots, fourteen countries, all crowd-sourced by the group. This map exists because home is partly a taste, and finding it in a new city is its own kind of belonging. Spot something missing? It is never too late to add yours.",

  "ingredientsMap.hood.mourariaIntendente": "Mouraria & Intendente",
  "ingredientsMap.hood.anjosArroios": "Anjos & Arroios",
  "ingredientsMap.hood.marvilaBeato": "Marvila & Beato",

  "ingredientsMap.spot.mercearia.finds":
    "Cape Verdean staples — cachupa corn, fresh coriander, palm oil.",
  "ingredientsMap.spot.mercearia.origin": "Cape Verde",
  "ingredientsMap.spot.mercearia.hours": "Mon–Sat, mornings best",
  "ingredientsMap.spot.lojaBengali.finds":
    "South Asian spices by weight, dals, mustard oil, fresh paneer on weekends.",
  "ingredientsMap.spot.lojaBengali.origin": "Bangladesh · India",
  "ingredientsMap.spot.lojaBengali.hours": "Daily until late",
  "ingredientsMap.spot.tropical.finds":
    "Plantain, yam, scotch bonnet, dried fish across West African kitchens.",
  "ingredientsMap.spot.tropical.origin": "Nigeria · Ghana",
  "ingredientsMap.spot.tropical.hours": "Mon–Sat",
  "ingredientsMap.spot.padaria.finds":
    "Cape Verdean bakery — open Saturday mornings, sells out fast.",
  "ingredientsMap.spot.padaria.origin": "Cape Verde",
  "ingredientsMap.spot.padaria.hours": "Sat mornings",
  "ingredientsMap.spot.mercado.finds":
    "Brazilian produce — mandioca, açaí, guaraná, fresh tropical fruit.",
  "ingredientsMap.spot.mercado.origin": "Brazil",
  "ingredientsMap.spot.mercado.hours": "Tue–Sun",
  "ingredientsMap.spot.asiaMarket.finds":
    "East and Southeast Asian — rice flours, fresh herbs, tofu, kimchi.",
  "ingredientsMap.spot.asiaMarket.origin": "Vietnam · Korea · China",
  "ingredientsMap.spot.asiaMarket.hours": "Daily",

  "ingredientsMap.missing.prompt": "Know a spot we're missing?",
  "ingredientsMap.missing.cta": "Add your spot",
  "ingredientsMap.missing.toast":
    "Added to the queue — a mod will pop it on the map. Obrigada!",

  "ingredientsMap.outro.title": "Joy is as <em>political</em> as solidarity.",
  "ingredientsMap.outro.sub":
    "The map is one of the best things we've made together. Bring the rest of yourself to the group too.",
  "ingredientsMap.outro.cta": "Join the conversation",

  // ── LgbtqAgingGuidePage (+ lgbtqAgingGuide.data.ts) ─────────────────────
  // LINKS point at real organisations (ILGA Portugal, SNS 24) — org/service
  // names and phone numbers stay as-is; note/label chrome is translated.
  "lgbtqAgingGuide.meta.title": "LGBTQ+ aging in Portugal: healthcare after 50",
  "lgbtqAgingGuide.meta.description":
    "Navigating Portuguese healthcare as an LGBTQ+ person over 50 — finding affirming GPs and hospitals, care options, and mental health support.",
  "lgbtqAgingGuide.hero.eyebrow": "Queer Elders",
  "lgbtqAgingGuide.hero.title": "Aging on <em>your own terms.</em>",
  "lgbtqAgingGuide.hero.lead":
    "Navigating Portuguese healthcare as an LGBTQ+ person over 50 — GPs, hospitals, care, and mental health, with the specific history you carry taken as a given, not a surprise.",
  "lgbtqAgingGuide.hero.anchor.topics": "The essentials",
  "lgbtqAgingGuide.hero.anchor.links": "Useful links",

  "lgbtqAgingGuide.topics.title": "The <em>essentials</em>",
  "lgbtqAgingGuide.topics.lead":
    "Plain, practical, and written by the group that uses it. Recently translated into Portuguese.",
  "lgbtqAgingGuide.topic1.title": "Finding a GP who doesn't make it weird",
  "lgbtqAgingGuide.topic1.body":
    "You are allowed to ask a Centro de Saúde to note your pronouns and partner, and to switch GP if one is dismissive. Bring a written summary of your history so you are not explaining your life from scratch each visit.",
  "lgbtqAgingGuide.topic2.title": "Hospitals and specialist referrals",
  "lgbtqAgingGuide.topic2.body":
    "Next-of-kin assumptions still trip up same-sex partners in hospital settings. A simple signed document naming your partner as your contact and decision-maker prevents most problems before they start.",
  "lgbtqAgingGuide.topic3.title": "Elder care and housing",
  "lgbtqAgingGuide.topic3.body":
    "Ask any care facility directly about their experience with LGBTQ+ residents and same-sex couples. The good ones answer plainly; the answer itself tells you most of what you need to know.",
  "lgbtqAgingGuide.topic4.title": "Mental health in later life",
  "lgbtqAgingGuide.topic4.body":
    "Isolation and a lifetime of guardedness take a toll. Affirming therapy exists at every age, and the elders group keeps a short list of practitioners who understand the particular history you carry.",

  "lgbtqAgingGuide.links.title": "Useful <em>links</em>",
  "lgbtqAgingGuide.link.ilga.label": "ILGA Portugal — services",
  "lgbtqAgingGuide.link.ilga.note":
    "Support, legal help, and community programmes including for older LGBTQ+ people.",
  "lgbtqAgingGuide.link.sns24.label": "SNS 24 health line",
  "lgbtqAgingGuide.link.sns24.note":
    "808 24 24 24 · 24h national health line for triage and advice.",

  "lgbtqAgingGuide.outro.title": "Later life, <em>well held.</em>",
  "lgbtqAgingGuide.outro.sub":
    "If what you need is someone to talk to, the mental health directory is affirming at every age.",
  "lgbtqAgingGuide.outro.cta": "Find affirming support",

  // ── OralHistoryProjectPage (+ oralHistoryProject.data.ts) ───────────────
  // VOICES stay English — attributed peer quotes (a member's own words).
  "oralHistoryProject.meta.title":
    "LGBTQ+ oral history project in Lisbon: share your story",
  "oralHistoryProject.meta.description":
    "QueerPulse is recording the lives of LGBTQ+ elders in Lisbon — voice-only if you prefer, no faces required, and entirely on your own terms.",

  "oralHistoryProject.hero.eyebrow": "Queer Elders · Oral History",
  "oralHistoryProject.hero.title": "Your story is <em>worth keeping.</em>",
  "oralHistoryProject.hero.lead":
    "We're recording the lives of LGBTQ+ elders in Lisbon — voice-only if you like, no faces required, entirely on your terms. Here's what taking part actually looks like.",
  "oralHistoryProject.hero.anchor.about": "About the project",
  "oralHistoryProject.hero.anchor.how": "How to take part",
  "oralHistoryProject.hero.anchor.voices": "In their words",

  "oralHistoryProject.about.title": "About the <em>project</em>",
  "oralHistoryProject.about.body":
    "We are recording the lives of LGBTQ+ elders in Lisbon before those stories are lost — the ordinary ones especially. Your story does not have to be dramatic to be worth keeping. History walks into the room and sits down.",

  "oralHistoryProject.how.title": "How to <em>take part</em>",
  "oralHistoryProject.how.lead":
    "Four steps, and you keep control of every one.",
  "oralHistoryProject.step1.title": "Say you're interested",
  "oralHistoryProject.step1.body":
    "A quiet word to a mod or a note in the group is all it takes. There is no form and no commitment yet — just a conversation about whether it feels right.",
  "oralHistoryProject.step2.title": "Choose how you appear",
  "oralHistoryProject.step2.body":
    "Voice-only is completely fine; no faces are ever required. You decide what is recorded, what is kept off the record, and what your name is attached to.",
  "oralHistoryProject.step3.title": "Record at your pace",
  "oralHistoryProject.step3.body":
    "Sofia does the interviews, gently, in as many sessions as you like. You can pause, revisit, or stop entirely at any point, and nothing is used without your final yes.",
  "oralHistoryProject.step4.title": "Decide how it's used",
  "oralHistoryProject.step4.body":
    "Archive only, community screening, or part of the documentary — your choice, and it can change later. You keep the right to withdraw your recording.",
  "oralHistoryProject.participateCta": "I'd like to take part",
  "oralHistoryProject.participateToast":
    "Thank you — Sofia will reach out gently to talk it through. No commitment.",

  "oralHistoryProject.voices.title": "In their <em>words</em>",
  "oralHistoryProject.voices.live.body":
    "The first recordings are still being gathered. Once participants have chosen how their words are shared, their voices will appear here — nothing before they're ready.",

  "oralHistoryProject.outro.title": "History, <em>kept honest.</em>",
  "oralHistoryProject.outro.sub":
    "Not ready to record but want to help? The group always needs listeners and transcribers.",
  "oralHistoryProject.outro.cta": "Ask how to help",

  // ── QtipocArchivePage (+ qtipocArchive.data.ts) ─────────────────────────
  // PIECES (title/kind/year/blurb) are an archival record of contributed
  // community work — kept English per the scope rule. Only the surrounding
  // chrome is translated.
  "qtipocArchive.meta.title":
    "QTIPOC archive: Lisbon's community-held queer history",
  "qtipocArchive.meta.description":
    "A living, community-held archive of QTIPOC life in Lisbon — photo essays, writing, recordings and documents, contributed and credited by the people who made them.",

  "qtipocArchive.hero.eyebrow": "Queer POC · Archive",
  "qtipocArchive.hero.title": "Kept by us, <em>for us.</em>",
  "qtipocArchive.hero.lead":
    "A living archive of QTIPOC life in Lisbon — photo essays, writing, recordings, documents. Contributed, credited, and held with care. Credit all labour, especially the emotional kind.",
  "qtipocArchive.hero.anchor.about": "About the archive",
  "qtipocArchive.hero.anchor.collection": "The collection",

  "qtipocArchive.about.title": "About the <em>archive</em>",
  "qtipocArchive.about.body":
    "A living, community-held archive of QTIPOC life in Lisbon — photo essays, written pieces, recordings, and documents, kept by us and for us. Nothing here is extracted; everything is contributed, credited, and held with care.",

  "qtipocArchive.collection.title": "The <em>collection</em>",
  "qtipocArchive.collection.lead":
    "Most recent first. Tap any piece for the full set.",
  "qtipocArchive.contribute.prompt":
    "Have something to add — a photo, a piece, a recording?",
  "qtipocArchive.contribute.cta": "Contribute to the archive",
  "qtipocArchive.contribute.toast":
    "Thank you — a mod will reach out about adding it, with full credit and your terms.",

  "qtipocArchive.outro.title": "Nothing here is <em>extracted.</em>",
  "qtipocArchive.outro.sub":
    "Everything is given, on the contributor's terms. Bring yours when you're ready.",
  "qtipocArchive.outro.cta": "Talk to the group",

  // ── QtipocOrganisationsPage (+ qtipocOrganisations.data.ts) ─────────────
  // ORGS (name/mission/offers/tags) are a directory record of real
  // organisations — kept English per the scope rule. Chrome is translated.
  "qtipocOrganisations.meta.title":
    "QTIPOC organisations in Portugal and how to reach them",
  "qtipocOrganisations.meta.description":
    "A directory of organisations across Portugal working where race and queerness meet — housing, legal aid, youth groups and advocacy — with what they offer and how to reach them.",

  "qtipocOrganisations.hero.eyebrow": "Queer POC",
  "qtipocOrganisations.hero.title":
    "Organisations that <em>hold all of it.</em>",
  "qtipocOrganisations.hero.lead":
    "Groups across Portugal working where race and queerness meet — neither treated as a footnote of the other. What they do, what they offer, and how to reach them.",
  "qtipocOrganisations.hero.anchor.orgs": "The organisations",
  "qtipocOrganisations.hero.anchor.verify": "Before you engage",

  "qtipocOrganisations.orgs.title": "The <em>organisations</em>",

  "qtipocOrganisations.verify.title": "Before you <em>engage</em>",
  "qtipocOrganisations.verify.body":
    "Before engaging with any organisation, have a look at how recent and active their channels are, and ask the group if anyone has dealt with them directly. The community's lived experience is the best vetting there is — and if you have it, share it.",

  "qtipocOrganisations.outro.title": "Know one we've <em>missed?</em>",
  "qtipocOrganisations.outro.sub":
    "This directory grows by word of mouth. Bring the ones that helped you.",
  "qtipocOrganisations.outro.cta": "Add an organisation",

  // ── QueerPaediatriciansPage (+ queerPaediatricians.data.ts) ─────────────
  // PROVIDERS (name/practice/hood/notedFor/tags/checked) are a peer-reviewed
  // directory record, akin to therapist bios — kept English. HOW_IT_WORKS is
  // chrome (not clinical instruction), translated.
  "queerPaediatricians.meta.title":
    "Queer-friendly paediatricians in Lisbon: parent-vetted list",
  "queerPaediatricians.meta.description":
    "A peer-verified list of Lisbon paediatricians that LGBTQ+ families actually trust — doctors comfortable with two-parent forms and same-sex parents, dated and honestly reviewed.",

  "queerPaediatricians.hero.eyebrow": "Queer Parents",
  "queerPaediatricians.hero.title": "Doctors who <em>don't blink.</em>",
  "queerPaediatricians.hero.lead":
    "Paediatricians in Lisbon that families in the network actually trust — ones who won't pause at two mums on the intake form and who talk to both of you equally. Peer-verified, dated, honest.",
  "queerPaediatricians.hero.anchor.list": "The list",
  "queerPaediatricians.hero.anchor.how": "How it works",

  "queerPaediatricians.list.title": "The <em>list</em>",
  "queerPaediatricians.list.lead":
    "Every entry added by a parent who sees them. Dates show the last peer check.",
  "queerPaediatricians.suggest.prompt":
    "Know a paediatrician the community should have?",
  "queerPaediatricians.suggest.cta": "Suggest a provider",
  "queerPaediatricians.suggest.toast":
    "Thanks — a parent mod will follow up to add and verify them.",

  "queerPaediatricians.how.title": "How the list <em>works</em>",
  "queerPaediatricians.how1":
    "Peer-maintained and peer-verified: only parents in the network add names, and only ones they actually see. We re-check entries regularly and date them so you know how current they are.",
  "queerPaediatricians.how2":
    "A name here means a family in the community trusts them — not that we have vetted their clinical record. Always use your own judgement, and tell us if your experience differs so the list stays honest.",

  "queerPaediatricians.outro.title": "Ask the <em>network.</em>",
  "queerPaediatricians.outro.sub":
    "Looking for something specific — a dentist, a therapist for a teen? The parents forum is the fastest way to a trusted name.",
  "queerPaediatricians.outro.cta": "Ask in the forum",

  // ── RunningGuidePage (+ runningGuide.data.ts) ───────────────────────────
  "runningGuide.meta.title":
    "Queer running group in Lisbon: pace groups and what to bring",
  "runningGuide.meta.description":
    "QueerPulse's Lisbon running group — three pace groups from social to steady, what to bring on your first run, and the rule that matters most: nobody runs alone.",

  "runningGuide.hero.eyebrow": "Queer Runners",
  "runningGuide.hero.title": "Your first run, <em>honestly.</em>",
  "runningGuide.hero.lead":
    "Which pace group is yours, what to bring, and the one thing that matters most: nobody runs alone and nobody gets left. Here's everything you need before Sunday.",
  "runningGuide.hero.anchor.pace": "Pace groups",
  "runningGuide.hero.anchor.bring": "What to bring",

  "runningGuide.pace.title": "Which group is <em>yours</em>",
  "runningGuide.pace.lead":
    "We split into three pace groups at the start. Pick the honest one, not the ambitious one — you can always move up next week. Every pace belongs here.",
  "runningGuide.pace1.name": "Slow & Social",
  "runningGuide.pace1.pace": "7:00–8:00 min/km · run-walk welcome",
  "runningGuide.pace1.who":
    "First-timers, anyone coming back from a break, and anyone who wants to actually talk the whole way round. The slowest runner sets the pace and nobody is ever left behind.",
  "runningGuide.pace2.name": "Middle Ground",
  "runningGuide.pace2.pace": "5:30–6:30 min/km · steady",
  "runningGuide.pace2.who":
    "You can run 5k without stopping and want company at a comfortable, sustainable pace. The biggest group, and the easiest to slot into.",
  "runningGuide.pace3.name": "Fast & Focused",
  "runningGuide.pace3.pace": "4:30–5:15 min/km · training",
  "runningGuide.pace3.who":
    "Building toward a race or chasing a PB. Still social at the coffee after — just quicker on the road. We regroup at every turn so the group never splits for good.",

  "runningGuide.bring.title": "What to <em>bring</em>",
  "runningGuide.bring.lead":
    "Short version: less than you think. Here's the whole list.",
  "runningGuide.bring1.title": "Trainers you can already run in",
  "runningGuide.bring1.note":
    "Whatever you own is fine for your first time — don't buy anything special. If the cobbles start hurting your ankles, ask the group; we have strong opinions about Lisbon-proof shoes.",
  "runningGuide.bring2.title": "Layers you can lose",
  "runningGuide.bring2.note":
    "Mornings start cool and warm up fast. Something you can tie round your waist beats a single heavy top.",
  "runningGuide.bring3.title": "Water for after",
  "runningGuide.bring3.note":
    "We finish near coffee, so you don't need to carry much — a small bottle is plenty for the loop.",
  "runningGuide.bring4.title": "Nothing to prove",
  "runningGuide.bring4.note":
    "You don't need a running history, a certain body, or a goal. Showing up is the whole entry requirement. Come for the coffee and walk the loop if that's today's version.",

  "runningGuide.outro.title": "See you at the <em>start line.</em>",
  "runningGuide.outro.sub":
    "Coffee after is half the point. Find the next run on the gatherings board.",
  "runningGuide.outro.cta": "Find the next run",

  // ── SchoolFormsGuidePage (+ schoolFormsGuide.data.ts) ───────────────────
  // Administrative/legal procedure (Portuguese school intake forms, parental
  // recognition). Official form terms ("encarregado de educação", "mãe /
  // pai") are domain terms already in Portuguese in the source and are kept
  // byte-identical in both catalogs — flag any doubt to a native reviewer.
  // VOICES stay English — attributed peer quotes (a member's own words).
  "schoolFormsGuide.meta.title":
    "School intake forms for queer families in Lisbon",
  "schoolFormsGuide.meta.description":
    "How to navigate school intake forms as a two-parent or queer family in Lisbon — what to expect on the fields, how to ask for both your names, and your rights.",

  "schoolFormsGuide.hero.eyebrow": "Queer Parents",
  "schoolFormsGuide.hero.title": "Two parents, <em>one form.</em>",
  "schoolFormsGuide.hero.lead":
    "School intake forms, navigated: what to expect on the fields, how to ask for both your names everywhere, and your rights when a form hasn't caught up with your family.",
  "schoolFormsGuide.hero.anchor.forms": "On the forms",
  "schoolFormsGuide.hero.anchor.rights": "Your rights",
  "schoolFormsGuide.hero.anchor.voices": "What others did",

  "schoolFormsGuide.forms.title": "On the <em>forms</em>",
  "schoolFormsGuide.forms.lead": "Three moves that handle most of it.",
  "schoolFormsGuide.form1.title": "Read the parent fields first",
  "schoolFormsGuide.form1.body":
    'Many Lisbon schools now use two unlabelled "encarregado de educação" fields with no gender specified — you can put both your names straight in. Where a form still says "mãe / pai", you are allowed to cross out and write what is true.',
  "schoolFormsGuide.form2.title": "Ask before you assume the worst",
  "schoolFormsGuide.form2.body":
    "Most administrative staff say yes without hesitation when asked to use both parents' names everywhere. Ask early, ask in writing, and you usually find the form is the only old-fashioned thing about the school.",
  "schoolFormsGuide.form3.title": "Get the both-names agreement in writing",
  "schoolFormsGuide.form3.body":
    "A short email confirming both parents are recorded and contacted equally saves you re-explaining at every pickup, trip slip, and parents' evening for years.",

  "schoolFormsGuide.rights.title": "Your <em>rights</em>",
  "schoolFormsGuide.rights.lead":
    "Plain-language summary. For the full legal picture, the legal aid page goes deeper.",
  "schoolFormsGuide.badge.protected": "Protected right",
  "schoolFormsGuide.badge.know": "Know this",
  "schoolFormsGuide.badge.practical": "Practical",
  "schoolFormsGuide.right1.title": "Equal recognition",
  "schoolFormsGuide.right1.body":
    'Same-sex parents have full equal legal standing as parents in Portugal. A school cannot lawfully recognise only one of you, and both can be the official "encarregado de educação".',
  "schoolFormsGuide.right2.title": "Your child's name",
  "schoolFormsGuide.right2.body":
    "Children of same-sex couples can carry both parents' surnames. Schools must use the name on the child's documents — including a chosen name where records have been updated.",
  "schoolFormsGuide.right3.title": "If a school pushes back",
  "schoolFormsGuide.right3.body":
    "It is rare, but if it happens, document it and raise it with the school's direction in writing. ILGA Portugal and the parents network can both help you escalate calmly.",

  "schoolFormsGuide.voices.title": "What others <em>did</em>",

  "schoolFormsGuide.outro.title":
    "You don't have to <em>explain your family.</em>",
  "schoolFormsGuide.outro.sub":
    "Know your rights, then lean on the network. The legal aid page has the templates.",
  "schoolFormsGuide.outro.legalCta": "Read the legal guide",
  "schoolFormsGuide.outro.forumCta": "Ask the parents forum",

  // ── SharedEquipmentPage (+ sharedEquipment.data.ts) ─────────────────────
  "sharedEquipment.meta.title":
    "Shared studio equipment: the Rainbow Arts kit library",
  "sharedEquipment.meta.description":
    "The risograph, kiln, projector and bookbinding kit the Rainbow Arts collective shares in Lisbon — what's available, how to book it, and how the community keeps it in good shape.",

  "sharedEquipment.hero.eyebrow": "Rainbow Arts",
  "sharedEquipment.hero.title": "Shared kit, <em>shared care.</em>",
  "sharedEquipment.hero.lead":
    "The riso, the kiln, the projector — everything the collective owns together, what it's for, and how to book it. The deal is simple: book it, clean it, log it.",
  "sharedEquipment.hero.anchor.kit": "The kit",
  "sharedEquipment.hero.anchor.care": "How we care for it",

  "sharedEquipment.kit.title": "The <em>kit</em>",
  "sharedEquipment.kit.lead":
    "All of it lives at the atelier. Tap request and a mod confirms your slot.",
  "sharedEquipment.kit.live.body":
    "The shared kit and its booking calendar aren't online yet. Once the atelier's inventory is registered you'll see what's free and be able to request a slot here.",
  "sharedEquipment.item1.name": "Two-colour Risograph",
  "sharedEquipment.item1.specs":
    "Reconditioned RZ, A3, currently loaded coral + black. Lives at the atelier for collective use.",
  "sharedEquipment.item1.status": "Free this week",
  "sharedEquipment.item2.name": "Electric kiln",
  "sharedEquipment.item2.specs":
    "Mid-size top-loader, cone 6. Firings are scheduled — add yours to the shared sheet a week ahead.",
  "sharedEquipment.item2.status": "Next firing Sunday",
  "sharedEquipment.item3.name": "Projector + stand",
  "sharedEquipment.item3.specs":
    "1080p, long-throw, good for tracing and projection work. Portable with the soft case.",
  "sharedEquipment.item3.status": "On loan until Fri",
  "sharedEquipment.item4.name": "Bookbinding kit",
  "sharedEquipment.item4.specs":
    "Awls, bone folders, waxed thread, board shears. For zines and small editions.",
  "sharedEquipment.item4.status": "Free this week",
  "sharedEquipment.requestSlotCta": "Request slot",
  "sharedEquipment.onLoanCta": "On loan",
  "sharedEquipment.requestToast":
    "Request sent for the {name} — a mod will confirm your slot.",

  "sharedEquipment.care.title": "How we <em>care for it</em>",
  "sharedEquipment.care1":
    "Book it, clean it, log it — the three rules that keep shared kit shared.",
  "sharedEquipment.care2":
    "Leave it better than you found it. If something breaks, say so in the channel; nobody is in trouble, we just need to know.",
  "sharedEquipment.care3":
    "Consumables (ink, thread, board) work on a top-up honesty box. Use a lot, chip in a little.",

  "sharedEquipment.outro.title": "Make <em>something.</em>",
  "sharedEquipment.outro.sub":
    "The kit is here so the work can happen. Come to a print day and put it to use.",
  "sharedEquipment.outro.cta": "Find a print day",

  // ── SpoonTheoryPage (+ spoonTheory.data.ts) ─────────────────────────────
  // FLAGGED for native review: "spoon theory" is rendered here as "teoria das
  // colheres" (a direct, widely-used calque in Portuguese disability/chronic
  // illness writing) — moderate confidence, not certain this is what pt-PT
  // disabled-queer communities specifically say day to day. Verify before
  // shipping; see sweep report.
  "spoonTheory.meta.title":
    "Spoon theory explained: how this queer community uses it",
  "spoonTheory.meta.description":
    "What spoon theory means, and how QueerPulse applies it for chronic illness and disability — hybrid events by default, no-penalty drop-outs, and permission to say 'I'm low on spoons.'",

  "spoonTheory.hero.eyebrow": "Disabled Queers",
  "spoonTheory.hero.title": "What we mean by <em>spoons.</em>",
  "spoonTheory.hero.lead":
    "A shared shorthand for limited energy — what spoon theory is, how this community runs on it, and how to use it when you RSVP. No essay required: 'I'm low on spoons today' is a full sentence here.",
  "spoonTheory.hero.anchor.what": "What it is",
  "spoonTheory.hero.anchor.uses": "How we use it",
  "spoonTheory.hero.anchor.rsvp": "When you RSVP",

  "spoonTheory.what.title": "What it <em>is</em>",
  "spoonTheory.what.spoonsCaption":
    "Four spoons left of six — a normal afternoon.",
  "spoonTheory.what.p1":
    "Spoon theory is a simple way to talk about limited energy. You start the day with a set number of spoons, and every task — showering, commuting, a hard conversation — costs one or more. When they are gone, they are gone, and tomorrow does not always refill them.",
  "spoonTheory.what.p2":
    "It is not a metaphor for being tired. It is a way for people with chronic illness, disability, and chronic pain to make an invisible limit visible — to themselves and to each other — without writing an essay about it.",

  "spoonTheory.uses.title": "How we <em>use it</em>",
  "spoonTheory.use1.title": "Hybrid by default",
  "spoonTheory.use1.body":
    "Every gathering has an online option so a low-spoon day never means missing out. Online is never second class — it is just another door into the same room.",
  "spoonTheory.use2.title": "Drop-in, no penalty",
  "spoonTheory.use2.body":
    "RSVP yes and not make it? Completely fine. We plan for it. The spoons you protect by staying home are yours to protect.",
  "spoonTheory.use3.title": '"I\'m low on spoons today" is a full sentence',
  "spoonTheory.use3.body":
    "Nobody here will ask you to justify it. You can say it when you RSVP, when you arrive, or when you need to leave early, and it will simply be honoured.",

  "spoonTheory.rsvp.title": "When you <em>RSVP</em>",
  "spoonTheory.rsvpTip1":
    "Tell the host your spoon count if it helps them plan — seating, quiet corners, an easy exit near the door.",
  "spoonTheory.rsvpTip2":
    "Ask for what you need up front; it will be arranged without fuss and without comment.",
  "spoonTheory.rsvpTip3":
    "Carers and personal assistants are always welcome, no booking required.",

  "spoonTheory.outro.title": "Come in whatever <em>state you're in.</em>",
  "spoonTheory.outro.sub":
    "We're not measuring. Every gathering is hybrid, drop-in, and built for real bodies.",
  "spoonTheory.outro.cta": "Find a low-sensory hangout",

  // ── IntersectionalityPage (+ IntersectionalityCards.tsx +
  //    IntersectionalityFooter.tsx + intersectionality.data.ts) ───────────
  // Voice entries (name/context/quote) are attributed member quotes — content,
  // stay English, matching the wellbeing/soberPage VOICES precedent. ORGS
  // real-world organisation names stay English; their category ("focus") and
  // description are platform-authored chrome and are translated.
  "intersectionality.meta.title":
    "Race, faith and class in Lisbon's queer community",
  "intersectionality.meta.description":
    "How race, faith, class, and disability intersect with queerness in Lisbon — member voices and resources for people navigating more than one identity at once.",
  "intersectionality.hero.backLabel": "Resource Library",
  "intersectionality.hero.cat": "Intersectionality",
  "intersectionality.hero.title": "More than one thing <em>at once.</em>",
  "intersectionality.hero.sub":
    "Being queer and a person of colour, queer and religious, queer and working class, queer and disabled — these identities don't stack neatly. This page exists for members navigating multiple layers, and for a community committed to holding all of them.",
  "intersectionality.opening.strong": "This page is for everyone.",
  "intersectionality.opening.text":
    "Not as an education exercise for people who don't have these experiences. As a resource for members who do, and as a visible commitment from QueerPulse that queerness doesn't mean a single kind of person.",

  "intersectionality.nav.race": "Race & ethnicity",
  "intersectionality.nav.faith": "Faith & religion",
  "intersectionality.nav.class": "Class & economics",
  "intersectionality.nav.community": "Within the community",
  "intersectionality.nav.orgs": "Organisations & resources",

  "intersectionality.race.heading": "Race & <em>ethnicity</em>",
  "intersectionality.race.intro":
    "Being a queer person of colour in Lisbon means navigating two things at once that mainstream spaces rarely design for simultaneously. Portugal's colonial history shapes this city in ways that are visible if you're living them — and invisible if you're not.",
  "intersectionality.race.info1.eyebrow": "Navigating queer spaces",
  "intersectionality.race.info1.title": "When queer isn't enough",
  "intersectionality.race.info1.body":
    "Queer spaces in Lisbon, like most cities, can replicate the racial dynamics of the wider world. Fetishisation, exclusion, and micro-aggressions don't disappear because a space is queer. The community's guidelines explicitly address this — and the forum has threads for discussing specific situations.",
  "intersectionality.race.info1.link": "Community guidelines",
  "intersectionality.race.info2.eyebrow": "Portugal's colonial history",
  "intersectionality.race.info2.title": "What to know arriving here",
  "intersectionality.race.info2.body":
    "Portugal has a specific and often unprocessed relationship with its colonial history. Afro-Portuguese, Brazilian, Cape Verdean, and Angolan communities are significant and complex. Arriving as a person of colour from outside this history means learning a new set of dynamics. This takes time and the community can help.",
  "intersectionality.race.info3.eyebrow": "Community groups",
  "intersectionality.race.info3.title": "Spaces for QTIPOC members",
  "intersectionality.race.info3.body":
    "QueerPulse has a closed community group for QTIPOC (queer, trans, and intersex people of colour) members — a space for the conversations that the broader community isn't always the right container for. Join via the Communities page.",
  "intersectionality.race.info3.link": "QTIPOC community group",

  "intersectionality.faith.heading": "Faith & <em>religion</em>",
  "intersectionality.faith.intro":
    "Being queer and religious is not a contradiction — though plenty of people will try to make you feel like it is. Portugal is predominantly Catholic, and the relationship between the Church and LGBTQ+ people is complicated, evolving, and deeply personal.",
  "intersectionality.faith.info1.eyebrow": "Catholic context",
  "intersectionality.faith.info1.title": "A changing church",
  "intersectionality.faith.info1.body":
    "The Portuguese Catholic Church is conservative institutionally but increasingly varied in practice. Some parishes are actively welcoming; others are not. There are priests in Lisbon who are known to be affirming — the community knows who they are. Ask in the forum.",
  "intersectionality.faith.info2.eyebrow": "Other traditions",
  "intersectionality.faith.info2.title":
    "Islam, Judaism, evangelical, and others",
  "intersectionality.faith.info2.body":
    "Lisbon has growing Muslim and Jewish communities, and a range of Protestant and evangelical churches. The relationship between each community and its LGBTQ+ members varies enormously. The forum has threads for navigating faith questions in each of these contexts.",
  "intersectionality.faith.info2.link": "Forum: faith & queerness",
  "intersectionality.faith.info3.eyebrow": "Not religious",
  "intersectionality.faith.info3.title": "Secularism is also valid",
  "intersectionality.faith.info3.body":
    "Portugal is increasingly secular, especially among younger generations. If your relationship with religion is complicated, hostile, or nonexistent — that's also completely valid here. The community doesn't require or assume any particular relationship with faith.",

  "intersectionality.class.heading": "Class & <em>economics</em>",
  "intersectionality.class.intro":
    "Queer community often has an unspoken class character — certain bars, events, aesthetics, and social codes signal belonging in ways that exclude people who can't or don't participate. Naming this is the first step to doing something about it.",
  "intersectionality.class.note.strong": "QueerPulse's position:",
  "intersectionality.class.note.text":
    "We try to make community participation accessible regardless of income. Events have sliding-scale options; the forum is free; this platform is free for members who can't afford a contribution. If cost is a barrier to anything here, contact us directly — it will be handled discreetly.",
  "intersectionality.class.info1.eyebrow": "Lisbon's cost shift",
  "intersectionality.class.info1.title": "What gentrification means here",
  "intersectionality.class.info1.body":
    "Lisbon has become significantly more expensive in the last decade, partly driven by international migration including the queer expat community. This is worth holding honestly — the queer community is part of a pattern that has displaced local working-class residents. This tension is real and the community tries to engage with it rather than look away.",
  "intersectionality.class.info2.eyebrow": "Queer social life",
  "intersectionality.class.info2.title": "The cost of belonging",
  "intersectionality.class.info2.body":
    "Bar and club culture as the default queer social form excludes people who don't drink, can't afford cover charges, or find late-night environments difficult. QueerPulse deliberately runs social events that are free or low-cost, daytime or early evening, and alcohol-optional.",
  "intersectionality.class.info2.link": "Sober community",
  "intersectionality.class.info3.eyebrow": "Economic support",
  "intersectionality.class.info3.title": "Community resources",
  "intersectionality.class.info3.body":
    "The Economy page has resources on emergency financial support, benefit navigation, and community mutual aid. The Skills Exchange is a non-monetary community tool. Both are available to all members.",
  "intersectionality.class.info3.link": "Economy resources",

  "intersectionality.community.heading":
    "Navigating <em>the community itself</em>",
  "intersectionality.community.intro":
    "Queer spaces aren't automatically safe for all queer people. Racism, classism, transphobia, ableism, and other dynamics exist within LGBTQ+ communities. This isn't a reason to leave — it's a reason to name it.",
  "intersectionality.community.info1.eyebrow": "Reporting & accountability",
  "intersectionality.community.info1.title":
    "If something happens in a community space",
  "intersectionality.community.info1.body":
    "QueerPulse has a report function for behaviour that violates the community guidelines — including racism, discrimination, and harassment. Reports are handled by the moderation team. If you're not sure whether something is reportable, the Contact page reaches the team directly.",
  "intersectionality.community.info1.link": "Report something",
  "intersectionality.community.info2.eyebrow": "Community groups",
  "intersectionality.community.info2.title": "Finding your specific community",
  "intersectionality.community.info2.body":
    "Beyond the main community, QueerPulse has closed groups for QTIPOC members, disabled and chronically ill members, queer parents, and sober members. These exist so that people can have the conversations that the broader space isn't always suited for.",
  "intersectionality.community.info2.link": "Browse community groups",
  "intersectionality.community.info3.eyebrow": "The forum",
  "intersectionality.community.info3.title":
    "Where harder conversations happen",
  "intersectionality.community.info3.body":
    "The forum's Intersectionality thread is one of the more active on the platform. It's where members raise specific experiences, share resources, challenge each other, and support each other. It's moderated but not sanitised.",
  "intersectionality.community.info3.link": "Forum: intersectionality",

  "intersectionality.commit.heading": "What QueerPulse <em>commits to.</em>",
  "intersectionality.commit.sub":
    "These are specific things, not aspirations. We're accountable to them — if we're not doing them, say so.",
  "intersectionality.commit.governanceCta": "How we're governed",
  "intersectionality.commit.accountableCta": "Hold us accountable",
  "intersectionality.commitment1.title": "Active moderation",
  "intersectionality.commitment1.text":
    "The platform is actively moderated for racism, transphobia, classism, and ableism — not just homophobia. Reports are taken seriously and followed up.",
  "intersectionality.commitment2.title": "Intersectional community groups",
  "intersectionality.commitment2.text":
    "Closed spaces for QTIPOC, disabled, sober, and other communities within the community are maintained as a genuine resource, not a token gesture.",
  "intersectionality.commitment3.title": "Economic accessibility",
  "intersectionality.commitment3.text":
    "No member is excluded from community events or resources due to cost. Sliding-scale and free options are available for everything we run.",
  "intersectionality.commitment4.title": "Not a monolith",
  "intersectionality.commitment4.text":
    "QueerPulse doesn't speak with one voice on political questions. The community contains multitudes. The forum is a place to have the arguments, not to have them resolved from above.",

  "intersectionality.orgs.heading": "Organisations & <em>resources</em>",
  "intersectionality.orgs.intro":
    "External organisations relevant to the specific intersections on this page.",
  "intersectionality.org1.focus": "QTIPOC",
  "intersectionality.org1.text":
    "Portuguese organisation working on LGBTQ+ rights with an explicit focus on the intersection of race, migration, and queerness in Portugal.",
  "intersectionality.org1.link": "Discussion thread",
  "intersectionality.org2.focus": "Faith",
  "intersectionality.org2.text":
    "Queer-affirming Christian community based in Lisbon. Open to all denominations and traditions, focused on reconciling faith and queer identity.",
  "intersectionality.org2.link": "Forum: faith thread",
  "intersectionality.org3.focus": "Race & migration",
  "intersectionality.org3.text":
    "Portugal's main LGBTQ+ rights organisation. Works explicitly on the intersection of LGBTQ+ rights and migration/race. Legal support and advocacy.",
  "intersectionality.org3.link": "Legal resources",

  "intersectionality.outro.title": "All of you <em>belongs here.</em>",
  "intersectionality.outro.sub":
    "Not the parts that are easiest to hold. All of it.",
  "intersectionality.outro.findCta": "Find your community group",
  "intersectionality.outro.forumCta": "Forum",

  // ── Section J: live-mode honesty — no fabricated "verified" providers or
  //    fake submits leak when running against the real API (demo keeps mock) ──
  "therapistProfilePage.live.title": "This directory is still being built.",
  "therapistProfilePage.live.body":
    "We're verifying queer-affirming therapists in Lisbon before any profile goes live here, so every listing is one you can trust. There's nothing to book yet.",
  "therapistProfilePage.live.cta": "Back to mental health",

  "queerPaediatricians.live.title": "Verified paediatricians are coming soon.",
  "queerPaediatricians.live.body":
    "We're still confirming which paediatric practices are genuinely queer- and trans-affirming before we list them. Rather than show unverified names, we're waiting until every profile is one you can trust.",
  "queerPaediatricians.live.cta": "Ask the community",

  "legal.lawyers.live.title": "The lawyer directory is coming soon.",
  "legal.lawyers.live.body":
    "We're vetting LGBTQ+-affirming lawyers before listing them, so we don't send you to someone we can't stand behind. In the meantime, you can report discrimination and we'll help you find support.",
  "legal.lawyers.live.cta": "Report an issue",

  "sexualHealth.testing.live.title": "The clinic directory is coming soon.",
  "sexualHealth.testing.live.body":
    "We're verifying which testing services are genuinely queer- and trans-friendly before we list them here, so every clinic is one you can trust.",
  "sexualHealth.guides.ask.liveBody":
    "Anonymous questions aren't open yet — we're setting up a safe way for the community's health volunteers to answer them. Check back soon.",

  "accessibleLisbon.live.title": "Verified accessible spaces are coming soon.",
  "accessibleLisbon.live.body":
    "We're confirming step-free access, accessible bathrooms and staff training with each venue before we list it, so every space here is one members have checked.",
  "accessibleLisbon.live.cta": "Find gatherings",

  "ingredientsMap.missing.liveToast":
    "Community suggestions aren't open yet — this map is still being built.",
  "oralHistoryProject.participateLiveToast":
    "Sign-ups aren't open yet — the oral-history project is still being set up.",
  "qtipocArchive.contribute.liveToast":
    "Contributions aren't open yet — the archive is still being built.",
  "sharedEquipment.requestLiveToast":
    "The lending library isn't live yet — check back soon.",

  // ── GuideRatingWidget (CNT-18) ───────────────────────────────────────────
  "rating.prompt": "Was this helpful?",
  "rating.helpfulCta": "Yes",
  "rating.notHelpfulCta": "No",
  "rating.thanks": "Thanks for the feedback.",
  "rating.changeCta": "Change your answer",

  // ── CNT-14: real resource-listings directory + suggestion pathway ──────
  "directory.contactCta": "Contact",

  "suggest.cta": "Suggest a resource",
  "suggest.modalTitle": "Suggest a resource",
  "suggest.intro":
    "Know a legal aid clinic or testing service that should be here? Tell us about it — our team verifies every suggestion before it's published.",
  "suggest.form.nameLabel": "Organisation name",
  "suggest.form.namePlaceholder": "e.g. Porto Queer Legal Clinic",
  "suggest.form.descriptionLabel": "What do they offer?",
  "suggest.form.descriptionPlaceholder":
    "e.g. Free consultations for workplace discrimination, walk-in Wednesdays.",
  "suggest.form.phoneLabel": "Phone (optional)",
  "suggest.form.phonePlaceholder": "+351 ...",
  "suggest.form.emailLabel": "Email (optional)",
  "suggest.form.emailPlaceholder": "contact@example.org",
  "suggest.form.websiteLabel": "Website (optional)",
  "suggest.form.websitePlaceholder": "example.org",
  "suggest.cancelCta": "Cancel",
  "suggest.submitCta": "Send suggestion",
  "suggest.sendingLabel": "Sending…",
  "suggest.errorToast": "Couldn't send your suggestion — try again in a moment.",
  "suggest.success.title": "Thanks — <em>we'll take it from here.</em>",
  "suggest.success.sub":
    "Our team verifies every suggestion before it's published, so we don't send anyone to a wrong number or a defunct clinic.",
};

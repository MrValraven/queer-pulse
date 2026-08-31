import type { Catalog } from "../../types";

/**
 * Community — English source catalog. Covers 7 pages: Caregivers, Change
 * Makers (+ story), Coming Out, Dating, Family (+ Parent
 * Network), Reading Groups.
 *
 * Scope-rule notes: change-maker profile bios/quotes/bylines, reading-group
 * listing fields (book/author/desc/where/frequency/lang),
 * dating "member quote" testimonials, and family "From the community"
 * review quotes + attributions are all mock member/editorial *content* — in
 * live mode they arrive over the wire as someone's own words — and are left
 * untranslated by design. Everything else here is platform-authored chrome.
 */
export const community: Catalog = {
  // ── Caregivers page (CaregiversPage.tsx) ──────────────────────────────────
  "caregivers.hero.eyebrow":
    "For parents · partners · siblings · friends · anyone showing up",
  "caregivers.hero.title": "Showing up <em>well</em>, when it matters.",
  "caregivers.hero.lead":
    "A focused space for the people who love someone queer and want to do this well. <em>You don't need to know everything before you start.</em> You need a few short answers, a couple of conversations, and the room behind you.",
  "caregivers.hero.whoAriaLabel": "Who are you?",
  "caregivers.persona.parent": "I'm a parent",
  "caregivers.persona.partner": "I'm a partner",
  "caregivers.persona.siblingFriend": "I'm a sibling / friend",
  "caregivers.persona.youthWorker": "I work with young people",
  "caregivers.outro.title": "You don't have to <em>get it all right.</em>",
  "caregivers.outro.sub":
    "You have to keep showing up. The room is here for you too.",
  "caregivers.outro.cta": "Find a support room",

  // Caregivers — Start Here (five short reads)
  "caregivers.startHere.title": "Start <em>here</em>",
  "caregivers.startHere.lead":
    "Five short reads. Each is one specific question, answered concretely, in language we'd want to hear ourselves. <em>Not a course. Not 50 modules.</em> Five reads.",
  "caregivers.lesson.listen.title": "How to <em>listen</em> the first time",
  "caregivers.lesson.listen.body":
    "The first conversation matters less than you think and more than you think. <em>One thing to do; three things to not do.</em> Written by Sara Marques + 6 parents.",
  "caregivers.lesson.listen.readTime": "4 min read",
  "caregivers.lesson.listen.langs": "PT + EN",
  "caregivers.lesson.wrongThing.title":
    "What to say <em>when you say something wrong</em>",
  "caregivers.lesson.wrongThing.body":
    "You will. Everyone does. <em>The repair is what matters.</em> A small script and a slow apology, written by people who've done both badly and well.",
  "caregivers.lesson.wrongThing.readTime": "5 min read",
  "caregivers.lesson.wrongThing.langs": "PT + EN",
  "caregivers.lesson.pronouns.title": "Pronouns & <em>names</em>, simply",
  "caregivers.lesson.pronouns.body":
    "What to do, what not to do, what to do when you slip. <em>A practical piece, on what to actually do.</em> Written by Yara R.",
  "caregivers.lesson.pronouns.readTime": "3 min read",
  "caregivers.lesson.pronouns.langs": "PT + EN",
  "caregivers.lesson.transitioning.title":
    "If your person is <em>medically transitioning</em>",
  "caregivers.lesson.transitioning.body":
    "What to ask, what not to ask, what to be ready for. Covers HRT, gender-affirming surgeries, Portuguese healthcare specifics. <em>Written by trans members + their parents.</em>",
  "caregivers.lesson.transitioning.readTime": "9 min read",
  "caregivers.lesson.transitioning.langs": "PT + EN",
  "caregivers.lesson.familyPullsAway.title":
    "When family pulls <em>the other way</em>",
  "caregivers.lesson.familyPullsAway.body":
    "When grandparents, in-laws, cousins make it harder. <em>How to hold the line without burning the house down.</em> Written by 4 parents.",
  "caregivers.lesson.familyPullsAway.readTime": "7 min read",
  "caregivers.lesson.familyPullsAway.langs": "PT + EN",

  // Caregivers — Common questions (FAQ accordion)
  "caregivers.commonQuestions.title": "Common <em>questions</em>",
  "caregivers.faq.childCameOut.q":
    "My child just came out and I don't know what to say. <em>Help.</em>",
  "caregivers.faq.childCameOut.a":
    "<strong>Take a breath. Say \"thank you for telling me.\" Then ask \"is there anything you'd like from me right now?\"</strong> That's it. You don't need to know the language. You don't need to have a plan. <em>This is a long conversation, one that continues.</em> Come back later with questions. They will be ready, and the room is here too.",
  "caregivers.faq.partnerTransitioning.q":
    "My partner is transitioning and I'm scared we'll grow apart.",
  "caregivers.faq.partnerTransitioning.a":
    "This fear is shared by a lot of people in your position, and it's not shameful. <em>You're allowed to feel it.</em> What helps: talk to other partners who've been through this, see the support rooms below. What also helps: keep doing the small things that have always been yours together. Transition changes a lot. It doesn't have to change everything.",
  "caregivers.faq.wrongPronouns.q":
    "I keep using the wrong pronouns. Will my friend forgive me?",
  "caregivers.faq.wrongPronouns.a":
    "Probably. What helps most: correct yourself <em>without making it about you</em>. \"She (sorry, they) said.\" Move on. Don't apologise three sentences later. Don't ask them to absolve you. Just keep practising. <strong>The effort is what they'll remember.</strong>",
  "caregivers.faq.grandchildQueer.q":
    "My grandchild is queer and my children won't speak to them. <em>What do I do?</em>",
  "caregivers.faq.grandchildQueer.a":
    "Stay in contact with your grandchild. <em>Every direct relationship counts.</em> Don't make them carry the family conflict. Be the consistent voice they can return to. If you want to write to your children about it, the Parents resource has a template letter we've collaboratively edited over the years.",

  // Caregivers — Voice rooms
  "caregivers.voiceRooms.title": "Talk to <em>others</em> like you",
  "caregivers.voiceRooms.lead":
    "Members-only support rooms. Joining is opt-in and quiet.",
  "caregivers.room.parents.title": "Parents <em>voice room</em>",
  "caregivers.room.parents.sub":
    "Weekly Tuesday 21:00 Lisbon · facilitated · PT + EN",
  "caregivers.room.parents.meta": "38 parents in the room · last week",
  "caregivers.room.partnersOfTrans.title": "Partners of trans <em>people</em>",
  "caregivers.room.partnersOfTrans.sub":
    "Bi-weekly Thursday 20:00 · facilitated · EN",
  "caregivers.room.partnersOfTrans.meta": "12 partners in the room",
  "caregivers.room.siblings.title": "Siblings & <em>chosen siblings</em>",
  "caregivers.room.siblings.sub": "Monthly Sunday 18:00 · informal · PT + EN",
  "caregivers.room.siblings.meta": "22 siblings · last month",
  "caregivers.room.youthWorkers.title": "Working with <em>young people</em>",
  "caregivers.room.youthWorkers.sub":
    "Teachers, social workers, youth-club staff · Wed 19:00",
  "caregivers.room.youthWorkers.meta": "14 in the room",

  // Caregivers — Don't say / Do say
  "caregivers.dontDoSay.eyebrow": "A small list",
  "caregivers.dontDoSay.heading": "Don't say. <em>Do say.</em>",
  "caregivers.dontDoSay.lead":
    "A few of the things we wish people had been told. Just a few opening moves that help, offered lightly.",
  "caregivers.dontDoSay.dontHeading": "Don't <em>say</em>",
  "caregivers.dontDoSay.doHeading": "Do <em>say</em>",
  "caregivers.dontSay.1": '"Are you sure?"',
  "caregivers.dontSay.2": '"How do you know?"',
  "caregivers.dontSay.3": '"Don\'t tell your grandmother."',
  "caregivers.dontSay.4": '"It\'s just a phase."',
  "caregivers.dontSay.5": '"You don\'t look queer."',
  "caregivers.dontSay.6": '"I love you but I don\'t agree."',
  "caregivers.dontSay.7": '"What did I do wrong?"',
  "caregivers.doSay.1": '"Thank you for telling me."',
  "caregivers.doSay.2": '"What do you need from me right now?"',
  "caregivers.doSay.3": '"I want to get this right. <em>I might mess up.</em>"',
  "caregivers.doSay.4": '"Tell me what name and pronouns to use."',
  "caregivers.doSay.5": '"Who else have you told? Who shouldn\'t I tell?"',
  "caregivers.doSay.6": '"I love you. The rest we\'ll figure out."',
  "caregivers.doSay.7":
    "\"I'll do my own learning so you don't have to teach me.\"",

  // ── Change Makers directory (ChangemakersPage.tsx) ────────────────────────
  "changemakers.hero.cat": "Change Makers",
  "changemakers.hero.title":
    "People making the future <em>liveable</em> for all of us.",
  "changemakers.hero.lead":
    "They have day jobs, families, projects, and lives outside their activism. But they're also the people who show up when something needs changing.",
  "changemakers.hero.meet":
    "Meet the people putting that care into practice across Lisbon.",
  "changemakers.stat.profiled": "Change makers profiled so far",
  "changemakers.stat.causeAreas": "Cause areas active in Lisbon",
  "changemakers.stat.peopleHelped": "People directly helped by their work",
  "changemakers.stat.activeCampaigns": "Active campaigns running right now",
  "changemakers.featured.label": "Featured change maker",
  "changemakers.featured.readStoryCta": "Read her story",
  // Routes to the general Contact page, not a DM to this specific person
  // (COM-25: Changemaker profiles have no linked member account) — the
  // label says so plainly rather than implying a direct message will reach
  // them.
  "changemakers.featured.connectCta": "Reach the team about them",
  "changemakers.empty.title": "No change makers profiled yet",
  "changemakers.empty.description":
    "This is where we celebrate the people quietly making things better. Know someone doing that work? Nominate them below and we'll start the story.",
  "changemakers.card.readMoreCta": "Read more",

  // Change Makers — nominate form
  "changemakers.nominate.eyebrow": "Community nominations",
  "changemakers.nominate.heading": "Know someone who should <em>be here?</em>",
  "changemakers.nominate.lead":
    "We add change makers through community nominations. If you know someone doing meaningful work for queer people in Lisbon, a name and a sentence is enough to start.",
  "changemakers.nominate.stepSend":
    "Send a name and a sentence. Anything else is optional.",
  "changemakers.nominate.stepRead":
    "A moderator reads it and decides whether to open a story.",
  "changemakers.nominate.stepHear": "You get a notification with the decision.",
  "changemakers.nominate.formTitle": "Nominate someone",
  "changemakers.nominate.nameLabel": "Their name",
  "changemakers.nominate.namePlaceholder": "The name they go by",
  "changemakers.nominate.nameError":
    "Add the name of the person you're nominating.",
  "changemakers.nominate.memberLabel": "Are they already on QueerPulse?",
  "changemakers.nominate.memberPlaceholder": "Search members by name",
  "changemakers.nominate.memberSearchAria": "Search members by name",
  "changemakers.nominate.memberHelper":
    "Optional. Skip it if they haven't joined.",
  "changemakers.nominate.memberClearAria": "Remove {name} from this nomination",
  "changemakers.nominate.contactLabel": "Where else can we find them?",
  "changemakers.nominate.contactPlaceholder": "Instagram, a website, an email…",
  "changemakers.nominate.contactHelper":
    "Optional, and only what's already public. It helps a moderator read their work.",
  "changemakers.nominate.reasonLabel": "Why them?",
  "changemakers.nominate.reasonPlaceholder":
    "What they do, and who it reaches.",
  "changemakers.nominate.reasonHelper": "One or two sentences is plenty.",
  "changemakers.nominate.reasonCount": "{used}/{max}",
  "changemakers.nominate.reasonError":
    "Add a sentence about why they belong here.",
  "changemakers.nominate.privacyNote":
    "The person you nominate isn't told about it.",
  "changemakers.nominate.submitCta": "Nominate them",
  "changemakers.nominate.submitPending": "Sending…",
  "changemakers.nominate.successToast": "Thank you. We'll look into {name}.",
  "changemakers.nominate.errorToast":
    "Couldn't send your nomination. Please try again.",

  // ── Change Maker story page (ChangemakerStoryPage.tsx) ────────────────────
  "changemakerStory.backCta": "Change Makers",
  "changemakerStory.categoryLabel": "Change Maker · {cause}",
  "changemakerStory.impactLabel": "Why we highlight {name}",
  "changemakerStory.outro.title": "Want to support <em>{name}'s</em> work?",
  "changemakerStory.outro.sub":
    "Change makers do this alongside their day jobs. A message, an introduction, or an hour of your time goes further than you'd think.",
  "changemakerStory.outro.connectCta": "Reach the team about them",
  "changemakerStory.outro.moreCta": "Meet more change makers",
  "changemakerStory.moreLabel": "More change makers",

  // ── Change Makers — admin (AdminChangemakersPage.tsx + editor) ────────────
  "changemakers.admin.navLabel": "Change Makers",
  "changemakers.admin.title": "Change Makers directory",
  "changemakers.admin.newProfileCta": "New profile",
  "changemakers.admin.empty.title": "No change maker profiles yet",
  "changemakers.admin.empty.description":
    "Create the first profile to start populating the public directory.",
  "changemakers.admin.statsTitle": "Hero stats",
  "changemakers.admin.statsHint":
    "These two figures aren't derived from profiles. Set them by hand.",
  "changemakers.admin.peopleHelpedLabel": "People helped",
  "changemakers.admin.activeCampaignsLabel": "Active campaigns",
  "changemakers.admin.statsSaveCta": "Save stats",
  "changemakers.admin.statsSavedToast": "Directory stats saved.",
  "changemakers.admin.editCta": "Edit",
  "changemakers.admin.publishCta": "Publish",
  "changemakers.admin.unpublishCta": "Unpublish",
  "changemakers.admin.deleteCta": "Delete",
  "changemakers.admin.statusPublished": "Published",
  "changemakers.admin.statusDraft": "Draft",
  "changemakers.admin.featuredBadge": "Featured",
  "changemakers.admin.cancelCta": "Cancel",
  "changemakers.admin.deleteConfirmTitle": "Delete this profile?",
  "changemakers.admin.deleteConfirmBody":
    "This removes {name} from the directory for good. This can't be undone.",
  "changemakers.admin.deleteConfirmCta": "Delete profile",
  "changemakers.admin.deletedToast": "Profile deleted.",
  "changemakers.admin.publishedToast": "Profile published.",
  "changemakers.admin.unpublishedToast": "Profile unpublished.",
  "changemakers.admin.editor.createTitle": "New change maker profile",
  "changemakers.admin.editor.editTitle": "Edit change maker profile",
  "changemakers.admin.editor.nameLabel": "Name",
  "changemakers.admin.editor.initialsLabel": "Initials",
  "changemakers.admin.editor.causeLabel": "Cause",
  "changemakers.admin.editor.tintLabel": "Tint",
  "changemakers.admin.editor.tintCoral": "Coral",
  "changemakers.admin.editor.tintJade": "Jade",
  "changemakers.admin.editor.tintPlum": "Plum",
  "changemakers.admin.editor.tagsLabel": "Tags",
  "changemakers.admin.editor.tagsHint":
    "Comma-separated, e.g. Advocacy, Mutual aid",
  "changemakers.admin.editor.summaryLabel": "Summary",
  "changemakers.admin.editor.imageUrlLabel": "Image URL",
  "changemakers.admin.editor.impactLabel": "Impact",
  "changemakers.admin.editor.impactHint": "One impact line per row.",
  "changemakers.admin.editor.bylineLabel": "Byline",
  "changemakers.admin.editor.heroNoteLabel": "Hero note",
  "changemakers.admin.editor.leadLabel": "Lead",
  "changemakers.admin.editor.bodyLabel": "Body",
  "changemakers.admin.editor.bodyHint":
    "Separate paragraphs with a blank line.",
  "changemakers.admin.editor.pullQuoteTextLabel": "Pull-quote text",
  "changemakers.admin.editor.pullQuoteCiteLabel": "Pull-quote citation",
  "changemakers.admin.editor.isFeaturedLabel": "Featured on the directory",
  "changemakers.admin.editor.sortOrderLabel": "Sort order",
  "changemakers.admin.editor.saveCta": "Save profile",
  "changemakers.admin.editor.nameRequiredToast":
    "Give this profile a name first.",
  "changemakers.admin.editor.createdToast": "Profile created.",
  "changemakers.admin.editor.updatedToast": "Profile updated.",

  // ── Coming Out page (ComingOutPage.tsx) ───────────────────────────────────
  "comingOut.hero.eyebrow": "Coming-Out Support · Private space",
  "comingOut.hero.title": "A place to say it <em>before you say it.</em>",
  "comingOut.hero.lead":
    'A private, low-visibility space for people navigating coming out, at work, to family, or to themselves. There\'s no pressure to be "out" to join, and nothing here is visible from your public profile.',
  "comingOut.privacy.heading": "Built for <em>privacy</em>, first.",
  "comingOut.privacy.lead":
    "This space carries additional controls beyond the rest of QueerPulse. They exist so you can be here without it costing you anything elsewhere.",
  "comingOut.privacy.invisible.title": "Invisible from your profile",
  "comingOut.privacy.invisible.body":
    "Nothing you do here shows on your public profile or in any feed. Membership itself is hidden.",
  "comingOut.privacy.noList.title": "No public member list",
  "comingOut.privacy.noList.body":
    "You can't be browsed or searched here. People see only what's shared inside the space.",
  "comingOut.privacy.confidentiality.title": "Confidentiality first",
  "comingOut.privacy.confidentiality.body":
    "Stricter moderation, no screenshots, no outside sharing. The first rule and the last.",
  "comingOut.privacy.noPressure.title": 'No pressure to be "out"',
  "comingOut.privacy.noPressure.body":
    "Join at any stage, including not-yet and not-sure. You can leave the moment you're ready.",
  "comingOut.stages.heading": "However you <em>need to use it.</em>",
  "comingOut.stages.lead":
    "Facilitated with a light hand by Mariana, a clinical psychologist who holds confidentiality as the first rule and the last.",
  "comingOut.stage.readFirst.title": "Just for you, first",
  "comingOut.stage.readFirst.body":
    "Some people only read. That's a full and valid way to be here. No one will ask you to post.",
  "comingOut.stage.saySafely.title": "Say it somewhere safe",
  "comingOut.stage.saySafely.body":
    "Try the words out loud here before you say them for real. The weekly circle holds space for exactly that.",
  "comingOut.stage.moveOn.title": "Move through, and out",
  "comingOut.stage.moveOn.body":
    "People graduate out of this space when they no longer need it. That's the whole point.",
  "comingOut.outro.title": "You don't owe a <em>perfect speech.</em>",
  "comingOut.outro.sub":
    "Saying the true thing badly is still saying the true thing. Peer support is open whenever you're ready, and you can step away the moment you want to.",
  "comingOut.outro.enterCta": "Find peer support",
  "comingOut.outro.communitiesCta": "See all communities",

  // ── Dating & Relationships page (DatingPage.tsx + data) ───────────────────
  "dating.hero.cat": "Dating & Relationships · Lisbon",
  "dating.hero.title": "Connection, <em>on your own terms.</em>",
  "dating.hero.sub":
    "The app landscape, dating culture in Lisbon, relationship structures, legal recognition, and where the community actually meets when it's not on a phone screen.",

  "dating.apps.heading": "Apps in <em>Lisbon</em>",
  "dating.apps.lead":
    "What the community actually uses: honest takes from the community.",
  "dating.app.grindr.audience": "Gay & bi men · Trans masc",
  "dating.app.grindr.body":
    "Still the highest user density for gay and bi men in Lisbon. Works. The culture varies enormously by who's on at any given time.",
  "dating.app.grindr.tag1": "Hookup-oriented",
  "dating.app.grindr.tag2": "High volume",
  "dating.app.grindr.tag3": "Variable culture",
  "dating.app.grindr.quote":
    '"Works fine for what it is. Set your preferences clearly and you\'ll find your people. The community tends to cluster in Príncipe Real and Mouraria."',
  "dating.app.scruff.audience": "Gay & bi men · Bears · Masc-leaning",
  "dating.app.scruff.body":
    "More conversational than Grindr. Better for people who want to talk first. Has events and group features that the queer community uses actively in Lisbon.",
  "dating.app.scruff.tag1": "Community features",
  "dating.app.scruff.tag2": "More chat-first",
  "dating.app.scruff.tag3": "Bears & masc",
  "dating.app.scruff.quote":
    '"The Lisbon pool is smaller but the vibe is better. More likely to result in an actual conversation."',
  "dating.app.her.audience": "Queer women · Non-binary",
  "dating.app.her.body":
    "The main app for queer women and non-binary people in Lisbon. Smaller pool but genuinely community-oriented: has event listings and groups beyond just dating.",
  "dating.app.her.tag1": "Community-first",
  "dating.app.her.tag2": "Events & groups",
  "dating.app.her.tag3": "All relationships",
  "dating.app.her.quote":
    '"Not huge in Lisbon but the quality of connections is better. Worth having alongside Tinder."',
  "dating.app.feeld.audience": "All genders · ENM · Kink-adjacent",
  "dating.app.feeld.body":
    "The go-to for ethical non-monogamy, open relationships, and kink in Lisbon. Very identity-inclusive. Growing fast in the community. Well-used at events and socials too.",
  "dating.app.feeld.tag1": "ENM",
  "dating.app.feeld.tag2": "Kink-adjacent",
  "dating.app.feeld.tag3": "Identity-inclusive",
  "dating.app.feeld.tag4": "Couples & singles",
  "dating.app.feeld.quote":
    "\"Best app for anyone who doesn't want to fit into a neat box. The community here uses it more than anywhere I've lived.\"",
  "dating.app.hornet.audience": "Gay & bi men · Community-focused",
  "dating.app.hornet.body":
    "More community-oriented than Grindr: has news, stories, and group features. Better for people who want to know the city as well as date in it. Active in Lisbon.",
  "dating.app.hornet.tag1": "Community features",
  "dating.app.hornet.tag2": "Local news",
  "dating.app.hornet.tag3": "More than hookups",
  "dating.app.hornet.quote":
    '"Used this to find events and community spots before I had a social network. Underrated."',
  "dating.app.okcupid.audience": "All genders · Relationships",
  "dating.app.okcupid.body":
    "Best identity and pronoun options of any mainstream app. Question-matching means you arrive at conversations already knowing you have something in common. Slower pace, better for relationships over hookups.",
  "dating.app.okcupid.tag1": "Best identity options",
  "dating.app.okcupid.tag2": "Relationship-focused",
  "dating.app.okcupid.tag3": "Slower pace",
  "dating.app.okcupid.quote":
    '"If you care about someone\'s politics and values before their photos, OkCupid is the one."',

  "dating.culture.heading": "Dating culture <em>in Lisbon</em>",
  "dating.culture.lead":
    "Things the community wishes someone had told them before they started dating here.",
  "dating.culture.smallCommunity.title": "It's a small community",
  "dating.culture.smallCommunity.text":
    "Lisbon's queer community is intimate. You will meet the same people at events, through apps, and through friends within weeks of arriving. This is mostly wonderful. But it also means that how you treat people echoes. Be kind.",
  "dating.culture.slowerPace.title": "Pace is slower",
  "dating.culture.slowerPace.text":
    "Portuguese social and dating culture is generally slower than northern European or North American norms. Expect longer warm-up periods, more emphasis on in-person chemistry, and less pressure to define things quickly. This is part of the appeal.",
  "dating.culture.languageGap.title": "The language gap is real",
  "dating.culture.languageGap.text":
    "Dating across a language barrier is a specific experience. Some people find it freeing; others find it exhausting. The queer expat community is large enough that you can absolutely date within it. But you'll miss the broader community if you only date other expats.",
  "dating.culture.eventsMatter.title": "Events are how people actually meet",
  "dating.culture.eventsMatter.text":
    "Apps matter less here than in some cities. A significant portion of relationships in the QueerPulse community started at a community event, through a mutual introduction, or at a forum gathering. Show up to things.",

  "dating.structures.heading": "Relationship <em>structures</em>",
  "dating.structures.lead":
    "Lisbon has an active, visible community across all relationship structures. No default assumed here.",
  "dating.structure.monogamy.label": "Monogamy",
  "dating.structure.monogamy.title": "One person, fully",
  "dating.structure.monogamy.text":
    "Completely valid and common. The community doesn't assume non-monogamy is more progressive. It's simply a preference. The legal protections in Portugal are strongest for married monogamous couples, which is worth knowing if legal recognition matters to you.",
  "dating.structure.enm.label": "Ethical non-monogamy",
  "dating.structure.enm.title": "Open relationships",
  "dating.structure.enm.text":
    'ENM covers a broad range from "open but together" to fully independent relationships with multiple people. Feeld and the community\'s own social events are the best entry points. The forum has an active ENM thread with local meetups.',
  "dating.structure.polyamory.label": "Polyamory",
  "dating.structure.polyamory.title": "Multiple loving relationships",
  "dating.structure.polyamory.text":
    "A distinct culture from ENM, more focused on multiple committed relationships than open/casual structures. There's an active poly community in Lisbon with regular social events and forum support. Legally complex in Portugal, particularly for housing, healthcare, and family situations.",
  "dating.structure.relationshipAnarchy.label": "Relationship anarchy",
  "dating.structure.relationshipAnarchy.title": "No hierarchy, no rules",
  "dating.structure.relationshipAnarchy.text":
    "Relationships defined entirely by the people in them, without reference to conventional categories. RA is quietly common in the Lisbon queer community. Most people won't call it that, but the practice is widespread.",
  "dating.structure.queerplatonic.label": "Queerplatonic",
  "dating.structure.queerplatonic.title": "Deep non-romantic partnership",
  "dating.structure.queerplatonic.text":
    "A committed, close relationship without romantic or sexual components. QPRs can include cohabitation, shared finances, and the kind of partnership that marriage typically describes, just without the romantic framing. Increasingly visible in the community.",
  "dating.structure.soloPolyamory.label": "Solo polyamory",
  "dating.structure.soloPolyamory.title": "Your own anchor",
  "dating.structure.soloPolyamory.text":
    'Multiple connections without a primary partner or "escalator" trajectory. Common among people who moved to Lisbon independently and value their autonomy. Works well with the city\'s social rhythm: events and community without cohabitation pressure.',

  "dating.recognition.heading": "Legal <em>recognition in Portugal</em>",
  "dating.recognition.sameSexMarriage.title": "Same-sex marriage",
  "dating.recognition.sameSexMarriage.text":
    "Full legal recognition since 2010. All the same rights as opposite-sex marriage: inheritance, residency, healthcare decisions, joint adoption.",
  "dating.recognition.sameSexMarriage.status": "Full recognition since 2010",
  "dating.recognition.civilPartnership.title":
    "Civil partnership / União de facto",
  "dating.recognition.civilPartnership.text":
    "Recognised after 2 years cohabitation. Carries significant legal protections including inheritance, healthcare decisions, and residency rights. Simpler than marriage to enter and exit.",
  "dating.recognition.civilPartnership.status": "Full recognition",
  "dating.recognition.nonMonogamous.title": "Non-monogamous relationships",
  "dating.recognition.nonMonogamous.text":
    "No legal recognition for multiple-partner relationships. Practical solutions exist (wills, powers of attorney, cohabitation agreements) but require deliberate legal planning.",
  "dating.recognition.nonMonogamous.status":
    "No automatic recognition: plan ahead",
  "dating.recognition.legalCta": "Legal advice for relationships",

  "dating.social.heading": "Meet people <em>in person.</em>",
  "dating.social.lead":
    "Apps are fine. But the QueerPulse community tends to actually meet at events: socials, dinners, gatherings specifically for connection. Less transactional than a dating app; more honest about what you're there for.",
  "dating.social.upcomingEventsCta": "See upcoming events",
  "dating.social.forumThreadCta": "Social forum thread",
  "dating.event.singlesDinner.name": "Queer Singles Dinner",
  "dating.event.singlesDinner.detail": "Monthly · Mouraria · 12–16 people",
  "dating.event.singlesDinner.note":
    "Hosted dinners for single members. No agenda, no pressure: just a good meal and the chance to meet people properly.",
  "dating.event.enmPolySocial.name": "ENM & Poly Social",
  "dating.event.enmPolySocial.detail": "Bi-monthly · Arroios · Ongoing",
  "dating.event.enmPolySocial.note":
    "Community gathering for non-monogamous members. Primarily social, secondarily a space to talk about navigating ENM in Lisbon.",
  "dating.event.newMembersSocial.name": "New Members Social",
  "dating.event.newMembersSocial.detail": "Every 6 weeks · Venue rotates",
  "dating.event.newMembersSocial.note":
    "Specifically for members who've joined in the last 3 months. The community shows up for this one.",

  "dating.outro.title": "Real connection <em>exists here.</em>",
  "dating.outro.sub":
    "It takes a little time and a little showing up. The community makes it easier.",
  "dating.outro.cta": "See what's on",

  // ── Family building hub (FamilyPage.tsx + sub-components) ─────────────────
  "family.hero.cat": "Family Building · Portugal",
  "family.hero.title": "Building your family, <em>your way.</em>",
  "family.hero.sub":
    "Practical, honest information about adoption, assisted reproduction, co-parenting, and legal parenthood in Portugal. From the community, for the community.",
  "family.hero.legalNote":
    "Community information to start from. Laws change, so always verify with a specialist.",

  "family.situations.heading": "Where are you <em>starting from?</em>",
  "family.situations.lead":
    "Optional: pick a situation to highlight what's most relevant, or just browse everything below. No need to decide anything to read.",
  "family.situation.twoWomen.name": "Two women",
  "family.situation.twoWomen.desc":
    "IVF or IUI with donor sperm, joint legal parenthood from birth.",
  "family.situation.twoWomen.to": "See: IVF & Assisted Reproduction",
  "family.situation.twoMen.name": "Two men",
  "family.situation.twoMen.desc":
    "Joint adoption, co-parenting arrangements, or surrogacy options.",
  "family.situation.twoMen.to": "See: Adoption & Co-parenting",
  "family.situation.singleWoman.name": "Single woman",
  "family.situation.singleWoman.desc":
    "Solo IVF or IUI available through SNS and private clinics.",
  "family.situation.singleWoman.to": "See: IVF & Assisted Reproduction",
  "family.situation.singleMan.name": "Single man",
  "family.situation.singleMan.desc":
    "Solo adoption or co-parenting. Surrogacy legally complex.",
  "family.situation.singleMan.to": "See: Adoption",
  "family.situation.transParent.name": "Trans parent",
  "family.situation.transParent.desc":
    "Legal parenthood, birth registration, and assisted reproduction for trans people.",
  "family.situation.transParent.to": "See: Legal Parenthood",
  "family.situation.lookingForCoparent.name": "Looking for a co-parent",
  "family.situation.lookingForCoparent.desc":
    "Community-matched co-parenting, legal frameworks, shared custody.",
  "family.situation.lookingForCoparent.to": "See: Co-parenting",
  "family.browseFreely.cta": "I'm just exploring, show me everything",

  "family.tabs.label": "Family and parenting paths",
  "family.tab.adoption.label": "Adoption",
  "family.tab.ivf.label": "IVF & Assisted Reproduction",
  "family.tab.coparenting.label": "Co-parenting",
  "family.tab.donors.label": "Donor Questions",
  "family.tab.legal.label": "Legal Parenthood",

  "family.tab.adoption.headTitle": "Adoption in <em>Portugal</em>",
  "family.tab.adoption.headText":
    "Same-sex couples have had full adoption rights in Portugal since October 2016, including joint adoption and stepchild adoption. The process is long but navigable. Here's what the community has learned.",
  "family.tab.adoption.card.law.eyebrow": "The law",
  "family.tab.adoption.card.law.title": "Who can adopt",
  "family.tab.adoption.card.law.body":
    "Married couples and civil partners of any gender can adopt jointly. Single people can also adopt. Same-sex couples have been eligible since the 2016 amendment. Portuguese residency is required; citizenship is not.",
  "family.tab.adoption.card.process.eyebrow": "The process",
  "family.tab.adoption.card.process.title": "How it works",
  "family.tab.adoption.card.process.body":
    "Applications go through SCML (Santa Casa da Misericórdia de Lisboa) or your local Social Security office. You'll have interviews, a home study, and background checks. The process is the same for same-sex couples, though experiences vary.",
  "family.tab.adoption.card.process.note": "Typical timeline: 12–36 months",
  "family.tab.adoption.card.international.eyebrow": "International adoption",
  "family.tab.adoption.card.international.title": "Adopting from abroad",
  "family.tab.adoption.card.international.body":
    "International adoption is significantly more complex and most countries that permit it do not extend eligibility to same-sex couples. A handful of exceptions exist. Get specialist legal advice before starting this route.",
  "family.tab.adoption.card.international.linkLabel":
    "Speak to a legal specialist",
  "family.tab.adoption.card.stepchild.eyebrow": "Stepchild adoption",
  "family.tab.adoption.card.stepchild.title": "Adopting your partner's child",
  "family.tab.adoption.card.stepchild.body":
    "If your partner already has a child, you can adopt as a second parent. This is often faster than joint adoption of an unrelated child. Legal parenthood is also now possible at birth without adoption (see Legal Parenthood tab).",
  "family.tab.adoption.noteLabel": "From the community:",
  "family.tab.adoption.reviewHead":
    "Community-reviewed <em>social workers & agencies</em>",

  "family.tab.ivf.headTitle": "IVF & <em>Assisted Reproduction</em>",
  "family.tab.ivf.headText":
    "Portugal has some of the most progressive assisted reproduction laws in Europe. Since 2016, IVF and IUI are available to all women, including single women and female same-sex couples, through both the public SNS and private clinics.",
  "family.tab.ivf.card.public.eyebrow": "Public (SNS)",
  "family.tab.ivf.card.public.title": "What the state covers",
  "family.tab.ivf.card.public.body":
    "SNS covers assisted reproduction (IVF, IUI) for women up to age 40, including female same-sex couples. Treatment is heavily subsidised. Waitlists can be long: 12–24 months in Lisbon. Hospital de Santa Maria and Maternidade Alfredo da Costa are the main centres.",
  "family.tab.ivf.card.public.note": "Average co-pay: €200–600 per cycle",
  "family.tab.ivf.card.private.eyebrow": "Private clinics",
  "family.tab.ivf.card.private.title": "Going private",
  "family.tab.ivf.card.private.body":
    "Private clinics are significantly faster and offer more treatment flexibility. Costs range from €3,000–7,000 per IVF cycle, less for IUI. Several Lisbon clinics are known for experience with LGBTQ+ patients: community recommendations below.",
  "family.tab.ivf.card.private.note": "IUI: €800–1,500 · IVF: €3,000–7,000",
  "family.tab.ivf.card.transMen.eyebrow": "Trans men",
  "family.tab.ivf.card.transMen.title":
    "If you haven't had reproductive surgery",
  "family.tab.ivf.card.transMen.body":
    "Trans men who haven't had reproductive surgeries can access egg freezing or IVF. Portuguese clinics vary in experience. Ask specifically. Legal gender recognition does not affect access to fertility treatment. Community members have documented their experiences in the forum.",
  "family.tab.ivf.card.transMen.linkLabel": "Trans Hub resources",
  "family.tab.ivf.card.surrogacy.eyebrow": "Surrogacy",
  "family.tab.ivf.card.surrogacy.title": "A complex landscape",
  "family.tab.ivf.card.surrogacy.body":
    "Surrogacy has been legally contentious in Portugal. A 2016 law permitted it in limited circumstances; parts were later struck down. The legal situation remains unsettled. If this is your route, specialist legal advice is essential before you proceed.",
  "family.tab.ivf.card.surrogacy.linkLabel": "Get legal advice",
  "family.tab.ivf.noteLabel": "From the community:",
  "family.tab.ivf.reviewHead": "Community-recommended <em>clinics</em>",

  "family.tab.coparenting.headTitle":
    "Co-parenting: <em>together, differently</em>",
  "family.tab.coparenting.headText":
    "Co-parenting means raising a child with someone you're not in a romantic relationship with. It can work beautifully with clear agreements, honest communication, and legal frameworks that protect everyone, including the child.",
  "family.tab.coparenting.card.whatItMeans.eyebrow": "What it means",
  "family.tab.coparenting.card.whatItMeans.title": "How co-parenting works",
  "family.tab.coparenting.card.whatItMeans.body":
    "Two or more people agree to parent a child together without being a couple. Arrangements vary enormously: from a single primary home with regular visits, to fully shared 50/50 custody. What matters is that agreements are clear, documented, and legally robust before the child is born.",
  "family.tab.coparenting.card.findingCoparent.eyebrow": "Finding a co-parent",
  "family.tab.coparenting.card.findingCoparent.title": "Within the community",
  "family.tab.coparenting.card.findingCoparent.body":
    "QueerPulse runs a Co-parent Connections board for members who want to find a co-parent within the community. It's a notice board. Post your intentions, meet people over time, have honest conversations before anything is decided.",
  "family.tab.coparenting.card.findingCoparent.linkLabel":
    "Co-parent Connections board",
  "family.tab.coparenting.card.legalFrameworks.eyebrow": "Legal frameworks",
  "family.tab.coparenting.card.legalFrameworks.title":
    "Protecting everyone involved",
  "family.tab.coparenting.card.legalFrameworks.body":
    "In Portugal, both parents can be legally registered at birth if they are known donors or co-parents and have a prior legal agreement. A parenting agreement (acordo de co-parentalidade) is strongly recommended. Get a family law solicitor involved early.",
  "family.tab.coparenting.card.legalFrameworks.note":
    "Put this in place before conception",
  "family.tab.coparenting.card.international.eyebrow":
    "International situations",
  "family.tab.coparenting.card.international.title": "Cross-border families",
  "family.tab.coparenting.card.international.body":
    "If co-parents live in different countries, legal parenthood can become complicated. EU recognition of parenthood is improving but not yet uniform. This requires specialist cross-border family law advice.",
  "family.tab.coparenting.card.international.linkLabel":
    "International family law help",
  "family.tab.coparenting.noteLabel": "From the community:",

  "family.tab.donors.headTitle": "Donor <em>questions</em>",
  "family.tab.donors.headText":
    "Whether you're thinking about a known or unknown donor, sperm or egg donation, the legal implications vary significantly depending on your situation. Here's a clear-eyed overview.",
  "family.tab.donors.card.knownVsUnknown.eyebrow": "Known vs. unknown",
  "family.tab.donors.card.knownVsUnknown.title": "A fundamental choice",
  "family.tab.donors.card.knownVsUnknown.body":
    "An unknown donor means the clinic handles everything; legal parenthood does not attach to the donor. A known donor is more complex legally: they may or may not have parental rights, depending on what agreements are in place before donation. This is where legal advice is most important.",
  "family.tab.donors.card.spermDonation.eyebrow": "Sperm donation",
  "family.tab.donors.card.spermDonation.title": "Options in Portugal",
  "family.tab.donors.card.spermDonation.body":
    "Sperm donation is available through licensed fertility clinics (anonymous bank donors) or via known donors with legal documentation. Home insemination using a known donor sits in a legal grey area: parenthood claims are uncertain without clinic involvement and prior legal agreements.",
  "family.tab.donors.card.eggDonation.eyebrow": "Egg donation",
  "family.tab.donors.card.eggDonation.title":
    "For same-sex couples and single men",
  "family.tab.donors.card.eggDonation.body":
    "Egg donation is available through licensed private clinics in Portugal. Donors are anonymous under Portuguese law. Wait times for matched donors vary: 3–12 months is typical. The birth mother (or gestational carrier) is the legal mother unless an alternative legal route is established.",
  "family.tab.donors.card.legalParenthood.eyebrow": "Legal parenthood",
  "family.tab.donors.card.legalParenthood.title": "Who is the legal parent?",
  "family.tab.donors.card.legalParenthood.body":
    "For donors used through licensed clinics, the donor has no parental rights. For known donors, this depends entirely on prior written agreements and whether the donation was through a clinic. A family law specialist should review your situation before you proceed.",
  "family.tab.donors.card.legalParenthood.linkLabel": "Get legal advice",
  "family.tab.donors.noteLabel": "From the community:",

  "family.tab.legal.headTitle": "Legal <em>parenthood</em>",
  "family.tab.legal.headText":
    "Portuguese law has advanced significantly in recent years. Since 2022, both same-sex parents can be registered at birth without adoption in most cases. Here's what that means in practice, and where gaps remain.",
  "family.tab.legal.card.birthRegistration.eyebrow": "Birth registration",
  "family.tab.legal.card.birthRegistration.title":
    "Both parents on the certificate",
  "family.tab.legal.card.birthRegistration.body":
    "Since a 2022 legislative update, a child born to a same-sex couple (married or in a civil partnership) can have both parents registered on the birth certificate without requiring second-parent adoption. This applies to children born via assisted reproduction within licensed clinics.",
  "family.tab.legal.card.birthRegistration.note":
    "Only for married couples or civil partners",
  "family.tab.legal.card.unmarried.eyebrow": "If you're not married",
  "family.tab.legal.card.unmarried.title": "Unmarried couples",
  "family.tab.legal.card.unmarried.body":
    "If you're not married or in a civil partnership, the non-birth parent does not automatically have legal parenthood. You will need second-parent adoption or a legal agreement established before birth. This is also relevant for co-parents and known donor situations.",
  "family.tab.legal.card.unmarried.linkLabel":
    "Marriage & civil partnership info",
  "family.tab.legal.card.transParents.eyebrow": "Trans parents",
  "family.tab.legal.card.transParents.title":
    "Gender recognition and parenthood",
  "family.tab.legal.card.transParents.body":
    "A trans man who gives birth is legally the father if his legal gender has been changed to male. A trans woman whose partner carries the child can be registered as the mother. Portuguese law has accommodated these situations, though administrative practice varies. Document everything.",
  "family.tab.legal.card.transParents.linkLabel": "Trans Hub legal resources",
  "family.tab.legal.card.secondParentAdoption.eyebrow":
    "Second-parent adoption",
  "family.tab.legal.card.secondParentAdoption.title": "Still a valid route",
  "family.tab.legal.card.secondParentAdoption.body":
    "Second-parent adoption remains available and is sometimes the clearer option, especially for children born before the 2022 updates, or in complex international situations. It also applies to children born in other countries whose parentage Portugal may not automatically recognise.",
  "family.tab.legal.step.legalStatus.title":
    "Establish your legal status as a couple",
  "family.tab.legal.step.legalStatus.text":
    "Marriage or civil partnership is the clearest route to automatic joint parenthood at birth. This can be done quickly at the conservatória.",
  "family.tab.legal.step.notifyClinic.title":
    "Notify the clinic before conception",
  "family.tab.legal.step.notifyClinic.text":
    "Ensure the clinic is using the correct legal framework. Get written confirmation of how parenthood will be recorded.",
  "family.tab.legal.step.notifyClinic.time": "At the start of treatment",
  "family.tab.legal.step.registerBirth.title":
    "Register the birth with both parents",
  "family.tab.legal.step.registerBirth.text":
    "At the hospital or conservatória within 20 days. Bring your marriage/civil partnership documentation. If there are complications, a lawyer can accompany you.",
  "family.tab.legal.step.registerBirth.time": "Within 20 days of birth",
  "family.tab.legal.step.willGuardianship.title":
    "Consider a will and guardianship document",
  "family.tab.legal.step.willGuardianship.text":
    "Even with full legal parenthood, it's worth having a will specifying guardianship in case of death. A family lawyer can draft this in a few hours.",
  "family.review.starsAriaLabel": "{stars} out of 5",
  "family.review.liveEmpty.title": "Community reviews coming soon",
  "family.review.liveEmpty.description":
    "Members haven't shared reviews of clinics, agencies and social workers here yet. As people go through the process, their recommendations will appear here.",
  "family.note.liveEmpty.title": "Community stories coming soon",
  "family.note.liveEmpty.description":
    "Once members share how their own family came together, their words will show up here.",

  "family.talk.heading": "Talk to someone who's <em>been there.</em>",
  "family.talk.body":
    "The Queer Parent Network connects people who are building families with members who've already been through it: same routes, similar situations. Not professionals. Just people who've done it and want to help.",
  "family.talk.findMentorCta": "Find a peer mentor",
  "family.talk.networkCta": "Queer Parent Network",
  "family.talk.forumCta.heading": "Questions the page <em>doesn't answer?</em>",
  "family.talk.forumCta.body":
    "The Family Building forum thread is where members share current experience, ask questions, and support each other through a process that no guide can fully capture.",
  "family.talk.forumCta.openForumCta": "Open the forum thread",
  "family.talk.forumCta.legalResourcesCta": "Legal resources",
  "family.talk.liveEmpty.title": "Parent mentors coming soon",
  "family.talk.liveEmpty.description":
    "No peer mentors have offered to share their experience yet. Already raising a family? Put your name forward and help someone just starting out.",

  "family.outro.title": "Your family is <em>real.</em>",
  "family.outro.sub":
    "Whatever route you take, whatever shape it takes. The community is here.",
  "family.outro.cta": "Join QueerPulse",

  // ── Queer Parent Network section (ParentNetwork.tsx) ──────────────────────
  "parentNetwork.eyebrow": "Queer Parent Network · Already a parent?",
  "parentNetwork.heading":
    "For the families <em>often overlooked</em> in queer spaces.",
  "parentNetwork.lead":
    "LGBTQ+ parents, co-parents, and people navigating parenthood: biological, adoptive, chosen, and everything in between. Less a forum, more a standing arrangement between families who help each other through the practical and the heavy alike.",
  "parentNetwork.stat.parents": "parents & co-parents",
  "parentNetwork.stat.meetups": "meetups a month",
  "parentNetwork.stat.kids": "kids in the playdate group",
  "parentNetwork.offer.healthcare.title": "Affirming healthcare",
  "parentNetwork.offer.healthcare.body":
    "A shared, vetted list of paediatricians and GPs who treat two mums, two dads, and every family on the intake form as a matter of fact.",
  "parentNetwork.offer.schools.title": "Schools & paperwork",
  "parentNetwork.offer.schools.body":
    "Which schools get it right, how to handle forms that assume a mother and a father, and members who've been through the same admissions.",
  "parentNetwork.offer.playdates.title": "Playdates & childcare",
  "parentNetwork.offer.playdates.body":
    "A standing playdate group, swap-sitting between trusted members, and weekend gatherings where no one has to explain their family.",
  "parentNetwork.offer.vent.title": "A place to vent",
  "parentNetwork.offer.vent.body":
    "Co-parenting logistics, surrogacy and adoption journeys, and the small daily things, with people who actually get it.",
  "parentNetwork.comingUp.heading": "Coming up <em>soon.</em>",
  "parentNetwork.comingUp.lead":
    "Most months bring a daytime playdate and an evening for the grown-ups. Kids welcome unless we say otherwise.",
  "parentNetwork.comingUp.liveEmpty.title": "No meetups scheduled yet",
  "parentNetwork.comingUp.liveEmpty.description":
    "Nothing is on the calendar right now. Playdates and grown-up evenings will show up here as members organise them.",
  "parentNetwork.tag.playdate": "Playdate",
  "parentNetwork.tag.social": "Social",
  "parentNetwork.tag.workshop": "Workshop",
  "parentNetwork.resource.legalRights": "Legal rights as a queer family",
  "parentNetwork.resource.healthcareGuides": "Healthcare & document guides",

  // ── Reading Groups page (ReadingGroupsPage.tsx + sub-components) ──────────
  "readingGroups.hero.eye": "Community · Reading",
  "readingGroups.hero.titleLine1": "Read together.",
  "readingGroups.hero.titleLine2": "<em>Trust faster.</em>",
  "readingGroups.hero.sub":
    "Small groups, one book, one month. No homework anxiety, no gatekeeping. The best way to find your people in a new city is to argue about a book with them.",
  "readingGroups.why.curated.title": "Queer-curated books",
  "readingGroups.why.curated.desc":
    "Every group chooses its own reading. We do not tell you what matters.",
  "readingGroups.why.small.title": "Small by design",
  "readingGroups.why.small.desc":
    "Groups cap at 6–8 people. Real conversations among a small group.",
  "readingGroups.why.mixed.title": "Mixed formats",
  "readingGroups.why.mixed.desc":
    "In-person in cafés and homes. Online for those outside Lisbon or with access needs.",
  "readingGroups.filterBar.genreLabel": "Genre",
  "readingGroups.filterBar.formatLabel": "Format",
  "readingGroups.filterBar.count_one": "{count} group",
  "readingGroups.filterBar.count_other": "{count} groups",
  "readingGroups.genre.all": "All",
  "readingGroups.genre.fiction": "Fiction",
  "readingGroups.genre.nonfiction": "Non-fiction",
  "readingGroups.genre.theory": "Theory",
  "readingGroups.genre.poetry": "Poetry",
  "readingGroups.genre.memoir": "Memoir",
  "readingGroups.format.filter.any": "Any",
  "readingGroups.format.filter.irl": "In-person",
  "readingGroups.format.filter.online": "Online",
  "readingGroups.card.formatPrefix.irl": "In person · ",
  "readingGroups.card.formatPrefix.online": "Online · ",
  "readingGroups.empty.title": "No groups match those filters",
  "readingGroups.empty.description":
    "Nothing fits this genre and format combination yet. Try widening your filters, or start a group around the book you want to read.",
  "readingGroups.empty.clearFiltersCta": "Clear filters",
  "readingGroups.liveEmpty.title": "No reading groups yet",
  "readingGroups.liveEmpty.description":
    "No groups have been listed yet. Be the first: propose one below and gather your people around a book.",
  "readingGroups.outro.title": "Books build <em>community.</em>",
  "readingGroups.outro.sub":
    "QueerPulse reading groups have been running since 2024. Some have turned into friendships, some into collaborations, two into bands.",
  "readingGroups.outro.cta": "Join the network",
  "readingGroups.joinedWaitlistToast":
    "You're #{position} on the waitlist for {name}",

  "readingGroups.card.spots.full": "Full",
  "readingGroups.card.spots.left_one": "{count} spot left",
  "readingGroups.card.spots.left_other": "{count} spots left",
  "readingGroups.card.joinWaitlistCta": "Join waitlist",
  "readingGroups.card.requestToJoinCta": "Request to join",
  "readingGroups.card.onWaitlist": "On waitlist · #{position}",
  "readingGroups.card.waitlistUnavailable": "Waitlist opening soon",
  "readingGroups.card.joinUnavailable": "Introductions opening soon",

  "readingGroups.waitlist.heading": "You're on the <em>waitlist.</em>",
  "readingGroups.waitlist.sub":
    "We'll let you know the moment a spot opens up. No need to keep checking back.",
  "readingGroups.waitlist.position": "You're #{position}",

  "readingGroups.listGroup.heading": "Start your <em>own group.</em>",
  "readingGroups.listGroup.lead":
    "Pick a book. Say how many people you want. Say where and when. We will list it here and match you with members who want to read the same thing.",
  "readingGroups.listGroup.leadLive":
    "Pick a book. Say how many people you want. Send it to us and we'll come back to you about starting the group and finding your readers.",
  "readingGroups.listGroup.bookLabel": "Book title & author",
  "readingGroups.listGroup.bookPlaceholder":
    "e.g. Giovanni's Room by James Baldwin",
  "readingGroups.listGroup.whyLabel": "Why this book?",
  "readingGroups.listGroup.whyPlaceholder":
    "One sentence: what made you choose it?",
  "readingGroups.listGroup.formatLabel": "Format",
  "readingGroups.listGroup.formatOption.inPerson": "In-person",
  "readingGroups.listGroup.formatOption.online": "Online",
  "readingGroups.listGroup.formatOption.either": "Either",
  "readingGroups.listGroup.maxLabel": "Max people",
  "readingGroups.listGroup.submitCta": "List my group",
  "readingGroups.listGroup.submitPending": "Listing…",
  "readingGroups.listGroup.submitProposeCta": "Send my proposal",
  "readingGroups.listGroup.submitProposePending": "Sending…",
  "readingGroups.listGroup.successToast":
    "Group listed. We'll find your readers",
  "readingGroups.listGroup.proposalToast":
    "Proposal received. We'll be in touch",
  "readingGroups.listGroup.proposalHeading": "Proposal <em>received.</em>",
  "readingGroups.listGroup.proposalBody":
    "We have your proposal for <strong>{book}</strong>. Nothing is listed in the directory yet: someone will read it and come back to you about starting the group.",
  "readingGroups.listGroup.proposeAnotherCta": "Propose another group",
  "readingGroups.listGroup.errorToast":
    "Couldn't list your group. Please try again.",
  "readingGroups.listGroup.successHeading": "Your group is <em>listed.</em>",
  "readingGroups.listGroup.successBody":
    "<strong>{book}</strong> is live at the top of the directory. We'll start matching you with members who want to read the same thing.",
  "readingGroups.listGroup.newGroupDesc":
    "A new reading group, just listed. Members will be matched soon.",
  "readingGroups.listGroup.listAnotherCta": "List another group",
  "readingGroups.listGroup.defaultName": "Your new group",
  "readingGroups.listGroup.defaultAuthor": "You",
  "readingGroups.listGroup.defaultWhereOnline": "Online",
  "readingGroups.listGroup.defaultWhereIrl": "Lisbon (TBC)",
  "readingGroups.listGroup.defaultFrequency": "Monthly",
  "readingGroups.listGroup.defaultLang": "EN / PT",

  // ── Live directory (a reading group IS a community tagged `book-club`) ────
  "readingGroups.card.formatPrefix.either": "In person or online · ",
  "readingGroups.card.members_one": "{count} member",
  "readingGroups.card.members_other": "{count} members",
  "readingGroups.card.openGroupCta": "Open the group",
  "readingGroups.card.requestPendingCta": "Sending…",
  "readingGroups.card.requestSentCta": "Request sent",
  "readingGroups.card.joinedToast": "You're in. Say hello in the group",
  "readingGroups.card.requestedToast":
    "Request sent. The person who runs the group decides who joins",
  "readingGroups.card.joinErrorToast":
    "Couldn't send your request. Please try again.",
  "readingGroups.liveError.title": "The directory didn't load",
  "readingGroups.liveError.description":
    "Something went wrong fetching the groups. This is usually momentary.",
  "readingGroups.liveError.retryCta": "Try again",
  // OPS-05, the admin console's "Offer support" modal. These two live in this
  // namespace rather than in `admin` for the same reason `changemakers.admin.*`
  // does: they are admin-facing copy about a community, and the `admin`
  // catalog owns the rest of that modal's strings already.
  "supportOffer.admin.sendingCta": "Sending…",
  "supportOffer.admin.conflictToast":
    "{name} already has an offer waiting for an answer. Give their moderators time to reply.",
};

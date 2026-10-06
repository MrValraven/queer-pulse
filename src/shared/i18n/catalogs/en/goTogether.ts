import type { Catalog } from "../../types";

/**
 * Go together: members going to a gathering alone (or with one friend) answer
 * a short friendship questionnaire and arrive with a small group. The
 * questionnaire keys mirror the stable ids in the backend's
 * `go-together/go-together-questionnaire.catalog.ts`, so a key name here is a
 * wire id there. Neighbourhood names are proper nouns and stay untranslated;
 * only the three wide areas carry keys.
 */
export const goTogether: Catalog = {
  "product.name": "Go together",

  // ── Values: how much each matters in your life ────────────────────────────
  "questionnaire.values.community.label": "Community and activism",
  "questionnaire.values.creativity.label": "Creativity",
  "questionnaire.values.family.label": "Family, chosen or given",
  "questionnaire.values.fun.label": "Fun and pleasure",
  "questionnaire.values.career.label": "Career and achievement",
  "questionnaire.values.spirituality.label": "Spirituality",
  "questionnaire.values.scale.1": "Not really",
  "questionnaire.values.scale.2": "A little",
  "questionnaire.values.scale.3": "Somewhat",
  "questionnaire.values.scale.4": "A lot",
  "questionnaire.values.scale.5": "Everything",

  // ── Humour: one example line per style, pick the funnier one ──────────────
  // h1 absurd / dry
  "questionnaire.humour.h1.a":
    "I'm fairly sure my cat records a podcast while I'm at work.",
  "questionnaire.humour.h1.b":
    "I love making plans. The cancelled ones are my favourite.",
  // h2 camp / wordplay
  "questionnaire.humour.h2.a":
    "Darling, it's a picnic. I've packed three outfits and one sandwich.",
  "questionnaire.humour.h2.b":
    "I'm reading a book about anti-gravity. It's impossible to put down.",
  // h3 dark / wholesome
  "questionnaire.humour.h3.a":
    "I've already picked my funeral playlist. At least everyone will dance.",
  "questionnaire.humour.h3.b":
    "Saw a dog in a tiny raincoat this morning. The whole week is saved.",
  // h4 self-deprecating / observational
  "questionnaire.humour.h4.a":
    "My sense of direction is so bad I once got lost on my own street.",
  "questionnaire.humour.h4.b":
    "Every group chat has someone replying to a three-day-old message like it's breaking news.",
  // h5 absurd / camp
  "questionnaire.humour.h5.a":
    "The seagulls in Lisbon are clearly planning something, and honestly I'd join in.",
  "questionnaire.humour.h5.b":
    "Every bus stop is a runway if you believe hard enough.",
  // h6 dry / dark
  "questionnaire.humour.h6.a":
    "I tried to be spontaneous once. I put it in my calendar.",
  "questionnaire.humour.h6.b":
    "My houseplants trust me completely. That's their first mistake.",
  // h7 wordplay / observational
  "questionnaire.humour.h7.a":
    "The baker quit. They just couldn't make enough dough.",
  "questionnaire.humour.h7.b":
    "Why does everyone become a weather expert the moment it rains in Lisbon?",
  // h8 wholesome / self-deprecating
  "questionnaire.humour.h8.a":
    "The grandmother next door taught me to bake bread. She now introduces me as her apprentice.",
  "questionnaire.humour.h8.b":
    "I've started fourteen hobbies this year. My guitar would like a word.",

  // ── Interests: families (same names as the gathering catalog) ─────────────
  "questionnaire.interests.family.meet": "Meet and play",
  "questionnaire.interests.family.eat": "Eat and drink",
  "questionnaire.interests.family.party": "Party and nightlife",
  "questionnaire.interests.family.make": "Make and create",
  "questionnaire.interests.family.learn": "Learn and talk",
  "questionnaire.interests.family.watch": "Watch and listen",
  "questionnaire.interests.family.move": "Move and outdoors",
  "questionnaire.interests.family.care": "Care and support",
  "questionnaire.interests.family.organise": "Organise and act",

  // ── Interests: tags ───────────────────────────────────────────────────────
  // meet
  "questionnaire.interests.tag.coffeeChats": "Coffee chats",
  "questionnaire.interests.tag.boardGames": "Board games",
  "questionnaire.interests.tag.quizNights": "Quiz nights",
  "questionnaire.interests.tag.languageExchange": "Language exchange",
  "questionnaire.interests.tag.bookClubs": "Book clubs",
  "questionnaire.interests.tag.walksAndTalks": "Walks and talks",
  "questionnaire.interests.tag.brunch": "Brunch",
  // eat
  "questionnaire.interests.tag.cooking": "Cooking",
  "questionnaire.interests.tag.supperClubs": "Supper clubs",
  "questionnaire.interests.tag.plantBased": "Plant-based food",
  "questionnaire.interests.tag.baking": "Baking",
  "questionnaire.interests.tag.streetFood": "Street food",
  "questionnaire.interests.tag.cafes": "Cafés",
  "questionnaire.interests.tag.wineAndVinho": "Wine and vinho verde",
  // party
  "questionnaire.interests.tag.dragShows": "Drag shows",
  "questionnaire.interests.tag.karaoke": "Karaoke",
  "questionnaire.interests.tag.clubNights": "Club nights",
  "questionnaire.interests.tag.queerBars": "Queer bars",
  "questionnaire.interests.tag.festivals": "Festivals",
  "questionnaire.interests.tag.ballroom": "Ballroom",
  "questionnaire.interests.tag.liveGigs": "Live gigs",
  // make
  "questionnaire.interests.tag.crafts": "Crafts",
  "questionnaire.interests.tag.zines": "Zines",
  "questionnaire.interests.tag.photography": "Photography",
  "questionnaire.interests.tag.drawing": "Drawing",
  "questionnaire.interests.tag.knitting": "Knitting",
  "questionnaire.interests.tag.pottery": "Pottery",
  "questionnaire.interests.tag.writing": "Writing",
  // learn
  "questionnaire.interests.tag.queerHistory": "Queer history",
  "questionnaire.interests.tag.museums": "Museums",
  "questionnaire.interests.tag.workshops": "Workshops",
  "questionnaire.interests.tag.science": "Science",
  "questionnaire.interests.tag.philosophy": "Philosophy",
  "questionnaire.interests.tag.tech": "Tech",
  // watch
  "questionnaire.interests.tag.cinema": "Cinema",
  "questionnaire.interests.tag.theatre": "Theatre",
  "questionnaire.interests.tag.standUp": "Stand-up comedy",
  "questionnaire.interests.tag.tvSeries": "TV series",
  "questionnaire.interests.tag.anime": "Anime",
  "questionnaire.interests.tag.dancePerformance": "Dance performance",
  // move
  "questionnaire.interests.tag.hiking": "Hiking",
  "questionnaire.interests.tag.running": "Running",
  "questionnaire.interests.tag.yoga": "Yoga",
  "questionnaire.interests.tag.swimming": "Swimming",
  "questionnaire.interests.tag.cycling": "Cycling",
  "questionnaire.interests.tag.climbing": "Climbing",
  "questionnaire.interests.tag.beach": "Beach days",
  "questionnaire.interests.tag.teamSports": "Team sports",
  // care
  "questionnaire.interests.tag.meditation": "Meditation",
  "questionnaire.interests.tag.wellbeingCircles": "Wellbeing circles",
  "questionnaire.interests.tag.plants": "Plants",
  "questionnaire.interests.tag.pets": "Pets",
  "questionnaire.interests.tag.tarot": "Tarot",
  // organise
  "questionnaire.interests.tag.activism": "Activism",
  "questionnaire.interests.tag.volunteering": "Volunteering",
  "questionnaire.interests.tag.prideOrganising": "Organising Pride",
  "questionnaire.interests.tag.mutualAid": "Mutual aid",
  "questionnaire.interests.tag.politics": "Politics",

  // ── Music ─────────────────────────────────────────────────────────────────
  "questionnaire.music.pop": "Pop",
  "questionnaire.music.indie": "Indie",
  "questionnaire.music.rock": "Rock",
  "questionnaire.music.electronic": "Electronic",
  "questionnaire.music.techno": "Techno",
  "questionnaire.music.house": "House",
  "questionnaire.music.hipHop": "Hip-hop",
  "questionnaire.music.rnb": "R&B",
  "questionnaire.music.jazz": "Jazz",
  "questionnaire.music.classical": "Classical",
  "questionnaire.music.fado": "Fado",
  "questionnaire.music.brazilian": "Brazilian music",
  "questionnaire.music.afrobeats": "Afrobeats",
  "questionnaire.music.latin": "Latin",
  "questionnaire.music.metal": "Metal",
  "questionnaire.music.punk": "Punk",
  "questionnaire.music.folk": "Folk",
  "questionnaire.music.soul": "Soul",
  "questionnaire.music.disco": "Disco",
  "questionnaire.music.kpop": "K-pop",
  "questionnaire.music.hyperpop": "Hyperpop",
  "questionnaire.music.ambient": "Ambient",
  "questionnaire.music.musicals": "Musicals",
  "questionnaire.music.country": "Country",
  "questionnaire.music.funk": "Funk",

  // ── Energy: 1 is the low anchor, 5 the high one ───────────────────────────
  "questionnaire.energy.talker.low": "I'm more of a listener",
  "questionnaire.energy.talker.high": "I'll happily lead the chat",
  "questionnaire.energy.nightShape.low": "A calm chat somewhere cosy",
  "questionnaire.energy.nightShape.high": "Dancing till late",
  "questionnaire.energy.planner.low": "I go with the flow",
  "questionnaire.energy.planner.high": "I like to have a plan",

  // ── Intent and rhythm ─────────────────────────────────────────────────────
  "questionnaire.intent.closeFriends": "Close friends",
  "questionnaire.intent.activityBuddies": "People to do things with",
  "questionnaire.intent.both": "A bit of both",
  "questionnaire.frequency.monthly": "About once a month",
  "questionnaire.frequency.fewTimesAMonth": "A few times a month",
  "questionnaire.frequency.weekly": "Every week",

  // ── Dealbreakers ──────────────────────────────────────────────────────────
  "questionnaire.language.pt": "Portuguese",
  "questionnaire.language.en": "English",
  "questionnaire.language.es": "Spanish",
  "questionnaire.language.fr": "French",
  "questionnaire.language.de": "German",
  "questionnaire.drinking.soberGroup": "I'd like a sober group",
  "questionnaire.drinking.eitherWay": "Either way is fine",
  "questionnaire.drinking.willDrink": "I'll probably have a drink",
  "questionnaire.age.18-24": "18 to 24",
  "questionnaire.age.25-34": "25 to 34",
  "questionnaire.age.35-44": "35 to 44",
  "questionnaire.age.45-54": "45 to 54",
  "questionnaire.age.55+": "55 and over",
  "questionnaire.agePreference.similar": "People around my age",
  "questionnaire.agePreference.any": "Any age",

  // ── Area: the wide areas (neighbourhoods keep their own names) ────────────
  "questionnaire.area.lisbonMetro": "Greater Lisbon",
  "questionnaire.area.porto": "Porto",
  "questionnaire.area.elsewhere": "Somewhere else",

  // ── Identity lens (only ever shown on the member's own opt-in step) ───────
  "lens.transNonBinary.label": "Trans and non-binary folks",
  "lens.transNonBinary.description":
    "You'll be grouped with other trans and non-binary members who chose this too.",
  "lens.womenFemmes.label": "Women and femmes",
  "lens.womenFemmes.description":
    "Trans-inclusive, always. You'll be grouped with other women and femmes who chose this too.",
  "lens.queerPoc.label": "Queer people of colour",
  "lens.queerPoc.description":
    "You'll be grouped with other queer people of colour who chose this too.",

  // ── Group band ────────────────────────────────────────────────────────────
  "band.strong": "Strong fit",
  "band.good": "Good fit",

  // ── Group reasons ─────────────────────────────────────────────────────────
  "reason.interestsEveryone": "You all picked {tags}",
  "reason.interestsSome": "{count} of you picked {tags}",
  "reason.musicEveryone": "You all listen to {tags}",
  "reason.musicSome": "{count} of you listen to {tags}",
  "reason.energy.calm": "Similar energy: calm, chatty nights",
  "reason.energy.balanced": "Similar energy: a bit of chat, a bit of dancing",
  "reason.energy.lively": "Similar energy: up for dancing till late",
  "reason.areaEveryone": "You all live around {area}",
  "reason.areaSome": "{count} of you live around {area}",
  "reason.hostQuestion": "You all answered “{option}” to “{prompt}”",

  // ── Icebreakers: light prompts for the group card ─────────────────────────
  "icebreaker.1": "What's your favourite way to spend a Sunday?",
  "icebreaker.2": "What's a small thing that made you happy this week?",
  "icebreaker.3": "What's the last thing you learned just for fun?",
  "icebreaker.4": "If you could master any skill overnight, what would it be?",
  "icebreaker.5": "Which song do you always let play to the end?",
  "icebreaker.6": "What's the best thing you've eaten lately?",
  "icebreaker.7": "Which place in your city would you love to show a visitor?",
  "icebreaker.8": "What's a hobby you'd like to try this year?",
  "icebreaker.9": "What's the best piece of advice anyone has given you?",
  "icebreaker.10":
    "Which film or series would you recommend to this whole group?",
  "icebreaker.11":
    "What does your perfect free day look like, from breakfast on?",
  "icebreaker.12": "What's something you're looking forward to this month?",

  // UI copy for the card, questionnaire, group, feedback, host and settings surfaces.
  "card.body": "Get matched with a small group to go together.",
  "card.closed.note": "Go together has closed for this gathering.",
  "card.error.alreadyGrouped": "You're already in a group for this gathering.",
  "card.error.generic": "That didn't go through. Try again in a moment.",
  "card.error.ineligible":
    "Go together isn't available on your account right now.",
  "card.error.invalidAnswers":
    "The host's questions changed. Answer each one again, then confirm.",
  "card.error.lensConsent":
    "Tick the box to confirm your lens, or choose No lens.",
  "card.error.lensMismatch":
    "This pair can't go ahead with that lens choice. Choose another, or go solo.",
  "card.error.locked": "Groups have already formed for this gathering.",
  "card.error.partnerUnavailable":
    "That friend can't go together with you for this gathering. They may not be going yet. Pick someone else, or go solo.",
  "card.error.profileNeeded":
    "Answer the Go together questions first, then come back to join.",
  "card.error.unavailable":
    "Go together isn't running for this gathering anymore.",
  "card.ineligible.unavailableBody":
    "You're still welcome at this gathering as you are.",
  "card.ineligible.unavailableTitle":
    "Go together isn't available on your account right now",
  "card.ineligible.verifyBody":
    "Go together is for verified members, so everyone in a group knows the others are who they say.",
  "card.ineligible.verifyCta": "Verify my account",
  "card.ineligible.verifyTitle": "Verify your account to join",
  "card.lens.consent":
    "I'm choosing this lens for myself. QueerPulse uses it only to group me for this gathering and deletes it once the gathering is over.",
  "card.lens.hint":
    "Only you see this choice. With a lens, you're grouped only with members who chose the same one.",
  "card.lens.none.description": "Group me with anyone who's going.",
  "card.lens.none.label": "No lens",
  "card.lens.title": "Choose a lens, if you like",
  "card.mode.pair.description":
    "You and one connection who's also going, matched into a group as a pair.",
  "card.mode.pair.label": "With a friend",
  "card.mode.solo.description":
    "Just you. You'll meet the whole group together.",
  "card.mode.solo.label": "Solo",
  "card.mode.title": "How are you going?",
  "card.optIn.cancel": "Go back",
  "card.optIn.confirm": "Count me in",
  "card.optIn.sending": "Saving",
  "card.pairInvite.accept": "Accept",
  "card.pairInvite.body":
    "Say yes and you'll both be matched into a small group for this gathering.",
  "card.pairInvite.confirm": "Go with {name}",
  "card.pairInvite.decline": "Decline",
  "card.pairInvite.title": "{name} wants to go together",
  "card.partner.empty":
    "No connections to pick yet. You can go solo and meet the group.",
  "card.partner.hint":
    "Pick one connection who's also going. They'll get an invite to join you.",
  "card.partner.loadError": "Your connections didn't load.",
  "card.partner.loading": "Loading your connections",
  "card.partner.search": "Search your connections",
  "card.partner.title": "Who are you going with?",
  "card.questionnaire.body":
    "First, a few questions about what you enjoy and how you like to spend time with people. You answer once, and we use it for every gathering.",
  "card.questionnaire.cta": "Answer the questions",
  "card.questionnaire.refreshBody":
    "A few questions have changed since you last answered. Update them and you're ready to join.",
  "card.questionnaire.refreshCta": "Update my answers",
  "card.title": "Going solo or with one friend?",
  "card.unmatched.body":
    "If more people join, we'll still try to group you until 6 hours before it starts.",
  "card.unmatched.title": "Not enough people for a group yet",
  "card.waiting.body":
    "You're in. We'll let you know as soon as your group is ready.",
  "card.waiting.change": "Change how I'm going",
  "card.waiting.demoReveal": "Reveal my demo group",
  "card.waiting.leave": "Stop looking for a group",
  "card.waiting.pairAccepted":
    "You're going with {name}. We'll match you both into the same group.",
  "card.waiting.pairPending":
    "Waiting for {name} to say yes. If they haven't by then, we'll match you solo.",
  "card.waiting.saveChange": "Save changes",
  "card.waiting.title": "Your group lands {day} at {time}",
  "card.waiting.titleSoon": "Your group lands soon",
  "feedback.backToEvents": "Back to your events",
  "feedback.backToGathering": "Back to the gathering",
  "feedback.click.no": "No",
  "feedback.click.somewhat": "Somewhat",
  "feedback.click.yes": "Yes",
  "feedback.clickQuestion.title": "Did the group click?",
  "feedback.closed.body":
    "Meet-again answers are only open for 7 days after a gathering.",
  "feedback.closed.title": "This round of feedback has closed",
  "feedback.confirmation.body":
    "If someone said yes back, you'll both hear about it.",
  "feedback.confirmation.title": "Thanks for",
  "feedback.goAgain.ariaLabel": "Go together again",
  "feedback.goAgain.description":
    "If two or more of you join another gathering, we'll group you together again.",
  "feedback.goAgain.title": "Go together again",
  "feedback.likingGap":
    "People usually underestimate how much others enjoyed their company.",
  "feedback.loading": "Loading your group",
  "feedback.option.maybe": "Maybe",
  "feedback.option.no": "Not for me",
  "feedback.option.yes": "Yes",
  "feedback.privateNote":
    "Only you see this. You won't be grouped together again.",
  "feedback.row.ariaLabel": "Meet {name} again?",
  "feedback.saveCta": "Save",
  "feedback.saveError": "Couldn't save. Try again.",
  "feedback.savingLabel": "Saving",
  "feedback.title": "How did it go?",
  "feedback.titleWithEvent": "How did {title} go?",
  "group.avatarsLabel_one": "{count} person in your group",
  "group.avatarsLabel_other": "{count} people in your group",
  "group.bannerLabel": "Your Go together group for {title}",
  "group.checkIn.here": "I'm here",
  "group.checkIn.hint":
    "Only your group sees this. Nothing is posted in the chat.",
  "group.checkIn.left": "I've left",
  "group.checkIn.statusHere": "Your group can see you've arrived.",
  "group.checkIn.statusLeft": "Your group can see you've left.",
  "group.dissolved": "This group has ended.",
  "group.entryTitle": "Your group for this gathering",
  "group.error.checkInClosed": "Check-in has closed for this gathering.",
  "group.error.generic": "That didn't go through. Try again in a moment.",
  "group.error.mergeExpired":
    "That group has filled up or closed. You're still in your current group.",
  "group.feedbackCta": "Tell us how it went",
  "group.icebreakers.title": "Something to start with",
  "group.leave": "Leave group",
  "group.leaveConfirm.confirm": "Leave group",
  "group.leaveConfirm.description":
    "You'll leave the group chat too. The others see the usual note that you left, and nothing more.",
  "group.leaveConfirm.title": "Leave this group?",
  "group.loadError": "We couldn't load your group",
  "group.meetingPoint.heading": "Where to meet",
  "group.meetingPoint.label": "Suggested by the host",
  "group.membersHeading": "Who's going with you",
  "group.merge.accept": "Join another group",
  "group.merge.body":
    "Another group going to this gathering has room. You can join it if you'd like.",
  "group.merge.title": "Your group got smaller",
  "group.openChat": "Open group chat",
  "group.pairPartner": "Coming with you",
  "group.reasonsHeading": "What you have in common",
  "group.report": "Report this group",
  "group.reportAria": "Report this group chat for {title}",
  "group.bannerTitle": "Your Go together group",
  "group.seeGroup": "See your group",
  "group.sharePlans": "Tell someone where you'll be",
  "group.sheetLabel": "Your Go together group",
  "group.status.here": "Here",
  "group.status.left": "Left",
  "group.you": "You",
  "host.closedNote":
    "Opt-in has closed for this gathering, so these settings can't change now.",
  "host.create.description":
    "People coming alone or with one friend can get matched into small groups to arrive together. Add questions and a meeting point from Manage.",
  "host.create.title": "Offer Go together",
  "host.cutoff.error": "Pick a time in the range above.",
  "host.cutoff.hint":
    "Defaults to 48 hours before the start. You can pick any time from {earliest} to {latest}.",
  "host.cutoff.label": "When matching runs",
  "host.enable.description":
    "People going can ask to be matched until matching runs, 48 hours before the start unless you pick another time.",
  "host.enable.title": "Offer Go together",
  "host.heading": "Go together",
  "host.intro":
    "Lets people coming alone or with one friend get matched into small groups to arrive together.",
  "host.loadError": "Go together settings didn't load",
  "host.lockedNote":
    "Matching has run for this gathering, so these settings are locked.",
  "host.meetingPoint.hint": "Pick a public spot near the venue.",
  "host.meetingPoint.label": "Meeting point",
  "host.meetingPoint.placeholder": "By the kiosk at the park entrance",
  "host.questions.addAnswer": "Add an answer",
  "host.questions.addQuestion": "Add a question",
  "host.questions.answerLabel": "Answer {number}",
  "host.questions.answersLabel": "Answers",
  "host.questions.error":
    "Each question needs its wording and at least 2 answers.",
  "host.questions.hint":
    "Up to 2 questions, with 2 to 4 answers each. People who pick the same answer are more likely to share a group.",
  "host.questions.label": "Fun questions",
  "host.questions.promptLabel": "Question {number}",
  "host.questions.reaskHint":
    "If you change or add a question, people already waiting answer it on their card.",
  "host.offConfirm.title": "Switch Go together off?",
  "host.offConfirm.description":
    "Members waiting for a group will be told there is no group this time. Groups that already formed stay together. If you switch it back on, they'll need to opt in again.",
  "host.offConfirm.confirm": "Switch it off",
  "host.offConfirm.cancel": "Keep it on",
  "host.questions.promptPlaceholder": "Picnic blanket or dance floor?",
  "host.questions.removeAnswer": "Remove answer {number}",
  "host.questions.removeQuestion": "Remove question {number}",
  "host.save": "Save changes",
  "host.saving": "Saving",
  "host.summary.groups_one": "group formed",
  "host.summary.groups_other": "groups formed",
  "host.summary.heading": "So far",
  "host.summary.note": "You see counts only. Who opted in stays private.",
  "host.summary.waiting_one": "person waiting",
  "host.summary.waiting_other": "people waiting",
  "host.toast.badCutoff":
    "Go together couldn't be saved: the matching time no longer fits this gathering. Try again.",
  "host.toast.closed":
    "Opt-in has closed for this gathering, so these settings stay as they are.",
  "host.toast.locked":
    "Matching has already run, so these settings are locked.",
  "host.toast.publishSwitchFailed":
    "Go together couldn't be switched on. You can turn it on from Manage.",
  "host.toast.saveError": "Couldn't save your Go together settings. Try again.",
  "host.toast.saved": "Go together settings saved",
  "questionnaire.age.hint": "Only used to form groups. Nobody else sees it.",
  "questionnaire.age.label": "Your age",
  "questionnaire.agePreference.label": "Ages in your group",
  "questionnaire.area.groupLisbon": "Lisbon neighbourhoods",
  "questionnaire.area.groupWide": "Wider areas",
  "questionnaire.area.label": "Your area",
  "questionnaire.area.placeholder": "Pick a neighbourhood or area",
  "questionnaire.area.search": "Search areas",
  "questionnaire.area.skip": "Clear and skip",
  "questionnaire.consent.agree":
    "I agree to QueerPulse using these answers to suggest groups for me.",
  "questionnaire.consent.delete":
    "You can see, edit or delete everything any time in <link>Settings, Data & privacy</link>.",
  "questionnaire.consent.private":
    "Hosts and other members never see your answers.",
  "questionnaire.consent.reasons":
    "When your group forms, only the interests, music, energy and area you share with them can show up as reasons you were grouped.",
  "questionnaire.consent.retention":
    "If 12 months pass without you editing them or signing up for Go together, we delete them.",
  "questionnaire.consent.use":
    "We use your answers to suggest a small group when you join Go together for a gathering.",
  "questionnaire.drinking.label": "How do you feel about drinking?",
  "questionnaire.energy.nightShape.prompt": "Your kind of night out",
  "questionnaire.energy.planner.prompt": "When it comes to plans",
  "questionnaire.energy.talker.prompt": "In a group conversation",
  "questionnaire.error.consent": "Tick the consent box, then save again.",
  "questionnaire.error.generic":
    "Your answers didn't save. Try again in a moment.",
  "questionnaire.error.invalid":
    "Some answers didn't go through. Go back over the steps and try again.",
  "questionnaire.frequency.label": "How often would you like to meet up?",
  "questionnaire.humour.pairLabel": "Pair {position} of {total}",
  "questionnaire.intent.label": "What kind of friendship are you after?",
  "questionnaire.language.hint":
    "Pick at least one. Everyone in your group will share a language with you.",
  "questionnaire.language.label": "Languages you're happy to chat in",
  "questionnaire.likert.anchored": "{position} of {total}: {anchor}",
  "questionnaire.likert.position": "{position} of {total}",
  "questionnaire.page.back": "Back",
  "questionnaire.page.consentHint": "Tick the box above to save your answers.",
  "questionnaire.page.incompleteHint":
    "Answer every question on this step to continue.",
  "questionnaire.page.interestsHint": "Pick at least one interest to continue.",
  "questionnaire.page.intro":
    "About 3 minutes. You answer once and can edit any time.",
  "questionnaire.page.loadErrorTitle": "We couldn't load your answers",
  "questionnaire.page.next": "Next",
  "questionnaire.page.progressLabel": "Questionnaire progress",
  "questionnaire.page.save": "Save my answers",
  "questionnaire.page.saving": "Saving",
  "questionnaire.page.stepOf": "Step {step} of {total}: {label}",
  "questionnaire.pickCount": "You've picked {count} of {max}.",
  "questionnaire.pickLimitReached":
    "That's the most you can pick. Untick one to swap it.",
  "questionnaire.step.area.intro":
    "Optional. Living near each other makes meeting up again easier.",
  "questionnaire.step.area.short": "Area",
  "questionnaire.step.area.title": "Where you're based",
  "questionnaire.step.consent.intro":
    "Your answers are personal, so here is plainly what happens to them.",
  "questionnaire.step.consent.short": "Consent",
  "questionnaire.step.consent.title": "Before you save",
  "questionnaire.step.dealbreakers.intro":
    "We only group you with people who fit these answers.",
  "questionnaire.step.dealbreakers.short": "Must-haves",
  "questionnaire.step.dealbreakers.title": "Your must-haves",
  "questionnaire.step.energy.intro":
    "For each one, pick the point that feels most like you.",
  "questionnaire.step.energy.short": "Energy",
  "questionnaire.step.energy.title": "Your energy",
  "questionnaire.step.humour.intro":
    "In each pair, pick the line you find funnier.",
  "questionnaire.step.humour.short": "Humour",
  "questionnaire.step.humour.title": "What makes you laugh",
  "questionnaire.step.intent.intro":
    "Any answer is a good one. It helps us group people who want the same thing.",
  "questionnaire.step.intent.short": "Hopes",
  "questionnaire.step.intent.title": "What you're hoping for",
  "questionnaire.step.interests.intro":
    "Pick 1 to 8 things you'd happily do with new friends.",
  "questionnaire.step.interests.short": "Interests",
  "questionnaire.step.interests.title": "What you're into",
  "questionnaire.step.music.intro":
    "Pick up to 5 genres. If music isn't your thing, skip ahead.",
  "questionnaire.step.music.short": "Music",
  "questionnaire.step.music.title": "What you listen to",
  "questionnaire.step.values.intro":
    "How much does each of these matter in your life?",
  "questionnaire.step.values.short": "Values",
  "questionnaire.step.values.title": "What matters to you",
  "settings.data.card.editCta": "Edit your answers",
  "settings.data.card.lastAnswered": "Last answered on {date}.",
  "settings.data.card.saved": "Saved.",
  "settings.data.card.title": "Your Go together answers",
  "settings.data.delete.cta": "Delete my answers",
  "settings.data.delete.description":
    "This removes your answers for good and takes you out of Go together for any gathering whose group hasn't formed yet. You can always answer again later.",
  "settings.data.delete.title": "Your answers, gone for good",
  "settings.data.deleteConfirm.body":
    "Deleting removes your answers for good and takes you out of Go together for any gathering whose group hasn't formed yet. You can answer the questions again whenever you're ready.",
  "settings.data.deleteConfirm.confirm": "Delete my answers",
  "settings.data.deleteConfirm.title": "Delete your Go together answers?",
  "settings.data.deleteError":
    "Couldn't delete your answers. Try again in a moment.",
  "settings.data.deleted": "Your answers were deleted.",
  "settings.data.empty.cta": "Answer the questions",
  "settings.data.empty.description":
    "Answer a few questions about how you like to spend time, and we'll group you with people going to the same gathering who might click.",
  "settings.data.empty.title":
    "You haven't answered the Go together questions yet",
  "settings.data.refreshSuggested":
    "It's been a while. Want to refresh your answers?",
  "settings.data.sectionLabel": "Go together answers",
  "card.optIn.hint.hostQuestions":
    "Answer each question from the host to continue.",
  "card.optIn.hint.lensConsent": "Tick the box to confirm your lens.",
  "card.optIn.hint.partner": "Pick a friend to continue.",
  "card.answerAgain.body":
    "You're still waiting for a group. Answer it again so we can match you well.",
  "card.loadError.retryFailed":
    "Go together still didn't load. Try again in a moment.",
  "card.answerAgain.error.invalidAnswers":
    "The host's questions changed again. Answer them once more, then save.",
  "card.answerAgain.bodyMany":
    "You're still waiting for a group. Answer them again so we can match you well.",
  "card.answerAgain.save": "Save my answer",
  "card.answerAgain.saveMany": "Save my answers",
  "card.answerAgain.title": "The hosts changed a question",
  "card.answerAgain.titleMany": "The hosts changed their questions",
  "card.loadError.body":
    "If you've set anything up, it's still saved. Try again in a moment.",
  "card.loadError.retry": "Try again",
  "card.loadError.retrying": "Trying again",
  "card.loadError.title": "Go together didn't load",
  "feedback.confirmation.titleEm": "telling us",
  "feedback.privacyLine":
    "Your answers stay private. With names removed, they help us form better groups.",
  "group.feedbackEditCta": "Change how it went",
  "group.member.optionsLabel": "Options for {name}",
  "group.member.block": "Block {name}",
  "group.member.report": "Report {name}",
  "group.block.title": "Block {name}?",
  "group.block.description.beforeStart":
    "You'll move out of this group, into another group going to this gathering if one fits. Your card shows what's next. {name} stays and isn't told why.",
  "group.block.description.afterStart":
    "You'll leave this group and its chat. {name} stays and isn't told why.",
  "group.block.description.late":
    "It's too late to change groups, and you won't see each other in this group any more. {name} isn't told why.",
  "group.block.everywhere":
    "The block works across QueerPulse too: {name} can't message you, view your profile or find you in search. You can unblock later.",
  "group.block.confirm": "Block",
  "group.block.movedToast":
    "You've blocked {name} and left that group. Your Go together card shows what's next.",
  "group.block.doneToast": "You've blocked {name}.",
  "group.memberReport.title": "Report {name}",
  "group.leaveChat.label": "Leave the chat",
  "group.leaveChat.hint":
    "You stay in the group and can still say who you'd meet again.",
  "group.leaveChat.done": "You've left the chat. You're still in the group.",
  "group.leaveChatConfirm.title": "Leave the chat?",
  "group.leaveChatConfirm.description":
    "You'll stop getting this group's messages, and the others see the usual note that you left. You stay in the group, so you can still say who you'd meet again.",
  "group.leaveChatConfirm.confirm": "Leave the chat",
  "group.member.gone": "They're no longer in this group.",
  "group.block.pairMoves":
    "{partner} is coming with you, so they move with you.",
  "group.block.pairEnds":
    "You and {partner} stop being a pair for this gathering, and {partner} stays in the group.",
  "group.block.pairBlocked":
    "You and {name} stop being a pair for this gathering.",
};

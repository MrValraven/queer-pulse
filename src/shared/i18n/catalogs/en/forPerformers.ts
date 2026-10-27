import type { Catalog } from "../../types";

/**
 * The audience landing page for performers and creators (`/for/performers`): its meta, hero, sections,
 * sample content and questions.
 */
export const forPerformers: Catalog = {
  "meta.title": "QueerPulse for performers and creators",
  "meta.description":
    "A page that works like your own website: who you are, your next gig and how to book you, at one address.",

  // Hero
  "hero.eyebrow": "For performers and creators",
  "hero.title": "Your own website, <em>without building one</em>",
  "hero.lede":
    "Drag, DJ sets, comedy, dance and every act in between. Put who you are, your next gig and how to book you on one page, at your own address.",
  "hero.personaFrameLabel":
    "Sample persona page for a drag performer, showing the next gig and the booking details",
  "hero.lineupFrameLabel":
    "Sample event lineup listing each performer by name and craft",
  "hero.lineupTitle": "Lineup",
  "hero.lineupNote":
    "Hosts add you to their lineup with your craft beside your name.",
  "memberAction.createPersona": "Create a persona",

  // Where it all lives today
  "scatter.title": "Right now your career lives in a link-in-bio",
  "scatter.lede":
    "You never set out to build a website, so it all ended up spread around, and anyone who wants to book you has to piece it together.",
  "scatter.linkInBio": "A link-in-bio page holding everything together",
  "scatter.stories": "Your next show, in a story that is gone by tomorrow",
  "scatter.messages": "Bookings arriving through DMs, email and group chats",
  "scatter.rider": "Your rider and press photos in a folder somewhere",
  "scatter.pastGigs": "Past gigs that only live in old posts",
  "scatter.website": "The website you keep meaning to build",

  // How it works here
  "walkthrough.title": "One page that grows with your act",
  "walkthrough.lede":
    "Five things QueerPulse does for your act, each shown with the part that does it.",
  "walkthrough.persona.title": "A persona of its own",
  "walkthrough.persona.body":
    "A persona is a page for your act that sits apart from your personal profile. Link the two if you are happy for people to know both are you, or keep it standalone.",
  "walkthrough.persona.linkedBody":
    "Shown on your profile as another side of you.",
  "walkthrough.persona.standaloneBody":
    "Nothing on it points back to your profile, and you choose its handle.",
  "walkthrough.skin.title": "A skin that fits your craft",
  "walkthrough.skin.body":
    "Pick your craft and the page dresses for it. Drag, DJs, comedians, dancers and the other stage acts listed here share the Stage skin: a dark stage, big type and a marquee for your next gig.",
  "walkthrough.skin.listLabel": "Crafts on the Stage skin",
  "walkthrough.skin.moreCount": "+{count} more",
  "walkthrough.gigs.title": "Gigs, looks, mixes and performances",
  "walkthrough.gigs.body":
    "Each gig you list shows its date, doors time and a ticket link, and the soonest one leads your page in a marquee with its venue. Once a date passes, the gig moves under Played. Looks and mixes get their own sections.",
  "walkthrough.gigs.frameLabel":
    "Sample shows and looks on a drag performer's persona page",
  "walkthrough.lineup.title": "On the bill when a host invites you",
  "walkthrough.lineup.body":
    "A host invites you to their event's lineup with your craft already named. You join or decline, and once you join, the event's page lists you with your craft beside your name.",
  "walkthrough.lineup.frameLabel":
    "Sample invite to an event's lineup, with Join the lineup and Decline",
  "walkthrough.address.title": "Your own address, with all your links",
  "walkthrough.address.body":
    "Every persona lives at its own /p/ address, the one link you put in your bio. Add up to 20 social links and they sit in the header of your page.",
  "walkthrough.address.frameLabel":
    "Sample persona address with its social links",
  "walkthrough.address.studio":
    "Make music or mixes? QueerPulse Studio is our space for releasing it, tied to your persona. Our team opens it to members in waves.",
  "walkthrough.address.studioLink": "Open QueerPulse Studio",

  // Try it
  "tryIt.title": "Switch the craft and watch the page change",
  "tryIt.lede":
    "Same stage name, same address. Pick a craft and the sample persona page redraws with the kind label, tagline and sections that craft uses.",
  "tryIt.switchLabel": "Persona craft",
  "tryIt.frameLabel": "Sample persona page, {kind}",
  "tryIt.sectionsTitle": "Sections on this page",
  "tryIt.staysTitle": "What stays the same",
  "tryIt.staysBody":
    "The stage name, the photo, the /p/ address and the next show at the top of the page.",

  // All in one place
  "allInOne.title": "Everything a booker needs, at one address",
  "allInOne.lede":
    "The pieces you juggle today, brought together on one page you run.",
  "allInOne.before.linkInBio": "A link-in-bio page",
  "allInOne.before.stories": "Stories that vanish in a day",
  "allInOne.before.inboxes": "Booking requests in every inbox",
  "allInOne.before.folder": "A shared folder for your rider",
  "allInOne.after.page": "One persona page at its own /p/ address",
  "allInOne.after.nextUp": "Your next gig leading the page",
  "allInOne.after.booker": "Fee, rider, press and contact in one block",
  "allInOne.after.work":
    "Looks, mixes, sets and performances in their own sections",
  "allInOne.after.links": "Up to 20 social links",

  // Safe by design
  "safety.title": "You decide who sees it and who runs it",
  "safety.lede":
    "Your persona page has its own settings, apart from your personal profile.",
  "safety.visibility.title": "Choose who can see it",
  "safety.visibility.body":
    "An open standalone page can be read by anyone with its link, signed in or not, and can show up in search engines. A linked page is seen by signed-in members only. You can also keep it to your network, or just you while you shape it.",
  "safety.standalone.title": "Linked or standalone",
  "safety.standalone.body":
    "Show it on your profile, or keep it standalone so nothing on it points back to you.",
  "safety.coOwners.title": "Run it with a manager or partner",
  "safety.coOwners.body":
    "Invite a co-owner from your connections. Once they accept, they can edit and publish the page with you.",

  // Questions
  "faq.whoSees.question": "Who can see my persona page?",
  "faq.whoSees.answer":
    "You choose. On a standalone page, <b>Open to everyone</b> means anyone with its link can read it, signed in or not, and it can show up in search engines. A linked page is seen by signed-in members only. You can also pick <b>your network</b>, or <b>just you</b> while you shape it.",
  "faq.separate.question": "Can I keep it separate from my personal profile?",
  "faq.separate.answer":
    "Yes. Make it <b>standalone</b> and nothing on the page points back to your main profile, and you choose its public handle. A co-owner you invite will see the account behind it once they accept, and the invite tells you so before it sends.",
  "faq.coOwner.question": "Can a manager or partner run it with me?",
  "faq.coOwner.answer":
    "Yes. Invite them as a <b>co-owner</b> from your connections. Once they accept, they can edit the page and publish it with you. Only you, as its creator, can change its address, narrow who can see it, link it to your profile, unpublish it or delete it.",

  // Closing
  "closing.title": "Give your act <em>a page of its own</em>",
  "closing.body":
    "Make your persona page once, then send everyone to one address.",

  // Sample persona (made up for this page)
  "sample.cta": "Book Juno",
  "sample.booker.fee": "From 250",
  "sample.booker.press": "Press photos and a short bio on request",
  "sample.drag.tagline": "Lip sync, live vocals and far too many sequins",
  "sample.drag.bio":
    "Juno plays late stages with numbers about saints, sailors and the family group chat. Booking for clubs, prides and private parties.",
  "sample.drag.nextSubtitle": "Lip sync and a live vocal",
  "sample.drag.pastSubtitle": "Monthly drag brunch",
  "sample.drag.rider":
    "A mirror, a fan and ten minutes to change between numbers",
  "sample.dj.tagline": "Disco edits and warm-up sets that run late",
  "sample.dj.bio":
    "Juno spins disco, house and the odd pop edit, from the first warm-up record to last call. Booking for clubs, prides and after-parties.",
  "sample.dj.nextSubtitle": "Closing set",
  "sample.dj.pastSubtitle": "Warm-up set",
  "sample.dj.rider": "Two decks, a mixer and a booth monitor",
  "sample.dj.mixSubtitle": "Recorded live",
  "sample.comedian.tagline": "Stand-up about family, faith and the group chat",
  "sample.comedian.bio":
    "Juno does stand-up about growing up queer in a very Catholic family. Booking for comedy nights, prides and festivals.",
  "sample.comedian.nextSubtitle": "Twenty minutes of new material",
  "sample.comedian.pastSubtitle": "Headline set",
  "sample.comedian.rider": "A mic on a stand, a stool and a glass of water",
  "sample.comedian.setSubtitle": "A tight twenty for club nights",
  "sample.dancer.tagline": "Contemporary dance with a ballroom heart",
  "sample.dancer.bio":
    "Juno makes solo and duet work that moves between contemporary dance and ballroom. Booking for stages, festivals and music videos.",
  "sample.dancer.nextSubtitle": "A new solo piece",
  "sample.dancer.pastSubtitle": "Duet, with live music",
  "sample.dancer.rider": "A clear, sprung floor and a cue to start the track",
  "sample.dancer.reelSubtitle": "Highlights from this year",
};

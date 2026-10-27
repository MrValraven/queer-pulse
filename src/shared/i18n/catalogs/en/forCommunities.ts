import type { Catalog } from "../../types";

/**
 * The audience landing page for communities and collectives (`/for/communities`): its meta, hero, sections,
 * sample content and questions.
 */
export const forCommunities: Catalog = {
  "meta.title": "QueerPulse for communities and collectives",
  "meta.description":
    "Your people, your conversations and your events in one place, run by your own people.",

  // ── Hero ──
  "hero.eyebrow": "For communities and collectives",
  "hero.title": "Your people, your talk, your events, <em>in one place</em>",
  "hero.lede":
    "Clubs, crews, circles and collectives run their whole life here: who joins, what gets talked about, the next event and the night itself, all in the hands of the people who run it.",
  "cta.startCommunity": "Start a community",
  "cta.createEvent": "Create an event",

  // ── Showcase frame labels ──
  "frame.poster": "Sample event poster",
  "frame.communityCard": "Sample community card",
  "frame.discussion": "Sample post on a community page",
  "frame.tiers":
    "The four ways a community can let people in, and a sample join request",
  "frame.team": "Sample team with owner, co-owner and mod roles",
  "frame.threads": "Sample threads in a community's Discussion",
  "frame.hosts": "Sample event hosts with a co-host and a guest community",
  "frame.guestList": "Sample guest list at the door",
  "lineup.title": "Lineup",

  // ── Sample content ──
  "sample.community.description":
    "A queer arts collective pasting up posters, throwing club nights and putting first timers on the bill.",
  "sample.event.title": "Glitter Paste: Autumn Club Night",
  "sample.discussion.time": "2 hours ago",
  "sample.discussion.text":
    "posters for the autumn night are printed and they look amazing!! who's free thursday to help paste them up around Arroios, we bring the brushes and the glue and there's snacks after",
  "sample.joinRequest.note":
    "saw your posters all over Arroios and I'd love to help paste the next ones, I have a bike and a lot of free evenings",
  "sample.joinRequest.time": "3 hours",
  "sample.thread.zine.title":
    "Zine for the autumn night: who's writing, who's drawing?",
  "sample.thread.zine.time": "3 days ago",
  "sample.thread.firstTimers.title":
    "Ideas for making the first timers' table feel welcoming",
  "sample.thread.firstTimers.time": "last week",
  "album.title": "Event photos",
  "album.count_one": "{count} photo",
  "album.count_other": "{count} photos",

  // ── Where it all lives today ──
  "scatter.title": "Your community lives in six places at once",
  "scatter.lede":
    "If you run a collective, you know the drill. Every part of it sits in a different app, and you are the glue between them.",
  "scatter.chat.label": "The group chat",
  "scatter.chat.quote":
    "three hundred messages overnight and the date of the next meetup is somewhere in there",
  "scatter.sheet.label": "The spreadsheet",
  "scatter.sheet.quote":
    "whoever made the sign-up sheet left and now nobody can edit it",
  "scatter.tickets.label": "The ticketing site",
  "scatter.tickets.quote":
    "we just need a list of who's coming and it wants a whole company profile",
  "scatter.form.label": "The join form",
  "scatter.form.quote":
    "the answers land in someone's inbox and sit there for weeks",
  "scatter.photos.label": "The photo folder",
  "scatter.photos.quote":
    "the pics from last time are in a link that expired in march",
  "scatter.bio.label": "The link in bio",
  "scatter.bio.quote":
    "new people find us through a post from two years ago and ask if we still exist",
  "scatter.punchline": "Give your people one page to find each other on.",

  // ── How it works here ──
  "walkthrough.title": "From the first hello to the last song",
  "walkthrough.lede":
    "A community page carries the members, the talk and the events, and the people who run it share the work.",
  "walkthrough.join.title": "Choose how people get in",
  "walkthrough.join.body":
    "Open to everyone, by request, by personal invitation, or private and hidden from Discover. Requests land in your team's queue, and you approve or decline each one.",
  "walkthrough.tier.public": "Anyone on QueerPulse joins in one tap.",
  "walkthrough.tier.request": "People ask, and your team answers.",
  "walkthrough.tier.invite": "Only people you invite by name get in.",
  "walkthrough.tier.private":
    "Hidden from Discover, visible to your people and the people you invite.",
  "walkthrough.team.title": "Run it together",
  "walkthrough.team.body":
    "One owner, co-owners who hold almost every owner power, and mods who keep things kind. The work is shared, so nothing rests on one person.",
  "walkthrough.team.rosterTitle": "Who runs it",
  "walkthrough.talk.title": "Talk where everyone can find it",
  "walkthrough.talk.body":
    "Quick posts with reactions on the Pulse, longer threads in Discussion. Everything stays on the community page, ready for the next person who joins.",
  "walkthrough.events.title": "Put on events with your people",
  "walkthrough.events.body":
    "Announce the night, add co-hosts, invite other communities as guests and build the lineup. Hosts invite people to the bill, and once they accept they appear with their craft beside their name.",
  "walkthrough.door.title": "Open the door on the night",
  "walkthrough.door.body":
    "Check people in from the guest list or by scanning their member card, and watch the arrivals fill up. After the event, hosts add the photos to the event's album.",

  // ── Try it ──
  "tryIt.title": "Step an event through its life",
  "tryIt.lede":
    "Pick a moment and watch the real event components change with it.",
  "tryIt.switchLabel": "Moment in the event's life",
  "tryIt.state.announce": "Announce",
  "tryIt.state.lineup": "Lineup",
  "tryIt.state.doors": "Doors",
  "tryIt.state.photos": "Photos",
  "tryIt.frame.announce": "Sample event poster",
  "tryIt.frame.lineup": "Sample event poster with its lineup",
  "tryIt.frame.doors": "Sample check-in meter on the night",
  "tryIt.frame.photos": "Sample event photo album",
  "tryIt.caption.announce":
    "The poster goes up with the date, the neighbourhood and who's hosting, and people say they're going.",
  "tryIt.caption.lineup":
    "The lineup fills as DJs, drag artists and dancers accept their invites, each with their craft beside their name.",
  "tryIt.caption.doors":
    "Doors open and the meter counts people in as hosts check them off the list.",
  "tryIt.caption.photos":
    "After the event the hosts add the photos, and only the hosts and the people who were going can see them.",

  // ── All in one place ──
  "allInOne.title": "One page in place of the pile",
  "allInOne.lede":
    "The tools you stitch together today, and what the community page puts in their place.",
  "allInOne.before.chat": "A group chat that never sleeps",
  "allInOne.before.sheet": "A spreadsheet of who's in",
  "allInOne.before.tickets": "A ticketing site for every event",
  "allInOne.before.photos": "A shared folder of photos",
  "allInOne.before.money": "A donation link nobody can find",
  "allInOne.after.page": "A community page with your people, posts and threads",
  "allInOne.after.events":
    "Events with co-hosts, guest communities and a lineup",
  "allInOne.after.door": "Check-in at the door and an album after",
  "allInOne.after.support": "A Support tab listing the ways to give to you",
  "allInOne.after.quiz": "Quiz nights with Pulse Live, played on phones",
  "allInOne.after.together":
    "Go together, so people coming alone arrive with a small group",

  // ── Safe by design ──
  "safety.title": "Kept in your people's hands",
  "safety.lede":
    "The tools that keep a community kind and its people safe come built in.",
  "safety.review.title": "Join review",
  "safety.review.body":
    "On a request community, every request waits for your team to approve or decline it.",
  "safety.bans.title": "Bans that take two",
  "safety.bans.body":
    "A ban removes someone straight away, and a permanent one needs a second moderator to sign it.",
  "safety.log.title": "A governance log",
  "safety.log.body":
    "Every role change, removal, ban and settings edit is recorded, so your team can see who did what.",
  "safety.private.title": "Private when you need it",
  "safety.private.body":
    "A private community stays out of Discover, and its page opens only for your people and the people you invite.",
  "safety.photos.title": "Photos people can report",
  "safety.photos.body":
    "Anyone who can see an event photo can report it, and whoever added a photo can take it down.",
  "safety.conduct.body":
    "The QueerPulse code of conduct applies everywhere on the platform, your community and its events included.",
  "safety.conduct.cta": "Read the code of conduct",

  // ── Questions ──
  "faq.whoSees.question": "Who can see our community?",
  "faq.whoSees.answer":
    "QueerPulse is invite-only, so only people on QueerPulse see communities at all. Open, request and invite-only communities show in Discover. A <b>private</b> community stays hidden, and its page opens only for its own people and the people invited to it.",
  "faq.private.question": "Can we keep it private?",
  "faq.private.answer":
    "Yes. Choose <b>Private</b> and the community leaves Discover. People join only with an invitation from your team.",
  "faq.team.question": "Can several of us run it?",
  "faq.team.answer":
    "Yes. There is one owner, and you can add <b>co-owners</b> with almost every owner power, plus <b>mods</b> who look after posts, requests and the people in it. Only the owner can hand over ownership or archive the community.",
  "faq.together.question": "Can we run events with other communities?",
  "faq.together.answer":
    "Yes. Add co-hosts to an event, and invite other communities to join it as guests. Each one says yes or no to the invitation.",
  "faq.support.question": "Can people support us with money?",
  "faq.support.answer":
    "Your community can have a <b>Support</b> tab listing the ways to give: a fundraising link, an MB WAY number or a bank transfer, with a line on what it goes to. The money goes straight to you, and QueerPulse never handles it.",

  // ── Closing ──
  "closing.title": "Bring your people <em>home</em>",
  "closing.body":
    "Start your community page, put up the first poster and let your people find each other.",
};

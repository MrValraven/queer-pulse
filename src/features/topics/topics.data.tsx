import type { ReactNode } from "react";
import type { AvatarTint } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";

/** The badge shown top-right of a post card. */
export type PostKind =
  "asking" | "recommend" | "warn" | "article" | "event" | "thread";

/** The bucket a post falls into for the filter chips. */
export type PostCategory =
  "thread" | "recommendation" | "article" | "event" | "resource";

export interface TopicPost {
  author: string;
  /** Member slug for `author`, when the display name resolves to a real
   *  member account. Parallel to `author` (which stays the display string,
   *  bylines and org names included) rather than replacing it. */
  authorSlug?: string;
  initials: string;
  tone: AvatarTint;
  /** e.g. "2 hours ago · Trans & Non-Binary Network" */
  meta: string;
  kind: PostKind;
  category: PostCategory;
  title: ReactNode;
  body: string;
  /** Footer stats — JSX so numbers can be emphasised with <b>. */
  stats: ReactNode;
  /** Hashtags on the card; the topic's own tag is highlighted as a match. */
  tags: string[];
  href: string;
}

export interface TopVoice {
  name: string;
  initials: string;
  tone: AvatarTint;
  detail: string;
  href: string;
  /** Member slug for `name`, when it resolves to a real member account
   *  (rather than one of the fictional voices sharing a first name/role with
   *  a real member but a different surname). Left undefined otherwise. */
  slug?: string;
}

export interface RelatedTopic {
  tag: string;
  count: number;
}

export interface TopicStat {
  /** Numeric/compact-count data (e.g. "347", "1.2k") — never translated. */
  value: string;
  /** Chrome override for a non-numeric badge value (e.g. "New") — a catalog key. */
  valueKey?: string;
  /** Render the value in coral italic (used for the headline stat). */
  em?: boolean;
  /** Catalog key for the stat's label (i18n Pattern A — resolved in TopicHeader.tsx). */
  labelKey: string;
}

export interface TopicResources {
  /** Curator-authored description + CTA — content (see scope-rule note below),
   * stays untranslated. The panel's own title is static chrome, hardcoded in
   * TopicSidebar.tsx instead of duplicated here. */
  body: string;
  ctaLabel: string;
  href: string;
}

export interface Topic {
  tag: string;
  /** Catalog key ("topics:common.eyebrow") — i18n Pattern A. */
  eyebrowKey: string;
  /** Serif H1 content, already including the leading "#" markup. */
  title: ReactNode;
  sub: ReactNode;
  stats: TopicStat[];
  /** "Write a post" destination. */
  writeHref: string;
  posts: TopicPost[];
  relatedTopics: RelatedTopic[];
  topVoices: TopVoice[];
  /** Curated-resources panel — omitted on the generic fallback. */
  resources?: TopicResources;
  /** Total posts, for the "Load N older posts" affordance. */
  totalPosts: number;
}

/**
 * DISC-5 — "Write a post" deep-links into forum thread creation with this
 * topic's tag pre-filled, reusing the SAME `?tag=`/`?compose=1` mechanism
 * `ForumPage`/`useForumPageState` already use (`?tag=` already scopes the
 * thread list; `?compose=1` auto-opens the compose modal seeded with that
 * tag — see `useForumPageState.ts`). Exported so
 * `api/topics.adapters.tsx`'s live `topicDetailToTopic` builds the identical
 * href from a fetched topic's tag.
 */
export function writeHrefForTag(tag: string): string {
  return `${routes.forum}?tag=${encodeURIComponent(tag)}&compose=1`;
}

/** Serif hashtag heading: dim "#", body, coral italic tail. */
function tagTitle(head: string, tail: string): ReactNode {
  return (
    <>
      <span className="topicHash">#</span>
      {head}
      <em>{tail}</em>
    </>
  );
}

const healthcare: Topic = {
  tag: "healthcare",
  eyebrowKey: "topics:common.eyebrow",
  title: tagTitle("health", "care"),
  sub: (
    <>
      Conversations, resources, recommendations, and warnings about navigating
      health systems as a queer person in Lisbon. Curated by{" "}
      <a href={routes.transHub}>Trans Hub</a> &amp;{" "}
      <a href={routes.wellbeing}>Wellbeing</a>.
    </>
  ),
  stats: [
    { value: "347", em: true, labelKey: "topics:stats.posts" },
    { value: "1.2k", labelKey: "topics:stats.membersFollowing" },
    { value: "52", labelKey: "topics:stats.thisWeek" },
    { value: "18", labelKey: "topics:stats.verifiedResources" },
  ],
  writeHref: writeHrefForTag("healthcare"),
  totalPosts: 347,
  posts: [
    {
      author: "Anika Kovač",
      authorSlug: "anika",
      initials: "AK",
      tone: "coral",
      meta: "2 hours ago · Trans & Non-Binary Network",
      kind: "asking",
      category: "thread",
      title: (
        <>
          Anyone have recommendations for a queer-friendly{" "}
          <em>GP in Lisbon?</em>
        </>
      ),
      body: "Preferably someone familiar with trans healthcare. I'm tired of having to explain myself from scratch every appointment. Mine retired in March…",
      stats: (
        <>
          <b>42</b> relate · <b>18</b> replies
        </>
      ),
      tags: ["healthcare", "trans", "lisbon"],
      href: routes.forum,
    },
    {
      author: "Sara Pinheiro for QueerPulse Magazine",
      authorSlug: "sara-pinheiro",
      initials: "SP",
      tone: "jade",
      meta: "3 days ago · 8 min read",
      kind: "article",
      category: "article",
      title: (
        <>
          Five things I learned{" "}
          <em>navigating Lisbon's trans health system.</em>
        </>
      ),
      body: "From the SNS to private clinics, what nobody tells you about waiting lists, referrals, and how to actually get a hormone prescription without losing a year of your life.",
      stats: (
        <>
          <b>284</b> reads · <b>26</b> bookmarks
        </>
      ),
      tags: ["healthcare", "trans", "explainer"],
      href: routes.article,
    },
    {
      author: "Trans Hub",
      initials: "TH",
      tone: "coral",
      meta: "Hosted gathering · Thu 12 Jun, 19:00",
      kind: "event",
      category: "event",
      title: (
        <>
          Open clinic night: <em>bring your prescription questions.</em>
        </>
      ),
      body: "Dr. Inês Pereira and a pharmacist from Farmácia do Carmo take over the community café's back room for two hours of free, no-records consultation. 22 spots, RSVP required.",
      stats: (
        <>
          <b>14 spots left</b> · 30-day open clinic streak
        </>
      ),
      tags: ["healthcare", "trans", "mutualaid"],
      href: gatheringPath("open-clinic-night"),
    },
    {
      author: "Nuno Alves",
      authorSlug: "nuno",
      initials: "NA",
      tone: "plum",
      meta: "5 days ago · Trans Hub",
      kind: "thread",
      category: "resource",
      title: (
        <>
          Updated 2026 list: <em>vetted queer-friendly providers.</em>
        </>
      ),
      body: "Refreshing the master list. 47 names, all re-checked in the last 90 days. Includes GPs, mental health, endocrinology, gynaecology (trans-inclusive), dental, and bodywork. Comment to add or flag.",
      stats: (
        <>
          <b>189</b> upvotes · <b>78</b> replies
        </>
      ),
      tags: ["healthcare", "resource", "trans"],
      href: routes.forum,
    },
    {
      author: "Rita Vasquez",
      initials: "RV",
      tone: "jade",
      meta: "1 week ago",
      kind: "recommend",
      category: "recommendation",
      title: (
        <>
          Dr. Hugo Marques (USF Sé) <em>takes new patients quarterly.</em>
        </>
      ),
      body: "Public system, slow but worth it. Window opens 15 June. Set a reminder, his slots fill in 3 days. He doesn't do \"the talk\" if you're trans; he just gets on with care.",
      stats: (
        <>
          <b>67</b> relate · <b>22</b> replies
        </>
      ),
      tags: ["healthcare", "lisbon", "sns"],
      href: routes.forum,
    },
    {
      author: "Lina Bachir",
      initials: "LB",
      tone: "coral",
      meta: "2 weeks ago",
      kind: "warn",
      category: "recommendation",
      title: <>A clinic near Saldanha I would not return to.</>,
      body: "Not naming publicly, happy to DM. Technically polite but I left feeling like a case study rather than a patient. Posting because someone might be heading there as we speak.",
      stats: (
        <>
          <b>28</b> relate · <b>14</b> replies
        </>
      ),
      tags: ["healthcare", "warn"],
      href: routes.forum,
    },
  ],
  relatedTopics: [
    { tag: "trans", count: 512 },
    { tag: "mentalhealth", count: 428 },
    { tag: "sns", count: 186 },
    { tag: "hormones", count: 142 },
    { tag: "therapy", count: 138 },
    { tag: "insurance", count: 97 },
  ],
  topVoices: [
    {
      name: "Nuno Alves",
      initials: "NA",
      tone: "jade",
      detail: "Trans Hub coordinator · 42 posts",
      href: routes.members,
      slug: "nuno",
    },
    {
      name: "Rita Vasquez",
      initials: "RV",
      tone: "coral",
      detail: "Therapist · 28 posts",
      href: routes.members,
    },
    {
      name: "Sara Pinheiro",
      initials: "SP",
      tone: "plum",
      detail: "Magazine writer · 14 articles",
      href: routes.author,
      slug: "sara-pinheiro",
    },
    {
      name: "Joana Tavares",
      initials: "JT",
      tone: "coral",
      detail: "Care coordinator · 19 posts",
      href: routes.members,
    },
  ],
  resources: {
    body: "This topic is curated. 18 names, clinics, and guides have been vetted by community moderators in the last 90 days.",
    ctaLabel: "Browse vetted resources",
    href: routes.transHub,
  },
};

const trans: Topic = {
  tag: "trans",
  eyebrowKey: "topics:common.eyebrow",
  title: tagTitle("tr", "ans"),
  sub: (
    <>
      Everything trans and non-binary life in Lisbon touches: legal name
      changes, hormones, community, joy. Curated by{" "}
      <a href={routes.transHub}>Trans Hub</a>.
    </>
  ),
  stats: [
    { value: "512", em: true, labelKey: "topics:stats.posts" },
    { value: "2.1k", labelKey: "topics:stats.membersFollowing" },
    { value: "74", labelKey: "topics:stats.thisWeek" },
    { value: "31", labelKey: "topics:stats.verifiedResources" },
  ],
  writeHref: writeHrefForTag("trans"),
  totalPosts: 512,
  posts: [
    {
      author: "Céu Marques",
      initials: "CM",
      tone: "coral",
      meta: "4 hours ago · Trans Hub",
      kind: "asking",
      category: "thread",
      title: (
        <>
          Has anyone done the legal name change{" "}
          <em>at Conservatória in 2026?</em>
        </>
      ),
      body: "Trying to work out which documents actually get accepted now versus what the old guides say. Would love a step-by-step from someone who did it this year.",
      stats: (
        <>
          <b>51</b> relate · <b>33</b> replies
        </>
      ),
      tags: ["trans", "legal", "lisbon"],
      href: routes.forum,
    },
    {
      author: "Trans Hub",
      initials: "TH",
      tone: "coral",
      meta: "Hosted gathering · Sat 21 Jun, 16:00",
      kind: "event",
      category: "event",
      title: (
        <>
          Name-change clinic: <em>bring your paperwork, leave with a plan.</em>
        </>
      ),
      body: "Volunteers who've been through it sit with you one-to-one and map your exact route. Free, trans-led, no records kept. 16 spots.",
      stats: (
        <>
          <b>9 spots left</b> · monthly since 2024
        </>
      ),
      tags: ["trans", "legal", "mutualaid"],
      href: gatheringPath("name-change-clinic"),
    },
    {
      author: "Nuno Alves",
      authorSlug: "nuno",
      initials: "NA",
      tone: "plum",
      meta: "6 days ago · Trans Hub",
      kind: "thread",
      category: "resource",
      title: (
        <>
          The 2026 <em>trans starter kit</em>: one link, everything in it.
        </>
      ),
      body: "Hormones, healthcare, legal, housing, and the people to ask. If you're newly out or newly arrived, start here. We keep it current so you don't have to dig.",
      stats: (
        <>
          <b>312</b> upvotes · <b>88</b> replies
        </>
      ),
      tags: ["trans", "resource", "healthcare"],
      href: routes.forum,
    },
    {
      author: "Vera Antunes",
      initials: "VA",
      tone: "jade",
      meta: "1 week ago",
      kind: "recommend",
      category: "recommendation",
      title: (
        <>
          A tailor in Anjos who <em>gets binding and fit</em> without a fuss.
        </>
      ),
      body: "Took in three shirts, no weird questions, gender-neutral measuring on request. Small shop, cash only, worth the trip.",
      stats: (
        <>
          <b>44</b> relate · <b>12</b> replies
        </>
      ),
      tags: ["trans", "lisbon"],
      href: routes.forum,
    },
  ],
  relatedTopics: [
    { tag: "healthcare", count: 347 },
    { tag: "hormones", count: 142 },
    { tag: "legal", count: 118 },
    { tag: "nonbinary", count: 96 },
    { tag: "mentalhealth", count: 428 },
    { tag: "housing", count: 173 },
  ],
  topVoices: [
    {
      name: "Nuno Alves",
      initials: "NA",
      tone: "jade",
      detail: "Trans Hub coordinator · 61 posts",
      href: routes.members,
      slug: "nuno",
    },
    {
      name: "Céu Marques",
      initials: "CM",
      tone: "coral",
      detail: "Peer navigator · 34 posts",
      href: routes.members,
    },
    {
      name: "Vera Antunes",
      initials: "VA",
      tone: "plum",
      detail: "Community host · 22 posts",
      href: routes.members,
    },
  ],
  resources: {
    body: "31 guides, legal templates, and vetted providers, re-checked by trans-led moderators every quarter.",
    ctaLabel: "Open the Trans Hub",
    href: routes.transHub,
  },
};

const mentalhealth: Topic = {
  tag: "mentalhealth",
  eyebrowKey: "topics:common.eyebrow",
  title: tagTitle("mental", "health"),
  sub: (
    <>
      Therapy that gets us, peer support, and the honest conversations in
      between. Curated by <a href={routes.wellbeing}>Wellbeing</a>. You are not
      alone here.
    </>
  ),
  stats: [
    { value: "428", em: true, labelKey: "topics:stats.posts" },
    { value: "1.6k", labelKey: "topics:stats.membersFollowing" },
    { value: "63", labelKey: "topics:stats.thisWeek" },
    { value: "24", labelKey: "topics:stats.verifiedResources" },
  ],
  writeHref: writeHrefForTag("mentalhealth"),
  totalPosts: 428,
  posts: [
    {
      author: "Mariana Reis",
      initials: "MR",
      tone: "jade",
      meta: "Clinical psychologist · 1 day ago",
      kind: "recommend",
      category: "recommendation",
      title: (
        <>
          Sliding-scale therapists <em>who actually have openings</em> this
          month.
        </>
      ),
      body: "Six queer-affirming practitioners with space right now, including two who work in English and one who does trauma-focused work with trans clients. DM for the list.",
      stats: (
        <>
          <b>97</b> relate · <b>41</b> replies
        </>
      ),
      tags: ["mentalhealth", "therapy", "lisbon"],
      href: routes.forum,
    },
    {
      author: "Peer Support Circle",
      initials: "PS",
      tone: "coral",
      meta: "Weekly gathering · Tue 19:30",
      kind: "event",
      category: "event",
      title: (
        <>
          Thursday peer circle: <em>no fixing, just being heard.</em>
        </>
      ),
      body: "A facilitated, confidential room for whatever you're carrying. Drop in when you need it, no commitment. Held by trained community facilitators.",
      stats: (
        <>
          <b>Open door</b> · 40+ weeks running
        </>
      ),
      tags: ["mentalhealth", "peersupport"],
      href: gatheringPath("peer-support-circle"),
    },
    {
      author: "Anonymous member",
      initials: "?",
      tone: "plum",
      meta: "3 days ago · posted anonymously",
      kind: "asking",
      category: "thread",
      title: (
        <>How do you tell a new therapist you're queer without the flinch?</>
      ),
      body: "Every first session I brace for the pause. Looking for scripts, or honestly just to hear it gets easier. Replies from people who've been here especially welcome.",
      stats: (
        <>
          <b>73</b> relate · <b>56</b> replies
        </>
      ),
      tags: ["mentalhealth", "therapy"],
      href: routes.forum,
    },
    {
      author: "Sara Pinheiro for QueerPulse Magazine",
      authorSlug: "sara-pinheiro",
      initials: "SP",
      tone: "jade",
      meta: "1 week ago · 6 min read",
      kind: "article",
      category: "article",
      title: (
        <>
          On burnout, chosen family, and <em>the therapy of showing up.</em>
        </>
      ),
      body: "What community care can and can't replace, and why the answer isn't to carry it all yourself. An honest look at where support really comes from.",
      stats: (
        <>
          <b>201</b> reads · <b>38</b> bookmarks
        </>
      ),
      tags: ["mentalhealth", "essay"],
      href: routes.article,
    },
  ],
  relatedTopics: [
    { tag: "therapy", count: 138 },
    { tag: "healthcare", count: 347 },
    { tag: "peersupport", count: 112 },
    { tag: "trans", count: 512 },
    { tag: "crisis", count: 64 },
    { tag: "burnout", count: 51 },
  ],
  topVoices: [
    {
      name: "Mariana Reis",
      initials: "MR",
      tone: "jade",
      detail: "Clinical psychologist · 39 posts",
      href: routes.members,
    },
    {
      name: "Joana Tavares",
      initials: "JT",
      tone: "coral",
      detail: "Care coordinator · 27 posts",
      href: routes.members,
    },
    {
      name: "Sara Pinheiro",
      initials: "SP",
      tone: "plum",
      detail: "Magazine writer · 11 essays",
      href: routes.author,
      slug: "sara-pinheiro",
    },
  ],
  resources: {
    body: "24 vetted therapists, helplines, and peer rooms, checked for queer-affirming practice by Wellbeing moderators.",
    ctaLabel: "Browse Wellbeing",
    href: routes.wellbeing,
  },
};

const housing: Topic = {
  tag: "housing",
  eyebrowKey: "topics:common.eyebrow",
  title: tagTitle("hous", "ing"),
  sub: (
    <>
      Sublets, flatshares, co-ops, and mutual aid for finding somewhere safe to
      live as a queer person in Lisbon. Real listings, real people, no agencies.
    </>
  ),
  stats: [
    { value: "173", em: true, labelKey: "topics:stats.posts" },
    { value: "890", labelKey: "topics:stats.membersFollowing" },
    { value: "29", labelKey: "topics:stats.thisWeek" },
    { value: "7", labelKey: "topics:stats.coopsForming" },
  ],
  writeHref: writeHrefForTag("housing"),
  totalPosts: 173,
  posts: [
    {
      author: "Carla Nunes",
      initials: "CN",
      tone: "coral",
      meta: "6 hours ago",
      kind: "asking",
      category: "thread",
      title: (
        <>
          Looking for a room in <em>a queer household</em>, June–August, Arroios
          area.
        </>
      ),
      body: "Quiet, employed, cat-friendly, allergic to landlord drama. Would love to land somewhere that already feels like home rather than start from zero.",
      stats: (
        <>
          <b>19</b> relate · <b>11</b> replies
        </>
      ),
      tags: ["housing", "sublet", "arroios"],
      href: routes.forum,
    },
    {
      author: "Rainbow Roots Co-op",
      initials: "RR",
      tone: "jade",
      meta: "Forming · info night Wed 20:00",
      kind: "event",
      category: "event",
      title: (
        <>
          Co-op info night: <em>could we buy a building together?</em>
        </>
      ),
      body: "Nine of us, one shared dream of never being priced out again. Come hear where the numbers actually landed and whether there's room for you in round two.",
      stats: (
        <>
          <b>5 spots left</b> · 9 households committed
        </>
      ),
      tags: ["housing", "coop", "mutualaid"],
      href: gatheringPath("coop-info-night"),
    },
    {
      author: "Beatriz Lopes",
      initials: "BL",
      tone: "plum",
      meta: "4 days ago",
      kind: "recommend",
      category: "recommendation",
      title: (
        <>
          A landlord in Graça who{" "}
          <em>actually put queer-friendly in writing.</em>
        </>
      ),
      body: "Rare, I know. Fair rent, no weirdness about who visits, fixed the boiler in a day. Happy to pass the contact to anyone searching, just ask.",
      stats: (
        <>
          <b>34</b> relate · <b>16</b> replies
        </>
      ),
      tags: ["housing", "graca", "lisbon"],
      href: routes.forum,
    },
    {
      author: "Nuno Alves",
      authorSlug: "nuno",
      initials: "NA",
      tone: "coral",
      meta: "1 week ago · Trans Hub",
      kind: "warn",
      category: "recommendation",
      title: <>Heads up on a "queer-friendly" listing near Intendente.</>,
      body: "Photos gorgeous, reality less so. Pushback the moment my partner and I viewed together. Not naming publicly, happy to DM anyone considering it.",
      stats: (
        <>
          <b>27</b> relate · <b>21</b> replies
        </>
      ),
      tags: ["housing", "warn"],
      href: routes.forum,
    },
  ],
  relatedTopics: [
    { tag: "coop", count: 88 },
    { tag: "mutualaid", count: 204 },
    { tag: "lisbon", count: 631 },
    { tag: "arriving", count: 142 },
    { tag: "trans", count: 512 },
    { tag: "sublet", count: 66 },
  ],
  topVoices: [
    {
      name: "Carla Nunes",
      initials: "CN",
      tone: "coral",
      detail: "Housing thread host · 24 posts",
      href: routes.members,
    },
    {
      name: "Beatriz Lopes",
      initials: "BL",
      tone: "jade",
      detail: "Co-op organiser · 18 posts",
      href: routes.members,
    },
    {
      name: "André Silva",
      initials: "AS",
      tone: "plum",
      detail: "Newcomer buddy · 15 posts",
      href: routes.members,
    },
  ],
};

const nightlife: Topic = {
  tag: "nightlife",
  eyebrowKey: "topics:common.eyebrow",
  title: tagTitle("night", "life"),
  sub: (
    <>
      Where to dance, who's playing, and which rooms actually feel safe after
      dark. Party listings, venue reviews, and get-home-safe plans, by the
      people who go.
    </>
  ),
  stats: [
    { value: "289", em: true, labelKey: "topics:stats.posts" },
    { value: "1.4k", labelKey: "topics:stats.membersFollowing" },
    { value: "48", labelKey: "topics:stats.thisWeek" },
    { value: "12", labelKey: "topics:stats.saferSpaceVenues" },
  ],
  writeHref: writeHrefForTag("nightlife"),
  totalPosts: 289,
  posts: [
    {
      author: "Diogo Faria",
      initials: "DF",
      tone: "coral",
      meta: "Music producer · 5 hours ago",
      kind: "event",
      category: "event",
      title: (
        <>
          Warehouse party Friday:{" "}
          <em>trans DJs only, door policy that means it.</em>
        </>
      ),
      body: "Vetted crowd, trained welfare team, chill-out room upstairs. Location on RSVP. Bring your people, look after each other, dance until the trams start.",
      stats: (
        <>
          <b>62 going</b> · welfare team on site
        </>
      ),
      tags: ["nightlife", "music", "lisbon"],
      href: gatheringPath("trans-djs-warehouse"),
    },
    {
      author: "Rita Vasquez",
      initials: "RV",
      tone: "jade",
      meta: "2 days ago",
      kind: "recommend",
      category: "recommendation",
      title: (
        <>
          A bar in Cais do Sodré that <em>gets the vibe right</em> on a
          Wednesday.
        </>
      ),
      body: "No pressure, no creeps, staff who step in when needed. Perfect for a first date or a soft night out. They keep the back room quiet enough to actually talk.",
      stats: (
        <>
          <b>48</b> relate · <b>15</b> replies
        </>
      ),
      tags: ["nightlife", "caisdosodre", "lisbon"],
      href: routes.forum,
    },
    {
      author: "Safer Nights Crew",
      initials: "SN",
      tone: "plum",
      meta: "4 days ago · community thread",
      kind: "thread",
      category: "resource",
      title: (
        <>
          The get-home-safe list:{" "}
          <em>night buses, trusted taxis, buddy check-ins.</em>
        </>
      ),
      body: "Everything we wish someone had told us at 3am. Includes the buddy-system how-to and who to call if a night goes wrong. Comment to add your own.",
      stats: (
        <>
          <b>156</b> upvotes · <b>44</b> replies
        </>
      ),
      tags: ["nightlife", "safety", "resource"],
      href: routes.forum,
    },
    {
      author: "Anonymous member",
      initials: "?",
      tone: "coral",
      meta: "6 days ago · posted anonymously",
      kind: "warn",
      category: "recommendation",
      title: <>A promoter I'd steer clear of after last weekend.</>,
      body: "Ignored a clear safety issue at the door. Not naming the venue publicly yet, reported to mods, happy to DM details so you can make your own call.",
      stats: (
        <>
          <b>39</b> relate · <b>28</b> replies
        </>
      ),
      tags: ["nightlife", "warn", "safety"],
      href: routes.forum,
    },
  ],
  relatedTopics: [
    { tag: "music", count: 231 },
    { tag: "events", count: 508 },
    { tag: "safety", count: 174 },
    { tag: "lisbon", count: 631 },
    { tag: "dance", count: 87 },
    { tag: "community", count: 402 },
  ],
  topVoices: [
    {
      name: "Diogo Faria",
      initials: "DF",
      tone: "coral",
      detail: "Producer & party host · 33 posts",
      href: routes.members,
    },
    {
      name: "Rita Vasquez",
      initials: "RV",
      tone: "jade",
      detail: "Night-out regular · 21 posts",
      href: routes.members,
    },
    {
      name: "Safer Nights Crew",
      initials: "SN",
      tone: "plum",
      detail: "Welfare volunteers · 17 posts",
      href: routes.members,
    },
  ],
};

export const TOPICS: Record<string, Topic> = {
  healthcare,
  trans,
  mentalhealth,
  housing,
  nightlife,
};

/** The most-followed topics, surfaced in search and as fallback related links. */
export const FEATURED_TOPIC_TAGS = Object.keys(TOPICS);

/** Split a hashtag into (head, coral tail) for the serif heading. Exported
 * for `api/topics.adapters.ts`, which reuses it to render a live-mode
 * topic's plain-text `label` with the same serif styling as this generic
 * fallback (the backend has no JSX-authored title of its own). */
export function splitForTitle(tag: string): ReactNode {
  if (tag.length <= 3) return tagTitle(tag, "");
  const cut = Math.ceil(tag.length / 2);
  return tagTitle(tag.slice(0, cut), tag.slice(cut));
}

/**
 * Resolve a topic by tag. Curated topics return their full data; anything else
 * gets a coherent generic feed so related-topic links never dead-end.
 *
 * The generic fallback's single starter post is platform-authored prompt copy
 * (never fetched — no live tag with zero posts synthesizes an equivalent row,
 * see `api/topics.adapters.tsx`), so it's a function of `t` like any other
 * empty/starter state (Pattern B).
 */
export function getTopic(rawTag: string, t: TFunction): Topic {
  const tag = rawTag.replace(/^#/, "").toLowerCase();
  if (TOPICS[tag]) return TOPICS[tag];

  const related = Object.values(TOPICS)
    .filter((topic) => topic.tag !== tag)
    .map((topic) => ({ tag: topic.tag, count: topic.totalPosts }));

  return {
    tag,
    eyebrowKey: "topics:common.eyebrow",
    title: splitForTitle(tag),
    sub: (
      <Translation
        i18nKey="topics:fallback.sub"
        components={{ strong: <strong /> }}
        values={{ tag }}
      />
    ),
    stats: [
      { value: "—", em: true, labelKey: "topics:stats.posts" },
      {
        value: "New",
        valueKey: "topics:stats.newValue",
        labelKey: "topics:common.eyebrow",
      },
      { value: "0", labelKey: "topics:stats.thisWeek" },
    ],
    writeHref: writeHrefForTag(tag),
    totalPosts: 0,
    posts: [
      {
        author: "QueerPulse",
        initials: "QP",
        tone: "plum",
        meta: t("topics:fallback.postMeta"),
        kind: "asking",
        category: "thread",
        title: (
          <Translation
            i18nKey="topics:fallback.postTitle"
            components={{ em: <em /> }}
            values={{ tag }}
          />
        ),
        body: t("topics:fallback.postBody", { tag }),
        stats: (
          <Translation
            i18nKey="topics:fallback.postStats"
            components={{ b: <b /> }}
          />
        ),
        tags: [tag],
        href: routes.forum,
      },
    ],
    relatedTopics: related,
    topVoices: [],
    };
}

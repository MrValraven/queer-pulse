import { type ReactNode } from "react";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * i18n Pattern A/B. Everything here is platform-authored guidance chrome
 * (a "who are you" persona rail, five short reads, an FAQ, support-room
 * links, a don't-say/do-say list) — none of it is fetched in live mode, so
 * all of it is translated. `LESSON_SOURCES`/`FAQ_SOURCES`/`ROOM_SOURCES`
 * carry catalog keys because their `title`/`body` fields need the coral
 * `<em>` emphasis run, resolved via `<Translation>` in `buildX(t)`
 * (Pattern B); the consumer memoizes with `useMemo(() => buildX(t), [t])`.
 */

/** Who-are-you persona chips in the hero. Purely a "you're in the right place" cue. */
export const PERSONA_KEYS = [
  "community:caregivers.persona.parent",
  "community:caregivers.persona.partner",
  "community:caregivers.persona.siblingFriend",
  "community:caregivers.persona.youthWorker",
] as const;

export interface Lesson {
  number: string;
  title: ReactNode;
  body: ReactNode;
  read: string;
  languages: string;
  to: string;
}

interface LessonSource {
  number: string;
  titleKey: string;
  bodyKey: string;
  readTimeKey: string;
  languagesKey: string;
  to: string;
}

const LESSON_SOURCES: LessonSource[] = [
  {
    number: "01",
    titleKey: "community:caregivers.lesson.listen.title",
    bodyKey: "community:caregivers.lesson.listen.body",
    readTimeKey: "community:caregivers.lesson.listen.readTime",
    languagesKey: "community:caregivers.lesson.listen.langs",
    to: routes.comingOut,
  },
  {
    number: "02",
    titleKey: "community:caregivers.lesson.wrongThing.title",
    bodyKey: "community:caregivers.lesson.wrongThing.body",
    readTimeKey: "community:caregivers.lesson.wrongThing.readTime",
    languagesKey: "community:caregivers.lesson.wrongThing.langs",
    to: routes.family,
  },
  {
    number: "03",
    titleKey: "community:caregivers.lesson.pronouns.title",
    bodyKey: "community:caregivers.lesson.pronouns.body",
    readTimeKey: "community:caregivers.lesson.pronouns.readTime",
    languagesKey: "community:caregivers.lesson.pronouns.langs",
    to: routes.pronounsGuide,
  },
  {
    number: "04",
    titleKey: "community:caregivers.lesson.transitioning.title",
    bodyKey: "community:caregivers.lesson.transitioning.body",
    readTimeKey: "community:caregivers.lesson.transitioning.readTime",
    languagesKey: "community:caregivers.lesson.transitioning.langs",
    to: routes.transHealthcare,
  },
  {
    number: "05",
    titleKey: "community:caregivers.lesson.familyPullsAway.title",
    bodyKey: "community:caregivers.lesson.familyPullsAway.body",
    readTimeKey: "community:caregivers.lesson.familyPullsAway.readTime",
    languagesKey: "community:caregivers.lesson.familyPullsAway.langs",
    to: routes.parents,
  },
];

/** "Start here" — five short reads, each linking to the closest existing guide. */
export function buildLessons(t: TFunction): Lesson[] {
  return LESSON_SOURCES.map((source) => ({
    number: source.number,
    title: (
      <Translation i18nKey={source.titleKey} components={{ em: <em /> }} />
    ),
    body: <Translation i18nKey={source.bodyKey} components={{ em: <em /> }} />,
    read: t(source.readTimeKey),
    languages: t(source.languagesKey),
    to: source.to,
  }));
}

export interface Faq {
  question: ReactNode;
  answer: ReactNode;
}

interface FaqSource {
  questionKey: string;
  answerKey: string;
}

const FAQ_SOURCES: FaqSource[] = [
  {
    questionKey: "community:caregivers.faq.childCameOut.q",
    answerKey: "community:caregivers.faq.childCameOut.a",
  },
  {
    questionKey: "community:caregivers.faq.partnerTransitioning.q",
    answerKey: "community:caregivers.faq.partnerTransitioning.a",
  },
  {
    questionKey: "community:caregivers.faq.wrongPronouns.q",
    answerKey: "community:caregivers.faq.wrongPronouns.a",
  },
  {
    questionKey: "community:caregivers.faq.grandchildQueer.q",
    answerKey: "community:caregivers.faq.grandchildQueer.a",
  },
];

export function buildFaqs(): Faq[] {
  return FAQ_SOURCES.map((source) => ({
    question: (
      <Translation i18nKey={source.questionKey} components={{ em: <em /> }} />
    ),
    answer: (
      <Translation
        i18nKey={source.answerKey}
        components={{ em: <em />, strong: <strong /> }}
      />
    ),
  }));
}

export interface Room {
  title: ReactNode;
  subtitle: string;
  meta: string;
  to: string;
}

interface RoomSource {
  titleKey: string;
  subtitleKey: string;
  metaKey: string;
  to: string;
}

/** Members-only support rooms — routed to the existing Peer Support hub. */
const ROOM_SOURCES: RoomSource[] = [
  {
    titleKey: "community:caregivers.room.parents.title",
    subtitleKey: "community:caregivers.room.parents.sub",
    metaKey: "community:caregivers.room.parents.meta",
    to: routes.peerSupport,
  },
  {
    titleKey: "community:caregivers.room.partnersOfTrans.title",
    subtitleKey: "community:caregivers.room.partnersOfTrans.sub",
    metaKey: "community:caregivers.room.partnersOfTrans.meta",
    to: routes.peerSupport,
  },
  {
    titleKey: "community:caregivers.room.siblings.title",
    subtitleKey: "community:caregivers.room.siblings.sub",
    metaKey: "community:caregivers.room.siblings.meta",
    to: routes.peerSupport,
  },
  {
    titleKey: "community:caregivers.room.youthWorkers.title",
    subtitleKey: "community:caregivers.room.youthWorkers.sub",
    metaKey: "community:caregivers.room.youthWorkers.meta",
    to: routes.peerSupport,
  },
];

export function buildRooms(t: TFunction): Room[] {
  return ROOM_SOURCES.map((source) => ({
    title: (
      <Translation i18nKey={source.titleKey} components={{ em: <em /> }} />
    ),
    subtitle: t(source.subtitleKey),
    meta: t(source.metaKey),
    to: source.to,
  }));
}

/** The plum "Don't say / Do say" comparison strip. */
const DONT_SAY_KEYS = [
  "community:caregivers.dontSay.1",
  "community:caregivers.dontSay.2",
  "community:caregivers.dontSay.3",
  "community:caregivers.dontSay.4",
  "community:caregivers.dontSay.5",
  "community:caregivers.dontSay.6",
  "community:caregivers.dontSay.7",
];

const DO_SAY_KEYS = [
  "community:caregivers.doSay.1",
  "community:caregivers.doSay.2",
  "community:caregivers.doSay.3",
  "community:caregivers.doSay.4",
  "community:caregivers.doSay.5",
  "community:caregivers.doSay.6",
  "community:caregivers.doSay.7",
];

export function buildDontSay(t: TFunction): string[] {
  return DONT_SAY_KEYS.map((key) => t(key));
}

export function buildDoSay(): ReactNode[] {
  return DO_SAY_KEYS.map((key) => (
    <Translation key={key} i18nKey={key} components={{ em: <em /> }} />
  ));
}

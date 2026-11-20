import type { AdminTone } from "../ui";
import type {
  CulturalEventType,
  CulturalGuideLocale,
  CulturalIdeaStatus,
  CulturalTaskStatus,
} from "./api/culturalProduction.types";

/** The label of each event type, keyed by the wire value. */
export const CULTURAL_EVENT_TYPE_KEY: Record<CulturalEventType, string> = {
  board_game_night: "admin:culturalProduction.eventType.board_game_night",
  quiz_night: "admin:culturalProduction.eventType.quiz_night",
  music_night: "admin:culturalProduction.eventType.music_night",
  film_night: "admin:culturalProduction.eventType.film_night",
  workshop: "admin:culturalProduction.eventType.workshop",
  talk: "admin:culturalProduction.eventType.talk",
  party: "admin:culturalProduction.eventType.party",
  other: "admin:culturalProduction.eventType.other",
};

/** The label of each idea status, keyed by the wire value. */
export const CULTURAL_IDEA_STATUS_KEY: Record<CulturalIdeaStatus, string> = {
  new: "admin:culturalProduction.ideaStatus.new",
  exploring: "admin:culturalProduction.ideaStatus.exploring",
  planned: "admin:culturalProduction.ideaStatus.planned",
  parked: "admin:culturalProduction.ideaStatus.parked",
};

/** The label of each task status, keyed by the wire value. */
export const CULTURAL_TASK_STATUS_KEY: Record<CulturalTaskStatus, string> = {
  todo: "admin:culturalProduction.taskStatus.todo",
  doing: "admin:culturalProduction.taskStatus.doing",
  done: "admin:culturalProduction.taskStatus.done",
};

/** The name of each guide language, keyed by the wire value. */
export const CULTURAL_GUIDE_LOCALE_KEY: Record<CulturalGuideLocale, string> = {
  en: "admin:culturalProduction.guides.locale.en",
  pt: "admin:culturalProduction.guides.locale.pt",
};

/** The idea status chip's tone. */
export const CULTURAL_IDEA_STATUS_TONE: Record<CulturalIdeaStatus, AdminTone> =
  {
    new: "plum",
    exploring: "amber",
    planned: "jade",
    parked: "ghost",
  };

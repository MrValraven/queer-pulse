import type {
  QuizshowQuizShape,
  QuizshowTemplateCardText,
} from "../../../../shared/contracts/quizshow";

/** One wheel template's content; quizshowTemplates.data.ts adds its demo status fields. */
export interface QuizshowDemoWheelPack {
  id: string;
  card: QuizshowTemplateCardText;
  staffNotes: string;
  quiz: QuizshowQuizShape;
}

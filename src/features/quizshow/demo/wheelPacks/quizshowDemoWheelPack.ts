import type { QuizshowTemplateCardText } from "../../../../shared/contracts/quizshow";
import type { QuizshowStoredQuizShape } from "../../quizshowNormalise";

/** One wheel template's content; quizshowTemplates.data.ts adds its demo status fields. */
export interface QuizshowDemoWheelPack {
  id: string;
  card: QuizshowTemplateCardText;
  staffNotes: string;
  /** Stored shape: readers run it through quizshowNormalise (contract 2.4). */
  quiz: QuizshowStoredQuizShape;
}

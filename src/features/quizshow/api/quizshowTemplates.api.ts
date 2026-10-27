import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client";
import type {
  QuizshowTemplateCard,
  QuizshowTemplateDetail,
  QuizshowTemplateInput,
  QuizshowTemplateRow,
} from "../../../shared/contracts/quizshow";

/** Hosts read the published cards here. */
const HOST_TEMPLATES_PATH = "/quizshow/templates";
/** Staff (moderators and admins) manage every template here. */
const STAFF_TEMPLATES_PATH = "/admin/quizshow/templates";

const staffTemplatePath = (templateId: string): string =>
  `${STAFF_TEMPLATES_PATH}/${encodeURIComponent(templateId)}`;

export const getQuizshowTemplateCards = (): Promise<{
  items: QuizshowTemplateCard[];
}> => apiGet<{ items: QuizshowTemplateCard[] }>(HOST_TEMPLATES_PATH);

export const getQuizshowTemplateRows = (): Promise<{
  items: QuizshowTemplateRow[];
}> => apiGet<{ items: QuizshowTemplateRow[] }>(STAFF_TEMPLATES_PATH);

/** 201 with a blank draft. The bare POST sends no request body. */
export const createQuizshowTemplate = (): Promise<QuizshowTemplateDetail> =>
  apiPost<QuizshowTemplateDetail>(STAFF_TEMPLATES_PATH);

export const getQuizshowTemplate = (
  templateId: string,
): Promise<QuizshowTemplateDetail> =>
  apiGet<QuizshowTemplateDetail>(staffTemplatePath(templateId));

export const putQuizshowTemplate = (
  templateId: string,
  body: QuizshowTemplateInput,
): Promise<QuizshowTemplateDetail> =>
  apiPut<QuizshowTemplateDetail>(staffTemplatePath(templateId), body);

/** 201 with the draft copy. The bare POST sends no request body. */
export const duplicateQuizshowTemplate = (
  templateId: string,
): Promise<QuizshowTemplateDetail> =>
  apiPost<QuizshowTemplateDetail>(`${staffTemplatePath(templateId)}/duplicate`);

/** 200 with the detail. The bare POST sends no request body. */
export const publishQuizshowTemplate = (
  templateId: string,
): Promise<QuizshowTemplateDetail> =>
  apiPost<QuizshowTemplateDetail>(`${staffTemplatePath(templateId)}/publish`);

/** 200 with the detail. The bare POST sends no request body. */
export const unpublishQuizshowTemplate = (
  templateId: string,
): Promise<QuizshowTemplateDetail> =>
  apiPost<QuizshowTemplateDetail>(`${staffTemplatePath(templateId)}/unpublish`);

/** 204. */
export const deleteQuizshowTemplate = (templateId: string): Promise<void> =>
  apiDelete<void>(staffTemplatePath(templateId));

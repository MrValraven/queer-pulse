import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

// Mirrors `queerpulse-backend/src/magazine/magazine-reader-comment-response.ts`
// field-for-field.

export interface ReaderCommentAuthorDTO {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ReaderCommentDTO {
  id: string;
  articleId: string;
  parentId: string | null;
  author: ReaderCommentAuthorDTO;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Only ever populated on a top-level comment (`parentId === null`). */
  replies: ReaderCommentDTO[];
}

export interface ReaderCommentsPage {
  items: ReaderCommentDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateReaderCommentInput {
  body: string;
  parentId?: string;
}

export const getReaderComments = (slug: string, page?: number) =>
  apiGet<ReaderCommentsPage>(
    `/magazine/articles/${slug}/comments${page ? `?page=${page}` : ""}`,
  );

export const createReaderComment = (
  slug: string,
  input: CreateReaderCommentInput,
) => apiPost<ReaderCommentDTO>(`/magazine/articles/${slug}/comments`, input);

export const updateReaderComment = (id: string, body: string) =>
  apiPatch<ReaderCommentDTO>(`/magazine/comments/${id}`, { body });

export const deleteReaderComment = (id: string) =>
  apiDelete<ReaderCommentDTO>(`/magazine/comments/${id}`);

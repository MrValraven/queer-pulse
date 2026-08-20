import type { ReaderCommentDTO } from "./readerComments.api";

/** Demo-mode fixture for the reader-comments module (CNT-10) — one
 *  article's worth of top-level comments + flat replies, stable across
 *  renders. Any article id resolves to this same fixture in demo mode
 *  (mirrors `usePieces`/`useArticleComments`'s single-fixture precedent). */
export const DEMO_READER_COMMENTS: ReaderCommentDTO[] = [
  {
    id: "demo-c-1",
    articleId: "demo-article",
    parentId: null,
    author: {
      handle: "rita-valente",
      displayName: "Rita Valente",
      avatarUrl: null,
    },
    body: "This piece named something I've felt for years but never had words for.",
    createdAt: "2026-08-01T10:00:00.000Z",
    editedAt: null,
    deleted: false,
    canEdit: false,
    canDelete: false,
    replies: [
      {
        id: "demo-c-1-r1",
        articleId: "demo-article",
        parentId: "demo-c-1",
        author: { handle: "you", displayName: "You", avatarUrl: null },
        body: "Same here, thank you for writing this.",
        createdAt: "2026-08-01T11:30:00.000Z",
        editedAt: null,
        deleted: false,
        canEdit: true,
        canDelete: true,
        replies: [],
      },
    ],
  },
  {
    id: "demo-c-2",
    articleId: "demo-article",
    parentId: null,
    author: { handle: "joao-p", displayName: "João P.", avatarUrl: null },
    body: "Would love a follow-up on the housing angle mentioned here.",
    createdAt: "2026-08-02T09:15:00.000Z",
    editedAt: null,
    deleted: false,
    canEdit: false,
    canDelete: false,
    replies: [],
  },
];

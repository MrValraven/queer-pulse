import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useProfileData } from "../../../app/providers/useProfile";
import {
  createReaderComment,
  deleteReaderComment,
  updateReaderComment,
  type CreateReaderCommentInput,
  type ReaderCommentDTO,
  type ReaderCommentsPage,
} from "./readerComments.api";
import {
  READER_COMMENTS_PAGE_SIZE,
  readerCommentsQueryKey,
} from "./useReaderComments";

/** Demo-only in-memory id counter so successive demo posts get distinct ids
 *  within one session (no network, no persistence — matches the rest of the
 *  app's demo-mutation fixtures). */
let demoIdSeq = 0;

type ReaderCommentsCache = InfiniteData<ReaderCommentsPage, number>;

function patchBody(
  items: ReaderCommentDTO[],
  id: string,
  body: string,
): ReaderCommentDTO[] {
  return items.map((item) =>
    item.id === id
      ? { ...item, body, editedAt: new Date().toISOString() }
      : { ...item, replies: patchBody(item.replies, id, body) },
  );
}

function patchDeleted(
  items: ReaderCommentDTO[],
  id: string,
): ReaderCommentDTO[] {
  return items.map((item) =>
    item.id === id
      ? {
          ...item,
          body: "",
          deleted: true,
          canEdit: false,
          canDelete: false,
        }
      : { ...item, replies: patchDeleted(item.replies, id) },
  );
}

/**
 * Create/edit/delete for the reader-comments module. Demo mode fabricates a
 * plausible echo and patches the exact `useReaderComments` cache entry in
 * place, so posting/editing/deleting is visibly interactive with no network;
 * live mode calls the real endpoints and invalidates that same query so the
 * next read reflects the server's state (moderation, ordering).
 *
 * The cache is `useInfiniteQuery`'s `{ pages, pageParams }` envelope
 * (PRD-108), so every demo patch walks all loaded pages.
 */
export function useReaderCommentMutations(articleSlug: string) {
  const { demoMode } = useDemoMode();
  const { profile } = useProfileData();
  const queryClient = useQueryClient();
  const queryKey = readerCommentsQueryKey(demoMode, articleSlug);

  function updateDemoPages(
    updatePages: (pages: ReaderCommentsPage[]) => ReaderCommentsPage[],
  ) {
    queryClient.setQueryData<ReaderCommentsCache>(queryKey, (previous) => ({
      pages: updatePages(
        previous?.pages ?? [
          { items: [], total: 0, page: 1, pageSize: READER_COMMENTS_PAGE_SIZE },
        ],
      ),
      pageParams: previous?.pageParams ?? [1],
    }));
  }

  function patchDemoItems(
    update: (items: ReaderCommentDTO[]) => ReaderCommentDTO[],
  ) {
    updateDemoPages((pages) =>
      pages.map((loadedPage) => ({
        ...loadedPage,
        items: update(loadedPage.items),
      })),
    );
  }

  const create = useMutation({
    mutationFn: async (input: CreateReaderCommentInput) => {
      if (demoMode) {
        const comment: ReaderCommentDTO = {
          id: `demo-c-${++demoIdSeq}`,
          articleId: articleSlug,
          parentId: input.parentId ?? null,
          author: {
            handle: "you",
            displayName: "You",
            avatarUrl: profile.photo ?? null,
          },
          body: input.body,
          createdAt: new Date().toISOString(),
          editedAt: null,
          deleted: false,
          canEdit: true,
          canDelete: true,
          replies: [],
        };
        if (input.parentId) {
          const parentId = input.parentId;
          patchDemoItems((items) =>
            items.map((item) =>
              item.id === parentId
                ? { ...item, replies: [...item.replies, comment] }
                : item,
            ),
          );
        } else {
          // A new thread goes on top of the FIRST page (newest first), and the
          // thread total every page carries moves with it.
          updateDemoPages((pages) =>
            pages.map((loadedPage, pageIndex) => ({
              ...loadedPage,
              items:
                pageIndex === 0
                  ? [comment, ...loadedPage.items]
                  : loadedPage.items,
              total: loadedPage.total + 1,
            })),
          );
        }
        return comment;
      }
      const created = await createReaderComment(articleSlug, input);
      await queryClient.invalidateQueries({ queryKey });
      return created;
    },
  });

  const edit = useMutation({
    mutationFn: async (input: { id: string; body: string }) => {
      if (demoMode) {
        patchDemoItems((items) => patchBody(items, input.id, input.body));
        return null;
      }
      const updated = await updateReaderComment(input.id, input.body);
      await queryClient.invalidateQueries({ queryKey });
      return updated;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        patchDemoItems((items) => patchDeleted(items, id));
        return null;
      }
      const deleted = await deleteReaderComment(id);
      await queryClient.invalidateQueries({ queryKey });
      return deleted;
    },
  });

  return { create, edit, remove };
}

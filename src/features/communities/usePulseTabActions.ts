import { useMemo, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import type {
  LivingCommunity,
  Post,
  PostReply,
  ReactionKey,
} from "./community.model";
import { roleLookup, viewerPerson } from "./communityPeople";
import {
  useCreatePost,
  useReact,
  useReply,
  useUnreact,
  useUpdatePost,
} from "./api/useCommunityMutations";
import { usePostImageAttach } from "./usePostImageAttach";

/** The content currently being reported — the shape `ReportReplyModal`
 *  (shared with the forum) already expects. */
export type PulseReportTarget = {
  authorName: string;
  subjectId: string;
  subjectType: "post" | "reply";
};

/**
 * Every write the Pulse feed performs, plus the local optimistic state that
 * backs it. Extracted from `PulseTab` (now layout only) so that component
 * stays under the repo's 200-line-per-component limit; a plain hook returns no
 * JSX, so the limit doesn't apply here.
 */
export function usePulseTabActions(community: LivingCommunity) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const viewer = useMemo(() => viewerPerson(user), [user]);
  const createPost = useCreatePost(community.slug);
  const react = useReact(community.slug);
  const unreact = useUnreact(community.slug);
  const reply = useReply(community.slug);
  const updatePost = useUpdatePost(community.slug);
  const imageAttach = usePostImageAttach();
  const roleOf = useMemo(
    () => roleLookup(community.roster),
    [community.roster],
  );

  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<Post[]>([]);
  // Demo-only pin overrides, keyed by post id — live mode relies on the refetch
  // a successful `useUpdatePost` triggers to move the post between the
  // pinned/regular lists (see `postsToPulse`).
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});
  const [reportTarget, setReportTarget] = useState<PulseReportTarget | null>(
    null,
  );

  const onError = () => showToast(t("communities:common.error"), "error");
  const isPinnedEffective = (post: Post) =>
    pinOverrides[post.id] ?? !!post.pinned;

  /** A refused reaction rolls the pill back through `onFailed` and says so.
   *  `useReact`/`useUnreact` carry `silentError`, so without this the member
   *  was left with a toggled pill, a wrong count, and no feedback at all. */
  const onReactPost = (
    id: string,
    key: ReactionKey,
    willReact: boolean,
    onFailed: () => void,
  ) => {
    const callbacks = {
      onError: () => {
        onFailed();
        onError();
      },
    };
    if (willReact) react.mutate({ id, key }, callbacks);
    else unreact.mutate({ id, key }, callbacks);
  };

  const onReplyPost = (
    id: string,
    text: string,
    onDone?: () => void,
    onFailed?: () => void,
  ) => {
    if (demoMode) return;
    reply.mutate(
      { id, text },
      {
        onSuccess: onDone,
        onError: () => {
          onFailed?.();
          onError();
        },
      },
    );
  };

  const onTogglePin = (post: Post) => {
    const next = !isPinnedEffective(post);
    const pinToast = () =>
      showToast(
        t(
          next
            ? "communities:common.pinnedToast"
            : "communities:common.unpinnedToast",
        ),
        "success",
      );
    if (demoMode) {
      setPinOverrides((prev) => ({ ...prev, [post.id]: next }));
      pinToast();
      return;
    }
    // Live: the refetch a successful PATCH triggers is what actually moves the
    // post between the pinned and regular lists, so the confirmation waits for
    // it rather than announcing a pin the server may have refused.
    updatePost.mutate(
      { id: post.id, dto: { pinned: next } },
      { onSuccess: pinToast, onError },
    );
  };

  const onReportPost = (post: Post) =>
    setReportTarget({
      authorName: post.author.name,
      subjectId: post.id,
      subjectType: "post",
    });

  const onReportReply = (postReply: PostReply) => {
    // A reply's backend id (absent on a demo/optimistic reply that hasn't
    // round-tripped through the API) is the report's subject id.
    if (!postReply.id) return;
    setReportTarget({
      authorName: postReply.author.name,
      subjectId: postReply.id,
      subjectType: "reply",
    });
  };

  const share = () => {
    const text = draft.trim();
    if (!text) return;
    const stagedImage = imageAttach.image;
    const optimisticId = `me-${mine.length}-${Date.now()}`;
    setMine((prev) => [
      {
        id: optimisticId,
        author: viewer ?? { initials: "?", name: "", tint: "plum" },
        body: text,
        image: stagedImage?.previewUrl,
        kind: "post",
        reactions: [{ key: "heart", count: 0 }],
        replies: [],
        createdAt: new Date().toISOString(),
        communitySlug: community.slug,
      },
      ...prev,
    ]);
    setDraft("");
    imageAttach.remove();
    if (demoMode) {
      showToast(t("communities:detail.pulse.sharedToast"), "success");
      return;
    }
    createPost.mutate(
      { body: text, image: stagedImage?.key },
      {
        onSuccess: () => {
          setMine([]);
          showToast(t("communities:detail.pulse.sharedToast"), "success");
        },
        onError: () => {
          setMine((prev) => prev.filter((post) => post.id !== optimisticId));
          onError();
        },
      },
    );
  };

  return {
    viewer,
    roleOf,
    imageAttach,
    draft,
    setDraft,
    mine,
    isPinnedEffective,
    reportTarget,
    setReportTarget,
    onReactPost,
    onReplyPost,
    onTogglePin,
    onReportPost,
    onReportReply,
    share,
  };
}

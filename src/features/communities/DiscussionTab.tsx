import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  EmptyState,
  FeatureHelp,
  SearchInput,
  FilterChips,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import type { Thread as ThreadData } from "./communityDetails";
import type { PulsePaging } from "./api/useCommunityPosts";
import { viewerPerson } from "./communityPeople";
import { useCreatePost } from "./api/useCommunityMutations";
import { CommunityThread } from "./CommunityThread";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

type Chip = "All" | "Pinned" | "Newest";

export function DiscussionTab({
  threads,
  slug,
  isMember,
  paging,
}: {
  threads: ThreadData[];
  slug: string;
  isMember: boolean;
  paging: PulsePaging;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const createPost = useCreatePost(slug);
  const [searchTerm, setSearchTerm] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [newPost, setNewPost] = useState("");
  const [extra, setExtra] = useState<ThreadData[]>([]);

  const shown = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...extra, ...threads];
    if (term)
      list = list.filter((thread) =>
        `${thread.title} ${thread.post}`.toLowerCase().includes(term),
      );
    if (chip === "Pinned") list = list.filter((thread) => thread.pinned);
    if (chip === "Newest")
      list = [...list].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );
    return list;
  }, [searchTerm, chip, extra, threads]);

  function post() {
    const text = newPost.trim();
    if (!text) return;
    const heading = text.length > 70 ? `${text.slice(0, 67)}…` : text;
    // Tag the optimistic entry with a temp id so an errored live POST can roll
    // back exactly this post (and nothing typed since) instead of leaving a
    // phantom thread behind.
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticThread: ThreadData = {
      id: optimisticId,
      votes: 0,
      title: heading,
      author: viewerPerson(user) ?? { initials: "Me", name: "You", tint: "plum" },
      time: t("communities:common.justNow"),
      replyCount: 0,
      post: text,
      replies: [],
    };
    setExtra((prev) => [optimisticThread, ...prev]);
    setNewPost("");
    showToast(t("communities:detail.discussion.startedToast"), "success");
    if (demoMode) return;
    createPost.mutate(
      { body: text },
      {
        // On success the refetched page carries the real post, so drop all
        // optimistic entries.
        onSuccess: () => setExtra([]),
        // On error, remove just this optimistic post so no phantom thread lingers.
        onError: () => {
          setExtra((prev) =>
            prev.filter((thread) => thread.id !== optimisticId),
          );
          showToast(t("communities:common.error"), "error");
        },
      },
    );
  }

  const chipOptions = [
    { value: "All", label: t("communities:detail.discussion.chip.all") },
    { value: "Pinned", label: t("communities:detail.discussion.chip.pinned") },
    { value: "Newest", label: t("communities:detail.discussion.chip.newest") },
  ];

  return (
    <div>
      <div
        className={styles.searchRow}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <div style={{ flex: 1 }}>
          <SearchInput
            ariaLabel={t("communities:detail.discussion.searchAria")}
            placeholder={t("communities:detail.discussion.searchPlaceholder")}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <FeatureHelp id="community.forum" />
      </div>
      <FilterChips
        className={styles.chips}
        label={t("communities:detail.discussion.filterAria")}
        options={chipOptions}
        value={chip}
        onChange={(value) => setChip(value as Chip)}
      />

      {shown.length === 0 ? (
        <EmptyState
          title={t("communities:detail.discussion.empty.title")}
          description={t(
            searchTerm.trim() && paging.hasNextPage
              ? "communities:detail.discussion.empty.searchMore"
              : "communities:detail.discussion.empty.description",
          )}
        />
      ) : (
        shown.map((thread, index) => (
          <FadeIn key={thread.id ?? thread.title} delay={Math.min(index, 8) * 55}>
            <CommunityThread data={thread} slug={slug} />
          </FadeIn>
        ))
      )}

      {/* Search only filters the discussions loaded so far — say so when there
          are more pages, so a member doesn't read a thin result as complete. */}
      {searchTerm.trim() && shown.length > 0 && paging.hasNextPage && (
        <p className={styles.searchScopeNote}>
          {t("communities:detail.discussion.searchScopeNote")}
        </p>
      )}

      {paging.hasNextPage && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:common.loading")
              : t("communities:detail.discussion.loadMore")}
          </Button>
        </div>
      )}

      {isMember && (
        <div className={detail.newPost} style={{ marginTop: 16 }}>
          <div
            className={[detail.rAv, detail.tPlum].join(" ")}
            style={{ width: 30, height: 30 }}
          >
            Me
          </div>
          <textarea
            className={detail.npTa}
            rows={1}
            aria-label={t("communities:detail.forum.newPostPlaceholder")}
            placeholder={t("communities:detail.forum.newPostPlaceholder")}
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
          />
          <Button
            variant="ghost"
            onClick={post}
            style={{ whiteSpace: "nowrap", fontSize: 13 }}
          >
            {t("communities:detail.forum.postCta")}
          </Button>
        </div>
      )}
    </div>
  );
}

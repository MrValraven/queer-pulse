import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  EmptyState,
  SearchInput,
  FilterChips,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Thread as ThreadData } from "./communityDetails";
import { CommunityThread } from "./CommunityThread";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

const CHIPS = ["All", "Pinned", "Newest"] as const;
type Chip = (typeof CHIPS)[number];

export function DiscussionTab({ threads }: { threads: ThreadData[] }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");
  const [newPost, setNewPost] = useState("");
  const [extra, setExtra] = useState<ThreadData[]>([]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = [...extra, ...threads];
    if (term)
      list = list.filter((t) =>
        `${t.title} ${t.post}`.toLowerCase().includes(term),
      );
    if (chip === "Newest") list = [...list].sort((a, b) => b.votes - a.votes);
    return list;
  }, [q, chip, extra, threads]);

  const post = () => {
    const text = newPost.trim();
    if (!text) return;
    const title = text.length > 70 ? `${text.slice(0, 67)}…` : text;
    setExtra((prev) => [
      {
        votes: 1,
        title,
        author: { initials: "Me", name: "You", tint: "plum" },
        time: t("communities:common.justNow"),
        replyCount: 0,
        post: text,
        replies: [],
      },
      ...prev,
    ]);
    setNewPost("");
    showToast(t("communities:detail.discussion.startedToast"), "success");
  };

  const chipOptions = [
    { value: "All", label: t("communities:detail.discussion.chip.all") },
    { value: "Pinned", label: t("communities:detail.discussion.chip.pinned") },
    { value: "Newest", label: t("communities:detail.discussion.chip.newest") },
  ];

  return (
    <div>
      <SearchInput
        className={styles.searchRow}
        ariaLabel={t("communities:detail.discussion.searchAria")}
        placeholder={t("communities:detail.discussion.searchPlaceholder")}
        value={q}
        onChange={setQ}
      />
      <FilterChips
        className={styles.chips}
        options={chipOptions}
        value={chip}
        onChange={(c) => setChip(c as Chip)}
      />

      {shown.length === 0 ? (
        <EmptyState
          title={t("communities:detail.discussion.empty.title")}
          description={t("communities:detail.discussion.empty.description")}
        />
      ) : (
        shown.map((thread, i) => (
          <FadeIn key={thread.title} delay={Math.min(i, 8) * 55}>
            <CommunityThread data={thread} />
          </FadeIn>
        ))
      )}

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
          placeholder={t("communities:detail.forum.newPostPlaceholder")}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <Button
          variant="ghost"
          onClick={post}
          style={{ whiteSpace: "nowrap", fontSize: 13 }}
        >
          {t("communities:detail.forum.postCta")}
        </Button>
      </div>
    </div>
  );
}

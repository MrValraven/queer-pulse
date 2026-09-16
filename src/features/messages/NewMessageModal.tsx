import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
import { MessageRequestComposer } from "./MessageRequestComposer";
import { NewMessagePickList } from "./NewMessagePickList";
import {
  useStrangerMemberSearch,
  type StrangerMemberResult,
} from "./api/useStrangerMemberSearch";
import { type Conversation } from "./data";
import styles from "./NewMessageModal.module.css";

interface NewMessageModalProps {
  onClose: () => void;
  onPick: (recipient: Conversation) => void;
  /** Overrides the default title/sub, for other single-recipient
   *  picker use cases (e.g. inviting a friend to a gathering). */
  title?: string;
  sub?: string;
  /**
   * PRD-343: pre-selects the request-compose step for a specific person,
   * skipping the picker entirely. Used when a caller already knows WHO
   * (e.g. `useThreadCreation`'s `onRequiresConnection`, fired when
   * `POST /conversations` 403s a fresh non-connection): the caller had
   * already committed to messaging this exact person before the picker
   * ever opened. Omit for the ordinary "pick someone, then maybe request" flow.
   */
  initialRequestTarget?: StrangerMemberResult | null;
}

/**
 * A connection → the seed of a fresh thread. Only identity fields matter here;
 * the real history (messages, unread, timestamps) is filled by the server once
 * the thread opens (or stays empty in demo). Carries the connection's photo so
 * the picker shows real avatars, with initials + tint as the fallback.
 */
function connectionToRecipient(view: ConnectionView): Conversation {
  return {
    id: view.slug,
    slug: view.slug,
    initials: view.initials,
    tint: view.tint,
    avatarUrl: view.photo,
    name: view.name,
    pronouns: view.pron ?? "",
    connectedSince: view.meta.since ?? "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}

/** Self-contained recipient picker — opens (or reuses) a thread for the chosen
 *  member. Built on the shared `Modal` (scroll-lock / focus-trap / Escape); the
 *  People rows reuse the shared `MemberIdentity` block. Keeps its own search box
 *  and single-tap pick. */
export function NewMessageModal({
  onClose,
  onPick,
  title,
  sub,
  initialRequestTarget = null,
}: NewMessageModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isBlocked } = useSocial();
  const { user } = useAuth();
  const staffMap = useStaffMap();
  const [query, setQuery] = useState("");
  // The member picked from the "Message someone new" fall-through, once
  // they're confirmed not an accepted connection — swaps this modal's body to
  // the request compose step (MSG-1).
  const [requestTarget, setRequestTarget] =
    useState<StrangerMemberResult | null>(initialRequestTarget);

  // The recipient pool is the member's accepted connections — demo resolves the
  // mock relationships locally, live fetches GET /connections. (Mirrors the
  // "add steward" picker; never the mock DM threads, which are neither.)
  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  // A picker with a search box must see EVERY connection, not just the first
  // page: the search below filters what's loaded, so an unfetched connection is
  // silently unreachable. The connection set is personal and bounded, so drain
  // the remaining pages while the modal is open — each fetch flips
  // hasNextPage/isFetchingNextPage, re-running this until the last page lands.
  // No-op in demo / blocked (hasNextPage is false there).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const candidates = useMemo(
    // Blocked members are unreachable — never offer them as a recipient.
    () =>
      views.filter((view) => !isBlocked(view.slug)).map(connectionToRecipient),
    [views, isBlocked],
  );

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? candidates.filter((c) => c.name.toLowerCase().includes(q))
      : candidates;
  }, [query, candidates]);

  // MSG-1 fall-through: anyone the People search doesn't already cover
  // (accepted connections) can still be reached — picking one opens the
  // message-request composer instead of an existing thread.
  // `selfSlug` is read out BEFORE the memo rather than inside it: reading
  // `user` in the body while depending on `user?.profile.slug` makes the
  // compiler infer a broader dependency than the one written, and it then
  // skips optimizing the whole component rather than change how often the
  // value recomputes.
  const selfSlug = user?.profile.slug;
  const excludeSlugs = useMemo(() => {
    const slugs = new Set(
      candidates.map((c) => c.slug).filter(Boolean) as string[],
    );
    if (selfSlug) slugs.add(selfSlug);
    return slugs;
  }, [candidates, selfSlug]);
  const strangerSearch = useStrangerMemberSearch(query, excludeSlugs);
  // Blocked members are unreachable here too (mirrors the People/`candidates`
  // filter above) — otherwise a blocked stranger still shows up as a pickable
  // "message someone new" result and only 403s server-side once tapped.
  const strangers = strangerSearch.results.filter(
    (result) => !isBlocked(result.slug),
  );
  // `useStrangerMemberSearch` exposes no `refetch`. Invalidate by its
  // query-key PREFIX instead (`["strangerMemberSearch", debounced,
  // demoMode]`), the same convention this feature's mutations already use
  // for `["conversations"]` (DES-185's Retry).
  const retryStrangerSearch = () =>
    void queryClient.invalidateQueries({ queryKey: ["strangerMemberSearch"] });

  if (requestTarget) {
    return (
      <Modal title={requestTarget.name} onClose={onClose}>
        <MessageRequestComposer
          target={requestTarget}
          onBack={() => setRequestTarget(null)}
          onSent={() => {
            setRequestTarget(null);
            onClose();
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={title ?? t("messages:newMessage.title")}
      sub={sub ?? t("messages:newMessage.sub")}
      onClose={onClose}
    >
      <SearchInput
        className={styles.searchField}
        value={query}
        onChange={setQuery}
        placeholder={t("messages:newMessage.searchPlaceholder")}
        ariaLabel={t("messages:newMessage.searchAria")}
      />
      <NewMessagePickList
        people={people}
        strangers={strangers}
        strangersLoading={strangerSearch.loading}
        strangersError={strangerSearch.isError}
        onRetryStrangers={retryStrangerSearch}
        staffMap={staffMap}
        loading={loading}
        candidatesCount={candidates.length}
        query={query}
        onPick={onPick}
        onPickStranger={setRequestTarget}
      />
    </Modal>
  );
}

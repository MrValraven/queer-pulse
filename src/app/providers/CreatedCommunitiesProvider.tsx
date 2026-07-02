import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  makeRef,
  slugify,
  type CommunityDraft,
  type CreatedCommunity,
} from "../../features/communities/startCommunity/startCommunity.data";
import type { CommunityType } from "../../features/homepage/data/types";

interface CreatedCommunitiesContextValue {
  /** Communities founded this session, newest first. */
  created: CreatedCommunity[];
  /** Persist a draft as a live community; returns the created record. */
  createCommunity: (
    draft: CommunityDraft,
    ownerSlug: string,
  ) => CreatedCommunity;
}

const CreatedCommunitiesContext =
  createContext<CreatedCommunitiesContextValue | null>(null);

/** Session store for member-founded communities (created live, self-owned). */
export function CreatedCommunitiesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [created, setCreated] = useState<CreatedCommunity[]>([]);
  const [seq, setSeq] = useState(3);

  const createCommunity = useCallback(
    (draft: CommunityDraft, ownerSlug: string) => {
      const type = (draft.type || "social") as CommunityType;
      const community: CreatedCommunity = {
        ...draft,
        type,
        accessTier: draft.accessTier || "public",
        handle: draft.handle.trim() || slugify(draft.name),
        slug: slugify(draft.handle.trim() || draft.name),
        ref: makeRef(seq),
        ownerSlug,
        createdAt: "just now",
      };
      setCreated((prev) => [community, ...prev]);
      setSeq((n) => n + 1);
      return community;
    },
    [seq],
  );

  const value = useMemo(
    () => ({ created, createCommunity }),
    [created, createCommunity],
  );

  return (
    <CreatedCommunitiesContext.Provider value={value}>
      {children}
    </CreatedCommunitiesContext.Provider>
  );
}

export function useCreatedCommunities(): CreatedCommunitiesContextValue {
  const ctx = useContext(CreatedCommunitiesContext);
  if (!ctx) {
    throw new Error(
      "useCreatedCommunities must be used within a CreatedCommunitiesProvider",
    );
  }
  return ctx;
}

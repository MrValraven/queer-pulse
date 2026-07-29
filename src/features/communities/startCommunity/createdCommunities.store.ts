import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  makeRef,
  slugify,
  type CommunityDraft,
  type CreatedCommunity,
} from "./startCommunity.data";

/**
 * Session store for member-founded communities — DEMO ONLY.
 *
 * In live mode founding a community is `POST /communities` (`useCreateCommunity`),
 * and `StartCommunityPage` navigates to the created hub, so nothing ever reaches
 * this store: the `["communities"]` query is the single source of truth and the
 * server-issued slug/ref are authoritative. The prototype still needs somewhere
 * to keep a community you founded in-session so it shows up in Discover and has
 * a detail page, which is all this is.
 *
 * It's a module-level external store rather than a context provider because it
 * has exactly one writer (the wizard's demo branch) and no live-mode counterpart
 * — putting it in the App provider tree implied it was part of the real data
 * path. `useSyncExternalStore` keeps every reader re-rendering as before.
 */

let created: CreatedCommunity[] = [];
let seq = 3;

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): CreatedCommunity[] {
  return created;
}

/** Persist a draft as a live community; returns the created record. */
export function createCommunityRecord(
  draft: CommunityDraft,
  ownerSlug: string,
): CreatedCommunity {
  const type = draft.type || "social";
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
  created = [community, ...created];
  seq += 1;
  for (const listener of listeners) listener();
  return community;
}

const NONE: CreatedCommunity[] = [];

/** Communities founded this session, newest first. Empty in live mode: these are
 *  demo fictions, and emptying the platform must never surface them. */
export function useCreatedCommunities() {
  const { demoMode } = useDemoMode();
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const createCommunity = useCallback(
    (draft: CommunityDraft, ownerSlug: string) =>
      createCommunityRecord(draft, ownerSlug),
    [],
  );
  const visible = demoMode ? list : NONE;
  return useMemo(
    () => ({ created: visible, createCommunity }),
    [visible, createCommunity],
  );
}

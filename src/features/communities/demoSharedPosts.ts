import { useSyncExternalStore } from "react";
import type { Post } from "./community.model";

/**
 * Demo only: posts written by "Share to a community" this session, per
 * community, newest first. Demo has no server, so `useCommunityPosts` puts
 * these above the mock board and the share is there when the member opens
 * that community. Live mode never writes or reads it.
 */
const NO_POSTS: readonly Post[] = [];
let postsBySlug: Readonly<Record<string, readonly Post[]>> = {};
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function addDemoSharedPost(post: Post): void {
  const current = postsBySlug[post.communitySlug] ?? NO_POSTS;
  postsBySlug = { ...postsBySlug, [post.communitySlug]: [post, ...current] };
  notify();
}

export function useDemoSharedPosts(slug: string | undefined): readonly Post[] {
  return useSyncExternalStore(
    subscribe,
    () => (slug ? (postsBySlug[slug] ?? NO_POSTS) : NO_POSTS),
    () => NO_POSTS,
  );
}

/** Test reset. */
export function clearDemoSharedPosts(): void {
  postsBySlug = {};
  notify();
}

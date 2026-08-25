import { useState } from "react";
import type {
  AccentKey,
  AvailabilityKey,
  LinkVisibility,
  Visibility,
} from "./api/subprofiles.api";
import type { MetaSnapshot } from "./subprofileEditorDiff";
import {
  computeServerMetaResync,
  sameMetaSnapshot,
} from "./subprofileMetaEditor.helpers";

/** The setters `useServerMetaResync` may call to adopt an un-edited field's
 *  server value, keyed the same as `MetaSnapshot`. */
export interface ServerMetaResyncSetters {
  setDisplayName: (value: string) => void;
  setTagline: (value: string) => void;
  setBio: (value: string) => void;
  setAvatarUrl: (value: string) => void;
  setCoverUrl: (value: string) => void;
  setSlug: (value: string) => void;
  setHandle: (value: string) => void;
  setLink: (value: LinkVisibility) => void;
  setVisibility: (value: Visibility) => void;
  setAccent: (value: AccentKey) => void;
  setAvailability: (value: AvailabilityKey | "") => void;
  setCtaLabel: (value: string) => void;
  setCtaUrl: (value: string) => void;
  setCoverBleed: (value: boolean) => void;
}

/**
 * Every field in `useSubprofileMetaEditor` is seeded ONCE from the loaded
 * `subprofile`, and the editor shell only remounts on a different persona —
 * so a refetch that changes a value server-side used to go unnoticed.
 * Unpublish is the sharp case: it NULLs an unlinked persona's handle, while
 * local `handle` and `baseline.handle` kept the old value, so `handleChanged`
 * computed false, the handle was never re-sent, and `dirty` stayed false with
 * Save disabled. The address silently stopped saving and Publish then failed
 * a "handle" completeness check against a null row.
 *
 * So: when the server value for a field changes and the member has NOT
 * edited that field locally (local === baseline), adopt the new value into
 * both the field and the baseline. A locally-edited field keeps the edit and
 * stays dirty, so their work is never overwritten by a background refetch.
 * Snap-during-render (React's "adjust state while rendering"), not an effect,
 * so the fresh values are already in place on this same paint.
 */
export function useServerMetaResync(
  serverMeta: MetaSnapshot,
  local: MetaSnapshot,
  baseline: MetaSnapshot,
  setBaseline: (next: MetaSnapshot) => void,
  setters: ServerMetaResyncSetters,
): void {
  const [appliedServerMeta, setAppliedServerMeta] =
    useState<MetaSnapshot>(serverMeta);
  if (sameMetaSnapshot(appliedServerMeta, serverMeta)) return;

  const adopters: Record<keyof MetaSnapshot, (server: MetaSnapshot) => void> = {
    displayName: (server) => setters.setDisplayName(server.displayName),
    tagline: (server) => setters.setTagline(server.tagline),
    bio: (server) => setters.setBio(server.bio),
    avatarUrl: (server) => setters.setAvatarUrl(server.avatarUrl),
    coverUrl: (server) => setters.setCoverUrl(server.coverUrl),
    slug: (server) => setters.setSlug(server.slug),
    handle: (server) => setters.setHandle(server.handle),
    link: (server) => setters.setLink(server.link as LinkVisibility),
    visibility: (server) =>
      setters.setVisibility(server.visibility as Visibility),
    accent: (server) => setters.setAccent(server.accent as AccentKey),
    availability: (server) =>
      setters.setAvailability(server.availability as AvailabilityKey | ""),
    ctaLabel: (server) => setters.setCtaLabel(server.ctaLabel),
    ctaUrl: (server) => setters.setCtaUrl(server.ctaUrl),
    coverBleed: (server) => setters.setCoverBleed(server.coverBleed),
  };

  const { changedKeys, nextBaseline } = computeServerMetaResync(
    local,
    baseline,
    serverMeta,
    appliedServerMeta,
  );
  for (const key of changedKeys) adopters[key](serverMeta);
  setAppliedServerMeta(serverMeta);
  setBaseline(nextBaseline);
}

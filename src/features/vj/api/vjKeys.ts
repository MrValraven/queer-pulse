/** Query keys of the VJ library. The mode flag comes last so a demo cache never
 *  answers for a live one. */
export const vjKeys = {
  root: ["admin", "vj"] as const,
  packs: (isDemoMode: boolean) =>
    ["admin", "vj", "packs", { demo: isDemoMode }] as const,
  packClipsRoot: ["admin", "vj", "packClips"] as const,
  packClips: (packId: string, isDemoMode: boolean) =>
    ["admin", "vj", "packClips", packId, { demo: isDemoMode }] as const,
  clips: (isDemoMode: boolean) =>
    ["admin", "vj", "clips", { demo: isDemoMode }] as const,
};

/** The mutation key every library write carries, so `useVjIsWriting` can see
 *  any of them in flight. */
export const VJ_WRITE_KEY = ["admin", "vj", "write"] as const;

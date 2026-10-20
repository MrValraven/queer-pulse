// Studio safety: query keys beside studioKeys, in their own file so the
// safety work stays in its own modules. shared/api/realtime.ts writes
// `myClaims(false)` out literally, so a change here changes it there too.
export const studioSafetyKeys = {
  myClaims: (demoMode: boolean) =>
    ["studio", "claims", "mine", demoMode] as const,
  reviewClaims: (demoMode: boolean) =>
    ["studio", "review", "claims", demoMode] as const,
  reviewClaimCounts: (demoMode: boolean) =>
    ["studio", "review", "claimCounts", demoMode] as const,
  reviewTrackReports: (demoMode: boolean) =>
    ["studio", "review", "trackReports", demoMode] as const,
  adminTrack: (demoMode: boolean, trackId: string) =>
    ["studio", "adminTrack", demoMode, trackId] as const,
};

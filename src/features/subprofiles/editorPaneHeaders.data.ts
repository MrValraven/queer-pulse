import type { EditorPaneKey } from "./editorRail.data";

export interface PaneHeaderCopy {
  titleKey: string;
  ledeKey: string;
}

/**
 * Static `.ed-main` header (h2 + `.lede`) copy for every rail pane EXCEPT the
 * per-section Content entries, whose title is the section's own `labelKey`
 * (`SECTION_META`, resolved on the `SubprofileSectionView`) — see
 * `CONTENT_PANE_LEDE_KEY` below and `EditorPaneRouter.tsx`.
 *
 * `identity`/`presence`/`address` each get their OWN title/lede AND their own
 * pane body (`SubprofileIdentityFields`/`SubprofilePresenceFields`/
 * `SubprofileLinkFields`, see `EditorPaneRouter.tsx`) even though all three
 * share one `useSubprofileMetaEditor` instance/save underneath.
 *
 * `affiliations`/`owners` reuse the existing card copy those panels already
 * shipped with (`affiliationsEditor.title/.note`, `owners.title/.note`)
 * rather than duplicating near-identical new strings.
 */
export const PANE_HEADER: Partial<Record<EditorPaneKey, PaneHeaderCopy>> = {
  identity: {
    titleKey: "subprofiles:editorPane.identity.title",
    ledeKey: "subprofiles:editorPane.identity.lede",
  },
  presence: {
    titleKey: "subprofiles:editorPane.presence.title",
    ledeKey: "subprofiles:editorPane.presence.lede",
  },
  address: {
    titleKey: "subprofiles:editorPane.address.title",
    ledeKey: "subprofiles:editorPane.address.lede",
  },
  skinBlocks: {
    titleKey: "subprofiles:editorPane.skinBlocks.title",
    ledeKey: "subprofiles:editorPane.skinBlocks.lede",
  },
  affiliations: {
    titleKey: "subprofiles:affiliationsEditor.title",
    ledeKey: "subprofiles:affiliationsEditor.note",
  },
  owners: {
    titleKey: "subprofiles:owners.title",
    ledeKey: "subprofiles:owners.note",
  },
  publish: {
    titleKey: "subprofiles:editorPane.publish.title",
    ledeKey: "subprofiles:editorPane.publish.lede",
  },
};

/** Shared lede shown above every per-section Content pane. */
export const CONTENT_PANE_LEDE_KEY = "subprofiles:editorPane.content.lede";

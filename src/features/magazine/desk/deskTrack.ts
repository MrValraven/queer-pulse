/** The scopes the desk shows pieces in: unfiled work (`issueId === null`),
 *  work bound to the SELECTED issue, or everything still in flight across
 *  every issue. A piece on another issue shows under Everything, or under
 *  the issue scope once that issue is selected. The header's scope menu
 *  (`DeskScopeMenu`) switches between them. */
export type DeskTrack = "unassigned" | "issue" | "everything";

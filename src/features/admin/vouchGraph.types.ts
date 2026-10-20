import type { Standing } from "./trustGraph/trustGraphModel";

export type VouchMode = "plain" | "clusters" | "safety" | "invites";
export type VouchLayoutKind = "rings" | "force";
export type VouchEdgeFilterKind = "invite" | "vouch" | "mutual";
export interface VouchGraphFilters {
  standings: Standing[]; // empty = all
  sceneId: string | null; // matches any of person.sceneIds
  isVerifiedOnly: boolean;
  connectedFrom: string | null; // 'YYYY-MM' inclusive, on edge.date
  connectedTo: string | null;
  edgeKinds: VouchEdgeFilterKind[]; // empty = all
  shouldHideWithdrawn: boolean;
}
export interface InviteBubble {
  id: string; // `bubble:${parentId}`
  parentId: string;
  leafIds: string[];
  isExpanded: boolean;
}
export interface CenterRequest {
  id: string;
  nonce: number;
}
export interface VouchGraphUrlView {
  focus: string;
  mode: VouchMode;
  selectedId: string | null;
  pathA: string | null;
  pathB: string | null;
  filters: VouchGraphFilters;
  isListView: boolean;
}

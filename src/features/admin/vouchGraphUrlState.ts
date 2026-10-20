import type { Standing } from "./trustGraph/trustGraphModel";
import type {
  VouchEdgeFilterKind,
  VouchGraphFilters,
  VouchGraphUrlView,
  VouchMode,
} from "./vouchGraph.types";

/** The focus slug. Its presence is what opens the trust network. */
export const TRUST_NETWORK_PARAM = "tn";
const TAB_PARAM = "tnTab";
const SELECTED_PARAM = "tnSel";
const PATH_A_PARAM = "tnA";
const PATH_B_PARAM = "tnB";
const LIST_PARAM = "tnList";
const STANDING_PARAM = "tnStanding";
const SCENE_PARAM = "tnScene";
const VERIFIED_PARAM = "tnVerified";
const FROM_PARAM = "tnFrom";
const TO_PARAM = "tnTo";
const EDGES_PARAM = "tnEdges";
const HIDE_WITHDRAWN_PARAM = "tnHideWithdrawn";

/** Every `tn*` param name, so closing the view can clear them all. */
export const TRUST_NETWORK_PARAMS: readonly string[] = [
  TRUST_NETWORK_PARAM,
  TAB_PARAM,
  SELECTED_PARAM,
  PATH_A_PARAM,
  PATH_B_PARAM,
  LIST_PARAM,
  STANDING_PARAM,
  SCENE_PARAM,
  VERIFIED_PARAM,
  FROM_PARAM,
  TO_PARAM,
  EDGES_PARAM,
  HIDE_WITHDRAWN_PARAM,
];

const FLAG_ON = "1";
const MAX_ID_LENGTH = 200;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** URL tab names, in the words the admin sees on the tabs. A Map, so
 *  prototype names such as "toString" never resolve to a mode. */
const MODE_BY_TAB: ReadonlyMap<string, VouchMode> = new Map<string, VouchMode>([
  ["network", "plain"],
  ["scenes", "clusters"],
  ["safety", "safety"],
  ["invites", "invites"],
]);
const TAB_BY_MODE: Record<VouchMode, string> = {
  plain: "network",
  clusters: "scenes",
  safety: "safety",
  invites: "invites",
};

const STANDINGS: readonly Standing[] = ["trusted", "warned", "new", "flagged"];
const EDGE_KINDS: readonly VouchEdgeFilterKind[] = [
  "invite",
  "vouch",
  "mutual",
];

/** A slug-like id: non-empty after trimming, bounded length. The reader and
 *  the writer share it, so a written view reads back the same. */
function normalizeId(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value || value.length > MAX_ID_LENGTH) return null;
  return value;
}

function normalizeMonth(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  return value && MONTH_PATTERN.test(value) ? value : null;
}

function readId(params: URLSearchParams, name: string): string | null {
  return normalizeId(params.get(name));
}

function readMonth(params: URLSearchParams, name: string): string | null {
  return normalizeMonth(params.get(name));
}

function readFlag(params: URLSearchParams, name: string): boolean {
  return params.get(name) === FLAG_ON;
}

function isAllowedValue<Value extends string>(
  allowedValues: readonly Value[],
  candidate: string,
): candidate is Value {
  return (allowedValues as readonly string[]).includes(candidate);
}

/** A comma list kept to the allowed values, deduped, in the order given. */
function readList<Value extends string>(
  params: URLSearchParams,
  name: string,
  allowedValues: readonly Value[],
): Value[] {
  const raw = params.get(name);
  if (!raw) return [];
  const values: Value[] = [];
  for (const part of raw.split(",")) {
    const candidate = part.trim();
    if (
      isAllowedValue(allowedValues, candidate) &&
      !values.includes(candidate)
    ) {
      values.push(candidate);
    }
  }
  return values;
}

function readFilters(params: URLSearchParams): VouchGraphFilters {
  return {
    standings: readList(params, STANDING_PARAM, STANDINGS),
    sceneId: readId(params, SCENE_PARAM),
    isVerifiedOnly: readFlag(params, VERIFIED_PARAM),
    connectedFrom: readMonth(params, FROM_PARAM),
    connectedTo: readMonth(params, TO_PARAM),
    edgeKinds: readList(params, EDGES_PARAM, EDGE_KINDS),
    shouldHideWithdrawn: readFlag(params, HIDE_WITHDRAWN_PARAM),
  };
}

/** Reads the trust network view from the URL, or null when no focus is set.
 *  Unknown or invalid values fall back to their defaults. A second path
 *  endpoint without a first is dropped. */
export function readVouchGraphUrlView(
  params: URLSearchParams,
): VouchGraphUrlView | null {
  const focus = readId(params, TRUST_NETWORK_PARAM);
  if (!focus) return null;
  const tab = params.get(TAB_PARAM)?.trim() ?? "";
  const pathA = readId(params, PATH_A_PARAM);
  return {
    focus,
    mode: MODE_BY_TAB.get(tab) ?? "plain",
    selectedId: readId(params, SELECTED_PARAM),
    pathA,
    pathB: pathA ? readId(params, PATH_B_PARAM) : null,
    filters: readFilters(params),
    isListView: readFlag(params, LIST_PARAM),
  };
}

function setIfPresent(
  params: URLSearchParams,
  name: string,
  value: string | null,
): void {
  if (value) params.set(name, value);
}

function setFlag(params: URLSearchParams, name: string, isOn: boolean): void {
  if (isOn) params.set(name, FLAG_ON);
}

/** Returns a copy of `params` with the view written into its `tn*` params.
 *  Defaults are left out to keep links short. Ids and months go through the
 *  reader's normalisers. `null`, or a focus that normalises to nothing,
 *  clears every `tn*` param and keeps the rest. */
export function writeVouchGraphUrlView(
  params: URLSearchParams,
  view: VouchGraphUrlView | null,
): URLSearchParams {
  const next = new URLSearchParams(params);
  TRUST_NETWORK_PARAMS.forEach((name) => next.delete(name));
  const focus = normalizeId(view?.focus);
  if (!view || !focus) return next;

  const { filters } = view;
  const pathA = normalizeId(view.pathA);
  next.set(TRUST_NETWORK_PARAM, focus);
  if (view.mode !== "plain") next.set(TAB_PARAM, TAB_BY_MODE[view.mode]);
  setIfPresent(next, SELECTED_PARAM, normalizeId(view.selectedId));
  setIfPresent(next, PATH_A_PARAM, pathA);
  setIfPresent(next, PATH_B_PARAM, pathA ? normalizeId(view.pathB) : null);
  setFlag(next, LIST_PARAM, view.isListView);
  setIfPresent(next, STANDING_PARAM, filters.standings.join(",") || null);
  setIfPresent(next, SCENE_PARAM, normalizeId(filters.sceneId));
  setFlag(next, VERIFIED_PARAM, filters.isVerifiedOnly);
  setIfPresent(next, FROM_PARAM, normalizeMonth(filters.connectedFrom));
  setIfPresent(next, TO_PARAM, normalizeMonth(filters.connectedTo));
  setIfPresent(next, EDGES_PARAM, filters.edgeKinds.join(",") || null);
  setFlag(next, HIDE_WITHDRAWN_PARAM, filters.shouldHideWithdrawn);
  return next;
}

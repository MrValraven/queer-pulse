/**
 * OPS-04's three views of a staff queue: everything, what I am holding, and
 * what nobody has picked up yet.
 *
 * The values are canonical and untranslated because they reach the API; only
 * the labels are resolved at render (`QueueAssignmentFilter`). They live in
 * this plain module rather than beside the component so a page importing the
 * type or the mapper does not pull a component into a non-component file,
 * which is what `react-refresh/only-export-components` asks for.
 */
export const QUEUE_ASSIGNMENT_SCOPES = ["all", "mine", "unassigned"] as const;

export type QueueAssignmentScope = (typeof QUEUE_ASSIGNMENT_SCOPES)[number];

/**
 * The `assignedTo` query value for a scope, or `undefined` for "everything" —
 * the shape both `GET /join-requests` and
 * `GET /admin/verifications/requests` accept.
 *
 * The control says "mine" because that is what the label means to the person
 * reading it; the API says "me" because that is what it resolves against the
 * session. This one function is where the two vocabularies meet.
 */
export function assignedToParam(
  scope: QueueAssignmentScope,
): "me" | "unassigned" | undefined {
  if (scope === "all") return undefined;
  return scope === "mine" ? "me" : "unassigned";
}

/**
 * State + defaults for the Scope-of-Work / Quote generator.
 *
 * All values are local prototype state — no backend. The `price` field is
 * optional: when filled, the document doubles as a quote.
 */
export interface ScopeState {
  project: string
  clientName: string
  /** What you WILL deliver. */
  deliverables: string[]
  /** Explicitly excluded — the line that prevents most disputes. */
  outOfScope: string[]
  revisions: string
  milestones: string
  /** Optional total price (a bare number, parsed with Number). Empty = no quote. */
  price: string
  /** ISO date (yyyy-mm-dd) the quote/scope is valid until. */
  validUntil: string
}

export const DEFAULT_SCOPE: ScopeState = {
  project: '',
  clientName: '',
  deliverables: [
    'Discovery call + written brief',
    'Two homepage design concepts',
  ],
  outOfScope: [
    'Copywriting and translation',
    'Ongoing maintenance after handover',
  ],
  revisions: '2 rounds of revisions per deliverable',
  milestones:
    '50% deposit to start, 50% on final handover. Timeline agreed after the discovery call.',
  price: '',
  validUntil: '',
}

/**
 * What a business sells and what it costs.
 *
 * The single `price` band (Free / EUR / EUR EUR / EUR EUR EUR) stays exactly as
 * it is: it is the at-a-glance signal that lets someone scan a grid. This list
 * is the answer to the next question, which the band cannot carry. `price` here
 * is free text on purpose, so "from 25 EUR", "sliding scale", "first session
 * free" and "by quote" can all be told truthfully.
 */

/** One priced thing, in the shape the API sends and accepts. */
export interface ListingServiceOffering {
  name: string;
  price: string;
  note: string;
}

/**
 * One row of the owner's editable list. Carries a client-only `id` so React
 * keys survive a reorder or a removal from the middle; `servicesForPayload`
 * strips it before anything is sent.
 */
export interface ListingServiceRow extends ListingServiceOffering {
  id: string;
}

/** Server ceilings, mirrored so the editor can stop a member before the API
 *  has to. */
export const MAX_LISTING_SERVICES = 30;
export const SERVICE_NAME_MAX = 120;
export const SERVICE_PRICE_MAX = 80;
export const SERVICE_NOTE_MAX = 140;

let serviceRowSequence = 0;

/** A blank row with a fresh key. */
export function newServiceRow(): ListingServiceRow {
  serviceRowSequence += 1;
  return { id: `service-${serviceRowSequence}`, name: "", price: "", note: "" };
}

/**
 * Adopt whatever the server or a resumed local draft holds as editable rows,
 * minting a key per row. An absent list is simply an empty list.
 *
 * Takes `unknown` on purpose: one caller passes a typed API field, another
 * passes whatever a months-old draft left in local storage, and every field is
 * checked here rather than trusted.
 */
export function toServiceRows(input?: unknown): ListingServiceRow[] {
  if (!Array.isArray(input)) return [];
  return (input as unknown[]).map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    return {
      ...newServiceRow(),
      name: typeof record.name === "string" ? record.name : "",
      price: typeof record.price === "string" ? record.price : "",
      note: typeof record.note === "string" ? record.note : "",
    };
  });
}

/** True when a row has neither a name nor a price: a blank line the owner
 *  added and never filled, which is never sent and never blocks a save. */
export function isBlankServiceRow(row: ListingServiceOffering): boolean {
  return row.name.trim() === "" && row.price.trim() === "";
}

/** What is still wrong with a row that the owner did start filling in. `null`
 *  means the row is fine (or is blank, which is fine too). */
export type ServiceRowProblem = "name" | "price";

export function serviceRowProblem(
  row: ListingServiceOffering,
): ServiceRowProblem | null {
  if (isBlankServiceRow(row)) return null;
  if (row.name.trim() === "") return "name";
  // A service row with no price is the exact gap this list exists to close.
  if (row.price.trim() === "") return "price";
  return null;
}

/** True when every started row is complete. Blank rows never fail. */
export function servicesValid(
  rows: readonly ListingServiceOffering[],
): boolean {
  return rows.every((row) => serviceRowProblem(row) === null);
}

/** The wire shape: blank rows dropped, values trimmed, client keys stripped. */
export function servicesForPayload(
  rows: readonly ListingServiceRow[],
): ListingServiceOffering[] {
  return rows
    .filter((row) => !isBlankServiceRow(row))
    .map((row) => ({
      name: row.name.trim(),
      price: row.price.trim(),
      note: row.note.trim(),
    }));
}

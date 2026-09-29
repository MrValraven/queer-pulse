/**
 * Demo seed buckets for `ConnectionsProvider` (real member slugs), in a module
 * with no imports. ENG-504: the provider mounts app-wide, so it reads these
 * from here; `connections.data.ts` (the relationship metadata and the member
 * registry it joins) then stays out of the first-paint JS. That file
 * re-exports all three names, so existing imports keep working.
 */
export const SEED_CONNECTED = [
  "catarina-vaz",
  "jonas",
  "luisa",
  "anika",
  "rita",
  "nuno",
  "sofia-castano",
  "sara-pinheiro",
];
export const SEED_INCOMING = [
  "daniel-oliveira",
  "mariana-costa",
  "bilal-kaya",
  "ines-fonseca",
];
export const SEED_SENT = ["raquel-baptista", "catarina-melo"];

import { createVjUuid } from "../live/vjUuid";
import type { VjCommandStamp } from "./vjFrames";

export interface VjCommandStamper {
  /** Minted once per stamper; the server keeps the last sequences per client id. */
  readonly clientId: string;
  /** The stamp for the next stage command; the sequence starts at 1 and rises by one. */
  next(): VjCommandStamp;
}

const mintClientId = (): string => createVjUuid();

/** Stamps every stage command a remote sends with one client id and a rising sequence (contract 6.5). */
export function createVjCommandStamper(
  newId: () => string = mintClientId,
): VjCommandStamper {
  const clientId = newId();
  let commandSequence = 0;
  return {
    clientId,
    next(): VjCommandStamp {
      commandSequence += 1;
      return { clientId, commandSequence };
    },
  };
}

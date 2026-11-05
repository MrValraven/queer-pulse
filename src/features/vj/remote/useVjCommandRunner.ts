import { useCallback, useRef, useState } from "react";
import type {
  VjCommandOutcome,
  VjStageCommands,
  VjStageController,
} from "../live/useVjStage";

export type VjCommandName = keyof VjStageCommands;

type VjCommandArgs<Name extends VjCommandName> = Parameters<
  VjStageCommands[Name]
>;

/** Calls one stage command with its own arguments, typed per name. */
function callVjCommand<Name extends VjCommandName>(
  commands: VjStageCommands,
  name: Name,
  args: VjCommandArgs<Name>,
): Promise<VjCommandOutcome> {
  const command = commands[name] as (
    ...commandArgs: VjCommandArgs<Name>
  ) => Promise<VjCommandOutcome>;
  return command(...args);
}

/**
 * Sends the remote's stage commands and keeps, per command name, how many
 * are waiting for their ack, so the control that sent one can hold itself
 * aria-disabled until the ack lands. The last failure's copy key stays until
 * the next success; the three stale codes carry no key and change nothing
 * (the state their ack carries is already applied).
 */
export function useVjCommandRunner(stage: VjStageController): {
  run: <Name extends VjCommandName>(
    name: Name,
    ...args: VjCommandArgs<Name>
  ) => Promise<VjCommandOutcome>;
  isPending: (name: VjCommandName) => boolean;
  lastErrorKey: string | null;
} {
  const { commands } = stage;
  const pendingCountsRef = useRef(new Map<VjCommandName, number>());
  const [pendingNames, setPendingNames] = useState<ReadonlySet<VjCommandName>>(
    () => new Set(),
  );
  const [lastErrorKey, setLastErrorKey] = useState<string | null>(null);

  const publishPending = useCallback(() => {
    const pendingCounts = pendingCountsRef.current;
    setPendingNames(
      new Set(
        [...pendingCounts.entries()]
          .filter(([, count]) => count > 0)
          .map(([name]) => name),
      ),
    );
  }, []);

  const adjustPending = useCallback(
    (name: VjCommandName, change: number) => {
      const pendingCounts = pendingCountsRef.current;
      const nextCount = Math.max(0, (pendingCounts.get(name) ?? 0) + change);
      if (nextCount === 0) pendingCounts.delete(name);
      else pendingCounts.set(name, nextCount);
      publishPending();
    },
    [publishPending],
  );

  const run = useCallback(
    async <Name extends VjCommandName>(
      name: Name,
      ...args: VjCommandArgs<Name>
    ): Promise<VjCommandOutcome> => {
      adjustPending(name, 1);
      let outcome: VjCommandOutcome;
      try {
        outcome = await callVjCommand(commands, name, args);
      } finally {
        adjustPending(name, -1);
      }
      if (outcome.ok) setLastErrorKey(null);
      else if (outcome.errorKey !== null) setLastErrorKey(outcome.errorKey);
      return outcome;
    },
    [commands, adjustPending],
  );

  const isPending = useCallback(
    (name: VjCommandName) => pendingNames.has(name),
    [pendingNames],
  );

  return { run, isPending, lastErrorKey };
}

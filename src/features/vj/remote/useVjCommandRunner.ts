import { useCallback, useRef, useState } from "react";
import type {
  VjCommandOutcome,
  VjIdentifyOutcome,
  VjRenderModeOutcome,
  VjStageCommands,
  VjStageController,
} from "../live/useVjStage";
import type { VjErrorValues } from "../live/vjStageCommands";

export type VjCommandName = keyof VjStageCommands;

export type VjCommandArgs<Name extends VjCommandName> = Parameters<
  VjStageCommands[Name]
>;

/** What a command answers: identifyScreen and setRenderMode count the screens they reached; every other command acks a revision. */
export type VjCommandResult<Name extends VjCommandName> =
  Name extends "identifyScreen"
    ? VjIdentifyOutcome
    : Name extends "setRenderMode"
      ? VjRenderModeOutcome
      : VjCommandOutcome;

/** Sends one stage command; the answer is typed per command name. */
export type VjRun = <Name extends VjCommandName>(
  name: Name,
  ...args: VjCommandArgs<Name>
) => Promise<VjCommandResult<Name>>;

/**
 * The stage commands seen as one function per name. VjStageCommands must
 * match it key by key, so a command whose answer drifts from
 * VjCommandResult fails to compile where `run` hands the commands over.
 */
type VjCommandFunctions = {
  [Name in VjCommandName]: (
    ...args: VjCommandArgs<Name>
  ) => Promise<VjCommandResult<Name>>;
};

/** Calls one stage command with its own arguments, typed per name. */
function callVjCommand<Name extends VjCommandName>(
  commands: VjCommandFunctions,
  name: Name,
  args: VjCommandArgs<Name>,
): Promise<VjCommandResult<Name>> {
  const command: VjCommandFunctions[Name] = commands[name];
  return command(...args);
}

/** The last refusal's copy key and the {max} or {min} it interpolates. */
interface VjRunnerError {
  errorKey: string;
  errorValues: VjErrorValues | null;
}

/**
 * Sends the remote's stage commands and keeps, per command name, how many
 * are waiting for their ack, so the control that sent one can hold itself
 * aria-disabled until the ack lands. The last failure's copy key and its
 * values stay until the next success; the silent stale codes carry no key
 * and change nothing (the state their ack carries is already applied).
 */
export function useVjCommandRunner(stage: VjStageController): {
  run: VjRun;
  isPending: (name: VjCommandName) => boolean;
  lastErrorKey: string | null;
  /** The values `lastErrorKey` interpolates; null when it takes none. */
  lastErrorValues: VjErrorValues | null;
} {
  const { commands } = stage;
  const pendingCountsRef = useRef(new Map<VjCommandName, number>());
  const [pendingNames, setPendingNames] = useState<ReadonlySet<VjCommandName>>(
    () => new Set(),
  );
  const [lastError, setLastError] = useState<VjRunnerError | null>(null);

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

  const noteOutcome = useCallback(
    (outcome: VjCommandOutcome | VjIdentifyOutcome | VjRenderModeOutcome) => {
      if (outcome.ok) {
        setLastError(null);
        return;
      }
      if (outcome.errorKey === null) return;
      setLastError({
        errorKey: outcome.errorKey,
        errorValues: outcome.errorValues ?? null,
      });
    },
    [],
  );

  const run = useCallback<VjRun>(
    (name, ...args) => {
      adjustPending(name, 1);
      const outcomePromise = callVjCommand(commands, name, args);
      // Registered before the caller's own `then`, so the pending count and
      // the error line are current when the caller reads the outcome.
      void outcomePromise.then(
        (outcome) => {
          adjustPending(name, -1);
          noteOutcome(outcome);
        },
        () => adjustPending(name, -1),
      );
      return outcomePromise;
    },
    [commands, adjustPending, noteOutcome],
  );

  const isPending = useCallback(
    (name: VjCommandName) => pendingNames.has(name),
    [pendingNames],
  );

  return {
    run,
    isPending,
    lastErrorKey: lastError?.errorKey ?? null,
    lastErrorValues: lastError?.errorValues ?? null,
  };
}

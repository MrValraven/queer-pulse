/**
 * Help captions for the whole remote: the "?" toggle in the top row turns a
 * short caption on under each dock and top-row control (`VjHelpCaption`).
 * Off by default and remembered on this device under
 * `VJ_REMOTE_HELP_CAPTIONS_STORAGE_KEY` ("1" on, "0" off; anything else
 * reads as off). Storage that is blocked or full leaves the toggle working
 * in memory. Without a provider the value reads off and every setter does
 * nothing, so a control can read the hook freely in an isolated test.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { safeStorage } from "../../../../shared/storage/safeStorage";

/** Where this device remembers whether help captions are on. */
export const VJ_REMOTE_HELP_CAPTIONS_STORAGE_KEY = "queerpulse.vj.helpCaptions";

const STORED_ON = "1";
const STORED_OFF = "0";

export interface VjHelpCaptions {
  isOn: boolean;
  setIsOn: (isOn: boolean) => void;
  toggle: () => void;
}

export interface VjHelpCaptionsProviderProps {
  children: ReactNode;
}

function doNothing(): void {}

const HELP_CAPTIONS_OFF: VjHelpCaptions = {
  isOn: false,
  setIsOn: doNothing,
  toggle: doNothing,
};

const VjHelpCaptionsContext = createContext<VjHelpCaptions>(HELP_CAPTIONS_OFF);

/** The remembered choice; off when nothing is stored or storage is blocked. */
function readStoredIsOn(): boolean {
  try {
    return safeStorage.get(VJ_REMOTE_HELP_CAPTIONS_STORAGE_KEY) === STORED_ON;
  } catch {
    return false;
  }
}

function writeStoredIsOn(isOn: boolean): void {
  try {
    safeStorage.set(
      VJ_REMOTE_HELP_CAPTIONS_STORAGE_KEY,
      isOn ? STORED_ON : STORED_OFF,
    );
  } catch {
    // Storage blocked or full: the choice holds in memory for this visit.
  }
}

export function VjHelpCaptionsProvider({
  children,
}: VjHelpCaptionsProviderProps) {
  const [isOn, setStoredIsOn] = useState(readStoredIsOn);

  const setIsOn = useCallback((nextIsOn: boolean) => {
    setStoredIsOn(nextIsOn);
    writeStoredIsOn(nextIsOn);
  }, []);

  const toggle = useCallback(() => {
    setStoredIsOn((previousIsOn) => {
      const nextIsOn = !previousIsOn;
      writeStoredIsOn(nextIsOn);
      return nextIsOn;
    });
  }, []);

  const value = useMemo(
    () => ({ isOn, setIsOn, toggle }),
    [isOn, setIsOn, toggle],
  );

  return (
    <VjHelpCaptionsContext.Provider value={value}>
      {children}
    </VjHelpCaptionsContext.Provider>
  );
}

/** Whether help captions are on, and the setters the "?" toggle uses. */
export function useVjHelpCaptions(): VjHelpCaptions {
  return useContext(VjHelpCaptionsContext);
}

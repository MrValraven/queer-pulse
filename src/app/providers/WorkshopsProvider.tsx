import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  WORKSHOPS,
  type Workshop,
} from "../../features/economy/workshops.data";
import { useDemoMode } from "./DemoModeProvider";

interface WorkshopsContextValue {
  workshops: Workshop[];
  getWorkshop: (id: string) => Workshop | undefined;
  /** Prepend a member-added workshop; it appears live in the list + detail. */
  addWorkshop: (workshop: Workshop) => void;
}

const WorkshopsContext = createContext<WorkshopsContextValue | null>(null);

export function WorkshopsProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const [added, setAdded] = useState<Workshop[]>([]);

  const addWorkshop = useCallback((workshop: Workshop) => {
    setAdded((prev) => [{ ...workshop, added: true }, ...prev]);
  }, []);

  const value = useMemo<WorkshopsContextValue>(() => {
    // Workshops have no live backend yet, so the seeded catalogue only exists
    // in demo mode ("Populate platform"). Workshops a member lists themselves
    // are real to them either way, so they survive the toggle.
    const workshops = demoMode ? [...added, ...WORKSHOPS] : added;
    return {
      workshops,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
      addWorkshop,
    };
  }, [demoMode, added, addWorkshop]);

  return (
    <WorkshopsContext.Provider value={value}>
      {children}
    </WorkshopsContext.Provider>
  );
}

export function useWorkshops() {
  const ctx = useContext(WorkshopsContext);
  if (!ctx) {
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  }
  return ctx;
}

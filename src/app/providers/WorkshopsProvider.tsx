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

interface WorkshopsContextValue {
  workshops: Workshop[];
  getWorkshop: (id: string) => Workshop | undefined;
  /** Prepend a member-added workshop; it appears live in the list + detail. */
  addWorkshop: (workshop: Workshop) => void;
}

const WorkshopsContext = createContext<WorkshopsContextValue | null>(null);

export function WorkshopsProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<Workshop[]>([]);

  const addWorkshop = useCallback((workshop: Workshop) => {
    setAdded((prev) => [{ ...workshop, added: true }, ...prev]);
  }, []);

  const value = useMemo<WorkshopsContextValue>(() => {
    const workshops = [...added, ...WORKSHOPS];
    return {
      workshops,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
      addWorkshop,
    };
  }, [added, addWorkshop]);

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

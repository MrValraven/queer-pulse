import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_WRITERS } from "../data/deskWriters.data";
import {
  getMagazineWriters,
  type MagazineWriterDto,
} from "./magazineWriters.api";

/**
 * Who the desk can put on a piece, for the commission and hand-off writer
 * pickers. Demo mode serves `DEMO_WRITERS`; live mode calls
 * `GET /magazine/admin/writers`.
 */
export function useMagazineWriters() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MagazineWriterDto[]>({
    queryKey: ["magazine-writers", demoMode],
    queryFn: async () => (demoMode ? DEMO_WRITERS : getMagazineWriters()),
  });

  return {
    writers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

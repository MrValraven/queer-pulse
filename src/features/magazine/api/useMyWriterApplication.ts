import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyWriterApplication } from "./writerApplications.api";
import type { WriterApplicationDTO } from "./writerApplications.api";

export const MY_WRITER_APPLICATION_QUERY_KEY = "magazine-my-writer-application";

export function useMyWriterApplication() {
  const { demoMode } = useDemoMode();
  const query = useQuery<WriterApplicationDTO | null>({
    queryKey: [MY_WRITER_APPLICATION_QUERY_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { DEMO_MY_WRITER_APPLICATION } =
          await import("../applyToWrite.data");
        return DEMO_MY_WRITER_APPLICATION;
      }
      return getMyWriterApplication();
    },
  });
  return {
    application: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

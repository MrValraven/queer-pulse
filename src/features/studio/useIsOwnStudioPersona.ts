import { useStudioAccess } from "./api/useStudioAccess";

/** True when the persona behind a track is one the member can upload for
 *  (creator or co-owner): "Report track" stays off their own tracks. The
 *  server does not refuse a self-report, so this is a courtesy, as on
 *  releases. */
export function useIsOwnStudioPersona(artistId: string | undefined): boolean {
  const { uploadablePersonas } = useStudioAccess();
  return (
    artistId !== undefined &&
    uploadablePersonas.some((persona) => persona.id === artistId)
  );
}

import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioDashboardShowcase } from "./StudioDashboardShowcase";
import { StudioYourNumbers } from "./StudioYourNumbers";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";

/** /studio/dashboard. Live: "Your numbers" for one of the member's musician
 *  or DJ personas (`?persona=`, the first by default). The demo keeps its
 *  charts and money cards above the same block. */
export function StudioDashboardPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  useStudioDocumentTitle(t("studio:numbers.eyebrow"));
  const { uploadablePersonas } = useStudioAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const personaParam = searchParams.get("persona");
  const persona =
    uploadablePersonas.find((candidate) => candidate.id === personaParam) ??
    uploadablePersonas[0] ??
    null;
  return (
    <StudioCreatorShell persona={persona}>
      {isShowcase && <StudioDashboardShowcase />}
      <StudioYourNumbers
        personas={uploadablePersonas}
        persona={persona}
        isPageTitle={!isShowcase}
        onPersonaChange={(subprofileId) =>
          setSearchParams({ persona: subprofileId }, { replace: true })
        }
      />
    </StudioCreatorShell>
  );
}

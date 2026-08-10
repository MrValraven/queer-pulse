import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMagazineEditors } from "./pieces.api";
import { DEMO_EDITORS, type Editor } from "../data/desk.data";

/** The view's `Editor.tint` doesn't exist on the backend yet, so live rows
 *  cycle through the same three tints the demo editors use. */
const EDITOR_TINT_CYCLE: Editor["tint"][] = ["coral", "jade", "violet"];

/** The view's `Editor.cap` (workload cap) isn't modeled on the backend yet;
 *  every live editor gets the same default the demo editors use. */
const DEFAULT_EDITOR_CAP = 7;

/**
 * The magazine's editor directory — who can appear in the desk header's
 * "Viewing as" picker and the sidebar's editor-load rows. Demo mode uses
 * the static `DEMO_EDITORS`; live mode calls `GET /magazine/admin/editors`
 * (every user holding the `magazine_editor` staff role, plus admins) and
 * adapts the DTO to the view's `Editor` shape.
 */
export function useMagazineEditors() {
  const { demoMode } = useDemoMode();
  const query = useQuery<Editor[]>({
    queryKey: ["magazine-editors", demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_EDITORS;

      const editorDtos = await getMagazineEditors();
      return editorDtos.map((editorDto, index) => ({
        id: editorDto.id,
        name: editorDto.name,
        initials: editorDto.initials,
        tint: EDITOR_TINT_CYCLE[index % EDITOR_TINT_CYCLE.length] ?? "coral",
        cap: DEFAULT_EDITOR_CAP,
      }));
    },
  });

  return { editors: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}

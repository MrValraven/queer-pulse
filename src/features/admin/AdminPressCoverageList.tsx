import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPressKitList, type PressRowVM } from "./AdminPressKitList";
import {
  buildCoverageInput,
  pressValueFromCoverage,
} from "./adminPressKitFields.utils";
import {
  useAdminPressCoverage,
  useCreatePressCoverage,
  useDeletePressCoverage,
  useReorderPressCoverage,
  useUpdatePressCoverage,
} from "./api/useAdminPressKit";
import type { AdminPressCoverageDTO } from "./api/pressKit.api";

/** Maps a coverage DTO to the presentational row VM — heading is the headline,
 *  sub line is the outlet and date. */
function coverageToRowVM(coverage: AdminPressCoverageDTO): PressRowVM {
  return {
    id: coverage.id,
    active: coverage.active,
    title: coverage.title,
    sub: [coverage.source, coverage.publishedOn].filter(Boolean).join(" · "),
    avatarUrl: null,
    seed: pressValueFromCoverage(coverage),
  };
}

/** The "Coverage" tab: wires the coverage hooks into the shared
 *  `AdminPressKitList`, handling create/edit/reorder/toggle/delete + toasts. */
export function AdminPressCoverageList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { coverage, isLoading } = useAdminPressCoverage();
  const createCoverage = useCreatePressCoverage();
  const updateCoverage = useUpdatePressCoverage();
  const deleteCoverage = useDeletePressCoverage();
  const reorderCoverage = useReorderPressCoverage();

  return (
    <AdminPressKitList
      kind="coverage"
      rows={coverage.map(coverageToRowVM)}
      isLoading={isLoading}
      creating={createCoverage.isPending}
      deleting={deleteCoverage.isPending}
      onCreate={(value, done) =>
        createCoverage.mutate(buildCoverageInput(value), {
          onSuccess: () => {
            showToast(t("admin:pressKit.add.coverage.toast"));
            done();
          },
          onError: () => showToast(t("admin:pressKit.add.coverage.error")),
        })
      }
      onSaveEdit={(id, value, done) =>
        updateCoverage.mutate(
          { id, patch: buildCoverageInput(value) },
          {
            onSuccess: () => {
              showToast(t("admin:pressKit.editor.savedToast"));
              done();
            },
            onError: () => showToast(t("admin:pressKit.editor.saveError")),
          },
        )
      }
      onToggleActive={(row) =>
        updateCoverage.mutate(
          { id: row.id, patch: { active: !row.active } },
          {
            onError: () =>
              showToast(t("admin:pressKit.list.activeToggleError")),
          },
        )
      }
      onReorder={(orderedIds) =>
        reorderCoverage.mutate(
          { orderedIds },
          { onError: () => showToast(t("admin:pressKit.list.reorderError")) },
        )
      }
      onDelete={(id) =>
        deleteCoverage.mutate(
          { id },
          {
            onSuccess: () => showToast(t("admin:pressKit.remove.toast")),
            onError: () => showToast(t("admin:pressKit.remove.error")),
          },
        )
      }
    />
  );
}

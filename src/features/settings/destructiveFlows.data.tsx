import { FiPower, FiTrash2 } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import type { DestructiveActionContent } from "./DestructiveActionFlow";

/**
 * Confirm/loading/result copy for the destructive account flows. Pattern B —
 * the rich `<em>`/`<strong>` runs mean this must be a function of `t`
 * (memoized by callers via `useMemo(() => buildDestructiveFlow(t), [t])`),
 * not a static export.
 */
export function buildDestructiveFlow(
  t: TFunction,
): Record<"deactivate" | "delete", DestructiveActionContent> {
  return {
    deactivate: {
      tone: "plum",
      icon: <FiPower />,
      eyebrow: t("settings:destructiveFlow.deactivate.eyebrow"),
      title: (
        <Translation
          i18nKey="settings:destructiveFlow.deactivate.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:destructiveFlow.deactivate.body"
          components={{ strong: <b /> }}
        />
      ),
      confirmLabel: t("settings:destructiveFlow.deactivate.confirmLabel"),
      loadingText: t("settings:destructiveFlow.deactivate.loadingText"),
      resultTitle: (
        <Translation
          i18nKey="settings:destructiveFlow.deactivate.resultTitle"
          components={{ em: <em /> }}
        />
      ),
      resultBody: (
        <Translation i18nKey="settings:destructiveFlow.deactivate.resultBody" />
      ),
    },
    delete: {
      tone: "accent",
      icon: <FiTrash2 />,
      eyebrow: t("settings:destructiveFlow.delete.eyebrow"),
      title: (
        <Translation
          i18nKey="settings:destructiveFlow.delete.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:destructiveFlow.delete.body"
          components={{ strong: <b /> }}
        />
      ),
      confirmLabel: t("settings:destructiveFlow.delete.confirmLabel"),
      loadingText: t("settings:destructiveFlow.delete.loadingText"),
      resultTitle: (
        <Translation
          i18nKey="settings:destructiveFlow.delete.resultTitle"
          components={{ em: <em /> }}
        />
      ),
      resultBody: (
        <Translation
          i18nKey="settings:destructiveFlow.delete.resultBody"
          components={{ strong: <b /> }}
        />
      ),
    },
  };
}

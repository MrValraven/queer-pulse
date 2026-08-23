import type { TFunction } from "../../shared/i18n/types";
import type { ModConfirmTarget } from "./useModToolsActions";

/** Title, body, confirm label and tone for one pending mod-tools confirmation. */
export interface ModConfirmCopy {
  title: string;
  body: string;
  cta: string;
  tone: "default" | "destructive";
}

/**
 * The copy for each confirmable mod action, kept out of `ModToolsTab` so the
 * tab stays layout. Granting co-owner is the one non-destructive entry: it
 * hands over powers rather than taking something away, so it reads in the
 * default tone while still being confirmed.
 */
export function modConfirmCopy(
  confirming: ModConfirmTarget,
  t: TFunction,
): ModConfirmCopy {
  if (confirming.kind === "removeMember") {
    return {
      title: t("communities:detail.modtools.confirm.removeMember.title", {
        name: confirming.name,
      }),
      body: t("communities:detail.modtools.confirm.removeMember.body"),
      cta: t("communities:detail.modtools.confirm.removeMember.confirmCta"),
      tone: "destructive",
    };
  }
  if (confirming.kind === "grantCoOwner") {
    return {
      title: t("communities:detail.modtools.confirm.grantCoOwner.title", {
        name: confirming.name,
      }),
      body: t("communities:detail.modtools.confirm.grantCoOwner.body"),
      cta: t("communities:detail.modtools.confirm.grantCoOwner.confirmCta"),
      tone: "default",
    };
  }
  if (confirming.kind === "revokeCoOwner") {
    return {
      title: t("communities:detail.modtools.confirm.revokeCoOwner.title", {
        name: confirming.name,
      }),
      body: t("communities:detail.modtools.confirm.revokeCoOwner.body"),
      cta: t("communities:detail.modtools.confirm.revokeCoOwner.confirmCta"),
      tone: "destructive",
    };
  }
  return {
    title: t("communities:detail.modtools.confirm.removePost.title"),
    body: t("communities:detail.modtools.confirm.removePost.body"),
    cta: t("communities:detail.modtools.confirm.removePost.confirmCta"),
    tone: "destructive",
  };
}

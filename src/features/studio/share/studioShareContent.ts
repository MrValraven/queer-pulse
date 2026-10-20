import type { ShareContent } from "../../messages/share/shareMenu.types";
import type { TFunction } from "../../../shared/i18n/types";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";

/** What a Studio `ShareMenu` passes on. The message body a share sends is the
 *  note plus the URL (`buildShareBody`); `text` feeds only Copy message and
 *  the device share sheet, so a send stores no title in a QueerPulse
 *  message. `path` is what Plan 3's "Share to a community" parses. */
export function studioShareContent(
  target: StudioLinkTarget,
  title: string,
): ShareContent {
  return { path: studioLinkPath(target), title, kind: "studio", text: title };
}

/** The picker's one line when the member owns the persona behind the thing
 *  (spec ruling: "Sending this from your account shows them you run X"). */
export function studioIdentityNote(
  t: TFunction,
  ownPersonaName: string | null,
): string | undefined {
  return ownPersonaName
    ? t("messages:share.identityNote", { persona: ownPersonaName })
    : undefined;
}

import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for a failed saved-list write (queerpulse-backend
 * `saved/saved-lists.service.ts` and `saved-lists.controller.ts`). The backend
 * sends these as plain status plus English sentence, with no machine `code`,
 * so each action maps the statuses it can really receive.
 */
export type SavedListAction =
  "create" | "rename" | "delete" | "share" | "revokeShare" | "file" | "unfile";

const LIST_GONE = "members:savedLists.error.listGone";
const NAME_INVALID = "members:savedLists.error.nameInvalid";

const OVERRIDES_BY_ACTION: Readonly<
  Record<SavedListAction, CauseErrorOverrides>
> = {
  // 400: blank or over-long name (`SavedListBodyDto`: 1 to 60 characters).
  // 409 (the 30-list cap or a duplicate name) is split below.
  create: { 400: NAME_INVALID },
  // 409 here can only be a duplicate name.
  rename: {
    400: NAME_INVALID,
    404: LIST_GONE,
    409: "members:savedLists.error.nameTaken",
  },
  // 400: the default list "holds everything you have saved and cannot be deleted".
  delete: {
    400: "members:savedLists.error.defaultNotDeletable",
    404: LIST_GONE,
  },
  share: { 404: LIST_GONE },
  revokeShare: { 404: LIST_GONE },
  file: { 404: LIST_GONE },
  // 400: "To take something out of this list, unsave it." (the default list).
  unfile: { 400: "members:savedLists.error.unfileDefault", 404: LIST_GONE },
};

/**
 * Creating a list answers 409 for two different causes and sends no code for
 * either, so this reads the backend's English sentence, the only thing that
 * tells them apart: "You already have a list with that name." and "You can
 * keep up to 30 lists." A reworded sentence falls through to the shared
 * conflict line. Candidate for backend codes (see the report).
 */
function createConflictKey(error: ApiError): string | null {
  const message = error.message.toLowerCase();
  if (message.includes("already have a list")) {
    return "members:savedLists.error.nameTaken";
  }
  if (message.includes("keep up to")) {
    return "members:savedLists.error.listLimit";
  }
  return null;
}

export function savedListErrorCopy(
  action: SavedListAction,
  error: unknown,
): CauseErrorCopy {
  if (
    action === "create" &&
    error instanceof ApiError &&
    error.status === 409
  ) {
    const conflictKey = createConflictKey(error);
    if (conflictKey) return { key: conflictKey };
  }
  return causeErrorKey(error, OVERRIDES_BY_ACTION[action]);
}

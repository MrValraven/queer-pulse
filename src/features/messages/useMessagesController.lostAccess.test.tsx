import { renderHook, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useLocation } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { server } from "../../test/msw/server";
import { API_V1 } from "../../test/msw/handlers";
import {
  CAFE_IDENTITY_ID,
  PROFILE_IDENTITY_ID,
  loadLiveWrapper,
  registerLiveSessionHandlers,
} from "./mailboxes/liveMailboxTestHarness";

// Live mode via MSW: the server refuses a mailbox the member no longer staffs
// (403 `IDENTITY_NOT_STAFF`). The controller falls back to the personal
// mailbox, drops `?as=`, shows the lost-access notice once, and never shows
// the inbox's generic load error for it. The starred list is refused in the
// same commit, so two hooks report the loss and the member still sees one
// notice.

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

describe("useMessagesController: lost mailbox access (live mode)", () => {
  it("falls back to the personal mailbox on IDENTITY_NOT_STAFF with one notice", async () => {
    registerLiveSessionHandlers();
    const requestedAs: (string | null)[] = [];
    const notStaffRefusal = () =>
      HttpResponse.json(
        {
          statusCode: 403,
          code: "IDENTITY_NOT_STAFF",
          message: "Not staff of this mailbox",
        },
        { status: 403 },
      );
    server.use(
      http.get(`${API_V1}/messages/starred`, ({ request }) =>
        new URL(request.url).searchParams.get("as") === CAFE_IDENTITY_ID
          ? notStaffRefusal()
          : HttpResponse.json({
              items: [],
              conversations: [],
              nextCursor: null,
              hasMore: false,
            }),
      ),
      http.get(`${API_V1}/conversations`, ({ request }) => {
        const as = new URL(request.url).searchParams.get("as");
        requestedAs.push(as);
        if (as === CAFE_IDENTITY_ID) return notStaffRefusal();
        return HttpResponse.json({
          data: [],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );
    const { wrapper } = await loadLiveWrapper(
      `/messages?as=${CAFE_IDENTITY_ID}`,
    );
    const { useMessagesController } = await import("./useMessagesController");
    const { useStarredMessages } = await import("./api/useMessagePinStar");
    const inboxErrorsSeen: boolean[] = [];
    const { result } = renderHook(
      () => {
        const controller = useMessagesController();
        useStarredMessages(true);
        inboxErrorsSeen.push(controller.inboxLoadError);
        return { controller, location: useLocation() };
      },
      { wrapper },
    );

    await waitFor(() =>
      expect(requestedAs).toEqual([CAFE_IDENTITY_ID, PROFILE_IDENTITY_ID]),
    );
    await waitFor(() => expect(result.current.controller.loading).toBe(false));
    expect(new URLSearchParams(result.current.location.search).has("as")).toBe(
      false,
    );
    expect(result.current.controller.activeMailbox.isPersonal).toBe(true);
    expect(inboxErrorsSeen).not.toContain(true);
    expect(
      await screen.findAllByText(
        /no longer answer for that mailbox|mailbox\.lostAccess/,
      ),
    ).toHaveLength(1);
  });
});

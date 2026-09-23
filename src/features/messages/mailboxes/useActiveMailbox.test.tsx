import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_IDENTITY } from "../demoIdentities.data";
import { useActiveMailbox } from "./useActiveMailbox";

function wrapperAt(url: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders initialEntries={[url]}>{children}</TestProviders>;
  };
}

function useMailboxAndUrl() {
  return { mailbox: useActiveMailbox(), location: useLocation() };
}

function searchOf(location: { search: string }) {
  return new URLSearchParams(location.search);
}

describe("useActiveMailbox (demo mode)", () => {
  it("reads ?as= and scopes to that mailbox", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt(`/messages?as=${DEMO_IDENTITY.cafeLisboa}`),
    });
    await waitFor(() =>
      expect(result.current.mailbox.active?.identityId).toBe(
        DEMO_IDENTITY.cafeLisboa,
      ),
    );
    expect(result.current.mailbox.isPersonal).toBe(false);
    expect(result.current.mailbox.scope?.identityId).toBe(
      DEMO_IDENTITY.cafeLisboa,
    );
  });

  it("scopes the personal mailbox to the member's own profile identity", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt("/messages"),
    });
    await waitFor(() =>
      expect(result.current.mailbox.scope?.identityId).toBe(
        DEMO_IDENTITY.viewerProfile,
      ),
    );
    expect(result.current.mailbox.scope?.isPersonal).toBe(true);
  });

  it("writes ?as= on switch, keeps other params, and clears the open thread", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt("/messages?c=demo-anika&tab=unread&filter=keep"),
    });
    await waitFor(() => expect(result.current.mailbox.active).not.toBeNull());
    act(() => result.current.mailbox.selectMailbox(DEMO_IDENTITY.atelierPulso));
    const params = searchOf(result.current.location);
    expect(params.get("as")).toBe(DEMO_IDENTITY.atelierPulso);
    expect(params.get("c")).toBeNull();
    expect(params.get("filter")).toBe("keep");
  });

  it("keeps the open thread when switching for a deep link", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt("/messages?c=demo-cafe-lisboa-fatima&m=message-1"),
    });
    await waitFor(() => expect(result.current.mailbox.active).not.toBeNull());
    act(() =>
      result.current.mailbox.switchMailboxKeepingThread(
        DEMO_IDENTITY.cafeLisboa,
      ),
    );
    const params = searchOf(result.current.location);
    expect(params.get("as")).toBe(DEMO_IDENTITY.cafeLisboa);
    expect(params.get("c")).toBe("demo-cafe-lisboa-fatima");
    expect(params.get("m")).toBe("message-1");
  });

  it("drops ?as= when switching back to the personal mailbox", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt(`/messages?as=${DEMO_IDENTITY.cafeLisboa}`),
    });
    await waitFor(() => expect(result.current.mailbox.active).not.toBeNull());
    act(() =>
      result.current.mailbox.selectMailbox(DEMO_IDENTITY.viewerProfile),
    );
    expect(searchOf(result.current.location).has("as")).toBe(false);
  });

  it("falls back to the personal mailbox for a mailbox the member no longer has", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt("/messages?as=demo-identity-gone"),
    });
    await waitFor(() => expect(result.current.mailbox.isPersonal).toBe(true));
    await waitFor(() =>
      expect(searchOf(result.current.location).has("as")).toBe(false),
    );
  });

  it("falls back when the server refuses the mailbox", async () => {
    const { result } = renderHook(useMailboxAndUrl, {
      wrapper: wrapperAt(`/messages?as=${DEMO_IDENTITY.cafeLisboa}`),
    });
    await waitFor(() => expect(result.current.mailbox.active).not.toBeNull());
    act(() => result.current.mailbox.reportLostAccess());
    await waitFor(() =>
      expect(searchOf(result.current.location).has("as")).toBe(false),
    );
  });
});

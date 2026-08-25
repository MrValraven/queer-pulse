import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { BotEdits } from "./useUpdateBot";

const base: BotEdits = {
  userId: "u-house",
  originalUsername: "queerpulse",
  username: "queerpulse",
  profile: { firstName: "QueerPulse", tagline: "hi" },
  socials: [{ platform: "Instagram", urlOrHandle: "@queerpulse" }],
};

async function load(demo: boolean) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", demo ? "" : "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", demo ? "1" : "");

  const updateBotProfile = vi.fn().mockResolvedValue({});
  const updateBotUsername = vi.fn().mockResolvedValue({});
  const replaceBotSocials = vi.fn().mockResolvedValue({});
  vi.doMock("./adminBots.api", async () => ({
    ...(await vi.importActual("./adminBots.api")),
    updateBotProfile,
    updateBotUsername,
    replaceBotSocials,
  }));

  const { useUpdateBot } = await import("./useUpdateBot");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return {
    useUpdateBot,
    wrapper,
    updateBotProfile,
    updateBotUsername,
    replaceBotSocials,
  };
}

beforeEach(() => window.localStorage.clear());

describe("useUpdateBot (live)", () => {
  it("PATCHes profile and PUTs socials, skipping username when unchanged", async () => {
    const harness = await load(false);
    const { result } = renderHook(() => harness.useUpdateBot(), {
      wrapper: harness.wrapper,
    });
    result.current.mutate(base);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(harness.updateBotProfile).toHaveBeenCalledTimes(1);
    expect(harness.updateBotProfile).toHaveBeenCalledWith(
      "u-house",
      base.profile,
    );
    expect(harness.replaceBotSocials).toHaveBeenCalledTimes(1);
    expect(harness.replaceBotSocials).toHaveBeenCalledWith(
      "u-house",
      base.socials,
    );
    expect(harness.updateBotUsername).not.toHaveBeenCalled();
  });

  it("PUTs the username only when the handle changed", async () => {
    const harness = await load(false);
    const { result } = renderHook(() => harness.useUpdateBot(), {
      wrapper: harness.wrapper,
    });
    result.current.mutate({ ...base, username: "queer-pulse" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(harness.updateBotUsername).toHaveBeenCalledWith(
      "u-house",
      "queer-pulse",
    );
  });
});

describe("useUpdateBot (demo)", () => {
  it("is a no-op that never touches the api", async () => {
    const harness = await load(true);
    const { result } = renderHook(() => harness.useUpdateBot(), {
      wrapper: harness.wrapper,
    });
    result.current.mutate({ ...base, username: "changed" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(harness.updateBotProfile).not.toHaveBeenCalled();
    expect(harness.updateBotUsername).not.toHaveBeenCalled();
    expect(harness.replaceBotSocials).not.toHaveBeenCalled();
  });
});

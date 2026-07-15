import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ProfileProvider, useProfile } from "./ProfileProvider";
import { currentUser } from "../../features/members/data/members";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestProviders>
      <ProfileProvider>{children}</ProfileProvider>
    </TestProviders>
  );
}

describe("ProfileProvider skills draft", () => {
  it("seeds draft.skills from the logged-in member", () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    expect(result.current.draft.skills.map((s) => s.name)).toEqual(
      currentUser.skills.map((s) => s.name),
    );
  });

  it("updateDraft replaces skills and save() commits them", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    act(() => result.current.startEditing());
    act(() =>
      result.current.updateDraft({
        skills: [{ name: "Bike repair", meta: "" }],
      }),
    );
    await act(async () => {
      result.current.save();
    });
    expect(result.current.profile.skills).toEqual([
      { name: "Bike repair", meta: "" },
    ]);
  });
});

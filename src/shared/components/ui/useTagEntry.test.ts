import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTagEntry } from "./useTagEntry";

const PARISHES = ["Belém", "São Vicente", "Alcântara", "Nações", "Alvalade"];

function typeInto(shouldFoldAccents: boolean | undefined, text: string) {
  const { result } = renderHook(() =>
    useTagEntry({
      tags: [],
      options: PARISHES,
      onAdd: () => {},
      shouldFoldAccents,
    }),
  );
  act(() => result.current.onChange(text));
  return result.current.matches;
}

describe("useTagEntry accent folding", () => {
  it("finds accented options from unaccented text when the flag is on", () => {
    expect(typeInto(true, "Belem")).toEqual(["Belém"]);
    expect(typeInto(true, "sao vicente")).toEqual(["São Vicente"]);
    expect(typeInto(true, "Alcantara")).toEqual(["Alcântara"]);
    expect(typeInto(true, "Nacoes")).toEqual(["Nações"]);
  });

  it("finds options from accented text when the flag is on", () => {
    expect(typeInto(true, "Belém")).toEqual(["Belém"]);
  });

  it("keeps accent-sensitive matching when the flag is off or left out", () => {
    expect(typeInto(false, "Belem")).toEqual([]);
    expect(typeInto(undefined, "Nacoes")).toEqual([]);
    expect(typeInto(undefined, "belém")).toEqual(["Belém"]);
  });
});

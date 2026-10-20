import { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, useNavigate } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
  quizshowPlayPath,
  quizshowRemotePath,
  quizshowScreenPath,
} from "./quizshowPaths";
import { quizshowRoutes } from "./routes";

const mountCounter = vi.hoisted(() => ({ count: 0 }));

/** Each page stands in as a probe that prints its route param and which mount it is. */
vi.mock("./screen/QuizshowScreenPage", async () => {
  const { createElement, useState } = await import("react");
  const { useParams } = await import("react-router-dom");
  function QuizshowScreenPage() {
    const { slug } = useParams();
    const [mountNumber] = useState(() => {
      mountCounter.count += 1;
      return mountCounter.count;
    });
    return createElement("p", null, `screen ${slug} mount ${mountNumber}`);
  }
  return { QuizshowScreenPage };
});
vi.mock("./remote/QuizshowRemotePage", async () => {
  const { createElement, useState } = await import("react");
  const { useParams } = await import("react-router-dom");
  function QuizshowRemotePage() {
    const { slug } = useParams();
    const [mountNumber] = useState(() => {
      mountCounter.count += 1;
      return mountCounter.count;
    });
    return createElement("p", null, `remote ${slug} mount ${mountNumber}`);
  }
  return { QuizshowRemotePage };
});
vi.mock("./player/QuizshowPlayPage", async () => {
  const { createElement, useState } = await import("react");
  const { useParams } = await import("react-router-dom");
  function QuizshowPlayPage() {
    const { code } = useParams();
    const [mountNumber] = useState(() => {
      mountCounter.count += 1;
      return mountCounter.count;
    });
    return createElement(
      "p",
      null,
      `play ${code ?? "no code"} mount ${mountNumber}`,
    );
  }
  return { QuizshowPlayPage };
});

function renderRoutes(startPath: string) {
  const navigateHolder: { navigate: NavigateFunction | null } = {
    navigate: null,
  };
  function NavigateCapture() {
    navigateHolder.navigate = useNavigate();
    return null;
  }
  mountCounter.count = 0;
  render(
    <MemoryRouter initialEntries={[startPath]}>
      <NavigateCapture />
      <Suspense fallback={null}>
        <Routes>{quizshowRoutes()}</Routes>
      </Suspense>
    </MemoryRouter>,
  );
  return (path: string) => {
    act(() => {
      void navigateHolder.navigate?.(path);
    });
  };
}

describe("quizshowRoutes", () => {
  it("remounts the presenter screen when the event changes", async () => {
    const goTo = renderRoutes(quizshowScreenPath("pride-brunch"));
    expect(
      await screen.findByText("screen pride-brunch mount 1"),
    ).toBeInTheDocument();

    goTo(quizshowScreenPath("quiz-night"));

    expect(
      await screen.findByText("screen quiz-night mount 2"),
    ).toBeInTheDocument();
  });

  it("remounts the remote when the event changes", async () => {
    const goTo = renderRoutes(quizshowRemotePath("pride-brunch"));
    expect(
      await screen.findByText("remote pride-brunch mount 1"),
    ).toBeInTheDocument();

    goTo(quizshowRemotePath("quiz-night"));

    expect(
      await screen.findByText("remote quiz-night mount 2"),
    ).toBeInTheDocument();
  });

  it("serves the code form and each join code from one lazy page, remounted per code", async () => {
    const goTo = renderRoutes(quizshowPlayPath());
    expect(await screen.findByText("play no code mount 1")).toBeInTheDocument();

    goTo(quizshowPlayPath("QZ7KP4"));
    expect(await screen.findByText("play QZ7KP4 mount 2")).toBeInTheDocument();

    goTo(quizshowPlayPath("AB2CD3"));
    expect(await screen.findByText("play AB2CD3 mount 3")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useForumUrlParams } from "./useForumUrlParams";

function ParamsProbe() {
  const params = useForumUrlParams();
  return (
    <div>
      <output data-testid="state">
        {JSON.stringify({
          cat: params.cat,
          view: params.fundingView,
          eligibility: params.eligibility,
          scope: params.scope,
        })}
      </output>
      <button type="button" onClick={() => params.setFundingView("asks")}>
        asks
      </button>
      <button
        type="button"
        onClick={() => params.toggleEligibility("students")}
      >
        students
      </button>
      <button type="button" onClick={() => params.setCat("housing")}>
        housing
      </button>
      <Link to="/thread/7">open thread</Link>
    </div>
  );
}

function ThreadStub() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => void navigate(-1)}>
      back
    </button>
  );
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/forum" element={<ParamsProbe />} />
        <Route path="/thread/:id" element={<ThreadStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

const readState = () =>
  JSON.parse(screen.getByTestId("state").textContent ?? "{}") as Record<
    string,
    unknown
  >;
const FILTERED =
  "/forum?category=funding&fundingView=open&eligibility=students&eligibility=collectives&scope=eu";

describe("useForumUrlParams funding filters", () => {
  it("reads the view, every eligibility value and the scope", () => {
    renderAt(FILTERED);
    expect(readState()).toEqual({
      cat: "funding",
      view: "open",
      eligibility: ["collectives", "students"],
      scope: "eu",
    });
  });

  it("falls back to defaults for values it does not know", () => {
    renderAt(
      "/forum?category=funding&fundingView=bogus&eligibility=aliens&scope=mars",
    );
    expect(readState()).toEqual({
      cat: "funding",
      view: "all",
      eligibility: [],
      scope: null,
    });
  });

  it("ignores funding params outside Funding & Grants", () => {
    renderAt("/forum?category=housing&fundingView=open&scope=eu");
    expect(readState()).toMatchObject({ view: "all", scope: null });
  });

  it("drops eligibility and scope when the view stops listing calls", () => {
    renderAt(FILTERED);
    fireEvent.click(screen.getByText("asks"));
    expect(readState()).toMatchObject({
      view: "asks",
      eligibility: [],
      scope: null,
    });
  });

  it("clears every funding param when the member changes category", () => {
    renderAt(FILTERED);
    fireEvent.click(screen.getByText("housing"));
    expect(readState()).toEqual({
      cat: "housing",
      view: "all",
      eligibility: [],
      scope: null,
    });
  });

  it("toggles one eligibility value and keeps the others", () => {
    renderAt(FILTERED);
    fireEvent.click(screen.getByText("students"));
    expect(readState()).toMatchObject({ eligibility: ["collectives"] });
  });

  it("restores every filter on Back from a thread", () => {
    renderAt(FILTERED);
    fireEvent.click(screen.getByText("open thread"));
    fireEvent.click(screen.getByText("back"));
    expect(readState()).toEqual({
      cat: "funding",
      view: "open",
      eligibility: ["collectives", "students"],
      scope: "eu",
    });
  });
});

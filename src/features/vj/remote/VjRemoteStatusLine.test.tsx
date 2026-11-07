import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { VjRemoteStatusLine } from "./VjRemoteStatusLine";

describe("VjRemoteStatusLine", () => {
  it("fills the refusal's {max} from its values", async () => {
    render(
      <TestProviders>
        <VjRemoteStatusLine
          offlineReason={null}
          errorKey="vj:error.socket.effectsTooMany"
          values={{ max: 8 }}
        />
      </TestProviders>,
    );
    await awaitCatalog("vj");
    expect(
      screen.getByText("Up to 8 effects can run at once. Turn one off first"),
    ).toBeInTheDocument();
  });

  it("the offline reason wins over a refusal and takes its own copy", async () => {
    render(
      <TestProviders>
        <VjRemoteStatusLine
          offlineReason={{ kind: "network" }}
          errorKey="vj:error.socket.effectsTooMany"
          values={{ max: 8 }}
        />
      </TestProviders>,
    );
    await awaitCatalog("vj");
    expect(
      screen.getByText("Can't reach the server. Check your connection"),
    ).toBeInTheDocument();
  });
});

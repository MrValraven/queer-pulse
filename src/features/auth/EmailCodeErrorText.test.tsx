import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { routes } from "../../app/routeMap";
import { TestProviders } from "../../test/TestProviders";
import { EmailCodeErrorText } from "./EmailCodeErrorText";

describe("EmailCodeErrorText", () => {
  it("words email_code_unavailable with its own copy and the contact link", async () => {
    render(
      <TestProviders>
        <p data-testid="error">
          <EmailCodeErrorText
            failure={{ kind: "reason", reason: "email_code_unavailable" }}
          />
        </p>
      </TestProviders>,
    );
    const link = await screen.findByRole("link", { name: "write to us" });
    expect(link).toHaveAttribute("href", routes.contact);
    expect(screen.getByTestId("error").textContent).toBe(
      "Sign-in codes are switched off right now. Use Google, or write to us if you can't.",
    );
  });
});

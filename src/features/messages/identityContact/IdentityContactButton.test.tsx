import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { IdentityContactButton } from "./IdentityContactButton";

describe("IdentityContactButton (demo)", () => {
  it("opens a composer that says the message lands in the persona's mailbox", async () => {
    render(
      <IdentityContactButton
        target={{ kind: "persona", subprofileId: "atelier-pulso" }}
        name="Atelier Pulso"
        buttonVariant="primary"
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Send a message" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Write to Atelier Pulso" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/whoever answers replies as Atelier Pulso/),
    ).toBeInTheDocument();
  });

  it("keeps the send disabled under the body minimum", async () => {
    render(
      <IdentityContactButton
        target={{ kind: "company", slug: "mercado-arco-iris" }}
        name="Mercado Arco-Íris"
        buttonVariant="ghost"
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Send a message" }),
    );
    fireEvent.change(await screen.findByLabelText("Your message"), {
      target: { value: "hi" },
    });
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });
});

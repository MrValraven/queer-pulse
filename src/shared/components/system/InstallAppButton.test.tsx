import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { DisplayModeContext } from "../../../app/providers/displayModeContext";
import type {
  InstallOutcome,
  InstallPlatform,
} from "../../hooks/useInstallPrompt";
import { InstallAppButton } from "./InstallAppButton";

const installState: {
  platform: InstallPlatform;
  canInstall: boolean;
  requestInstall: () => Promise<InstallOutcome>;
} = vi.hoisted(() => ({
  platform: "ios",
  canInstall: false,
  requestInstall: vi.fn(() => Promise.resolve<InstallOutcome>("dismissed")),
}));

vi.mock("../../hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../hooks")>();
  return {
    ...actual,
    detectPlatform: () => installState.platform,
    useInstallPrompt: () => ({
      canInstall: installState.canInstall,
      promptInstall: async () =>
        (await installState.requestInstall()) === "accepted",
      requestInstall: installState.requestInstall,
    }),
  };
});

// The modal's own content belongs to its own tests; here only its opening matters.
vi.mock("./InstallAppModal", () => ({
  InstallAppModal: () => <div data-testid="install-app-modal" />,
}));

function renderButton(
  element: ReactNode = <InstallAppButton />,
  isInstalled = false,
) {
  return render(
    <TestProviders>
      <DisplayModeContext.Provider
        value={{
          displayMode: isInstalled ? "standalone" : "browser",
          isInstalled,
        }}
      >
        <MotionProvider>{element}</MotionProvider>
      </DisplayModeContext.Provider>
    </TestProviders>,
  );
}

beforeEach(() => {
  installState.platform = "ios";
  installState.canInstall = false;
  installState.requestInstall = vi.fn(() =>
    Promise.resolve<InstallOutcome>("dismissed"),
  );
});

describe("InstallAppButton", () => {
  it("shows on an iPhone browser tab", async () => {
    renderButton();
    await awaitCatalog("shared");
    expect(
      screen.getByRole("button", { name: "Install the app" }),
    ).toBeInTheDocument();
  });

  it("stays hidden on desktop while limited to mobile devices", async () => {
    installState.platform = "desktop";
    renderButton();
    await awaitCatalog("shared");
    expect(
      screen.queryByRole("button", { name: "Install the app" }),
    ).not.toBeInTheDocument();
  });

  it("shows on desktop when the mobile limit is turned off", async () => {
    installState.platform = "desktop";
    renderButton(<InstallAppButton isMobileDeviceOnly={false} />);
    await awaitCatalog("shared");
    expect(
      screen.getByRole("button", { name: "Install the app" }),
    ).toBeInTheDocument();
  });

  it("stays hidden once the app is installed", async () => {
    renderButton(<InstallAppButton />, true);
    await awaitCatalog("shared");
    expect(
      screen.queryByRole("button", { name: "Install the app" }),
    ).not.toBeInTheDocument();
  });

  it("opens the install steps when the browser has no native prompt", async () => {
    renderButton();
    await awaitCatalog("shared");
    await userEvent.click(
      screen.getByRole("button", { name: "Install the app" }),
    );
    expect(screen.getByTestId("install-app-modal")).toBeInTheDocument();
  });

  it("opens the native prompt on Android when the browser offers one", async () => {
    installState.platform = "android";
    installState.canInstall = true;
    renderButton();
    await awaitCatalog("shared");
    await userEvent.click(
      screen.getByRole("button", { name: "Install the app" }),
    );
    expect(installState.requestInstall).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("install-app-modal")).not.toBeInTheDocument();
  });

  it("keeps the button after the native prompt is dismissed", async () => {
    installState.platform = "android";
    installState.canInstall = true;
    renderButton();
    await awaitCatalog("shared");
    await userEvent.click(
      screen.getByRole("button", { name: "Install the app" }),
    );
    expect(
      screen.getByRole("button", { name: "Install the app" }),
    ).toBeInTheDocument();
  });

  it("removes the button after the native prompt is accepted", async () => {
    installState.platform = "android";
    installState.canInstall = true;
    installState.requestInstall = vi.fn(() =>
      Promise.resolve<InstallOutcome>("accepted"),
    );
    renderButton();
    await awaitCatalog("shared");
    await userEvent.click(
      screen.getByRole("button", { name: "Install the app" }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Install the app" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("opens the install steps when the native prompt fails to open", async () => {
    installState.platform = "android";
    installState.canInstall = true;
    installState.requestInstall = vi.fn(() =>
      Promise.resolve<InstallOutcome>("failed"),
    );
    renderButton();
    await awaitCatalog("shared");
    await userEvent.click(
      screen.getByRole("button", { name: "Install the app" }),
    );
    expect(installState.requestInstall).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId("install-app-modal")).toBeInTheDocument();
  });
});

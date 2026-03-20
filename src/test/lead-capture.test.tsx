import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import { persistReferralCode } from "@/lib/referral";

const upsertLeadMock = vi.fn();
const trackClickAndGetRedirectMock = vi.fn();
const assignMock = vi.fn();

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/lib/api", () => ({
  upsertLead: (...args: unknown[]) => upsertLeadMock(...args),
  trackClickAndGetRedirect: (...args: unknown[]) => trackClickAndGetRedirectMock(...args),
}));

describe("LeadCaptureSection", () => {
  beforeEach(() => {
    upsertLeadMock.mockReset();
    trackClickAndGetRedirectMock.mockReset();
    assignMock.mockReset();
    upsertLeadMock.mockResolvedValue({ ok: true, mode: "created", lead_id: "lead-1" });

    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie = "omega_referral_code=; path=/; max-age=0";
    document.cookie = "omega_session_id=; path=/; max-age=0";

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        assign: assignMock,
      },
    });
  });

  it("submits the consultation form, tracks the referral and redirects while loading", async () => {
    let resolveRedirect!: (value: { ok: true; destination_url: string }) => void;
    const redirectPromise = new Promise<{ ok: true; destination_url: string }>((resolve) => {
      resolveRedirect = resolve;
    });

    trackClickAndGetRedirectMock.mockReturnValueOnce(redirectPromise);

    render(
      <MemoryRouter initialEntries={["/sv?ref=ELIN2026"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "0701234567" } });
    fireEvent.click(screen.getByRole("button", { name: "Boka konsultation" }));

    expect(await screen.findByRole("button", { name: "Skickar..." })).toBeDisabled();

    resolveRedirect({ ok: true, destination_url: "https://consult.example/elin" });

    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith({
        full_name: "Anna Holm",
        email: "anna@example.com",
        phone: "0701234567",
        ref: "ELIN2026",
        session_id: expect.any(String),
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: "/sv",
        details: {
          intent: "consultation",
          landingPage: "/sv",
        },
      }),
    );

    await waitFor(() =>
      expect(trackClickAndGetRedirectMock).toHaveBeenCalledWith({
        ref: "ELIN2026",
        type: "consultation",
        session_id: expect.any(String),
      }),
    );
    await waitFor(() => expect(assignMock).toHaveBeenCalledWith("https://consult.example/elin"));
  });

  it("reuses a stored referral code when the URL does not contain one", async () => {
    persistReferralCode("ELIN2026", "/sv");
    trackClickAndGetRedirectMock.mockResolvedValue({
      ok: true,
      destination_url: "https://consult.example/elin",
    });

    render(
      <MemoryRouter initialEntries={["/sv"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Boka konsultation" }));

    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: "ELIN2026",
          lead_type: "customer",
          lead_source: "customer_form",
        }),
      ),
    );

    await waitFor(() =>
      expect(trackClickAndGetRedirectMock).toHaveBeenCalledWith({
        ref: "ELIN2026",
        type: "consultation",
        session_id: expect.any(String),
      }),
    );
  });

  it("shows a clear error when no referral can be routed", async () => {
    render(
      <MemoryRouter initialEntries={["/sv"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Boka konsultation" }));

    expect(await screen.findByText("Bokningen kan bara fortsatta via en giltig referral-lank.")).toBeInTheDocument();
  });

  it("shows the edge error message when routing fails", async () => {
    trackClickAndGetRedirectMock.mockResolvedValue({
      ok: false,
      error: { code: "partner_not_verified", message: "This partner is not verified for routing." },
    });

    render(
      <MemoryRouter initialEntries={["/sv?ref=ELIN2026"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Boka konsultation" }));

    expect(await screen.findByText("This partner is not verified for routing.")).toBeInTheDocument();
  });
});

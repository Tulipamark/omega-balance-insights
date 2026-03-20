import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LeadCaptureSection from "@/components/LeadCaptureSection";

const upsertLeadMock = vi.fn();
const getReferralAttributionMock = vi.fn();
const getOrCreateSessionIdMock = vi.fn();

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/lib/api", () => ({
  upsertLead: (...args: unknown[]) => upsertLeadMock(...args),
}));

vi.mock("@/lib/referral", () => ({
  getReferralAttribution: (...args: unknown[]) => getReferralAttributionMock(...args),
  getOrCreateSessionId: (...args: unknown[]) => getOrCreateSessionIdMock(...args),
}));

describe("LeadCaptureSection", () => {
  beforeEach(() => {
    upsertLeadMock.mockReset();
    getReferralAttributionMock.mockReset();
    getOrCreateSessionIdMock.mockReset();
  });

  it("submits a customer lead with referral attribution and order intent", async () => {
    getReferralAttributionMock.mockResolvedValue({
      referralCode: "ELIN2026",
      referredByUserId: "user-elin",
      landingPage: "/sv",
    });
    getOrCreateSessionIdMock.mockReturnValue("session-123");
    upsertLeadMock.mockResolvedValue({ ok: true, mode: "created", lead_id: "lead-1" });

    render(
      <MemoryRouter initialEntries={["/sv"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "0701234567" } });
    fireEvent.click(screen.getByRole("button", { name: "Beställ testet" }));

    await waitFor(() => expect(getReferralAttributionMock).toHaveBeenCalledWith("/sv"));
    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith({
        full_name: "Anna Holm",
        email: "anna@example.com",
        phone: "0701234567",
        ref: "ELIN2026",
        session_id: "session-123",
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: "/sv",
        details: {
          intent: "order",
          landingPage: "/sv",
        },
      }),
    );

    expect(await screen.findByText("Tack!")).toBeInTheDocument();
  });

  it("shows an error message when lead submission fails", async () => {
    getReferralAttributionMock.mockResolvedValue({
      referralCode: null,
      referredByUserId: null,
      landingPage: "/sv",
    });
    getOrCreateSessionIdMock.mockReturnValue("session-456");
    upsertLeadMock.mockRejectedValue(new Error("Network down"));

    render(
      <MemoryRouter initialEntries={["/sv"]}>
        <LeadCaptureSection lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Boka konsultation" }));

    expect(await screen.findByText("Network down")).toBeInTheDocument();
  });
});

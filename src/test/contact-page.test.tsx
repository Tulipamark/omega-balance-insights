import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContactPage from "@/pages/ContactPage";

const upsertLeadMock = vi.fn();
const trackFunnelEventMock = vi.fn();

vi.mock("@/lib/api", () => ({
  upsertLead: (...args: unknown[]) => upsertLeadMock(...args),
}));

vi.mock("@/lib/funnel-events", () => ({
  logFunnelEvent: (...args: unknown[]) => trackFunnelEventMock(...args),
}));

vi.mock("@/lib/referral", () => ({
  getLeadAttributionContext: () =>
    Promise.resolve({
      sessionId: "session-456",
      referralCode: "ELIN2026",
      referredByUserId: "user-1",
      landingPage: "/sv/kontakt",
      firstTouch: {
        capturedAt: "2026-03-27T08:00:00.000Z",
        landingPage: "/sv",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
      lastTouch: {
        capturedAt: "2026-03-27T09:00:00.000Z",
        landingPage: "/sv/kontakt",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
      },
    }),
}));

vi.mock("@/components/InfoPageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ContactPage", () => {
  beforeEach(() => {
    upsertLeadMock.mockReset();
    trackFunnelEventMock.mockReset();
    upsertLeadMock.mockResolvedValue({ ok: true, mode: "created", lead_id: "lead-3" });
    trackFunnelEventMock.mockResolvedValue({ ok: true, event_id: "event-3" });
  });

  it("submits the contact form with attribution and funnel tracking", async () => {
    render(
      <MemoryRouter initialEntries={["/sv/kontakt"]}>
        <Routes>
          <Route path="/:lang/kontakt" element={<ContactPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText("Meddelande"), { target: { value: "Jag vill veta mer." } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka meddelande" }));

    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith({
        full_name: "Anna Holm",
        email: "anna@example.com",
        phone: "0701234567",
        session_id: "session-456",
        ref: "ELIN2026",
        lead_type: "customer",
        lead_source: "customer_form",
        source_page: "/kontakt",
        details: {
          intent: "contact",
          message: "Jag vill veta mer.",
          landingPage: "/sv/kontakt",
          attribution: {
            sessionId: "session-456",
            referralCode: "ELIN2026",
            referredByUserId: "user-1",
            landingPage: "/sv/kontakt",
            firstTouch: {
              capturedAt: "2026-03-27T08:00:00.000Z",
              landingPage: "/sv",
              utmSource: "instagram",
              utmMedium: "social",
              utmCampaign: "spring",
            },
            lastTouch: {
              capturedAt: "2026-03-27T09:00:00.000Z",
              landingPage: "/sv/kontakt",
              utmSource: null,
              utmMedium: null,
              utmCampaign: null,
            },
          },
        },
      }),
    );

    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "lead_form_started",
      expect.objectContaining({
        pathname: "/sv/kontakt",
        details: expect.objectContaining({
          formType: "contact",
        }),
      }),
    );
    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "lead_form_submitted",
      expect.objectContaining({
        pathname: "/sv/kontakt",
        referralCode: "ELIN2026",
        sessionId: "session-456",
        details: expect.objectContaining({
          formType: "contact",
        }),
      }),
    );
    expect(await screen.findByText("Tack, ditt meddelande är skickat. Vi återkommer så snart vi kan.")).toBeInTheDocument();
  });

  it("shows a clear error and logs submit failure when save fails", async () => {
    upsertLeadMock.mockRejectedValue(new Error("Kunde inte skicka kontaktförfrågan just nu."));

    render(
      <MemoryRouter initialEntries={["/sv/kontakt"]}>
        <Routes>
          <Route path="/:lang/kontakt" element={<ContactPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Meddelande"), { target: { value: "Jag vill veta mer." } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka meddelande" }));

    expect(await screen.findByText("Kunde inte skicka kontaktförfrågan just nu.")).toBeInTheDocument();
    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "lead_form_submit_failed",
      expect.objectContaining({
        pathname: "/sv/kontakt",
        details: expect.objectContaining({
          formType: "contact",
          reason: "Kunde inte skicka kontaktförfrågan just nu.",
        }),
      }),
    );
  });
});

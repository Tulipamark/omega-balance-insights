import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PartnerPage from "@/pages/PartnerPage";

const upsertLeadMock = vi.fn();
const getLeadAttributionContextMock = vi.fn();
const trackFunnelEventMock = vi.fn();

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/lib/api", () => ({
  upsertLead: (...args: unknown[]) => upsertLeadMock(...args),
}));

vi.mock("@/lib/funnel-events", () => ({
  logFunnelEvent: (...args: unknown[]) => trackFunnelEventMock(...args),
}));

vi.mock("@/lib/referral", () => ({
  getLeadAttributionContext: (...args: unknown[]) => getLeadAttributionContextMock(...args),
}));

vi.mock("@/components/FooterSection", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  default: () => <div>LanguageSwitcher</div>,
}));

describe("PartnerPage", () => {
  beforeEach(() => {
    upsertLeadMock.mockReset();
    getLeadAttributionContextMock.mockReset();
    trackFunnelEventMock.mockReset();

    upsertLeadMock.mockResolvedValue({ ok: true, mode: "created", lead_id: "lead-2" });
    trackFunnelEventMock.mockResolvedValue({ ok: true, event_id: "event-2" });
    getLeadAttributionContextMock.mockResolvedValue({
      sessionId: "session-123",
      referralCode: "ELIN2026",
      referredByUserId: "user-1",
      landingPage: "/sv/partners",
      firstTouch: {
        capturedAt: "2026-03-26T08:00:00.000Z",
        landingPage: "/sv",
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: "spring",
      },
      lastTouch: {
        capturedAt: "2026-03-26T09:00:00.000Z",
        landingPage: "/sv/partners",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
      },
    });
  });

  it("submits the partner application with referral ownership intact", async () => {
    render(
      <MemoryRouter initialEntries={["/sv/partners"]}>
        <PartnerPage lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText(/varför är detta intressant för dig/i), { target: { value: "Jag vill bygga långsiktigt." } });
    fireEvent.click(screen.getByRole("button", { name: /skicka partnerförfrågan/i }));

    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith({
        full_name: "Anna Holm",
        email: "anna@example.com",
        phone: "0701234567",
        ref: "ELIN2026",
        session_id: "session-123",
        lead_type: "partner",
        lead_source: "partner_form",
        source_page: "/sv/partners",
        details: {
          company: "",
          interest: "",
          readiness: "",
          background: "Jag vill bygga långsiktigt.",
          landingPage: "/sv/partners",
          attribution: {
            sessionId: "session-123",
            referralCode: "ELIN2026",
            referredByUserId: "user-1",
            landingPage: "/sv/partners",
            firstTouch: {
              capturedAt: "2026-03-26T08:00:00.000Z",
              landingPage: "/sv",
              utmSource: "instagram",
              utmMedium: "social",
              utmCampaign: "spring",
            },
            lastTouch: {
              capturedAt: "2026-03-26T09:00:00.000Z",
              landingPage: "/sv/partners",
              utmSource: null,
              utmMedium: null,
              utmCampaign: null,
            },
          },
        },
      }),
    );

    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "partner_form_started",
      expect.objectContaining({
        pathname: "/sv/partners",
        search: "",
      }),
    );

    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "partner_form_submitted",
      expect.objectContaining({
        pathname: "/sv/partners",
        referralCode: "ELIN2026",
        sessionId: "session-123",
        details: expect.objectContaining({
          partnerLinked: true,
        }),
      }),
    );
  });

  it("allows a partner application even without a partner link", async () => {
    getLeadAttributionContextMock.mockResolvedValue({
      sessionId: "session-123",
      referralCode: null,
      referredByUserId: null,
      landingPage: "/sv/partners",
      firstTouch: null,
      lastTouch: null,
    });

    render(
      <MemoryRouter initialEntries={["/sv/partners"]}>
        <PartnerPage lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText(/varför är detta intressant för dig/i), { target: { value: "Jag vill bygga långsiktigt." } });
    fireEvent.click(screen.getByRole("button", { name: /skicka partnerförfrågan/i }));

    await waitFor(() =>
      expect(upsertLeadMock).toHaveBeenCalledWith(
        expect.objectContaining({
          lead_type: "partner",
          lead_source: "partner_form",
          ref: null,
        }),
      ),
    );

    expect(screen.queryByText(/partneransökan behöver skickas via en giltig partnerlänk/i)).not.toBeInTheDocument();
    expect(trackFunnelEventMock).toHaveBeenCalledWith(
      "partner_form_submitted",
      expect.objectContaining({
        details: expect.objectContaining({
          partnerLinked: false,
        }),
      }),
    );
  });

  it("ignores repeated submits while a partner application is already sending", async () => {
    let resolveLead: ((value: { ok: true; mode: string; lead_id: string }) => void) | null = null;
    upsertLeadMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLead = resolve;
        }),
    );

    render(
      <MemoryRouter initialEntries={["/sv/partners"]}>
        <PartnerPage lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText(/varför är detta intressant/i), { target: { value: "Jag vill bygga långsiktigt." } });

    const submitButton = screen.getByRole("button", { name: /skicka partnerförfrågan/i });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    fireEvent.click(submitButton);
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => expect(upsertLeadMock).toHaveBeenCalledTimes(1));
    expect(submitButton).toBeDisabled();

    resolveLead?.({ ok: true, mode: "created", lead_id: "lead-2" });

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /skicka partnerförfrågan/i })).not.toBeInTheDocument(),
    );
  });
});

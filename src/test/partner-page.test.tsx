import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PartnerPage from "@/pages/PartnerPage";

const upsertLeadMock = vi.fn();
const getReferralAttributionMock = vi.fn();

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
  getOrCreateSessionId: () => "session-123",
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
    getReferralAttributionMock.mockReset();
    upsertLeadMock.mockResolvedValue({ ok: true, mode: "created", lead_id: "lead-2" });
  });

  it("submits the partner application with referral ownership intact", async () => {
    getReferralAttributionMock.mockResolvedValue({
      referralCode: "ELIN2026",
      referredByUserId: "user-1",
      landingPage: "/sv/partners",
    });

    render(
      <MemoryRouter initialEntries={["/sv/partners"]}>
        <PartnerPage lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText("Varför är detta intressant för dig?"), { target: { value: "Jag vill bygga långsiktigt." } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka partnerförfrågan" }));

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
        },
      }),
    );
  });

  it("shows a clear error when no valid partner link is present", async () => {
    getReferralAttributionMock.mockResolvedValue({
      referralCode: null,
      referredByUserId: null,
      landingPage: "/sv/partners",
    });

    render(
      <MemoryRouter initialEntries={["/sv/partners"]}>
        <PartnerPage lang="sv" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Namn"), { target: { value: "Anna Holm" } });
    fireEvent.change(screen.getByLabelText("E-post"), { target: { value: "anna@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefonnummer"), { target: { value: "0701234567" } });
    fireEvent.change(screen.getByLabelText("Varför är detta intressant för dig?"), { target: { value: "Jag vill bygga långsiktigt." } });
    fireEvent.click(screen.getByRole("button", { name: "Skicka partnerförfrågan" }));

    expect(await screen.findByText("Partneransökan behöver skickas via en giltig partnerlänk.")).toBeInTheDocument();
    expect(upsertLeadMock).not.toHaveBeenCalled();
  });
});

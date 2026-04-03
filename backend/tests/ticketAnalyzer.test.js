import { describe, expect, it } from "vitest";
import { analyzeTicket } from "../src/services/ticketAnalyzer.js";

describe("ticketAnalyzer", () => {
  it("returns different priorities for different messages", () => {
    const a = analyzeTicket("Our invoice was incorrect and we need a refund ASAP.");
    const b = analyzeTicket("We see random crashes and timeout errors in production. Down again.");

    expect(a.category).toBe("Billing");
    expect(b.category).toBe("Technical");
    expect(a.priority).not.toBe(b.priority);
    expect(a.confidence).not.toBe(b.confidence);
  });

  it("escalates security/breach to P0 (custom rule)", () => {
    const r = analyzeTicket("Possible security breach: suspicious login attempts. Please investigate urgently.");
    expect(r.priority).toBe("P0");
    expect(r.signals.severitySignals.join(" ")).toContain("security");
  });

  it("sets urgency true when urgency keywords exist", () => {
    const r = analyzeTicket("System is down. This is urgent and needs immediate attention.");
    expect(r.urgency).toBe(true);
  });
});


import { describe, it, expect } from "vitest";
import {
  formatDuration,
  addMinutesIso,
  formatDate,
  formatDateTime,
  formatTime,
} from "./format";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("omits minutes when on the hour", () => {
    expect(formatDuration(420)).toBe("7h");
    expect(formatDuration(60)).toBe("1h");
  });

  it("omits hours when under an hour", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("addMinutesIso", () => {
  it("adds minutes and returns an ISO string", () => {
    expect(addMinutesIso("2026-07-15T08:30:00.000Z", 420)).toBe(
      "2026-07-15T15:30:00.000Z",
    );
  });

  it("rolls over across days", () => {
    expect(addMinutesIso("2026-07-15T23:30:00.000Z", 60)).toBe(
      "2026-07-16T00:30:00.000Z",
    );
  });
});

// Locale output depends on the machine timezone, so we only assert
// timezone-stable parts (calendar day / year / 24h shape).
describe("date formatters", () => {
  it("formatDate includes the month and day", () => {
    const out = formatDate("2026-07-15T12:00:00.000Z");
    expect(out).toContain("Jul");
    expect(out).toContain("15");
  });

  it("formatDateTime includes the year", () => {
    expect(formatDateTime("2026-07-15T12:00:00.000Z")).toContain("2026");
  });

  it("formatTime returns a 24-hour HH:MM string", () => {
    expect(formatTime("2026-07-15T12:00:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});

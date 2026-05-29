import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiGet, apiPost, AuthExpiredError } from "./api";

interface FakeResponseInit {
  ok: boolean;
  status?: number;
  body?: unknown;
  jsonThrows?: boolean;
}

function fakeResponse(init: FakeResponseInit): Response {
  return {
    ok: init.ok,
    status: init.status ?? (init.ok ? 200 : 400),
    json: init.jsonThrows
      ? () => Promise.reject(new Error("invalid json"))
      : () => Promise.resolve(init.body),
  } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiGet", () => {
  it("returns parsed JSON on success", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, body: { id: 1 } }));

    await expect(apiGet("/flights")).resolves.toEqual({ id: 1 });
  });

  it("sends a bearer token when provided", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, body: [] }));

    await apiGet("/bookings/me", { token: "abc" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toMatchObject({ Authorization: "Bearer abc" });
  });

  it("omits the auth header when there is no token", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, body: [] }));

    await apiGet("/flights");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("throws with the server message on error responses", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 400, body: { message: "Bad input" } }),
    );

    await expect(apiGet("/flights")).rejects.toThrow("Bad input");
  });

  it("uses the first item when the message is an array", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 400,
        body: { message: ["first error", "second error"] },
      }),
    );

    await expect(apiGet("/flights")).rejects.toThrow("first error");
  });

  it("falls back to a status message when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 500, jsonThrows: true }),
    );

    await expect(apiGet("/flights")).rejects.toThrow("Request failed (500)");
  });

  it("throws AuthExpiredError on 401 when authRequired", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401 }));

    await expect(
      apiGet("/users/me", { authRequired: true }),
    ).rejects.toBeInstanceOf(AuthExpiredError);
  });
});

describe("apiPost", () => {
  it("posts a JSON body and returns the parsed response", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: true, body: { token: "t" } }),
    );

    const result = await apiPost(
      "/auth/login",
      { email: "a@b.com", password: "secret123" },
      { token: "abc" },
    );

    expect(result).toEqual({ token: "t" });
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/auth/login");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer abc",
    });
    expect(JSON.parse(init.body)).toEqual({
      email: "a@b.com",
      password: "secret123",
    });
  });

  it("throws AuthExpiredError on 401 when authRequired", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401 }));

    await expect(
      apiPost("/bookings", {}, { authRequired: true }),
    ).rejects.toBeInstanceOf(AuthExpiredError);
  });
});

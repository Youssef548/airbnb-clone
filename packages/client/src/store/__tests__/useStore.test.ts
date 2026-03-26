import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("sets and gets current user", async () => {
    const { default: useUserStore } = await import("../../store/useStore");
    const mockUser = {
      _id: "1",
      username: "testuser",
      email: "test@test.com",
      image: "",
      role: "guest",
    };
    act(() => {
      useUserStore.getState().setUser(mockUser);
    });
    expect(useUserStore.getState().user).toEqual(mockUser);
  });

  it("persists to localStorage", async () => {
    const { default: useUserStore } = await import("../../store/useStore");
    const mockUser = {
      _id: "1",
      username: "testuser",
      email: "test@test.com",
      image: "",
      role: "guest",
    };
    act(() => {
      useUserStore.getState().setUser(mockUser);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "currentUser",
      JSON.stringify(mockUser)
    );
  });

  it("clears user on logout", async () => {
    const { default: useUserStore } = await import("../../store/useStore");
    act(() => {
      useUserStore.getState().setUser({
        _id: "1",
        username: "testuser",
        email: "test@test.com",
        image: "",
        role: "guest",
      });
    });
    act(() => {
      useUserStore.getState().clearUser();
    });
    expect(useUserStore.getState().user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("currentUser");
  });
});

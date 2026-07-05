import { beforeEach, describe, expect, it, vi } from "vitest";

// The action guards call auth(), Prisma, and the db-layer delete. Mock all three
// so the test exercises only the action's branching (session → ownership →
// delete) without a real DB — matching the project's "no real Prisma in unit
// tests" scope.
const auth = vi.fn();
const findUnique = vi.fn();
const deleteItemQuery = vi.fn();
const createItemQuery = vi.fn();

vi.mock("@/auth", () => ({ auth: () => auth() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { item: { findUnique: (args: unknown) => findUnique(args) } },
}));
vi.mock("@/lib/db/items", () => ({
  deleteItem: (id: string, ownerId: string) => deleteItemQuery(id, ownerId),
  createItem: (ownerId: string, data: unknown) =>
    createItemQuery(ownerId, data),
}));

import { createItem, deleteItem } from "./items";

beforeEach(() => {
  auth.mockReset();
  findUnique.mockReset();
  deleteItemQuery.mockReset();
  createItemQuery.mockReset();
});

describe("deleteItem action", () => {
  it("rejects when there is no session", async () => {
    auth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(findUnique).not.toHaveBeenCalled();
    expect(deleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns not-found when the item does not exist", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    findUnique.mockResolvedValue(null);

    const result = await deleteItem("missing");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(deleteItemQuery).not.toHaveBeenCalled();
  });

  it("blocks deleting an item owned by another user", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    findUnique.mockResolvedValue({ userId: "someone-else" });

    const result = await deleteItem("item-1");

    expect(result).toEqual({
      success: false,
      error: "You do not have access to this item",
    });
    expect(deleteItemQuery).not.toHaveBeenCalled();
  });

  it("deletes an item owned by the signed-in user", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    findUnique.mockResolvedValue({ userId: "user-1" });
    deleteItemQuery.mockResolvedValue(undefined);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(deleteItemQuery).toHaveBeenCalledWith("item-1", "user-1");
  });

  it("returns a generic error when the delete throws", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    findUnique.mockResolvedValue({ userId: "user-1" });
    deleteItemQuery.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deleteItem("item-1");

    expect(result).toEqual({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  });
});

describe("createItem action", () => {
  it("rejects when there is no session", async () => {
    auth.mockResolvedValue(null);

    const result = await createItem({ type: "snippet", title: "x", tags: [] });

    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("rejects invalid input without touching the db", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({ type: "snippet", title: "", tags: [] });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("requires a URL for the link type", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({ type: "link", title: "L", tags: [] });

    expect(result).toEqual({
      success: false,
      error: "URL is required for links",
    });
    expect(createItemQuery).not.toHaveBeenCalled();
  });

  it("creates an item for the signed-in user with parsed data", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    const created = { id: "item-9", title: "Hi" };
    createItemQuery.mockResolvedValue(created);

    const result = await createItem({
      type: "snippet",
      title: "  Hi  ",
      tags: [" react ", "react"],
    });

    expect(result).toEqual({ success: true, data: created });
    expect(createItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        type: "snippet",
        title: "Hi",
        tags: ["react"],
      }),
    );
  });

  it("returns a generic error when the create throws", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    createItemQuery.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createItem({ type: "note", title: "N", tags: [] });

    expect(result).toEqual({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  });
});

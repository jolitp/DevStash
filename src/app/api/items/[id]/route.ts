import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";

// GET /api/items/[id] — full detail for one item the drawer opens on click.
// Auth-required (must be signed in); unknown ids are 404. Not owner-scoped yet,
// matching the still-unscoped list selectors — see getItemDetail.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "You must be signed in" },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const item = await getItemDetail(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Fetch item detail failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

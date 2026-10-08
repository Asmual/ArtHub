import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH() {
  return NextResponse.json(
    {
      error: true,
      message: "Admin accounts cannot modify artwork stock. Only the artist who created the artwork can change its stock.",
    },
    { status: 403 }
  );
}

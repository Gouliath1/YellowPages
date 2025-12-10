import { NextRequest, NextResponse } from "next/server";
import { searchContacts } from "@/lib/search";

export const revalidate = 0;

export const GET = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const department = searchParams.get("department") ?? "";
  const location = searchParams.get("location") ?? "";
  const limitParam = searchParams.get("take") ?? searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit && parsedLimit > 0
      ? parsedLimit
      : undefined;

  const results = searchContacts({
    q,
    department: department || undefined,
    location: location || undefined,
    limit,
  });

  return NextResponse.json(results);
};

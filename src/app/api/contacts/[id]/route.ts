import { NextResponse } from "next/server";
import { getContactById } from "@/lib/search";

export const revalidate = 0;

export const GET = (
  _request: Request,
  { params }: { params: { id: string } },
) => {
  const contact = getContactById(params.id);

  if (!contact) {
    return NextResponse.json({ message: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
};

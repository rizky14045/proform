import { NextResponse, NextRequest } from "next/server";
import { demoBoards } from "../data";

export async function PUT(request: NextRequest) {
  const payloadItem = await request.json();

  const index = demoBoards.findIndex(
    (item) => String(item.id) === String(payloadItem.id)
  );

  if (index !== -1) {
    // Update the item in the array
    demoBoards[index] = payloadItem;

    return NextResponse.json(
      { message: "Item updated successfully" },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const index = demoBoards.findIndex((item) => String(item.id) === String(id));

  if (index !== -1) {
    // Remove the item from the array
    demoBoards.splice(index, 1);
    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

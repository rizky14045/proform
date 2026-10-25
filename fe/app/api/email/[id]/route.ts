import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { mails } from "../data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = mails.find((item) => item.id === parseInt(id));
    if (item) {
      return NextResponse.json({
        status: "success",
        message: "successfully got data",
        data: item,
      });
    } else {
      return NextResponse.json({
        status: "fail",
        message: "Item not found",
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = mails.findIndex((item) => item.id === parseInt(id));
  if (index !== -1) {
    // Remove the item from the array
    mails.splice(index, 1);
    return NextResponse.json({
      status: "success",
      message: "Item deleted successfully",
    });
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

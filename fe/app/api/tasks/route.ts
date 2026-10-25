import { NextResponse, NextRequest } from "next/server";
import { tasks } from "./data";
import { faker } from "@faker-js/faker";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  //const delayedResponse = await delayResponse(demoData, 2000);
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: NextRequest) {
  const newItem = await request.json();
  newItem.id = faker.string.uuid();
  tasks.push(newItem);

  return NextResponse.json(newItem, { status: 201 });
}

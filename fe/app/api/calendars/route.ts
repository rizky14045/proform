import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { calendarEvents } from "./data";
import { faker } from "@faker-js/faker";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: "success",
      message: "Event created successfully",
      data: calendarEvents,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    let reqBody = await request.json();
    reqBody.id = faker.string.uuid();
    calendarEvents.push(reqBody);

    return NextResponse.json({
      status: "success",
      message: "User created successfully",
      data: reqBody,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { message: "Paper AI uses local MongoDB auth endpoints in development." },
    { status: 404 }
  );
}

export function POST() {
  return NextResponse.json(
    { message: "Paper AI uses local MongoDB auth endpoints in development." },
    { status: 404 }
  );
}

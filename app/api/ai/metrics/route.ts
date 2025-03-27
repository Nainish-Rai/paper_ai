import { NextResponse } from "next/server";
import { AIMonitoring } from "@/lib/ai/monitoring";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get("endpoint");
    const days = url.searchParams.get("days");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint parameter is required" },
        { status: 400 }
      );
    }

    const monitoring = new AIMonitoring();
    const metrics = await monitoring.getPerformanceMetrics(
      endpoint,
      days ? parseInt(days) : 7
    );

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

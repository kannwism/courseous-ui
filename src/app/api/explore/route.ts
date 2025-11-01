import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Call the product explorer API
    const response = await fetch(
      "https://product-explorer-eegp.onrender.com/explore",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to trigger exploration" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Exploration started successfully! Your courses and documentation will be ready soon.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in explore API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

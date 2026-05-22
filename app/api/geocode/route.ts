import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const apiKey = process.env.HERE_API_KEY;

  if (!apiKey) {
    console.error("HERE_API_KEY is not configured on the server.");
    return NextResponse.json(
      { error: "Geocoding service is not configured." },
      { status: 503 }
    );
  }

  try {
    const hereUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(q)}&apiKey=${apiKey}`;
    const response = await fetch(hereUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HERE API error ${response.status}: ${errorBody}`);
      return NextResponse.json(
        { error: `Geocoding request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error while contacting geocoding service." },
      { status: 500 }
    );
  }
}

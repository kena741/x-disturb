import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");

	if (!lat || !lng) {
		return NextResponse.json(
			{ error: "Missing required query parameters: lat, lng" },
			{ status: 400 },
		);
	}

	const latitude = parseFloat(lat);
	const longitude = parseFloat(lng);

	if (isNaN(latitude) || isNaN(longitude)) {
		return NextResponse.json(
			{ error: "Invalid coordinate values. Must be numeric." },
			{ status: 400 },
		);
	}

	const apiKey = process.env.HERE_API_KEY;

	if (!apiKey) {
		console.error("HERE_API_KEY is not configured on the server.");
		return NextResponse.json(
			{ error: "Geocoding service is not configured." },
			{ status: 503 },
		);
	}

	try {
		const hereUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${apiKey}`;
		const response = await fetch(hereUrl);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`HERE API error ${response.status}: ${errorBody}`);
			return NextResponse.json(
				{ error: `Reverse geocoding request failed: ${response.statusText}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Reverse geocoding proxy error:", error);
		return NextResponse.json(
			{ error: "Internal server error while contacting geocoding service." },
			{ status: 500 },
		);
	}
}

import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { LandingPage } from "@/components/landing/landing-page";

const landingDisplay = Syne({
	subsets: ["latin"],
	variable: "--font-landing-display",
	display: "swap",
});

const landingBody = DM_Sans({
	subsets: ["latin"],
	variable: "--font-landing-body",
	display: "swap",
});

export const metadata: Metadata = {
	title: "X-Disturb — Quiet where reverence begins",
	description:
		"Silent zones around churches, mosques, and libraries. Your phone stays quiet so sacred and quiet places stay undisturbed.",
};

export default function Home() {
	return (
		<div className={`${landingDisplay.variable} ${landingBody.variable}`}>
			<LandingPage />
		</div>
	);
}

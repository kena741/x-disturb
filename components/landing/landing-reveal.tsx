"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LandingReveal({
	children,
	className,
	delayMs = 0,
}: {
	children: ReactNode;
	className?: string;
	delayMs?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const prefersReduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (prefersReduced) {
			setVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn("landing-reveal", className)}
			data-visible={visible}
			style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
		>
			{children}
		</div>
	);
}

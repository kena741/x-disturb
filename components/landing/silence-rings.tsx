import { cn } from "@/lib/utils";

export function SilenceRings({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
		>
			<div className="landing-hero-wash absolute inset-0" />

			{/* Soft map-grid hint — quiet places, not a dashboard */}
			<svg
				className="absolute inset-0 h-full w-full opacity-[0.07]"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<pattern
						id="landing-grid"
						width="48"
						height="48"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M48 0H0V48"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							className="text-foreground"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#landing-grid)" />
			</svg>

			<div className="absolute right-[-12%] top-[8%] h-[min(78vh,42rem)] w-[min(78vh,42rem)] sm:right-[2%] md:right-[8%]">
				<div className="absolute inset-[18%] rounded-full border border-primary/25 bg-primary/[0.04]" />
				<div className="absolute inset-[32%] rounded-full border border-primary/30 bg-primary/[0.06]" />
				<div className="absolute inset-[46%] rounded-full border border-primary/40 bg-primary/10" />
				<div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/0.12)]" />

				<span className="absolute inset-[8%] rounded-full border border-primary/35 animate-silence-ring" />
				<span
					className="absolute inset-[8%] rounded-full border border-primary/30 animate-silence-ring"
					style={{ animationDelay: "1.8s" }}
				/>
				<span
					className="absolute inset-[8%] rounded-full border border-primary/25 animate-silence-ring"
					style={{ animationDelay: "3.6s" }}
				/>
			</div>

			<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
		</div>
	);
}

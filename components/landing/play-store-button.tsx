import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const PLAY_STORE_URL =
	"https://play.google.com/store/apps/details?id=com.tinamart.xdisturb";

function PlayIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 14 14"
			aria-hidden
			className={className}
			fill="none"
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M.859 11.981V1.741c0-.672.79-1.098 1.434-.771L12.37 6.09c.662.336.662 1.207 0 1.543l-10.077 5.12c-.644.327-1.434-.099-1.434-.772M9.23 9.23l-8.1-8.101m8.1 3.364l-8.1 8.1"
			/>
		</svg>
	);
}

export function PlayStoreButton({
	className,
	variant = "outline",
}: {
	className?: string;
	variant?: "dark" | "outline";
}) {
	return (
		<a
			href={PLAY_STORE_URL}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				buttonVariants({ size: "lg", variant: "outline" }),
				"gap-2.5 px-6",
				variant === "dark" &&
					"border-foreground/10 bg-foreground text-background hover:bg-foreground/90 hover:text-background",
				className,
			)}
			aria-label="Get Xdisturb on Google Play"
		>
			<PlayIcon className="size-4 shrink-0" />
			<span className="flex flex-col items-start leading-none">
				<span className="text-[0.6rem] font-medium uppercase tracking-wide opacity-80">
					Get it on
				</span>
				<span className="text-sm font-semibold">Google Play</span>
			</span>
		</a>
	);
}

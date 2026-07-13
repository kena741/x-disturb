import Link from "next/link";

export default function Home() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-6">
			<div className="max-w-md text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					This dashboard will be built soon.
				</p>
				<Link href="/auth/login">Login</Link>
			</div>
		</main>
	);
}

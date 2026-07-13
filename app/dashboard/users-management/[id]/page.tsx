"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getUserStatusTone } from "@/lib/admin-status-badge";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { updateUserData } from "@/app/api/user-management-api";
import { db } from "@/firebase/config";

const UserDetailPage = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [loading, setLoading] = useState(true);
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;

	const formSchema = z.object({
		email: z.string().email(),
		username: z
			.string()
			.min(4, { message: "Username must be at least 4 characters" }),
		reason: z.string(),
		currentStatus: z.boolean(),
		role: z.enum(["admin", "user"]),
		referralCode: z.string().optional(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const isActive = form.watch("currentStatus");

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsUpdating(true);
		await updateUserData(userId, {
			email: values.email,
			username: values.username,
			currentStatus: values.currentStatus,
			reason: values.reason,
		});
		setIsUpdating(false);
	}

	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const docRef = doc(db, "users", userId);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					const data = docSnap.data();
					form.reset({
						email: data.email || "",
						username: data.username || "",
						currentStatus: data.isActive,
						role: data.role || "user",
						referralCode: data.referralCode || "",
						reason: "",
					});
				}
			} catch (err) {
				console.error("Error fetching user:", err);
			}
			setLoading(false);
		};

		fetchUser();
	}, [userId, form]);

	return (
		<AdminPageContent wide>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="max-w-2xl space-y-6"
				>
					<Card className="border-border shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0">
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<Image
										src="/profile.png"
										alt="User profile"
										width={64}
										height={64}
										className="aspect-square size-full object-cover"
									/>
									<AvatarFallback className="bg-primary/10 text-primary">
										{form.watch("username")?.slice(0, 2).toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-base font-semibold">
										{form.watch("username") || "User details"}
									</CardTitle>
									<p className="text-sm text-muted-foreground">
										{form.watch("email")}
									</p>
								</div>
							</div>
							<AdminStatusBadge
								label={isActive ? "Active" : "Inactive"}
								tone={getUserStatusTone(isActive)}
							/>
						</CardHeader>

						<CardContent className="space-y-4">
							{loading ? (
								<p className="text-sm text-muted-foreground">Loading user…</p>
							) : (
								<>
									<FormField
										control={form.control}
										name="currentStatus"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
												<FormLabel className="font-normal">
													Account status
												</FormLabel>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input placeholder="Email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Username</FormLabel>
												<FormControl>
													<Input placeholder="Username" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="reason"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reason for change</FormLabel>
												<FormControl>
													<Input placeholder="Optional note" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="role"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Role</FormLabel>
												<FormControl>
													<Input placeholder="admin or user" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="referralCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Referral code</FormLabel>
												<FormControl>
													<Input placeholder="Referral code" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}
						</CardContent>
					</Card>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/dashboard/users-management")}
						>
							Cancel
						</Button>
						<Button disabled={isUpdating || loading} type="submit">
							{isUpdating ? "Updating…" : "Save changes"}
						</Button>
					</div>
				</form>
			</Form>
		</AdminPageContent>
	);
};

export default UserDetailPage;

"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AdminTableShell,
	AdminDataTableEmpty,
	AdminLoadingRow,
} from "@/components/admin/data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getUserStatusTone } from "@/lib/admin-status-badge";

import { collection, query, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useEffect, useState } from "react";
import { useFetchUsers, type User } from "@/app/api/user-management-api";

interface ZoneRegistration {
	id: string;
	name: string;
	type: string;
	radius: number;
	center: {
		latitude: number;
		longitude: number;
	};
	isActive: boolean;
	description: string;
	adminID: string;
	createdAt?: Timestamp;
	address?: string;
}

export default function ZoneRegistrations() {
	const [zones, setZones] = useState<ZoneRegistration[]>([]);
	const [loading, setLoading] = useState(true);
	const { users } = useFetchUsers();

	useEffect(() => {
		const zonesQuery = query(collection(db, "silent_zones"));
		const unsubscribe = onSnapshot(
			zonesQuery,
			(snapshot) => {
				const zonesData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as ZoneRegistration[];
				setZones(zonesData);
				setLoading(false);
			},
			(err) => {
				console.error("Error fetching zones:", err);
				setLoading(false);
			},
		);
		return () => unsubscribe();
	}, []);

	const userMap = new Map<string, User>();
	for (const user of users) {
		userMap.set(user.id, user);
	}

	const formatDate = (timestamp?: Timestamp) => {
		if (!timestamp) return "N/A";
		const date = timestamp.toDate();
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<AdminTableShell>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="text-muted-foreground">Zone Name</TableHead>
						<TableHead className="text-muted-foreground">Type</TableHead>
						<TableHead className="text-muted-foreground">
							Registered By
						</TableHead>
						<TableHead className="text-muted-foreground">Email</TableHead>
						<TableHead className="text-muted-foreground">Radius (m)</TableHead>
						<TableHead className="text-muted-foreground">Status</TableHead>
						<TableHead className="text-muted-foreground">
							Registered At
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<AdminLoadingRow columns={7} />
					) : zones.length > 0 ? (
						zones.map((zone) => {
							const admin = zone.adminID ? userMap.get(zone.adminID) : null;
							return (
								<TableRow key={zone.id} className="group">
									<TableCell className="font-medium">
										{zone.name || "N/A"}
									</TableCell>
									<TableCell className="capitalize text-muted-foreground">
										{zone.type}
									</TableCell>
									<TableCell>
										{admin?.displayName || admin?.name || zone.adminID || "Unknown"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{admin?.email || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{zone.radius?.toLocaleString() || "N/A"}
									</TableCell>
									<TableCell>
										<AdminStatusBadge
											label={zone.isActive ? "Active" : "Inactive"}
											tone={getUserStatusTone(zone.isActive)}
										/>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{formatDate(zone.createdAt)}
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<AdminDataTableEmpty
							colSpan={7}
							message="No silent zones registered yet"
						/>
					)}
				</TableBody>
			</Table>
		</AdminTableShell>
	);
}

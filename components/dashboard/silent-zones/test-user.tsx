"use client";

import { useEffect, useState } from "react";
import {
	collection,
	query,
	onSnapshot,
	doc,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "react-toastify";

// User interface (adjust fields based on your needs)
interface User {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
	createdAt: string;
	role?: string;
}

// Function to fetch users
export const useFetchUsers = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const usersQuery = query(collection(db, "users"));

		const unsubscribe = onSnapshot(
			usersQuery,
			(snapshot) => {
				const usersData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as User[];

				setUsers(usersData);
				setLoading(false);
			},
			(err) => {
				console.error("Error fetching users:", err);
				setError(err.message);
				setLoading(false);
			},
		);

		// Cleanup subscription
		return () => unsubscribe();
	}, []);

	return { users, loading, error };
};

// Function to update user status
export const updateUserStatus = async (
	userId: string,
	currentStatus: boolean,
) => {
	try {
		const userRef = doc(db, "users", userId);
		await updateDoc(userRef, {
			isActive: !currentStatus, // Toggles the current status
			updatedAt: new Date().toISOString(), // Optional: track when status was updated
		});
		return { success: true, message: "User status updated successfully" };
	} catch (error) {
		console.error("Error updating user status:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to update status",
		};
	}
};

// Example usage in a component
export default function UsersTable() {
	const { users, loading, error } = useFetchUsers();

	const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
		const result = await updateUserStatus(userId, currentStatus);
		if (!result.success) {
			toast.error(result.message); // Handle error as needed
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td>{user.name}</td>
							<td>{user.email}</td>
							<td>{user.isActive ? "Active" : "Inactive"}</td>
							<td>
								<button
									onClick={() => handleToggleStatus(user.id, user.isActive)}
								>
									Toggle Status
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

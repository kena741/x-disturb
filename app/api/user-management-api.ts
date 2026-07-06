"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";

// User interface (adjust fields based on your needs)
export interface User {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  isActive: boolean;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  role?: string;
  referralCode?: string;
  uid?: string;
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
        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.name || data.displayName || "",
            displayName: data.displayName || data.name || "",
          };
        }) as User[];

        setUsers(usersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { users, loading, error };
};

// Function to update user status
export const updateUserStatus = async (
  userId: string,
  currentStatus: boolean
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

export const updateUserData = async (
  userId: string,
  data: {
    email: string;
    username: string;
    currentStatus: boolean;
    reason: string;
  }
) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      email: data.email,
      username: data.username,
      isActive: data.currentStatus,
      reason: data.reason,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user",
    };
  }
};


export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return { success: true };
  } catch (err) {
    console.error("Failed to delete user:", err);
    return { success: false, message: "Failed to delete user" };
  }
};
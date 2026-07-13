"use client";

import {
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	getDocs,
	getDoc,
	query,
	where,
	Timestamp,
	DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { User } from "./user-management-api";

export type ReferralCategory = "Orthodox" | "Protestant" | "Mosque" | "Library";

export interface ReferralCode {
	id: string;
	name: string;
	description: string;
	category: ReferralCategory;
	createdAt?: Timestamp;
}

const REFERRAL_CODES_COLLECTION = "referral_codes";

export const fetchReferralCodeById = async (
	id: string,
): Promise<ReferralCode | null> => {
	const ref = doc(db, "referral_codes", id);
	const snap = await getDoc(ref);
	if (snap.exists()) {
		const data = snap.data();
		return {
			id: snap.id,
			name: data.name,
			description: data.description,
			category: data.category,
			createdAt: data.createdAt,
		};
	}
	return null;
};

export const fetchReferralCodes = async (): Promise<ReferralCode[]> => {
	const snap = await getDocs(collection(db, REFERRAL_CODES_COLLECTION));
	return snap.docs.map((doc) => {
		const data = doc.data() as DocumentData;
		return {
			id: doc.id,
			name: data.name,
			description: data.description,
			category: data.category as ReferralCategory,
			createdAt: data.createdAt,
		};
	});
};

export const addReferralCode = async ({
	name,
	description,
	category,
}: Omit<ReferralCode, "id" | "createdAt">): Promise<{
	success: boolean;
	id: string;
}> => {
	const ref = await addDoc(collection(db, REFERRAL_CODES_COLLECTION), {
		name,
		description,
		category,
		createdAt: Timestamp.now(),
	});
	return { success: true, id: ref.id };
};

export const updateReferralCode = async (
	id: string,
	updates: Omit<ReferralCode, "id" | "createdAt">,
): Promise<{ success: boolean }> => {
	await updateDoc(doc(db, REFERRAL_CODES_COLLECTION, id), updates);
	return { success: true };
};

export const deleteReferralCode = async (
	id: string,
): Promise<{ success: boolean }> => {
	await deleteDoc(doc(db, REFERRAL_CODES_COLLECTION, id));
	return { success: true };
};

export const getUsersByReferralCode = async (
	referralId: string,
): Promise<User[]> => {
	const q = query(
		collection(db, "users"),
		where("referralCode", "==", referralId),
	);
	const snap = await getDocs(q);
	return snap.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			name: data.name,
			email: data.email,
			isActive: data.isActive,
			createdAt: data.createdAt,
			lastLogin: data.lastLogin,
			role: data.role,
			referralCode: data.referralCode,
		} as User;
	});
};

export const sendPushToGroup = async (
	referralId: string,
): Promise<{ success: boolean }> => {
	const users = await getUsersByReferralCode(referralId);
	console.log(`Simulating push to ${users.length} users`);
	return { success: true };
};

export const exportUsersByGroup = async (
	referralId: string,
): Promise<string> => {
	const users = await getUsersByReferralCode(referralId);
	const csvHeader = "Name,Email\n";
	const csvBody = users.map((user) => `${user.name},${user.email}`).join("\n");
	const csv = csvHeader + csvBody;
	console.log("Exported CSV:\n", csv);
	return csv;
};

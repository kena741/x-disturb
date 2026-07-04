"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";

export interface SubscriptionPlan {
  id: string;
  category: string;
  currency: string;
  durationLabel: string;
  durationMonths: number;
  isActive: boolean;
  price: number;
  sortOrder: number;
  createdAt?: Timestamp;
}

export type SubscriptionPlanInput = Omit<SubscriptionPlan, "id" | "createdAt">;

const COLLECTION = "subscription_plans";

// Real-time listener
export const subscribeToPlans = (
  callback: (plans: SubscriptionPlan[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTION), orderBy("sortOrder", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const plans = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SubscriptionPlan, "id">),
      }));
      callback(plans);
    },
    onError
  );
};

// One-time fetch
export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("sortOrder", "asc"))
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<SubscriptionPlan, "id">),
  }));
};

// Create
export const addSubscriptionPlan = async (
  data: SubscriptionPlanInput
): Promise<{ success: boolean; id: string }> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return { success: true, id: ref.id };
};

// Update
export const updateSubscriptionPlan = async (
  id: string,
  data: Partial<SubscriptionPlanInput>
): Promise<{ success: boolean }> => {
  await updateDoc(doc(db, COLLECTION, id), { ...data });
  return { success: true };
};

// Delete
export const deleteSubscriptionPlan = async (
  id: string
): Promise<{ success: boolean }> => {
  await deleteDoc(doc(db, COLLECTION, id));
  return { success: true };
};

// Toggle active
export const togglePlanActive = async (
  id: string,
  current: boolean
): Promise<{ success: boolean }> => {
  await updateDoc(doc(db, COLLECTION, id), { isActive: !current });
  return { success: true };
};

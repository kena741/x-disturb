"use client";

import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import axios from "axios";
import { session } from "@/lib/sessionStorage";

export interface Notification {
  id?: string;
  title: string;
  message: string;
  target: string;
  createdAt: Timestamp;
  status: "Sent";
}

const NOTIFICATIONS_COLLECTION = "notifications";
const NEXT_PUBLIC_NOTIFICATIONS_END_POINT = process.env.NEXT_PUBLIC_NOTIFICATIONS_END_POINT || "";
// Save a new notification
export const sendNotification = async ({
  title,
  message,
  target,
  targetType,
  scheduledAt,
  status,
}: {
  title: string;
  message: string;
  target: string;
  targetType: "all" | "category" | "referral";
  scheduledAt: Date | null;
  status: "Sent" | "Scheduled";
}) => {
  await addDoc(collection(db, "notifications"), {
    title,
    message,
    target,
    targetType,
    status,
    scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : null,
    createdAt: Timestamp.now(),
  });

  // await sendNotficationMobile({
  //   title,
  //   message,
  //   target,
  //   targetType,
  // });
};

export const sendNotficationMobile = async ({
  title,
  message,
  target,
  targetType,
}: {
  title: string;
  message: string;
  target: string;
  targetType: "all" | "category" | "referral";
}) => {

  const accessToken = session.getItem("accessToken");
  if (!accessToken) {
    throw new Error("User is not authenticated");
  }

  const payload = {
    "target": {
      "type": targetType,
      "value": target
    },
    "notification": {
      "title": title,
      "body": message
    }
  }

  try {
    const response = await axios.post(
      NEXT_PUBLIC_NOTIFICATIONS_END_POINT,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );


    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }


}


// Fetch history
export const fetchNotificationHistory = async (): Promise<Notification[]> => {
  const snap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      message: data.message,
      target: data.target,
      createdAt: data.createdAt,
      status: data.status,
    };
  });
};

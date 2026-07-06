import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/app/firebase/config";

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  plan_id: string;
  plan_label?: string;
  status: string;
  tx_ref: string;
  updated_at: Date;
  user_id: string;
  user_label?: string;
  created_at: Date;
}

function extractChapaUserLabel(
  chapaResponse: unknown
): string | undefined {
  if (!chapaResponse || typeof chapaResponse !== "object") return undefined;

  const data = (chapaResponse as { data?: Record<string, unknown> }).data;
  if (!data || typeof data !== "object") return undefined;

  const first =
    typeof data.first_name === "string" ? data.first_name.trim() : "";
  const last =
    typeof data.last_name === "string" ? data.last_name.trim() : "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (name) return name;

  const email = typeof data.email === "string" ? data.email.trim() : "";
  return email || undefined;
}

export const useTransaction = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "transactions"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const chapaUser = extractChapaUserLabel(d.chapa_response);
          const userLabel =
            chapaUser ||
            d.user_name ||
            d.userName ||
            d.displayName ||
            d.user_label ||
            "";
          const planLabel =
            d.plan_name ??
            d.planName ??
            d.plan_label ??
            d.planLabel ??
            d.plan_category ??
            "";
          return {
            id: doc.id,
            amount: d.amount ?? 0,
            currency: d.currency ?? "ETB",
            plan_id: String(d.plan_id ?? d.planId ?? ""),
            plan_label: planLabel ? String(planLabel) : undefined,
            status: d.status ?? "",
            tx_ref: d.tx_ref ?? "",
            updated_at: d.updated_at?.toDate() ?? new Date(),
            user_id: String(d.user_id ?? d.userId ?? d.userID ?? ""),
            user_label: userLabel ? String(userLabel) : undefined,
            created_at: d.created_at?.toDate() ?? new Date(),
          } as Transaction;
        });

        setTransactions(data.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { transactions, loading, error };
};

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/app/firebase/config";

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  plan_id: string;
  status: string;
  tx_ref: string;
  updated_at: Date;
  user_id: string;
  created_at: Date;
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
          return {
            id: doc.id,
            amount: d.amount ?? 0,
            currency: d.currency ?? "ETB",
            plan_id: d.plan_id ?? "",
            status: d.status ?? "",
            tx_ref: d.tx_ref ?? "",
            updated_at: d.updated_at?.toDate() ?? new Date(),
            user_id: d.user_id ?? "",
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

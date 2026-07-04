import { useEffect, useState } from "react";
import {
  SubscriptionPlan,
  subscribeToPlans,
} from "@/app/api/subscription-plans-api";

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToPlans(
      (data) => {
        setPlans(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { plans, loading, error };
};

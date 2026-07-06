import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import type { ZoneActivityRow } from "@/lib/zone-activity";

export const useZoneActivities = () => {
  const [activities, setActivities] = useState<ZoneActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "zone_activities"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        const date = new Date(d.timestamp?.seconds * 1000);
        return {
          id: doc.id,
          userID: d.userID,
          userName: d.userName,
          zoneID: d.zoneID,
          zoneName: d.zoneName,
          activity: d.activity,
          timestampMs: date.getTime(),
          timestamp: date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          coordinates: d.coordinates,
        };
      });
      setActivities(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { activities, loading };
};

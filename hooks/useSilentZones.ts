import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useEffect, useState } from "react";

export interface SilentZone {
	name: string;
	type: "church" | "mosque" | "library";
	radius: number;
	center: {
		latitude: number;
		longitude: number;
	};
	isActive: boolean;
	description: string;
	id: string;
}

export const useSilentZones = () => {
	const [silentZones, setSilentZones] = useState<SilentZone[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const silentZonesQuery = query(collection(db, "silent_zones"));
		const unsubscribe = onSnapshot(
			silentZonesQuery,
			(snapshot) => {
				const zonesData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as SilentZone[];
				setSilentZones(zonesData);
				setLoading(false);
			},
			(err) => {
				console.log({ err });
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	return { silentZones, loading };
};

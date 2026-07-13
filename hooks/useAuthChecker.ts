import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { session } from "@/lib/sessionStorage";

export function useAuthChecker(redirectPath: string = "/auth/login") {
	const [user, loading, error] = useAuthState(auth);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		const isSessionAuthenticated = session.getItem("isAuthenticated") === true;
		const isUserAuthenticated = !!user;

		const authenticated = isUserAuthenticated || isSessionAuthenticated;

		setIsAuthenticated(authenticated);

		if (!authenticated) {
			router.push(redirectPath);
		}
	}, [user, loading, router, redirectPath]);

	return {
		user,
		isAuthenticated,
		loading,
		error,
	};
}

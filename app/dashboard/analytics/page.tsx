import ZoneRegistrations from "@/components/dashboard/analytics/zone-registrations";
import { AdminPageContent } from "@/components/admin/admin-layout";

const page = () => {
	return (
		<AdminPageContent>
			<ZoneRegistrations />
		</AdminPageContent>
	);
};

export default page;

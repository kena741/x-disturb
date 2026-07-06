"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { session } from "@/lib/sessionStorage";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
// import TimeZoneField from "@/components/dashboard/profile/TimeZoneInput";

import Image from "next/image";
import { useAdminContext } from "@/components/context-provider";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import { AdminPageContent } from "@/components/admin/admin-layout";

// Define the Zod schema for form validation
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  bio: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  notifications: z.object({
    productInfo: z.boolean(),
    nonEssential: z.boolean(),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const timeZones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Athens", label: "Eastern European Time (EET)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Asia/Kolkata", label: "Indian Standard Time (IST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (NZST)" },
];

export default function ProfilePage() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { triggerRefetch } = useAdminContext();

  const id = session?.getItem("userId") || "admin_id";
  // let id = "raawbxCnmrYOT1kmU60WGnmUcv53";

  // Initialize React Hook Form with default values and Zod resolver
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "admin_profile", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            bio: data.bio || "",
            username: data.username || "",
            timezone: data.timezone || "",
            language: data.language || "English",
            notifications: {
              productInfo: data.notifications?.productInfo ?? true,
              nonEssential: data.notifications?.nonEssential ?? false,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
      setLoading(false);
    };

    fetchAdminProfile();
  }, [id, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitting(true);

    try {
      const docRef = doc(db, "admin_profile", id);
      await updateDoc(docRef, data);

      triggerRefetch();

      console.log("Admin profile updated successfully!");
    } catch (err) {
      console.error("Error updating admin profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminPageContent wide>
      {loading ? <ProfileSkeleton /> : ""}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
            {/* Basic Info */}
            <section>
              <h2 className="text-lg font-medium mb-4">Basic Info</h2>
              <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                <div className="aspect-square max-w-[200px] rounded-md flex items-center justify-center text-white text-4xl">
                  {/* B */}
                  <Image
                    src="/placeholder.png"
                    alt="B"
                    width={180}
                    height={180}
                  />
                </div>
                <div className="space-y-8">
                  <section className="space-y-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Write a few things about yourself"
                              className="bg-gray-50 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>
                  <section className="space-y-4">
                    <h2 className="text-lg font-medium mb-4">
                      Sign in credentials
                    </h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        disabled={true}
                        variant="outline"
                        className="text-[#e76f51] border-[#e76f51] hover:bg-[#e76f51]/10"
                      >
                        Change password
                      </Button>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h2 className="text-lg font-medium mb-4">
                      Location and language
                    </h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-gray-50">
                                  <SelectValue placeholder="Select Time Zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white">
                                {timeZones.map((timeZone) => (
                                  <SelectItem
                                    key={timeZone.value}
                                    value={timeZone.value}
                                  >
                                    {timeZone.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* <TimeZoneField
                                value={field.value}
                                onSelect={(val: string) =>
                                  form.setValue("timezone", val)
                                }
                              /> */}
                            {/* <div className="relative">
                                <Input
                                  {...field}
                                  className="bg-gray-50 pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              </div> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-gray-50">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white">
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                  {/* Email and notification settings */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-medium mb-4">
                      Email and notification settings
                    </h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="notifications.productInfo"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1 border border-slate-400 data-[state=checked]:bg-[#e76f51] data-[state=checked]:border-[#e76f51] text-white"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                I agree to receive product information, feedback
                                requests and announcements of new features and
                                products from Epignosis.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notifications.nonEssential"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1 border border-slate-400 data-[state=checked]:bg-[#e76f51] data-[state=checked]:border-[#e76f51] text-white"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                Exclude from all non-essential emails and
                                notifications
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </div>
              </div>
            </section>
            {/* Action buttons */}

            <div className="flex space-x-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {submitting ? "Saving changes" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
    </AdminPageContent>
  );
}

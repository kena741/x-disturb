"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { updateUserData } from "@/app/api/user-management-api";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { AdminPageContent } from "@/components/admin/admin-layout";

const UserDetailPage = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const params = useParams();
  const userId = params.id as string;

  const formSchema = z.object({
    email: z.string().email(),
    username: z.string().min(4, { message: "Username must be at least 4 characters" }),
    reason: z.string(),
    currentStatus: z.boolean(),
    role: z.enum(["admin", "user"]),
    referralCode: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUpdating(true);
    await updateUserData(userId, {
      email: values.email,
      username: values.username,
      currentStatus: values.currentStatus,
      reason: values.reason,
    });
    setIsUpdating(false);
  }

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            email: data.email || "",
            username: data.username || "",
            currentStatus: data.isActive,
            role: data.role || "user",
            referralCode: data.referralCode || "",
            reason: "",
          });
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };

    fetchAdminProfile();
  }, [userId, form]);

  return (
    <AdminPageContent wide>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Image src="/profile.png" alt="Profile" width={180} height={180} />

          <FormField
            control={form.control}
            name="currentStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Is Active</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
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
                  <Input placeholder="email" {...field} className="lg:w-1/2" />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} className="lg:w-1/2" />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Input placeholder="enter reason" {...field} className="lg:w-1/2" />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="admin or user" {...field} className="lg:w-1/2" />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Orthodox Tewahedo" {...field} className="lg:w-1/2" />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => form.reset()} variant="outline" type="button">
              Cancel
            </Button>
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? "Updating…" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </AdminPageContent>
  );
};

export default UserDetailPage;

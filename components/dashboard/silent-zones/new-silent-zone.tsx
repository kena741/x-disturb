"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { db } from "@/app/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { session } from "@/lib/sessionStorage";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HereMap from "./HereMap";
import AddressField from "./AddressSuggestion";

const CenterSchema = z.object({
  latitude: z.string(),
  longitude: z.string(),
});

const formSchema = z.object({
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  adminID: z.string().min(1, {
    message: "Admin ID is required.",
  }),
  center: CenterSchema,
  description: z.string().optional(),
  isActive: z.boolean(),
  name: z.string().min(2, {
    message: "Zone name must be at least 2 characters.",
  }),
  radius: z.number().min(1).max(500),
  type: z.enum(["Orthodox Tewahedo", "Protestant", "Mosque", "Library"]),
});

export default function CreateSilentZone() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      adminID: session?.getItem("userId") || "admin_user",
      center: {
        latitude: "0",
        longitude: "0",
      },
      description: "",
      isActive: true,
      name: "",
      radius: 100,
      type: "Orthodox Tewahedo",
    },
  });

  const radius = form.watch("radius");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ values });
    setIsAdding(true);
    try {
      const docRef = await addDoc(collection(db, "silent_zones"), {
        ...values,
        center: {
          latitude: Number(values.center.latitude),
          longitude: Number(values.center.longitude),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Document written with ID:", docRef.id);
      router.push("/dashboard/silent-zones");
    } catch (error) {
      console.error("Error adding document to silent_zones:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to create silent zone. Please try again.",
      });
    }
    setIsAdding(false);
  }

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Zone Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter zone name"
                    {...field}
                    className="md:w-1/2"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter zone description"
                    {...field}
                    className="md:w-1/2"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:w-1/2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <AddressField
                    value={field.value}
                    onSelect={(val: string) => form.setValue("address", val)}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Type</FormLabel>
                <FormControl className="md:w-1/2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="md:w-1/2">
                      <SelectValue placeholder="Select Location Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Orthodox Tewahedo">
                        Orthodox Tewahedo
                      </SelectItem>
                      <SelectItem value="Protestant">Protestant</SelectItem>
                      <SelectItem value="Mosque">Mosque</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          {/* isActive */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Is Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value} // Bind the checked state to the form value
                    onCheckedChange={field.onChange} // Update the form value on change
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          {/* Map Component */}

          <HereMap
            radius={radius}
            onCoordinatesChange={(coords) => {
              form.setValue("center.latitude", coords.lat);
              form.setValue("center.longitude", coords.lng);
            }}
            onAddressChange={(address) => {
              form.setValue("address", address);
            }}
          />

          {/* Zone Radius */}
          <FormField
            control={form.control}
            name="radius"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="w-full">
                    <div className="lg:hidden w-full space-y-2">
                      <Slider
                        min={1}
                        max={500}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="lg:w-1/2"
                      />
                      <div className="flex justify-between">
                        <FormLabel className="text-nowrap">
                          Zone Radius (Meters)
                        </FormLabel>
                        <span className="text-sm">{field.value}</span>
                      </div>
                    </div>

                    <div className="w-full justify-between space-x-2 items-center hidden lg:flex">
                      <FormLabel className="text-nowrap">
                        Zone Radius (Meters)
                      </FormLabel>
                      <Slider
                        min={1}
                        max={500}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="lg:w-1/2"
                      />
                      <span className="text-sm">{field.value}</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => router.push("/dashboard/silent-zones")}
              variant="outline"
              type="button"
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={isAdding}
              type="submit"
            >
              {isAdding ? "Creating Zone" : "Create Zone"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useProfile } from "@/lib/hooks/useProfile";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsForm() {
  const {
    profile,
    isLoading: isLoadingProfile,
    updateProfile,
    isUpdating,
  } = useProfile();
  const { theme, setTheme } = useTheme();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      image: profile?.image || "",
    },
    values: {
      name: profile?.name || "",
      image: profile?.image || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile(data);
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-8">
            <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Profile Image Section */}
            <div className="space-y-4">
              <FormLabel>Profile Image</FormLabel>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={form.watch("image")} />
                  <AvatarFallback>
                    {form.watch("name")?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {/* <Button variant="outline" disabled={isUpdating}>
                  Change Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Here you would typically upload the image to a storage service
                        // For now, we'll just create an object URL
                        const imageUrl = URL.createObjectURL(file);
                        form.setValue("image", imageUrl);
                      }
                    }}
                  />
                </Button> */}
              </div>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field (Read-only) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  placeholder="Your email"
                />
              </FormControl>
              <FormDescription>Email cannot be changed.</FormDescription>
            </FormItem>

            {/* Dark Mode Toggle */}
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Dark Mode</FormLabel>
                <FormDescription>
                  Enable dark mode for a better viewing experience.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                  }}
                />
              </FormControl>
            </FormItem>
          </div>
        </Card>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save changes
        </Button>
      </form>
    </Form>
  );
}

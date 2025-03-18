"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FaGithub, FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";

// Form schema validation
const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

type FormData = z.infer<typeof formSchema>;

type SocialProvider = "github" | "google";

export default function LoginCard() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    form: false,
    github: false,
    google: false,
  });
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Initialize react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setError("");
      setIsLoading((prev) => ({ ...prev, [provider]: true }));

      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
        errorCallbackURL: "/login?error=auth-failed",
        newUserCallbackURL: "/dashboard",
      });
    } catch (err) {
      setError(`Failed to login with ${provider}. Please try again.`);
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading((prev) => ({ ...prev, form: true }));
    setError("");

    try {
      const { error: signupError } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
        name: data.email.split("@")[0], // Pass email username as name
      });

      if (signupError) {
        setError(signupError.message || "Failed to create account");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, form: false }));
    }
  };

  return (
    <Card className="h-full w-full flex flex-col border-none shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold pb-2">Get Started</CardTitle>
        <CardDescription className="text-base">
          Enter your email to create your account
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 md:w-3/4 lg:w-1/2 ">
        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            className="w-full p-6 text-base rounded-full"
            variant="outline"
            onClick={() => handleSocialLogin("github")}
            disabled={isLoading.github || isLoading.form}
            aria-label="Sign in with GitHub"
          >
            {isLoading.github ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="mr-3 h-5 w-5" />
            )}
            Sign in with Github
          </Button>

          <Button
            type="button"
            className="w-full rounded-full p-6 text-base"
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading.google || isLoading.form}
            aria-label="Sign in with Google"
          >
            {isLoading.google ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FaGoogle className="mr-3 h-5 w-5" />
            )}
            Sign in with Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="p-4 rounded-lg"
                      type="email"
                      placeholder="m@example.com"
                      aria-describedby="email-description"
                      disabled={isLoading.form}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="p-4 rounded-lg"
                      type="password"
                      placeholder="••••••••"
                      aria-describedby="password-description"
                      disabled={isLoading.form}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div
                className="text-red-500 text-sm p-2 bg-red-50 rounded-md border border-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              className="w-full rounded-full p-6 text-base mt-4"
              type="submit"
              disabled={isLoading.form}
            >
              {isLoading.form ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

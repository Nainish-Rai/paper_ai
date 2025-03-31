"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Image from "next/image";
import { AnimatedClock } from "../ui/animated-clock";
import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeCard({ session }: { session: any }) {
  // Extract user's name or use "there" as a fallback
  const userName = session?.user?.name || "there";

  // Determine greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  // Format current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={"https://illustrations.popsy.co/white/digital-nomad.svg"}
            alt="avatar"
            width={128}
            height={128}
          />
          <div>
            <h1 className="text-4xl font-serif  font-medium tracking-tight text-foreground/90">
              {greeting}, {userName}
            </h1>
            <p className="text-muted-foreground mt-2 ml-1 text-base">
              Welcome back to your workspace
            </p>
          </div>
        </div>
        <AnimatedClock />
        {/* <Card className="flex items-center gap-3 p-3 border border-muted hover:border-primary/20 transition-all duration-200">
          <Clock className="h-8 w-8 text-primary/80" />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-foreground">
              {new Date().getHours()} :{" "}
              {new Date().getMinutes().toString().padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground">
              at{" "}
              {new Date()
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase()}
            </p>
          </div>
        </Card> */}
      </div>
    </div>
  );
}

// Add skeleton version of the welcome card
export function WelcomeCardSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-md" /> {/* Image skeleton */}
          <div>
            <Skeleton className="h-10 w-64 mb-2" /> {/* Title skeleton */}
            <Skeleton className="h-5 w-48" /> {/* Subtitle skeleton */}
          </div>
        </div>
        <Skeleton className="h-16 w-16 rounded-full" /> {/* Clock skeleton */}
      </div>
    </div>
  );
}

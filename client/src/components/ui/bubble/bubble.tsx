"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { bubbleVariants } from "./variants";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

import { format } from "date-fns";
import { env } from "@/env";

export interface BubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bubbleVariants> {
  createdAt: Date;
  sender?: string;
}

function Bubble({
  className,
  variant,
  sender,
  createdAt,
  ...props
}: BubbleProps) {
  const [profile, setProfile] = React.useState<{
    image: string;
    username: string;
  } | null>(null);

  React.useEffect(() => {
    async function fetchProfile() {
      if (!sender) return;
      try {
        const res = await fetch(`${env.VITE_API_URL}/profiles/${sender}`);
        if (!res.ok) throw Error;
        const data = await res.json();
        setProfile(data);
      } catch {
        console.error("Failed to fetch profile");
      }
    }

    fetchProfile();
  }, [sender]);

  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        variant === "received" && "justify-start",
        variant === "sent" && "justify-end",
      )}
    >
      {profile && (
        <Avatar>
          <AvatarImage src={profile.image} alt={profile.username} />
          <AvatarFallback>{profile.username.slice(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      {variant === "sent" && (
        <span className="text-muted-foreground hidden text-xs group-hover:inline">
          {format(createdAt, "HH:mm")}
        </span>
      )}
      <div className={cn(bubbleVariants({ variant }), className)} {...props} />
      {variant === "received" && (
        <span className="text-muted-foreground hidden text-xs group-hover:inline">
          {format(createdAt, "HH:mm")}
        </span>
      )}
    </div>
  );
}

export { Bubble };
